sa.lucidLog.php = {
	about : {
		whatsThis : 'seductiveapps.lucidLog.php = sa.l.php = A way to capture PHP errors, warnings and notices and present them in an attractive intuitive interface in the browser (instead of ending up all over the place between your html).',
		copyright : '(c) (r) 2011-2013 by [the owner of seductiveapps.com] <info@seductiveapps.com>',
		license : 'http://seductiveapps.com/seductiveapps/license.txt',
		noWarranty : 'NO WARRANTY EXPRESSED OR IMPLIED. USE ONLY AT YOUR OWN RISK.',
		version: '0.9.0',
		dependencies: {
		  'jQuery.com': 'version>=1.4'
		},
		firstReleased : '2011',
		lastUpdated : '2013 June 4',
		knownBugs : {
			1 : "I need to spend more time on this component, but don't have a need to at the moment (2015 2012 March 11). But in a lot of cases it works already. I could use some help in identifying (and perhaps fixing) these un-identified bugs."
		},
		downloadURL : 'http://seductiveapps.com/'
	},
	templates : {
		logEntry : {
			time : 0,
			text : 'string',
			data : {}
		},
		log : {
			entries : [ {} ] // logEntry
		}
	},
	options : {
		showHideDuration : 300,
		animationEffect : 'linear',
		contentSources : [ 'PHP' ],
		contentSourceBtnThemeUnselected : 'sasBlue1',
		contentSourceBtnThemeSelected : 'sasGreen',
		colorShiftingTotalSteps : 15,
		cs : {
			nextID : 1,
			minHeight : -1,
			currHeight : -1
		},
		authorsDefaults : {
			themes : {
				'sasGreen' : {
					'hmTheme' : 'saColorgradientSchemeGreen',
					colorLevels : {
						0 : {
							'colorEntryBackground' : '#00bb00',
							'colorEntryText' : '#005000',
							'colorEntryHREF' : '#00BB00'
						},
						100 : {
							'colorEntryBackground' : '#00FF00',
							'colorEntryText' : '#009000',
							'colorEntryHREF' : 'yellow'
						}
					}							
				},
				'sasBlue1' : {
					'hmTheme' : 'saColorgradientSchemeIce',
					colorLevels : {
						0 : {
							'colorEntryBackground' : 'navy',
							'colorEntryText' : 'cyan',
							'colorEntryHREF' : 'white'
						},
						100 : {
							'colorEntryBackground' : 'blue',
							'colorEntryText' : 'white',
							'colorEntryHREF' : 'yellow'
						}
					}							
				},
				'sasBlue2' : {
					'hmTheme' : 'saColorgradientSchemeIce',
					colorLevels : {
						0 : {
							'colorEntryBackground' : 'navy',
							'colorEntryText' : 'cyan',
							'colorEntryHREF' : 'white'
						},
						100 : {
							'colorEntryBackground' : 'blue',
							'colorEntryText' : 'white',
							'colorEntryHREF' : 'yellow'
						}
					}							

				},
				'sasYellow' : {
					'hmTheme' : 'saColorgradientSchemeYellow',
					colorLevels : {
						0 : {
							'colorEntryBackground' : 'orange',
							'colorEntryText' : 'brown',
							'colorEntryHREF' : 'red'
						},
						100 : {
							'colorEntryBackground' : 'yellow',
							'colorEntryText' : 'red',
							'colorEntryHREF' : '#ff9090'
						}
					}							
				},
				'sasOrange' : {
					'hmTheme' : 'saColorgradientSchemeOrange',
					colorLevels : {
						0 : {
							'colorEntryBackground' : '#FF6600',
							'colorEntryText' : '#400000',
							'colorEntryHREF' : '#700000'
						},
						100 : {
							'colorEntryBackground' : '#FFaa00',
							'colorEntryText' : '#b00000',
							'colorEntryHREF' : '#ff0000'
						}
					}							
				},
				'sasRed' : {
					'hmTheme' : 'saColorgradientSchemeRed',
					colorLevels : {
						0 : {
							'colorEntryBackground' : '#600000',
							'colorEntryText' : 'white',
							'colorEntryHREF' : 'yellow'
						},
						100 : {
							'colorEntryBackground' : 'red',
							'colorEntryText' : 'yellow',
							'colorEntryHREF' : 'white'
						}
					}							
				}
			},
			'phpErrorType2ThemeChoices' : {
				'Error' : 'sasRed',
				'Warning' : 'sasOrange',
				'Parsing Error' : 'sasRed',
				'Notice' : 'sasGreen',
				'Core Error' : 'sasRed',
				'Core Warning' : 'sasOrange',
				'Compile Error' : 'sasRed',
				'Compile Warning' : 'sasOrange',
				'User Error' : 'sasRed',
				'User Warning' : 'sasOrange',
				'User Notice' : 'sasBlue1',
				'Strict' : 'sasGreen',
				'Recoverable' : 'sasGreen',
				'Depracated' : 'sasGreen',
				'User-level Depracated' : 'sasGreen'
			}
		}
	},
	cmds : { // [cmdID] = {}
	},
	cmd : {
		context2itemID : {},
		itemID2context : {},	
		itemID2contentSource : {}
	},
	animationItems : {}, // which items to animate
	
	hide : function () {
		for (var cmdID in sa.l.php.cmds) {
			jQuery('#'+cmdID).hide();
		}
	},
	show : function () { 
		for (var cmdID in sa.l.php.cmds) {
			jQuery('#'+cmdID).show();
		}
	},
	toggleHide : function () {
		for (var cmdID in sa.l.php.cmds) {
			if (jQuery('#'+cmdID).css('display')=='none') {
				jQuery('#'+cmdID).show();
				sa.l.php.tools.resizeWindow(cmdID);
			} else {
				jQuery('#'+cmdID).hide();
			}
		}
	},
	
	initialize : function () {
		if (typeof sa.l.php.cmd.cmdID!='undefined') return {error:'lah already initialized as #'+sa.l.php.cmd.cmdID};
		var cmdID = sa.l.php.tools.nextID();
		sa.l.php.cmd.cmdID = cmdID;
		sa.l.php.cmd.activeSource = 'PHP';

    var d = new Date();
    var t = d.getTime();
		sa.l.php.timeOfStart = t;

		sa.l.php.cmds[cmdID] = {
			items : {}
		}; 
/*		
		// build window/container HTML and insert into DOM.
		var bodyHTML = 
			'<div id="' + cmdID + '" class="holder osX ui-widget-content logAndHandler" style="display:none; position:absolute; z-index:10000; overflow:hidden; padding:3px; width:100%;">' +
			'<div id="' + cmdID + '_background" style="position:absolute">' +
			'<img id="' + cmdID + '_backgroundImg" class="backgroundImg" src="'+sa.l.php.options.rootURL+'images/bg.jpg" style="position:absolute;display:block;z-index:-1">' +
			'</div>' +
			'<table id="lahTools" style="width:100%;z-index:10001">' +
			'<tr>';

		var i=0;
		var first = true;
		for (i=0; i<sa.l.php.options.contentSources.length; i++) {
			bodyHTML +=
			'<td style="width:120px"><div id="'+cmdID+'_contentSourceButton_'+sa.l.php.options.contentSources[i]+'" class="lahButton" style="text-align:center; padding:2px">'+
				sa.l.php.options.contentSources[i] +
			'</div></td>';
			first = false;
		};
		bodyHTML += 
			'<td>&nbsp;</td>'+
			'<td style="width:20px"><img id="ll_btnRefresh" src="'+sa.l.php.options.rootURL+'images/refresh.png" style="width:20px;height:20px;"/></td>'+
			'<td style="width:20px"><img id="ll_btnClose" src="'+sa.l.php.options.rootURL+'images/close.png" style="width:20px;height:20px;"/></td>' +
			'</tr></table>';
*/
		var bodyHTML = '', first = true;
		for (i=0; i<sa.l.php.options.contentSources.length; i++) {
			var style = ( first ? 'style="width:100%;height:100%;position:absolute;"' : 'style="display:none;width:100%;height:100%;position:absolute;"');
			bodyHTML += '<div id="'+cmdID+'_content_'+sa.l.php.options.contentSources[i]+'" class="vividScrollpane vividTheme__scroll_black" '+style+'></div>';
			first = false;
		};
		bodyHTML += '</div>';

		jQuery('#saLucidLog_page_php').append (bodyHTML);


		// refresh handler
		jQuery('#saLucidLog_btnRefresh').click(function() {
			sa.l.php.tools.loadContextsList (cmdID); 
		});
		
		// rounded corners for the lah window frame plz:
		jQuery('#'+cmdID).css ({borderRadius:'5px'});
		// initialize the buttons as switches between languages:
		for (var i=0; i<sa.l.php.options.contentSources.length; i++) {
			var toolID = cmdID+'_contentSourceButton_'+ sa.l.php.options.contentSources[i];
			sa.l.php.tools.applyBaseColors (cmdID, toolID, (i==0?sa.l.php.options.contentSourceBtnThemeSelected:sa.l.php.options.contentSourceBtnThemeUnselected));				
			sa.l.php.tools.startColorShifting (cmdID, toolID, (i==0?sa.l.php.options.contentSourceBtnThemeSelected:sa.l.php.options.contentSourceBtnThemeUnselected), (i==0));

			jQuery('#'+toolID).css({borderRadius:5}).click (function () {
				var k = 0;
				// stage 1 : visually select clicked button

				// visually de-select all but clicked button
				for (k=0; k<=sa.l.php.options.contentSources.length; k++) {
					var toolID = cmdID+'_contentSourceButton_'+ sa.l.php.options.contentSources[k];
					if (toolID!=this.id) {
					sa.l.php.tools.applyBaseColors (cmdID, toolID, sa.l.php.options.contentSourceBtnThemeUnselected);				
					sa.l.php.tools.startColorShifting (cmdID, toolID, sa.l.php.options.contentSourceBtnThemeUnselected, false);
					}
				};
				// visually select clicked button
				sa.l.php.tools.applyBaseColors (cmdID, this.id, sa.l.php.options.contentSourceBtnThemeSelected);				
				sa.l.php.tools.startColorShifting (cmdID, this.id, sa.l.php.options.contentSourceBtnThemeSelected, true);

				// stage 2: functionality handling
				sa.l.php.cmd.activeSource = this.innerHTML;
				for (k=0; k<sa.l.php.options.contentSources.length; k++) {
					var toolID = cmdID+'_content_'+ sa.l.php.options.contentSources[k];
					var btnID = cmdID+'_contentSourceButton_'+sa.l.php.options.contentSources[k];
					if (this.id!=btnID) {
					jQuery('#'+toolID).css ({display:'none'});
					//jQuery('#'+toolID).parent().css ({display:'none'});
					} else {
					jQuery('#'+toolID).css ({display:'block'});
					//jQuery('#'+toolID).parent().css ({display:'block'});
					}
				};
				sa.l.php.tools.resizeWindow(cmdID);
			});
		}

		// register some of the handlers we'll be using:
		jQuery(window).resize (function () {
			//ignore all window.resize commands for 1/3rd of a second;
			if (sa.l.php.cmd.windowResizeTimeout) {
				return false;
			} else {				
				sa.l.php.cmd.windowResizeTimeout = setTimeout (function () {
					sa.l.php.tools.resizeWindow (cmdID);
					delete sa.l.php.cmd.windowResizeTimeout;
				}, 333);
			}
		});
		jQuery(window).scroll (function () {
			//ignore all scrolling commands (darn mousewheel) for 1/5th of a second;
			if (sa.l.php.cmd.scrollTimeout) {
				return false;
			} else {				
				sa.l.php.cmd.scrollTimeout = setTimeout (function () {
					sa.l.php.tools.resizeWindow (cmdID);
					delete sa.l.php.cmd.scrollTimeout;
				}, 200);
			}
		});
		
		
		// start animations:
		//sa.l.php.tools.doColorShiftingNextStep(cmdID); 

		// announce ourselves on the javascript tab
		/*sa.l.php.cmd.helpID = sa.l.php.report_javascript ('logAndHandler registred as lah in the root of the javascript namespace.', {
			help : {
				'create a javascript log entry' :
					'sa.l.php.report (errorData, title, trace);<br/>'+
					'You can pass a string or object as errorData,<br/>'+
					'only a string as title, and a boolean for trace.'
			}
		}, true);*/

		// initialize this component asynchronously:
			sa.l.php.tools.loadContextsList (cmdID); 
			// also color formats the list and 
			// initializes color shifting animations of lah()		
	},
	report : function (title, data, trace) {
		return sa.l.php.report_javascript (title, data, trace); 
	},
	report_javascript : function (title, data, trace) {
		var html = '';
		var htmlItem = '';
		var cmdID = sa.l.php.cmd.cmdID;
		if (!cmdID) return false;
		var itemID = sa.l.php.tools.nextID();

		if (sa.l.php.cmd.helpID) {
			jQuery('#'+sa.l.php.cmd.helpID).css ({display:'none'});
		};

	    var d = new Date();
	    var timeCode = d.getTime() - sa.l.php.timeOfStart;
		timeCode = sa.m.secondsToTimeString(timeCode/1000);
		//timeCode = timeCode.replace(/, /g,',<br/>'); // leads to wasted whitespace

		if (typeof title=='string') htmlItem += '<span class="lahJSitemTitle">' + title + '</span><br/>';
		if (trace===true) {
			sa.m.trace();
			htmlItem += '<span class="lahJSitemTrace">Trace-request with this time code sent to javascript console!</span>';
		};
		if (typeof data=='string') {
			data = data.replace(/\r\n/g, '<br/>\r\n');
			htmlItem += '<span class="lahJSitemMsg">'+data+'</span><br/>';
		};
		if (typeof data=='object' && data!==null) {
			htmlItem += 
				'<div id="'+itemID+'_hmHolder" class="holder osX">' +
				'<div id="'+itemID+'_pane" class="scroll-pane">' +
				'<div id="'+itemID+'_hm" class="jsonViewer"> </div>' +
				'</div></div>';
		};

		html += '<div id="'+itemID+'" class="lahJSitem">';
		html += '<table cellspacing="2" cellpadding="2">';
		html += '<tr>';
		html += '<td id="'+itemID+'_time" class="lahJSitemTime">';
		html += timeCode;
		html += '</td>';
		html += '<td id="'+itemID+'_item" class="lahJSitemItem">';
		html += htmlItem;
		html += '</td>';
		html += '</tr>';
		html += '</table>';
		html += '</div>';

		jQuery('#'+cmdID+'_content_Javascript')[0].innerHTML += html;
		sa.sp.containerSizeChanged (jQuery('#'+cmdID+'_content_Javascript')[0], true);
		jQuery('#'+itemID).css ({borderRadius:5,opacity:0.7});
		var ids = '#'+itemID+'_time, #'+itemID+'_item';
		jQuery(ids).css ({borderRadius:5, opacity : 0.7});

		if (typeof data=='object' && data!==null) {
			hm (data, '', {opacity:0.7, htmlID:itemID+'_hm', initCallback : function (hmCmd) {
				sa.hms.tools.registerEvent (hmCmd, 'onResized', sa.l.php.tools.hmResized, {
					lahCmdID:cmdID
				});
				jQuery('#'+hmCmd.id).css ({borderRadius:5, opacity:0.7});
				//sa.l.php.tools.resizeWindow(cmdID);
			}});
		} else {
			//sa.l.php.tools.resizeWindow(cmdID); //freezes browser!
		};

		return itemID;
	},
	report_console : function (e, title, trace) {
		if (typeof e=='object') {
			e = sa.json.encode(e);
		}
		if (typeof title=='object') {
			title = sa.json.encode(title)
		};
		var msg = ( title ? title + '\n' + e : e);
		msg = 'logAndHandler : ' + msg;
		if (typeof console=='object' && typeof console.log	== 'function') {
			sa.m.log (undefined, { msg : msg } );
			sa.m.trace();
		} else {
			//alert (msg); // hey, u gotta b informed
		}
	},
	onClickItem : function (cmdID, itemID) {
		var cmd = sa.l.php.cmds[cmdID];
		var context = sa.l.php.cmd.itemID2context[itemID];
		var ctx = sa.l.php.cmds[cmdID].dataByContext[context];
		sa.l.php.cmd.activeContext = context;

		if (ctx.loaded) {
			// show details, hide default title
			sa.l.php.tools.showItem (cmdID, itemID);

		} else {
			sa.l.php.tools.loadErrors (cmdID, itemID);
		};
		setTimeout (sa.m.traceFunction(function() {
			sa.l.php.tools.resizeWindow (cmdID);
		}), 1500);
	},
	tools : { // alphabetized list of functions used internally by lah()
		applyBaseColors : function (cmdID, itemID, theme) {
			if (!sa.l.php.animationItems[itemID]) sa.l.php.tools.startColorShifting (cmdID, itemID, theme);
			sa.l.php.animationItems[itemID].theme = theme;
			var themeDef = sa.l.php.options.authorsDefaults.themes[theme];
			for (tagName in themeDef.colorLevels[0]) {
				switch (tagName) {
					case 'opacity':
						jQuery('#'+itemID).css ('opacity', themeDef.colorLevels[0][tagName]);
						break;
					case 'colorEntryBackground':
						jQuery('#'+itemID).css ('background', themeDef.colorLevels[0][tagName]);
						break;
					case 'colorEntryText':
						jQuery('#'+itemID+', #'+itemID+' .lahItemTitle table').css ('color', themeDef.colorLevels[0][tagName]);
						break;
					case 'colorEntryHREF':
						jQuery('#'+itemID+' > a').css ('color', themeDef.colorLevels[0][tagName]);
						break;
				}
			}
		},
		removeBaseColors : function (cmdID, itemID) {
			jQuery('#'+itemID).removeAttr('style');
			return true;
		},
		calculateColorSteps : function (cmdID, itemID, theme) {
			  // Make a scale (var steps) with 1 entry for each 
			  // display-sub-level needed for this theme.
			  // Then fill that scale with the correct property-values at each step.
			  //for (t in sa.hms.options.current.activeThemes) {
			  //  var theme = sa.hms.options.current.activeThemes[t];
			  var totalDepth = sa.l.php.options.colorShiftingTotalSteps; //total number of steps really
			var cg = sa.l.php.options.authorsDefaults.themes[theme];
			  if (!cg || !cg.colorLevels || !cg.colorLevels[0] || !cg.colorLevels[100]) {
				sa.hms.error('Invalid theme ' + theme);
			  };
			  if (!cg) debugger;
			  var cgl = cg.colorLevels;

			  var steps = [];
			  var props = sa.colorGradients.generateCSS_findProps(cg);
			  for (var i = 0; i < totalDepth; i++) {
				var x = Math.round((i * 100) / totalDepth);

				var step = {};
				for (var prop in props) {
					if (isNaN(parseFloat(props[prop]))) {

						  var l = sa.colorGradients.generateCSS_findNeighbour(prop, x, cg, 'target');
						  var above = sa.colorGradients.generateCSS_findNeighbour(prop, x, cg, 'above');
						  var beneath = sa.colorGradients.generateCSS_findNeighbour(prop, x, cg, 'beneath');
						  var relX = Math.round((beneath * 100) / x);
						  var newColor = {
							red: sa.colorGradients.generateCSS_calculateColor(
								x, 
								sa.colorGradients.generateCSS_extractColor(cgl[above][prop], 'red'), 
								sa.colorGradients.generateCSS_extractColor(cgl[l][prop], 'red'), 
								sa.colorGradients.generateCSS_extractColor(cgl[beneath][prop], 'red')
							),
							green: sa.colorGradients.generateCSS_calculateColor(
								x, 
								sa.colorGradients.generateCSS_extractColor(cgl[above][prop], 'green'), 
								sa.colorGradients.generateCSS_extractColor(cgl[l][prop], 'green'), 
								sa.colorGradients.generateCSS_extractColor(cgl[beneath][prop], 'green')
							),
							blue: sa.colorGradients.generateCSS_calculateColor(
								x, 
								sa.colorGradients.generateCSS_extractColor(cgl[above][prop], 'blue'), 
								sa.colorGradients.generateCSS_extractColor(cgl[l][prop], 'blue'), 
								sa.colorGradients.generateCSS_extractColor(cgl[beneath][prop], 'blue')
							)
						  };
						step[prop] = sa.colorGradients.generateCSS_combineColor(newColor);
						
					} else {
						
						  var l = sa.colorGradients.generateCSS_findNeighbour(prop, x, cg, 'target');
						  var above = sa.colorGradients.generateCSS_findNeighbour(prop, x, cg, 'above');
						  var beneath = sa.colorGradients.generateCSS_findNeighbour(prop, x, cg, 'beneath');
						  step[prop] = sa.colorGradients.generateCSS_calculateFloat(
								x, 
								cgl[above][prop],
								cgl[l][prop],
								cgl[beneath][prop]
							);
					}

				};
				steps.push(step);
			  };
			  
			  return steps;
		},
		colorShiftingNextStep : function (cmdID, itemID, stepNo) {
			//if (jQuery('#'+cmdID).css('display')=='none') return false;
			var lahItem = sa.l.php.animationItems[itemID];
			var steps = lahItem.colorSteps;
			var step = steps[stepNo];
			for (prop in step) {
				 var htmlIDtarget = '#' + itemID;
				 var translatedProp = '';
				 switch (prop) {
					case 'opacity':
						translatedProp = 'opacity';
						break;
					case 'colorEntryBackground':
						translatedProp = 'background';
						break;
					case 'colorEntryText':
						htmlIDtarget += ', '+htmlIDtarget+' .lahItemTitle table';
						translatedProp = 'color';
						break;
					case 'colorEntryHREF':
						htmlIDtarget += '  a';
						translatedProp = 'color';
						break;
				 };
				jQuery(htmlIDtarget).css (translatedProp, step[prop]);
			}
		
		},
		doColorShiftingNextStep : function (cmdID) {
			if (jQuery('#'+cmdID).css('display')=='none') return false;
			for (itemID in sa.l.php.animationItems) {
				var lahItem = sa.l.php.animationItems[itemID];
				if (lahItem.animating) {
					if (lahItem.stepIncreasing) {
						var stepNo = lahItem.stepNo++;
					} else {
						var stepNo = lahItem.stepNo--;
					}
					if (stepNo > sa.l.php.options.colorShiftingTotalSteps) {
						lahItem.stepIncreasing = false;
						lahItem.stepNo = sa.l.php.options.colorShiftingTotalSteps - 1;
					} else if (stepNo < 0) {
						lahItem.stepIncreasing = true;
						lahItem.stepNo = 0;
					}
					sa.l.php.tools.colorShiftingNextStep (cmdID, itemID, lahItem.stepNo);
				}
			};
			setTimeout (function () {
				sa.l.php.tools.doColorShiftingNextStep (cmdID);
			}, 50);
		},		
		initializeColorShifting : function (cmdID) {
			var data = sa.l.php.cmds[cmdID].dataByContext;
			for (context in data) {
				var itemID = sa.l.php.cmd.context2itemID[context];
				var contextRec = sa.l.php.cmds[cmdID].dataByContext[context];
				
				var et = contextRec.errsHighestSeverity;
				if (!et) et = 'Notice';
				var theme = sa.l.php.options.authorsDefaults.phpErrorType2ThemeChoices[et];
				sa.l.php.tools.applyBaseColors (cmdID, itemID+'_more', theme);
				sa.l.php.tools.startColorShifting (cmdID, itemID+'_more', theme);
				sa.l.php.tools.applyBaseColors (cmdID, itemID+'_title', theme);
				sa.l.php.tools.startColorShifting (cmdID, itemID+'_title', theme);
			}		
		},
		
		loadContextsList : function (cmdID) {
			var ajaxCommand = {
				url : sa.m.globals.urls.os + '/com/ui/tools/lucidLog/php/ajax_loadContextsList.php',
				type : 'POST',
				data : {
				},
				success : function (result, ts) {
					// decode and integrate data
					var data = sa.json.decode.small (result);
					sa.l.php.cmds[cmdID] = {
						dataByContext : {}, //server side data
						items : {} // browser side generated data
					};
					var cmd = sa.l.php.cmds[cmdID];
		
					cmd.dataByContext = data;
					for (context in data) {
						var itemID = sa.l.php.tools.nextID();
						data[context].itemID = itemID;
						data[context].context = sa.json.decode.small (context);
						sa.l.php.cmd.context2itemID[context] = itemID;
						sa.l.php.cmd.itemID2context[itemID] = context;
						sa.l.php.cmd.itemID2contentSource[itemID] = 'PHP';
					};
			
					sa.l.php.tools.processContexts (cmdID);

					sa.l.php.tools.initializeColorShifting (cmdID);

					// stick window at bottom of window:
					sa.l.php.tools.resizeWindow (cmdID);
					
					// make window resizeable to the north:
					//jQuery('#'+cmdID).resizable({ghost:true,handles:'n'});
					
					var firstItem = true;
					for (itemID in sa.l.php.cmds[cmdID].items) {
						// take first item, make that the minimum height;
						if (firstItem) {
							sa.l.php.options.cs.minHeight = jQuery('#'+itemID).height() + 2;
							firstItem = false;
						};
						
						// put click handler on all items:
						jQuery('#'+itemID+', #'+itemID+'_more').click (function (event) { 
							var id = event.currentTarget.id.replace(/_more/,'');
							id = id.replace(/_title/,'');
							sa.l.php.onClickItem (cmdID, id);
						});
					};
					
				}
			};
			var ajax = jQuery.ajax (ajaxCommand);
		},
		loadErrors : function (cmdID, itemID) {
			var context = sa.l.php.cmd.itemID2context[itemID];
			var ajaxCommand = {
				url : sa.m.globals.urls.os + '/com/ui/tools/lucidLog/php/ajax_loadErrors.php',
				type : 'GET',
				data : {
					context : context
				},
				success : function (data, ts) {
					sa.json.decode.small (data, null, null, null, function (errors) {
						
						sa.l.php.tools.processErrors (cmdID, context, errors);
												
						var itemID = sa.l.php.cmd.context2itemID[context];
						// border around target object:
						//jQuery(errors[context].context.jquerySelector).css ('border', '2px solid red');
								
						// show details, hide default title
						jQuery('#'+itemID+'_moreC').show (sa.l.php.options.showHideDuration);
						sa.l.php.tools.showItem (cmdID, itemID);
						sa.l.php.tools.resizeWindow (cmdID);
					}, function	(msg,ctx) {
						sa.l.php.report ('loadErrors : '+msg);
					});
				}
			};
			var ajax = jQuery.ajax (ajaxCommand);
		},
		loadError : function (cmdID, itemID, context, funcContext, callback) {
			var ajaxCommand = {
				url : sa.m.globals.urls.os + '/com/ui/tools/lucidLog/php/ajax_loadError.php',
				type : 'GET',
				data : {
					context : context,
					funcContext : funcContext
				},
				success : function (data, ts) {
					//debugger;
					sa.json.decode.small (data, null, null, null, function (error) {
						
						sa.l.php.tools.processError (cmdID, itemID, context, error);
						
						var itemID = sa.l.php.cmd.context2itemID[context];
						// border around target object:
						//jQuery(errors[context].context.jquerySelector).css ('border', '2px solid red');
								
						// show details, hide default title
						callback();
					}, function	(msg,ctx) {
						sa.l.php.report ('loadErrors : '+msg);
					});
				}
			};
			var ajax = jQuery.ajax (ajaxCommand);
		},
		nextID : function () {
			var nid = sa.l.php.options.cs.nextID++;
			return 'll_'+nid;
		},
		processError : function (cmdID, itemID, context, error) {
			var data = sa.l.php.cmds[cmdID].dataByContext;		
			for (context in data) {
				var ctx = data[context];
				var itemID = ctx.itemID;
				for (var v in error) {
					ctx[v] = error[v];
				}
			}
		},
		processContexts : function (cmdID) {
			var html = '';

			//html +=
			//	'<div>'+sa.l.php.software.name + ' : ' + sa.l.php.software.version + ', ' + sa.l.php.software.releaseDate+'</div>';

			
			var data = sa.l.php.cmds[cmdID].dataByContext;		
			var hasItems = false;
			var numItems = 0;
			for (context in data) {
				numItems++;
			}

			for (context in data) {
				hasItems = true;
				var ctx = data[context];
				var itemID = ctx.itemID;
				
				// html for item:
				html += 
					'<div id="'+itemID+'" class="lahItem" style="cursor:pointer;">' +
					'<table cellspacing="3" style="width:100%">' +
					'<tr>' +
					'<td id="'+itemID+'_moreC" width="120px" style="display:none;width:120px;whitespace:nowrap;">' +
					'<div id="'+itemID+'_more" class="lahItemMore" style="padding:2px;width:100%;text-align:center">' + (numItems-1) + ' more files</div>' +
					'</td>' +
					'<td>' +
					'<div id="'+itemID+'_title" class="lahItemTitle" style="margin:1px">' + 
					'<table style="width:100%">' +
					'<tr>' +
					'<td>' + 
						ctx.context.jquerySelector + 
						' : ' +
						ctx.context.script + 
						'<br/>' +
						ctx.errsStatus +
					'</td>' +
					'<td style="text-align:right">' + 
						'session: ' +sa.m.secondsToTimeString(ctx.timeInSecondsSinceStartOfSession) + '<br/>' +
						'loading: ' +sa.m.secondsToTimeString(ctx.timeInSecondsSinceStartOfLoading) + 
					'</td>' +
					'</tr>' +
					'</table>' +
					'</div>' +
					'</td>' +
					'</tr></table>' +
					'</div>' +
					'<div id="'+itemID+'_items" class="lahItemData vividScrollpane vividTheme__scroll_black" style="cursor:pointer;"> </div>'+
					'</div>';
					
			};		

			if (hasItems) {
				sa.l.php.show();
			};

			// update component with full list of items, grouped by invocation-location:
			jQuery('#'+cmdID+'_content_PHP').html(html);
			jQuery('.lahItemData').css({display:'none'});
			for (context in data) {
				var ctx = data[context];
				var itemID = ctx.itemID;
				jQuery('#'+itemID+'_more, #'+itemID+'_title').css ({borderRadius:5,opacity:0.7});
			};
			
			sa.l.php.tools.resizeWindow (cmdID);
		},
		processErrors : function (cmdID, context, errors) {

			var ctx = sa.l.php.cmds[cmdID].dataByContext[context];
			/*
			var lahTools = {
				jsonViewer : 'jsonViewer',
				handle : 'Handle'
			}
			*/

			var html = '';
			var itemID = sa.l.php.cmd.context2itemID[context];
			var idHM = sa.l.php.tools.nextID();
			var idMenu = sa.l.php.tools.nextID();
			var idSelect = sa.l.php.tools.nextID();
			var idSelect2 = sa.l.php.tools.nextID();

			var data = sa.l.php.cmds[cmdID].dataByContext[context];
			data.errors = errors;
			data.htmlIDs = {
				itemID : itemID,
				hmID : idHM,
				select1ID : idSelect,
				select2ID : idSelect2
			};

			var errIDs = [];
			var errThemes = [];
			var errLocs = [];
			var html1 = '';
			html += 
				'<div style="width:100%;height:100%;">'+
				'<table style="width:100%; padding:0px; margin:0px;">'+
				'<tr>' +
				'<td id="'+itemID+'_items_menu" class="lahItemsMenu">' ;
				//'<div id="'+idSelect+'" class="lahItemErrorContainer" style="padding:4px">';
			

			var numErrors = 0;
			for (jsonLocation in errors) {
				numErrors++;
			};
			
			for (jsonLocation in errors) {
				var err = errors[jsonLocation];
				var idHM = sa.l.php.tools.nextID();
				var idBackToList = sa.l.php.tools.nextID();
				var errID = sa.l.php.tools.nextID();
				err.errID = errID;
				err.hmID = idHM;
				errIDs = errIDs.concat ([errID]);
				var et = err.phpErrorType;
				var theme = sa.l.php.options.authorsDefaults.phpErrorType2ThemeChoices[et];
				errThemes = errThemes.concat (theme);
				var locat = sa.json.decode.small (jsonLocation);
				var loc = 
					err.error.msg + 
					'<br/><span style="font-weight:normal; font-size:85%">'+
					et + ' in ' + locat.func + '() in ' + locat.file + 
					', line ' + locat.line+
					'</span>';
				errLocs = errLocs.concat (loc);
				err.location = loc;
				//html += '<div id="'+errID+'" class="lahItemError" style="padding:2px">' + loc +'</div>';
				html += 
					'<table id="'+errID+'_table" class="lahItemTitleTable" cellspacing="3" style="width:100%;"><tr>'+
					'<td id="'+errID+'_moreC" style="display:none;width:120px">' +
						'<div id="'+errID+'_more" style="width:100%;padding:2px;text-align:center">' + (numErrors-1) + ' more items in file</div>' +
					'</td>' +
					'<td style="width:*">' +
						'<div id="'+errID+'" class="lahItemError" style="width:100%;">' + loc + '</div>' +
					'</td>' +
					'</tr></table>';

			};

			html += 
				//'</div>' +
				'</td>' +
				'</tr>'+
				'</table>';
				'</div>';
				
			/*
			var idTools = sa.l.php.tools.nextID();
			sa.l.php.cmd.idTools = idTools;
			html +=
				'<table id="'+itemID+'_items_tools" style="width:100%; display:none">'+
				'<tr>';
			var i = 1;
			for (tool in lahTools) {
				html += 
					'<td style="width:100px">' +
					'<div id="'+idSelect2+'_'+i+'" class="lahItemTool" style="text-align:center; padding:2px">'+
					lahTools[tool]+
					'</div>' +
					'</td>';
				i++;
			}
			html += 
				'<td style="width:*"> </td>'+
				'</tr>' +
				'</table>';
			*/

			html +=
				'<div id="'+itemID+'_items_tabs" class="tabsContainer" style="width:100%;">';
				
			var first = true;

			for (jsonLocation in errors) {
				var err = errors[jsonLocation];
				
				for (var idx in errIDs) {
					if (err.errID==errIDs[idx]) break;
				};
				
				
				html +=
					'<div id="'+err.errID+'__page__1" class="tabsPage" style="display:none;width:100%;height:100%;">'+
						'<div id="'+err.hmID+'" class="jsonViewer" style="width:100%;heigth:100%;"> </div>'+
					'</div>';// +
					//'<div id="'+err.errID+'__page__2" class="tabsPage" style="display:none;width:100%;height:100%;"> '+
					//'</div>';
				if (first) first = false;
			};
			
			html +=
				'</div>';

			var jQueryitem = jQuery('#'+itemID+'_items');
			jQueryitem[0].innerHTML += html; // TODO : was += ??
			jQueryitem.css ({display:'block',height:'100%'});
			jQuery('#'+itemID+'_items__container').css ({display:'none'});
			//debugger;
			setTimeout (sa.m.traceFunction ( function () {
				sa.sp.containerSizeChanged (jQueryitem[0], true);
			}), 1000);
			
			ctx.loaded = true;
			
			// find theme to use for errors
			for (idx in errIDs) {
				var errID = errIDs[idx];
				for (jsonLocation in errors) {
					var err = errors[jsonLocation];
					if (err.errID == errID) {
						err.theme = errThemes[idx];
					}
				}
			};

			// misc
			first = true;
			for (jsonLocation in errors) {
				var err = errors[jsonLocation];
				var errID = err.errID;
				
				//highlight first item in list on load:
				sa.l.php.tools.applyBaseColors (cmdID, errID, err.theme);			
				//sa.l.php.tools.startColorShifting (cmdID, errID, err.theme, false);
				sa.l.php.tools.applyBaseColors (cmdID, errID+'_more', err.theme);			
				//sa.l.php.tools.startColorShifting (cmdID, errID+'_more', err.theme, false);

				// round corners for all items:
				var IDs = '#' + errID + ', #'+errID+'_more';
				jQuery(IDs).css ({borderRadius:5, opacity:0.7});
				
				// click handler for any error item:
				jQuery('#'+errID+', #'+errID+'_more').click (function (ev) {
					sa.l.php.tools.showError (cmdID, this, ev);
					
				});
			
			};

			// click handler and animations for error-item tools:
			for (var j=1; j<=i; j++) {
				var toolID = idSelect2+'_'+j;
				sa.l.php.tools.applyBaseColors (cmdID, toolID, (j==1?'sasGreen':'sasBlue1'));				
				sa.l.php.tools.startColorShifting (cmdID, toolID, (j==1?'sasGreen':'sasBlue1'), (j=='1'));
				jQuery('#'+toolID).css({borderRadius:5}).click (function () {
					// stage 1 : color(animation)s of clicked items
					for (var k=1; k<=i; k++) {
						var toolID = idSelect2+'_'+k;
						sa.l.php.tools.applyBaseColors (cmdID, toolID, 'sasBlue1');				
						sa.l.php.tools.startColorShifting (cmdID, toolID, 'sasBlue1', false);
					}
					sa.l.php.tools.applyBaseColors (cmdID, this.id, 'sasGreen');				
					sa.l.php.tools.startColorShifting (cmdID, this.id, 'sasGreen', true);


					// stage 2: functionality handling
					ctx.activeTool = this.innerHTML;
					sa.l.php.tools.selectCorrectItemDetailView (cmdID, itemID, ctx);
				});
			};
			
			ctx.activeError = errIDs[0];
		},
		startColorShifting : function (cmdID, itemID, theme, animateImmediately) {
			var r = {
				stepNo : 0,
				stepIncreasing : true,
				animating : animateImmediately,
				colorSteps : sa.l.php.tools.calculateColorSteps(cmdID, itemID, theme)
			};
			sa.l.php.animationItems[itemID] = r;
			sa.l.php.cmds[cmdID].items[itemID] = r;
		},
		removeAnimationsFrom : function (cmdID, itemID) {
			sa.l.php.animationItems[itemID].animating = false;
			sa.l.php.tools.removeBaseColors (cmdID, itemID);
		},
		scrollbarWidth : function () {
			var div = jQuery('<div style="width:50px;height:50px;overflow:hidden;position:absolute;top:-200px;left:-200px;"><div style="height:100px;"></div>');
			// Append our div, do our calculation and then remove it
			jQuery('body').append(div);
			var w1 = jQuery('div', div).innerWidth();
			div.css('overflow-y', 'scroll');
			var w2 = jQuery('div', div).innerWidth();
			jQuery(div).remove();
			return (w1 - w2);
		},
		showItem : function (cmdID, itemID) {
			var cs = sa.l.php.cmd.itemID2contentSource[itemID];
			var data = sa.l.php.cmds[cmdID].dataByContext;			
			var ctx = sa.l.php.cmd.activeContext;
			if (!ctx) debugger;

			// bugfix:
			for (context in data) {
				var currItemID = sa.l.php.cmd.context2itemID[context];
				jQuery('#'+currItemID).css({borderRadius:5});
			};
			
			if (jQuery('#'+itemID).hasClass('selected')) {
				jQuery('#'+cmdID+'_content_'+cs+' .lahItem').show(sa.l.php.options.showHideDuration, function () {
					jQuery('#'+itemID).removeClass('selected');
					jQuery('#'+itemID+'_moreC').hide(sa.l.php.options.showHideDuration);
					debugger;
					jQuery('#'+itemID+'_items').hide(sa.l.php.options.showHideDuration+100, function () {
						sa.l.php.tools.selectCorrectItemDetailView (cmdID);
					});
					jQuery('#'+itemID+'_items__container').hide (sa.l.php.options.showHideDuration+100);
				});
			} else {
				jQuery('#'+cmdID+'_content_'+cs+' .lahItem').not('#'+itemID).hide(sa.l.php.options.showHideDuration);
				jQuery('#'+itemID).show(sa.l.php.options.showHideDuration+100, function () {
					jQuery('#'+itemID).addClass ('selected');
					jQuery('#'+itemID+'_moreC').show(sa.l.php.options.showHideDuration);
					jQuery('#'+itemID+'_items').show(sa.l.php.options.showHideDuration+100, function () {
						sa.l.php.tools.resizeWindow(cmdID);
					});
					jQuery('#'+itemID+'_items__container').show (sa.l.php.options.showHideDuration+100);
				});

			};
			
		},
		showError : function (cmdID, domElementClicked, domEvent) {
					var ctx = sa.l.php.cmd.activeContext;
					if (!ctx) debugger;
					var data = sa.l.php.cmds[cmdID].dataByContext[ctx];
					var errors = data.errors;
					var itemID = data.itemID;



				  var errID = domElementClicked.id;	
					errID = errID.replace (/_more/,'');
					//jQuery('.lahItemErrorTitleTable').hide();
					var selectedAnItem = false;
					if (jQuery('#'+errID).hasClass('selected')) {
						jQuery('#'+errID).removeClass('selected');
						jQuery('#'+itemID+'_items_tools').hide();
					} else {
						jQuery('#'+errID).addClass('selected');
						jQuery('#'+itemID+'_items_tools').show();
						selectedAnItem = true;
					};
					if (selectedAnItem) {
						jQuery('#'+errID+'_table').show(sa.l.php.options.showHideDuration);
						jQuery('#'+errID+'_moreC').show(sa.l.php.options.showHideDuration);
					} else {
						jQuery('#'+errID+'_moreC').hide(sa.l.php.options.showHideDuration);
					};
					var numErrors = 0;
					for (jsonLocation in errors) {
						numErrors++;
					};
					var i=0;
					for (jsonLocation in errors) {
						var err = errors[jsonLocation];
						//jQuery('#'+err.errID+'__scrollpane').css ({width:'100%',height:'150px'});
						//debugger;
						if (i!=numErrors && ((!selectedAnItem) || (err.errID==errID))) {
							jQuery('#'+err.errID+'_table').show(sa.l.php.options.showHideDuration);
						} else {
						//debugger;
							jQuery('#'+err.errID+'_table').hide(sa.l.php.options.showHideDuration);
						};
						i++;
					};	
					//debugger;			
					if (((!selectedAnItem) || (err.errID==errID))) {
						jQuery('#'+err.errID+'_table').show(sa.l.php.options.showHideDuration+100, function () {
							sa.l.php.tools.showError2(cmdID,selectedAnItem,domElementClicked,errID)
						});
					} else {
						jQuery('#'+err.errID+'_table').hide(sa.l.php.options.showHideDuration+100, function () {
							sa.l.php.tools.showError2(cmdID,selectedAnItem,domElementClicked,errID)
						});
					};
		},
		showError2 : function (cmdID,selectedAnItem,domElementClicked,errID) {
 					var ctx = sa.l.php.cmd.activeContext;
					if (!ctx) debugger;
					var data = sa.l.php.cmds[cmdID].dataByContext[ctx];
					var errors = data.errors;
					var itemID = data.itemID;

					// stage 2: functionality handling
					if (!selectedAnItem) {
						data.lastActiveError = data.activeError;
						data.activeError = null;
						sa.l.php.tools.selectCorrectItemDetailView (cmdID);
					} else {
						data.activeError = domElementClicked.id;

						// stage 3: initialize hm();
						for (var jsonFuncContext in errors) {
							var err = errors[jsonFuncContext];
							if (err.errID == errID) break;
						};
						//sa.m.log (undefined, '#'+err.hmID+' : .html="'+jQuery('#'+err.hmID).html()+'"');
						if (jQuery('#'+err.hmID).html().length>5) {
							//hm() already initialized
							if (typeof data.activeError=='undefined') debugger;
							sa.l.php.tools.selectCorrectItemDetailView (cmdID);
							//sa.l.php.tools.resizeWindow (cmdID);
						} else {
							//initialize hm(), jsonViewer.
							sa.l.php.tools.loadError (cmdID, this.id, sa.l.php.cmd.activeContext, jsonFuncContext, function() {
								var err2 = sa.m.cloneObject (err);
								delete err2.phpErrorClass;
								delete err2.phpErrorType;
								delete err2.errID;
								delete err2.itemID;
								delete err2.hmID;
								delete err2.timeInSecondsSinceStartOfSession;
								delete err2.timeInSecondsSinceStartOfLoading;
								delete err2.location;
								delete err2.theme;
								hm (err2, '', {opacity:0.7, height:'100%', htmlID:err.hmID, initCallback : function (hmCmd) {
									sa.hms.tools.registerEvent (hmCmd, 'onResized', sa.l.php.tools.hmResized, {
										lahCmdID:cmdID,
										ctx:ctx,
										errHMid:err.hmID,
										errID : err.errID
									});
									jQuery('#'+hmCmd.id).css({borderRadius:5}).css ({opacity:0.7});
									err.hmsID = hmCmd.hmd.hms.id;
									jQuery('#'+err.hmsID+'__scrollpane, #'+err.hmsID+'_div').css ({width:'98%'});
									if (typeof data.activeError=='undefined') debugger;
									
									sa.l.php.tools.selectCorrectItemDetailView (cmdID);
									sa.sp.containerSizeChanged (jQuery('#'+err.hmsID+'__scrollpane')[0], true);
									sa.sp.containerSizeChanged (jQuery('#'+err.errID+'_table').parent().parent().parent().parent().parent().parent()[0], true);
								}});
							});
						}
					}

	 },
		selectCorrectItemDetailView : function (cmdID) {
			var ctx = sa.l.php.cmd.activeContext;
			var data = sa.l.php.cmds[cmdID].dataByContext[ctx];
			var errorID = data.activeError;
			
			// switch all pages to off
			if (!errorID) {
				jQuery('#'+data.itemID+'_items_tabs .tabsPage').hide();
			} else {
				jQuery('#'+errorID+'_items_tabs .tabsPage').hide();
			};
			jQuery('.tabsPage').hide();

/*			
			// which of the "handle" / "jsonViewer" buttons is selected?
			page = 0;
			switch (data.activeTool) {
				case 'Handle':
					page = 1;
					break;
				case 'jsonViewer':
					page = 2;
					break;
			};
*/
					
			// switch the page/content we want to display now.
			if (errorID) {
				var pageHTMLid = '#'+errorID+'__page__1';
				jQuery(pageHTMLid).fadeIn('slow');;
			};
			 
			sa.l.php.tools.resizeWindow (cmdID);
			
		},
		hmResized : function (hmCmd, eventName, eventData, outsideContext) {
			var cmdID = outsideContext.lahCmdID;
			var ctx = outsideContext.ctx;
			var errorID = outsideContext.errID;
			sa.l.php.tools.contentResized (cmdID, ctx, errorID);
		},
		contentResized: function (cmdID, ctx, errorID) {
			sa.l.php.tools.resizeWindow (cmdID);

			/*
			for (jsonErrLoc in ctx.errors) {
				var err = ctx.errors[jsonErrLoc];
				if (err.errID == errorID) break;
			};
			
			if (err.errID==errorID) {
				jQuery('#'+err.hmID+'_pane, #'+err.hmID+'_holder > .jScrollPaneContainer').css ({height:'400px',width:'100%'});
				jQuery('#'+err.hmID+'_pane').jScrollPane({showArrows:true, scrollbarWidth: 15, arrowSize: 16, animateTo:true, animateToInternalLinks:true});
			};
			*/
		},
		resizeWindow : function (cmdID) {
			var firstRun = false;
			var offset = 8 + 16 ;
			var firstItem = true;
			var scrollWidth = 15;//sa.l.php.tools.scrollbarWidth();

			setTimeout (sa.m.traceFunction(function() {
				jQuery('#saLucidLog_content_holder').css({height:'100%'});
				sa.sp.containerSizeChanged (jQuery('#saLucidLog_content_holder')[0], true);
			}), 200);

			var jQueryouter = jQuery('#saLucidLog_page_php');
			if (!jQueryouter) return false;
			var jQuerypane = jQuery('#'+cmdID+'_content_PHP');
			if (!jQuerypane[0]) return false;
			
			jQuerypane.css ({width:'100%',height:'100%'});

			var jQueryheader = jQuery('.selected', jQuerypane[0]);
			if (!jQueryheader[0]) {
				if (sa.l.php.cmd.oldContent) {
					jQuery(sa.l.php.cmd.oldContent[0].children[1]).css ({width:'',height:''});
					setTimeout (sa.m.traceFunction(function() {
						
						sa.sp.containerSizeChanged (sa.l.php.cmd.oldContent[0], true);
						sa.sp.containerSizeChanged (jQuery('#saLucidLog_content_holder')[0], true);
					}), 200);
				};
				return false;
			};
			jQuerycontent = jQuery('#'+jQueryheader[0].id+'_items');
			if (!jQuerycontent[0]) {
				return false;
			} else {
				sa.l.php.cmd.oldContent = jQuerycontent;	
			};			

			jQuery('.tabsContainer').each ( sa.m.traceFunction ( function (idx) {
				jQuery(this).css ({
					height : jQuery(this).parent().height() - jQuery(this).prev().height(),
				});
			}));

			jQuerycontent.css ({width:'100%',height:jQuerypane.height()-jQueryheader.height()-20});
			var h = jQuerycontent.height() - jQuery(jQuerycontent[0].children[0].children[1].children[0]).height();

			jQuery(jQuerycontent[0].children[1]).css ({width:'100%',height:h});
			setTimeout (sa.m.traceFunction(function() {
				sa.sp.containerSizeChanged (jQuerycontent[0], true);
				sa.sp.containerSizeChanged (jQuery('#saLucidLog_content_holder')[0], true);
			}), 350);

			var animTime = sa.l.php.options.showHideDuration;

			var w = jQuery(window).width() - scrollWidth;
			w -= parseInt(jQuery('#'+cmdID).css('padding-left'));
			w -= parseInt(jQuery('#'+cmdID).css('padding-right'));
			
			// resize jsonViewer if that's in view
			var ctx = sa.l.php.cmd.activeContext;
			if (!ctx) {
				//sa.l.php.report ('resizeWindow(): ctx not found');
			} else {
				var data = sa.l.php.cmds[cmdID].dataByContext[ctx];
				var errorID = data.activeError;
				if (!errorID) {
					//sa.l.php.report ('resizeWindow(): errorID not found.');
				} else {
					for (jsonErrLoc in data.errors) {
						var err = data.errors[jsonErrLoc];
						if (err.errID == errorID) break;
					};
					
					if (err && err.errID==errorID) {
						if (jQuery('#'+err.hmID).length!=1) {
							//sa.l.php.report ('resizeWindow(): ' +err.hmsID+' not found.');
						} else {
							jQuery('#'+err.hmID).css ({height:'100%',width:w+'px'});
							sa.m.log (undefined, { 'err.hmID' : err.hmID } );
							var jQuerys = jQuery('#'+err.hmID);
							if (jQuerys[0] && jQuerys[0].children[0] && jQuerys[0].children[0].children[2])
								setTimeout (sa.m.traceFunction(function() {
									debugger;
									sa.sp.containerSizeChanged(jQuerys[0].children[0].children[2], true);
								}), 200);
						}
					}
				}
			};

			// resize the divs that contain the contentSource content.	
			if (sa.l.php.cmd.activeSource=='Javascript') {
				var id = cmdID+'_content_'+sa.l.php.cmd.activeSource;
				var css = {
					height : 'auto',
					width : w + 'px'
				};
				var st = jQuery('#'+id)[0].scrollTop;
				//jQuery('#'+id).jScrollPaneRemove();
				jQuery('#'+id).parent().css (css);
				var h = jQuery('#'+id)[0].offsetHeight;
				if (h>400) h=400;
				
				jQuery('#'+id).css ({height:h+'px',width:w+'px'});
				sa.m.log (2, { msg : 'sa.l.php.resizeWindow(): changing #'+id+' to height:'+h+'px, width:'+w+'px' } );
				
				//jQuery('#'+id).parent().css ({height:h+'px',width:w+'px'});
				//sa.m.log (2, 'sa.l.php.resizeWindow(): changing #'+jQuery('#'+id).parent()[0].id+' to height:'+h+'px, width:'+w+'px');
				//debugger;
			};

			if (sa.l.php.cmd.activeSource=='Console.log') {
				var 
				hmInstance = $('#saLucidLog_page_log')[0].children[0].children[0];
				
				sa.sp.containerSizeChanged (hmInstance, true);
			};

			sa.sp.containerSizeChanged (jQuerypane[0], true);

			// resize the main window
			/*
			jQuery('#'+cmdID).css({height:'auto'});
			h = jQuery('#saLucidLog_page_php')[0].offsetHeight;
			var css = {
				top : (jQuery(window).scrollTop() + jQuery(window).height() - (scrollWidth/2) - h)+'px',
				left : '6px',
				height : 'auto',
				width : w + 'px'
			};
			jQuery('#'+cmdID).animate (css, sa.l.php.options.showHideDuration/2, sa.l.php.options.animationEffect, function () {
				var css = {
					width : w + 'px',
					height : jQuery('#'+cmdID).height()+'px'
				};
				jQuery('#'+cmdID+' img.backgroundImg').animate (css, sa.l.php.options.showHideDuration, sa.l.php.options.animationEffect);
				//if (id) debugger;
				if (id) sa.sp.containerSizeChanged (jQuery('#'+id)[0], true); // TODO: DEBUG!
			});*/
		}
	}
}; // logAndHandler === lah
