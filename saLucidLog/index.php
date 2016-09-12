<?php
	require_once (dirname(__FILE__).'/../../../../boot.php');
?>
<html>
	<head>
		<title>lucidLog - a better console log for web developers</title>
		<link link type="text/css" rel="StyleSheet" media="screen" href="<?php echo SA_SITE_WEB?>content.css"/>
		<link type="text/css" rel="StyleSheet" media="screen" href="<?php echo SA_WEB?>/content.css"/>
		<link type="text/css" rel="StyleSheet" media="screen" href="<?php echo SA_WEB?>/get_css.php?want=all"/>
		<!--
		<script type="text/javascript" src="<?php echo SA_WEB?>/get_javascript.php?want=all"></script>
		<script type="text/javascript">
			var hlt /*lucidLogTest*/ = {
				startApp : function () {
					seductiveapps.logLevel = 1000;
					seductiveapps.lucidLog.init();
				}
			};
		</script>
		--><!--onload="hlt.startApp();"-->
	</head>
	<body  style="padding:0px;margin:0px;overflow:hidden">
		<h1>lucidLog - a better console log for web developers</h1>
		
		<p>
			lucidLog currently only works in Chrome, due to the new HTML5 "strict" restrictions on javascript engines (in particular the arguments.callee.caller functionality).
		</p>
		
		<p>Use the button in the far lower right corner to view what lucidLog has to offer.</p>
	</body>
</html>