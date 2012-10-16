// camera
var pictureSource;   // picture source
var destinationType; // sets the format of returned value 
var avatarAreaId;


// Called when a photo is successfully retrieved
//
function onPhotoDataSuccess(imageData) {
  // Uncomment to view the base64 encoded image data
  //console.log(imageData);

  // Get image handle
  //
  var smallImage = $('#'+avatarAreaId+' #pt-avatar')[0];//document.getElementById('pt-avatar');

  // Unhide image elements
  //
  smallImage.style.display = 'block';

  // Show the captured photo
  // The inline CSS rules are used to resize the image
  //
  smallImage.width = 110;
  smallImage.height = 110;
  smallImage.src = "data:image/jpeg;base64," + imageData;
  
  $.mobile.loading ('show', {text: 'During save picture...', textVisible: true, theme: 'a', html: ""});
	$.ajax({
		type : "POST",
		url : __config['medico_url'] + __config['image'],		
		data : {
				method: 'image_set',
				patientId: currentPatientId,
				queueId: currentQueueId,
				data : {image:imageData},
				empId:employeeDS.EMP_ID,						
				sessionId: sessionId},
		success : saveImagePatientSuccess,
		error : saveImagePatientFail,
		dataType : "json"
	});
}

function saveImagePatientSuccess (data) {
	$.mobile.loading ('hide');
	if (data.error_code=='0') {
		updateInfoPatient(data.queueId);
	} else {
		alert ('Save not complete.');
	}
}

function saveImagePatientFail (data) {
	$.mobile.loading ('hide');
	alert ('Send fail.');
}


// Called when a photo is successfully retrieved
//
function onPhotoURISuccess(imageURI) {
  // Uncomment to view the image file URI 
  // console.log(imageURI);

  // Get image handle
  //
  var largeImage =  $('#'+avatarAreaId+' #pt-avatar')[0];

  // Unhide image elements
  //
  largeImage.style.display = 'block';

  // Show the captured photo
  // The inline CSS rules are used to resize the image
  //
  largeImage.src = imageURI;
}

// A button will call this function
//
function capturePhoto() {
  // Take picture using device camera and retrieve image as base64-encoded string
  navigator.camera.getPicture(onPhotoDataSuccess, onFail, { 
  		quality: 80,
  		targetWidth: 110,
  		targetHeight: 110,
    	destinationType: destinationType.DATA_URL });
}

// A button will call this function
//
function capturePhotoEdit() {
  // Take picture using device camera, allow edit, and retrieve image as base64-encoded string  
  navigator.camera.getPicture(onPhotoDataSuccess, onFail, { quality: 20, allowEdit: true,
    destinationType: destinationType.DATA_URL });
}

// A button will call this function
//
function getPhoto(source) {
  // Retrieve image file location from specified source
  navigator.camera.getPicture(onPhotoURISuccess, onFail, { quality: 50, 
    destinationType: destinationType.FILE_URI,
    sourceType: source });
}

// Called if something bad happens.
// 
function onFail(message) {
  alert('Failed because: ' + message);
}


///////////////////////////////////////////////////////////////////////////////
// Flash Camera Capture
/////

function do_upload() {
	document.getElementById('upload_results').innerHTML = '<h1>Uploading...</h1>';
	webcam.upload();
}

function webcam_complete_handler(msg) {
	
	$('#camera-flash-popup').popup ('close');
	// extract URL out of PHP output
	if (msg == 'OK') {
		//location.reload ();	
		//alert (currentStationId);			
		//changeDepartment(currentStationId);
		reloadPatientSummaryDetail () ;
		
	} else {
		alert ('Capture Fail.')
	}
	/*
	if (msg.match(/(http\:\/\/\S+)/)) {
		var image_url = RegExp.$1;
		// show JPEG image in page
		document.getElementById('upload_results').innerHTML = '<h1>Upload Successful!</h1>' + '<h3>JPEG URL: ' + image_url + '</h3>' + '<img src="' + image_url + '">';
		webcam.reset();
	}
	else alert("PHP Error: " + msg);
	*/
}
