<?php
//require_once (dirname(__FILE__).'/lib_svardump.php');
require_once (dirname(__FILE__).'/../saWebappObfuscator/webappObfuscator-1.0.0/1.0.0/functions.php');
require_once (dirname(__FILE__).'/saInternalErrorHandling.php');

$woApacheErrorLogLocation = '/home/rene/data1/htdocs/logs/htdocs_new.localhost.error.log';
global $woApacheErrorLogLocation;


/* a function to make https://github.com/seductiveapps/lucidLog one day (far in the future) parse the Apache webserver logs and show PHP-compiler errors in the browser with pretty colors
/* 
/* TOO COMPLICATED TO IMPLEMENT WITHIN one month to a full year from now (2016-09(sept)-12)
function getDebugInfoFromApacheLog() {
    if (!file_exists($woApacheErrorLogLocation)) {
        $error = array (
            'msg' => 'Could not find an Apache error log where global $woApacheErrorLogLocation points to, file_exists()===false',
            '$woApacheErrorLogLocation' => $woApacheErrorLogLocation
        );
        return badResult (E_USER_ERROR, $error);
    } else {
        $f = fopen($woApacheErrorLogLocation, 'r');
        if ($f===false) {
            $error = array (
                'msg' => 'Could not open apache error log, fopen()===false',
                '$woApacheErrorLogLocation' => $woApacheErrorLogLocation
            );
            return badResult (E_USER_ERROR, $error);
        }
        
                
        $line = '';
        $cursor = -1;

        fseek($f, $cursor, SEEK_END);
        $char = fgetc($f);

        // Trim trailing newline chars of the file
        while ($char === "\n" || $char === "\r") {
            fseek($f, $cursor--, SEEK_END);
            $char = fgetc($f);
        }

        // Read until the start of file or first newline char
        while ($char !== false && $char !== "\n" && $char !== "\r") {
            //Prepend the new char
            $line = $char . $line;
            fseek($f, $cursor--, SEEK_END);
            $char = fgetc($f);
        }

        echo $line;        
    }
}
*/


function reportVariable ($varName='[reportVariable() : $varName missing]', $varValue='[reportVariable : $varValue missing]', $die=true, $stacktrace=true) {
    $html = '<div class="reportVariable">reportVariable() : <span class="reportVariable__varName">'.$varName.'</span>';
    $html .= ' === ';
    //$html .= '<pre class="svar_dump">'; 
    $html .= '<span class="reportVariable__varValue">'.json_encode($varValue, JSON_PRETTY_PRINT).'</span>'; 
    //$html .= '</pre>';
    if ($stacktrace===true) {
        $html .= prettyBacktrace();
    }
    $html .= '</div>'; 
    
    echo $html;
    
    if ($die) {
        //die();
        exit(); //does exactly the same as die(); 
    }
}



