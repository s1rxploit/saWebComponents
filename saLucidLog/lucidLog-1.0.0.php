<?php
// lah.php, part of http://seductiveapps.com/products/logAndHandler
global $lahConfig;
$lahConfig = array();

global $filterSettings;
$filterSettings = array(
	'filter'=> array(
		'badResult' => 'removeCompletely',
		'nonFatalErrorHandler' => 'removeCompletely',
		'jsonViewer_dump' => 'removeCompletely',
		'hm' => 'removeCompletely'
	),
	'removeFromFilePath' => SA_SITE_HD
);

global $errorConfig;
$errorConfig = array (
	'ignoreAllErrors' => false,
	'availableOutputs' => array('screen_lah','screen_hm','screen_htmlDump','db','file'),
	'outputConfigurations' => array (
		'screen_hm' => array (
			'keyRenderHTML'=>true,
			'showArraySiblings'=>false,
			'showArrayPath'=>false
		),
		'screen_lah' => array (
			'includeServerVars' => false,
			'includeEnvVars' => false,
			'includeSessionVars' => false
		),
		'db' => array(),
		'file' => array()
	),
	'configuredOutputs' => array('db','screen_lah')
);

function lucidLog_initialize() {
//	error_reporting(E_ALL); // causes a run-out-of-memory error on my netbook/wampserver-2.2d-32! :(
	//ini_set('display_errors', 1);
	//$oldError_handler = set_error_handler("lucidLog_nonFatalErrorHandler");
}


function setErrorConfig ($newConfig) {
	global $errorConfig;
	$errorConfig = negotiateOptions (
		$errorConfig,
		$newConfig
	);
}

function getErrorConfig () {
	global $errorConfig;
	return $errorConfig;
}

global $errorContext;
$errorContext = '';

function ignoreErrors ($yesNo) {
	global $errorConfig;
	$errorConfig['ignoreAllErrors'] = $yesNo;
}



function phpFilterBacktraceData (&$t,$s=null) {
// $t = trace data from debug_backtrace()
// $s = settings

	if (is_array($s) && array_key_exists('removeFromFilePath', $s)) {
		$s['removeFromFilePath'] = str_replace ('\\', '/', $s['removeFromFilePath']);
	}

		$r = array();
		$t = array_reverse ($t);
		foreach ($t as $k => &$l) {

			$t1= array(
				'msg' => 'T2',
				'$k' => $k,
				'$l' => $l
			);
		
			$skip = false;
			if (array_key_exists('filter', $s)) {
				foreach ($s['filter'] as $k=>$v) {
					if ($l['function']==$k) {
						if ($v=='removeCompletely') { $skip = true; break; };
						if ($v=='removeArg0') { $l['args'][0] = 'phpFilterBacktraceData(): removed to eliminate redundancy.'; };
					}
				}
			}

			if (!$skip) {
				if (array_key_exists('removeFromFilePath', $s) && array_key_exists('file', $l)) {
					$l['file'] = str_replace('\\','/', $l['file']);
					$l['file'] = str_replace($s['removeFromFilePath'], '', $l['file']);
				} 
				
				
				$errContext = array();
				$errContext['func'] = $l['function'];
				if (array_key_exists('file',$l)) $errContext['file'] = $l['file'];
				if (array_key_exists('line',$l)) $errContext['line'] = $l['line'];
				$id = json_encode($errContext);
				
				$errContextTryout = $errContext;
				$errContextTryout['errIdx'] = 1;
				$checksOut = false;
				while (!$checksOut) {
					$found = false;
					if (isset($_SESSION)) {
						if (array_key_exists('errors',$_SESSION)) {
							foreach ($_SESSION['errors'] as $context => $recs) {
								foreach ($recs as $idx=>$errRec) {
									foreach ($errRec as $errCtx=>$errRecDetail) {
										if ($errCtx===$id) {
											$found = true;
											break;
										}
									}
								}
							}
						}
					}
					if ($found) {
						$errContextTryout['errIdx']++;
						$id = json_encode($errContextTryout);
						$found = false;
					} else {
						$checksOut = true;
					}
				}
				
				if (array_key_exists('args',$l)) {
					$args = filterArgs($l['args'],$s);
					$r[$id] = $args;
					
					//echo 't1: '; var_dump ($s);
					//echo 't2: '; var_dump ($args);
					
				}
				
				
			}
		}

return $r;
		
    return array_merge(array(
			'hmOverrides'=>array(
				'themeName'=>'--trace--'
			)),$r
		);
}

