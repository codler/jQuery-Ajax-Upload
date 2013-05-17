/**
 * @author Han Lin Yap < http://zencodez.net/ >
 * @copyright 2011 zencodez.net
 * @license http://creativecommons.org/licenses/by-sa/3.0/
 * @package Ajax-Upload
 * @version 1.8 - 2011-02-25
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
 
 // Function.prototype.bind polyfill
if ( !Function.prototype.bind ) {

  Function.prototype.bind = function( obj ) {
    if(typeof this !== 'function') // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError('Function.prototype.bind - what is trying to be bound is not callable');

    var slice = [].slice,
        args = slice.call(arguments, 1), 
        self = this, 
        nop = function () {}, 
        bound = function () {
          return self.apply( this instanceof nop ? this : ( obj || {} ), 
                              args.concat( slice.call(arguments) ) );    
        };

    bound.prototype = this.prototype;

    return bound;
  };
}
 
(function ($) {
	
	var needOverlay = ($.browser.msie && parseInt($.browser.version.split('.')[0]) < 10) || 
					  $.browser.opera || 
					  ($.browser.mozilla && parseInt($.browser.version.split('.')[0]) < 3);

	$.support.ajax2 = $.support.ajax && typeof FormData != "undefined";
	$.ajaxUploadSettings = {
		//onloadstart	: function(e){},
		onprogress	: function(e){ console.log('progress') },
		onabort 	: function(e){ console.log('abort') },
		onerror 	: function(e){ console.log('error'); console.log(e) },
		onload 		: function(e){ console.log('load') },
		//ontimeout 	: function(e){},
		//onloadend 	: function(e){},
		name		: 'uploads[]'
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
				}
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
			var options = jQuery.extend(true, {}, origSettings);
			options.data = $.ajaxUploadExtractData(data, options.data);
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

	$.ajaxUploadPrompt = function( options ) {
		//if ( !$.support.ajax2 ) return false;
		
		var nesseserySettings = {
			success : function () {
				if (options.success) {
					options.success.apply(this, arguments);
				}
				form.remove();
			}
		}

		s = jQuery.extend(true, {}, options, nesseserySettings);

		var id = 'ajaxupload' + new Date().getTime();
		var form = $('<form action="' + s.url + '" method="post" enctype="multipart/form-data" target="' + id + '" />').appendTo('body');
		form.css({
			position: 'relative',
			top: -1000,
			left: -1000,
			opacity: 0
		});
		form.submit(function () { //alert($(':file', this).val()); 
		});
				
		var d = $('<input type="file" accept="' + options.accept + '" multiple name="' + $.ajaxUploadSettings.name + '" />').appendTo(form);
		d.change(function() {			
			if (!this.files.length) {
				return false;
			}
			s.files = this.files;
			s.data = $.ajaxUploadExtractData(s.data, $.ajaxUploadSerializeFiles(this));

			$.ajaxUpload(s);
		});
		d.click();
		if (navigator.userAgent.indexOf('Safari') > 0 && navigator.vendor.indexOf('Apple') !== -1) { // || $.browser.msie) {
			d.change();
		}
	}
	
	// bind a click event
	$.fn.ajaxUploadPrompt = function( settings ) {
	
		if (this.data('processed')) return;
		this.data('processed', '1');
		
		var origSettings = {
			offset: {
				top: 0,
				left: 0
			},
			accept: '',
			multiple: true,
			data: {}
		};
		
		$.extend(origSettings, settings);
		
		this.each(function() {
			if (needOverlay) {
				var $this = $(this);
				var id = 'ajaxupload' + new Date().getTime() + Math.round(Math.random() * 100000);
				var form = $('<form action="' + origSettings.url + '" method="post" enctype="multipart/form-data" target="' + id + '" />').insertAfter($this);
				var d = $('<input type="file" multiple name="' + $.ajaxUploadSettings.name + '" style="border:1px solid red; position: absolute; z-index:2; top: 0; right: 0; cursor: pointer;" />').appendTo(form);
				d.css({
					opacity: 0,
					width: $this.outerWidth(),
					height: $this.outerHeight(),
					top: $this.position().top + (origSettings.offset.top || 0),
					left: $this.position().left  + (origSettings.offset.left || 0)
				});

				d.change(function() {
					origSettings.files = this.files || {};
					var iframeSrc = /^https/i.test(window.location.href || '') ? 'javascript:false' : 'about:blank';
					var iframe = $('<iframe src="' + iframeSrc + '" id="' + id + '" name="' + id + '" style="display: none;" />').appendTo('body');
					iframe.bind('load', function() {
						if (!iframe[0].parentNode){
							return;
						}

						var doc = iframe[0].contentDocument ? iframe[0].contentDocument: iframe[0].contentWindow.document
						var data = doc.body.innerHTML;
						if (origSettings.success) {
							origSettings.success.call(origSettings, data);
						}
						iframe.unbind('load');
						setTimeout(function () { iframe.remove(); }, 100);
					});
					form.submit(function() {
						origSettings.beforeSend.call(origSettings, {});
						origSettings.onprogress.call(origSettings, {});
					});
					form.submit();

					/* var options = jQuery.extend(true, {}, origSettings);
					options.data = $.ajaxUploadExtractData(this.files, options.data);
					$.ajaxUpload(options); */
				});
			} else {
				$(this).click(function () {
					$.ajaxUploadPrompt( origSettings );
				});
			}
		});
			
		return this;
	}

	// bind a drop event
	$.fn.ajaxUploadDrop = function( origSettings ) {
		if ( !$.support.ajax2 ) return false;
		var fakeSafariDragDrop = navigator.userAgent.indexOf('Safari') > 0 && navigator.vendor.indexOf('Apple') !== -1;
		this.each(function() {
			var $this = $(this);
			$this.one("dragenter",function(e) {
				if (fakeSafariDragDrop) {
					var d = $('<input type="file" multiple name="uploads[]" />').appendTo($this);
					d.css({
						position : 'absolute',
						display : 'block',
						top : $this.position().top,
						left : $this.position().left,
						width : $this.outerWidth(),
						height : $this.outerHeight(),
						opacity : 0
					});
					d.change(function() {
						var options = jQuery.extend(true, {}, origSettings);
						options.data = $.ajaxUploadExtractData(this.files, options.data);
						$.ajaxUpload(options);
					});
				} else {
					e.stopPropagation(); e.preventDefault();
				}
			}).bind("dragover",function(e) {
				if (fakeSafariDragDrop) {

				} else {
					e.stopPropagation(); e.preventDefault();
				}
			}).bind("drop",function(e) {
				if (fakeSafariDragDrop) {

				} else {
					e.stopPropagation(); e.preventDefault();
					var dt = e.originalEvent.dataTransfer;  
					var files = dt.files;							
					var options = jQuery.extend(true, {}, origSettings);
					options.data = $.ajaxUploadExtractData(files, options.data);
					options.files = files;	
					$.ajaxUpload(options);
				}
			});
		});
		return this;
	}
})(jQuery);