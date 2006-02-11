<?php

/*

TODO:

Add polymorphism to function_parse
Parse variables that point to objects for its keys (We can check variable type too)

*/ 

// Variables
$var = array();
$var['variable'] = '[a-zA-Z_$][\w$]*'; // This is the acceptable variable pattern
$var['bad_dirs'] = array('.', '..', '.svn', '.DS_Store');

// Regexs
$regex = array();
$regex['functions'] = array(
  '^\s*(' . $var['variable'] . '(?:\.(?!onload|onunload)' . $var['variable'] . ')+)\s*=(?:\s+(new))?\s+function.*',
  '^\s*function\s+(' . $var['variable'] . ')\s*\([^)]*\).*',
  '^\s*dojo.lang.extend\([^,]+,.*',
  '^\s*(dojo(?:\.' . $var['variable'] . ')*)\s*=\s*\{',
  '^\s*(' . $var['variable'] . '(?:\.' . $var['variable'] . ')*)\s*:\s*function'
);

// Mark the "last" things
$last = array();

header("Content-type: text/plain");
$contents = array();

$time = time();
dir_plunge();

if(isset($_GET['inheritance'])){
  widget_inheritance($contents);
}
elseif(isset($_GET['file'])) {
  if(isset($_GET['signatures'])){
    foreach($contents[$_GET['file']] as $function){
      print implode("\n", array_diff(array_keys($function), array('inherits', 'variables'))) . "\n";
    }
  }
  else {
    print_r($contents[$_GET['file']]);
  }
}
else{
	require_once('lib/JSON.php');
  $json = new Services_JSON();
  $function_names = array();

	foreach($contents as $file_name => $content){
		if(isset($_GET['signatures'])){
			print '*' . $file_name . "\n";
		}
    foreach($content as $function_name => $function){
	 		if(is_array($function)){
				if(isset($_GET['signatures'])){
 	      	print implode("\n", array_diff(array_keys($function), array('inherits', 'variables'))) . "\n";					
				}
				else{
					$empty_test = array_diff(array_keys($function), array('inherits', 'variables'));
					if(!empty($empty_test)){
						$function_names[] = $function_name;// . ' (' . $file_name . ')';
					}
				}
			}
		}
	}
	file_put_contents('json/function_names.json', $json->encode($function_names));
}

$time = time() - $time . " seconds to process";
print $time;

function dir_plunge($path = array(), $file = 'initialize') {
  global $var;
  
  if($file == 'initialize'){
    $path['src'] = array();
    $real_path = 'src';
    $dojo_dir = opendir('../src');
  }
  else {
    $path[$file] = array();
    $real_path = implode('/', array_keys($path));
    if(!is_dir('../' . $real_path)) {
      return;
    }
    $dojo_dir = opendir('../' . $real_path);
  }

  while(($file = readdir($dojo_dir)) !== false) {
    $absolute_path = $real_path;
    if(empty($absolute_path)) {
      $absolute_path = $file;
    }
    else {
      $absolute_path .= '/' . $file;
    }

    if(strlen($file) > 3 && strrpos($file, '.js') == strlen($file) - 3){
      if(isset($_GET['file'])){
        if($absolute_path == $_GET['file']){
          file_parse($absolute_path);
        }
      }
      else {
        file_parse($absolute_path);
      }
    }
    elseif(!in_array($file, $var['bad_dirs'])){
      dir_plunge($path, $file);
    }
  }
}

function equality_parse($matches){
	global $contents, $last;
	$contents[$last['file']][$matches[1]]['is'] = $matches[2];
	return $matches[2];
}

/*
 * Several things are at work here... Once we find a valid function,
 * we're going to start looking for its parameters.
 * We're going to need to get the function name to keep track of it.
 * Then we're going to need to find the type hinting of its parameters.
 */