function cssForErrorReport () {
    $cssForErrorReport = 
        '<style>'."\r\n"
        .'<!-- from webappObfuscator-1.0.0/functions__basicErrorHandling.php:::cssForErrorReport() -->'
        .'<!-- sometimes hardcoding CSS is a good thing, like *a little* data redudancy *can* be a good thing -->'
        ."\t".'.reportVariable { color : white; background : blue; padding : 0.5em; margin : 0.5em; border-radius : 10px; border : 5px blue groove; }'
        ."\t".'.reportVariable__varName { color : white; background : green }'
        ."\t".'.reportVariable__varName { color : yellow; background : red }'
        ."\t".'.svar_dump {color : yellow; background : red}'
        
        ."\t".'.woError { background : red; color : white; padding : 1em; margin : 1em; border : 5px yellow groove; border-radius : 5px; }'."\r\n"
        ."\t".'.woStacktrace { font-size : 90%; font-weight : bold; }'."\r\n"
        ."\t".'.woStacktrace__basePath { color : yellow; } '."\r\n"
        ."\t".'.woStacktrace__item { margin-bottom : 1em; }'."\r\n"
        ."\t".'.woStacktrace__file { background : lime; color : navy; font-weight: bold; }'."\r\n"
        ."\t".'.woStacktrace__line { background : lime; color : black; font-weight : bold; font-size : 110%;  }'."\r\n"
        ."\t".'.woStacktrace__function { color : lime; margin-left : 10px; }'."\r\n"
        ."\t".'.woStacktrace__args { font-weight : normal; }'."\r\n"
        ."\t".'.woStacktrace__arg { color : black; }'."\r\n"
        ."\t".'.woStacktrace__argSeperator { color : white; font-weight : bold; font-size : 100%; }'."\r\n"
        ."\t".'.woStacktrace__arg__0 { color : #000030; background : white; }'."\r\n"
        ."\t".'.woStacktrace__arg__1 { color : #000060; background : yellow; }'."\r\n"
        ."\t".'.woStacktrace__arg__2 { color : #000090; background : lime; }'."\r\n"
        ."\t".'.woStacktrace__arg__3 { color : #0000C0; background : cyan; }'."\r\n"
        ."\t".'.woStacktrace__arg__4 { color : #0000F0; background : black; }'."\r\n"
        .'</style>';
        // those woStacktrace__arg__0 through woStacktrace__arg__10 have a hexadecimal (0,1,2,3,4,5,6,7,8,9,A,B,C,D,E,F) (stops at F) color coding..
        // R = red, G = green, B = Blue
        // combined you get very-dark-blue for woStacktrace__arg__0 and very light blue for woStacktrace__arg__5 :)
        // I STRONGLY ADVICE : you also should try not to pass more than 5 variables to a function (those are called parameters, as in 5 variables = 5 parameters passed to a function).. If you need more than 5 variables, pass it a single Array. That way you also keep your parameters' names available for easier debugging.
    
    return $cssForErrorReport;
}

function prettyBacktrace ($debug_backtrace_data=null) {
    if (is_null($debug_backtrace_data)) {
        $debug_backtrace_data = debug_backtrace();
    }

    $htmlErrorReport = woBasicErrorHandler__prettyBacktrace ($debug_backtrace_data);
    $errorReport = $htmlErrorReport;
    
    return $htmlErrorReport;
}

// included for those who like to keep their PHP tradesecrets extra-extra secretive..
// 2016-09-11 Rene AJM Veerman CEO+CTO of seductiveapps.com : these 3 functions are UNTESTED
// i can't at this time wrap my head around the exception system of PHP. sorry.
function pbt ($debug_backtrace_data=null) {
    return prettyBacktrace($debug_backtrace_data);
}
function gret ($result) { // good data to return up, upwards along the stacktrace
    return goodResult($result);
}
function bret ($errNo, $err) { // an error to return up, upwards along the stacktrace
    return badResult($errNo, $err);
}


function woError ($errCode, $errMsgOrArray) {
	if (is_array($errMsgOrArray)) {

		if (ob_get_length()>0) ob_end_flush();
		ob_start();
		var_dump ($errMsgOrArray);
		$errMsg = ob_get_clean();
	
	
	} else if (
		is_string($errMsgOrArray)
		|| is_int($errMsgOrArray)
		|| is_float($errMsgOrArray)
	) {
		$errMsg = '' . $errMsgOrArray;
	} else if (
		is_bool($errMsgOrArray)
	) {
		$errMsg = (
			$errMsgOrArray
			? 'TRUE'
			: 'FALSE'
		);
	}
	
	//echo 't1200';
	//echo '<pre>'; var_dump (debug_backtrace()); echo '</pre>'; in badResult() instead
	trigger_error ($errMsg, $errCode);
}

