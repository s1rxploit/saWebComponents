<?php
//require_once ('debug_functions.php');
require_once (dirname(__FILE__).'/lib_duration.php');
require_once (dirname(__FILE__).'/lib_fileSystem.php');
//require_once (dirname(__FILE__).'/lib_html.php');
//require_once (dirname(__FILE__).'/lib_svardump.php');
//require_once (dirname(__FILE__).'/rv_includes.php');

function unichr($u) {
    return mb_convert_encoding('&#' . intval($u) . ';', 'UTF-8', 'HTML-ENTITIES');
}


function fixObject (&$object)
{
  if (!is_object ($object) && gettype ($object) == 'object')
    return ($object = unserialize (serialize ($object)));
  return $object;
}


function strip_javascript($filter){
  
    // realign javascript href to onclick
    $filter = preg_replace("/href=(['\"]).*?javascript:(.*)?\\1/i", "onclick=' $2 '", $filter);
    $t = array('text'=>array($filter));
    //hm ($t, "t1");

    //remove javascript from tags
    while( preg_match("/<(.*)?javascript.*?\(.*?((?>[^()]+)|(?R)).*?\)?\)(.*)?>/i", $filter))
        $filter = preg_replace("/<(.*)?javascript.*?\(.*?((?>[^()]+)|(?R)).*?\)?\)(.*)?>/i", "<$1$3$4$5>", $filter);
    $t = array('text'=>array($filter));
    //hm ($t, "t2");
            
    // dump expressions from contibuted content
    if(0) $filter = preg_replace("/:expression\(.*?((?>[^(.*?)]+)|(?R)).*?\)\)/i", "", $filter);
    $t = array('text'=>array($filter));
    //hm ($t, "t3");

    while( preg_match("/<(.*)?:expr.*?\(.*?((?>[^()]+)|(?R)).*?\)?\)(.*)?>/i", $filter))
        $filter = preg_replace("/<(.*)?:expr.*?\(.*?((?>[^()]+)|(?R)).*?\)?\)(.*)?>/i", "<$1$3$4$5>", $filter);
    $t = array('text'=>array($filter));
    //hm ($t, "t4");
       
    // remove all on* events   
    //while( preg_match("/<(.*)?\s?on.+?=?\s?.+?(['\"]).*?\\2\s?(.*)?\>/i", $filter) )
    //   $filter = preg_replace("/<(.*)?\s?on.+?=?\s?.+?(['\"]).*?\\2\s?(.*)?\>/i", "<$1$3>", $filter);
    $t = array('text'=>array($filter));
//    hm ($t, "t5");

    return $filter;
} 

function mime_extract_rfc2822_address($string)
{
        //rfc2822 token setup
        $crlf           = "(?:\r\n)";
        $wsp            = "[\t ]";
        $text           = "[\\x01-\\x09\\x0B\\x0C\\x0E-\\x7F]";
        $quoted_pair    = "(?:\\\\$text)";
        $fws            = "(?:(?:$wsp*$crlf)?$wsp+)";
        $ctext          = "[\\x01-\\x08\\x0B\\x0C\\x0E-\\x1F" .
                          "!-'*-[\\]-\\x7F]";
        $comment        = "(\\((?:$fws?(?:$ctext|$quoted_pair|(?1)))*" .
                          "$fws?\\))";
        $cfws           = "(?:(?:$fws?$comment)*(?:(?:$fws?$comment)|$fws))";
        //$cfws           = $fws; //an alternative to comments
        $atext          = "[!#-'*+\\-\\/0-9=?A-Z\\^-~]";
        $atom           = "(?:$cfws?$atext+$cfws?)";
        $dot_atom_text  = "(?:$atext+(?:\\.$atext+)*)";
        $dot_atom       = "(?:$cfws?$dot_atom_text$cfws?)";
        $qtext          = "[\\x01-\\x08\\x0B\\x0C\\x0E-\\x1F!#-[\\]-\\x7F]";
        $qcontent       = "(?:$qtext|$quoted_pair)";
        $quoted_string  = "(?:$cfws?\"(?:$fws?$qcontent)*$fws?\"$cfws?)";
        $dtext          = "[\\x01-\\x08\\x0B\\x0C\\x0E-\\x1F!-Z\\^-\\x7F]";
        $dcontent       = "(?:$dtext|$quoted_pair)";
        $domain_literal = "(?:$cfws?\\[(?:$fws?$dcontent)*$fws?]$cfws?)";
        $domain         = "(?:$dot_atom|$domain_literal)";
        $local_part     = "(?:$dot_atom|$quoted_string)";
        $addr_spec      = "($local_part@$domain)";
        $display_name   = "(?:(?:$atom|$quoted_string)+)";
        $angle_addr     = "(?:$cfws?<$addr_spec>$cfws?)";
        $name_addr      = "(?:$display_name?$angle_addr)";
        $mailbox        = "(?:$name_addr|$addr_spec)";
        $mailbox_list   = "(?:(?:(?:(?<=:)|,)$mailbox)+)";
        $group          = "(?:$display_name:(?:$mailbox_list|$cfws)?;$cfws?)";
        $address        = "(?:$mailbox|$group)";
        $address_list   = "(?:(?:^|,)$address)+";

        //output length of string (just so you see how f**king long it is)
        echo(strlen($address_list) . " ");

        //apply expression
        preg_match_all("/^$address_list$/", $string, $array, PREG_SET_ORDER);

        return $array;
};

/*
 negotiateOptions: function () {
      var r = {};
      for (var i = 0; i < arguments.length; i++) {
        var a = arguments[i];
        for (k in a) {
          if (typeof a[k] == 'object') {
            r[k] = hms.tools.negotiateOptions(r[k], a[k]);
          } else {
            r[k] = a[k];
          }
        }
      }
      return r;
    },
*/

function negotiateOptions () {
	//print_r (debug_backtrace());
  $params = func_get_args ();
    
  $r = array();
    
  foreach ($params as $paramIdx => $param) {
		if ((array)$param!==$param) return badResult (E_USER_WARNING, array(
			'function' => '/code/sitewide_rv/php_expansion_packs.php::negotiateOptions',
			'msg' => 'Param with idx '.$paramIdx.' is not an array.',
			'$paramIdx' => $paramIdx,
			'$param' => $param
		));
		
		foreach ($param as $k=>$v) {
		
		  if (is_array($v)) {
			if (!array_key_exists($k,$r) || !is_array($r[$k])) $r[$k] = array();
			$r[$k] = negotiateOptions ($r[$k], $v);
		  } else {
			$r[$k] = $v;
		  }

		}
	}
	return $r;
}
?>
