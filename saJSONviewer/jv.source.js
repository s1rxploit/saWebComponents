seductiveapps.hms = seductiveapps.jsonViewer = {
	about : {
		whatsThis : 'hm() and sa.hms = sa.jsonViewer = a way to send large recursive data objects to the browser from PHP and view them in a collapsed-expansible view with many bells and whistles.',
		copyright : '(c) (r) 2010-2013 by [the owner of seductiveapps.com] <info@seductiveapps.com>',
		license : 'http://seductiveapps.com/seductiveapps/license.txt',
		noWarranty : 'NO WARRANTY EXPRESSED OR IMPLIED. USE ONLY AT YOUR OWN RISK.',
		version: '1.6.6',
		dependencies: {
			'jQuery.com': 'version>=1.4'
		},
		firstReleased : '2010',
		lastUpdated : 'Feb 15 2014, 03:15 CET',
		knownBugs : {
			0 : "Not too many I hope. Regardless, work on this component continues in the next few days."
		},
		downloadURL : 'http://seductiveapps.com/'
	},

	options: {
		htmlYTR: '<span class="hmYTR">Have yet to render this!</span>',
		current: {
			debug: false,
			showBuildingMsg: false,
			themes: {},
			themeChoices: {},
			activeThemes: {},
			theme: {}
		},
		events : {
			byCmd : {}
		},
		contributors: {},
		authorsDefaults: {
			themes: sa.colorGradients.themes,
			themeChoices: {
				hmDefault: 'saColorgradientScheme_navy',
				trace: 'saColorgradientSchemeYellow_forTrace',
				json : 'saColorgradientSchemeGreen',
				error: 'saColorgradientSchemeRed2',
				warning: 'saColorgradientSchemeRed',
				notice: 'saColorgradientSchemeGreen2'
			}
		}
	},
	settings : {
		scheduledToProcess : [],
		cs: { //current settings, but not really options. more like private vars.
			debugID: 1,
			path: '',
			level: 0,
			htmlNode: {},
			currentOverrides: {},
			cmds: {},
			pvl: {},
			dataPointers : {},
			pvCmds : {}
		}
	},
	globals : {
		showTraceSpeed : 1000,
		hideProgressbarSpeed : 1000,
		sourceBeautifiers : ['php', 'htmlmixed', 'xml', 'javascript', 'css', 'clike'],
		sourceBeautifierThemes : {
			definitions : {
				php : 'tomorrow-night-bright',
				htmlmixed : 'default',
				xml : 'googlecode',
				javascript : 'tomorrow-night-blue',
				css : 'brown_paper',
				clike : 'pojoaque'				
			},
			all : {
				arta: {}, ascetic: {}, 	brown_paper: {}, dark: {}, 	default: {}, docco: {}, far: {}, foundation: {}, 
				github: {}, googlecode: {}, idea: {}, ir_black: {}, magula: {}, 'mono-blue': {}, 	monokai: {}, 'monokai_sublime': {}, 
				obsidian: {}, pojoaque: {}, railscasts: {}, rainbow: {}, 'school_book': {}, 'solarized_dark': {}, 'solarized_light': {}, 
				sunburst: {}, 'tomorrow-night-blue': {}, 'tomorrow-night-bright': {}, 'tomorrow-night-eighties': {}, 'tomorrow-night': {}, 
				tomorrow: {}, vs: {}, xcode: {}, zenburn: {}
			}
		},
		cssGeneration: {
			css: '',
			level: 'tbody>tr>td>table',
			add: {
				0: '',
				1: 'tbody>tr>td>div>div',
				2: 'tbody>tr>td>div>div>a',
				3: 'tbody>tr>td>div>div>table>tbody>tr>td>span',
				4: 'tbody>tr>td>div>div>table>tbody>tr>td>span>a'
			},
		}
	},
	
	destroy : function (cmdID) {
		jQuery('#'+cmdID).innerHTML = '';
	},

	processWhenReady : function (cmd) {
		var pIdx = sa.hms.settings.scheduledToProcess.length;
		sa.hms.settings.scheduledToProcess[pIdx] = cmd;
	},

	startProcessing : function () {
		for (var pIdx in sa.hms.settings.scheduledToProcess) {
			sa.hms.process (sa.hms.settings.scheduledToProcess[pIdx]);
		}
	},

	process: function (cmd) {
		
		if (!sa.hms.initialized) {
			// do global initialization for all jsonViewers on the page
			if (!sa.hms.settings.cs.cssNode) {
				if (document.createStyleSheet) {
					var stilo = document.createStyleSheet();
				} else {
					var stilo = document.createElement('style');
					stilo.className = 'jsonViewer_cssFromJS';
					stilo.setAttribute ('type', 'text/css');
					document.getElementsByTagName('head')[0].appendChild(stilo);
				};
				sa.hms.settings.cs.cssNode = stilo;
			}
			sa.hms.initialized = true;
		};

		var mainStyle = {};
		if (cmd.options) {
			if (cmd.options.height) mainStyle.height = cmd.options.height;
			if (cmd.options.width) mainStyle.width = cmd.options.width;
			if (cmd.options.opacity) mainStyle.opacity = cmd.options.opacity;
		};
		jQuery('#'+cmd.id).css (mainStyle);

		cmd.byteSize = {
			transportData: 0,
			transportTrace: 0,
			html: 0,
			css: 0
		};
		cmd.waits = {}; // used to stall execution of 1 thread, when it has to wait for another thread to complete.
		if (typeof cmd.options=='string') cmd.options = eval ('('+cmd.options+')');


		sa.hms.settings.cs.cmds[cmd.id] = cmd;
		
		if (cmd.hmd) {
		// called from javascript
		sa.hms.tools.waitForParsingDone(cmd);
		} else {
		// called from server side language

			var e = document.getElementById(cmd.id + '_preInitStatus');
			if (e) e.style.display = 'block';
			e = document.getElementById(cmd.id + '_dataSize');
			if (e) e.style.display = 'none';
	
			// check & decode hmd-stream + trace, slap hms on all of it.
			jQuery('div#' + cmd.id + '_preInitStatus').show('normal');
			// start a thread to prepare the trace data
			var dataID = cmd.id + '_tracedata_';
			cmd.waits['trace'] = 'trace';
			sa.json.decode.big(
				dataID, cmd, 'root-trace', sa.hms.tools.unmarshall, 
				function (result) { // onSuccess callback handler
					sa.hms.reportStatus(cmd, 'short', 'Making trace-data human-readable.');
					cmd.trace = sa.hms.tools.makeTraceHumanReadable(result);
					sa.hms.reportStatus(cmd, 'short', 'Gathering stats on trace-data.');
					cmd.trace = sa.hms.tools.augmentWithStats(cmd.trace, null, 'ROOT-TRACE');
					//cmd.trace = cmd.trace.hmd.trace.hmd.traceData;
					cmd.waits['trace'] = null;
				},
				function (msg, ctx) { // onError callback handler
					cmd.trace = false;
					msg = msg.replace(/\n/, '<br/>');
					sa.hms.tools.displayError(cmd, 'trace-data failed to decode from JSON(1).<br/>' + msg);
					cmd.decodeErrors = true;
					cmd.waits['trace'] = null;
				}
			);

			// start a thread to decode the dump data.
			dataID = cmd.id + '_data_';
			var e = document.getElementById(cmd.id + '_data_0');
			if (e) {
				cmd.waits['data'] = 'data';
				sa.json.decode.big(
					dataID, cmd, 'root-data', sa.hms.tools.unmarshall, 
					function (result) { // onSuccess callback handler
						cmd.hmd = result;
						cmd.waits['data'] = null;
					},
					function (msg, ctx) { // onError callback handler
						cmd.hmd = false;
						msg = msg.replace(/\n/, '<br/>');
						sa.hms.tools.displayError(cmd, 'data failed to decode from JSON(1).<br/>' + msg);
						cmd.decodeErrors = true;
						cmd.waits['data'] = null;
					}
				);
			} else {
				var hmd = cmd.hmd;
				if (typeof hmd == 'object') {} else if (typeof hmd == 'string') {
					var p1 = sa.hms.tools.strpos(cmd.hmd, '[');
					var p2 = sa.hms.tools.strpos(cmd.hmd, '{');
					if (((p1 >= 0) && (p1 < 10)) || ((p2 >= 0) && (p2 < 10))) {
						var b = hmd.length;
						var hmd2 = sa.json.decode.small(hmd, cmd, null, sa.hms.tools.unmarshall, (b > (0.8 * 1024 * 1024) ? true : false));
						// if hmd > 0.8Mb, don't do any fix-by-regexp(3x) of the JSON
						// in tools.json.decode().
						// regexp > 1.3Mb is not safe. memory errors.
		
						if (!hmd2) {
							sa.hms.tools.displayError(cmd, 'Data failed to decode from JSON(2).');
							var d = eval('(' + hmd + ')'); //trigger browser error
							return false;
						} else {
							hmd = hmd2;
							delete hmd2;
						}
					};
				} else {
					sa.hms.tools.displayError('Invalid hmd type.');
				}
			};
			sa.hms.tools.waitForParsing(cmd);
		};
		return cmd;
	},

	error: function (str) {
		sa.hms.log(str);
		if (1 == 2 && typeof console == 'object' && typeof console.trace == 'function') console.trace();
	},

	log: function (errLevel, str) {
		sa.m.log (errLevel, { msg : 'sa.jsonViewer: '+str } );
	},
	
	reportStatus: function (cmd, taip, str) {
		if (!cmd) return false;

		//if (taip == 'long') sa.hms.log(str);

		var e = document.getElementById(cmd.id + '_footerMsg');
		if (e) {
			e.innerHTML = str;
			jQuery(e).fadeIn('normal');
		};

		switch (taip) {
			case 'long':
				var e = document.getElementById(cmd.id + '_longMsg');
				if (e) e.innerHTML = str;
				break;
			case 'short':
				var e = document.getElementById(cmd.id + '_shortMsg');
				if (e) e.innerHTML = str;
				break;
		}
	},

	reportSizes: function (cmd, pvCmd) {
		var e = document.getElementById(cmd.id + '_sizes');
		if (!e || !pvCmd || !cmd.pvCmds || !cmd.pvCmds[pvCmd.id]) return false;

		var kbh = sa.m.sizeHumanReadable(cmd.byteSize.html);
		var kbc = sa.m.sizeHumanReadable(cmd.byteSize.css);
		var s = 'This costs ' + kbh + ' of HTML, and ' + kbc + ' of CSS' + '<!-- (both measured as text-length) --> to display' + (pvCmd && cmd.pvCmds[pvCmd.id] && typeof cmd.pvCmds[pvCmd.id].hmGstats.totalValues == 'number' ? ' (' + cmd.pvCmds[pvCmd.id].hmGstats.totalValues + ' to build)' : '') + '.';
		e.innerHTML = s;
	},

	ui: {
		switchViewMode : function (event, type, viewMode) {
			var 
			cmdID = jQuery(event.target).attr('cmdID'),
			hmID = jQuery(event.target).attr (type+'ID'),
			dp = sa.hms.settings.cs.dataPointers[hmID],
			item = {
				d : dp.val
			},
			pvCmd = {
				cmd : sa.hms.settings.cs.cmds[cmdID],
				isKey : type=='key',
				dp : dp
			};
			
			if (type=='key') {
				dp.val.hmo.viewKey = viewMode;
			} else {
				dp.val.hmo.viewValue = viewMode;
			}
			
			var html = sa.hms.tools.printVariable (pvCmd, item, type=='key'?'key':'data');
			jQuery('#'+hmID+'_'+type+'Div').html (html);
			
		},
		
		switchAutomatedFormatting : function (event, type, doFormat) {
			var 
			cmdID = jQuery(event.target).attr('cmdID'),
			hmID = jQuery(event.target).attr (type+'ID'),
			dp = sa.hms.settings.cs.dataPointers[hmID],
			item = {
				d : dp.val
			},
			pvCmd = {
				cmd : sa.hms.settings.cs.cmds[cmdID],
				isKey : type=='key',
				dp : dp
			};
			
			if (type=='key') {
				dp.val.hmo.keyAutoFormat = doFormat;
			} else {
				dp.val.hmo.valueAutoFormat = doFormat;
			}
			
			var html = sa.hms.tools.printVariable (pvCmd, item, type=='key'?'key':'data');
			jQuery('#'+hmID+'_'+type+'Div').html (html);
			
		},
		
		switchBeautifierMode : function (event, type, newMode) {
			var 
			cmdID = jQuery(event.target).attr('cmdID'),
			hmID = jQuery(event.target).attr (type+'ID'),
			dp = sa.hms.settings.cs.dataPointers[hmID],
			item = {
				d : dp.val
			},
			pvCmd = {
				cmd : sa.hms.settings.cs.cmds[cmdID],
				isKey : type=='key',
				dp : dp
			};
			
			if (type=='key') {
				dp.val.hmo.viewKeyMode = newMode;
				dp.val.hmo.viewKeyTheme = sa.hms.globals.sourceBeautifierThemes.definitions[newMode];
			} else {
				dp.val.hmo.viewValueMode = newMode;
				dp.val.hmo.viewValueTheme = sa.hms.globals.sourceBeautifierThemes.definitions[newMode];
			};
			
			var html = sa.hms.tools.printVariable (pvCmd, item, type=='key'?'key':'data');
			jQuery('#'+hmID+'_'+type+'Div').html (html);
		},
		
		bindRightClick : function (cmdID, hmID) {
			var dp = sa.hms.settings.cs.dataPointers[hmID];
			//if (dp.type=='key') {
				var jQuerye = jQuery('#'+hmID+'_table');
				var sid = sa.hms.settings.cs.cmds[cmdID].scrollpaneID;
				jQuerye.bind ('click', function (evt) {
					evt.preventDefault();
					
					//sa.sp.scrollTo (jQuery('#'+sid)[0], evt.target, null);
					
					return false;
				});;
				jQuerye.bind('contextmenu', function (evt) {
					evt.preventDefault();
					
					if (evt.target.id.match(/hm_/)) {
						var t = evt.target;	
					} else {
						var t = evt.currentTarget;
					};					
					
					//sa.sp.scrollTo (jQuery('#'+sid)[0], t, function () {
						sa.hms.ui.contextMenu (cmdID, t.id.replace(/_keyDiv/,'').replace(/_valueDiv/,'').replace(/_table/,''), evt);
					//});
					
					return false;
				});
			//};
		},
		
		disableScrollpaneMousewheel : function (cmdID, disableOrNot) {
			var sid = sa.hms.settings.cs.cmds[cmdID].scrollpaneID;
			sa.vcc.settings[sid].items[0].mousewheelDisabled = disableOrNot;
		},
		
		contextMenu : function (cmdID, hmID, evt) {
			var dp = sa.hms.settings.cs.dataPointers[hmID];
			//if (dp.type=='key') {
				sa.hms.ui.contextMenu_destroy(cmdID, function () {
					var sid = sa.hms.settings.cs.cmds[cmdID].scrollpaneID;
					jQuery('#'+sid).append (sa.hms.ui.contextMenu_dialog(cmdID, hmID));
					
					delete sa.vcc.settings['hm_contextMenu'];
					delete sa.vcc.settings['hm_contextMenu__scrollpane'];
					sa.hms.ui.disableScrollpaneMousewheel (cmdID, true);
					sa.vcc.init (jQuery('#hm_contextMenu')[0], function () {
						jQuery('#hm_contextMenu').css ({height:'auto'});
						sa.sp.containerSizeChanged(jQuery('#hm_contextMenu__scrollpane')[0]);
					});
				});
			//}
		},
		
		contextMenu_destroy : function (cmdID, callback) {
			jQuery('#hm_contextMenu, #hm_contextMenu__dialog').fadeOut(300);
			setTimeout(function () {
				jQuery('#hm_contextMenu, #hm_contextMenu__dialog').remove();
				sa.hms.ui.disableScrollpaneMousewheel (cmdID, false);
				if (typeof callback=='function') callback();
			}, 310);	
		},
		
		contextMenu_dialog : function (cmdID, hmID) {
			var 
			sid = sa.hms.settings.cs.cmds[cmdID].scrollpaneID,
			sp = jQuery('#'+sid+'__container'),
			/*
			var what = jQuery('#'+hmID)[0];
			sa.m.showAllParents(what);
			var w = what, x = 0, y = 0, found=false;
			while (!found) {
				x += w.offsetLeft;
				y += w.offsetTop;
				//sa.sp.log (321, 'scrollTo(): cihe.id="'+cihe.id+'", what.id="'+what.id+'", x='+x+', y='+y);
				var op = w.offsetParent, cur = w, found2=false;
				while (cur !== op && !found2) {
					if (cur.className.match('vividScrollpane')) {
						found2=true;
					} else {
						cur = cur.parentNode;
					};
				};
				if (found2) {
					found=true;
				} else {
					w = w.offsetParent;
				};
			};
			*/
			y = 55,
			x = 10,
			h = (sp.height()-y-30),
			w = (sp.width()-30);
			
			
			var html =
			'<div id="hm_contextMenu" class="vividDialog vividTheme__dialog_black_textured2_square" style="position:absolute;top:'+y+'px;left:'+x+'px;width:'+w+'px;height:'+h+'px;z-index:9999990" onclick="sa.hms.ui.contextMenu_destroy(\''+cmdID+'\');">'
				//+sa.hms.settings.cs.dataPointers[sa.hms.settings.cs.dataPointers[hmID].val.hms.valueID].val.hms.htmlLegend
				+'<div id="spacer" style="padding:10px;">'
				+sa.hms.tools.print_valueMenu(cmdID, sa.hms.settings.cs.dataPointers[hmID].val.hms.valueID)
				+'</div>'
			+'</div>';
			
			return html;
		},
	
		makePre: function (htmlID) {
			var e = document.getElementById(htmlID);
			if (e.style.whiteSpace == 'normal') {
				e.style.whiteSpace = 'pre';
			} else {
				e.style.whiteSpace = 'normal';
			}
			return false;
		},

		makeRenderedHTML: function (htmlID) {
			var e = document.getElementById(htmlID);
			if (e.childNodes[0].id == e.id + '_frame') {
				e.innerHTML = sa.hms.tools.htmlentities(e.childNodes[0].innerHTML);
				//e.removeChild (e.childNodes[0]);
				if (e.oldSettings) {
					e.style.background = e.oldSettings.background;
					e.style.color = e.oldSettings.color;
				}
			} else if (e) {
				var frame = document.createElement('div');
				frame.id = e.id + '_frame';
				frame.style.background = 'white';
				frame.style.color = 'black';
				frame.style.width = '100%';
				frame.style.height = '100%';
				frame.innerHTML = sa.hms.tools.htmlentities_decode(e.innerHTML);
				e.innerHTML = '';
				e.appendChild(frame);
			}
			return false;
		},

		expand: function (htmlID, levels, type) {
			if (typeof levels == 'undefined') levels = 1;
			if (jQuery('#'+htmlID+'_key').length>0 && jQuery('#'+htmlID+'_key')[0].innerHTML.match(/backtrace/)) levels = 2;
			sa.hms.ui.expandMore({
				curr: 0,
				ids: [{
					id: htmlID,
					levels: levels,
					type : type
				}]
			});
			return false;
		},

		expandAll: function (htmlID, type) {
			sa.hms.ui.expandMore({
				curr: 0,
				ids: [{
					id: htmlID ,
					levels: 9999,
					type : type
				}]
			});
			return false;
		},

		expandMore: function (expandCmd) {
			var k = (expandCmd.gotYTR ? expandCmd.ytrIdx : expandCmd.curr);
			sa.hms.log (195, 'tools.expandMore():'+k+' - '+expandCmd.ids[k].levels+' - '+expandCmd.ids[k].id);
			sa.m.trace(195);
			if (expandCmd.ids[k].levels > 0) {
				var htmlID = expandCmd.ids[k].id;
				var el = jQuery('#'+htmlID)[0];
				var ph = false;//jQuery('#'+htmlID+'_valueDescription')[0];
				var dp = sa.hms.settings.cs.dataPointers[htmlID]; // I think one can safely assume that (typeof dp.hmd==='object')
				if (dp && typeof dp.val.hmd=='object') {
					for (var j in dp.val.hmd) {
						var v = dp.val.hmd[j];
						break;
					};
				} else {
					var v = dp.val;
				};
				if (!v.hms) debugger;
				var ph = jQuery('#'+v.hms.valueID)[0];
				if (!ph) {
					sa.hms.tools.printLevel (el, expandCmd.ids[k].levels);
				} else {
					sa.hms.ui.showHide (el);
				}
			};

			sa.hms.tools.fireEvent (sa.hms.options.thisCmd,'onResized',{loc:'expandMore'});
			return true;
		},

		goto: function (htmlID, cmdID) {
			var sid = sa.hms.settings.cs.cmds[cmdID].scrollpaneID;
			
			var d = sa.hms.settings.cs.dataPointers[htmlID];
			sa.sp.scrollTo (document.getElementById(sid), document.getElementById(htmlID), function () {
				sa.hms.ui.highlight(htmlID, d, 10, sa.hms.ui.highlight_done);
			});
			//sa.hms.ui.scrollToElement(document.getElementById((noAdditionsPlz ? htmlID : htmlID + '_key')));
			return false;
		},
		
		highlight : function (htmlID, d, numberOfSeconds, callback) {
			var propertySet = {
				0 : {
					color : '#FFFFFF',
					backgroundColor : '#660099'
				},
				100 : {
					color : '#000000',
					backgroundColor : '#33FF00'
				}
			};
			var hlCmd = {
				htmlID : htmlID,
				callback : callback,
				empty : {
					color : 'inherit',
					backgroundColor : 'inherit'	
				},
				propertySet : propertySet,
				forward : true,
				stepDuration : 1000,
				timeRemaining : numberOfSeconds*1000
			};
			
			sa.hms.ui.highlight_nextStep(hlCmd);
		},
		
		highlight_done : function (hlCmd) {
			//jQuery('#'+hlCmd.htmlID).css (hlCmd.empty);
		},
		
		highlight_nextStep : function (hlCmd) {
			if (hlCmd.timeRemaining>0) {
				var p = (hlCmd.forward?hlCmd.propertySet[100]:hlCmd.propertySet[0]);
				jQuery('#'+hlCmd.htmlID).animate (p, hlCmd.stepDuration);
				hlCmd.timeRemaining -= hlCmd.stepDuration;
				setTimeout (function() {
					hlCmd.forward = !hlCmd.forward;
					sa.hms.ui.highlight_nextStep (hlCmd);
				}, hlCmd.stepDuration);				
			} else {
				if (typeof hlCmd.callback=='function') hlCmd.callback (hlCmd);
			}
		},

		scrollToElement: function (theElement) {
			var t = theElement;
			while (t && !t.className.match('vividScrollpane')) {
				t = t.parentNode; 
			};
			sa.sp.scrollTo (t, theElement);
		},

		showTrace: function (cmdID) {
			var e = jQuery('div#' + cmdID + '_trace')[0];
			if (e.style.display == 'none') {
				jQuery(e).show(sa.hms.globals.showTraceSpeed);
				var r = true;
			} else {
				jQuery(e).slideUp(sa.hms.globals.showTraceSpeed);
				var r = false;
			};
			setTimeout (function () {
				sa.sp.containerSizeChanged (jQuery(e).closest('.vividScrollpane')[0], false);
			}, sa.hms.globals.showTraceSpeed*1.5);
			return false;//stop default A HREF from being followed?
		},
		
		showHide: function (el) {
			var jQuerysel = jQuery(el).children().not(':eq(0)').children().children();
			var jQuerysel2 = jQuery(el).children().not(':eq(0)').children();
			if (jQuerysel[0].style.display == 'none') {
				jQuery(el).parent().css ({borderSpacing:2});
				jQuerysel2.css ({padding:2});
				jQuerysel.fadeIn(sa.hms.globals.showTraceSpeed);
				var r = true;
			} else {
				jQuerysel.css ({display:'none'});
				jQuery(el).parent().css ({borderSpacing:0});
				jQuerysel2.css ({padding:0});
				var r = false;
			};
			setTimeout (function () {
				sa.sp.containerSizeChanged (jQuery(el).closest('.vividScrollpane')[0], false);
			}, sa.hms.globals.showTraceSpeed*1.1);
			return r;
		},

		openFileInEditor: function (filepath, line) {
			var url = sa.hms.options.current.rootURL + 'ajax_launchFile.php?filepath=' + filepath.replace(/\//g, '%2f') + '&line=' + line;
			var ajaxCommand = {
				type: 'get',
				url: url,
				contentType: 'text/html',
				success: function (hmd, ts) {
					alert(hmd);
				},
				error: function (req, ts, err) {
					alert('alas, something failed miserably; ' + err);
				}
			};
			var ajax = jQuery.ajax(ajaxCommand);
		}
	}, //ui
	
	tools: {
		fireEvent : function (cmd, eventName, eventData) {
			if (!cmd) debugger;
			if (typeof sa.hms.options.events.byCmd[cmd.id]!=='object') return false;

			for (idx in sa.hms.options.events.byCmd[cmd.id]) {
				var ev = sa.hms.options.events.byCmd[cmd.id][idx];
				ev.handler (cmd, eventName, eventData, ev.outsideContext);
			};
		},

		registerEvent : function (cmd, eventName, handler, outsideContext) {
			if (!sa.hms.options.events.byCmd[cmd.id]) sa.hms.options.events.byCmd[cmd.id] = [];
			var ev = { handler : handler, outsideContext : outsideContext };
			sa.hms.options.events.byCmd[cmd.id] = sa.hms.options.events.byCmd[cmd.id].concat([ev]);
		},
		
		waitForParsing: function (cmd) {
			var sw = false;
			for (i in cmd.waits) {
				if (cmd.waits[i] !== null) {
					sw = true;
					break;
				}
			};
			if (sw) {
				setTimeout(function () {
					//sa.hms.log ('waitForParsing is still waiting');
					sa.hms.tools.waitForParsing(cmd);
				}, 250); //DO NOT LOWER; there will be other threads running that need more CPU power.
			} else {
				sa.hms.tools.waitForParsingDone(cmd);
			}
		},

		waitForParsingDone : function (cmd) {
			if (cmd.decodeErrors) return false;
			sa.hms.reportStatus(cmd, 'long', 'Completed decoding of all JSON data,<br/>now building first levels of HTML.');

			
			
			cmd.hmd = sa.hms.tools.augmentWithStats(cmd.hmd, null, 'ROOT-DATA');
			sa.hms.options.current = sa.m.negotiateOptions(
				sa.hms.options.current, 
				sa.hms.options.authorsDefaults, 
				(cmd.hmd.hmo ? cmd.hmd.hmo : []),
		
			// TODO FIX:
				(cmd.options ? cmd.options : [])
			);
			sa.hms.options.current.activeThemes = sa.hms.options.current.themes;
		
			for (cn in sa.hms.options.contributors) {
				sa.hms.options.current.themes = sa.m.negotiateOptions(
				sa.hms.options.current.themes, sa.hms.options.contributors[cn].themes);
			};

			sa.hms.options.current.theme = sa.m.negotiateOptions (
				sa.hms.options.current.themes[sa.hms.options.current.themeChoices.hmDefault],
				sa.hms.options.current.themes[cmd.themeName]
			);
			sa.hms.options.current.theme = sa.m.negotiateOptions(
				sa.hms.options.current.theme,
				(cmd.hmd.hmo && typeof cmd.hmd.hmo.themeName == 'string' 
					? sa.hms.tools.getThemeByName(cmd.hmd.hmo.themeName) 
					: sa.hms.options.current.themes[sa.hms.options.current.themeChoices.hmDefault]
				), 
				(cmd.hmd.hmo 
					? sa.hms.tools.arrayExclude(['themeName'], cmd.hmd.hmo) 
					: []
				)
			);

	//		debugger;
			sa.hms.options.current.theme = sa.hms.tools.getThemeByName(sa.hms.options.current.theme.themeName);
			var theme = ' hmTheme_'+sa.hms.options.current.theme.themeName;
		
			var tableProps = sa.hms.options.current.theme.htmlTopLevelTableProps;
			var css = sa.colorGradients.generateCSS_for_jsonViewer (sa.hms.options.current.theme, cmd.hmd);
			sa.hms.tools.insertCSS(cmd, cmd.hmd, css, sa.hms.options.current.theme, 'cmd-data');

			// start generating the HTML needed for this dump:
			var varID = '--ROOT--';
			var htmlLegend = 
				'<div class="hmLegend1">' + cmd.title + '</div>' + 
				'<div class="hmLegend2">' + 
				'<table class="hmLegend2"><tr style="width:100%;">' + 
					'<td>'+
					'[ ' + 
					(cmd.trace 
						? '<a class="hmTrace" title="Show trace" href="#" onclick="return sa.hms.ui.showTrace(\'' + cmd.id + '\');">trace</a>' 
						:  (cmd.trace 
							? 'trace failed to decode' 
							:  (cmd.dataOrigin && cmd.dataOrigin == 'js' 
									? ', <span class="hmTrace">' + 'trace <a target="_blank" href="http://getfirefox.com">sent</a> to ' + '<a target="_blank" href="#"href="http://getfirebug.com/">console</a>' + '</span>' 
									: ''
								)
							)
					) + 
					(cmd.dataOrigin 
						? ', <span class="cmd.hmdOrigin">generated in ' 
							+ (cmd.dataOrigin == 'js' 
									? 'javascript' 
									: cmd.dataOrigin
								) 
							+ '</span>, ' 
							+ '<span class="hmDateTime hmTime">' + cmd.time + 's since ' + 
								(cmd.dataOrigin == 'js' 
									? 'page has loaded.' 
									: 'server receiving request'
								) 
							+ 	'</span>' 
						: ''
					) + 
					' ]' + 	
					'<br/>' + 
					
					( cmd.hmd && cmd.hmd.hms && cmd.hmd.hms.topKeys > 0 
						? sa.hms.tools.htmlArrayHeader(cmd.hmd) 
						: sa.m.sizeHumanReadable(cmd.hmd.hms.byteSize)
					) + 
					'</td>' +
					'<td style="text-align:right">' +
					'[ <span class="hmDateTime hmDate">' + cmd.date + '</span> ]<br/>' + 
					'[ ' + sa.m.sizeHumanReadable(cmd.byteSize.transportData + cmd.byteSize.transportTrace) + ' during transport ]' + '<br/>' + 
					'</td>' + 
					'</tr></table></div>';
					
			var rd = 'This version was released / updated on ' + sa.hms.about.lastUpdated;
			var htmlFooter = 
				'<table cellspacing="3" id="' + cmd.id + '_footer" cellspacing="3" style="width:100%;">'
				+ '<tr style="width:100%;">'
				+ '<td style="height:1.2em; width:300px;">' 
				+ '<a target="_blank" href="http://seductiveapps.com/tools/json">jsonViewer</a> ' 
				+ '<a onclick="return false;" href="javascript:' + rd + '" title="' + rd + '">version ' + sa.hms.about.version + '</a> ' 
				+ '</td><td style="text-align:right">'
				+	'<span id="' + cmd.id + '_sizes" class="hmSizes">&nbsp;</span>'
				+ '</td></tr>' 
				+ (sa.hms.options.current.showBuildingMsg 
					? '<tr style="width:100%;">' + '<td id="' + cmd.id + '_sMsg" style="height:5em" colspan="9" valign="top">' + '<span id="' + cmd.id + '_footerMsg">&nbsp;</span>' + '</td></tr>' 
					: ''
				) + '</table>';



			if (cmd.trace) {
				var oldTheme = sa.hms.options.current.theme;
				var localTheme = sa.hms.tools.getThemeByName('--trace');
				if (cmd.trace.hmo && cmd.trace.hmo.themeName) {
					var localTheme = sa.hms.tools.getThemeByName(cmd.trace.hmo.themeName);
				};

				//sa.hms.settings.cs.pvs[cmd.id]['--trace--'] = new Object;
				sa.hms.reportStatus(cmd, 'long', 'Building HTML for trace.');
				sa.hms.settings.cs.debugID++;
				//cmd.trace.hmd.trace.hmo = cmd.trace.hmo;
				
				cmd.trace.hmd.trace.hmd.traceData.hms.isRootVar = true;

				var call = sa.hms.tools.printNextLevel({
					id: sa.hms.settings.cs.debugID,
					cmd: cmd,
					val: cmd.trace.hmd.trace.hmd.traceData,
					keyNameOrType: 'ROOT-TRACE',
					keyName: '',
					theme: localTheme,
					levelsAtOnce: 2,
					hmo: cmd.trace.hmo,
					subPrintID: 'hm_' + sa.hms.settings.cs.debugID
				});	
				var traceID = cmd.trace.hmd.trace.hmd.traceData.hms.parentNode.hms.keyID;
				var htmlTrace = 
					'<tr><td colspan="999">' + 
					'<div id="' + cmd.id + '_trace" class="hm hmTracePHP hmTheme_' + sa.hms.options.current.theme.themeName + '" style="display:none">' + 
					'<div id="' + traceID + '_div">'+
					'<table id="' + traceID + '_table" class="hm" cellpadding="0" cellspacing="2" class="hm hmTheme_' + localTheme.themeName + '" style="width:100%; padding:10px;">' + 
					'<tbody id="'+traceID+'"><tr id="'+traceID+'_placeholder"><td>'+
					call.html + 
					'</td></tr></tbody>'+
					'</table>' + 
					'</div>' + 
					'</div>' + 
					'</td></tr>';

				if (localTheme.themeName!==sa.hms.options.current.theme.themeName) {
					//sa.hms.reportStatus (cmd, 'long', 'Generating CSS for trace.');
					var css = sa.colorGradients.generateCSS_for_jsonViewer (localTheme, cmd.trace.hmd.trace.hmd.traceData, traceID);
					sa.hms.tools.insertCSS(cmd, cmd.trace.hmd.trace.hmd.traceData, css, localTheme, 'trace');
				};

			};


			sa.hms.reportStatus(cmd, 'long', 'Building HTML for data.');
			sa.hms.settings.cs.debugID++;
			var subPrintID = 'hm_' + sa.hms.settings.cs.debugID;

			sa.hms.settings.cs.debugID++;
			cmd.pvCmds = [];
			//sa.hms.log (419, 't25: '+cmd.id+': allocating : '+sa.hms.settings.cs.debugID);
			cmd.pvCmds[sa.hms.settings.cs.debugID] = {
				hmGstats: {
					totalValues: cmd.hmd.hms.values
				}
			};
			cmd.hmd.hms.isRootVar = true;
			var 
			l1 = sa.hms.tools.printNextLevel({
				id: sa.hms.settings.cs.debugID,
				cmd: cmd,
				val: cmd.hmd,
				keyNameOrType: 'ROOT-DATA',
				keyName: '',
				theme : sa.hms.options.current.theme,
				levelsAtOnce: 1
			}).html,
			cn = sa.hms.settings.cs.htmlNode[cmd.id] = document.getElementById(cmd.id),
			jQuerycn = jQuery(cn);

			//jQuery(cn).css ({visibility:'hidden'});
			
			//debugger;
			if (typeof cmd.externalScrollpaneID=='string') {
				cmd.buildScrollpane = false;
				cmd.scrollpaneID = cmd.externalScrollpaneID;
				jQuery('#'+cmd.id).css({width:'auto', height:'auto'});
				jQuery('#'+cmd.id).parent().css({width:'auto',height:'auto'});
			} else {
				cmd.buildScrollpane = true;
				cmd.scrollpaneID = cmd.hmd.hms.keyID+'__scrollpane';	
			};
			var css = sa.colorGradients.generateCSS_for_jsonViewer (sa.hms.options.current.theme, cmd.hmd);
			sa.hms.tools.insertCSS(cmd, cmd.hmd, css, sa.hms.options.current.theme, 'ROOT-DATA');
			
			var htmlEntireApp = 
				(
					cmd.buildScrollpane
					?'<div id="' + cmd.scrollpaneID + '" class="vividScrollpane vividTheme__scroll_black" style="width:100%;height:100%;">' 
					:''
				)
				+'<div id="' + cmd.hmd.hms.keyID + '_div" class="hm ' + theme + '">' + 
				'<table id="' + cmd.hmd.hms.keyID + '_table" cellpadding="0" cellspacing="2" class="jsonViewer hm' + theme + '" style="" ' + tableProps + '>' + 
					'<tbody>'+
					'<tr><td class="hmTitle" colspan="999"><div>' + htmlLegend + '</div></td></tr>' + 
					(cmd.trace ? htmlTrace : '') +
					(cmd.hmd === false ?
						'<tr><td colspan="999">' + 'Could not decypher data in this jsonViewer instance, sorry.<br/>' + '</td></tr>' 
						:'<tr><td colspan="999"><div>'
						+l1
						+'</div></td></tr>'
					) + 
					(htmlFooter ?	 '<tr><td class="hmFooter" colspan="999">' + htmlFooter + '</td></tr>' 
					: ''
					) + 
					'</tbody>'+
				'</table></div>'
				+(
					cmd.buildScrollpane
					?'</div>' 
					: ''
				);

			cmd.byteSize.html += htmlEntireApp.length;
			sa.hms.reportSizes(cmd);

			jQuery('div#' + cmd.id + '_hmPreInit').hide('fast');
			jQuerycn.removeClass('hmPreInit');
			jQuerycn.addClass('hmRendering');

			sa.hms.log (201, 'tools.waitForParsingDone(): #'+sa.hms.settings.cs.htmlNode[cmd.id].id+' - '+htmlEntireApp);
			jQuery(cn).html (htmlEntireApp);
	//		debugger;
			sa.vcc.init (jQuery('#'+cmd.scrollpaneID)[0], function () {
				sa.hms.options.thisCmd = cmd;
				jQuery('#'+cmd.id+' table.hm:first').css ({
						'border-top-right-radius': '10px', 
						'border-bottom-right-radius': '10px', 
						'-moz-border-radius-topright': '10px', 
						'-moz-border-radius-bottomright': '10px',
						'border-top-left-radius': '10px', 
						'border-bottom-left-radius': '10px', 
						'-moz-border-radius-topleft': '10px', 
						'-moz-border-radius-bottomleft': '10px'
				});
				jQuery('#'+cmd.scrollpaneID).css ({
					width : jQuery('#'+cmd.scrollpaneID+'__container')[0].offsetWidth-22,
					height : jQuery('#'+cmd.scrollpaneID+'__container')[0].offsetHeight-22
				});
				sa.sp.containerSizeChanged (jQuery('#'+cmd.scrollpaneID)[0], false);
				jQuerycn
					.animate ({opacity : (cmd.options&&cmd.options.opacity?cmd.options.opacity:1)})
					.bind ({click : function () {
						sa.hms.options.thisCmd = cmd;
						return true;
					}});
				jQuery(window).bind ({resize: function () {
					sa.hms.tools.onResize (cmd.id);
				}});
			});
			
		},
		
		onResize : function (cmdID) {
			if (!sa.hms.settings.waitTime) sa.hms.settings.waitTime = 500;
		
			var d = new Date();
			if (
				!sa.hms.settings.lastResizeCmdIssued
				|| (d.getTime() - sa.hms.settings.lastResizeCmdIssued > sa.hms.settings.waitTime)
			) {
				sa.desktop.settings.lastResizeCmdIssued = d.getTime();
		
				var cmd = sa.hms.settings.cs.cmds[cmdID];
				if (cmd) {
					jQuery('#'+cmd.scrollpaneID).css ({
						width : jQuery('#'+cmd.scrollpaneID+'__container')[0].offsetWidth-22,
						height : jQuery('#'+cmd.scrollpaneID+'__container')[0].offsetHeight-22
					});
					sa.sp.containerSizeChanged (jQuery('#'+cmd.scrollpaneID)[0], false);
				}
			};
		},

		printLevel: function (scheduledToPopulate_element, levels) {
			var el = scheduledToPopulate_element;
			var id = el.id.replace('_placeholder','');
			var themeName = jQuery('#'+id+'_table').attr('hmTheme');
			var theme = sa.hms.tools.getThemeByName(themeName);
			var pvCmd = {
				cmd : sa.hms.settings.cs.cmds[ jQuery(el).attr('cmdid') ],
				dp : sa.hms.settings.cs.dataPointers[id],
				val : sa.hms.settings.cs.dataPointers[id].val,
				id : id,
				isPostBuildup : true,
				levelsAtOnce : levels ? levels : 1,
				theme : theme,
				scanUpdateCallback : sa.hms.tools.scanUpdateCallback
			};
			sa.hms.tools.printNextLevel (pvCmd);
			sa.pbar.init (document.getElementById(el.id+'_progressbar'));
			sa.sp.containerSizeChanged (jQuery('#'+pvCmd.cmd.scrollpaneID)[0], false);
			//sa.sp.scrollTo (jQuery('#'+pvCmd.cmd.scrollpaneID)[0], jQuery('#'+pvCmd.val.hms.valueID+'_value')[0]);
		},
		
		scanUpdateCallback : function (pvCmd) {
			var el = document.getElementById(pvCmd.val.hms.valueID+'_progressbar');
			sa.pbar.setPercentage (el, pvCmd.scanIdx, (
				((pvCmd.scanIdx*100)/pvCmd.val.hms.values)>100
				? pvCmd.scanResults.length
				: pvCmd.val.hms.values
			));
		},

		printNextLevel : function (pvCmd) {
			sa.hms.settings.cs.pvCmds[pvCmd.id] = pvCmd;
			pvCmd.scanPointer = pvCmd.val;
			setTimeout (function () {
				sa.hms.tools.printNextLevel_scan (pvCmd, sa.hms.tools.printNextLevel_buildList);
			}, 50); // WAS 1500 [BUG?]
			sa.hms.log (201, 'tools.printNextLevel(): '+pvCmd.val);
			sa.m.trace (201);
			return {
				html : 
				'<table id="'+pvCmd.val.hms.keyID+'_table" cellpadding="0" cellspacing="2" class="hm">'
				+'<tbody id="'+pvCmd.val.hms.keyID+'">'
				+'<tr id="'+pvCmd.val.hms.keyID+'_placeholder"><td>Have Yet To Render This</td></tr>'
				+'</tbody></table>'
			};
		},
		
		printNextLevel_scan : function (pvCmd, callback) {
			if (!pvCmd.scanResults) {
				pvCmd.scanResults = [{level:1, d:pvCmd.scanPointer}];
				pvCmd.scanIdx = 0;
				pvCmd.scanCount = 0;
				pvCmd.lastPause = 0;
				pvCmd.scanCallback = callback;
			};
			
			sa.hms.tools.printNextLevel_scanItem (pvCmd);
			
			if (typeof pvCmd.scanUpdateCallback=='function') {
				pvCmd.scanUpdateCallback (pvCmd);
			};
			sa.hms.log (419, 'tools.printNextLevel_scan(): pvCmd.scanIdx='+pvCmd.scanIdx+', scanResults.length='+(pvCmd.scanResults.length));
			if (pvCmd.scanIdx==pvCmd.scanResults.length) {
				sa.hms.log (2, 'tools.printNextLevel_scan(): scanning done');
				if (typeof pvCmd.scanCallback=='function') {
					setTimeout (function () {
						pvCmd.scanCallback (pvCmd);
					}, 300);
				} 
				return true; // scanning done!
			}
			
			var pauseFactor = pvCmd.scanIdx;
			if (pauseFactor > pvCmd.lastPause + 50) {
				sa.hms.log (418, 'tools.printNextLevel_scan(): pausing for 5 milliseconds');
				setTimeout (function () {
					pvCmd.lastPause = pauseFactor;
					sa.hms.tools.printNextLevel_scan(pvCmd);
				}, 500);
				return false;
			} else {
				return sa.hms.tools.printNextLevel_scan(pvCmd);
			};
		},

		
		printNextLevel_scanItem : function (pvCmd) {
			var it = pvCmd.scanResults[pvCmd.scanIdx];
			if (
				!(
				typeof it==='object' 
				&& typeof it.d==='object' 
				&& ('d' in it) 
				&& ('hmd' in it.d)
				)
			) { debugger; return false; }
			
			
			var hmd = it.d.hmd;
			var tit = typeof hmd;
			if (tit=='object' && it.d!==null && it.d!==undefined) {
				if (!it.keys && it.level<=pvCmd.levelsAtOnce) {
					it.keys = Object.keys (hmd);
					it.keys.reverse();
					it.keyIdx = 0;
				}
			} 
			if (it.keys) {
				if (it.keyIdx<it.keys.length) {
					var doUntil = it.keyIdx+20;
					while (it.keyIdx<doUntil && it.keyIdx<it.keys.length) {
						var r = sa.hms.tools.printNextLevel_scanKey (pvCmd);
						it.keyIdx++;
						pvCmd.scanCount++;
						
						var pauseFactor = pvCmd.scanCount / 43;
						if (pauseFactor > pvCmd.lastPause + 1) {
							pvCmd.lastPause = pauseFactor;
							break;
						}
					}
				};
				if (it.keyIdx===it.keys.length) {
					pvCmd.scanIdx++;
				}
			} else {
				pvCmd.scanIdx++;
				pvCmd.scanCount++;
			}
		},
		
		printNextLevel_scanKey : function (pvCmd) {
			var it = pvCmd.scanResults[pvCmd.scanIdx];
			if (!it.keys[it.keyIdx]) debugger;
			var val = it.d.hmd[it.keys[it.keyIdx]];
			if (!val) return false;
			//if (typeof val.hmd!=='object') return false; // Uncommenting this would put only keys to sub-objects in pvCmd.scanResults[], but this is NOT WHAT YOU WANT.
			if (val===null) val = '[null]';
			if (val=='[null]') debugger;
			// insert next d just after the scanIdx
			pvCmd.scanResults.splice(pvCmd.scanIdx+1, 0, {level:it.level+1, d:val}); 
		},
		
		printNextLevel_buildList : function (pvCmd) {
			if (!pvCmd.buildIdx) {
				pvCmd.buildIdx = 1;//pvCmd.dp&&pvCmd.dp.type=='data'?1:0;
				pvCmd.lastPause = 0;
			};
			
			jQuery('#'+pvCmd.val.hms.valueID+'_progressbar').fadeOut (sa.hms.globals.hideProgressbarSpeed).slideUp(sa.hms.globals.hideProgressbarSpeed);
			
			if (pvCmd.buildIdx==pvCmd.scanResults.length) {
				sa.hms.log (201, 'tools.printNextLevel_buildList(): done!');
				if (typeof pvCmd.buildDoneCallback=='function') {
					pvCmd.buildDoneCallback (pvCmd);
				}
				return true; // completed task!
			}			
			
			var html = sa.hms.tools.printNextLevel_buildItem (pvCmd);
			
			if (typeof pvCmd.buildUpdateCallback=='function') {
				pvCmd.buildUpdateCallback (pvCmd);
			}
			
			if (!html) {
				debugger;
				setTimeout (function () {
					sa.hms.tools.printNextLevel_buildList (pvCmd);
				},1000);
				return false;				
			};
			
			var pauseFactor = pvCmd.buildIdx;
			if (pauseFactor > pvCmd.lastPause + 1) {
				setTimeout (function () {
					pvCmd.lastPause = pauseFactor;
					sa.hms.tools.printNextLevel_buildList (pvCmd);
				},200);
				return false;
				
			} else {
				return sa.hms.tools.printNextLevel_buildList (pvCmd);
			}
		},
		
		printNextLevel_buildItem : function (pvCmd) {
			var it = pvCmd.scanResults[pvCmd.buildIdx];
			if (typeof it.html=='undefined') {
				var html = sa.hms.tools.printNextLevel_buildKeyValuePair (pvCmd, it);
				if (html=='') debugger;
				it.html = html;				
			};
			if (it.d.hms.parentNode) {
				var p = it.d.hms.parentNode;
				var pt = 'it.d.hms.parentNode';
			} else if (false && !pvCmd.dp && pvCmd.scanResults[it.parentResultIdx]) {
				var p = pvCmd.scanResults[it.parentResultIdx];
				var pt = 'pvCmd.scanResults[it.parentResultIdx]';
			} else {
				var p = it.d;
				var pt = 'it.d';
			};
			var s = p.hms;
			var id = false;
			if (jQuery('#'+s.realParentID).length>0) id = s.realParentID;
			else if (jQuery('#'+s.valueID).length>0) id = s.valueID;
			else if (jQuery('#'+s.keyID).length>0) id = s.keyID;
				
			sa.hms.log (202, 'tools.printNextLevel_buildItem(): pvCmd.buildIdx='+pvCmd.buildIdx+', '+(id!==false?'SUCCESS':'FAIL')+'; '+p+', '+id+' - '+it.html);
			if (id) {
				var html = it.html;
				delete it.html;
				jQuery('#'+id+'_placeholder').remove();
				jQuery('#'+id).append (html);
				sa.hms.ui.bindRightClick (pvCmd.cmd.id, it.d.hms.keyID);
				sa.hms.ui.bindRightClick (pvCmd.cmd.id, it.d.hms.valueID);
				
				
				/*if (!sa.hms.settings.cs.scrollbarResizeTimer)*/ sa.hms.settings.cs.scrollbarResizeTimer = setTimeout (function() {
					sa.sp.containerSizeChanged (jQuery('#'+pvCmd.cmd.scrollpaneID)[0], false);
					delete sa.hms.settings.cs.scrollbarResizeTimer;
				}, 1000);
				pvCmd.buildIdx++;
				return true;
			} else {
				//pvCmd.buildIdx++; // BAD IDEA
				debugger;
				return false;
			};
			
		},
		
		printNextLevel_buildKeyValuePair : function (pvCmd, item /*pvCmd.scanResult[i]*/ ) {
			if (!pvCmd.theme ) debugger;
			var
			theme = (pvCmd.theme&&pvCmd.theme.themeName?' hmTheme_'+pvCmd.theme.themeName:''),
			tableProps = pvCmd.theme.htmlSubLevelTableProps;
			
			if (item.d.hmo && item.d.hmo.themeName) {
				sa.hms.options.current.theme = sa.hms.tools.getThemeByName(item.d.hmo.themeName);
				pvCmd.theme = sa.hms.options.current.theme;
				var theme = ' hmTheme_'+sa.hms.options.current.theme.themeName;
			
				var tableProps = sa.hms.options.current.theme.htmlTopLevelTableProps;
				var css = sa.colorGradients.generateCSS_for_jsonViewer (sa.hms.options.current.theme, item.d, pvCmd.isKey?item.d.hms.keyID:item.d.hms.valueID);
				sa.hms.tools.insertCSS(pvCmd.cmd, item.d, css, sa.hms.options.current.theme, 'cmd-value');
				item.d.hms.themeChanged = true;
			}
			
			var key = sa.hms.tools.printNextLevel_buildKeyOrValue (pvCmd, item, 'key');
			var value = sa.hms.tools.printNextLevel_buildKeyOrValue (pvCmd, item, 'data');
			var html = 
				'<tr>'
					+'<td id="'+item.d.hms.keyID+'_td" style="vertical-align:top;" onclick="">'
						+(item.d.hms.themeChanged?'<div>':'')
						+'<table id="'+item.d.hms.keyID+'_table" cellpadding="0" cellspacing="2" class="hm'+theme+'" hmTheme="'+pvCmd.theme.themeName+'">'
						+'<tbody id="'+item.d.hms.keyID+'" cmdID="'+pvCmd.cmd.id+'">'
						+'<tr><td colspan="2">'
							//+(item.d.hms.themeChanged?'</div>':'')
							+'<div id="'+item.d.hms.keyID+'_keyDiv">'
							+ key
							+'</div>'
							//+(item.d.hms.themeChanged?'</div>':'')
						+'</td></tr>'
						+'</tbody>'
						+'</table>'
						+(item.d.hms.themeChanged?'</div>':'')
					+'</td>'
					+'<td id="'+item.d.hms.valueID+'_td">'
						+(item.d.hms.themeChanged?'<div>':'')
						+'<table id="'+item.d.hms.valueID+'_table" cellpadding="0" cellspacing="2" class="hm'+theme+'"  hmTheme="'+pvCmd.theme.themeName+'">'
						+'<tbody id="'+item.d.hms.valueID+'" cmdID="'+pvCmd.cmd.id+'">'
						+'<tr><td colspan="2">'
							//+(item.d.hms.themeChanged?'<div>':'')
							+'<div><div id="'+item.d.hms.valueID+'_valueDiv">'
							+value
							+'</div></div>'
							//+(item.d.hms.themeChanged?'</div>':'')
						+'</td></tr>'
						+'</tbody>'
						+'</table>'
						+(item.d.hms.themeChanged?'</div>':'')
					+'</td>'
				+'</tr>';
			return html;
		},
		
		print_valueMenu : function (cmdID, hmID) {
			var 
			dp = sa.hms.settings.cs.dataPointers[hmID],
			cmd = sa.hms.settings.cs.cmds[cmdID],
			pvCmd = {
				cmd : cmd,
				parentNode : dp.val.hms.parentNode	
			},
			n = dp.val.hms.parentNode ? dp.val.hms.parentNode : dp.val,
			parentData = n.hmd,
			siblingsNum = n.hms.topKeys,
			data = dp.val.hmd,
			sibNum = 0;
			if (dp.val.hmo && dp.val.hmo.themeName) {
				pvCmd.themeName = dp.val.hmo.themeName;
				pvCmd.theme = sa.hms.tools.getThemeByName(pvCmd.themeName);
				var localTheme = sa.m.cloneObject(pvCmd.theme);
				var css = sa.colorGradients.generateCSS_for_jsonViewer (localTheme, item.d, dp.val.hms.valueID);
				sa.hms.tools.insertCSS(pvCmd.cmd, item.d, css, localTheme, 'subArray '+sa.hms.tools.getPath(pvCmd, item.d));
				item.themeChanged = true;
			};
			var dp = sa.hms.settings.cs.dataPointers[hmID];
			//if (siblingsNum<30) {
				//build up the sibling list (as indexes)
				var sibList = [];
				var prevSiblingID = false;
				for (var n in parentData) {
					if (parentData[n] && parentData[n].hms) {
						sibNum++;
						sibList[n] = {
							key: parentData[n].hms.keyID,
							title: n,
							prevSiblingID: (prevSiblingID ? parentData[prevSiblingID].hms.keyID : false)
						};
						if (prevSiblingID) {
							sibList[prevSiblingID].nextSiblingID = parentData[n].hms.keyID;
						};
						prevSiblingID = n;
					}
				};
				sibList[prevSiblingID].nextSiblingID = false;

				for (var n in parentData) {
					if (!parentData[n]) continue;
					if (n == 'pvl') continue;
					if (parentData[n].hmd == 'hmDeleteMe') continue;
					// if array, build sibling list (as html)
					var htmlSiblingList = '';
					//if (typeof parentData[n].hmd == 'object') { //saves much time
						for (k in sibList) {
							// add seperator where necessary:
							if (htmlSiblingList != '') htmlSiblingList += ' | ';

							// special case for backtraces generated in php:
							var title = sibList[k].title;
							if (title!='') {
								var titleObj = sa.json.decode.small (title);
								if (titleObj) {
									if (titleObj.func) title=titleObj.func+'()';
								}
							}

							// make link:
							if (sibList[k].title == dp.val.hms.keyName) {
								// add no real link to current item in sibling list
								htmlSiblingList += title; 
							} else {
								htmlSiblingList += '<a class="hmNavSl" href="#'+sibList[k].key+'" title="Go there" onclick="return sa.hms.ui.goto(\'' + sibList[k].key + '\', \''+pvCmd.cmd.id+'\');">' + title + '</a>';
							}
						}
					}
				//}
				//if (!htmlSiblingList || htmlSiblingList=='') debugger;
			//};
			sa.hms.settings.cs.path = sa.hms.tools.getPath(pvCmd, dp.val);
			//if (!dp.val.hms.parentNode) tableProps = '';
			
			if (dp.val) {
				var p = dp.val;
				if (!p.hmo) p.hmo = {};
				var o = p.hmo;
			}			
			
			//debugger;
			if (dp.val.hms.isRootVar) var html2=''; 
			else {
				/*
				var html2 = 
				'<table id="'+dp.val.hms.valueID+'_valueDescription" class="hm" border="1" style="width:100%">'
				+'<tbody id="'+dp.val.hms.valueID+'_valueDescriptionTbody" cmdID="'+pvCmd.cmd.id+'">'
				+'<tr><td colspan="2">'
				+'<table style="width:100%;" border="1" bordercolor="red" cellpadding="3">'
				+'<tr><th>View</th><th>Source View</th></tr>'
				+'<tr>'
				+'<td>'
				+'Key : <a class="hm_btn_viewKey'+(o.viewKey=='normal'?' selected':'')+'" href="#viewNormal--'+dp.val.hms.keyID+'" onclick="sa.hms.ui.switchViewMode(event, \'key\', \'normal\');" cmdID="'+pvCmd.cmd.id+'" keyID="'+dp.val.hms.keyID+'">normal</a>, '
				+'<a class="hm_btn_viewKey'+(o.viewKey=='source'?' selected':'')+'"  href="#viewSource--'+dp.val.hms.keyID+'" onclick="sa.hms.ui.switchViewMode(event, \'key\', \'source\');" cmdID="'+pvCmd.cmd.id+'" keyID="'+dp.val.hms.keyID+'">source</a>.<br/>'
				+'Value : <a class="hm_btn_viewValue'+(o.viewValue=='normal'?' selected':'')+'"  href="#viewNormal--'+dp.val.hms.valueID+'" onclick="sa.hms.ui.switchViewMode(event, \'value\', \'normal\');" cmdID="'+pvCmd.cmd.id+'" valueID="'+dp.val.hms.valueID+'">normal</a>, '
				+'<a class="hm_btn_viewValue'+(o.viewValue=='source'?' selected':'')+'" href="#viewSource--'+dp.val.hms.valueID+'" onclick="sa.hms.ui.switchViewMode(event, \'value\', \'source\');" cmdID="'+pvCmd.cmd.id+'" valueID="'+dp.val.hms.valueID+'">source</a>.<br/>'				
				+'</td>'
				+'<td>'
				+'Key beautifier mode : ';
				var selected = '';
				var bm = sa.hms.globals.sourceBeautifiers;
				for (var bmIdx=0; bmIdx<bm.length; bmIdx++) {
					if (o.viewKeyMode==bm[bmIdx]) selected=' selected'; else selected='';
					html2 
					+='<a class="hm_btn_viewKeyMode'+selected+'" href="#viewMode--'+dp.val.hms.keyID+'--'+bm[bmIdx]+'" onclick="sa.hms.ui.switchBeautifierMode (event, \'key\', \''+bm[bmIdx]+'\');" cmdID="'+pvCmd.cmd.id+'" keyID="'+dp.val.hms.keyID+'">'
					+bm[bmIdx]
					+'</a>'
					+(bmIdx<bm.length-1?', ':'');
				}
				
				html2 += '<br/>Value beautifier mode : ';
				for (var bmIdx=0; bmIdx<bm.length; bmIdx++) {
					if (o.viewValueMode==bm[bmIdx]) selected=' selected'; else selected='';
					html2 
					+='<a class="hm_btn_viewValueMode'+selected+'" href="#viewMode--'+dp.val.hms.valueID+'--'+bm[bmIdx]+'" onclick="sa.hms.ui.switchBeautifierMode (event, \'value\', \''+bm[bmIdx]+'\');" cmdID="'+pvCmd.cmd.id+'" valueID="'+dp.val.hms.valueID+'">'
					+bm[bmIdx]
					+'</a>'
					+(bmIdx<bm.length-1?', ':'');
				};

				html2 +='<br/>\n<br/>\n'
				+'Key automated formatting : '
				+'<a class="hm_btn_keyAutoFormat'+(o.keyAutoFormat=='on'?' selected':'')+'" href="#automatedFormatting--'+dp.val.hms.keyID+'--on" onclick="sa.hms.ui.switchAutomatedFormatting (event, \'key\', \'on\');" cmdID="'+pvCmd.cmd.id+'" keyID="'+dp.val.hms.keyID+'">on</a>, '
				+'<a class="hm_btn_keyAutoFormat'+(o.keyAutoFormat=='off'?' selected':'')+'" href="#automatedFormatting--'+dp.val.hms.keyID+'--off" onclick="sa.hms.ui.switchAutomatedFormatting (event, \'key\', \'off\');" cmdID="'+pvCmd.cmd.id+'" keyID="'+dp.val.hms.keyID+'">off</a><br/>\n'
				
				+'Value automated formatting : '
				+'<a class="hm_btn_valueAutoFormat'+(o.valueAutoFormat=='on'?' selected':'')+'" href="#automatedFormatting--'+dp.val.hms.valueID+'--on" onclick="sa.hms.ui.switchAutomatedFormatting (event, \'value\', \'on\');" cmdID="'+pvCmd.cmd.id+'" valueID="'+dp.val.hms.valueID+'">on</a>, '
				+'<a class="hm_btn_valueAutoFormat'+(o.valueAutoFormat=='off'?' selected':'')+'" href="#automatedFormatting--'+dp.val.hms.valueID+'--off" onclick="sa.hms.ui.switchAutomatedFormatting (event, \'value\', \'off\');" cmdID="'+pvCmd.cmd.id+'" valueID="'+dp.val.hms.valueID+'">off</a><br/>\n'
				
				html2 +='</td>'
				+'</tr>' 
				+'</table></td></tr>' 
				+(dp.val.hms.parentNode
					?'<tr><td colspan="2">'
						+'<span class="hmArrayKeyLegend">'  
							//+sa.hms.tools.htmlArrayHeader(dp.val, 'keys') + '<br/>' 
							+' Path: ' + sa.hms.settings.cs.path + '<br/>' 
							+ 'Sits on level ' + dp.val.hms.level + ', and has ' + (siblingsNum - 1) 
									+ ((siblingsNum - 1) == 1 ? ' sibling' : ' siblings') + (siblingsNum-1>0?' :<br/>&nbsp;&nbsp;&nbsp; ' + htmlSiblingList + '':'') 

						+'</span>'
					+'</td></tr>'
				: '')
				+'</tbody>'
				+'</table>';
				*/
				
				var html2 = 
				'<table id="'+dp.val.hms.valueID+'_valueDescription" class="hm" style="width:100%">'
				+'<tbody id="'+dp.val.hms.valueID+'_valueDescriptionTbody" cmdID="'+pvCmd.cmd.id+'">'
				+'<tr><td colspan="2">'
					+'<table style="width:100%;" cellpadding="3">'
					+'<tr><td>&nbsp;</td><td>View</td><td>Mode</td><td>Auto-Format</td></tr>'
					+'<tr>'				
					+'<td>Key</td>'
					+'<td>'
					//View:
						+'<a class="hm_btn_viewKey'+(o.viewKey=='normal'?' selected':'')+'" href="#viewNormal--'+dp.val.hms.keyID+'" onclick="sa.hms.ui.switchViewMode(event, \'key\', \'normal\');" cmdID="'+pvCmd.cmd.id+'" keyID="'+dp.val.hms.keyID+'">normal</a>, '
						+'<a class="hm_btn_viewKey'+(o.viewKey=='source'?' selected':'')+'"  href="#viewSource--'+dp.val.hms.keyID+'" onclick="sa.hms.ui.switchViewMode(event, \'key\', \'source\');" cmdID="'+pvCmd.cmd.id+'" keyID="'+dp.val.hms.keyID+'">source</a>'
					+'</td>'
					+'<td>';

					//Mode:
				var selected = '';
				var bm = sa.hms.globals.sourceBeautifiers;
				for (var bmIdx=0; bmIdx<bm.length; bmIdx++) {
					if (o.viewKeyMode==bm[bmIdx]) selected=' selected'; else selected='';
					html2 
					+='<a class="hm_btn_viewKeyMode'+selected+'" href="#viewMode--'+dp.val.hms.keyID+'--'+bm[bmIdx]+'" onclick="sa.hms.ui.switchBeautifierMode (event, \'key\', \''+bm[bmIdx]+'\');" cmdID="'+pvCmd.cmd.id+'" keyID="'+dp.val.hms.keyID+'">'
					+bm[bmIdx]
					+'</a>'
					+(bmIdx<bm.length-1?', ':'');
				}

				html2+='</td>'
					+'<td>'
						+'<a class="hm_btn_keyAutoFormat'+(o.keyAutoFormat=='on'?' selected':'')+'" href="#automatedFormatting--'+dp.val.hms.keyID+'--on" onclick="sa.hms.ui.switchAutomatedFormatting (event, \'key\', \'on\');" cmdID="'+pvCmd.cmd.id+'" keyID="'+dp.val.hms.keyID+'">on</a>, '
						+'<a class="hm_btn_keyAutoFormat'+(o.keyAutoFormat=='off'?' selected':'')+'" href="#automatedFormatting--'+dp.val.hms.keyID+'--off" onclick="sa.hms.ui.switchAutomatedFormatting (event, \'key\', \'off\');" cmdID="'+pvCmd.cmd.id+'" keyID="'+dp.val.hms.keyID+'">off</a><br/>\n'
					+'</td>'

					+'</tr><tr>'

					+'<td>Value</td>'
					+'<td>'
					//View:
						+'<a class="hm_btn_viewValue'+(o.viewValue=='normal'?' selected':'')+'"  href="#viewNormal--'+dp.val.hms.valueID+'" onclick="sa.hms.ui.switchViewMode(event, \'value\', \'normal\');" cmdID="'+pvCmd.cmd.id+'" valueID="'+dp.val.hms.valueID+'">normal</a>, '
						+'<a class="hm_btn_viewValue'+(o.viewValue=='source'?' selected':'')+'" href="#viewSource--'+dp.val.hms.valueID+'" onclick="sa.hms.ui.switchViewMode(event, \'value\', \'source\');" cmdID="'+pvCmd.cmd.id+'" valueID="'+dp.val.hms.valueID+'">source</a>.<br/>'					

					+'</td>'
					+'<td>';
					
					//Mode:
				for (var bmIdx=0; bmIdx<bm.length; bmIdx++) {
					if (o.viewValueMode==bm[bmIdx]) selected=' selected'; else selected='';
					html2 
					+='<a class="hm_btn_viewValueMode'+selected+'" href="#viewMode--'+dp.val.hms.valueID+'--'+bm[bmIdx]+'" onclick="sa.hms.ui.switchBeautifierMode (event, \'value\', \''+bm[bmIdx]+'\');" cmdID="'+pvCmd.cmd.id+'" valueID="'+dp.val.hms.valueID+'">'
					+bm[bmIdx]
					+'</a>'
					+(bmIdx<bm.length-1?', ':'');
				};
					
				html2+='</td>'
					+'<td>'
						+'<a class="hm_btn_valueAutoFormat'+(o.valueAutoFormat=='on'?' selected':'')+'" href="#automatedFormatting--'+dp.val.hms.valueID+'--on" onclick="sa.hms.ui.switchAutomatedFormatting (event, \'value\', \'on\');" cmdID="'+pvCmd.cmd.id+'" valueID="'+dp.val.hms.valueID+'">on</a>, '
						+'<a class="hm_btn_valueAutoFormat'+(o.valueAutoFormat=='off'?' selected':'')+'" href="#automatedFormatting--'+dp.val.hms.valueID+'--off" onclick="sa.hms.ui.switchAutomatedFormatting (event, \'value\', \'off\');" cmdID="'+pvCmd.cmd.id+'" valueID="'+dp.val.hms.valueID+'">off</a><br/>\n'
					+'</td>'
					+'</tr></table>'
				+'</td></tr>'
				+(dp.val.hms.parentNode
					?'<tr><td colspan="2">'
						+'<span class="hmArrayKeyLegend">'  
							//+sa.hms.tools.htmlArrayHeader(dp.val, 'keys') + '<br/>' 
							+' Path: ' + sa.hms.settings.cs.path + '<br/>' 
							+ 'Sits on level ' + dp.val.hms.level + ', and has ' + (siblingsNum - 1) 
									+ ((siblingsNum - 1) == 1 ? ' sibling' : ' siblings') + (siblingsNum-1>0?' :<br/>&nbsp;&nbsp;&nbsp; ' + htmlSiblingList + '':'') 

						+'</span>'
					+'</td></tr>'
				: '')
				+'</tbody>'
				+'</table>';
			}
				
			return html2;
		},
		
		printNextLevel_buildKeyOrValue : function (pvCmd, item, type) {
			//if (typeof pvCmd.isKey == 'undefined') pvCmd.isKey = false;
			switch (type) {
				case 'key':
					var html = sa.hms.tools.printVariable(pvCmd, item, 'key');
					break;
				case 'data':
					sa.hms.settings.cs.path = sa.hms.tools.getPath(pvCmd, item.d);
					
					var 
					theme = (pvCmd.theme && pvCmd.theme.themeName?' hmTheme_'+pvCmd.theme.themeName:''),
					tableProps = pvCmd.theme.htmlSubLevelTableProps,
					data = item.d.hmd;

					if (typeof data!=='object') {
						var html = sa.hms.tools.printVariable(pvCmd, item, 'data');
					} else {
						var html = 
							'<table id="'+item.d.hms.valueID+'_valueDescription" class="hm' + theme + '"  hmTheme="'+pvCmd.theme.themeName+'" style="width:100%" ' + tableProps +'>'
								+'<tbody id="'+item.d.hms.valueID+'_valueDescriptionTbody" cmdID="'+pvCmd.cmd.id+'">'
								+(item.d.hms.parentNode
									?'<tr><td colspan="2">'
										+'<span class="hmArrayKeyLegend">' + 
											(pvCmd.theme.showArrayStats 
												? sa.hms.tools.htmlArrayHeader(item.d, 'keys') + '<br/>' 
												: ''
											) + 
											'</span>'
									+'</td></tr>'
								: '')
								+'</tbody>'
							+'</table>';						
					}
					break;
			};
			return html;
		},
		
		printVariable : function (pvCmd, item, type) {
			switch (type) {
				case 'key':
					var val = item.d.hms.keyName;
					var id = item.d.hms.keyID;
					break;
				case 'data':
					var val = item.d.hmd;
					var id = item.d.hms.valueID;
					break;
			}
			var tv = typeof val;
			if (tv=='object') sa.hms.reportSizes(pvCmd.cmd, pvCmd);
			var html = '';
			switch (tv) {
				case 'boolean':
					html = '[boolean] ' + (val ? 'true' : 'false');
					break;
				case 'number':
					if (sa.hms.tools.is_float(val)) {
						html = '[float] ' + val;
					} else {
						html = '[integer] ' + val;
					}
					break;
				case 'string':
					if (val === '') {
						html = '[empty string]';
					} else {
						if (!val.substr(0, 10).match(/[\[\{]/)) {
							html = sa.hms.tools.printString(pvCmd, item, val);
						} else {
							var 
							json = false,
							json2 = false,
							s = item.d.hms,
							theme = ' hmTheme_'+pvCmd.theme.themeName,
							tableProps = pvCmd.theme.htmlSubLevelTableProps;
							
							if (!s.jsonDecodeAttempted) {
								s.jsonDecodeAttempted = true;
								sa.hms.log (201, 'tools.printVariable(): about to start JSON decoding for #'+id +' - '+val);
								sa.m.trace(201);
								
								var b = val.length;
								sa.json.decode.small(
									val, 
									pvCmd.cmd, 
									sa.hms.tools.getPath(pvCmd, item.d, false), 
									sa.hms.tools.unmarshall, 
									function (result) { // onSuccess callback handler
										sa.hms.settings.cs.path = '[JSON decoded]';//sa.hms.tools.getPath(pvCmd, item.d) + ' <a href="#" title="Go there" onclick="return sa.hms.ui.goto(\'' + id + '\', \''+pvCmd.cmd.id+'\');">' + pvCmd.keyName + '</a>[JSON decoded]';
										try {
											json2 = sa.hms.tools.augmentWithStats(result, null, sa.hms.settings.cs.path);
											if (!pvCmd.cmd.pvCmds[pvCmd.id]) {
												pvCmd.cmd.pvCmds[pvCmd.id] = {
													hmGstats: {
														totalValues: pvCmd.cmd.hmd.hms.values
													}
												};
											};
											pvCmd.cmd.pvCmds[pvCmd.id].hmGstats.totalValues += json2.hms.values;
										} catch(e) {};
										if (json2 && json2.hms) {
											json = json2;
											delete json2;
											
											json.hms.parentNode = item.d;
											json.hms.isRootVar = true;
											json.hms.themeChanged = true;
											var s = json.hms;
											json.hms.realParentID = s.keyID;//(type=='key'?s.keyID:s.valueID);
											//json.hms.parentNode.hms.realParentID = (type=='key'?s.keyID:s.valueID);
											//json.hms.parentNode.hms.themeChanged = true;
											
											localTheme = sa.hms.tools.getThemeByName('--json'); //TODO: get pvCmd.theme from pvCmd.theme
											var localThemeName = localTheme.themeName;
											var css = sa.colorGradients.generateCSS_for_jsonViewer (localTheme, json, s.realParentID);
											tableProps = localTheme.htmlSubLevelTableProps;
											sa.hms.tools.insertCSS(pvCmd.cmd, json, css, localTheme, 'JSON-string '+val);

											sa.hms.log (201, 'tools.printVariable(): JSON successfully decoded for #'+id+' - '+val);
											sa.m.trace(201);
											var html = 
											/*'<tr style="width:100%;">'
												+ '<td colspan="2">'
													+'<div>'
													+ '<div id="' + json.hms.keyID + '_header" class="hm hmExtraHeader hmJSON">' 
														+ '[ <a href="#" title="Expand" href="javascript:expand" class="hmNavE" onclick="return sa.hms.ui.expand(\'' + json.hms.keyID + '\', 1)">' 
														+ 'Valid JSON string</a>, ' 
														+ sa.m.sizeHumanReadable(val.length) + ', ' + sa.hms.tools.htmlArrayHeader(json) 
													+ '</div>'
													+'</div>'
												+'</td>'
											+'</tr>*/ '<tr>'
												+'<td colspan="2">' 
													+'<div>'
														+ sa.hms.tools.printNextLevel({
															id: json.hms.keyID,
															cmd: pvCmd.cmd,
															val: json,
															keyNameOrType: val,
															keyName: sa.hms.settings.cs.path,
															theme : localTheme,
															hmGstats: pvCmd.hmGstats,
															levelsAtOnce: pvCmd.levelsAtOnce
														}).html 
												+'</div>'	
											+'</td></tr>';
											var e = document.getElementById(id);
											if (!e) {
												// this is when the parent html hasn't been put into the DOM yet.
												var condition = function () {
													sa.hms.log (20, 'tools.printVariable()->JSONdecoder: #'+id+' - '+html);
													var e = document.getElementById( id);
													return e;
												};
												var callback = function () {
													jQuery('#'+id+'_placeholder').remove();
													var e = document.getElementById( id);
													if (e) e.innerHTML += html;
												};
												
												//debugger;

												sa.m.waitForCondition ('trying to insert HTML into #'+id+' - '+val, condition, callback, 1000);
											} else {
												try {
													jQuery('#'+id+'_placeholder').remove();
													e.innerHTML += html;
												} catch (err) {
												// damn IE...
													debugger;
													var html = '<table style="width:100%;"><tbody>' + html + '</tbody></table>';
													var span = document.createElement ('span');
													span.innerHTML = html;
													var tb = e.firstChild;
													tb.parentNode.replaceChild (span.firstChild.firstChild, tb);
												}
											};
										}
									},
									function (msg, ctx) { // onError callback handler
										var html = sa.hms.tools.printString(pvCmd, item, val);
										var e = document.getElementById( id);
										if (!e) {
											// this is when the parent html hasn't been put into the DOM yet.
											var condition = function () {
												sa.hms.log (20, 'tools.printVariable()->JSONdecoder: #'+id+' - '+html);
												var e = document.getElementById( id);
												return e;
												//if (e) e.innerHTML//wtf!
											};
											var callback = function () {
												jQuery('#'+id+'_placeholder').remove();
												var e = document.getElementById( id);
												if (e) e.innerHTML += html;
											};
											
											//debugger;
											sa.m.waitForCondition ('trying to insert HTML into #'+id+' - '+val, condition, callback, 1000);
										} else {
											try {
												jQuery('#'+id+'_placeholder').remove();
												e.innerHTML += html;
											} catch (err) {
											// damn IE...
												debugger;
												var html = '<table style="width:100%;"><tbody>' + html + '</tbody></table>';
												var span = document.createElement ('span');
												span.innerHTML = html;
												var tb = e.firstChild;
												tb.parentNode.replaceChild (span.firstChild.firstChild, tb);
											}
										};
									}
								);
							}
						} 
					}
					break;
			};


			return html;
		},
		
		get_hmo : function (pvCmd, item) {
			return item.d.hmo;
		},

		printString: function (pvCmd, item, w) {
			var 
			html = '',
			regx2 = new RegExp('<\/?\w+((\s+\w+(\s*=\s*(?:".*?"|\'.*?\'|[^\'">\s]+))?)+\s*|\s*)\/?>', 'gim');
			if (
				(typeof w == 'string' && (
					w.match(/var\s|class\s*|function\s*\(/)
					|| w.match (regx2)	
				)) //html/javascript string?
			) {
				var hmo = sa.hms.tools.get_hmo(pvCmd, item);
				
				if (pvCmd.isKey === true) {
					if (
						hmo.viewKey=='normal'
					) {
						html += w;
					} else {
						html += '<pre class="jshighlight__theme__'+hmo.viewKeyTheme+'" style="margin:0px;white-space:pre-wrap;"><code>'+sa.hms.tools.printStringAsHTML(pvCmd, hmo, w)+'</code></pre>';
					}
				} else {
					if (
						hmo.viewValue=='normal'
					) {
						html += w;
					} else {
						html += '<pre class="jshighlight__theme__'+hmo.viewValueTheme+'" style="margin:0px;white-space:pre-wrap;"><code>'+sa.hms.tools.printStringAsHTML(pvCmd, hmo, w)+'</code></pre>';
					}
				}
			} else {
				html += w;
			};
			//debugger;
			return html;
		},
		
		printStringAsHTML : function (pvCmd, hmo, w) {
			var content = w.replace(/\s+jQuery/,'').replace(/\t/g, '  ');//sa.hms.tools.wordWrap (w./*replace(/\</g, '&lt;').*/replace(/\s+jQuery/,'').replace(/\t/g, '  '), 80);
			var highlighted = hljs.highlightAuto(beautify(content,hmo,pvCmd.isKey)); 
			return highlighted.value;
		},
		
		wordWrap : function (v, maxCharsWide) {
			var p = v.split('\n');
			var rl = [''];
			var rlIdx = 0;
			for (var i=0; i<p.length; i++) {
				var l = p[i];
				if (l!=='') {
					var rx = /^(\s+)/;
					var m = rx.exec(l);
					var words = l.split(' ');
					for (var j=0; j<words.length; j++) {
							if (words[j].length + rl[rlIdx].length > maxCharsWide) {
								rlIdx++;
								rl[rlIdx] = /*'\n' +*/ (m && 1 in m?m[1]:'') + words[j] + ' ';
							} else {
								rl[rlIdx] += words[j]+' ';
							}
					};
					if (rl[rlIdx]!=='') {
						rlIdx++;
						rl[rlIdx] = '';
					}
						
				}
			};
			return rl.join('');// . join("\n");
		},

		unmarshall: function (k, v) {
			if (typeof v == 'string') {
				v = v.replace(/--\|>/g, '-->');
				//v = v.replace (/~`/g, '"');
				//v = v.replace (/\\n/g, '\n');
				//v = v.replace (/\\r/g, '\r');
				//v = v.replace (/\\t/g, '\t');
			}
			return v;
		},

		htmlArrayHeader: function (v, type) {
			var s = false;
			var id = (type=='key'?v.hms.keyID:v.hms.valueID);
			if (typeof v == 'object' && typeof v.hms == 'object') {
				s =
					'<div id="'+id+'_progressbar"></div>'+ 
					'[ Array, ' + 
					'<a href="#"title="Expand" class="hmNavE" onclick="return sa.hms.ui.expand(\'' + id + '\', 1);">' + v.hms.topKeys + ' top-level ' 
					+ (v.hms.topKeys > 1 ? ' keys' : ' key') + '</a>,' + 
					' ' + (v.hms.topKeys > 1 ? ' max ' : '') + 
					v.hms.depth + ' deep, ' +
					//(v.hms.keys==1 ? '1 key' : v.hms.keys+' keys')+', '+ // just redundant really
					'<a href="#"title="Expand All" class="hmNavE" onclick="return sa.hms.ui.expandAll(\'' + id + '\', \''+type+'\');">' 
					+ (v.hms.values == 1 ? '1 value' : v.hms.values + ' values') + '</a>, ' + 
					sa.m.sizeHumanReadable(v.hms.byteSize) + 
					(v.hms.depth>1?', ' + sa.hms.tools.htmlArrayExpandList(v, type, id):'')+
					' ]';
			};
			return s;
		},
		
		htmlArrayExpandList : function (v, type, id){
			var html = 'Expand: ';
			for (var i=2; i<=v.hms.depth; i++) {
				html += '<a href="#" title="Expand '+i+' levels" class="hmNavE" onclick="return sa.hms.ui.expand(\''+id+'\', '+i+');">'+i+'</a> ';
			}
			return html;
		},

		insertCSS: function (cmd, v, css, theme, origin) {

			// thx http://www.phpied.com/dynamic-script-and-style-elements-in-ie/ 
			if (typeof sa.hms.settings.cs.cssNode.cssText=='string') { //internet explorer, 
				sa.hms.settings.cs.cssNode.cssText = '' + css + sa.hms.settings.cs.cssNode.cssText;
			} else { // normal browsers
				var t = document.createTextNode(css);
				sa.hms.settings.cs.cssNode.appendChild(t, sa.hms.settings.cs.cssNode.firstChild);
			};

			var l = css.length;
			var stat = 'tools.insertCSS(): adding ' + sa.m.sizeHumanReadable(l, false) + ' of CSS to DOM for ' + cmd.id + ', ' + v.hms.keyID + ', ' + v.hms.depth + ' levels deep, from ' + origin + ' location, using theme ' + theme.themeName + '.'+'\n'+css;
			sa.hms.log(201, stat);
			cmd.byteSize.css += css.length;
			sa.hms.reportSizes(cmd);
		},

		htmlKeyTools: function (v, sibList) {
			var tools = '<br/>';
			if (v && typeof v.hmd == 'string') {
				if (
					(v.hmd.match(/&lt;/) && v.hmd.match(/&gt;/)) 
					|| (
						v.hmd.match(/</) 
						&& v.hmd.match(/>/) 
						&& !v.hmd.substr(0, 10).match(/[\[{]/)
					)
				) tools += ' <br/><a href="#" class="hmTool" onclick="return sa.hms.ui.makeRenderedHTML(\'' + v.hms.keyID + '\');">&lt;html&gt;</a>';
				tools += ' <br/><a href="#" class="hmTool" onclick="return sa.hms.ui.makePre(\'' + v.hms.keyID + '\');">&lt;pre&gt;</a><br/>';
			}
			tools += '<br/>';
			if (sibList[n]) {
				if (sibList[n].prevSiblingID) tools += ' <a href="#" title="Go there" class="hmNavS" onclick="return sa.hms.ui.goto(\'' + sibList[n].prevSiblingID + '\');">[prev]</a>';
				if (sibList[n].nextSiblingID) tools += ' <a href="#" title="Go there" class="hmNavS" onclick="return sa.hms.ui.goto(\'' + sibList[n].nextSiblingID + '\');">[next]</a>';
			};
			return tools;
		},

		walk: function (hmd, func) {
			if (
				typeof hmd == 'object' 
				&& typeof hmd.hms == 'object'
			) {
				hmd = hmd.hmd;
			}

			var tv = typeof hmd;
			switch (tv) {
				case 'undefined':
				case 'number':
				case 'boolean':
				case 'function':
				case 'string':
					hmd = func(hmd);
					break;
				case 'object':
					for (i in hmd) {
					hmd[i] = sa.hms.tools.walk(hmd[i], func);
					}
					break;
			}
			
			return hmd;
		},

		displayError: function (cmd, errStr) {
			var e = document.getElementById(cmd.id);
			if (e) e.innerHTML += '<br/><br/>' + '<b>jsonViewer failed to parse this.<br/>Please check your javascript debugger log.</b>' + '<br/><br/>' + errStr;
			sa.hms.error(errStr);
		},

		addTheme: function (contributerName, themeName, theme) {
			if (!sa.hms.options.contributors[contributorName]) {
				sa.hms.options.contributors[contributorName] = {
					themes: {}
				};
			}
			sa.hms.options.contributors[contributorName].themes[themeName] = theme;
		},

		selfTest: function (htmlID, title) {
			hm(sa.m.cloneObject(sa.hms), (title ? title : 'hms self-test dump'), {
				htmlID: htmlID
			});
		},

		arrayExclude: function (te, sa) {
			var r = {};
			for (k in sa) {
				var copy = true;
				for (l in te) {
					if (l == k) {
						copy = false;
						break;
					};
				}
				if (copy) r[k] = sa[k];
			}
			return r;
		},

		is_float: function (mv) {
			// Returns true if variable is float point  
			// 
			// version: 911.718
			// discuss at: http://phpjs.org/functions/is_float    // +   original by: Paulo Ricardo F. Santos
			// +   bugfixed by: Brett Zamir (http://brett-zamir.me)
			// +   improved by: WebDevHobo (http://webdevhobo.blogspot.com/)
			// %        note 1: 1.0 is simplified to 1 before it can be accessed by the function, this makes
			// %        note 1: it different from the PHP implementation. We can't fix this unfortunately.    // *     example 1: is_float(186.31);
			// *     returns 1: true
			if (typeof mv !== 'number') {
				return false;
			}
			return !! (mv % 1);
		},

		//thanx http://javascript.about.com/library/blh2d.htm :
		dec2hex: function (d) {
			var r = Math.abs(d).toString(16);
			if (r.length == 1) r = '0' + r;
			return r;
		},
		hex2dec: function (h) {
			return parseInt(h, 16);
		},

		chr: function (codePt) {
			// Converts a codepoint number to a character  
			// 
			// version: 909.322
			// discuss at: http://phpjs.org/functions/chr    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
			// +   improved by: Brett Zamir (http://brett-zamir.me)
			// *     example 1: chr(75);
			// *     returns 1: 'K'
			// *     example 1: chr(65536) === '\uD800\uDC00';    // *     returns 1: true
			if (codePt > 0xFFFF) {
				// Create a four-byte string (length 2) since this code point is high
				//   enough for the UTF-16 encoding (JavaScript internal use), to
				//   require representation with two surrogates (reserved non-characters                                             //   used for building other characters; the first is "high" and the next "low")
				codePt -= 0x100;
				return String.fromCharCode(0xD800 + (codePt >> 10), 0xDC00 + (codePt & 0x3FF));
			} else {
				return String.fromCharCode(codePt);
			}
		},
		strpos: function (haystack, needle, offset) {
			// Finds position of first occurrence of a string within another  
			// 
			// version: 909.322
			// discuss at: http://phpjs.org/functions/strpos    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
			// +   improved by: Onno Marsman    
			// +   bugfixed by: Daniel Esteban
			// *     example 1: strpos('Kevin van Zonneveld', 'e', 5);
			// *     returns 1: 14    
			var i = (haystack + '').indexOf(needle, (offset ? offset : 0));
			return i === -1 ? false : i;
		},

		makeTraceHumanReadable: function (btd/*PHP's debug_backtrace() hmd*/ ) {
			var r = {
				trace: {
					hmo: {
						themeName: '--trace--',
						keyRenderHTML: true
					}
				}
			};
			for (i in btd) {
				if (i == 'hmo') continue;
				var d = btd[i];
				if (btd.hmo && btd.hmo.urlEditor && btd.hmo.urlEditor != '') {
					var url = btd.hmo.urlEditor;
					url = url.replace(/{MACHINE}/, 'seductiveapps.com');
					url = url.replace(/{ROOT}/, '');
					url = url.replace(/{FP}/, escape(d.file).replace(/nope\//, 'nope/'));
					url = url.replace(/{LINE}/, d.line);
				} else {
					var url = '';
				};
			}
			r.trace = btd;
			r.hmo = btd.hmo;
			return r;
		},

		getThemeByName: function (themeName) {
			var r = false;
			if (typeof themeName!='string') {
				debugger;
			} else {
				if (themeName.substr(0, 2) == '--') {
					themeName = themeName.replace(/--/g, '');
					for (i in sa.hms.options.current.themeChoices) {
						if (i == themeName) {
							r = sa.hms.options.current.themes[
							sa.hms.options.current.themeChoices[i]];
						}
					}
				}
				if (!r) {
					for (i in sa.hms.options.current.themes) {
						if (i == themeName) {
							r = sa.hms.options.current.themes[i];
						}
					}
				}
			}
			return r;
		},

		getPath: function (pvCmd, v, returnHTML) {
			if (typeof returnHTML == 'undefined') returnHTML = true;
			if (typeof v == 'object') {
				//	  console.trace();
			}
			if (typeof v == 'undefined') {
				//console.trace();
				return 'undefined_v';
			}

			v = v.hms.parentNode;
			var p = [v];
			var cmd = pvCmd.cmd;

			if (!v.hms) {
				p.push(pvCmd.parentNode);
				v = pvCmd.parentNode;
			};
			while (v.hms && v.hms.parentNode) {
				if (v.hms.keyName != 'hmo') {
					p.push(v.hms.parentNode);
					v = v.hms.parentNode;
				}
			}
			var html = '';
			//html += '"' + cmd.title + '" / ';
			html += '';
			p = p.reverse();
			var first = true;
			var second = false;
			for (k in p) {
				if (first) {
					first = false;
				} else {
					if (p[k] && p[k].hms) {
						if (returnHTML) {
							html += '<a href="#'+p[k].hms.keyID+'" title="Go there" class="hmNavP" onclick="return sa.hms.ui.goto(\'' + p[k].hms.keyID + '\', \''+pvCmd.cmd.id+'\');">' + p[k].hms.keyNameOrType + '</a> / ';
						} else {
							html += p[k].hms.keyNameOrType + ' / ';
						}
					}
				}
			}
			//if (v && v.hms && v.hms.keyNameOrType && v.hms.keyNameOrType!='')
			//html += v.hms.keyNameOrType;
			return html;
		},

		augmentWithStats: function (v, parentNode, titl) {
			var levelCount = {
				topKeys: 0,
				keys: 0,
				values: 0,
				depth: 0,
				byteSize: 0,
				level: (parentNode ? parentNode.hms.level : 0),
				keyNameOrType: titl,
				isSubArray: false,
				parentNode: parentNode
			};

			var w = {
				hmd: {},
				hms: levelCount,
				hmo : {
					viewKey : 'normal',
					viewKeyMode : 'htmlmixed',
					viewKeyTheme : sa.hms.globals.sourceBeautifierThemes.definitions['htmlmixed'],
					viewValue : 'normal',
					viewValueMode : 'htmlmixed',
					viewValueTheme : sa.hms.globals.sourceBeautifierThemes.definitions['htmlmixed'],
					keyAutoFormat : 'off',
					valueAutoFormat : 'on'
				}
			};

			if (typeof v == 'function') {
				/*
				var q = {
					hmFunction: '' + v //convert to plaintext
				};
				v = q;
				*/
				w.hms.isFunction = true;
				w.hmo.viewValue = 'source';
				w.hmo.viewValueMode = 'javascript';
				w.hmo.valueAutoFormat = 'off';
				w.hmo.viewValueTheme = sa.hms.globals.sourceBeautifierThemes.definitions[w.hmo.viewValueMode];
				//debugger;
				v = '' + (v.traceOff?v.traceOff:v);
			} 
			
			if (typeof v == 'object') {
				levelCount.isSubArray = true;
				levelCount.level++;
				if (v===null) {
					//debugger;
					return v;
				}
				if (typeof v.hms == 'object' && typeof v.hmd == 'object') {
					return v;
				}
				var maxDepth = 0;
				for (var a in v) {
					if (a == 'hmo') {
						//sa.hms.settings.cs.hmo = v[a];
						continue;
					};
					if (a == 'parentNode') {
						continue;
					};
					if (v[a]===null) {
						continue;
					};
					levelCount.topKeys++;
					levelCount.keys++;
					levelCount.byteSize += sa.hms.tools.getByteSize(a);
					
					v[a] = sa.hms.tools.augmentWithStats(v[a], w, a);
					v[a].hms.keyName = a;
					
					if (typeof v[a].hms != 'object') {
						sa.hms.log('Gathering stats failed for :' + a);
					} else {
						levelCount.byteSize += v[a].hms.byteSize;
						levelCount.values += v[a].hms.values;
						levelCount.keys += v[a].hms.keys;
						maxDepth = Math.max(maxDepth, v[a].hms.depth);
					}
				};
				levelCount.depth++;
				levelCount.depth += maxDepth;
				if (levelCount.depth > 1) levelCount.values++; //you won't believe how long it took to find this one.
			} else {
				levelCount.values++;
				levelCount.byteSize += sa.hms.tools.getByteSize(v);
			};

			sa.hms.settings.cs.debugID++;
			levelCount.keyID = 'hm_' + sa.hms.settings.cs.debugID; 
			sa.hms.settings.cs.debugID++;
			levelCount.valueID = 'hm_' + sa.hms.settings.cs.debugID; 
			levelCount.isObject = levelCount.isSubArray;

			if (typeof v == 'object') {
				for (k in v) {
					if (k == 'hmo') {
						w[k] = v[k];
					} else {
						w.hmd[k] = v[k];
						if (levelCount.level == 1) levelCount.values++;
					}
				}
			} else {
				w.hmd = v;
			};
			if (levelCount.level == 1) levelCount.values--;
			sa.hms.settings.cs.dataPointers[levelCount.keyID] = {
				type : 'key',
				val : w
			};
			sa.hms.settings.cs.dataPointers[levelCount.valueID] = {
				type : 'data',
				val : w
			};
			
			return w;
		},

		getByteSize: function (v) {
			var tv = typeof(v);
			switch (tv) {
				case 'boolean':
					return 1;
					break;
				case 'number':
					return 8;
					break;
				case 'string':
					return v.length;
					break;
			}
			return 0;
		},

		htmlentities: function (string, quote_style) {
			if (typeof string != 'string') return string;
			// Convert all applicable characters to HTML entities  
			// 
			// version: 909.322
			// discuss at: http://phpjs.org/functions/htmlentities    // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
			// +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
			// +   improved by: nobbler
			// +    tweaked by: Jack
			// +   bugfixed by: Onno Marsman    // +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
			// +    bugfixed by: Brett Zamir (http://brett-zamir.me)
			// +      input by: Ratheous
			// -    depends on: get_html_translation_table
			// *     example 1: htmlentities('Kevin & van Zonneveld');    // *     returns 1: 'Kevin &amp; van Zonneveld'
			// *     example 2: htmlentities("foo'bar","ENT_QUOTES");
			// *     returns 2: 'foo&#039;bar'
			var hash_map = {},
			symbol = '',
			tmp_str = '',
			entity = '';
			tmp_str = string.toString();
			if (false === (hash_map = sa.hms.tools.get_html_translation_table('HTML_ENTITIES', quote_style))) {
				return false;
			}
			hash_map["'"] = '&#039;';
			for (symbol in hash_map) {
				entity = hash_map[symbol];
				tmp_str = tmp_str.split(symbol).join(entity);
			}
			
			return tmp_str;
		},

		htmlentities_decode: function (string, quote_style) {
			if (typeof string != 'string') return string;
			var hash_map = {},
			symbol = '',
			tmp_str = '',
			entity = '';
			tmp_str = string.toString();
			if (false === (hash_map = sa.hms.tools.get_html_translation_table('HTML_ENTITIES', quote_style))) {
				return false;
			}
			hash_map["'"] = '&#039;';
			for (symbol in hash_map) {
				entity = hash_map[symbol];
				var regx = new RegExp(entity, 'g');
				tmp_str = tmp_str.replace(regx, symbol);
			}
			return tmp_str;
		},

		get_html_translation_table: function (table, quote_style) {
			// Returns the internal translation table used by htmlspecialchars and htmlentities  
			// 
			// version: 909.322
			// discuss at: http://phpjs.org/functions/get_html_translation_table    // +   original by: Philip Peterson
			// +    revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
			// +   bugfixed by: noname
			// +   bugfixed by: Alex
			// +   bugfixed by: Marco    // +   bugfixed by: madipta
			// +   improved by: KELAN
			// +   improved by: Brett Zamir (http://brett-zamir.me)
			// +   bugfixed by: Brett Zamir (http://brett-zamir.me)
			// +      input by: Frank Forte    // +   bugfixed by: T.Wild
			// +      input by: Ratheous
			// %          note: It has been decided that we're not going to add global
			// %          note: dependencies to php.js, meaning the constants are not
			// %          note: real constants, but strings instead. Integers are also supported if someone    // %          note: chooses to create the constants themselves.
			// *     example 1: get_html_translation_table('HTML_SPECIALCHARS');
			// *     returns 1: {'"': '&quot;', '&': '&amp;', '<': '&lt;', '>': '&gt;'}
			var entities = {},
			hash_map = {},
			decimal = 0,
			symbol = '';
			var constMappingTable = {},
			constMappingQuoteStyle = {};
			var useTable = {},
			useQuoteStyle = {};

			// Translate arguments
			constMappingTable[0] = 'HTML_SPECIALCHARS';
			constMappingTable[1] = 'HTML_ENTITIES';
			constMappingQuoteStyle[0] = 'ENT_NOQUOTES';
			constMappingQuoteStyle[2] = 'ENT_COMPAT';
			constMappingQuoteStyle[3] = 'ENT_QUOTES';
			useTable = !isNaN(table) ? constMappingTable[table] : table ? table.toUpperCase() : 'HTML_SPECIALCHARS';
			useQuoteStyle = !isNaN(quote_style) ? constMappingQuoteStyle[quote_style] : quote_style ? quote_style.toUpperCase() : 'ENT_COMPAT';

			if (useTable !== 'HTML_SPECIALCHARS' && useTable !== 'HTML_ENTITIES') {
				throw new sa.json.decode.error(ctx, "Table: " + useTable + ' not supported'); // return false;
			}

			entities['38'] = '&amp;';
			if (useTable === 'HTML_ENTITIES') {
				entities['160'] = '&nbsp;';
				entities['161'] = '&iexcl;';
				entities['162'] = '&cent;';
				entities['163'] = '&pound;';
				entities['164'] = '&curren;';
				entities['165'] = '&yen;';
				entities['166'] = '&brvbar;';
				entities['167'] = '&sect;';
				entities['168'] = '&uml;';
				entities['169'] = '&copy;';
				entities['170'] = '&ordf;';
				entities['171'] = '&laquo;';
				entities['172'] = '&not;';
				entities['173'] = '&shy;';
				entities['174'] = '&reg;';
				entities['175'] = '&macr;';
				entities['176'] = '&deg;';
				entities['177'] = '&plusmn;';
				entities['178'] = '&sup2;';
				entities['179'] = '&sup3;';
				entities['180'] = '&acute;';
				entities['181'] = '&micro;';
				entities['182'] = '&para;';
				entities['183'] = '&middot;';
				entities['184'] = '&cedil;';
				entities['185'] = '&sup1;';
				entities['186'] = '&ordm;';
				entities['187'] = '&raquo;';
				entities['188'] = '&frac14;';
				entities['189'] = '&frac12;';
				entities['190'] = '&frac34;';
				entities['191'] = '&iquest;';
				entities['192'] = '&Agrave;';
				entities['193'] = '&Aacute;';
				entities['194'] = '&Acirc;';
				entities['195'] = '&Atilde;';
				entities['196'] = '&Auml;';
				entities['197'] = '&Aring;';
				entities['198'] = '&AElig;';
				entities['199'] = '&Ccedil;';
				entities['200'] = '&Egrave;';
				entities['201'] = '&Eacute;';
				entities['202'] = '&Ecirc;';
				entities['203'] = '&Euml;';
				entities['204'] = '&Igrave;';
				entities['205'] = '&Iacute;';
				entities['206'] = '&Icirc;';
				entities['207'] = '&Iuml;';
				entities['208'] = '&ETH;';
				entities['209'] = '&Ntilde;';
				entities['210'] = '&Ograve;';
				entities['211'] = '&Oacute;';
				entities['212'] = '&Ocirc;';
				entities['213'] = '&Otilde;';
				entities['214'] = '&Ouml;';
				entities['215'] = '&times;';
				entities['216'] = '&Oslash;';
				entities['217'] = '&Ugrave;';
				entities['218'] = '&Uacute;';
				entities['219'] = '&Ucirc;';
				entities['220'] = '&Uuml;';
				entities['221'] = '&Yacute;';
				entities['222'] = '&THORN;';
				entities['223'] = '&szlig;';
				entities['224'] = '&agrave;';
				entities['225'] = '&aacute;';
				entities['226'] = '&acirc;';
				entities['227'] = '&atilde;';
				entities['228'] = '&auml;';
				entities['229'] = '&aring;';
				entities['230'] = '&aelig;';
				entities['231'] = '&ccedil;';
				entities['232'] = '&egrave;';
				entities['233'] = '&eacute;';
				entities['234'] = '&ecirc;';
				entities['235'] = '&euml;';
				entities['236'] = '&igrave;';
				entities['237'] = '&iacute;';
				entities['238'] = '&icirc;';
				entities['239'] = '&iuml;';
				entities['240'] = '&eth;';
				entities['241'] = '&ntilde;';
				entities['242'] = '&ograve;';
				entities['243'] = '&oacute;';
				entities['244'] = '&ocirc;';
				entities['245'] = '&otilde;';
				entities['246'] = '&ouml;';
				entities['247'] = '&divide;';
				entities['248'] = '&oslash;';
				entities['249'] = '&ugrave;';
				entities['250'] = '&uacute;';
				entities['251'] = '&ucirc;';
				entities['252'] = '&uuml;';
				entities['253'] = '&yacute;';
				entities['254'] = '&thorn;';
				entities['255'] = '&yuml;';
			}

			if (useQuoteStyle !== 'ENT_NOQUOTES') {
				entities['34'] = '&quot;';
			}
			if (useQuoteStyle === 'ENT_QUOTES') {
				entities['39'] = '&#39;';
			}
			entities['60'] = '&lt;';
			entities['62'] = '&gt;';

			// ascii decimals to real symbols
			for (decimal in entities) {
				symbol = String.fromCharCode(decimal);
				hash_map[symbol] = entities[decimal];
			}

			return hash_map;
		},

		/*initialized: false,*/
		lastKey: function (arr) {
			var last = false;
			for (i in arr) {
				last = i;
			}
			return last;
		}
	} //tools
}; //sa.jsonViewer

function hm (variable, title, options, callback) {
	var html = '<span id="hm_' + options.htmlID + '_longMsg"> </span><br/><br/>' + '<span id="' + options.htmlID + '_shortMsg"> </span><br/><br/>';
	if (!options || !options.htmlID) {
		var e = document.createElement('div');
		e.id = hmd.id;
		e.innerHTML = html;
		document.body.appendChild(e);
	} else {
		var e = document.getElementById(options.htmlID);
		if (!e) debugger;
		e.innerHTML = html;
	};

	if (options.fastInit===true) {
		sa.hms.settings.cs.debugID++;
		var hmd = {
			id: (options && options.htmlID ? options.htmlID : 'debugSub_' + sa.hms.settings.cs.debugID),
			hmd: variable,
			date: Date(),
			time: sa.m.elapsedMilliseconds() / 1000,
			title: title,
			options : options,
			//externalScrollpaneID : 'siteContent__scrollpane',
			hmdOrigin: 'js'
		};

		var hmCmd = sa.jsonViewer.process(hmd);
		if (typeof options.initCallback=='function') options.initCallback (hmCmd);
		if (typeof callback=='function') callback (hmCmd);
		return hmCmd;
	} else {
		sa.m.cloneObjectAsync({
			original : variable,
			origin : { title : title, options : options },
			statusUpdateTo : 'hm_'+options.htmlID+'_longMsg',
			resultCallback : function (cmd) {
				sa.hms.settings.cs.debugID++;
				var hmd = {
					id: (cmd.origin.options && cmd.origin.options.htmlID ? cmd.origin.options.htmlID : 'debugSub_' + sa.hms.settings.cs.debugID),
					hmd: cmd.result,
					date: Date(),
					time: sa.m.elapsedMilliseconds() / 1000,
					title: cmd.origin.title,
					options : cmd.origin.options,
					//externalScrollpaneID : 'siteContent__scrollpane',
					hmdOrigin: 'js'
				};

				var hmCmd = sa.jsonViewer.process(hmd);
				if (typeof options.initCallback=='function') options.initCallback (hmCmd);
				if (typeof callback=='function') callback (hmCmd);
			}
		});	
	}
};
