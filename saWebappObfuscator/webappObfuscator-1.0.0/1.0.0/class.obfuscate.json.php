<?php

class webappObfuscator_obfuscate__json {

	public $settings = null;
	public $workData = array();
	
	public function __construct ($settings) {
		$this->settings = $settings;
	}
	
	
	public function writeOutputToDisk ($basePaths=null) {
		$wd = &$this->workData;
		$s = &$this->settings;
		$gs = &$s['globalSettings'];
		$obfuscator = &$s['obfuscator'];
		global $lowerMemoryUsage;
		global $reportStatusGoesToStatusfile;
		$sourcesURLs = &$gs['sources']['urls'];

		if (!array_key_exists('output', $wd)) {
			return badResult (E_USER_ERROR, array(
				'msg' => 'webappObfuscator_obfuscate__javascript::writeOutputToDisk() : No output to write to disk --- array_key_exists("output", $wd)===false',
				'$wd' => '$wd'
			));
		}
		
		//echo '<pre>2341'; var_dump ($wd['output']['stages'][0]); //die();
	
		// the individual files from $sourcesURLs, obfuscated, written to $basePath 
		// as a subdirectory structure that mirrors the URL folder structure
		$wd['output']['stages'][1] = $obfuscator->writeOutput__stage0__walk (
			'json', $basePaths, '', $wd['output']['stages'][0], $sourcesURLs['json']
		);
		return 'results are in $my->workData["output"]["stages"][1]';
	}
	
	
	public function obfuscate () {
		$wd = &$this->workData;
		$s = &$this->settings;
		$gs = &$s['globalSettings'];
		$obfuscator = &$s['obfuscator'];
		global $lowerMemoryUsage;
		global $reportStatusGoesToStatusfile;

		if (
			array_key_exists ('sourcesType', $gs)
			&& (
				$gs['sourcesType'] !== 'mixed'
				&& $gs['sourcesType'] !== 'json'
			)
		) return false;
		
		
		$wd['output'] = array(
			'stages' => array (
				0 => array()
			)
		);

		// here's your actual output :
		$wd['output']['stages'][0] = $this->obfuscate__stage0__walk ('', $wd['sources']['stages'][0]);
	}

	private function obfuscate__stage0__walk ($path, $sources) {
		$wd = &$this->workData;
		$s = &$this->settings;
		$gs = &$s['globalSettings'];
		$obfuscator = &$s['obfuscator'];
		
		if (is_array($sources)) {
			$r = array();
			foreach ($sources as $k => $v) {
				if (is_string($v)) {
					reportStatus (600, '<p class="webappObfuscator__process__detail">Obfuscating JSON - stage 1 (2 stages total) - processing '.formatSourcepath($path,$k).'</p>');
					$r[$k] = $this->obfuscate__stage0__node ($path, $k, $v);
				} else {
					$r[$k] = $this->obfuscate__stage0__walk ($path.'/'.$k, $sources[$k]);
				}
			}
		} elseif (is_string($sources)) {
                    reportStatus (600, '<p class="webappObfuscator__process__detail">Obfuscating JSON - stage 1 (2 stages total) - processing '.formatSourcepath($path,$k).'</p>');
                    $r = $this->obfuscate__produceOutput($path, $sources, $obfuscator->workData['tokens']);
		}
		return $r;
	}

	private function obfuscate__stage0__node ($path, $k, $src) {
		$wd = &$this->workData;
		$s = &$this->settings;
		$gs = &$s['globalSettings'];
		$obfuscator = &$s['obfuscator'];
		
		if (false) {
                    echo __FILE__.':::obfuscate__stage0__node()::$path/$k=<pre>'; var_dump ($path.'/'.$k); echo '</pre>'; 
                    echo __FILE__.':::obfuscate__stage0__node()::$wd=<pre>'; var_dump ($wd); echo '</pre>'; 
                    //die();
		}
		
		$d = $wd['sources']['stages'][1];
		$pathParts = explode('/',$path.'/'.$k);
		array_shift($pathParts);
		$d = &chase ($d, $pathParts, false);
		if (good($d)) {
                    $d = &result($d);
                    //echo '$d=<pre>'; var_dump ($d); echo '</pre>'; die();
                    $d = &$d['d'];
                    if (
                        array_key_exists('__wo__tokenizeInsideValuesRecursive', $d)
                        && $d['__wo__tokenizeInsideValuesRecursive'] === true
                    ) {
                        //echo '$d=<pre>'; var_dump ($d); echo '</pre>'; die();
                    }
		}
		
		$obfuscatedSource = $this->obfuscate__produceOutput ($path.'/'.$k, $src, $obfuscator->workData['tokens']); 
		return $obfuscatedSource;
	}	
	
