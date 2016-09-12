<?php
// editor human's status : sleeping.. had a few rough nights already this week..
// status of these functions : "barely usable, but showing promise".
function filesystempathInsideFilesystempath_encode ($filesystempath=null) {
	$fsp = $filesystempath;
	$r = $fsp;

	// WINDOWS OS
	// C:\
	$r = str_replace(':\\', '---', $r);
	$r = str_replace('\\', '--', $r);

	// UNIX OSes
	// /var/log
	$r = str_replace('/', '_', $r);
		
	return $r;
}

function filesystempathInsideFilesystempath_decode ($filesystempath=null) {
	$fsp = $filesystempath;
	$r = $fsp;

	// WINDOWS OS
	// C:\
	$r = str_replace('---', ':\\', $r);
	$r = str_replace('---', '\\', $r);

	// UNIX OSes
	// /var/log
	$r = str_replace('_', '/', $r);



	return $r;
}


?>