function woBasicErrorHandler ($errno, $errstr, $errfile, $errline, $errcontext, $haveEchoedCSSforColors=false, $wantColors=true) {
  //echo 'woBasicErrorHandler.main:start';
	if ($haveEchoedCSSforColors===true) {
            $css = '';
        } else {
            if ($wantColors) {
                $css = cssForErrorReport();
            } else {
                $css = '';
            }
        }
        
	$stacktrace = debug_backtrace();
	$errType = wo_php_errorType_humanReadable($errno);
	$errSeverity = 'woErrorSeverity__error';
	if (stripos($errType, 'warning')!==false) $errSeverity = 'woErrorSeverity__warning';
	if (stripos($errType, 'notice')!==false) $errSeverity = 'woErrorSeverity__notice';

	if (stripos($errType, 'user')!==false) $errSeverity .= ' woErrorSeverity__user';
	if (stripos($errType, 'parse')!==false) $errSeverity .= ' woErrorSeverity__parse';
	if (stripos($errType, 'core')!==false) $errSeverity .= ' woErrorSeverity__core';
	if (stripos($errType, 'compile')!==false) $errSeverity .= ' woErrorSeverity__compile';
	
	$html = 
            $css
            .'<div class="woError '.$errSeverity.'"><h1>PHP error</h1>'
            .'<p>'.$errType.' : '.$errstr.'</p>'
            .woBasicErrorHandler__prettyBacktrace ($stacktrace, $haveEchoedCSSforColors, $wantColors)
            .'</div>';
		
	echo $html;
	//reportStatus (1, $html); // RV : where the F is that function??
	die();
	
	
	
	/*
	echo '<h1>dfo error</h1><p>'.errorType_humanReadable($errno).' : '.$errstr.'<br/>stacktrace:</p><pre>';
	var_dump ($stacktrace);
	echo '</pre>';*/
	
}

function woBasicErrorHandler__prettyBacktrace ($st, $haveEchoedCSSforColors=false, $wantColors=true) {
	//global $errorsBasepath; // may not be necessary to put $errorsBasepath in another PHP file elsewhere in the filesystem.
	
	//echo '$errorsBasePath=<pre>'; var_dump ($errorsBasepath); echo '</pre>'; die();
	if (true) { //is_null($errorsBasepath)) {
            // YOUR CHOICE : $errorsBasepath = dirname(__FILE__).'/../../..';
            $errorsBasepath = realpath(dirname(__FILE__).'/../../..'); // easier to understand, in my huble opinion.
        };
	//echo '$errorsBasePath=<pre>'; var_dump ($errorsBasepath); echo '</pre>'; die();
	
	if ($haveEchoedCSSforColors===true) {
            $css = '';
        } else {
            if ($wantColors) {
                $css = cssForErrorReport();
            } else {
                $css = '';
            }
        }
	
	$r = 
            $css
            .'<div class="woStacktrace">'."\r\n"
            ."\t".'<p class="woStacktrace__title">Stacktrace DATA</p>'."\r\n"
            ."\t"."\t".'<span class="woStacktrace__basePath">All filenames are under : '.$errorsBasepath.'</span><br/>'."\r\n";
            
            
        // top - down does seem best.. 
        //$st = array_reverse ($st); // feel free to use this setting
        $st = array_reverse ($st); 
            
	foreach ($st as $stackNumber => $stackData) {
		if (array_key_exists('file', $stackData)) {
			$relPath = '...'.str_replace($errorsBasepath, '', $stackData['file']);
		} else {
			$relPath = '.../';
		};
		
		if (array_key_exists('line', $stackData)) {
			$line = "\t"."\t".'<span class="woStacktrace__line">(line '.$stackData['line'].')</span>'."\r\n";
		} else {
			$line = '';
		}
		
		$file = "\t"."\t".'<span class="woStacktrace__file">__FILE__ : '.$relPath.'</span> '."\r\n";
		$function = 
			"\t"."\t".'<span class="woStacktrace__function">'.$stackData['function'].'( '
			.(
					array_key_exists('args',$stackData)
					? woBasicErrorHandler__prettyBacktrace__arguments ($stackData['args'])
					: ''
			)
			.' )</span>'."\r\n";
			
		//if ($stackNumber > 0) { // ignore the call to saBasicErrorHandler() itself
		if (count($st)-1 > $stackNumber) {
                    $whichThenCalled = ' which then called ';
                } else {
                    $whichThenCalled = '';
                }
                $r .= 
                    "\t".'<div class="woStacktrace__item">'."\r\n"
                    .$line.' in '
                    .$file.' called<br/>'
                    .$function
                    .$whichThenCalled 
                    ."\t".'</div>'."\r\n";
		//}
	};
	
	$r .= '</div>';
	return $r;
}