function filterArgs ($a, $s) {
	$r = array();
	if (is_array($a)) {
		foreach ($a as $k => $v) {
			if (is_array($s) && array_key_exists('removeFromFilePath',$s)) {
				if (is_string($k)) {
					$k = str_replace('\\', '/', $k);
					$k = str_replace($s['removeFromFilePath'], '', $k);
				}
				if (is_string($v) && array_key_exists('removeFromFilePath',$s)) {
					$v = str_replace('\\', '/', $v);
					$v = str_replace($s['removeFromFilePath'], '', $v);
				}
				if (is_array($v)) {
					$v = filterArgs ($v, $s);
				}
			}
			$r[$k] = $v; 
		}
	}
	return $r;
}


function getGlobals() {
	$r = array (
		'$_GET' => $_GET,
		'$_POST' => $_POST,
		'$_COOKIE' => $_COOKIE
	);
	global $errorConfig;
	if ($errorConfig['outputConfigurations']['screen_lah']['includeServerVars']) $r['$_SERVER'] = $_SERVER;
	if ($errorConfig['outputConfigurations']['screen_lah']['includeEnvVars']) $r['$_ENV'] = $_ENV;
	if ($errorConfig['outputConfigurations']['screen_lah']['includeSessionVars'] && session_id()!='') {
		 $ns = $_SESSION;
		 $ns['errors']=null;
		 $r['$_SESSION'] = $ns;
	}
	return $r;
}




function badResult ($errNo, $errMeta) {
	global $errorConfig;
	global $filterSettings;
	
	if (is_string($errMeta)) {
		$errMeta = array ('msg'=>$errMeta);
	};
	$errMeta = filterArgs($errMeta, $filterSettings);

	$e = array (
		'isMetaForFunc' => true,
		'phpErrorClass' => $errNo,
		'phpErrorType' => errorType_humanReadable ($errNo),
		'error' => $errMeta,
	);
	$traceData = debug_backtrace();
	$e['backtrace'] = phpFilterBacktraceData($traceData,$filterSettings);
	$e['globals'] = getGlobals();
	
	if (!$errorConfig['ignoreAllErrors']) {
		// reportError ($e); // TODO : RE-ENABLE ; was causing memory leaks in photoAlbum app; server deadslow
		
		
		
		
		 // DEBUG ONLY:
		 //if ($e['phpErrorClass']==E_WARNING) die();
		 //die();
	}
	
 return $e;
}

