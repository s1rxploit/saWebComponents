<?php
require_once (dirname(__FILE__).'/../../../../../boot.php');
require_once (dirname(__FILE__).'/../../jsonViewer/jv.php');
require_once (dirname(__FILE__).'/../lucidLog-1.0.0.php');

$list = array();

$allErrs = $_SESSION['errors'];
//print_r ($allErrs);
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
				if ($funcContext = $_GET['funcContext']) {
					$list[$i++] = $err;
				}
			}
		}
	}
}

$list = seductiveapps_json_prepare ($list);
echo json_encode ($list);
?>
