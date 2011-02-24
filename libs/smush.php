<?php
/**
 * Smush.it API
 *
 * API for smush.it
 * Optimizes image
 * GIF are converted to PNG at Smush.it
 *
 * @author Han Lin Yap < http://zencodez.net/ >
 * @copyright 2011 zencodez.net
 * @license http://creativecommons.org/licenses/by-sa/3.0/
 * @package smush.it API
 * @version 1.0 - 2011-02-23
 */
require_once('fetch_url.class.php');

defined('SMUSH_VERSION') or define('SMUSH_VERSION', 1);
defined('SMUSH_USER_AGENT') or define('SMUSH_USER_AGENT', 'SmushAPI/'.SMUSH_VERSION.' (+https://github.com/codler/Smush.it-API)');

function smush_file($optimize_file, $optimized_file=null) {
	if (!$optimized_file) $optimized_file = $optimize_file;
	
	// send file
	$obj = new Fetch_url('http://www.smushit.com/ysmush.it/ws.php', array('files[]' => '@'.$optimize_file), null, null, SMUSH_USER_AGENT);
	
	return _smush($obj, $optimized_file);
}

function smush_url($url, $optimized_file) {
	
	// send file
	$obj = new Fetch_url('http://www.smushit.com/ysmush.it/ws.php?img='.urlencode($url), null, null, null, SMUSH_USER_AGENT);
	
	return _smush($obj, $optimized_file);
}

function _smush($obj, $dest) {
	
	if ($obj->error) {
		return array(
			'error' => 'Send error: ' . $obj->error
		);
		return false;
	}
	
	if (strpos(trim($obj->source), '{') != 0) {
		return array(
			'error' => 'Response error'
		);
		return false;
	}
	
	$s = json_decode($obj->source);
	
	if ( -1 === intval($s->dest_size)) {
		return array(
			'error' => 'Smush error1: ' . print_r($s, true)
		);
		return false;
	}
	
	if (!$s->dest) {
		return array(
			'error' => 'Smush error2: ' . print_r($s, true)
		);
		return false;
	}
	
	$url = $s->dest;
	$percent = $s->percent;
	$saving = $s->src_size - $s->dest_size;
	
	
	
	// Save file
	$handle = @fopen($dest, 'wb');
	if (!$handle) {
		return array(
			'error' => 'Save error'
		);
		return false;
	}
	
	$obj = new Fetch_url($url, null, null, null, 'SmushAPI/'.SMUSH_VERSION);
	
	if ($obj->error) {
		fclose($handle);
		return array(
			'error' => 'Fetch error'
		);
		return false;
	}
	
	fwrite($handle, $content);
	fclose($handle);
	return array(
		'percent' => $percent,
		'saving' => $saving
	);
}
?>