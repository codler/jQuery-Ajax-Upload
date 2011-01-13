# Ajax Upload

Browser need to support FormData

* Chrome
* Firefox 4
* Safari 5

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
	
	// Same parameters as $.post();
	$.ajaxUploadPost(url, [ data ], [ success(data, textStatus, XMLHttpRequest) ], [ dataType ]);
	
	// Same as $.ajaxUploadPost, with a difference, it will create a prompt and then send
	$.ajaxUploadPrompt(url, [ data ], [ success(data, textStatus, XMLHttpRequest) ], [ dataType ]);
	
	// Same as above, with a difference, it binds a click event.
	$(button).ajaxUploadPrompt(url, [ data ], [ success(data, textStatus, XMLHttpRequest) ], [ dataType ]);
	
	// Make a dropzone for uploading files
	$(element).ajaxUploadDrop(options);

## Feedback

I appreciate all feedback, thanks!