function file_parse($file){
  // Most importantly, we need to match function blocks
  $actual_lines = $lines = explode("\n", file_get_contents('../' . $file));

	global $regex, $contents, $var, $last;

	$started = array('multiline' => false);
	$last['file'] = $file;
  foreach($actual_lines as $key => $line){
		if(!$started['multiline'] && ($pos = strpos($line, '//')) !== false){
			$line = $actual_lines[$key] = substr($line, 0, $pos);
		}else{
			if(($pos = strpos($line, '/*')) !== false){
				$started['multiline'] = true;
				$line = $actual_lines[$key] = substr($line, 0, $pos);
			}
			if(($pos = strpos($line, '*/')) !== false){
				$started['multiline'] = false;
				$line = $actual_lines[$key] = substr($line, $pos+2);
			}elseif($started['multiline']){
				unset($actual_lines[$key]);
			}
		}
		if($actual_lines[$key]){
  		$actual_lines[$key] = preg_replace_callback('%(dojo(?:\.' . $var['variable'] . ')+)\s*=\s*(dojo(?:\.' . $var['variable'] . ')+)(?=;|\s*=)%U', "equality_parse", $line);
		}
	}

  $matches = preg_grep('%(?:' . implode('|', $regex['functions']) . ')%m', $actual_lines); 

  // Handle "anonymous" objects
  $extends = '';
  foreach($matches as $key => $match){
    if(preg_match('%dojo.lang.extend\(([^,]+),%', $match, $ex_matches)){
      $extends = $ex_matches[1];
      unset($matches[$key]);
    }
		elseif(preg_match('%^\s*(' . $var['variable'] . '(?:\.' . $var['variable'] . ')*)\s*=\s*\{%', $match, $ex_matches)){
			$extends = $ex_matches[1];
			unset($matches[$key]);
		}
    else {
      $matches[$key] = preg_replace('%^(\s*)(' . $var['variable'] . ')(\s*:\s*function)%', '$1' . $extends . '.$2' . '$3', $match);
    }
  }
  $function_lines = array();

  // We're starting at each line that we found a match
  if($matches){
    foreach($matches as $line_number => $match){   
      $started = array('parameters' => false, 'parameter' => false, 'extend' => false, 'comment' => false, 'global_comment' => false, 'function' => false, 'this_function' => false, 'this_function_container' => false, 'return' => false);

      if(preg_match('%^\s*this\.(' . $var['variable'] . ')\s*=\s*function\s*\(%', $match, $this_matches)){
        // Obviously, this is how we handle this.foo functions
        $started['this_function_container'] = true;
        $function_name = $parent_function_name . '.' . $this_matches[1];
      }
      else {
				if(in_array($line_number, $function_lines)){
					// Skip matches inside of already found blocks
					continue;
				}
        // Set the function name
        foreach($regex['functions'] as $function){
          if(preg_match('%' . $function . '%', $match, $matches)) {
            $function_name = str_replace('.prototype.', '.', $matches[1]);
            $parent_function_name = $function_name;
            break;
          }
        }
      }
      
      if(!empty($contents[$file][$function_name])){
        // If this is being set twice, it's because we've matched a foo: function
        // that is not within a declaring function (ie extends).
        // As such, it tries to use the last function_name
        continue;
      }

      // Reset the variables as we explore each new block.
      $balance = array('parameters' => 0, 'function' => 0, 'this_function' => 0, 'comment' => 0);
      $content = array('function' => array(), 'function_content' => array(), 'parameters' => array(), 'comments' => array(), 'returns' => array(), 'parameter' => '', 'comment' => '', 'return' => '');
      for($i = $line_number; ($line = $lines[$i]) !== null; $i++) {
        $function_lines[] = $i;
        $line = str_replace("\t", "    ", $line); // For some reason, tabs sometimes force line breaks?
        
        // Only run balancing on non-comment blocks.        
        $line_without_comments = '';
        if($started['global_comment'] && ($pos = strpos($line, '*/')) !== false){
          $started['global_comment'] = false;
          $line_without_comments = substr($temp_line, $pos+2);
        }
        if(!$started['global_comment']){
          if(empty($line_without_comments)){
            $line_without_comments = $line;
          }
          $temp_line = preg_replace('%/\*.*\*/%U', '', $line_without_comments);
          $line_without_comments = $temp_line;
          if(($pos = strpos($temp_line, '//')) !== false){
            $line_without_comments = substr($temp_line, 0, $pos);
          }
          if(($pos = strpos($temp_line, '/*')) !== false){
            $line_without_comments = substr($temp_line, 0, $pos);
            $started['global_comment'] = true;
          }
        }
        
        // Matches: {, }, (
        preg_match_all('%(?<![/])[{}(]%', $line_without_comments, $blocks);
        $types = array_count_values($blocks[0]);
        
        // Handle this. functions
        if($started['this_function']){
          $balance['this_function'] += $types['{'] - $types['}'];
          if(!$balance['this_function']){
            $started['this_function'] = false;
          }
          continue;
        }
        
        if(!$started['this_function_container'] && preg_match('%^\s*this\..*=\s*function\(%', $line, $this_matches)){
          $started['this_function'] = true;
          $balance['this_function'] += $types['{'] - $types['}'];
          continue;
        }
        
        // Deal with the parameters/comments (they're one and the same)
        if(!$started['function'] && $started['parameters'] !== 0){
          $pos = 0;
          if(!$started['parameters'] && $types['(']){
            $started['parameters'] = true;
            $pos = strpos($line, '(') + 1; // No point starting earlier than we have to
          }
          if($started['parameters']) {
            for($j = $pos; $j < strlen($line); $j++){
            
              if($started['comment']){
                // Capture everything until it ends
                if($line{$j} == '*' && $line{$j+1} == '/'){
                  ++$j;
                  $started['comment'] = false;
                }else {
                  if($j == 0){
                    preg_match('%[\w()\'"]%', $line, $first_word);
                    $content['comment'] .= ' ';
                    $j = strpos($line, $first_word[0]);
                  }
                  $content['comment'] .= $line{$j};
                }
              }elseif($started['parameter']){
                // Capture unless non-word
                if(!preg_match('[\w$]', $line{$j})){
                  if(preg_match('%[\w$]%', $line, $word, null, $j+1)){
                    $word = strpos($line, $word[0], $j+1);
                  }else{
                    $word = 0;
                  }

                  if($word && strpos($line, '//', $j) !== false && strpos($line, '//', $j) < $word){
                    $content['parameters'][] = $content['parameter'];
                    $content['comments'][$content['parameter']] = substr($line, $word);
                    $content['parameter'] = '';
                    $j = strlen($line);
                  }
                  $started['parameter'] = false;
                }else{
                  $content['parameter'] .= $line{$j};
                }
              }
            
              if(!$started['comment']){
                if($line{$j} == ')' || $line{$j} == ','){
                  if(!empty($content['parameter'])){
                    $content['parameters'][] = $content['parameter'];
                    $content['comments'][$content['parameter']] = trim($content['comment']);
                    $content['parameter'] = '';
                    $content['comment'] = '';
                  }
                  if($line{$j} == ')'){
                    $started['parameters'] = 0;
                    break;
                  }
                }
                elseif($line{$j} == '/' && $line{$j+1} == '/'){
                  $content['comments'][$content['parameter']] = trim(substr($line, $j+2));
                  $content['parameter'] = '';
                  $j = strlen($line);
                }
                elseif($line{$j} == '/' && $line{$j+1} == '*'){
                  ++$j;
                  $started['comment'] = true;
                }
                elseif(!$started['parameter'] && preg_match('[\w$]', $line{$j})){
                  $started['parameter'] = true;
                  $content['parameter'] = $line{$j};
                }
              }
            }
          }
        }
        
        // Deal with the function
        if(!$started['parameters']){
          $balance['function'] += $types['{'] - $types['}'];
        }
        if($started['function'] && $started['parameters'] === 0 && $balance['function']){
          $content['function_content'][] = $line;
        }
        $content['function'][] = $line;
        if($types['{']) {
          $started['function'] = true;
        }
        if($started['function'] && !$balance['function']){
          // This means that we don't have to immediately find an opening bracket
          unset($content['comment']);
          unset($content['parameter']);          
          unset($content['return']);
          if($started['this_function_container']){
            $content['this'] = true;
          }
          function_parse($content);
          $contents[$file][$function_name][function_signature($content, $function_name)] = $content;
          $content['function'] = array();
          $started['function'] = false;
          break;
        }
      }
    }
  }

  // Now we'll look through everything that the parser DIDN'T parse (faster)
  foreach($function_lines as $line_number){
    unset($actual_lines[$line_number]);
  }
  
  foreach($actual_lines as $line){
    if(preg_match('%dojo.inherits\(\s*([^,\s]+)\s*,\s*(.*)\s*\)%', $line, $match)){
      $contents[$file][$match[1]]['inherits'][] = $match[2];
    }
  }

  if(preg_grep('%^\s*dj_deprecated\(%', $lines)){
		if(is_array($contents[$file])){
	  	foreach($contents[$file] as $function_name => $content){
				$contents[$file][$function_name]['deprecated'] = true;
			}
		}
  }

  foreach($actual_lines as $line){
    if(preg_match('%^\s*(' . $var['variable'] . '(?:\.' . $var['variable'] . ')*)\.(' . $var['variable'] . ')\s+=%', $line, $var_matches)){
      $contents[$file][$var_matches[1]]['variables'][] = $var_matches[2];
    }
  }
}

