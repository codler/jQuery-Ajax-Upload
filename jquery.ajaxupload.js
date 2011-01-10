/**
 * @author Han Lin Yap < http://zencodez.net/ >
 * @copyright 2011 zencodez.net
 * @license http://creativecommons.org/licenses/by-sa/3.0/
 * @package Ajax-Upload
 * @version 1.3 - 2011-01-10
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
	$.support.ajax2 = $.support.ajax && typeof FormData != "undefined";
	$.ajaxUploadSettings = {
		//onloadstart	: function(e){},
		onprogress	: function(e){ console.log('progress') },
		onabort 	: function(e){ console.log('abort') },
		onerror 	: function(e){ console.log('error'); console.log(e) },
		onload 		: function(e){ console.log('load') }
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
	 * @param array kv [{name, value},..]
	 * @param FormData exist Existing FormData
	 */
	$.ajaxUploadToFormData = function( kv, exist ) {
		var fd = exist || new FormData();
		for(var i = 0, len = kv.length; i < len; i++) {
			fd.append(kv[i].name, kv[i].value);
		}
		return fd;
	}
	
	$.ajaxUploadExtractData = function( data, exist ) {
		if ( !data || $.isArray(data)/* || data instanceof FormData*/ ) return data;
		//var fd = $.ajaxUploadExtractData(exist) || new FormData();
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
		return /*$.ajaxUploadToFormData(*/data/*, fd)*/;
	}
	
	/**
	 * All available options as $.ajax() except
	 * contentType
	 * processData
	 * type
	 */
	$.ajaxUpload = function(origSettings) {
		// Do browser support?
		if ( !$.support.ajax2 ) return false;
		
		// Merge Global settings
		var s = jQuery.extend(true, {}, $.ajaxUploadSettings, origSettings);
		
		// Normalize data
		var fd = $.ajaxUploadExtractData(s.data);
		fd = $.ajaxUploadToFormData(fd);
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

	$.fn.ajaxUpload = function( origSettings ) {
		// Do browser support?
		if ( !$.support.ajax2 ) return false;
		
		this.each(function() {
			var data = $(this).serializeArray();
			$('input:file', this).each(function (index, element) {
				$.merge( data, $.ajaxUploadSerializeFiles(this) );
			});
			if ( origSettings.data ) {
				origSettings.data = $.ajaxUploadExtractData(data/*, origSettings.data*/);
			}
			$.ajaxUpload(origSettings);
		});
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

	$.ajaxUploadPrompt = function( url, data, callback, type ) {
		if ( !$.support.ajax2 ) return false;
		
		// shift arguments if data argument was omited
		if ( jQuery.isFunction( data ) ) {
			type = type || callback;
			callback = data;
			data = {};
		}
		var id = 'ajaxupload' + new Date().getTime();
		var form = $('<form method="post" enctype="multipart/form-data" target="' + id + '" />').appendTo('body');
		form.css({
			position: 'relative',
			top: -1000,
			left: -1000,
			opacity: 0
		});
		var d = $('<input type="file" multiple name="uploads[]" />').appendTo(form);
		d.change(function() {
			data = $.ajaxUploadExtractData(data);
			
			/*
			// Do browser support?
			if ( !$.support.ajax2 ) {
				var iframe = $('<iframe src="javascript:false;" name="' + id + '" />').appendTo('body');
				iframe.bind('load', function() {
					alert('load');
					if (!iframe[0].parentNode){
						return;
					}
					
					var doc = iframe[0].contentDocument ? iframe[0].contentDocument: iframe[0].contentWindow.document
					var data = doc.body.innerHTML;
					callback(data);
					$(this).unbind('load');
					form.remove();
				});
				
				form.submit();
				return false;
			}*/
			
			$.merge( data, $.ajaxUploadSerializeFiles(this) );
			$.ajaxUpload({
				url: url,
				data: data,
				success: function () {
					callback.apply(this, arguments);
					form.remove();
				},
				dataType: type
			});
		});
		d.click();
	}
	
	// bind a click event
	$.fn.ajaxUploadPrompt = function( url, data, callback, type ) {
		this.each(function() {
			$(this).click(function () {
				$.ajaxUploadPrompt( url, data, callback, type );
			});
		});
		return this;
	}
})(jQuery);