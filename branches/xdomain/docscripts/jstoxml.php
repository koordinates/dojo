<?php

/**
 * NB: This is meant to be nearly a tokenizer. This means that if we're to suck any extras into an
 * XML tag, they should be, at the most, adjacent. If anything more complicated should be done, it
 * will be handled through an XSLT when the processing is complete.
 */

header("Content-type: text/plain");

define('VARIABLE_CHARS', '([a-zA-Z_$][\w$]*(?:\[.*\])?)'); // Any characters that are allowed within a variable
define('VARIABLE_SET', '(' . VARIABLE_CHARS . '(?:\.' . VARIABLE_CHARS . ')*)\s*='); // The command to set a variable
define('VARIABLE', '(' . VARIABLE_CHARS . '(?:\.' . VARIABLE_CHARS . ')*)'); // A fully expanded variable
define('FUNCTION_CALL', VARIABLE); // A valid function name
define('SINGLE_LINE_COMMENT', '//');
define('MULTI_LINE_COMMENT_START', '/*');
define('MULTI_LINE_COMMENT_END', '*/');
define('PARAMETERS_START', '('); // Allowable parameters
define('PARAMETERS_END', ')'); // See above
define('DOUBLE_QUOTE', '"');
define('SINGLE_QUOTE', "'");
define('BLOCK_START', '{');
define('BLOCK_END', '}');
define('FUNC', 'function'); // The name of a function declaraction call
define('IF_FUNC', 'if'); // An if statement
define('ELSE_FUNC', 'else'); // An else statement
define('OR_LOGIC', '||'); // A logical OR
define('NEW_INST', 'new');
define('ESCAPE', '\\'); // Valid escape character

$output = new DOMDocument();
$output->formatOutput = true;
$root = $output->createElement('package');
$root->setAttribute('name', 'Animation.js');
$output->appendChild($root);
$xpath = new DOMXPath($output);

$buffer = '';
$started = array(); // Says that we're currently "inside" a certain type
$stack = array(); // Holds a stack (FIFO) of DOM nodes
$fallback = array(); // The keys in this array hold the number of enclosures required to fall back to its value node.
/**
 * Explaining fallback:
 *
 * So basically, all fallback is reverted when the corresponding tag is closed.
 * 
 * This means that you say "This is the node to fall back to when its contents are done"
 * 
 * So, for a function declaration it would add the number of blocks currently in the stack (a block
 * being {}). Since nothing is done with the opening tag, the increase in the stack is not important.
 * When an element gets removed though, then we check to see if we're back where we started.
 * 
 * A matching count in the key gets the node in its value.
 */
$last = null; // The last node to be used