function function_parse(&$contents){
  global $var;
  $started = array('block' => true, 'multiline' => false, 'return' => false);
  $content = array('key' => '');
  $balance = array('line_breaks' => 0);
  $lines = $contents['function_content'];
  foreach($lines as $key => $line){
    $line = trim($line);
    if(empty($line)){
      ++$content['line_breaks'];
      continue;
    }
    if(substr($line, 0, 2) == '/*'){
      $started['multiline'] = true;
    }
    if($started['multiline'] && strpos($line, '*/') !== false){
      $started['multiline'] = false;
      unset($contents['function_content'][$key]);
    }

    if(!$started['multiline'] && substr($line, 0, 2) != '//'){
      $started['block'] = false;
    }
    
    if($started['block']){
      unset($contents['function_content'][$key]);
    }
    
    // These inherit only by things set in the calling function by using this.foo syntax
    if(preg_match('%^\s*(' . $var['variable'] . '(?:\.' . $var['variable'] . ')+)\.call\(this\)%', $line, $this_matches)){
      $contents['this_inherits'][] = $this_matches[1];
    }
    
    // Find the variables set by this.foo
    // We don't need to worry about finding functions here. They've been handled.
    if(preg_match('%\s*this\.(' . $var['variable'] . ')\s*=(?!=)%', $line, $this_matches)){
      $contents['this_variables'][] = $this_matches[1];
    }
    
    // Deal with the comment block
    if($started['block']){
      preg_match('%[\w()\'"]%', $line, $first_word);
      $line = substr($line, strpos($line, $first_word[0]));
      preg_match('%^[\w]+\b%', $line, $first_word);
      if(in_array($first_word[0], array_merge(array('summary'), $contents['parameters']))) {
        $content['key'] = $first_word[0];
        $line = preg_replace('%^' . $first_word[0] . '%', '', $line);
        preg_match('%[\w()\'"]%', $line, $first_word);
        $line = substr($line, strpos($line, $first_word[0]));
      }
      if(!empty($content['key'])) {
        if(empty($contents['comments'][$content['key']])){
          $contents['comments'][$content['key']] = $line;
        }
        else {
          if($content['line_breaks']){
            $contents['comments'][$content['key']] .= '<br />';
            $content['line_breaks'] = 0;
          }
          if(substr($contents['comments'][$content['key']], -6) != '<br />'){
            $contents['comments'][$content['key']] .= ' ';
          }
          $contents['comments'][$content['key']] .= $line;
        }
      }
    }
    
    // Deal with the returns
    if(preg_match('%[{;]?\s*return(.*)%', $line, $match)){
      $line = $match[1];
      if(($pos = strpos($line, '/*')) !== false){
        $content['return'] = trim(substr($line, $pos+2));
        $started['return'] = true;
      }elseif(($pos = strpos($line, '//')) !== false){
        $contents['returns'][] = trim(substr($line, $pos+2));
      }else {
        $contents['returns'][] = '';
      }
    }
    if($started['return']){
      if(($pos = strpos($line, '*/')) !== false){
        if(!empty($match[1])) {
          $content['return'] = trim(substr($content['return'], 0, strpos($content['return'], '*/')));
        }
        else {
          $content['return'] .= ' ' . trim(substr($line, 0, $pos));
        }
        $contents['returns'][] = $content['return'];
        $content['return'] = '';
        $started['return'] = false;
      }elseif(empty($match[1])){
        $content['return'] .= ' ' . trim($line);
      }
    }
  }

  if(!empty($contents['this_variables'])){
    $contents['this_variables'] = array_unique($contents['this_variables']);
  }
}

