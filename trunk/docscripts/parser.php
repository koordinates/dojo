<?php

/*

TODO:

Handle polymorphic IDs
Parse variables that point to objects for its keys
Handle "extends" variables
Handle extraArgs in widget objects (so far, it doesn't appear to be used)
Parameter ending in ? now means optional

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

if(isset($_GET['contents'])){
	print_r($contents);
}

if(isset($_GET['inheritance'])){
  widget_inheritance($contents);
}
elseif(isset($_GET['file'])) {
	$package = file_to_package($_GET['file']);

  if(isset($_GET['signatures'])){
    foreach($contents[$package] as $function){
      print implode("\n", array_diff(array_keys($function), array('inherits', 'variables'))) . "\n";
    }
  }
  else {
    print_r($contents[$package]);
  }
}
else{
	// Make sure to leave out files (particularly dojo.package.* files) where everything is deprecated.

	require_once('lib/JSON.php');
  $json = new Services_JSON();

	// These are the things that will be saved as JSON objects
  $output = array();
	
	deltree('json');

	$last = array('package' => '');
	foreach($contents as $package => $content){
		if(isset($_GET['signatures'])){
			print '*' . $package . "\n";
		}
    foreach($content as $function_name => $function){
			$real_function_name = $function_name;
			$function_name = preg_replace('%^' . str_replace('.', '\.', $package) . '%', '_', $function_name);
			$package_root = str_replace('.*', '', $package) . '.';
			if($function_name == 'requires'){
				$output[$package]['meta']['requires'] = $function;
			}elseif($function['is']){
				$output[$package]['meta'][$function_name]['is'] = $function['is'];
			}else{
				foreach($function as $function_signature => $function_content){
				
//					$function_signature = preg_replace('%(?<= )' . str_replace('.', '\.', $package) .'(?=[^ ]*\()%U', '_', $function_signature);
					$polymorphic_id = 'default';
					if($function_content['comments']['id']){
						$polymorphic_id = $function_content['comments']['id'];
					}
					
					if($function['variables']){
						foreach($function['variables'] as $value){
							if($value{0} != '_'){
								if($polymorphic_id != 'default'){
									$output[$package][$function_name]['meta'][$polymorphic_id]['variables'][] = $value;
								}else{
									$output[$package][$function_name]['meta']['variables'][] = $value;
								}
							}
						}
					}
					if($function_content['this_variables']){
						foreach($function_content['this_variables'] as $value){
							if($value{0} != '_'){
								// Assume that this.stuff takes place in the parent.
								$tmp_function_name = explode('.', $function_name);
								if(count($tmp_function_name) > 3){
									// Find the first capitalized block
									for($i = count($tmp_function_name)-1; $i > -1; $i--){
										if(preg_match('%[A-Z]%', substr($tmp_function_name[$i], 0, 1))){
											$tmp_function_name = array_slice($tmp_function_name, 0, $i+1);
											break;
										}
									}
									// If nothing is found, assume that this.stuff takes place in the package class
									if($i == -1){
										$tmp_function_name = array_slice($tmp_function_name, 0, 3);
									}
									$tmp_function_name = implode('.', $tmp_function_name);
									if($content[$tmp_function_name]){
										foreach($content[$tmp_function_name] as $tmp_function_content){
											if($polymorphic_id != 'default'){
												$output[$package][$tmp_function_name]['meta'][$polymorphic_id]['this_variables'][] = $value;
											}else{
												$output[$package][$tmp_function_name]['meta']['this_variables'][] = $value;
											}
										}
									}else{
										if($polymorphic_id != 'default'){
											$output[$package][$function_name]['meta'][$polymorphic_id]['this_variables'][] = $value;
										}else{
											$output[$package][$function_name]['meta']['this_variables'][] = $value;
										}
									}
								}else{
									if($polymorphic_id != 'default'){
										$output[$package][$function_name]['meta'][$polymorphic_id]['this_variables'][] = $value;
									}else{
										$output[$package][$function_name]['meta']['this_variables'][] = $value;
									}
								}
							}
						}
					}
					if($function['inherits']){
						foreach($function['inherits'] as $value){
							if($value{0} != '_'){
								if($polymorphic_id != 'default'){
									$output[$package][$function_name]['meta'][$polymorphic_id]['inherits'][] = $value;
								}else{
									$output[$package][$function_name]['meta']['inherits'][] = $value;
								}
							}
						}
					}
					if($function_content['this_inherits']){
						foreach($function_content['this_inherits'] as $value){
							if($value{0} != '_'){
								if(preg_match('%^(.*)\.superclass\.([^.]+)$%', $value, $match)){
									if($content[$match[1]]['inherits']){
										if($polymorphic_id != 'default'){
											$output[$package][$function_name]['meta'][$polymorphic_id]['this_inherits'][] = end($content[$match[1]]['inherits']) . '.' . $match[2];
										}else{
											$output[$package][$function_name]['meta']['this_inherits'][] = end($content[$match[1]]['inherits']) . '.' . $match[2];
										}
									}else{
										if($polymorphic_id != 'default'){
											$output[$package][$function_name]['meta'][$polymorphic_id]['this_inherits'][] = $value;
										}else{
											$output[$package][$function_name]['meta']['this_inherits'][] = $value;
										}
									}
								}else{
									if($polymorphic_id != 'default'){
										$output[$package][$function_name]['meta'][$polymorphic_id]['this_inherits'][] = $value;
									}else{
										$output[$package][$function_name]['meta']['this_inherits'][] = $value;
									}
								}
							}
						}
					}
					
					if($function_signature == 'inherits' || $function_signature == 'variables'){
						continue;
					}
					
					$shortest = '																										';
					$trimmed = true;					
					foreach($function_content['function_content'] as $key => $line){
						while($tmp_line = preg_replace('%^(\t*) {4}%', "\$1\t", $line)){
							if($line == $tmp_line){
								break;
							}
							$line = $tmp_line;
						}
						$function_content['function_content'][$key] = $line;

						if(trim($line) == ''){
							if($trimmed){
								unset($function_content['function_content'][$key]);
							}
							$trimmed = true;
						}else{
							$trimmed = false;
							if(preg_match('%^\t+%', $line, $matches) && strlen($matches[0]) < strlen($shortest)){
								$shortest = $matches[0];
							}
						}
					}					
					foreach($function_content['function_content'] as $key => $line){
						$function_content['function_content'][$key] = preg_replace('%^' . $shortest . '%', '', $line);
					}

					// Get rid of "undefined" and the function name
					$function_signature = preg_replace('%^undefined\s*%', '', preg_replace('%(?<= )[^ ]+(?=\()%U', '', $function_signature));
					if($polymorphic_id != 'default'){
						$output[$package]['meta'][$function_name][$polymorphic_id][$function_signature] = '';
						$output[$package][$function_name][$polymorphic_id]['src'] = implode("\n", $function_content['function_content']);
					}else{
						$output[$package]['meta'][$function_name][$function_signature] = '';
						$output[$package][$function_name]['src'] = implode("\n", $function_content['function_content']);
					}
					if($function_content['comments']['summary']){
						if($polymorphic_id != 'default'){
							$output[$package]['meta'][$function_name][$polymorphic_id][$function_signature] = $function_content['comments']['summary'];
						}else{
							$output[$package]['meta'][$function_name][$function_signature] = $function_content['comments']['summary'];							
						}
					}
				}
			}
			
    	if(preg_match('%_' . $var['variable'] . '$%', $function_name)){
				continue;
			}
    
			if($function_name == 'requires'){
				continue;
			}

	 		if(is_array($function)){
				if(isset($_GET['signatures'])){
					$signatures = array_diff(array_keys($function), array('inherits', 'variables', 'is'));
					if(!empty($signatures)){
 	      		print implode("\n", $signatures) . "\n";					
					}
				}
				else{
					$empty_test = array_diff(array_keys($function), array('inherits', 'variables'));
					if(strrpos($function_name, '*') == strlen($function_name)-1 || !empty($empty_test)){
						if($last['package'] && strpos($real_function_name, $last['package']) !== false){
							// This guarantees that the .* function won't get inserted unless it has children
							$output['function_names'][preg_replace('%^dojo%', '_', $last['package']) . '*'][] = $last['package'] . '*';
							$last['package'] = '';
						}
						if(strrpos($real_function_name, '*') == strlen($real_function_name)-1){
							 	$last['package'] = substr($real_function_name, 0, -1);
						}else{
							if($real_function_name){
								$output['function_names'][preg_replace('%^dojo%', '_', $package)][] = $function_name;// . ' (' . $package . ')';
							}
						}
					}
				}
			}
		}
	}

	if(isset($_GET['output'])){
		print_r($output);
	}
	
	if(isset($_GET['function_names'])){
		print_r($output['function_names']);
	}
	file_put_contents('json/function_names', $json->encode($output['function_names']));
	unset($output['function_names']);

	foreach($output as $package => $function){
		$package = preg_replace('%^dojo%', '_', str_replace('*', '_', $package));

		if(!is_dir('json/' . $package)){
			mkdir('json/' . $package);
			chmod('json/' . $package, 0777);
		}

		if($function['meta']){
			file_put_contents('json/' . $package . '/meta', $json->encode($function['meta']));
			unset($function['meta']);
		}
		
		foreach($function as $function_name => $content){
			$function_name = preg_replace('%^' . str_replace('.', '\.', $package) . '%', '_', $function_name);
			if(!is_dir('json/' . $package . '/' . $function_name)){
				mkdir('json/' . $package . '/' . $function_name);
				chmod('json/' . $package . '/' . $function_name, 0777);
			}

			foreach($content as $polymorphic_id => $contents){
				if($polymorphic_id == 'meta'){
					if($contents['inherits']){
						$contents['inherits'] = array_values(array_unique($contents['inherits']));
					}
					if($contents['this_variables']){
						$contents['this_variables'] = array_values(array_unique($contents['this_variables']));
					}
					file_put_contents('json/' . $package . '/' . $function_name . '/meta', $json->encode($contents));
				}elseif($polymorphic_id == 'src'){
					file_put_contents('json/' . $package . '/' . $function_name . '/src', $contents);
				}else{
					if(!is_dir('json/' . $package . '/' . $function_name . '/' . $polymorphic_id)){
						mkdir('json/' . $package . '/' . $function_name . '/' . $polymorphic_id);
						chmod('json/' . $package . '/' . $function_name . '/' . $polymorphic_id, 0777);
					}
					if($contents['meta']){
						if($contents['inherits']){
							$contents['inherits'] = array_values(array_unique($contents['inherits']));
						}
						if($contents['this_variables']){
							$contents['this_variables'] = array_values(array_unique($contents['this_variables']));
						}
						file_put_contents('json/' . $package . '/' . $function_name . '/' . $polymorphic_id . '/meta', $json->encode($contents['meta']));
					}
					if($contents['src']){
						file_put_contents('json/' . $package . '/' . $function_name . '/' . $polymorphic_id . '/src', $json->encode($contents['src']));
					}
				}
			}
		}
	}
		
	if(!isset($_GET['signatures'])){
		header("Content-type: text/html");		
?>
<a href="parser.php?file=src/lang/common.js">Search by file</a><br />
<a href="parser.php?inheritance">Widget inheritance tree</a><br />
<a href="parser.php?signatures">View all function signatures</a><br />
<?php
	}
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
				if($file == '__package__.js'){
					package_parse($absolute_path);
				}else{
        	file_parse($absolute_path);
				}
      }
    }
    elseif(!in_array($file, $var['bad_dirs'])){
      dir_plunge($path, $file);
    }
  }
}

function equality_parse($matches){
	global $contents, $last;
	$contents[$last['package']][$matches[1]]['is'] = $matches[2];
	return $matches[2];
}

function require_parse($matches){
	global $contents, $last;
	if($matches[1] == 'If' && count($matches) == 4){
		if($matches[2] == 'dojo.render.svg.support.builtin'){
			$matches[2] = 'svg';
		}
		$contents[$last['package']]['requires'][$matches[2]][] = $matches[3];
	}else{
		$contents[$last['package']]['requires']['common'][] = $matches[2];
	}
}

function file_to_package($file){
	// Makes the file names pretty!
	$package = preg_replace('%.js$%', '', str_replace('__package__.js', '*', preg_replace('%^src\.%', '', preg_replace('%^src(?!\.hostenv|\.bootstrap)%', 'dojo', str_replace('/', '.', $file)))));
	if($package == 'bootstrap1' || $package == 'bootstrap2'){
		return 'dojo';
	}
	return $package;
}

/**
 * This function goes through the standard package file
 * and finds out what is loaded in different situations.
 * It checks require and conditionalLoadModule
 *
 * Note: I don't know everything that dojo.require does
 */