	public function obfuscate__produceOutput ($path, $source, $allTokens) {
		$wd = &$this->workData;
		$s = &$this->settings;
		$gs = &$s['globalSettings'];
		$obfuscator = &$s['obfuscator'];

		
		$obfuscatedSource = $obfuscator->phpJSO_replace_tokens($allTokens, $source); 
		
		if (is_string($obfuscatedSource)) {
                    $size = strlen($obfuscatedSource);
                } elseif (is_array($obfuscatedSource)) {
                    $c = jsonEncode($obfuscatedSource);
                    $size = strlen ($c);
                }
		
		reportStatus (500, '<p class="webappObfuscator__process__detail">Obfuscating JSON - stage 2 (2 stages total) - obfuscated '.formatSourcepath($path).' (<span class="webappObfuscator__filesizeHumanReadable">'.filesizeHumanReadable($size).'</span>)</p>');
		
		$wd['obfuscatedSource'] = $obfuscatedSource;

		return $obfuscatedSource;
	}
		
	
	public function OLD___obfuscate () {
		$wd = &$this->workData;
		$s = &$this->settings;
		$gs = &$s['globalSettings'];
		$obfuscator = &$s['obfuscator'];

		echo '<pre style="color:green">6745='; var_dump ($wd); echo '</pre>';
		$allSources = $wd['sources']['stages'][0];
		$allTokens = $obfuscator->workData['tokens'];
		$wd['output'] = array();
		echo '<pre style="color:green;font-weight:bold;">6243='; var_dump ($allSources); echo '</pre>';
		foreach ($allSources as $sourcesDescription => $sources) {
			if (is_array($sources)) {
				$wd['output'][$sourcesDescription] = array();
				foreach ($sources as $sourceDescription => $source) {
					/* $source is a JSON text-string */
					$wd['output'][$sourcesDescription][$sourceDescription] = $this->obfuscate__produceOutput ($source, $allTokens, $sourcesDescription, $sourceDescription);
				}
			} else {
				//var_dump ($sources);
				/* $sources is a JSON text-string */
				$wd['output'][$sourcesDescription] = $this->obfuscate__produceOutput($sources, $allTokens, $sourcesDescription, '');
			}
		}
		
		/*
		$wd['output'] = array (
			'stages' => array (
				0 => $this->obfuscate__stage0__walk ($wd['sources']['stages'][0])
			)
		);
		$wd['output']['stages'][1] = .......
		*/
	
	}
	
	public function OLD___obfuscate__produceOutput ($source, $allTokens, $sourcesDescription, $sourceDescription) {
		$wd = &$this->workData;
		$s = &$this->settings;
		$gs = &$s['globalSettings'];
		$obfuscator = &$s['obfuscator'];
		$wJavascript = $obfuscator->getWorker('javascript');
		global $lowerMemoryUsage;
		global $reportStatusGoesToStatusfile;
		global $deadSlow______butThorough;
		global $searchTokenSpecialChars;
		global $replaceTokenSpecialChars;

		return str_replace (array_values($allTokens), array_keys($allTokens), $source);
	}
	
	public function preprocess($sources=null) {
		$wd = &$this->workData;
		$wd['tokens'] = array();
		$s = &$this->settings;
		$gs = &$s['globalSettings'];
		if (
			array_key_exists ('sourcesType', $gs)
			&& (
				$gs['sourcesType'] !== 'mixed'
				&& $gs['sourcesType'] !== 'json'
			)
		) return false;
		
		//echo '$sources=<pre>'; var_dump ($sources); echo '</pre>'; die();
		//echo '$gs=<pre>'; var_dump ($gs); echo '</pre>'; die();
		if (
			is_null($sources) 
			&& (
				!array_key_exists('sourcesType',$gs)
				|| $gs['sourcesType']==='mixed'
			)
		) $sources = &$gs['sources']['fetched']['json'];
		if (
			is_null($sources) 
			&& array_key_exists('sourcesType',$gs)
			&& $gs['sourcesType']!=='mixed'
		) $sources = &$gs['sources'];
		
		//echo '$sources=<pre>'; var_dump ($sources); echo '</pre>'; die();

		
		$wd = array(
			'sources' => array (
				'stages' => array (
					0 => $sources,
					1 => array()
				)
			),
			'sourceForObfuscation' => '',
			'tokens' => array()
		);
		
		//echo '$sources=<pre>'; var_dump ($sources); die();
		
		if (is_string($sources)) {
			$wd['sources']['stages'][1] = $this->preprocess__stage0__node ('', '', $sources);
		} elseif (is_array($sources)) {
			$wd['sources']['stages'][1] = $this->preprocess__stage0__walk ($sources);
		} else {
			return badResult (E_USER_ERROR, array (
				'msg' => 'webappObfuscator_obfuscate__json::preprocess() : invalid stage0 settings',
				'$wd' => $wd
			));
		}
		
		reportStatus (700, '<p class="webappObfuscator__process__detail">Gathering tokens in JSON - stage 1 of 1 - walking sources</p>');
	}
	