function reportError ($e) {
	unset ($e['isMetaForFunc']);
	
	$context = null;
	foreach ($e['backtrace'] as $context=>$err) {
	};
	
	if (is_null($context)) {	
		if (array_key_exists('function', $e['error'])) {
			$context = array (
				'func' => $e['error']['function'],
				'file' => (array_key_exists('filename',$e['error']) ? $e['error']['filename'] : '--unknown--'),
				'line' => (array_key_exists('line',$e['error']) ? $e['error']['line'] : '--unknown--')
			);
		} else {
			$context = array (
				'func' => $e['error']['msg'],
				'file' => (array_key_exists('filename',$e['error']) ? $e['error']['filename'] : '--unknown--'),
				'line' => (array_key_exists('line',$e['error']) ? $e['error']['line'] : '--unknown--')
			);
		}
		$context = json_encode ($context);
	}
	

	$themeName='error';
	switch ($e['phpErrorClass']) {
		case E_NOTICE: $themeName='notice'; break;
		case E_USER_NOTICE: $themeName='notice'; break;
		case E_USER_WARNING: $themeName='warning'; break;
		case E_WARNING: $themeName='warning'; break;
	}
	$themeName = '--'.$themeName.'--';
	
	//unset($e['backtrace']); //hm() includes a backtrace of its own.
	$pec = $e['phpErrorClass'];
	//unset($e['phpErrorClass']);
	//unset($e['phpErrorType']);
	//unset($e['error']['msg']);
	//htmlDump ($e, "e");
	if (isset($_SESSION)) $e['timeInSecondsSinceStartOfSession'] = getDuration($_SESSION['sessionStartTime']);
	$e['timeInSecondsSinceStartOfLoading'] = getDuration();
	if (count($e['error'])==0) unset($e['error']);

	global $errorConfig;
	//$e['hmOverrides'] = $errorConfig['outputConfigurations']['screen_hm'];
	//$e['hmOverrides']['themeName'] = $themeName;
	
	if (
		
		true || ( // ALWAYS lucidLog_report()
	
		array_key_exists ('configuredOutputs', $errorConfig) && 
		is_array($errorConfig['configuredOutputs']) &&
		(array_search('screen_lah',$errorConfig['configuredOutputs'])!==false)
		)
	) {
		lucidLog_report ($e, $context);
		/*
		echo '<pre>';
		print_r ($e);
		echo '</pre>';
		 */
	}
	if (
		array_key_exists ('configuredOutputs', $errorConfig) && 
		is_array($errorConfig['configuredOutputs']) &&
		(array_search('db',$errorConfig['configuredOutputs'])!==false)
	) {
		global $seductiveappsServiceLog_dbSettings;
		if (
			!is_null($seductiveappsServiceLog_dbSettings) 
			&& array_key_exists('DB_SERVER_TYPE',$seductiveappsServiceLog_dbSettings)
		) {
			seductiveappsServiceLog_makeLogEntry_error ($context, $e);
		}
	}
	if (
		array_key_exists ('configuredOutputs', $errorConfig) && 
		is_array($errorConfig['configuredOutputs']) &&
		(array_search('screen_hm',$errorConfig['configuredOutputs'])!==false)
	) {
		unset ($e['backtrace']);
		hm ($e, $context);
	}
	if (
		array_key_exists ('configuredOutputs', $errorConfig) && 
		is_array($errorConfig['configuredOutputs']) &&
		(array_search('screen_htmlDump',$errorConfig['configuredOutputs'])!==false)
	) {
		unset ($e['vars']);
		unset ($e['backtrace']);
		unset ($e['globals']['_SESSION']['errors']);
		/*
		htmlDump ($e, $context);
		*/
		/*
		echo '<pre>';
		print_r ($e);
		echo '</pre>';
		 */
	}
//htmlDump ($pec, "pec");	
//htmlDump ($e['phpErrorType'], "pet");

/*
	if (array_search($pec, array(E_USER_ERROR,E_ERROR))!==false) {
		die();
	}
*/	
	return $e;
}

function lucidLog_report ($e, $title) {
	if (session_id()!='') {
		if (!array_key_exists('errors',$_SESSION)) {
			$_SESSION['errors'] = array();
		}
		$errCtx = json_encode(getErrorContext());
		if (!array_key_exists($errCtx,$_SESSION['errors'])) {
			$_SESSION['errors'][$errCtx] = array();
		}
		$_SESSION['errors'][$errCtx][] = array ($title=>$e);
	}
	//hm ($e, "e");
}

function dbLogError ($error) {
	htmlDump ($error, "DB TODO LOG");
}

function getErrorContext() {
	global $errorContext;
	return $errorContext;
}

