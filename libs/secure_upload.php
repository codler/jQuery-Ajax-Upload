<?php
require_once('kirby/kirby.php');
/**
 * @author Han Lin Yap < http://zencodez.net/ >
 * @copyright 2011 zencodez.net
 * @license http://creativecommons.org/licenses/by-sa/3.0/
 * @version 1.0 - 2011-01-12
 */
function server_maxupload() {
	return min(to_bytes(ini_get('post_max_size')),
		to_bytes(ini_get('upload_max_filesize')));
}

function to_bytes($val) {
	$last = strtolower($val[strlen($val)-1]);
    switch($last) {
        case 'g':
            $val *= 1024;
        case 'm':
            $val *= 1024;
        case 'k':
            $val *= 1024;
    }
	return $val;
}

/**
 * Upload image
 *
 * Requirement: Kirby
 *
 * @param string $name Name POSTNAME
 * @return array
 * @version 1.0 - 2011-01-12
 */
function secure_upload($options) {
	/* 	
	$options['field'] // (required) source string
	$options['path'] // (required) source string
	*/
	$options['image'] = (isset($options['image'])) ? $options['image'] : true; // default true
	$options['max_size'] = (isset($options['max_size'])) ? min($options['max_size'],server_maxupload()) : server_maxupload(); // default server max upload in bytes

	if (empty($options['field']) || empty($options['path'])) {
		return array('error' => 'Option field and path is required');
	}
	
	if (!isset($_FILES[$options['field']])) {
		return array('error' => 'No file was selected');
	}
	
	// validate path
	$upload_path = $options['path'];
	$upload_path = rtrim($upload_path, '/').'/';
	if (@realpath($upload_path) !== false) {
		$upload_path = str_replace("\\", "/", realpath($upload_path));
	}
	if(!file_exists($upload_path)) {
		if (!@mkdir($upload_path, 0777)) {
			return array('error' => 'Directory isnt writable');
		}
		chmod($upload_path, 0777);
	}
	if (!@is_dir($upload_path) || !is_writable($upload_path)) {
		return array('error' => 'Directory isnt writable');
	}
	$upload_path = preg_replace("/(.+?)\/*$/", "\\1/",  $upload_path); // ?
	
	
	// Remapping for loop
	if (!is_array($_FILES[$options['field']]['tmp_name'])) {
		$_FILES[$options['field']] = array_map(function ($item) {
			return array($item);
		}, $_FILES[$options['field']]);
	}
	
	$success = array();
	foreach($_FILES[$options['field']]['tmp_name'] AS $key => $value) {
		// Get upload info
		$error = $_FILES[$options['field']]['error'][$key];
		$name = $_FILES[$options['field']]['name'][$key];
		$tmp_name = $_FILES[$options['field']]['tmp_name'][$key];
		$size = $_FILES[$options['field']]['size'][$key];
		$type = $_FILES[$options['field']]['type'][$key];
		
		if (!is_uploaded_file($tmp_name) || $error != UPLOAD_ERR_OK) {
			continue;
		}
		
		$type = preg_replace("/^(.+?);.*$/", "\\1", $type); // ?
		$type = strtolower(trim(stripslashes($type), '"'));
		$ext = f::extension($name);
		$name = f::safe_name(f::name($name));
		$name = substr($name, 0, 100);
		
		// Check allowed file type
		$image_types = array('gif', 'jpg', 'jpeg', 'png', 'jpe');
		if ($options['image']) {
			if (!in_array($ext, $image_types) || !is_image($type) || getimagesize($tmp_name) === false) {
				continue;
			}
		}
		
		// Check file size
		if ($options['max_size'] < $size) {
			continue;
		}
		
		// Unique filename
		if (file_exists($upload_path.$name.".".$ext)) {
			$number = 1;
			while (file_exists($upload_path.$name.$number.".".$ext)){
				$number++;
			}
			$name = $name . $number; 
		}
		
		// save
		if (!@move_uploaded_file($tmp_name, $upload_path.$name.".".$ext)) {
			continue;
		}
		
		// TODO xss clean
		
		
		
		$success[] = array(
			'extension' => $ext,
			'filename' => $name.".".$ext,
			'original_filename' => $_FILES[$options['field']]['name'][$key],
			'name' => $name,
			'size' => $size,
			'nice_size' => f::nice_size($size),
			'md5' => md5(file_get_contents($upload_path.$name.".".$ext))
		);
	}
	return array(
		'failed' => count($_FILES[$options['field']]['tmp_name']) - count($success),
		'success' => $success
	);
}


/**
 * Validate the image
 *
 * @access	public
 * @return	bool
 */	
function is_image($mine)
{
	// IE will sometimes return odd mime-types during upload, so here we just standardize all
	// jpegs or pngs to the same file type.

	$png_mimes  = array('image/x-png');
	$jpeg_mimes = array('image/jpg', 'image/jpe', 'image/jpeg', 'image/pjpeg');
	
	if (in_array($mine, $png_mimes))
	{
		$mine = 'image/png';
	}
	
	if (in_array($mine, $jpeg_mimes))
	{
		$mine = 'image/jpeg';
	}

	$img_mimes = array(
						'image/gif',
						'image/jpeg',
						'image/png',
					   );

	return (in_array($mine, $img_mimes, TRUE)) ? TRUE : FALSE;
}
?>