function woBasicErrorHandler__prettyBacktrace__arguments ($args) {
	$r = '<span class="woStacktrace__args">';
	foreach ($args as $argIdx => $arg) {
            /* useless for the moment (2016-09(September))
                $jsonArg = json_encode($arg, JSON_PRETTY_PRINT);
                $jsonArgHTML = str_replace ("\r\n", '<br/>', $jsonArg);
                $jsonArgHTML = str_replace ("\n", '<br/>', $jsonArg);
                $jsonArgHTML = str_replace ("\r", '<br/>', $jsonArg);
                $jsonArgHTMLentities = $jsonArgHTML; //htmlentities($jsonArgHTML);
            */
                if (is_string($arg)) {
                    $argEntities = htmlentities($arg);
                } if (
                    is_array($arg)
                    || is_object($arg)
                ) {
                    $argEntities = '<pre class="woStacktrace__arg__jsonEncoded woStacktrace__arg">'.json_encode ($arg, JSON_PRETTY_PRINT).'</pre>';
                } else {
                    $argEntities = $arg;
                }
	
		if (is_array($arg)) {
			$r .= '<span class="woStacktrace__arg__'.$argIdx.' woStacktrace__arg">'.$argEntities.'</span>';
		} elseif (is_object($arg)) {
			$r .= '<span class="woStacktrace__arg__'.$argIdx.' woStacktrace__arg">'.$argEntities.'</span>';
		} else {
			$r .= '<span class="woStacktrace__arg__'.$argIdx.' woStacktrace__arg">'.$argEntities.'</span>';	
		}
		
		if (count($args)-2 > $argIdx) {
		$r .= '<span class="woStacktrace__argSeperator">&nbsp;&nbsp;&nbsp; , &nbsp;&nbsp;&nbsp;</span>';
		}
	}
	$r .= '</span>';
	return $r;
}



function wo_php_json_last_error_humanReadable ($errNo) {
	// taken from http://php.net/manual/en/function.json-last-error.php
	// on 2015 July 9th, valid for php version up to 5.5.0
	$errorTypes = array (
		JSON_ERROR_NONE => array (
			'errorCode' => 'JSON_ERROR_NONE',
			'msg' => 'No error has occurred'
		),
		JSON_ERROR_DEPTH => array (
			'errorCode' => 'JSON_ERROR_DEPTH',
			'msg' => 'The maximum stack depth has been exceeded'
		),
		JSON_ERROR_STATE_MISMATCH => array (
			'errorCode' => 'JSON_ERROR_STATE_MISMATCH',
			'msg' => 'Invalid or malformed JSON'
		),
		JSON_ERROR_CTRL_CHAR => array (
			'errorCode' => 'JSON_ERROR_CTRL_CHAR',
			'msg' => 'Control character error, possibly incorrectly encoded'
		),
		JSON_ERROR_SYNTAX => array (
			'errorCode' => 'JSON_ERROR_SYNTAX',
			'msg' => 'Syntax error'
		),
		JSON_ERROR_UTF8 => array (
			'errorCode' => 'JSON_ERROR_UTF8',
			'msg' => 'Malformed UTF-8 characters, possibly incorrectly encoded'
		)/*,
		JSON_ERROR_RECURSION => array (
			'errorCode' => 'JSON_ERROR_RECURSION',
			'msg' => 'One or more recursive references in the value to be encoded'
		),
		JSON_ERROR_INF_OR_NAN => array (
			'errorCode' => 'JSON_ERROR_INF_OR_NAN',
			'msg' => 'One or more NAN or INF values in the value to be encoded'
		),
		JSON_ERROR_UNSUPPORTED_TYPE => array (
			'errorCode' => 'JSON_ERROR_UNSUPPORTED_TYPE',
			'msg' => 'A value of a type that cannot be encoded was given'
		)*/
	);
	if ($errNo===0) {
		
		$r = $errorTypes[0]; 
	} else {
	
		$r = 
			array_key_exists ($errNo, $errorTypes)
			? $errorTypes[$errNo]
			: array (
				'errorCode' => 'ERROR_UNKNOWN_ERROR',
				'msg' => 'json_last_error() returned a code that is unknown to fucntions__basicErrorHandling.php::wo_php_json_last_error_humanReadable()'
			);
	};
	return $r;
			
}