function printr_fun($function_names){
  global $inheritance;
  
  foreach($function_names as $function_name){
    if($function_name == 'superclass'){
      continue;
    }
    if(!empty($inheritance[$function_name])){
      $output[$function_name] = printr_fun($inheritance[$function_name]);
    }
    else {
      $output[] = $function_name;
    }
  }
  return $output;
}

function widget_inheritance($contents){
  $inheritance = array();
  global $inheritance;
  foreach($contents as $content){
    foreach($content as $function_name => $function_signatures){
      if(!empty($function_signatures['inherits'])){
        foreach($function_signatures['inherits'] as $inherits) {
          $inheritance[$inherits][] = $function_name;
          $function_names[] = $function_name;
        }
      }
      foreach($function_signatures as $function_values){
        if(!empty($function_values['this_inherits'])){
          foreach($function_values['this_inherits'] as $inherits) {
            if(empty($inheritance[$inherits]) || !in_array($function_name, $inheritance[$inherits])){
              $inheritance[$inherits][] = $function_name . '*';
              $function_names[] = $function_name;
            }
          }
        }
      }
    }
  }

  print "* = Inherited from constructor\n\n";
  $output = printr_fun($inheritance['dojo.widget.Widget']);
  print_r(array('dojo.widget.Widget' => $output));  
}
	
function function_signature($content, $function_name){
  $return_type = array_diff(array_unique($content['returns']), array(''));
  if(empty($return_type)){
    $output = 'undefined ';
  }
  elseif(count($return_type) == 1){
    $output = array_pop($return_type) . ' ';
  }
  else{
    $output = 'mixed ';
  }

  $output .= $function_name . '(';

  $started = false;
  foreach($content['parameters'] as $parameter){
    if($started){
      $output .= ', ';
    }
    if(!empty($content['comments'][$parameter])){
      $output .= $content['comments'][$parameter] . ' ';
    }
    $output .= $parameter;
    $started = true;
  }

  $output .= ')';

  return $output;
}
	


?>