$lines = explode("\n", file_get_contents('../src/animation/Animation.js'));
foreach($lines as $line){
  $started['variable'] = false;
	if($started['single_comment']){
		--$started['single_comment'];
		$last->appendChild($output->createTextNode(trim($buffer)));
		$last = &$last->parentNode;				
		$buffer = '';
	}
	if($started['multi_comment'] && trim($buffer) != ''){
		$buffer .= "\n";
	}

	$characters = preg_split('%%', $line);
	// Looping like this allows us to use prev($characters) and all other array position functions
	while(($character = next($characters)) !== false){
	  // Right now, this only kicks in if it's not a word character. Basically, it builds a buffer
	  // until something important comes along. Remember that every line has a trailing empty character
	  // because of the way things are split.
		if(!preg_match('%[\w$\[\]]%', $character)){
		  if($started['single_comment']){
		    // This one wins. It's only terminated by the line break (see beginning of foreach loop)
		    $buffer .= $character;
		  }elseif($started['multi_comment'] && substr($buffer, -strlen(MULTI_LINE_COMMENT_END)+1) . $character == MULTI_LINE_COMMENT_END){
			  // First, if we're in a comment, we need to be able to get out of it
				--$started['multi_comment'];
				$last->appendChild($output->createTextNode(trim(substr($buffer, 0, -1))));
				$last = &$last->parentNode;				
				$buffer = '';
			}elseif($started['multi_comment']){
			  // If we're in a multi line comment, we eat EVERYTHING
				$buffer .= $character;
			}elseif($started['single_quote'] && $character == SINGLE_QUOTE && substr($buffer, -1) == ESCAPE){
			  // If we would ordinarily close, but the last character is the escape character, we should add the ordinary close
			  $buffer .= $character;
			}elseif($started['single_quote'] && $character == SINGLE_QUOTE){
			  // The single quote is completed
			  --$started['single_quote'];
				$last->appendChild($output->createTextNode($buffer));
				$buffer = '';
			}elseif($started['single_quote']){
			  // Eat it
				$buffer .= $character;
			}elseif($started['double_quote'] && $character == DOUBLE_QUOTE && substr($buffer, -1) == ESCAPE){
			  // If we would ordinarily close, but the last character is the escape character, we should add the ordinary close
			  $buffer .= $character;
			}elseif($started['double_quote'] && $character == DOUBLE_QUOTE){
			  // The double quote is completed
				--$started['double_quote'];
				$last->appendChild($output->createTextNode($buffer));
				$buffer = '';
			}elseif($started['double_quote']){
			  // Eat it
				$buffer .= $character;
/* ============ This is the end of "eating" stuff ============= */
			}elseif(trim($buffer . $character) == MULTI_LINE_COMMENT_START){
			  // Thus begins the multi line comment
				++$started['multi_comment'];
				$comment = $output->createElement('comment');
				$text = $output->createTextNode('');
				$comment->appendChild($text);
				$last = &insert($output, $comment, $last);
				$buffer = '';
			}elseif(trim($buffer . $character) == SINGLE_LINE_COMMENT){
			  // Thus begings the single line comment
				++$started['single_comment'];
				$comment = $output->createElement('comment');
				$text = $output->createTextNode('');
				$comment->appendChild($text);
				$last = &insert($output, $comment, $last);
				$buffer = '';
			}elseif($character == SINGLE_QUOTE){
				// Thus begins the single quote
				++$started['single_quote'];				
				$string = $output->createElement('string');
				$string->setAttribute('quote', 'single');
				$text = $output->createTextNode('');
				$string->appendChild($text);
				$last = &insert($output, $string, $last);		
			}elseif(is_numeric($buffer)){
			  $number = $output->createElement('number');
			  if(is_float($buffer)){
			    $number->setAttribute('type', 'float');
			  }else{
			    $number->setAttribute('type', 'int');
			  }
			  $text = $output->createTextNode(trim($buffer));
			  $number->appendChild($text);
			  insert($output, $number, $last);
			  $buffer = '';
			}elseif($character == DOUBLE_QUOTE){
				// Thus begins the double quote
				++$started['double_quote'];				
				$string = $output->createElement('string');
				$string->setAttribute('quote', 'double');
				$text = $output->createTextNode('');
				$string->appendChild($text);
				$last = &insert($output, $string, $last);
			}elseif($character == BLOCK_START){
				// Thus begins a block
				$block = $output->createElement('block');
				$stack['block'][] = $last = &insert($output, $block, $last);
			}elseif($character == BLOCK_END){
			  // Thus ends the block
				$last = &array_pop($stack['block'])->parentNode;
        if($fallback['if'][count($stack['block'])]){
          // If we're back to where we started, we can jump out
				  $last = &$fallback['if'][count($stack['block'])]->parentNode;
				  unset($fallback['if'][count($stack['block'])]);
        }
				if($fallback['function'][count($stack['block'])]){
				  // If we're back to where we started, we can jump out
				  $last = &$fallback['function'][count($stack['block'])]->parentNode;
				  unset($fallback['function'][count($stack['block'])]);
				}
				if($fallback['variable'][count($stack['block'])]){
				  // If we're back to where we started, we can jump out
				  $last = &$fallback['variable'][count($stack['block'])]->parentNode;
				  unset($fallback['variable'][count($stack['block'])]);
				}
			}elseif($character == PARAMETERS_START){
				++$started['parameters'];
				// Thus begins the parameters
				if(trim($buffer) == IF_FUNC){
				  $if = $output->createElement('if');
				  $last = $fallback['if'][count($stack['block'])] = &insert($output, $if, $last);
					$parameters = $output->createElement('parameters');
					$last = $fallback['parameters'][count($stack['parameter'])] = &insert($output, $parameters, $last);
				  $buffer = '';
				}elseif(trim($buffer) == ELSE_FUNC){
				  $else = $output->createElement('else');
				  $last = $fallback['function'][count($stack['block'])] = &insert($output, $else, $last);
					$parameters = $output->createElement('parameters');
					$last = $fallback['parameters'][count($stack['parameter'])] = &insert($output, $parameters, $last);
				  $buffer = '';
				}elseif(trim($buffer) == FUNC){
				  $function = $output->createElement('function');
				  $function->setAttribute('type', 'declare');
				  $last = $fallback['function'][count($stack['block'])] = &insert($output, $function, $last);
					$parameters = $output->createElement('parameters');
					$last = $fallback['parameters'][count($stack['parameter'])] = &insert($output, $parameters, $last);
				  $buffer = '';
				}elseif(preg_match('%' . FUNCTION_CALL . '%', trim($buffer), $match)){
				  // If this is a valid function, that means the parameters are in the context of a function
					$function = $output->createElement('function');
					$function->setAttribute('name', $match[1]);
					$function->setAttribute('type', 'call');
					$last = $fallback['function_call'][count($stack['parameter'])] = &insert($output, $function, $last);
					$buffer = '';
				}
				$parameter = $output->createElement('parameter');
				$text = $output->createTextNode('');
				$parameter->appendChild($text);
				$last = $stack['parameter'][] = &insert($output, $parameter, $last);
			}elseif($started['variable'] && trim($buffer) == NEW_INST){
			  $started['variable'] = false;
			  $new = $output->createElement('new');
			  $last = $fallback['new'][count($stack['parameter'])] = &insert($output, $new, $last);
			  $buffer = '';
			}elseif($started['variable'] && $character != '.' && preg_match('%' . VARIABLE . '%', trim($buffer), $match)){
			  $started['variable'] = false;
			  $variable = $output->createElement('variable');
			  $variable->setAttribute('name', $match[1]);
			  insert($output, $variable, $last);
			  $last = $last->parentNode;
			  $buffer = '';
			}elseif($started['parameters'] && $character != '.' && preg_match('%' . VARIABLE . '%', trim($buffer), $match)){
				// Handle variables
				$variable = $output->createElement('variable');
				$variable->setAttribute('name', $match[1]);
				insert($output, $variable, $last);
				$buffer = '';
				prev($characters);				
			}elseif($started['parameters'] && $character == PARAMETERS_END){
				--$started['parameters'];
				array_pop($stack['parameter']);
				if($fallback['parameters'][count($stack['parameter'])]){
				  $last = &$fallback['parameters'][count($stack['parameter'])]->parentNode;
				  unset($fallback['parameters'][count($stack['parameter'])]);
				}
				if($fallback['new'][count($stack['parameter'])]){
				  $last = &$fallback['new'][count($stack['parameter'])]->parentNode;
				  unset($fallback['new'][count($stack['parameter'])]);
				}
				if($fallback['function_call'][count($stack['parameter'])]){
				  $last = &$fallback['function_call'][count($stack['parameter'])]->parentNode;
				  unset($fallback['function_call'][count($stack['parameter'])]);
				}
			}elseif($started['parameters'] && trim($buffer . $character) == OR_LOGIC){
			  $or = $output->createElement('or');
			  insert($output, $or, $last);
			  $buffer = '';
			}elseif($started['parameters'] && $character == ','){
        $parameter = $output->createElement('parameter');
				$text = $output->createTextNode('');
				$parameter->appendChild($text);
				$last_parameter = &array_pop($stack['parameter']);
				$last = &$last_parameter->parentNode;
				$stack['parameter'][] = $last = &insert($output, $parameter, $last);
			}elseif(preg_match('%' . VARIABLE_SET . '%', trim($buffer), $match)){
				// Handle variables
				$started['variable'] = true;
				$variable = $output->createElement('variable');
				$variable->setAttribute('name', $match[1]);
				$last = $fallback['block'][count($stack['block'])] = &insert($output, $variable, $last);
				$buffer = '';
			}elseif(trim($buffer) . $character == FUNC){
				$function = $output->createElement('function');
				$function->setAttribute('type', 'function');
				$last = &insert($output, $function, $last);
			}elseif($character != ';'){
				$buffer .= $character;
			}
		}else{
			$buffer .= $character;
		}
	}
}

print $output->saveXML();

function insert(&$output, &$element, $last){
	if(!$last){
		$last = $output->documentElement->appendChild($element);
	}else{
		$last = $last->appendChild($element);
	}
	return $last;
}

?>