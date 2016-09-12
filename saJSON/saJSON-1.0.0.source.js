seductiveapps.json = {
	about : {
		whatsThis : 'seductiveapps.json = JSON decoding and encoding routines in pure javascript, does not eval(), synchronous or asynchronous decoding, can handle up to 130mb of JSON',
		copyright : '(c) (r) 2010-2013 by [the owner of seductiveapps.com] <info@seductiveapps.com>',
		license : 'http://seductiveapps.com/seductiveapps/license.txt',
		noWarranty : 'NO WARRANTY EXPRESSED OR IMPLIED. USE ONLY AT YOUR OWN RISK.',
		version : '1.0.0',
		firstReleased : '2010',
		lastUpdated : '2012 March 29',
		knownBugs : {
			1 : 'Won\'t work (well) in Internet Explorer 9 and older (problem solved in version 10, thanks(!) microsoft), see http://social.msdn.microsoft.com/Forums/en-US/iewebdevelopment/thread/74f75b92-591b-4108-84d7-7dcbbd2728f6 and http://social.msdn.microsoft.com/Forums/en-US/iewebdevelopment/thread/0144911a-3037-45a7-8a59-4f200aa26bb4'
		},
		downloadURL : 'http://seductiveapps.com/'
	},

	urlEncode : function (json) {
		var r = json;
		r = r.replace (/{/g, '(');
		r = r.replace (/}/g, ')');
		r = r.replace (/\[/g, '-.');
		r = r.replace (/\]/g, '.-');
	},
		

    decode: {
	    // This is sa.json.decode.big/small(), by info@seductiveapps.com, 2010-jan.
	    // This JSON parser/decoder has evolved from http://www.json.org/json_parse.js
	    // 	The people who wrote & published that json_parse.js deserve full credits for quality base-code.
	    // sa.json.decode() is intended for decoding JSON-as-big-as-your-available-RAM;
	    // It's thread-safe & setTimeout()-safe.
	    // On the downside, it's (or was) much more complicated to debug than it's ancestor, json_parse().
	    // big() works on data supplied by php:json_encode_safer_xxl(), 
	    // which is part of the http://seductiveapps.com/jsonViewer/ lgpl library.
	    // json_encode_safer_xxl() is easy to port to other languages, uses only the simplest php language constructs.
	    // please pass any port back to me <info@seductiveapps.com>, and add a credit-line for yourself :)

      //        _____________________/%*%%*%%*%%*%%*%\____________________
      //       *~~~~~~~~~~~~~~~~~~~~~~( \( )/ _)( )~~~~~~~~~~~~~~~~~~~~~~~*
      //       *                                                          *
      //       *                     PUBLIC INTERFACE                     *
      //       *__________________________________________________________*
      //                       \%%%%%%%%%%%%%%%%%%%%%%%%%%%/
      big: function (
      // Because strings > 70Mb tend to mess up the life of a browser (2010/jan at least),
      // we supply the JSON data in chunks of about 25 megs (configurable in php:json_encode_safer_xxl())
      // to get to a chunk, add "_[index]" with [index] being an integer, to baseID.
	      baseID, // baseID === the html DOM node id "baseID" of where to find these chunks.
	      outerContext, // Arbitrary object containing data about the "environment" that this call to big() came from.
	      origin, // A string describing what code called this function
	      reviver, // Callback function (key, value) that is allowed to massage the data after decoding.
	      onSuccess, // Callback function (ctx.result) that determines where-to-go-next.		
	      onErr, // Callback function (msg, ctx) to run if & when this decode operation fails.
	      onStatus // Callback function (msg, ctx) through which status messages are delivered, while the decoder runs. Usually not necessary.
      ) {
        var ctx = sa.json.decode.newContext(outerContext, origin, baseID, null, reviver, onSuccess, onErr, onStatus);
        sa.json.decode.contexts[ctx.id] = ctx;
        sa.json.decode.readChunk(ctx);
      },

      small: function (
	// for synchronous operations, this is the function to use.
	// call without an onSuccess parameter will decode the json in a synchronous operation.
	// recommended you dont push more than 50 megabyte through this
	      jsonText, outerContext, origin, 
	      reviver, onSuccess, onErr, onStatus) {
        var ctx = sa.json.decode.newContext(outerContext, origin, null, jsonText, reviver, onSuccess, onErr, onStatus);
        sa.json.decode.contexts[ctx.id] = ctx;
        return sa.json.decode.readChunk(ctx);
      },

      //        _____________________/%*%%*%%*%%*%%*%\____________________
      //       *~~~~~~~~~~~~~~~~~~~~~~( \( )/ _)( )~~~~~~~~~~~~~~~~~~~~~~~*
      //       *                                                          *
      //       *    PRIVATE variables & functions for ..json.decode.*:    *
      //       *__________________________________________________________*
      //                       \%%%%%%%%%%%%%%%%%%%%%%%%%%%/
      ctxLastID: 0,
      contexts: {},
      newContext: function (
		outerContext, origin, baseID, jsonText, reviver, onSuccess, onErr, onStatus) {
        var ctx = {
          reportProgressInterval: 500,
          // report status every 5 seconds
          // "constants" issued by the calling function 
          outerContext: outerContext,

          // !!! only 1 of these 2 is allowed:
          baseID: baseID,
          allJSONtoDecode: jsonText,

		  // events issued/thrown by this subcomponent:
          onSuccess: onSuccess,
          onError: onErr,
          onStatus: onStatus,
          reviver: reviver,

          // stats
          lastReport: sa.json.decode.getTime(),

          // true variables:
          id: sa.json.decode.ctxLastID++,

          chunkID: 0,
          status: 'reading',
          at: 0,
          // The index of the current character
          atb: 0,
          // Number of characters in chunks already dealt with.
          atl: -1,
          // (sub)level of operation, realtime
          ch: '',
          // The current character
          vscanid: 0,
          // A ticket number for each setTimeout()
          el: null,
          text: null,
          result: null,
          crp: null,
          // current result pointer
          crps: [],
          // list of result pointers per (sub)level encountered
          cbks: [],
          // list of callback functions per (sub)level encountered
          // true "constants" used in this json parser/decoder: 
          // (dont touch)
          chunkStartIdx: (typeof baseID == 'string' ? 5 // === '<!-- '
          : 0),
          chunkEndOverhead: (typeof baseID == 'string' ? 4 // ===  ' -->'
          : 0),
          escapee: {
            '"': '"',
            '/': '/',
            b: '\b',
            f: '\f',
            n: '\n',
            r: '\r',
            t: '\t'
          }
        };
		ctx.escapee[String.fromCharCode(92)] = String.fromCharCode(92);
        ctx.totalLength = sa.json.decode.totalLength(ctx);
        sa.json.decode.reportStatus(ctx, 'long', 'Now decoding ' + sa.m.sizeHumanReadable(ctx.totalLength, false) + ' of JSON data' + (typeof ctx.baseID == 'string' ? ' in ' + ctx.baseID : '') + (typeof ctx.origin == 'string' ? ' coming from ' + ctx.origin : '') + '.');
        return ctx;
      },

      getTime: function () {
        var d = new Date();
        return d.getTime(); // Grab current millisecond #
      },

      totalLength: function (ctx) {
        if (typeof ctx.baseID == 'string') {
          var b = 0;
          var cid = 0;
          var e = document.getElementById(ctx.baseID + cid);
          while (e) {
            b += e.innerHTML.length - ctx.chunkEndOverhead - ctx.chunkStartIdx;

            cid++;
            e = document.getElementById(ctx.baseID + cid);
          };
          return b;
        } else {
	  if (!ctx.allJSONtoDecode) debugger;
          return ctx.allJSONtoDecode.length;
        }
      },

      reportStatus: function (ctx, taip, msg) {
        //msg = 'json.decode : '+msg;
        if (ctx.onStatus) {
          ctx.onStatus(msg, taip, ctx);
        } else if (sa.hms) {
          sa.hms.reportStatus(ctx.outerContext, taip, msg);
        }
      },

      error: function (ctx, m) {
        var at2 = 0;
        var cid = 0;
        var e = document.getElementById(ctx.baseID + cid);
        var loc = '';

        var strl = 100; // how many chars to show before & after the err
        if (ctx.at < strl) {
          strl = ctx.at;
        };

        if (true || ctx.status != 'error') {
          ctx.status = 'error';
          while (e) {
            if (((ctx.at) > at2) && ((ctx.at) < at2 + e.innerHTML.length - ctx.chunkStartIdx - ctx.chunkEndOverhead)) {
				var 
				loc = 
					'<span class="saJSON_error saJSON_error_title">Section of invalid JSON:</span><br/><br/>'
					+ '<span class="saJSON_error saJSON_error_invalidJSON">' +sa.hms.tools.htmlentities(e.innerHTML.substr(ctx.chunkStartIdx + ctx.at - at2 - strl - 1, strl),'ENT_NOQUOTES')  + '</span>'
					+ ' <span class="saJSON_error_invalidJSON_marker">[error **very near** here: --></span><span class="saJSON_error saJSON_error_invalidJSON_culprit">' 
					+ sa.hms.tools.htmlentities(e.innerHTML.substr(ctx.chunkStartIdx + ctx.at - at2 - 1, 1),'ENT_NOQUOTES')
						+ '</span><span class="saJSON_error saJSON_error_invalidJSON_marker"><--]</span>' 
					+ '<span class="saJSON_error saJSON_error_invalidJSON">' +sa.hms.tools.htmlentities(e.innerHTML.substr(ctx.chunkStartIdx + ctx.at - at2, strl),'ENT_NOQUOTES')+'</span>';
              break;
            } else {
              at2 += e.innerHTML.length - 9;
              cid++;
              e = document.getElementById(ctx.baseID + cid);
            }
          };
          //e = document.getElementById (ctx.baseID + cid-1);
			if (e) {
				var msg = 'sa.json.decode.big() failed; \n' + m + ' at char ' + ctx.at + (e ? ', ' + e.id + ' char ' + (ctx.at - at2) + '\n' + '<br/><br/>' + loc : '');
			} else {
				//ctx.at = ctx.at-3;//BUGFIX SUPREME
				var 
				  loc = 
					//ctx.allJSONtoDecode.substr(ctx.at - at2 - strl - 52, 50)
					'<span class="saJSON_error saJSON_error_title">Section of invalid JSON:</span><br/><br/>'
					+ '<span class="saJSON_error saJSON_error_invalidJSON">' + sa.hms.tools.htmlentities(ctx.allJSONtoDecode.substr(ctx.at - at2 - strl - 2, strl),'ENT_NOQUOTES')+'</span>'
					+ ' <span class="saJSON_error saJSON_error_invalidJSON_marker">[error **very near** here: --></span><span class="saJSON_error saJSON_error_invalidJSON_culprit">'
						+ sa.hms.tools.htmlentities(ctx.allJSONtoDecode.substr(ctx.at - at2 - 2, 1),'ENT_NOQUOTES') 
					+ '</span><span class="saJSON_error saJSON_error_invalidJSON_marker"><--]</span>' 
					+ '<span class="saJSON_error saJSON_error_invalidJSON">' + sa.hms.tools.htmlentities(ctx.allJSONtoDecode.substr(ctx.at - at2 - 1, strl),'ENT_NOQUOTES') + '</span>',
				  msg = 'sa.json.decode.small() failed; \n' + m + ' at char ' + ctx.at + '<br/><br/>' + loc;
			}

          //debugger;
          //if (typeof console == 'object' && typeof console.trace == 'function') console.trace();
          
          if (typeof ctx.onError == 'function') {
            ctx.onError(msg, ctx);
          } else {
						// dont log anything, as we're pumping all keys through the json decode functions 
						// and this results in a lot of errors
						
						// option 1:
						//hms.log (msg);
						
						// option 2:
						/*
            throw {
              name: 'Syntax Error during JSON decode',
              message: msg,
              context: ctx,
              location: loc,
              atChar: ctx.at,
              atCharInChunk: ctx.at - at2,
              chunkHTMLid: ctx.baseID + ctx.chunkID
            };
            */
          };
        }
      },

      next: function (ctx, c) {
        // If a c parameter is provided, verify that it matches the current character.
        if (c && c !== ctx.ch) {
          sa.json.decode.error(ctx, "Expected '" + c + "' instead of '" + ctx.ch + "'");
					//debugger;
					return '';
        }

        if (!ctx.text) return '';
				if (typeof ctx.text=='object') return ''; // oops, passed a js object instead of a text string to the decode function. exit asap.

        /*	
						var strl = 50; // how many chars to show before & after the err
						if (ctx.at < strl) {
							strl = ctx.at;
						};		  
						ctx.loc = 
							ctx.text.substr (ctx.chunkStartIdx+ctx.at-ctx.atb-strl-1, strl) + 
							'___errorRightAfterHere____'+ctx.text.substr(ctx.chunkStartIdx+ctx.at-ctx.atb-1,1) + '____'+
							ctx.text.substr (ctx.chunkStartIdx+ctx.at-ctx.atb, 50);
			*/

        var p = ctx.chunkStartIdx + ctx.at - ctx.atb;

        if (typeof ctx.text != 'string') {debugger;};
				ctx.ch = ctx.text.charAt(p);
        ctx.at += 1;

        // if you run out of data, skip to the next chunk.
        // when no more chunks are available, allDone() will be called.
        if (
        //	      ctx.el && 
        (p >= (ctx.text.length - ctx.chunkEndOverhead))) sa.json.decode.nextChunk(ctx);

        return ctx.ch;
      },

      number: function (ctx) {
        var number, str = '';

        if (ctx.ch === '-') {
          str = '-';
          sa.json.decode.next(ctx, '-');
        }
        while (ctx.ch >= '0' && ctx.ch <= '9') {
          str += ctx.ch;
          sa.json.decode.next(ctx);
        }
        if (ctx.ch === '.') {
          str += '.';
          while (sa.json.decode.next(ctx) && ctx.ch >= '0' && ctx.ch <= '9') {
            str += ctx.ch;
          }
        }
        if (ctx.ch === 'e' || ctx.ch === 'E') {
          str += ctx.ch;
          sa.json.decode.next(ctx);
          if (ctx.ch === '-' || ctx.ch === '+') {
            str += ctx.ch;
            sa.json.decode.next(ctx);
          }
          while (ctx.ch >= '0' && ctx.ch <= '9') {
            str += ctx.ch;
            sa.json.decode.next(ctx);
          }
        };
        number = +str;
        if (isNaN(number)) {
          sa.json.decode.error(ctx, "Bad number");
        } else {
          sa.json.decode.addResult(ctx, {
            val: number
          });
          //return number;
        }
      },

      string: function (ctx) {
        var hex, i, t = 0,
          string = '',
          uffff;

        // When parsing for string values, we must look for " and \ ctx.characters.
        if (ctx.ch === '"') {
          while (sa.json.decode.next(ctx)) {
            if (ctx.ch === '"') {
              sa.json.decode.next(ctx);
              //sa.json.decode.addResult (ctx, { val : string } );
              return string;
            } else if (ctx.ch === String.fromCharCode(92)) {
              sa.json.decode.next(ctx);
              if (ctx.ch === 'u') {
                uffff = 0;
                for (i = 0; i < 4; i += 1) {
                  hex = parseInt(sa.json.decode.next(ctx), 16);
                  if (!isFinite(hex)) {
                    break;
                  }
                  uffff = uffff * 16 + hex;
                }
                string += String.fromCharCode(uffff);
              } else if (typeof ctx.escapee[ctx.ch] === 'string') {
                string += ctx.escapee[ctx.ch];
              } else {
                break;
              }
            } else {
              string += ctx.ch;
            }
          }
        };
        sa.json.decode.error(ctx, 'Bad string: ' + ctx.ch + ', "' + string + '"');
      },

      white: function (ctx) { // Skip whitespace.
        while (ctx.ch && ctx.ch <= ' ') {
          sa.json.decode.next(ctx);
        }
      },

      word: function (ctx) {
        // true, false, or null.
        switch (ctx.ch) {
        case 't':
          sa.json.decode.next(ctx, 't');
          sa.json.decode.next(ctx, 'r');
          sa.json.decode.next(ctx, 'u');
          sa.json.decode.next(ctx, 'e');
          sa.json.decode.addResult(ctx, {
            val: true
          });
          //return true;
          return true;
        case 'f':
          sa.json.decode.next(ctx, 'f');
          sa.json.decode.next(ctx, 'a');
          sa.json.decode.next(ctx, 'l');
          sa.json.decode.next(ctx, 's');
          sa.json.decode.next(ctx, 'e');
          sa.json.decode.addResult(ctx, {
            val: false
          });
          //return false;
          return true;
        case 'n':
          sa.json.decode.next(ctx, 'n');
          sa.json.decode.next(ctx, 'u');
          sa.json.decode.next(ctx, 'l');
          sa.json.decode.next(ctx, 'l');
          sa.json.decode.addResult(ctx, {
            val: null
          });
          //return null;
          return true;
        };
        sa.json.decode.error(ctx, "Unexpected '" + ctx.ch + "'");
      },

      array: function (ctx, start) {
        if (start) {
          if (ctx.ch === '[') {
            sa.json.decode.next(ctx, '[');
            sa.json.decode.white(ctx);
            sa.json.decode.addResult(ctx, {
              newLevel: true,
              val: []
            });
          }
        } else if (typeof ctx.crp == 'object' && ctx.crp.length > 0) {
          if (ctx.ch == ',') {
            sa.json.decode.next(ctx, ',');
            sa.json.decode.white(ctx);
          }
        };

        if (ctx.ch) {
          if (ctx.ch === ']') {
            sa.json.decode.next(ctx, ']');
            sa.json.decode.addResult(ctx, {
              closeCRP: true
            });
          }
          sa.json.decode.nextValue(ctx, function () {
            sa.json.decode.white(ctx);
            //sa.json.decode.next (ctx, ',');
            //sa.json.decode.white (ctx);
            if (typeof ctx.crp == 'object') {
              if (typeof ctx.crp.push == 'function') {
                sa.json.decode.array(ctx, false);
              } else {
                sa.json.decode.object(ctx, false);
              }
            };
          });
          //}
        } //else {
        //sa.json.decode.error (ctx, "Bad array");
        //}
      },

      object: function (ctx, start) {
        var key;
        if (start) {
          if (ctx.ch === '{') {
            sa.json.decode.next(ctx, '{');
            sa.json.decode.white(ctx);
            sa.json.decode.addResult(ctx, {
              newLevel: true,
              val: {}
            });
            ctx.wantKey = true;
          }
        }

        //if (ctx.at > 90) debugger;
        if (typeof ctx.crp == 'object' && typeof ctx.crp.push != 'function') {
          var gotKeys = false;
          for (i in ctx.crp) {
            gotKeys = true;
            break;
          };
          if (gotKeys) {
            if (ctx.ch == ',') {
              sa.json.decode.next(ctx, ',');
              sa.json.decode.white(ctx);
              ctx.wantKey = true;
            }
          }
        };

        if (ctx.ch) {
          if (ctx.wantKey) {
            key = sa.json.decode.string(ctx);
            sa.json.decode.white(ctx);
            sa.json.decode.next(ctx, ':');
            while (ctx.crp.hasOwnProperty.call(ctx.crp, key)) {
              key += '_hm';
              //sa.json.decode.error (ctx, 'Duplicate key "' + key + '"');
            }
            ctx.nextKey = key;
            ctx.wantKey = false;
          } else if (ctx.ch === '}') {
            sa.json.decode.next(ctx, '}');
            sa.json.decode.addResult(ctx, {
              closeCRP: true
            });
            //debugger;
          };

          sa.json.decode.nextValue(ctx, function () {
            sa.json.decode.white(ctx);
            //debugger;
            if (typeof ctx.crp == 'object') {
              if (typeof ctx.crp.push == 'function') {
                sa.json.decode.array(ctx, false);
              } else {
                sa.json.decode.object(ctx, false);
              }
            };
          });
          //}
          //return false;
        } //else {
        //sa.json.decode.error (ctx, "Bad object");
        //}
      },

      value: function (ctx) {
        sa.json.decode.white(ctx);
        //if (ctx.nextKey == 'mnuqy') debugger;
        if (ctx.ch && ctx.ch != '') switch (ctx.ch) {
        case '{':
          sa.json.decode.object(ctx, true);
          break;
        case '[':
          sa.json.decode.array(ctx, true);
          break;
        case ']':
          sa.json.decode.next(ctx, ']');
          sa.json.decode.addResult(ctx, {
            closeCRP: true
          });
          break;
        case '}':
          sa.json.decode.next(ctx, '}');
          sa.json.decode.addResult(ctx, {
            closeCRP: true
          });
          break;
        case '"':
          sa.json.decode.addResult(ctx, {
            val: sa.json.decode.string(ctx)
          });
          break;
        case '-':
          sa.json.decode.number(ctx);
          break;
        default:
          if (ctx.ch >= '0' && ctx.ch <= '9') sa.json.decode.number(ctx);
          else sa.json.decode.word(ctx);
        }
      },

      addResult: function (ctx, addCmd) {
        //if (ctx.id==0) debugger;	    	  
        if (ctx.crp === null) { // very first value?
          if (ctx.result === null) {
            ctx.result = addCmd.val;
          }
          ctx.crp = ctx.result;
          ctx.crps.push(ctx.crp);
          if (typeof addCmd.val == 'object') ctx.atl++;
          //if (ctx.id==0) debugger;	    
        } else if (addCmd.newLevel) { // start work on a sub-array / -object
          if (ctx.nextKey) {
            ctx.crp[ctx.nextKey] = addCmd.val;
            ctx.crp = addCmd.val;
            if (typeof addCmd.val == 'object') {
              ctx.atl++;
              //if (ctx.id==0) debugger;		
              ctx.crps.push(addCmd.val);
            }
            ctx.nextKey = null;
          } else if (typeof ctx.crp.push == 'function') {
            ctx.crp.push(addCmd.val);
            ctx.crp = addCmd.val;
            if (typeof addCmd.val == 'object') {
              ctx.atl++;
              //if (ctx.id==0) debugger;		
              ctx.crps.push(addCmd.val);

            }
          } else {
            sa.json.decode.error(ctx, 'addResult() Could not start new array/object');
            //debugger;
          }
          if (typeof addCmd.val == 'object') {
            if (typeof addCmd.val.push != 'function') {
              ctx.wantKey = true;
            }
          }

        } else if (addCmd.closeCRP) {
          // close a level (sub-array/object)
          ctx.atl--;
          ctx.crp = ctx.crps[ctx.atl];
          //EXPERIMENTAL:	    
          ctx.crps.splice(ctx.atl + 1, 99999);
          if (ctx.atl == -1) {
            if (typeof ctx.cbks[ctx.atl] == 'function') ctx.cbks[ctx.atl](ctx);
          } else {
            //if (ctx.at>30300) debugger;	      
            if (typeof ctx.crp == 'object') {
              if (ctx.ch == ',') {
                sa.json.decode.next(ctx, ',');
                sa.json.decode.white(ctx);
                ctx.wantKey = (
                typeof ctx.crp.push != 'function');
              };

              if (typeof ctx.crp.push == 'function') {
                sa.json.decode.array(ctx, false);
              } else {
                sa.json.decode.object(ctx, false);
              }
            }
          }

        } else if (ctx.nextKey) { // add object value ?
          ctx.crp[ctx.nextKey] = addCmd.val;
          ctx.nextKey = null;

        } else if (!ctx.nextKey && // add array value ? leave as last entry in this if-elseif-elseif list.
        ctx.crp && typeof ctx.crp.push == 'function') {

          ctx.crp.push(addCmd.val);

        } else {
          sa.json.decode.error(ctx, 'addResult() Could not handle this value "' + addCmd.val + '"');
        }
      },

      nextValue: function (ctx, callback) {
        if (!ctx) debugger;
				if (typeof ctx.text=='object') debugger;

        ctx.cbks[ctx.atl] = callback;
        var ctr = ctx.vscanid++;
        var atl = ctx.atl;
        //hms.log ('t3:'+ctx.id+':'+ctr+':'+ctx.status);  
        //console.trace();
        //if (ctx.id==0 && ctr==3) debugger;
        var t = sa.json.decode.getTime();
        if (t > ctx.lastReport + ctx.reportProgressInterval) {
			ctx.lastReport = t;
			var msg = sa.m.sizeHumanReadable(ctx.at, false) + ' of ' + sa.m.sizeHumanReadable(ctx.totalLength, false);

			sa.json.decode.reportStatus(ctx, (ctx.baseID!==''?'long':'short'), msg);
        };
        
        
        if (ctx.allJSONtoDecode!='' && !ctx.onSuccess) {
					// SYNCHRONOUS for json.decode.simple() CALLS:
					sa.json.decode.nextValueWaitDone (ctx.id, ctr, atl);
				
				} else {
				// .json.decode.big() : works asynchronously.
					if (ctx.status != 'error') { // see "error : function" for the actual error handling
						ctx.waitTimeout = setTimeout(function () {
						sa.json.decode.nextValueWaitDone(ctx.id, ctr, atl);
						}, 10);
					}
				}
      },

      nextValueWaitDone: function (ctxID, ctr, atl) {
        var ctx = sa.json.decode.contexts[ctxID];
        //hms.log ('t4:'+ctx.id+':'+ctr+':'+ctx.status);
        //if (ctx.id==0 && ctr==3) debugger;
        //console.trace();
        if (ctx && ctx.status != 'error') {
          sa.json.decode.value(ctx);

          if (ctx && typeof ctx.cbks[ctx.atl] == 'function') ctx.cbks[ctx.atl](ctx);
        }
      },

      nextChunk: function (ctx) {
        if (typeof ctx.baseID != 'string') {
          ctx.text = '';
          ctx.ch = '';
        } else {
          ctx.atb += ctx.text.length - ctx.chunkEndOverhead - ctx.chunkStartIdx + 1;
          ctx.chunkID++;
          sa.json.decode.readChunk(ctx);
        }
      },

      readChunk: function (ctx) {
        if (typeof ctx.baseID != 'string') { 
			
					// is single-string JSON called through json.decode.small()
          ctx.at = 0;
          ctx.ch = ' ';
          ctx.text = ctx.allJSONtoDecode;
          // the fun starts here
          sa.json.decode.nextValue(ctx, function () {
            sa.json.decode.white(ctx);
            if (ctx.ch) {
              //hms.log (ctx, 'sa.json.decode.small(): decode failed for : '+ctx.allJSONtoDecode);
              return false;
            } else {
              return sa.json.decode.allDone(ctx);
            }
          });
          return ctx.result;

        } else { // is chunked JSON
          if (ctx.chunkID > 0) {
            //release memory used by raw data of the chunk that has just been 
            //parsed completely:
            var rm = document.getElementById(ctx.baseID + (ctx.chunkID - 1));
			if (rm) {
	            rm.innerHTML = '';
	            rm.parentNode.removeChild(rm);
			}
          };

          ctx.el = document.getElementById(ctx.baseID + ctx.chunkID);
          if (!ctx.el) {
            //return result;
            ctx.text = '';
            ctx.ch = '';
          } else {
            if (ctx.chunkID == 0) {
              ctx.at = 0;
              ctx.ch = ' ';
              ctx.text = ctx.el.innerHTML;
              //hms.log ('c3: '+ctx.baseID+'_'+ctx.chunkID+': '+(ctx.text.length - ctx.chunkStartIdx - ctx.chunkEndOverhead));
              // the fun starts here
              sa.json.decode.nextValue(ctx, function () {
                sa.json.decode.white(ctx);
                if (ctx.ch) {
                  sa.json.decode.error(ctx, 'Syntax Error(2.2)');
                } else {
                  sa.json.decode.allDone(ctx);
                }
              });

            } else { // skip to next chunk
              ctx.text = ctx.el.innerHTML;
              sa.json.decode.white(ctx);
              return true;
            }
          }
        }
      },

      allDone: function (ctx) {
        clearTimeout(ctx.waitTimeout);
        ctx.status = 'done';
        if (typeof ctx.baseID == 'string') {
          sa.json.decode.reportStatus(ctx, 'long', 'Completed decoding of JSON' + (typeof ctx.baseID == 'string' ? ' in ' + ctx.baseID : '') + (typeof ctx.origin == 'string' ? ' coming from ' + ctx.origin : '') + '.');
        };
        sa.json.decode.reportStatus(ctx, 'short', '');

        var e = document.getElementById(ctx.baseID);
        if (e) e.className += ' hm_parsed_and_removed_for_efficiency';

        // destroy the _global_ reference to the context-data:
        //sa.json.decode.contexts[ctx.id] = hms.tools.elapsedMilliseconds() / 1000;
        // If there is a reviver function, we recursively walk the new structure,
        // passing each name/value pair to the reviver function for possible
        // transformation, starting with a temporary root object that holds the result
        // in an empty key. If there is not a reviver function, we simply return the
        // result.
        ctx.result = (typeof ctx.reviver === 'function' ? (function walk(holder, key) {
          var k, v, value = holder[key];
          if (value && typeof value === 'object') {
            for (k in value) {
              if (Object.hasOwnProperty.call(value, k)) {
                v = walk(value, k);
                if (v !== undefined) {
                  value[k] = v;
                } else {
                  delete value[k];
                }
              }
            }
          }
          return ctx.reviver.call(holder, key, value);
        }({
          '': ctx.result
        },
        '')) : ctx.result);
		if (!ctx.onSuccessCalled) {
        if (
			ctx.result!==null 
			
		) {
			ctx.onSuccessCalled = true;
			if (typeof ctx.onSuccess == 'function') ctx.onSuccess(ctx.result);
        } else {
			if (typeof ctx.onError=='function') ctx.onError ('allDone() : onSuccess has already been called', ctx);
		};
			ctx.onSuccessCalled = true;
		}
		return ctx.result;
      }
    },
    // sa.json.decode
    // The following JSON ENcoder is originally from http://json.org, modified by info@seductiveapps.com
    // Included for completeness only, not actually used in the jsonViewer code.
    encode: function (val) {
      var sv;
      switch (typeof val) {
      case 'object':
        if (val == null) {
          sv = "null";
        } else if (val.length) {
          sv = sa.json.arrayToJSONstring(val);
        } else {
          sv = sa.json.objectToJSONstring(val);
        }
        break;
      case 'string':
        sv = sa.json.stringToJSONstring(val);
        break;
      case 'number':
        sv = sa.json.numberToJSONstring(val);
        break;
      case 'boolean':
        sv = sa.json.booleanToJSONstring(val);
        break;
      }
      return sv;
    },

    arrayToJSONstring: function (ar) {
      var a = [],
        v;

      for (var i = 0; i < ar.length; i += 1) {
        v = ar[i];
        switch (typeof v) {
        case 'object':
          if (v) {
            a.push(sa.json.objectToJSONstring(v));
          } else {
            a.push('null');
          }
          break;

        case 'string':
          a.push(sa.json.stringToJSONstring(v));
          break;
        case 'number':
          a.push(sa.json.numberToJSONstring(v));
          break;
        case 'boolean':
          a.push(sa.json.booleanToJSONstring(v));
          break;
        }
      }
      return '[' + a.join(',') + ']'; // Join all of the member texts together and wrap them in brackets.
    },

    booleanToJSONstring: function (b) {
      return String(b);
    },

    dateToJSONstring: function (dt) {

      // Ultimately, this method will be equivalent to the date.toISOString method.

      function f(n) { // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
      }

      return '"' + dt.getFullYear() + '-' + f(dt.getMonth() + 1) + '-' + f(dt.getDate()) + 'T' + f(dt.getHours()) + ':' + f(dt.getMinutes()) + ':' + f(dt.getSeconds()) + '"';
    },

    numberToJSONstring: function (num) {
      // JSON numbers must be finite. Encode non-finite numbers as null.
      return isFinite(num) ? String(num) : 'null';
    },

    objectToJSONstring: function (ob) {
      var a = [],
      // The array holding the member texts.
      k, // The current key.
      v, // The current value.
      sk, sv;

      // Iterate through all of the keys in the object, ignoring the proto chain.
      for (k in ob) {
        if (ob.hasOwnProperty(k)) {
          switch (typeof k) {
          case 'object':
            sk = sa.json.objectToJSONstring(k);
            break;
          case 'string':
            sk = sa.json.stringToJSONstring(k);
            break;
          case 'number':
            sk = sa.json.numberToJSONstring(k);
            break;
          case 'boolean':
            sk = sa.json.booleanToJSONstring(k);
            break;
          }
          v = ob[k];
          switch (typeof v) {
          case 'object':
            if (v == null) {
              sv = 'null';
            } else if (v.length) {
              sv = sa.json.arrayToJSONstring(v);
            } else {
              sv = sa.json.objectToJSONstring(v);
            }
            break;

          case 'string':
            sv = sa.json.stringToJSONstring(v);
            break;
          case 'number':
            sv = sa.json.numberToJSONstring(v);
            break;
          case 'boolean':
            sv = sa.json.booleanToJSONstring(v);
            break;
          }

          a.push(sk + ':' + sv);

        }
      }

      return '{' + a.join(',') + '}';
    },

    stringToJSONstring: function (str) {
      // m is a table of character substitutions.
      var m = {
        '\b': String.fromCharCode(92)+'b',
        '\t': String.fromCharCode(92)+'t',
        '\n': String.fromCharCode(92)+'n',
        '\f': String.fromCharCode(92)+'f',
        '\r': String.fromCharCode(92)+'r',
        '"': String.fromCharCode(92)+'"'
      },
	  tst = new RegExp ('/["'+String.fromCharCode(92)+String.fromCharCode(92)+String.fromCharCode(92)+'x00-'+String.fromCharCode(92)+'x1f]/'), // /["\\\x00-\x1f]/
	  tst2 = new RegExp ('/['+String.fromCharCode(92)+'x00-'+String.fromCharCode(92)+'x1f'+String.fromCharCode(92)+String.fromCharCode(92)+'"]/g');
	  m[String.fromCharCode(92)] = String.fromCharCode(92)+String.fromCharCode(92);

      // If the string contains no control characters, no quote characters, and no
      // backslash characters, then we can simply slap some quotes around it.
      // Otherwise we must also replace the offending characters with safe
      // sequences.
      if (tst.test(str)) {
        return '"' + str.replace(tst2, function (a) {
          var c = m[a];
          if (c) {
            return c;
          }
          c = a.charCodeAt();
          return String.fromCharCode(92) + 'u00' + Math.floor(c / 16).toString(16) + (c % 16).toString(16);
        }) + '"';
      }
      return '"' + str + '"';
    }
};