	public function preprocess__stage0__walk ($sources, $sourceIDpath='') {
		$wd = &$this->workData;
		$s = &$this->settings;
		$gs = &$s['globalSettings'];
		$wdo = array();
		foreach ($sources as $k => $v) {
			if (is_string($v)) {
				$wdo[$k] = $this->preprocess__stage0__node ($sourceIDpath, $k, $v);
			} else if (is_array($v)) {
				$wdo[$k] = $this->preprocess__stage0__walk ($sources[$k], $sourceIDpath.'/'.$k);
			}
		}
		return $wdo;
	}
	
	public function preprocess__stage0__node ($sourceIDpath, $sourceID, $source) {
		$wd = &$this->workData;
		$s = &$this->settings;
		$gs = &$s['globalSettings'];
		global $reportStatusGoesToStatusfile;
		$r = array();
		
		//echo '$source=<pre>'; var_dump($source); echo '</pre>';die();
		$d = jsonDecode($source, true);
		if (!is_array($d)) {
			$r['__wo__error'] = 'for "'.$source.'", json_last_error() = '.json_last_error();
		} else {
			$r['d'] = $d;
			
			if (
				array_key_exists('__wo__tokenizeAllKeysRecursive', $d)
				&& $d['__wo__tokenizeAllKeysRecursive'] === true
			) {
				$this->preprocess_stage0__dataWalker__tokenizeAllKeys__walk ($d, '', $d);
			}
			
			/*
			if (
                            array_key_exists('__wo__tokenizeInsideValuesRecursive', $d)
                            && $d['__wo__tokenizeInsideValuesRecursive'] === true
			) {
			
			}*/
			
			if (
			  array_key_exists('__wo__whitelistAllKeysRecursive', $d)
			  && $d['__wo__whitelistAllKeysRecursive'] === true
			) {
			  $this->preprocess_stage0__dataWalker__whitelistAllKeys__walk ($d, '', $d);
			  global $wo__ignoreList__site;
			  if (
			    !isset($wo__ignoreList__site) 
			    || !is_array($wo__ignoreList__site)
			  ) {
			    $wo__ignoreList__site = array();
			  };
			  $wo__ignoreList__site = array_unique(array_merge(
			    $wo__ignoreList__site,
			    $wd['whitelistedTokens'] 
			  ));
			}
			
			
		}
		//if ($reportStatusGoesToStatusfile===false) { echo '<pre>webappObfuscator_obfuscate__html::preprocess__stage0__node() : $r='; var_dump ($r); echo'</pre>'; };
		return $r;
	}	
	
	public function preprocess_stage0__dataWalker__tokenizeAllKeys__walk ($d, $path = '', $dd) {
		$wd = &$this->workData;
		$s = &$this->settings;
		$gs = &$s['globalSettings'];
		if (is_array($dd)) {
			foreach ($dd as $k => $v) {
				if (strpos($k, '__wo__')!==false) continue;
				if (is_array($v)) {
					$wd['tokens'][] = $k;
					$this->preprocess_stage0__dataWalker__tokenizeAllKeys__walk ($d, $path.'/'.$k, $v);
				} else {				
					$this->preprocess_stage0__dataWalker__tokenizeAllKeys__node ($d, $path.'/'.$k, $k, $v);
				}
			}
		}
	}
	
	public function preprocess_stage0__dataWalker__tokenizeAllKeys__node ($d, $path = '', $k, $v) {
		$wd = &$this->workData;
		$s = &$this->settings;
		$gs = &$s['globalSettings'];
		$wd['tokens'][] = $k;
	}

	public function preprocess_stage0__dataWalker__whitelistAllKeys__walk ($d, $path = '', $dd) {
		$wd = &$this->workData;
		$s = &$this->settings;
		$gs = &$s['globalSettings'];
		if (is_array($dd)) {
			foreach ($dd as $k => $v) {
				if (strpos($k, '__wo__')!==false) continue;
				if (is_array($v)) {
					$wd['whitelistedTokens'][] = $k;
					$this->preprocess_stage0__dataWalker__whitelistAllKeys__walk ($d, $path.'/'.$k, $v);
				} else {				
					$this->preprocess_stage0__dataWalker__whitelistAllKeys__node ($d, $path.'/'.$k, $k, $v);
				}
			}
		}
	}
	
	public function preprocess_stage0__dataWalker__whitelistAllKeys__node ($d, $path = '', $k, $v) {
		$wd = &$this->workData;
		$s = &$this->settings;
		$gs = &$s['globalSettings'];
		$wd['whitelistedTokens'][] = $k;
		//echo '$wd["whitelistedTokens"]=<pre>'; var_dump ($wd['whitelistedTokens']); echo '</pre>';
	}
}

?>
