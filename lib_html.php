<?php
require_once ("lib_svardump.php");

function strBackTrace ($level=0) {
	$tr = debug_backtrace();

	$pre = "";
	for ($i=0; $i<$level; $i++) $pre.="\t";

	$str = "";
	foreach ($tr as $eventNo => $event /*array record of varying contents*/) {
		if ($eventNo > 1) {
			//skip the first two events, they are part of the error reporting system itself.
			if (isset ($event["file"])) {
				$str.= $pre."-= ".$event["file"].":".$event["line"]." =-\n";
			}
			if (isset ($event["function"])) {
				$str.= $pre.$event["function"]."(";
				if (isset ($event["args"])) {
					foreach ($event["args"] as $argNo => $arg) {
						$str.= str_replace ("\n", "", svar_dump($arg));
						if ($argNo < count($event["args"])-1) $str.=", ";
					}	
				}
				$str.= ");\n";
			}
		}
	}
	return $str;
}

function htmlBackTraceTable ($level=0) {
	$tr = debug_backtrace();
	//$tr = array (1 => array ("file"=>"test", "function"=>"test", "args"=>""));

	$pre = "";
	for ($i=0; $i<=$level; $i++) $pre.="\t";

	$html = "$pre<table class='backTrace'>\n";
	foreach ($tr as $eventNo => $event ) {//array record of varying contents
		if ($eventNo > 1) {
			//skip the first two events, they are part of the error reporting system itself.
			$html.= "$pre\t<tr><td class='btFunction'>";
			if (strpos($event["file"], "adodb")==0) { //removes clutter
				if (isset ($event["file"]) ) {
					$html.= "<span class='btFile'>file ".$event["file"].":".$event["line"]."</span><br/>";
				}
				if (isset ($event["function"])) {
					$html.= "<span class='btFunction'>function ".$event["function"]." (<pre>";
					if (isset ($event["args"])) {
						foreach ($event["args"] as $argNo => $arg) {
							//$html.= "<pre>".svar_dump($arg)."</pre>";
							$html.= svar_dump($arg);
							if ($argNo < count($event["args"])-1) $html.=", \n";
						}	
					}
					$html.= "</pre>);</span><br/>\n";
				}
				$html.="$pre\t</td></tr>\n";
			}
		}
	}
	$html.= "$pre</table>";
	return $html;
}


function htmlSetOutputFile ($file) {
	$_SESSION["mb_htmlOutDest"] = $file;
	/*
	if (file_exists($file)) {
		$x = "rm $file";
		exec ($x, $outp);
	}
	 */
}

function htmlOut ($content, $level = 0, $htmlDest="") {
	if (isset ($_SESSION["mb_htmlLevel"])) {
		$globalLevel = $_SESSION["mb_htmlLevel"];
	} else {
		$globalLevel = 0;
	}
	$level = $level + $globalLevel;
	$_SESSION["mb_htmlLastLevel"] = $level;
	
	$r = "";
	for ($i=0; $i<$level; $i++) $r .= "\t";
	$r = $r.str_replace ("\n", "\n".$r, $content)."\n";
	//$r .= $content."\n";

	if (isset ($_SESSION["mb_htmlOutDest"]) && (!is_null($_SESSION["mb_htmlOutDest"]))) {
		$f = fopen ($_SESSION["mb_htmlOutDest"], "a");
		fwrite ($f, $r);
		fclose ($f);
	} else if (is_string($htmlDest) && ($htmlDest!="")) {
		$f = fopen ($htmlDest, "a");
		fwrite ($f, $r);
		fclose ($f);
	} else {
		echo $r;
	}
}

function htmlGetLevel () {
	if (isset ($_SESSION["mb_htmlLevel"])) {
		return $_SESSION["mb_htmlLevel"];
	} else {
		return 0;
	}
}

function htmlSetLevel ($level =0) {
$_SESSION["mb_htmlLevel"] = $level;
}

function htmlOffsetLevel ($offset = 0) {
$_SESSION["mb_htmlLevel"] = $_SESSION["mb_htmlLevel"] + $offset;
}

function fileContent2HTML ($contentFilename) {
	$result = "";
	$content = File ($contentFilename);

	$no = 0;

	while (list ($line_num, $line) = each ($content)) {
		if ($line != "") {
			$no++;
			//$line = htmlEncodeEntities ($line);
			$result .= "$line";
			if ($no>1) $result.="\n";
		}
	}
	return $result;
}

function htmlDump ($vInput, $title = null) {
	$sInput = svar_dump ($vInput);
	$r =  "<table class='mbDebug' width='100%' cellspacing='0' cellpadding='0' border='1'>\n";
	$r.=  "\t<tr><td class='mbDebugHeader'>$title</td></tr>\n";
	$r.=  "\t<tr><td class='mbDebugContent'><pre>$sInput</pre></td></tr>\n";
	$r.=  "</table>";
	htmlOut ($r);
}

