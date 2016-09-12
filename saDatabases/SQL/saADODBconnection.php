<?php
// depracated since 2012-05-16
// used again in 2015-07 for /apps/renesList 

require_once (saConfig__location('lib', 'hd').'/adodb-5.19/adodb.inc.php'); //needs at least PHP5
require_once (saConfig__location('lib', 'hd').'/adodb-5.19/drivers/adodb-mysql.inc.php'); //needs at least PHP5
//require_once (HD_ROOT.'adodb-4.992/adodb.inc.php'); //works also with PHP4
//require_once (HD_ROOT.'adodb-x.y/adodb-errorhandler.inc.php'); //routes all ADODB errors to the currently set global error handler (lib_errorHandler*.php)

global $dbServerConfig;
$dbServerConfig = array();

function setADODBconnectionParams ($pathToDBconfigFile, $newPartialServerConfig) {
	global $dbServerConfig;
	$dbServerConfig = negotiateOptions (
	  $dbServerConfig,
	  $newPartialServerConfig
	);
	
	$dbConn = adoEasyConnection();

	unset ($newPartialServerConfig['DB_USERNAME']); // dont leak passwords to strangers
	unset ($newPartialServerConfig['DB_PASSWORD']); // dont leak passwords to strangers
	//trigger_error ('Database config used from '.$pathToDBconfigFile.' : '.json_encode($newPartialServerConfig), E_USER_NOTICE);
	
}

function getADODBconnection ($fetchMode, $debug) {
	$ADODB_FETCH_MODE = $fetchMode;
	$ADODB_COUNTRECS = false;
	$ADODB_CACHE_DIR = saConfig__location('siteFramework', 'hd').'/siteCache/adodb/';
	
	
	global $dbServerConfig;
	if (!is_null($dbServerConfig) && array_key_exists('DB_SERVER_TYPE',$dbServerConfig)) {
		$r = ADONewConnection ($dbServerConfig['DB_SERVER_TYPE']); 
		$r->debug = $debug;
		if ($debug) $r->LogSQL();
		if (!$r->connect (
			$dbServerConfig['DB_SERVER'], 
			$dbServerConfig['DB_USERNAME'], 
			$dbServerConfig['DB_PASSWORD'], 
			$dbServerConfig['DB_DBNAME']
		)) return false;
		$r->SetFetchMode ($fetchMode);
		return goodResult($r);
	} else {
		return badResult (E_USER_WARNING, 'no database server config set.');
	};
}

function adoEasyConnection ($debug=false, $fetchMode = ADODB_FETCH_ASSOC) {
	/* NO caching of connections yet, they may fail. 
	 * When failed sql commands can be logged and auto-retried then this becomes viable:
	if (isset($_SESSION["mb_dbConn"])) {
		$r = $_SESSION["mb_dbConn"];
	} 
	*/

	$r = getADODBconnection($fetchMode, $debug);
	if ($r===false || !good($r)) return badResult (E_USER_WARNING, array(
		'msg' => 'Could not initialize DB connection.',
		'$r' => $r
	));
	$r = result ($r);

	global $dbServerConfig;
	$connAttempt = 0;
	if ($dbServerConfig['DB_SERVER_TYPE']=='mysql') {
		// check if the link is valid
		if (is_object($r) && ($r->_connectionID===false)) {
			trigger_error ('Alert: MySQL connection invalid; '.$r->_errorMsg, E_USER_WARNING);
		}
		
		//if (!defined('SQL_ERROR_RETRY_DELAY_IN_SECONDS')) define ('SQL_ERROR_RETRY_DELAY_IN_SECONDS', 10);
		
		while (!mysql_ping()) {
			trigger_error ("Alert: MySQL connection invalid. Sleeping for ".SQL_ERROR_RETRY_DELAY_IN_SECONDS.", then re-trying.", E_USER_NOTICE);
			if ($connAttempt > 100) {
				trigger_error ("Alert: Tried to open connection 100 times, and failed. :( Exiting.", E_USER_WARNING);
			}

			sleep (SQL_ERROR_RETRY_DELAY_IN_SECONDS);

			$r->close();
			$r = getADODBconnection($fetchMode);
			$connAttempt++;
		}
	}
	return $r;
}

?>