function package_parse($file){
	global $contents, $var;
	$started = array('object' => false);
	$content = array('hostenv' => '');
	
	$package = file_to_package($file);
	$lines = explode("\n", file_get_contents('../' . $file));
	foreach($lines as $line){
		if(preg_match('%^\s*dojo\.require\(["\'](.*)[\'"]%U', $line, $matches)){
			$contents[$package]['requires']['common'][] = $matches[1];
			$contents[$package][$package] = array();
		}elseif(preg_match('%^\s*dojo.hostenv.(?:kwCompoundRequire|conditionalLoadModule)\s*\(\s*{%', $line, $matches)){
			$line = str_replace($matches[0], '', $line);
			$started['object'] = true;
		}

		if($started['object']){
			if(preg_match('%^\s(' . $var['variable'] . ')\s*:\s*\[%', $line, $matches)){
				$content['hostenv'] = $matches[1];
				$line = str_replace($matches[0], '', $line);
			}
			if(!empty($content['hostenv'])){
				if(preg_match_all('%"(.*)"%U', $line, $matches)){
					foreach($matches[1] as $match){
						$contents[$package]['requires'][$content['hostenv']][] = $match;
						$contents[$package][$package] = array();
					}
				}
			}
			if(strpos($line, ']') !== false){
				$content['hostenv'] = '';
			}
		}
	}
}

