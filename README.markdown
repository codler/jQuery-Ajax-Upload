# Ajax Upload

Browser need to support FormData

* Chrome
* Firefox 4+
* Safari 5+
* IE10+

Fallback support (currently only on "$(button).ajaxUploadPrompt(options)")
Will only send the file.

* IE 7-8
* Firefox 3.6
* Opera 11

## Features

* Drag and drop files
* Prompt

## How to use

	// You can use same options as $.ajax();
	// options.data can be a string or jQuery object that selects a input:file
	// or an array containing key pair or name/value [{name, value}]
	// or an object
	// The value should be a File object if it is the file you want to upload
	$.ajaxUpload(options);
	
	// Same as above, with a difference, it takes all values in the form.
	$(form).ajaxUpload(options);
	
	// Same as $.ajaxUpload, with a difference, it will create a prompt and then send
	$.ajaxUploadPrompt(options);
	
	// Same as above, with a difference, it binds a click event.
	$(button).ajaxUploadPrompt(options);
	
	// Make a dropzone for uploading files
	$(element).ajaxUploadDrop(options);
	
	// Same parameters as $.post();
	$.ajaxUploadPost(url, [ data ], [ success(data, textStatus, XMLHttpRequest) ], [ dataType ]);

## Feedback

I appreciate all feedback, thanks!
