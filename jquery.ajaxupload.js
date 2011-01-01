/**
 * @author Han Lin Yap < http://zencodez.net/ >
 * @copyright 2010 zencodez.net
 * @license http://creativecommons.org/licenses/by-sa/3.0/
 * @package Ajax-Upload
 * @version 1.1 - 2011-01-01
 * @website https://github.com/codler/jQuery-Ajax-Upload
 *
 * == Description == 
 * Uses native XHR to upload files, Browser requires FormData support
 *
 * == Example Usage ==
 * $.ajaxUpload({
 *	url: 'upload.php',
 *	data: ':file',
 *	success: function (data, status, xhr) {
 *		console.log(data);
 *	}
 * });
 */
(function ($) {
	$.ajaxUploadSettings = {
		//onloadstart	: function(e){},
		onprogress	: function(e){ console.log('progress') },
		onabort 	: function(e){ console.log('abort') },
		onerror 	: function(e){ console.log('error'); console.log(e) },
		onload 		: function(e){ console.log('load') },
		//ontimeout 	: function(e){},
		//onloadend 	: function(e){}
	}
	
	$.ajaxUploadSerializeFiles = function( element ) {
		var data = [];
		var name = $(element).attr('name');
		for(var i = 0, len = element.files.length; i < len; i++) {
			data.push({
				'name' : name, 
				'value': element.files[i]
			});
		}
		return data;
	}
	
	/**
	 * @param kv array [{name, value},..]
	 * @param exist FormData Existing FormData
	 */
	$.ajaxUploadToFormData = function( kv, exist ) {
		var fd = exist || new FormData();
		for(var i = 0, len = kv.length; i < len; i++) {
			fd.append(kv[i].name, kv[i].value);
		}
		return fd;
	}
	
	$.ajaxUploadExtractData = function( data, exist ) {
		if (!data || data instanceof FormData ) return data;
		var fd = $.ajaxUploadExtractData(exist) || new FormData();
		if ( typeof data === "string" || data instanceof jQuery ) {
			var kv = [];
			$(data).each(function (index, element) {
				$.merge( kv, $.ajaxUploadSerializeFiles(this) );
			});
			data = kv;
		} else if (typeof data === "object") {
			var temp = [];
			for(name in data) {
				temp.push({
					'name': name,
					'value': data[name]
				});
			}
			data = temp;
		}
		return $.ajaxUploadToFormData(data, fd);
	}

	$.fn.ajaxUpload = function( origSettings ) {
		// Do browser support?
		if ( typeof FormData == "undefined" ) return false;
		
		var data = $(this).serializeArray();
		$('input:file', this).each(function (index, element) {
			$.merge( data, $.ajaxUploadSerializeFiles(this) );
		});
		if ( origSettings.data ) {
			origSettings.data = $.ajaxUploadExtractData(data, origSettings.data);
		}
		$.ajaxUpload(origSettings);
		return this;
	}
	
	$.ajaxUploadPost = function( url, data, callback, type ) {
		// shift arguments if data argument was omited
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = {};
		}

		return $.ajaxUpload({
			type: "POST",
			url: url,
			data: data,
			success: callback,
			dataType: type
		});
	}
	
	/**
	 * Not available
	 *
	 * contentType
	 * processData
	 * type
	 */
	$.ajaxUpload = function(origSettings) {
		// Do browser support?
		if (typeof FormData == "undefined") return false;
		
		// Merge Global settings
		var s = jQuery.extend(true, {}, $.ajaxUploadSettings, origSettings);
		
		// Normalize data
		var fd = $.ajaxUploadExtractData(s.data);
		
		// Set nessessery settings
		s.data = null;
		var nesseserySettings = {
			processData : false,
			type: 'POST',
			beforeSend : function(xhr, s) {
				xhr.upload.onprogress = s.onprogress;
				xhr.upload.onabort = s.onabort;
				xhr.upload.onerror = s.onerror;
				xhr.upload.onload = s.onload;
				s.data = fd;
				if (origSettings.beforeSend) {
					origSettings.beforeSend.call(this, xhr, s);
				}
			}
		}
		s = jQuery.extend(true, {}, s, nesseserySettings);
		// make sure dont overwrites multipart
		if (s.contentType) {
			delete s.contentType;
		}
		
		// Upload
		$.ajax(s);
	}
})(jQuery);