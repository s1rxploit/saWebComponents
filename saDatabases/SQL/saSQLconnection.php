<?php
// 2012-05-16 : this is the latest incarnation of my database connection code..

require_once ($cc['site']['roles']['lib_hd'].'/adodb-5.10/adodb.inc.php'); //needs at least PHP5
require_once ($cc['site']['roles']['lib_hd'].'/adodb-5.10/drivers/adodb-mysql.inc.php'); //needs at least PHP5
//require_once (HD_ROOT.'adodb-4.992/adodb.inc.php'); //works also with PHP4
//require_once (HD_ROOT.'adodb-x.y/adodb-errorhandler.inc.php'); //routes all ADODB errors to the currently set global error handler (lib_errorHandler*.php)

global $dbConfigurations;
$dbConfigurations = array();

function dbConnection ($component='site', $debug=false, $fetchMode = ADODB_FETCH_ASSOC) {
	global $dbConfigurations;

	/* NO caching of connections yet, they may fail. 
	 * When failed sql commands can be logged and auto-retried then this becomes viable:
	if (isset($_SESSION["mb_dbConn"])) {
		$r = $_SESSION["mb_dbConn"];
	} 
	*/
	
	if (!array_key_exists($component, $dbConfigurations)) {
		return badResult (E_USER_WARNING, '.../sitewide/dbConnection.php::dbConnection(): Could not find "'.$component.'" in $dbConfigurations of '.dbConfigFilePath());
	} else {
		$dbConfig = $dbConfigurations[$component];
	
		$r = dbGetADODBconnection($dbConfig, $fetchMode, $debug);
		
		if ($r===false || !good($r)) {
			$dbConfig['DB_PASSWORD'] = '{undisclosed!}';
			return badResult (E_USER_WARNING, '.../sitewide/dbConnection.php::dbConnection(): Could not initialize database connection for "'.$component.'" with settings '.json_encode($dbConfig).' and error '.json_encode($r));
		}
		$c = result ($r);
	
		$connAttempt = 0;
		if ($dbConfig['DB_SERVER_TYPE']=='mysql') {
			// check if the link is valid
			if (is_object($c) && ($c->_connectionID===false)) {
				trigger_error ('Alert: MySQL connection invalid; '.$c->_errorMsg, E_USER_WARNING);
			}
			
			//if (!defined('SQL_ERROR_RETRY_DELAY_IN_SECONDS')) define ('SQL_ERROR_RETRY_DELAY_IN_SECONDS', 10);
			
			while (!mysql_ping()) {
				trigger_error ("Alert: MySQL connection invalid. Sleeping for ".SQL_ERROR_RETRY_DELAY_IN_SECONDS.", then re-trying.", E_USER_NOTICE);
				if ($connAttempt > 100) {
					trigger_error ("Alert: Tried to open connection 100 times, and failed. :( Exiting.", E_USER_WARNING);
				}
	
				sleep (SQL_ERROR_RETRY_DELAY_IN_SECONDS);
	
				$c->close();
				$r = dbGetADODBconnection($fetchMode);
				$c = result ($r);
				$connAttempt++;
			}
		}
		return $r;
	}
}

function dbGetADODBconnection ($dbConfig, $fetchMode, $debug) {
	$ADODB_FETCH_MODE = $fetchMode;
	$ADODB_COUNTRECS = false;
	$ADODB_CACHE_DIR = SA_SITE_HD."/cache/adodb/";
	
	if (!is_null($dbConfig) && array_key_exists('DB_SERVER_TYPE',$dbConfig)) {
		$r = ADONewConnection ($dbConfig['DB_SERVER_TYPE']); 
		$r->debug = $debug;
		if ($debug) $r->LogSQL();
		try {
			$r->connect ($dbConfig['DB_SERVER'], $dbConfig['DB_USERNAME'], $dbConfig['DB_PASSWORD'], $dbConfig['DB_DBNAME']);
			
		} catch (exception $e) {
			return badResult (E_USER_ERROR, array(
				'msg' => 'Could not connect to database.',
				'exception $e' => $e
			));
		}
		$r->SetFetchMode ($fetchMode);
		return goodResult($r);
	} else {
		return badResult (E_USER_WARNING, 'no database server config set.');
	};
}

function dbConfigFilePath () {
	$filename = 'seductiveapps.dbSettings'.(SA_DEVELOPMENT_SERVER?'.dev':'.live').'.json';
	return SA_SITE_HD.$filename;
}

function dbInitialize () {
	$configFilePath = dbConfigFilePath();
	if (!file_exists($configFilePath)) {
		return badResult (E_USER_NOTICE, '.../sitewide/dbConnection.php, dbInitialize(): config file does not exist, SQL <a href="http://phplens.com/adodb/">adoEasyConnection()</a> won\'t work now.');
	} else {
		//$er = error_reporting (0); // prevent warnings because json can't be decoded
		global $dbConfigurations;
		$dbc = json_decode (file_get_contents($configFilePath), true);
		//error_reporting($er);
		if ($dbc===false) {
			return badResult (E_USER_ERROR, '.../sitewide/dbConnection.php, dbInitialize(): config file is not valid JSON data.');
		} else {
			$dbConfigurations = $dbc;
		}
	}		
}
?>