/*
 * Several things are at work here... Once we find a valid function,
 * we're going to start looking for its parameters.
 * We're going to need to get the function name to keep track of it.
 * Then we're going to need to find the type hinting of its parameters.
 */
function file_parse($file){
	global $regex, $contents, $var, $last;
	
  $content = file_get_contents('../' . $file);
	$package = file_to_package($file);
	$last['package'] = $package; // Used in the preg_replace_callbacks below
  	
  if(preg_match('%^\s*dj_deprecated\s*\(%m', $content)){
		return;
  }

	preg_replace_callback('%^\s*dojo\.require(?:After)?(If)?\(["\']?([^,\'"]*)[\'"]?(?:\s*,\s*["\'](.*)[\'"])?%m', "require_parse", $content);

	$actual_lines = $lines = explode("\n", $content);

	$started = array('multiline' => false);
  foreach($actual_lines as $key => $line){
	  $line = $actual_lines[$key] = preg_replace('%/\*.*\*/%U', '', $line);
	
		if(!$started['multiline'] && ($pos = strpos($line, '//')) !== false){
			$line = $actual_lines[$key] = substr($line, 0, $pos);
		}

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
      
      if(!empty($contents[$package][$function_name])){
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
        
        // Matches: {, }, (
        preg_match_all('%(?<![/])[{}(]%', $actual_lines[$i], $blocks);
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
          $contents[$package][$function_name][function_signature($content, $function_name)] = $content;
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

	$package = file_to_package($file);
  
  foreach($actual_lines as $line){
    if(preg_match('%dojo.inherits\(\s*([^,\s]+)\s*,\s*(.*)\s*\)%', $line, $match)){
      $contents[$package][$match[1]]['inherits'][] = $match[2];
    }
  }

  foreach($actual_lines as $line){
    if(preg_match('%^\s*(' . $var['variable'] . '(?:\.' . $var['variable'] . ')*)\.(' . $var['variable'] . ')\s+=%', $line, $var_matches)){
			if(!is_array($contents[$package][$var_matches[1]]['variables']) || !in_array($var_matches[2], $contents[$package][$var_matches[1]]['variables'])){
      	$contents[$package][$var_matches[1]]['variables'][] = $var_matches[2];
			}
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

		// Deal with "multiline" comments that happen on the same line
		if(preg_match_all('%/\*(.*)\*/%U', $line, $comment_matches)){
			$line = str_replace($comment_matches[0], '', $line);
			$line .= '// ' . implode(' ', $comment_matches[1]);
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
    if(preg_match('%^\s*(dojo(?:\.' . $var['variable'] . ')+)\.(?:apply|call)\(this\)%', $line, $this_matches)){
      $contents['this_inherits'][] = $this_matches[1];
    }
    
    // Find the variables set by this.foo
    // We don't need to worry about finding functions here. They've been handled.
    if(preg_match('%this\.(' . $var['variable'] . ')\s*=(?!=)%', $line, $this_matches)){
      $contents['this_variables'][] = $this_matches[1];
    }elseif(preg_match('%^\s*this\.(' . $var['variable'] . ');%', $line, $this_matches)){
      $contents['this_variables'][] = $this_matches[1];
		}
    
    // Deal with the comment block ('block' defaults to true)
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
		$tmp_line = preg_replace('%(\'.*\'|".*")%U', '', $line);
    if(preg_match('%[{;]?\s*return(.*)%', $tmp_line, $match)){
      $tmp_line = $match[1];
      if(($pos = strpos($tmp_line, '/*')) !== false){
        $content['return'] = trim(substr($tmp_line, $pos+2));
        $started['return'] = true;        
      }elseif(($pos = strpos($tmp_line, '//')) !== false){
        $contents['returns'][] = trim(substr($tmp_line, $pos+2));
      }else {
        $contents['returns'][] = '';
      }
    }
    if($started['return']){
      if(($pos = strpos($tmp_line, '*/')) !== false){
        if(!empty($match[1])) {
          $content['return'] = trim(substr($content['return'], 0, strpos($content['return'], '*/')));
        }
        else {
          $content['return'] .= ' ' . trim(substr($tmp_line, 0, $pos));
        }
        $contents['returns'][] = trim($content['return']);
        $content['return'] = '';
        $started['return'] = false;
      }elseif(empty($match[1])){
        $content['return'] .= ' ' . trim($tmp_line);
      }
    }
   	$contents['function_content'][$key] = str_replace(array_merge($contents['returns'], array('/*', '*/', '//')), '', $contents['function_content'][$key]);
		if(trim($contents['function_content'][$key]) == ''){
			unset($contents['function_content'][$key]);
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
        if(is_array($function_values['this_inherits'])){
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

function deltree($directory, $last_directory = false){
	if($last_directory){
		$directory .= '/' . $last_directory;
	}
		
	$files = scandir($directory);
	foreach($files as $file){
		if($file{0} != '.'){
			if(is_dir($directory . '/' . $file)){
				deltree($directory, $file);
				//rmdir($directory . '/' . $file);
			}else{
				unlink($directory . '/' . $file);
			}
		}
	}
}

?>