function wo_php_errorType_humanReadable ($errNo) {

    if (phpversion() < '4.0.0') {
	$errorTypes = array (
			1   =>  'Error',
			2   =>  'Warning',
			4   =>  'Parsing Error',
			8   =>  'Notice',
		     2047   => 	'E_ALL'
	);
    } elseif (phpversion() < '5.0.0') {
	$errorTypes = array (
			1   =>  'Error',
			2   =>  'Warning',
			4   =>  'Parsing Error',
			8   =>  'Notice',
			16  =>  'Core Error',
			32  =>  'Core Warning',
			64  =>  'Compile Error',
			128 =>  'Compile Warning',
			256 =>  'User Error',
			512 =>  'User Warning',
			1024=>  'User Notice',
			2047=> 	'E_ALL'
	);

    } elseif (phpversion() < '5.2.0') {
	$errorTypes = array (
			1   =>  'Error',
			2   =>  'Warning',
			4   =>  'Parsing Error',
			8   =>  'Notice',
			16  =>  'Core Error',
			32  =>  'Core Warning',
			64  =>  'Compile Error',
			128 =>  'Compile Warning',
			256 =>  'User Error',
			512 =>  'User Warning',
			1024=>  'User Notice',
			2048=> 	'Strict',
			2047=> 	'E_ALL'
	);

    } elseif (phpversion() < '5.3.0') {
	$errorTypes = array (
			1   =>  'Error',
			2   =>  'Warning',
			4   =>  'Parsing Error',
			8   =>  'Notice',
			16  =>  'Core Error',
			32  =>  'Core Warning',
			64  =>  'Compile Error',
			128 =>  'Compile Warning',
			256 =>  'User Error',
			512 =>  'User Warning',
			1024=>  'User Notice',
			2048=> 	'Strict',
			4096=> 	'Recoverable',
			6143=> 	'E_ALL'
	);

    } elseif (phpversion() >= '5.3.0' && phpversion() < '6.0.0') {
	$errorTypes = array (
			1   =>  'Error',
			2   =>  'Warning',
			4   =>  'Parsing Error',
			8   =>  'Notice',
			16  =>  'Core Error',
			32  =>  'Core Warning',
			64  =>  'Compile Error',
			128 =>  'Compile Warning',
			256 =>  'User Error',
			512 =>  'User Warning',
			1024=>  'User Notice',
			2048=> 	'Strict',
			4096=> 	'Recoverable',
			8192=> 	'Depracated',
		       16384=>	'User-level Depracated',
		       30719=> 	'E_ALL'
	);

    } elseif (phpversion() >= '6.0.0') {
	$errorTypes = array (
			1   =>  'Error',
			2   =>  'Warning',
			4   =>  'Parsing Error',
			8   =>  'Notice',
			16  =>  'Core Error',
			32  =>  'Core Warning',
			64  =>  'Compile Error',
			128 =>  'Compile Warning',
			256 =>  'User Error',
			512 =>  'User Warning',
			1024=>  'User Notice',
			2048=> 	'Strict',
			4096=> 	'Recoverable',
			8192=> 	'Depracated',
		       16384=>	'User-level Depracated',
		       32767=> 	'E_ALL'
	);
    }

    return $errorTypes[$errNo];
}

?>