function htmlDumpReturn ($vInput, $title = null) {
	$sInput = svar_dump ($vInput);
	$r =  "<table class='mbDebug' width='100%' cellspacing='0' cellpadding='0' border='1'>\n";
	$r.=  "\t<tr><td class='mbDebugHeader'>$title</td></tr>\n";
	$r.=  "\t<tr><td class='mbDebugContent'><pre>$sInput</pre></td></tr>\n";
	$r.=  "</table>";
	return $r;
}
function html_js_blockBegin () {
	htmlOut ("<SCRIPT LANGUAGE='JavaScript' TYPE='text/javascript'><!-- ");
}

function html_js_blockEnd () {
	htmlOut (" --></SCRIPT>");
}

function htmlEncodeEntities ($content) {
	$r = $content;
	$r = str_replace("#", "&#35;", $r);
	$r = str_replace("$", "&#36;", $r);
	$r = str_replace("%", "&#37;", $r);
	$r = str_replace("+", "&#43;", $r); 
	$r = str_replace("�", "&iexcl;", $r); //inverted exclamation mark 
	$r = str_replace("�", "&cent;", $r); //cent sign 
	$r = str_replace("�", "&pound;", $r); //pound sign 
	$r = str_replace("�", "&curren;", $r); //currency sign 
	$r = str_replace("�", "&yen;", $r); //yen sign = yuan sign 
	$r = str_replace("�", "&brvbar;", $r); //broken bar = broken vertical bar 
	$r = str_replace("�", "&sect;", $r); //section sign 
	$r = str_replace("�", "&uml;", $r); //diaeresis = spacing diaeresis 
	$r = str_replace("�", "&copy;", $r); //copyright sign 
	$r = str_replace("�", "&ordf;", $r); //feminine ordinal indicator 
	$r = str_replace("�", "&laquo;", $r); //left-pointing double angle quotation mark = left pointing guillemet 
	$r = str_replace("�", "&not;", $r); //not sign 
	$r = str_replace("�", "&shy;", $r); //soft hyphen = discretionary hyphen 
	$r = str_replace("�", "&reg;", $r); //registered sign = registered trade mark sign 
	$r = str_replace("�", "&macr;", $r); //macron = spacing macron = overline = APL overbar 
	$r = str_replace("�", "&deg;", $r); //degree sign 
	$r = str_replace("�", "&plusmn;", $r); //plus-minus sign = plus-or-minus sign 
	$r = str_replace("�", "&sup2;", $r); //superscript two = superscript digit two = squared 
	$r = str_replace("�", "&sup3;", $r); //superscript three = superscript digit three = cubed 
	$r = str_replace("�", "&acute;", $r); //acute accent = spacing acute 
	$r = str_replace("�", "&micro;", $r); //micro sign 
	$r = str_replace("�", "&para;", $r); //pilcrow sign = paragraph sign 
	$r = str_replace("�", "&middot;", $r); //middle dot = Georgian comma = Greek middle dot 
	$r = str_replace("�", "&cedil;", $r); //cedilla = spacing cedilla 
	$r = str_replace("�", "&sup1;", $r); //superscript one = superscript digit one 
	$r = str_replace("�", "&ordm;", $r); //masculine ordinal indicator 
	$r = str_replace("�", "&raquo;", $r); //right-pointing double angle quotation mark = right pointing guillemet 
	$r = str_replace("�", "&frac14;", $r); //vulgar fraction one quarter = fraction one quarter 
	$r = str_replace("�", "&frac12;", $r); //vulgar fraction one half = fraction one half 
	$r = str_replace("�", "&frac34;", $r); //vulgar fraction three quarters = fraction three quarters 
	$r = str_replace("�", "&iquest;", $r); //inverted question mark = turned question mark 
	$r = str_replace("�", "&Agrave;", $r); //Latin capital letter A with grave = Latin capital letter A grave 
	$r = str_replace("�", "&Aacute;", $r); //Latin capital letter A with acute 
	$r = str_replace("�", "&Acirc;", $r); //Latin capital letter A with circumflex 
	$r = str_replace("�", "&Atilde;", $r); //Latin capital letter A with tilde 
	$r = str_replace("�", "&Auml;", $r); //Latin capital letter A with diaeresis 
	$r = str_replace("�", "&Aring;", $r); //Latin capital letter A with ring above = Latin capital letter A ring 
	$r = str_replace("�", "&AElig;", $r); //Latin capital letter AE = Latin capital ligature AE 
	$r = str_replace("�", "&Ccedil;", $r); //Latin capital letter C with cedilla 
	$r = str_replace("�", "&Egrave;", $r); //Latin capital letter E with grave 
	$r = str_replace("�", "&Eacute;", $r); //Latin capital letter E with acute 
	$r = str_replace("�", "&Ecirc;", $r); //Latin capital letter E with circumflex 
	$r = str_replace("�", "&Euml;", $r); //Latin capital letter E with diaeresis 
	$r = str_replace("�", "&Igrave;", $r); //Latin capital letter I with grave 
	$r = str_replace("�", "&Iacute;", $r); //Latin capital letter I with acute 
	$r = str_replace("�", "&Icirc;", $r); //Latin capital letter I with circumflex 
	$r = str_replace("�", "&Iuml;", $r); //Latin capital letter I with diaeresis 
	$r = str_replace("�", "&ETH;", $r); //Latin capital letter ETH 
	$r = str_replace("�", "&Ntilde;", $r); //Latin capital letter N with tilde 
	$r = str_replace("�", "&Ograve;", $r); //Latin capital letter O with grave 
	$r = str_replace("�", "&Oacute;", $r); //Latin capital letter O with acute 
	$r = str_replace("�", "&Ocirc;", $r); //Latin capital letter O with circumflex 
	$r = str_replace("�", "&Otilde;", $r); //Latin capital letter O with tilde 
	$r = str_replace("�", "&Ouml;", $r); //Latin capital letter O with diaeresis 
	$r = str_replace("�", "&times;", $r); //multiplication sign 
	$r = str_replace("�", "&Oslash;", $r); //Latin capital letter O with stroke = Latin capital letter O slash 
	$r = str_replace("�", "&Ugrave;", $r); //Latin capital letter U with grave 
	$r = str_replace("�", "&Uacute;", $r); //Latin capital letter U with acute 
	$r = str_replace("�", "&Ucirc;", $r); //Latin capital letter U with circumflex 
	$r = str_replace("�", "&Uuml;", $r); //Latin capital letter U with diaeresis 
	$r = str_replace("�", "&Yacute;", $r); //Latin capital letter Y with acute 
	$r = str_replace("�", "&THORN;", $r); //Latin capital letter THORN 
	$r = str_replace("�", "&szlig;", $r); //Latin small letter sharp s = ess-zed 
	$r = str_replace("�", "&agrave;", $r); //Latin small letter a with grave = Latin small letter a grave 
	$r = str_replace("�", "&aacute;", $r); //Latin small letter a with acute 
	$r = str_replace("�", "&acirc;", $r); //Latin small letter a with circumflex 
	$r = str_replace("�", "&atilde;", $r); //Latin small letter a with tilde 
	$r = str_replace("�", "&auml;", $r); //Latin small letter a with diaeresis 
	$r = str_replace("�", "&aring;", $r); //Latin small letter a with ring above = Latin small letter a ring 
	$r = str_replace("�", "&aelig;", $r); //Latin small letter ae = Latin small ligature ae 
	$r = str_replace("�", "&ccedil;", $r); //Latin small letter c with cedilla 
	$r = str_replace("�", "&egrave;", $r); //Latin small letter e with grave 
	$r = str_replace("�", "&eacute;", $r); //Latin small letter e with acute 
	$r = str_replace("�", "&ecirc;", $r); //Latin small letter e with circumflex 
	$r = str_replace("�", "&euml;", $r); //Latin small letter e with diaeresis 
	$r = str_replace("�", "&igrave;", $r); //Latin small letter i with grave 
	$r = str_replace("�", "&iacute;", $r); //Latin small letter i with acute 
	$r = str_replace("�", "&icirc;", $r); //Latin small letter i with circumflex 
	$r = str_replace("�", "&iuml;", $r); //Latin small letter i with diaeresis 
	$r = str_replace("�", "&eth;", $r); //Latin small letter eth 
	$r = str_replace("�", "&ntilde;", $r); //Latin small letter n with tilde 
	$r = str_replace("�", "&ograve;", $r); //Latin small letter o with grave 
	$r = str_replace("�", "&oacute;", $r); //Latin small letter o with acute 
	$r = str_replace("�", "&ocirc;", $r); //Latin small letter o with circumflex 
	$r = str_replace("�", "&otilde;", $r); //Latin small letter o with tilde 
	$r = str_replace("�", "&ouml;", $r); //Latin small letter o with diaeresis 
	$r = str_replace("�", "&divide;", $r); //division sign 
	$r = str_replace("�", "&oslash;", $r); //Latin small letter o with stroke = Latin small letter o slash 
	$r = str_replace("�", "&ugrave;", $r); //Latin small letter u with grave 
	$r = str_replace("�", "&uacute;", $r); //Latin small letter u with acute 
	$r = str_replace("�", "&ucirc;", $r); //Latin small letter u with circumflex 
	$r = str_replace("�", "&uuml;", $r); //Latin small letter u with diaeresis 
	$r = str_replace("�", "&yacute;", $r); //Latin small letter y with acute 
	$r = str_replace("�", "&thorn;", $r); //Latin small letter thorn 
	$r = str_replace("�", "&yuml;", $r); //Latin small letter y with diaeresis 
	return $r;
}
?>
