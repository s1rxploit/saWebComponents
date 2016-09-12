seductiveapps.lucidLog = sa.l = {
	about : {
		whatsThis : 'seductiveapps.lucidLog = sa.l = A better console log for web applications.',
		copyright : '(c) (r) 2013-2014 by [the owner of seductiveapps.com] <info@seductiveapps.com>',
		license : 'http://seductiveapps.com/seductiveapps/license.txt',
		noWarranty : 'NO WARRANTY EXPRESSED OR IMPLIED. USE ONLY AT YOUR OWN RISK.',
		version : '1.0.0',
		firstReleased : '2013 January 08',
		latestUpdate : '2014 February 5, 10:34 CET',
		downloadURL : 'http://seductiveapps.com'
	},
	globals : {
        available : navigator.userAgent.match(/Chrome/),
		hideShowSpeed : 777,
		corners : {
			contentBackground : 'round',
			itemBackground : 'round'
		}		
	},
	options : {}, // holds the definition of the desktop 
	settings : {}, // holds any other settings border:4px ridge #3FF;border-top:8px ridge #3FF,
	data : {raw:[]},

	init : function () {
		return false;
	
		var html = 
		'<div id="saLucidLog" style="position:absolute;z-index:41000000;width:100%;height:20%;bottom:-21%;opacity:0.01">'
			+'<div id="saLucidLog_dragBar" style="position:absolute;width:100%;top:-3px;height:3px;cursor:n-resize;z-index:41000110">&nbsp;</div>'
			+'<div id="saLucidLog_background" class="fhl_content_background" style="position:absolute;z-index:41000010">'
				+'<img src="'+sa.m.globals.urls.os+'/'+'com/ui/tools/lucidLog/images/background.jpg" class="fhl_content_background" style="position:absolute;width:100%;height:100%;"/>'
			+'</div>'
			+'<img id="saLucidLog_btnRefresh" src="'+sa.m.globals.urls.os+'/'+'com/ui/tools/lucidLog/images/refresh.png" style="position:absolute;top:2px;right:30px;width:20px;z-index:41000200"/>'
			+'<img id="saLucidLog_btnHide" src="'+sa.m.globals.urls.os+'/'+'com/ui/tools/lucidLog/images/close.png" style="position:absolute;top:2px;right:5px;width:20px;z-index:41000200"/>'
			+'<div id="saLucidLog_btnShowPHP" class="vividButton vividTheme__menu_001" style="position:absolute;left:10px;z-index:41000300"><a href="javascript:sa.l.ui.click.btnShowPHP();">PHP</a></div>'
			+'<div id="saLucidLog_btnShowJavascript" class="vividButton vividTheme__menu_001" style="position:absolute;left:250px;z-index:41000300"><a href="javascript:sa.l.ui.click.btnShowJavascript();">Javascript</a></div>'
			+'<div id="saLucidLog_btnShowLog" class="vividButton vividTheme__menu_001" style="position:absolute;left:490px;z-index:41000300"><a href="javascript:sa.l.ui.click.btnShowLog();">Console.log</a></div>'
			
			+'<div id="saLucidLog_overlay1" class="fhl_overlay" style="position:absolute;background:black;z-index:41000013;opacity:0.05;filter:Alpha(opacity=5);">&nbsp;</div>'
			+'<div id="saLucidLog_overlay2" style="position:absolute;background:black;z-index:41000014;opacity:0.05;filter:Alpha(opacity=5);">&nbsp;</div>'
			+'<div id="saLucidLog_overlay3" style="position:absolute;background:black;z-index:41000015;opacity:0.05;filter:Alpha(opacity=5);">&nbsp;</div>'
			+'<div id="saLucidLog_content_background1" class="fhl_content_background" style="position:absolute;z-index:41000017;width:100%;height:100%;background:black;opacity:0.15;filter:Alpha(opacity=15);">&nbsp;</div>'
			+'<div id="saLucidLog_content_background2" class="fhl_content_background" style="position:absolute;z-index:41000018;width:100%;height:100%;background:black;opacity:0.18;filter:Alpha(opacity=18);">&nbsp;</div>'
			+'<div id="saLucidLog_content_background3" class="fhl_content_background" style="position:absolute;z-index:41000019;width:100%;height:100%;background:black;opacity:0.20;filter:Alpha(opacity=20);">&nbsp;</div>'
			+'<div id="saLucidLog_content_holder" class="vividScrollpane vividTheme__scroll_black" style="position:absolute;z-index:42000000;">'
				+'<div id="saLucidLog_content" style="position:absolute;z-index:50000000;">'
					+'<div id="saLucidLog_page_php" class="saLucidLogTabpage" style="position:absolute;width:100%;height:100%;">'
					+'</div>'
					+'<div id="saLucidLog_page_javascript" class="saLucidLogTabpage" style="position:absolute;width:100%;height:100%;visibility:hidden;">'
						+'<div id="saLucidLog_hm_javascript" style="width:100%;height:100%;opacity:0.7">&nbsp;</div>'
					+'</div>'
					+'<div id="saLucidLog_page_log" class="saLucidLogTabpage vividScrollpane vividTheme__scroll_black" style="position:absolute;width:100%;height:100%;visibility:hidden;">'
						//+ sa.settings.log.entries.join ('<br/>')
						//+'<div id="saLucidLog_hm_log" style="width:100%;height:100%;opacity:0.7">&nbsp;</div>'
					+'</div>'
				+'</div>'
			+'</div>'
			+'</div>'
		+'</div>'
		//+'<img id="saLucidLog_btnRecord" src="'+sa.m.globals.urls.os+'/'+'com/ui/tools/lucidLog/images/btnRecord.png" style="position:absolute;bottom:4px;right:100px;height:21px;z-index:999999990;" title="show LucidLog (PHP + JS trace log)"/>'
		+'<img id="saLucidLog_btnShow" class="saBtn_simpleImg" src="'+sa.m.globals.urls.os+'/'+'com/ui/tools/lucidLog/images/btnShow.png" style="position:absolute;width:89px;height:21px;bottom:3px;right:5px;z-index:999999990;" title="show LucidLog (PHP + JS trace log)"/>';
		//+'<div id="saLucidLog_btnRecord" class="vividButton vividTheme__playpause_001" style="position:absolute;bottom:3px;right:3px;width:50px;height:50px;" onclick="sa.tracer.disabled=false;" title="record with sa.tracer">&nbsp;</div>';
		
		jQuery('body').append (html);
		if (true)
			//setTimeout (sa.m.traceFunction (function () {
				sa.vcc.init (jQuery('#saLucidLog')[0], sa.m.traceFunction(function() {sa.l.componentFullyInitialized();}));
			//}), 2000);
		else {
			sa.l.componentFullyInitialized();
		};
	},
	
	componentFullyInitialized : function(){ 

			jQuery('.fhl_overlay, .fhl_content_background').css ({borderRadius:'.5em'});
			jQuery('#saLucidLog').css ({
				bottom : 0,
				left : 3,
				height : ((jQuery(window).height() / 10 ) * 4.5),
				width : (jQuery(window).width() - 6) 
			});
			jQuery('#saLucidLog_btnRefresh').click (sa.l.ui.click.btnRefresh);
			jQuery('#saLucidLog_btnHide').click (sa.l.ui.click.btnHide);
			jQuery('#saLucidLog_btnShow').click (sa.l.ui.click.btnShow);
			jQuery(window).resize (sa.l.ui.resize);
			sa.l.tools.setupDragAndDrop_forTopBorder();
			sa.l.ui.resize();
			sa.l.php.initialize();
			//sa.l.ui.hide();
			jQuery('#saLucidLog').css({opacity:1,display:'none'});
	},
	
	log : function () {
		if (typeof sa.tracer!=='undefined') {
			var ua = sa.tracer.findUA(arguments);
			if (ua && ua.pointer) {
				var logIdx = ua.pointer.logMessages.length;
				//debugger;
				ua.pointer.logMessages[logIdx] = arguments;
			}// else debugger;
			
		} 
	},
	
	visualizeTracerData : function () {
		var r = {};
		for (var uaIdx=0; uaIdx<sa.tracer.traced.length; uaIdx++) {
			var ua = sa.tracer.userActions[uaIdx];
			
			delete ua.pointer;
			delete ua.stackLevel;
			delete ua.callIdx;
			delete ua.callJSON;
			ua.timings.startTime = '' + ua.timings.startTime;
			
			var uaJSON = sa.json.encode (ua);
			r[uaJSON] = sa.tracer.traced[uaIdx];//sa.l.cleanupTracerData (sa.tracer.traced[uaIdx]);
		};
		
		hm (r, 'sa.tracer dump', { htmlID : 'saLucidLog_hm_javascript', opacity : 0.7 });
	},
	
	cleanupTracerData : function (ua) {
		if (ua.logMessages) {
			var 
			lm = ua.logMessages,
			lmn = {};
			
			for (var i=0; i<lm.length; i++) {
				lmn[lm[i][0]] = lm[i][1][1];
			};
			ua.logMessages = lmn;
		};
		if (ua.calls) {
			for (var i=0; i<ua.calls.length; i++) {
				/*
				if (!sa.l.settings.gottaCleanup) sa.l.settings.gottaCleanup = [];
				sa.l.settings.gottaCleanup[sa.l.settings.gottaCleanup.length] = {
					ua : ua.calls[i]
				};
				*/
				sa.l.cleanupTracerData (ua.calls[i]);

			};
//			setTimeout (sa.l.processGottaCleanup, 100);
		};
		return ua;
	},
	
	processGottaCleanup : function () {
		var 
		gt = sa.l.settings.gottaCleanup.shift(),
		count = 0;
		
		while (gt && count < 100) {
			sa.l.cleanupTracerData (gt.ua);
			gt = sa.l.settings.gottaCleanup.shift();
			count++;
		};

		if (sa.l.settings.gottaCleanup.length>0) {
			setTimeout (function () {
				sa.tracer.processGottaTrace();
			}, 10);
		}
	},
	
	
	ui : {
		resize : function () {
			jQuery('#saLucidLog').css({width:jQuery(window).width()-6});
			var h = jQuery('#saLucidLog').height();
			var w = jQuery('#saLucidLog').width();
			jQuery('#saLucidLog_background').css ({ height : h, width : w });
			jQuery('#saLucidLog_overlay1').css ({ top : 1, left : 1, height : h-2, width : w-2 });
			jQuery('#saLucidLog_overlay2').css ({ top : 2, left : 2, height : h-4, width : w-4 });
			jQuery('#saLucidLog_overlay3').css ({ top : 3, left : 3, height : h-6, width : w-6 });
			jQuery('#saLucidLog_content_background1').css ({ top : 30, left : 4, height : h - 34, width : w-8 });
			jQuery('#saLucidLog_content_background2').css ({ top : 31, left : 5, height : h - 36, width : w-10 });
			jQuery('#saLucidLog_content_background3').css ({ top : 32, left : 6, height : h - 38, width : w-12 });
			if (jQuery('#saLucidLog_content_holder__container').length==1) {
				jQuery('#saLucidLog_content_holder__container').css ({ top : 30, left : 4, height : h - 54, width : w-8 });
			} else {
				jQuery('#saLucidLog_content_holder').css ({ top : 30, left : 4, height : h - 34, width : w-8 });
			};
			jQuery('#saLucidLog_content').css ({ top : 3, left : 3, height : jQuery('#saLucidLog_content_holder').height()-6, width : jQuery('#saLucidLog_content_holder').width()-6 });
			
			var jQueryhm = jQuery('#saLucidLog_hm_javascript');
			if (
				jQueryhm[0]
				&& jQueryhm[0].children[0]
				&& jQueryhm[0].children[0].children[2]			
			) sa.sp.containerSizeChanged(jQuery('#saLucidLog_hm_javascript')[0].children[0].children[2], true);
			sa.sp.containerSizeChanged (jQuery('#saLucidLog_content_holder')[0], true);
			
			jQuery('.fhl_item_content').each (function (idx,el) {
				var id = el.id.replace ('fhl_', '').replace('_content','');
				jQuery('#fhl_'+id+'_bg').css ({width : jQuery(el).width()+10});
			});
			
			jQuery('.tabsContainer').each ( sa.m.traceFunction ( function (idx) {
				jQuery(this).css ({
					height : jQuery(this).parent().height() - jQuery(this).prev().height(),
				});
			}));
			
			sa.l.php.tools.resizeWindow(sa.l.php.cmd.cmdID);
		},

		hide : function (callback) {
			jQuery('#saLucidLog').fadeOut (sa.l.globals.hideShowSpeed, callback);
		},
		
		show : function (callback) {
			jQuery('#saLucidLog').fadeIn (sa.l.globals.hideShowSpeed, callback);
		},
		
		toggleShowHide : function() {
			if (jQuery('#saLucidLog').css('display')=='none') {
				sa.l.ui.show();
			} else {
				sa.l.ui.hide();
			}
		},
		
		click : {
		// (all click handlers for this web component) :
			btnRefresh : function () {
				sa.l.redrawRawLog();
			},
			
			btnHide : function () {
				sa.l.ui.hide();
			},
			
			btnShow : function () {
				sa.tracer.disabled = true;
				sa.l.ui.show();
				sa.l.ui.resize();
				sa.l.visualizeTracerData();
			},
			
			btnShowPHP : function () {
				jQuery('#saLucidLog_page_log').fadeOut(500);
				jQuery('#saLucidLog_page_javascript').fadeOut(500);
				setTimeout (sa.m.traceFunction(function() {
					jQuery('#saLucidLog_page_php').css({display:'none',visibility:'visible'}).fadeIn(500);
				}), 510);
			},
			
			btnShowJavascript : function () {
				jQuery('#saLucidLog_page_log').fadeOut(500);
				jQuery('#saLucidLog_page_php').fadeOut(500);
				setTimeout (sa.m.traceFunction(function() {
					jQuery('#saLucidLog_page_javascript').css({display:'none',visibility:'visible'}).fadeIn(500);
				}), 510);
			},
			
			btnShowLog : function () {
				jQuery('#saLucidLog_page_javascript').fadeOut(500);
				jQuery('#saLucidLog_page_php').fadeOut(500);
				setTimeout (sa.m.traceFunction(function() {
					jQuery('#saLucidLog_page_log').html('<div id="saLucidLog_log" style="width:100%;height:100%;"></div>');
					hm (sa.settings.log, 'Console.log', { htmlID : 'saLucidLog_log', opacity :0.65 });

					jQuery('#saLucidLog_page_log').css({display:'none',visibility:'visible'}).fadeIn(500);
				}), 510);
			}
			
		} // sa.l.ui.click 
	}, // sa.l.ui
	
	tools : {
		setupDragAndDrop_forTopBorder : function () {
			// ripped with thanks from http://jsfiddle.net/gaby/Bek9L/186/ ;
			var i = 0;
			var dragging = false;
			jQuery('#saLucidLog_dragBar').mousedown(function(e){
				e.preventDefault();

				dragging = true;
				var main = jQuery('#saLucidLog');
				var ghostbar = jQuery('<div>', {
					id:'ghostbar',
					css: {
						position:'absolute',
						background : 'black',
						opacity : 0.7,
						width: main.outerWidth(),
						height : 3,
						zIndex : 99999,
						top: main.offset().top,
						left: main.offset().left
					}
				}).appendTo('body');
	
				 jQuery(window).mousemove(function(e){
					ghostbar.css("top",e.pageY+2);
					jQuery('#saLucidLog').css("height", jQuery(window).height()- e.pageY);
					sa.l.ui.resize();
				});
				
				if (document.getElementById ('iframe-content'))
					jQuery(document.getElementById ('iframe-content').contentWindow).mousemove(function(e){
						ghostbar.css("top",jQuery('#iframe-content', window.parent.document).offset().top + e.pageY+2);
						jQuery('#saLucidLog').css("height", jQuery(window).height()- ghostbar.css("top").replace('px',''));
						sa.l.ui.resize();
					});
			});

			jQuery(window).mouseup(function(e){
				if (dragging) {
					jQuery('#ghostbar').remove();
					jQuery(window).unbind('mousemove');
					if (document.getElementById ('iframe-content'))
						jQuery(document.getElementById ('iframe-content').contentWindow).unbind('mousemove');
					dragging = false;
				}
			});
		}
	} // sa.l.tools
};
