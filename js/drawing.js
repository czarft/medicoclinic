
///////////////////////////////////
// Drawing
//////////////////////////////////

//DRAWING 
var sketcher = null;
var brush = null;

function openImagePopup () {
	$('#image-popup').popup ('open',{		
		theme: 'c',
		overlayTheme: 'a',		
		shadow: true,
		corners: true,							
		transition: "slideup",	
		tolerance: "1,1,1,1"						
		
	});
}

function openDrawingTool () {
	if (openDrawing) {				
		$('#drawing-page').popup ('open', {	x:0,
			y:0,
			theme: 'c',
			overlayTheme: 'a',
			shadow: true,
			corners: true,
			positionTo: 'window',
			transition: "slideup",							
			tolerance: "1,1,1,1"
		});
		openDrawing = false;
		sketcher.clear();		
	}
}

function initDrawing () {
	
	brush = new Image();
	brush.onload = function() {
			sketcher = new Sketcher("sketch", brush);		
	}
	setupcanvas ('brush2.png');
	
	$("#drawing-page #drawing-cancel").click (function(e){
		e.preventDefault();		
		e.stopPropagation ();					
		$('#drawing-page').popup ('close');
	});
	
	$("#drawing-page #drawing-save").click (function (e) {
		e.preventDefault();		
		e.stopPropagation ();		
		$("#drawing-image-data").val(sketcher.toDataURL());
		saveDrawing ();
	});
	
	$("#image-popup #image-delete-icon").click (function(e){
		e.preventDefault();		
		e.stopPropagation ();					
		deleteDrawing();
	});
	
	$("#image-popup #image-close-icon").click (function(e){
		e.preventDefault();		
		e.stopPropagation ();					
		$('#image-popup').popup ('close');
	});
}

function deleteDrawing () {
	var updateId = $("#image-popup input[name='updateId']").val();
	var type = $("#image-popup input[name='type']").val();
	$.ajax({
		type : "POST",
		url : __config['medico_url'] + __config['image'],		
		data : {
				method: 'drawing_delete',
				data: {patientImageId: updateId, type: type},								
				empId:employeeDS.EMP_ID,	
				type: type,
				patientId: currentPatientId,
				accountId: accountDS.ACCOUNT_ID,
				sessionId: sessionId},
		success : deleteDrawingSuccess,
		error : deleteDrawingFail,
		dataType : "json",
	});
}


function deleteDrawingSuccess (data) {
	$.mobile.loading ('hide');
	if (data.error_code=='0') {
		drawingRefreshType (data.type);
		$('#drawing-page').popup ('close');
	} else {
		alert("Delete not success.");
	}
}

function deleteDrawingFail (data,resultcode) {
	$.mobile.loading ('hide');
	alert ('Connection Fail. ');
}

function saveDrawing () {
	var drawData = $("#drawing-form #drawing-image-data").val();
	var type = $("#drawing-form #drawing-image-type").val();
	
	$.mobile.loading ('show', {text: 'Save Drawing...',textVisible: true,theme: 'a',html: ""});
	$.ajax({
		type : "POST",
		url : __config['medico_url'] + __config['image'],		
		data : {
				method: 'drawing_set',
				data: {image: drawData, type: type},								
				empId:employeeDS.EMP_ID,	
				type: type,			
				visitId: visitinfoDS[0].visitId,
				patientId: currentPatientId,
				accountId: accountDS.ACCOUNT_ID,
				sessionId: sessionId},
		success : saveDrawingSuccess,
		error : saveDrawingFail,
		dataType : "json",
	});
}

function saveDrawingSuccess (data) {
	$.mobile.loading ('hide');
	if (data.error_code=='0') {
		drawingRefreshType (data.type);		
		$('#drawing-page').popup ('close');
	} else {
		alert("Save not success.");
	}
}

function saveDrawingFail (data,resultcode) {
	$.mobile.loading ('hide');
	alert ('Connection Fail. ');
}


function setupcanvas (filename) {				
	brush.src = 'brush/'+filename;
}

function drawingRefreshType (type) {
	if (type==PatientHistoryPage.getPageId()) {
		PatientHistoryPage.getPatientHxItems();
	} else if (type==PresentIllnessPage.getPageId()) {
		PresentIllnessPage.getPresentIllnessItems();
	}  else if (type==PhysicalExamPage.getPageId()) {
		PhysicalExamPage.getPhysicalExamItems();
	}  else if (type==DrNotePage.getPageId()) {
		DrNotePage.getDrnoteItems();
	}
}