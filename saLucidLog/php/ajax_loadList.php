<?php
session_start();

$list = array();

$allErrs = $_SESSION['errors'];
$errsCounts = array();
$errsStatus = array();
$errsHighestSeverity = array();
$errsFirstOccurrenceSession = array();
$errsFirstOccurrenceLoading = array();
foreach ($allErrs as $context=>&$errs) {
	$listItem = array();
	foreach ($errs as $index=>&$errRec) {
		foreach ($errRec as $title=>&$err) {
			//print_r ($title);
			//print_r($err);
			$et = $err['phpErrorType'];
			$ec = $err['phpErrorClass'];
			if (!array_key_exists($context,$errsFirstOccurrenceSession)) $errsFirstOccurrenceSession[$context]=$err['timeInSecondsSinceStartOfSession'];
			//if ($errsFirstOccurrenceLoading[$context]=='')take last:
			 $errsFirstOccurrenceLoading[$context]=$err['timeInSecondsSinceStartOfLoading'];
			if (!array_key_exists($context,$errsCounts)) {
				$errsCounts[$context] = array();
			}
			if (!array_key_exists($et,$errsCounts[$context])) {
				$errsCounts[$context][$et] = 0;
			}
			$errsCounts[$context][$et]++;
		}
	}
		
	ksort ($errsCounts[$context]);
	foreach ($errsCounts[$context] as $et => $cnt) {
		if (!array_key_exists($context,$errsStatus)) $errsStatus[$context]='';
		if ($errsStatus[$context]!='') $errsStatus[$context].=', ';
		$errsStatus[$context] .= $cnt.' '.$et. ( $cnt>1 ? 's' : '');
		
		if (!array_key_exists($context, $errsHighestSeverity)) $errsHighestSeverity[$context] = '';	
		$errsHighestSeverity[$context] = getHighestSeverity ($errsHighestSeverity[$context], $et);
	}
 
	$list[$context] = array (
		'errsCounts' => $errsCounts[$context],
		'errsStatus' => $errsStatus[$context],
		'errsHighestSeverity' => $errsHighestSeverity[$context],
		'timeInSecondsSinceStartOfSession' => $errsFirstOccurrenceSession[$context],
		'timeInSecondsSinceStartOfLoading' => $errsFirstOccurrenceLoading[$context]
	);
}

echo json_encode ($list);

function getHighestSeverity ($currentHighest, $et) {
	// in order of severity:
	$notices = array('User Notice', 'Notice', 'Recoverable');
	$depracated = array('Strict', 'Depracated','User-level Depracated');
	$warnings = array ('User Warning' , 'Warning', 'Core Warning', 'Compile Warning');
	$errors = array ('User Error', 'Error');
	$fatalErrors = array ('Parsing Error');

	if (
		array_search($et, $notices)!==false &&
		(
			$currentHighest=='' ||
			array_search($currentHighest, $notices)!==false 
		)
	) return $et;

	if (
		array_search($et, $depracated)!==false &&
		(
			$currentHighest=='' ||
			array_search($currentHighest, $notices)!==false ||
			array_search($currentHighest, $depracated)!==false
		)
	) return $et;

	if (
		array_search($et, $warnings)!==false &&
		(
			$currentHighest=='' ||
			array_search($currentHighest, $notices)!==false ||
			array_search($currentHighest, $depracated)!==false ||
			array_search($currentHighest, $warnings)!==false
		)
	) return $et;
	
	if (
		array_search($et, $errors)!==false &&
		(
			$currentHighest=='' ||
			array_search($currentHighest, $notices)!==false ||
			array_search($currentHighest, $depracated)!==false ||
			array_search($currentHighest, $warnings)!==false ||
			array_search($currentHighest, $errors)!==false
		)
	) return $et;

	if (
		array_search($et, $fatalErrors)!==false &&
		(
			$currentHighest=='' ||
			array_search($currentHighest, $notices)!==false ||
			array_search($currentHighest, $depracated)!==false ||
			array_search($currentHighest, $warnings)!==false ||
			array_search($currentHighest, $errors)!==false ||
			array_search($currentHighest, $fatalErrors)!==false
		)
	) return $et;
	
	return $currentHighest;
}
?>