function setErrorContext($newContext) {
	global $errorContext;
	$errorContext = $newContext;
}

function setErrorContextToScript ($additionalErrorContext) {
	$duration = getDuration($_SESSION['sessionStartTime']);
	
	$localErrorContext = array (
		'script' => $_SERVER['SCRIPT_FILENAME']
	);
	
	$errorContext = negotiateOptions (
		$localErrorContext,
		$additionalErrorContext
	);
		
	setErrorContext ($errorContext);
}

function lucidLog_ignoreErrorsHandler ($errNo, $errMsg, $filename, $line, $vars) {
	return true;
}

function lucidLog_nonFatalErrorHandler ($errNo, $errMsg, $filename, $line, $vars) {
	// turn off error handling during error handling:
	//$eh = set_error_handler ('lucidLog_ignoreErrorsHandler');


	// handle error, including output to screen / db / file:
	$e = badResult ($errNo, array(
		'msg' => $errMsg,
		'errorclass' => $errNo,
		'filename' => $filename,
		'line' => $line
		//'vars' => $vars
	));
	
	// re-enable error handling
	//set_error_handler ($eh);
	
	return true;
}

function errorType_humanReadable ($errNo) {

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

function lucidLog_resetSessionLog () {
	$_SESSION['errors'] = array();
}

function lucidLog_pageBegin() {
	// setup measuring of time-since-start-of-session
	if (!array_key_exists('sessionStartTime',$_SESSION)) {
		$_SESSION['sessionStartTime'] = getTimeAsString();
	}
}

function lucidLog_config ($overrides=null) {
    global $lahConfig;
    if (count($lahConfig)==0) {
		$lahConfig = lucidLog_config_authorsDefaults();
    }
    if (is_array($overrides)) {
		$lahConfig = array_merge_recursive(
		  $lahConfig,
		  $overrides
		);
    }

    $lahConfig['version'] = '0.8.4';
    $lahConfig['baseDir'] = HD_ROOT.'code/libraries_rv/logAndHandler-0.8.4/';
    $lahConfig['baseURL'] = WWW_ROOT.'code/libraries_rv/logAndHandler-0.8.4/';

	// defaults: 
    $lahConfig['releaseDate'] = '2012 April 4, 17:00 CEST';
			/*
		'lah.source.js'.': '.date('r',filectime ($lahConfig['baseDir'].'lah.source.js')).', '.
		'lah.php'.': '.date ('r',filectime ($lahConfig['baseDir'].'lah.php')).', '.
		'jv.php'.': '.date ('r',filectime (HD_ROOT.'code/libraries_rv/jsonViewer-1.3.2/jv.php')).', '.
		'jv.source.js'.': '.date('r',filectime (HD_ROOT.'code/libraries_rv/jsonViewer-1.3.2/jv.source.js'));
			 */

		if (!array_key_exists('debug',$lahConfig)) {
			$lahConfig['debug'] = true;
		}
		
    return $lahConfig;
}

function lucidLog_returnLog () {
	return $_SESSION['errors'];
}


function lucidLog_config_authorsDefaults () {
	return array (
	'baseDir' => PROJECT_HD_ROOT,
	'baseURL' => PROJECT_WEB_ROOT,
	'developerVisitors' => array (
		// debug === true for any developer visitors.
		  '192.168.1.33' => array(), // array() === for future extension, overrides of settings per visitor ip.
		  '82.161.37.94' => array()
		)
	);
}

// some functions used for the self-test of lah:
function functionOne ($p) {
	$a = array('msg'=>'bad $p, expecting $p==1','$p'=>$p);
	if ($p==1) return goodResult ($p); else return badResult(E_USER_WARNING, $a);
}

function functionTwo ($p) {
	$a = array('msg'=>'bad $p, expecting $p==2','$p'=>$p);
	if ($p==2) return goodResult ($p); else return badResult(E_USER_ERROR, $a);
}


?>
