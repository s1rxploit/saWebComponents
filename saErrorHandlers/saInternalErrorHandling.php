<?php 
/*---
  this is my way of providing quality runtime debugging info 
	(to the computerprogram itself, to developers, to end-users)
	and -even more important- creating robust computerprograms that
	can be debugged quickly when they break when they're faced with the unexpected.
	
	a future version of this will email all the *releveant* debug details
	to the developer(s) whenever the unexpected hits the computer program using this.
	draft of this extension is detailed in webappObfuscator-1.0.0.php:::webappObfuscator::readTokens()
*/

function badResult ($errNo=-1, $errMeta=null) {
        // to allow passing back up the stacktrace (an error was already made and needs to be pushed back up the call-chain (stacktrace [of nested/recursive function-calls)
        if (is_array ($errNo)) { 
            return $errNo;
        } 
    
        // called for the first time on any given stacktrace
        // see PHP.net : debug_backtrace();
	if (
	  is_string($errNo)
	  || is_array($errNo)
	) {
	  $errMeta = $errNo;
	  $errNo = E_USER_ERROR;
	  $errMeta['additionalError'] = 'badResult called with no $errNo as first parameter';
	};
	if (is_string($errMeta)) {
		$errMeta = array ('msg'=>$errMeta);
	};
	//$errMeta = filterArgs($errMeta, $filterSettings);

	$e = array (
		'isMetaForFunc' => true,
		'phpErrorClass' => $errNo,
		'phpErrorType' => wo_php_errorType_humanReadable ($errNo),
		'error' => $errMeta,
	);
	$traceData = debug_backtrace();
	$e['Stacktrace'] = $traceData;//phpFilterStacktraceData($traceData,$filterSettings);
	$e['globals'] = getGlobals();
	//var_dump ($e);
	
	/*if (function_exists('saError')) {
	  echo 'error handler === saError()';
	  saError ($errNo, $errMeta); // http://seductiveapps.com
	} else*/if (function_exists('woError')) {
	  //echo 'error handler === woError()';
	  woError ($errNo, $errMeta);
	} else {
	  echo 'functions__internalErrorHandling.php::no error handler specified, var_dump-ing.<pre>';
	  var_dump ($e);
	  echo '</pre>';
	}
	
	return $e;
}

function getGlobals() {
	$r = array (
		'$_GET' => $_GET,
		'$_POST' => $_POST,
		'$_COOKIE' => $_COOKIE
	);
	return $r;
}

function good($r) {
	return (
		is_array($r)
		&& array_key_exists('result',$r)
	);
}

//function &result(&$r) {
function &result(&$r) {
	return $r['result'];
}

function &resultArray (&$r) {
  $r2 = array();
  foreach ($r as $k => $v) {
    $r2[$k] = result($v);
  }
  return $r2;
}


function &goodResult(&$r) {
	$r2 = array (
		'isMetaForFunc' => true,
		'result' => &$r
	);
	return $r2;
}
?>