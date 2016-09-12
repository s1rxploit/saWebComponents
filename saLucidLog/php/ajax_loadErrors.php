<?php
require_once (dirname(__FILE__).'/../../../../../boot.php');
require_once (dirname(__FILE__).'/../../jsonViewer/jv.php');
require_once (dirname(__FILE__).'/../lucidLog-1.0.0.php');

$list = array();

$allErrs = $_SESSION['errors'];
//var_dump ($allErrs);
$errsCounts = array();
$errsStatus = '';
$i=0;
$contextNeeded = str_replace ('\\\\','\\',$_GET['context']);
$contextNeeded = str_replace ('\\"', '"', $contextNeeded);
foreach ($allErrs as $context=>&$errs) {
	if ($context==$contextNeeded) {
		foreach ($errs as $index=>$errRec) {
			foreach ($errRec as $funcContext=>$err) {
				$et = $err['phpErrorType'];
				$ec = $err['phpErrorClass'];
				//print_r ($err);
				//unset ($err['backtrace']);
				//unset ($err['globals']);
				//unset ($err['error']['vars']);
				$list[$funcContext] = $err;
			}
		}
	}
}
//print_r ($list);
//ini_set ('xdebug.max_nesting_level',100);
$list = seductiveapps_json_prepare ($list);
echo json_encode ($list);
?>
