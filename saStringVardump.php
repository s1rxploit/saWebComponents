<?php

function svar_dump_html ($vInput, $iLevel = 1, $name='') {
    $r = svar_dump($vInput, $iLevel, $name);
    $r = str_replace ("\r\n", '<br/>', $r);
    return $r;
}

function svar_dump($vInput, $iLevel = 1, $name='') {
	$sReturn = $name;

	$sIndentExt = "";
	for ($i = 1; $i < $iLevel; $i++) {
		$sIndentExt .= "\t";
	}

	if (is_int($vInput)) {
		$sReturn = "int(".intval($vInput).")\r\n";
	} elseif (is_float($vInput)) {
		$sReturn = "float(".doubleval($vInput).")\r\n";
	} elseif (is_string($vInput)) {
		$sReturn = "string(";
		$sReturn.= strlen($vInput);
		$sReturn.= ") \"";
		$sReturn.= htmlentities($vInput);
		$sReturn.= "\"\r\n";
	} elseif (is_bool($vInput)) {
		$sReturn = "bool(";
		$sReturn.= ($vInput) ? "true" : "false";
		$sReturn.= ")\r\n";
	} elseif (is_null($vInput)) {
		$sReturn = "null\r\n";
	} elseif (is_resource($vInput)) {
		$sReturn = 'resource ('.get_resource_type($vInput).")\r\n";
	} elseif (is_array($vInput) or is_object($vInput)) {
		if (is_array ($vInput)) {
			$sReturn = "array(".count($vInput).") {\r\n";
		} elseif (is_object ($vInput)) {
			$className = get_class($vInput);
			//$sReturn = "object($className) {\r\n";
			$sReturn = "object(";
			$first = true;
			while (($className!="object") && ($className!="") ) {
				if (!$first) $sReturn.=", ";
				$first=false;
				$sReturn.= $className;
				$className = get_parent_class ($className);
			}
			$sReturn.= ") {\r\n";
		}

		reset($vInput);

		while (list($vKey, $vVal) = each($vInput)) {
			$sReturn.= $sIndentExt."[";
			$sReturn.= (is_int($vKey)) ? "" : "\"";
			$sReturn.= $vKey;
			$sReturn.= (is_int($vKey)) ? "" : "\"";
			$sReturn.= "]=>";

			$sReturn.= svar_dump($vVal, ($iLevel + 1));
		}

		$sIndent = "";
		for ($i = 1; $i < $iLevel-1; $i++) {
			$sIndent .= "\t";
		}
		$sReturn .= $sIndent."}\r\n";
	} else {
		//fixObject ($vInput);
		//$sReturn = $sIndentExt.$vInput;
	}
return $sReturn;
}

function escapeDump ($var) {
	$result = svar_dump ($var);
	if ($result[strlen($result)-1]=="\r\n") $result=substr($result,0,strLen($result)-1);
	$result = str_replace ("\r\n", chr(250), $result);
	return $result;
}
?>
