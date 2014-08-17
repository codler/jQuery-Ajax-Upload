/*! Ajax-Upload - v2.0.1 - 2014-08-17 - Uses native XHR to upload files.
* https://github.com/codler/jQuery-Ajax-Upload
* Copyright (c) 2014 Han Lin Yap http://yap.nu; MIT license
* == Example Usage ==
* $.ajaxUpload({
*	url: 'upload.php',
*	data: ':file',
*	success: function (data, status, xhr) {
*		console.log(data);
*	}
* });
*/
/* --- Other polyfills --- */
// Avoid `console` errors in browsers that lack a console.
(function() {
	var noop = function () {};
	var console = (window.console = window.console || {});
	
	if (!console.log) {
		console.log = noop;
	}
}());

/* --- Ajax Upload --- */
(function ($) {
	'use strict';

	// Prevent to read twice
	if ($.ajaxUpload) {
		return;
	}

	$.ajaxUploadSettings = {
		//onloadstart	: function(e){},
		onprogress	: function(e){ console.log('Ajax Upload progress'); },
		onabort 	: function(e){ console.log('Ajax Upload abort'); },
		onerror 	: function(e){ console.log('Ajax Upload error'); console.log(e); },
		onload 		: function(e){ console.log('Ajax Upload load'); },
		//ontimeout 	: function(e){},
		//onloadend 	: function(e){},
		name		: 'uploads[]'
	};

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
	};

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
	};

	$.ajaxUploadExtractData = function( data, exist ) {
		if ( !data/* || $.isArray(data)*/ || data instanceof FormData ) return data;
		var fd = $.ajaxUploadExtractData(exist) || new FormData();
		if ( typeof data === "string" || data instanceof jQuery ) {
			var kv = [];
			$(data).each(function (index, element) {
				$.merge( kv, $.ajaxUploadSerializeFiles(this) );
			});
			data = kv;
		} else if (data instanceof FileList) {
			var kv = [];
			for(var i = 0, len = data.length; i < len; i++) {
				kv.push({
					'name' : $.ajaxUploadSettings.name, 
					'value': data[i]
				});
			}
			data = kv;
		} else if (typeof data === "object" && !$.isArray(data)) {
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
	};

	/**
	 * All available options as $.ajax() except
	 * contentType
	 * processData
	 * type
	 */
	$.ajaxUpload = function(origSettings) {

		// Merge Global settings
		var s = jQuery.extend(true, {}, $.ajaxUploadSettings, origSettings);

		// Normalize data
		var fd = $.ajaxUploadExtractData(s.data);
		//fd = $.ajaxUploadToFormData(fd);
		// Set nessessery settings
		s.data = null;
		var nesseserySettings = {
			processData : false,
			type: 'POST',
			beforeSend : function(xhr, s) {
				s.xhr = function () {
					var xhr = new window.XMLHttpRequest();
					xhr.upload.onprogress = s.onprogress.bind(this);
					xhr.upload.onabort = s.onabort.bind(this);
					xhr.upload.onerror = s.onerror.bind(this);
					xhr.upload.onload = s.onload.bind(this);
					return xhr;
				};
				s.data = fd;
				if (origSettings.beforeSend) {
					origSettings.beforeSend.call(this, xhr, s);
				}
			}
		};
		s = jQuery.extend(true, {}, s, nesseserySettings);
		// make sure dont overwrites multipart
		if (s.contentType) {
			delete s.contentType;
		}
		// Upload
		return $.ajax(s);
	};

	$.fn.ajaxUpload = function( origSettings ) {
		return this.each(function() {
			var options = jQuery.extend(true, {}, origSettings);
			var data = $(this).serializeArray();

			$('input:file', this).each(function (index, element) {
				$.merge( data, $.ajaxUploadSerializeFiles(this) );
			});
			
			options.data = $.ajaxUploadExtractData(data, options.data);
			
			$.ajaxUpload(options);
		});
	};

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
	};

	$.ajaxUploadPrompt = function( options ) {
		var def = $.Deferred();
		var nesseserySettings = {
			success : function () {
				if (options.success) {
					options.success.apply(this, arguments);
				}
				form.remove();
			}
		};

		var s = jQuery.extend(true, {}, options, nesseserySettings);
		var id = 'ajaxupload' + Date.now();
		var form = $('<form method="post" enctype="multipart/form-data" />').appendTo('body');
		form.attr('action', s.url);
		form.attr('target', id);

		form.css({
			position: 'relative',
			top: -1000,
			left: -1000,
			opacity: 0
		});
		form.submit(function () { //alert($(':file', this).val()); 
		});
				
		var d = $('<input type="file" />').appendTo(form);
		d.attr('name', $.ajaxUploadSettings.name);

		if (options.accept) {
			d.attr('accept', options.accept);
		}

		if (options.multiple) {
			d.attr('multiple', 'multiple');
		}

		d.change(function() {
			if (!this.files.length) {
				return false;
			}

			if (!s.data) {
				s.data = {};
			}

			s.files = this.files;
			s.data = $.ajaxUploadExtractData(s.data, $.ajaxUploadSerializeFiles(this));

			$.ajaxUpload(s).promise(def);
		});
		d.click();
		
		return def;
	};
	
	// bind a click event
	$.fn.ajaxUploadPrompt = function( origSettings ) {
		return this.click(function () {
			$(this).trigger('ajaxUploadPrompt', $.ajaxUploadPrompt( origSettings ));
		});
	};

	// bind a drop event
	$.fn.ajaxUploadDrop = function( origSettings ) {
		return this.each(function() {
			var $this = $(this);

			$this.on('dragenter.ajaxUpload', function(e) {
				e.stopPropagation(); e.preventDefault();

				$this.addClass('dragover');
				
			}).on('dragover.ajaxUpload', function(e) {
				e.stopPropagation(); e.preventDefault();
				
				$this.addClass('dragover');

			}).on('dragleave.ajaxUpload', function(e) {
				$this.removeClass('dragover');

			}).on('drop.ajaxUpload', function(e) {
				e.stopPropagation(); e.preventDefault();

				var dt = e.originalEvent.dataTransfer;  
				var files = dt.files;							
				var options = jQuery.extend(true, {}, origSettings);
				
				options.data = $.ajaxUploadExtractData(files, options.data);
				options.files = files;	
				
				$this.trigger('ajaxUploadDrop', $.ajaxUpload(options));

				$this.removeClass('dragover');
			});
		});
	};
})(jQuery);