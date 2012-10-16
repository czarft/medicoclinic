/******************************************************************************
 * Copyright (c) 2005 By MedicoSoft Co.,Ltd.
 * All rights reserved.
 * Project : Medico mobile
 * 
 * $URL: $
 * $Rev: $
 * $Author: $
 * $Date:$
 * $Id: $
 ******************************************************************************/

///////////////////////////////////////////////////////////////////////////////
// SUMMARY PAGE 
/////////////////
var queuePatientHTMLElement;
var queuePatientNotfoundElement;
var scrollContent,scrollQueue, scrollSearchQueue;
var pullUpEl, pullUpOffset, generatedCount = 0;
var lastSearchTxt = "";

// DATA SOURCE
var employeeDS;
var accountDS;
var departmentDS; 		// array store department 
var queueDS; 			// array store queue
var preferDepartmentDS;	// prefer_department 
var patientinfoDS;  	// pateint information store
var visitinfoDS;		// visit informantion store
var addressinfoDS;		// patient addressinfo 

//OBJECT 
var queueElementPrototype; 			// queue element for clone
var infoSlideWrapperObj;			

//CURRENT ID USE
var currentQueueId;
var currentVisitId;
var currentPatientId;
var currentStationId;
var currentSelectQueuePatientId;	// search case
var currentInvoiceStatusId;


function setupSummaryPage () {
	if (!RunningMode.phonegapActive()) {
		$('#content').removeClass('no-expand');
		$('#toools-panel nav ul.toolbar-set li:last-child').hide ();		
	} else {
		$('#toools-panel nav ul.print-set').hide ();
		$('#toools-panel nav ul.cash-area').hide ();
	}
	
	
	$('#royalSlider').hide();
	$('#slide-nav').hide();
	$('#summary-content-inner').hide();
	$('input[type=text]').css('color','#000');
	$('#history-rx-loading>*').hide();   
   	$("#summary-container .toggle-list").bind ("vclick",function (e) {
   		
   		if (!$(this).hasClass('target')) {
   			$(this).addClass('target');
   			if (RunningMode.phonegapActive()) {
   				scrollRxHistory.refresh();
   			}
   		} else {
   			$(this).removeClass('target');
   		}
   });
   
   $("#summary-container .entry, #content header").bind ("vclick",function (e) {   		
   		$("#summary-container .toggle-list").removeClass('target');
   });
   
   $('#bttReceive').click (function () {
   		if (currentInvoiceStatusId==1) {	
   			$('#popupCashier').popup ('open',{theme: 'a',overlayTheme: 'a',shadow: true,corners: true,transition: "fade"});  
   			$('#receive-payment-input').val('');
   			$('#return-payment-input').val('');
   			$('#receive-payment-input').focus();
   		} else {
   			alert ('รับชำระเรียบร้อยแล้ว.')
   		}
   });
   
   $('#receive-payment-input').bind ('keyup',function() {
   		calPayment ();
   });
   
   $('#receive-payment-input').keypress(function(e) {
   		
        if(e.which == 13) {
        	$(this).blur();
            receiveCash();
        }
   });
   
   $('#receive-cash').click (function (e) {
   		e.preventDefault();	
   		e.stopPropagation ();
   		receiveCash();
   });
   
   setTimeout ("refreshQueue()",reloadQueueInterval);

   $('#banner > div').cycle({ 
	    fx:      'scrollUp', 
	    speed:    500, 
	    timeout:  3000 
	});
	 
	if (RunningMode.phonegapActive()) {
		$('#patient-summary > header .avatar').click (function (){	
			avatarAreaId = 'patient-summary';
			capturePhoto();		
		});
	} else {
		$('#patient-summary > header .avatar').click (function (){	
			// window verison 
			$('#camera-flash-popup').popup ('open',{y:20,shadow: true,corners: false,transition: "fade"});
			$.get('flash-camera.html', function(data) {
				  $('#frmWebCam').append(data);
				  //alert('Load was performed.');
			});
		});
		
		$("#camera-flash-popup #snapCameraPopup").click (function (e){
			e.preventDefault();		
			e.stopPropagation ();	
			webcam.snap();
		});
		
		$("#camera-flash-popup #cancelCameraPopup").click (function(e){
			e.preventDefault();		
			e.stopPropagation ();					
			$('#camera-flash-popup').popup ('close');
			
		});
		$('#camera-flash-popup').bind({
		   popupafterclose: function(event, ui) { 
		   		$('#frmWebCam').empty();
		   },
		   popupafteropen: function (event, ui) {
		   		webcam.set_swf_url('js/cam/webcam.swf');							
				webcam.set_quality( 90 ); // JPEG quality (1 - 100)		
				webcam.set_hook( 'onComplete', 'webcam_complete_handler' );
		   		webcam.set_api_url( __config['medico_url'] + __config['camera-flash']+'?sessionId='+sessionId+'&patientId='+currentPatientId );
		   		webcam.set_shutter_sound (true, 'js/cam/shutter.mp3');
		   		//window.open('js/cam/shutter.mp3');
		   }
		});
			
	}
	
	
	infoSlideWrapperObj = new iScroll('infoSlideWrapper', {
		snap: true,
		momentum: false,
		hScrollbar: false,
		onScrollEnd: function () {
			document.querySelector('#indicator > li.active').className = '';
			document.querySelector('#indicator > li:nth-child(' + (this.currPageX+1) + ')').className = 'active';
		}
	 });
	
	
	$('#popupRegistQueue_regist').click (function (e) {					
		e.preventDefault();	
		if (currentSelectQueuePatientId > 0) {
			$.mobile.loading ('show', {text: 'Start service...',textVisible: true,theme: 'a',html: ""});	
			$.ajax({
				type : "POST",
				url : __config['medico_url'] + __config['medico_summary'],		
				data : {
						method: 'visit_set',
						data: {},				
						empId:employeeDS.EMP_ID,		
						visitId: 0,		
						stationId: currentStationId,
						patientId: currentSelectQueuePatientId,
						accountId: accountDS.ACCOUNT_ID,
						sessionId: sessionId},
				success : setVisitiDataSuccess,
				error : setVisitDataFail,
				dataType : "json"
			});
		}
	});
	
	$("#toools-panel .send  input:submit").bind('vclick', function(e) {
		e.preventDefault();							   
		sendQueueFast ();
	});
	
	//scroll content summary
	if (RunningMode.phonegapActive()) {
		scrollRxHistory = new iScroll('scroll-rx-summary', {
						momentum: true,
						hScrollbar: false,
						vScrollbar: false
					 });
		
		scrollSearchQueue  = new iScroll('result-search', {
							momentum: true,
							hScrollbar: false,
							vScrollbar: true
						 });
		
		scrollContent = new iScroll($('#summary-container .entry')[0], {
								momentum: true,
								hScrollbar: true,
								vScrollbar: false
							 });
	}		
	
	setupEachSectionService();
	
	console.log(accountId);
	console.log (__config['medico_url'] + __config['medico_summary']);
	
	queueElementPrototype = $('#result-queue div article').first ().clone();
	 $('#result-queue div article').remove();
	queuePatientNotfoundElement = $('#result-queue #notfound').first ().clone();
	$('#result-queue #notfound').remove ();
		
	if (RunningMode.phonegapActive()) {
		setupScrollRefresh();
	}
	startUpData ();
	setupClicksound ('service-tools') ;	
	initDrawing();	
	
	
}


function setVisitiDataSuccess (data) {
	$.mobile.loading ('hide');
	if (data.error_code=='0') {		
		changeDepartment (currentStationId);		
		$('#popupRegistQueue').popup ("close");	
	} else {
		alert ('Can not complete service start.');
		$('#popupRegistQueue').popup ("close");			
	}
	$('#searchPatientField').val ("");	
	$('#result-search').hide();
		
}

function setVisitDataFail (data) {
	$.mobile.loading ('hide');
	alert ('Can not complete service start.');
	$('#popupRegistQueue').popup ("close");	
	$('#searchPatientField').val ("");	
	$('#result-search').hide();
	
}

function sendQueueFast () {
	$.mobile.loading ('show', {text: 'Sending...', textVisible: true, theme: 'a', html: ""});
	$.ajax({
		type : "POST",
		url : __config['medico_url'] + __config['medico_summary'],		
		data : {
				method: 'queue_fast_send',
				queueId: currentQueueId,
				stationId: currentStationId,
				sessionId: sessionId},
		success : sendQueueFastSuccess,
		error : sendQueueFastFail,
		dataType : "json"
	});
}

function sendQueueFastSuccess (data) {
	$.mobile.loading ('hide');
	if (data.error_code=='0') {
		changeDepartment (currentStationId);	
	} else {
		alert ('Send not complete.');
	}
}

function sendQueueFastFail (data) {
	$.mobile.loading ('hide');
	alert ('Send fail.');
}

function startUpData () {
	$.mobile.loading ('show', {text: 'Summary Loading...',textVisible: true,theme: 'a',html: ""});
	$.ajax({
		type : "POST",
		url : __config['medico_url'] + __config['medico_summary'],		
		data : {
				method: 'startup_data',
				accountId:accountId,
				sessionId: sessionId},
		success : startUpDataResult,
		error : startUpDataFail,
		dataType : "json"
	});
	
	//dbo.getSetting();
}

function startUpDataResult ( data ) {	
	$.mobile.loading ('hide');
	if (data.error_code=='0') {		
		departmentDS = data.department;
		preferDepartmentDS = data.prefer_department;
		if ( typeof preferDepartmentDS.stationId !="undefined" 
			&& preferDepartmentDS.stationId!="") 
		{
			$('#queue-panel .header h1').text (preferDepartmentDS.stationName);
			currentStationId = preferDepartmentDS.stationId;
		} else {
			$.each (departmentDS,function (k,v) {
				currentStationId = k;
				$('#queue-panel .header h1').text (v.name);
				return false;
			});			
		}
		accountDS    = data.account;
		employeeDS   = data.emp;
		if (typeof data.emp.data != 'undefinded' && data.emp.data) {			
			$("#toools-panel #account").find('img').first().attr ('src',__config['image_path']+'/'+data.emp.data.pathFile);
			$("#toools-panel #account").find('h1').first().html(data.emp.data.prefixName+data.emp.data.fname+" "+data.emp.data.lname);
			$("#toools-panel #account").find('h2').first().html(data.emp.data.posName);
		}
		queueDS		 = data.queues;
		//queueRender  (queueDS);
		departmentRender  (departmentDS);
		sendtoRender (data.sendto_department);
		setupClicksound ('summary-content-inner') ;
		setupClicksound ('content .header') ;
		suggestionInit (data.suggestion_word); 
		//$.mobile.initializePage();
		setTimeout ("changeDepartment (currentStationId);",1000);
		
		
	} else {
		console.log ('load summary fail.');
	}
}

function suggestionInit (data) {
	dao.clearSuggestion (function () {
		//notthing
		console.log ('clearSuggestion complete.');
	});
	
	dao.loadSuggestion (data, function () {
		//alert ('load complete');
		dao.findSuggestionType (PatientHistoryPage.getHelpTypeId(),function (data) {//HX.
			PatientHistoryPage.setupSuggestion (data);
		});
		dao.findSuggestionType (PresentIllnessPage.getHelpTypeId(),function (data) {//Present iLLness (sign and symptom)
			PresentIllnessPage.setupSuggestion(data);
		});
		dao.findSuggestionType (PhysicalExamPage.getHelpTypeId(),function (data) {//Physical Examination (check up)
			PhysicalExamPage.setupSuggestion(data);
		});
		dao.findSuggestionType (DrNotePage.getHelpTypeId(),function (data) {//Drnote
			DrNotePage.setupSuggestion(data);
		});
		
	})
}

function startUpDataFail (data) {
	$.mobile.loading ('hide');
	alert ('Can not connect to server.');
}

function departmentRender  (data) {
	if (typeof data =='undefined') return;
	var depID,depName;
	var objEl;  // department
	var objLI;  // station
	
	$("#department-collapsible").removeAttr('data-enhance');
	var index=0;
	$.each ( data , function (k,v) {
		
		depID = k;
		depName = v.name;
		
		
		objEl = $("#department-collapsible>div").first().clone();
		//alert ($(objEl).find ('h3').first().length);
		$(objEl).removeAttr('data-enhance');
		if (index==0){
			$(objEl).attr('data-collapsed','false');
		}
		$(objEl).find ('h3').first().text(depName);
		//alert ($(objEl).find ('h3').first().text());
	
		 
		$(objEl).find ('ul').removeAttr('data-enhance');
		$(objEl).find ('ul>li').first().hide();
		$.each ( v.station , function (index, objStation) {
			objLI = $(objEl).find ('ul>li').first().clone();
			$(objLI).find('a').first().text (objStation.name);
			$(objLI).find('a').bind('vclick',function (e) {
				changeDepartment(objStation.stationId, objStation.name);	
			})
			$(objLI).show();
			$(objEl).find ('ul').append (objLI);
		});	
		$(objEl).find ('ul>li').first().remove();
		
		$("#department-collapsible").append (objEl);
		index++;

	});
	$("#department-collapsible>div").first().remove();
	$("#popupDepartment").trigger( "create" );
	
}

function refreshQueue () {
	changeDepartment (currentStationId,'',true);
	console.log ("refreshQueue ..");
	setTimeout ("refreshQueue()",reloadQueueInterval);
}

function changeDepartment (stationId, stationName, autoFlag) {
	
	if (typeof autoFlag == 'undefined') {
		autoFlag = false;
	}
	if (typeof stationName != 'undefined' && stationName!='') {
		$('#queue-panel .header h1').text (stationName);
	}
	currentStationId = stationId;
	if (autoFlag==false) {
 		clearPatient();
 		$.mobile.loading ('show', {text: 'Reload queue data...',textVisible: true,theme: 'a',html: ""});
 	}
	$.ajax({
		type : "POST",
		url : __config['medico_url'] + __config['medico_summary'],		
		data : {
				method: 'queue_data',
				data: {auto:autoFlag},
				accountId:accountId,
				stationId:stationId,
				sessionId: sessionId},
		success : queueDataResult,
		error : startUpDataFail,
		dataType : "json",
	});
}

function sendtoRender  (data) {
	if (typeof data =='undefined' || data==null) return;
	var depID,depName;
	var objEl;  // department
	var objLI;  // station
	
	
	var index=0;
	$("#sendto-collapsible").removeAttr('data-enhance');
	//Last send
	
	
	if (lastsendToDS.length > 0) {
		objEl = $("#sendto-collapsible>div").first().clone();
		$(objEl).removeAttr('data-enhance');
		$(objEl).attr('data-collapsed','false');	
		$(objEl).find ('h3').first().text("Last");
		
		$(objEl).find ('ul>li').first().hide();
		
		$.each ( data , function (index, objStation) {
			objLI = $(objEl).find ('ul>li').first().clone();
			$(objLI).find('a').first().text (objStation.name);
			$(objLI).find('a').bind('vclick',function (e) {
				sendToDepartment(objStation.stationId, objStation.name);	
			})
			$(objLI).show();
			$(objEl).find ('ul').append (objLI);
		});	
		$(objEl).find ('ul>li').first().remove();	
		$("#sendto-collapsible").append (objEl);
	}
	
	//Send to Dept.		
	objEl = $("#sendto-collapsible>div").first().clone();
	$(objEl).removeAttr('data-enhance');
	if (lastsendToDS.length==0) {
		$(objEl).attr('data-collapsed','false');
	}
	$(objEl).find ('ul').removeAttr('data-enhance');
	$(objEl).find ('ul>li').first().hide();
	
	if (data.length>0) {  
		$.each ( data , function (index, objStation) {
			objLI = $(objEl).find ('ul>li').first().clone();
			$(objLI).find('a').first().text (objStation.name);
			$(objLI).find('a').bind('vclick',function (e) {
				sendToDepartment(objStation.stationId, objStation.name);	
			})
			$(objLI).show();
			$(objEl).find ('ul').append (objLI);
		});	
		$(objEl).find ('ul>li').first().remove();	
		$("#sendto-collapsible").append (objEl);	
		
	}
	$("#sendto-collapsible>div").first().remove();
	$("#popupSendTo").trigger( "create" );
	
	
}

function sendToDepartment (stationId, name) {
	$.mobile.loading ('show', {text: 'Sending...', textVisible: true, theme: 'a', html: ""});
	$.ajax({
		type : "POST",
		url : __config['medico_url'] + __config['sendto'],		
		data : {
				method: 'sendto_set',
				queueId: currentQueueId,
				toStationId: stationId  ,
				stationId: currentStationId,
				empId:employeeDS.EMP_ID,						
				sessionId: sessionId},
		success : sendQueueFastSuccess,
		error : sendQueueFastFail,
		dataType : "json"
	});
}

function sendToDepartmentSuccess (data) {
	$.mobile.loading ('hide');
	closeToolBarPanel ();
	if (data.error_code=='0') {
		changeDepartment (currentStationId);	
	} else {
		alert ('Send not complete.');
	}
}

function sendToDepartmentFail (data) {
	$.mobile.loading ('hide');
	alert ('Send fail.');
}

function queueDataResult (data) {
	//
	if (RunningMode.phonegapActive() && data.auto==false) {
		scrollQueue.scrollTo(0, 0, 200);
	}
	
	if (data.error_code=='0') {
		queueDS		 = data.queues;
		queueRender  (queueDS, data.auto);
	} else {
		console.log ('queue load fail.');
	}
}

function updateInfoPatient (queueId) {
	$('#result-queue div article').each (function (index) {
		//alert (queueId+" -  "+$(this).find ('.queue-id-hidden').first().val () );
		if (queueId == $(this).find ('.queue-id-hidden').first().val ()) {
		 	var smallImage = $('#patient-summary #pt-avatar')[0];
		 	
		 	$(this).find('img').attr ('src',smallImage.src);
		}
	});
}

function queueRender (data, auto) {
	if (typeof data =='undefined'  || data==null) return;
	var index=0;
	var objEl;  // department
	var sexName;
	var name;
	$('#result-queue div article').remove ();
	//console.log ("amt article "+$('#result-queue div article').length);
	//console.log ("amt #result-queue div' "+$('#result-queue div').length);
	if (data.length==0) {
		clearPatient();
	}
	$.each ( data , function (no,pInfo) {
		objEl = $(queueElementPrototype).clone();
		if (pInfo.photo!='') {
			$(objEl).find('img').attr ('src',__config['image_path']+'/'+pInfo.photo);
		} else if  (pInfo.sex=="1") {
			sexName = "ชาย"
			$(objEl).find('img').attr ('src','images/icons/male-icon-mn.png');
		} else {
			sexName = "หญิง"
			$(objEl).find('img').attr ('src','images/icons/female-icon-mn.png');
		}
		//tmp.removeClass();				
		
		$(objEl).bind ('vclick',function (e) {
			clearToolbar(); 
			addQHandlerer (this, pInfo.queueId, pInfo.patientId, pInfo.visitId); 
			$.ajax({
				type : "POST",
				url : __config['medico_url'] + __config['queue'],		
				data : {
						method: 'select_queue',
						empId:employeeDS.EMP_ID,
						queueId: currentQueueId,
						accountId:accountId,						
						sessionId: sessionId},
				success : function (data) {
					if (data.comment=='') {
						console.log ("select_queue complete");
					} else {
						//alert (data.comment);
					}
 				},
				error : function (data) {
					
				},
				dataType : "json",
			});
		});
		if (currentQueueId==pInfo.queueId) {			
			$(objEl).find ('a').first().addClass('active');
		}
		$(objEl).find('.queue-id-hidden').first().val (pInfo.queueId);
		$(objEl).find('h1').first().text (pInfo.fullname_shot);
		$(objEl).find('p').first().text ("HN: "+pInfo.hn);
		
		$(objEl).find('.queue-sex').first ().text (sexName);
		$(objEl).find('.queue-age').first ().html ("&nbsp;&nbsp;"+pInfo.age_year);			
		//$('#result-queue div').first().prepend (objEl);
		$(objEl).insertBefore ($('#result-queue div #pullUp'));
	});
	
	
	if (RunningMode.phonegapActive()) {	
		scrollQueue.refresh();			
	}
	
	if (auto==false) {
		setTimeout("selectFirstQueue () ",250);
		$.mobile.loading ('hide');
		$('#popupDepartment').popup("close");
	} 
	setupClicksound ('queue-panel') ;
}

function setupEachSectionService () 
{	
	console.log ("setupEachSectionService [start]");
	if (RunningMode.phonegapActive()) {
		$('#logo').bind ('vclick', function (e){
			e.preventDefault();			 			 			
			e.stopPropagation ();	
			 
			if ($('#content').hasClass('with-toolbar')) {
				if ($('#content').hasClass('no-expand')) {				
					$('#content').removeClass('no-expand');				
					$('#content').removeClass('with-toolbar');
					$('#content').addClass('expand');
					$('#content').addClass('expand-without-toolbar');
				} else {
					
				}
			} else if ( $('#content').hasClass('no-expand') )  {
				$('#content').removeClass('no-expand');
				$('#content').addClass('expand');
				
			} else if ( $('#content').hasClass('expand') )  {
				
				$('#content').removeClass('expand');
				$('#content').addClass('no-expand');
				
			} else if ($('#content').hasClass('expand-without-toolbar')) {
											
				$('#content').removeClass('expand-without-toolbar');											
				$('#content').addClass('expand-with-toolbar');	
							
			} else if ($('#content').hasClass('expand-without-toolbar')) {
				$('#content').removeClass('expand-without-toolbar');	
				$('#content').addClass('expand-with-toolbar');
			}	
		});
	}
	
	$('.queue-icn').bind('vclick',function (e)  {	
		e.preventDefault();			 			 			
		e.stopPropagation ();		
		if ($('#content').hasClass('with-toolbar')) {
			closeToolBarPanel ();	
		} else {
			if ($('#content').hasClass('no-expand')) {				
				$('#content').removeClass('no-expand');
				$('#content').addClass('expand');
			} else {
				$('#content').removeClass('expand');
				$('#content').addClass('no-expand');
			}
		}
		
	});
	
	$('.option-icn').bind('vclick',function (e)  {
		e.preventDefault();			 			 			
		e.stopPropagation ();	
		if ($('#content').hasClass('no-expand')) 
		{
			if ($('#content').hasClass('with-toolbar')) {
				closeToolBarPanel ();							
			} else {
				openToolBarPanel ();
			}
		} 
		else if ($('#content').hasClass('expand') && $('#content').hasClass('expand-with-toolbar')) {
			$('#content').removeClass('expand-with-toolbar');
			$('#content').removeClass('expand');
			$('#content').addClass('no-expand');
			$('#content').addClass('without-toolbar');

		}
		else if ($('#content').hasClass('expand')) 
		{
			if ($('#content').hasClass('expand-with-toolbar')) {
				$('#content').removeClass('expand-with-toolbar');
				$('#content').addClass('expand-without-toolbar');
			} else {	
				$('#content').removeClass('expand-without-toolbar');			
				$('#content').addClass('expand-with-toolbar');
			}
		} 
	});
	
	$('#bttSendTo').bind ('vclick',function (e){
		e.preventDefault();			 			 			
		e.stopPropagation ();	
		$('#popupSendTo').popup("open");
	});
	
	$('#searchPatientField').focus (function () {
		$('#result-search').show();
	});
	
	
	$('#searchPatientField').blur (function () {
		if ($('#result-search div article').length == 0 && $('#result-search div#notfound').length == 0) {
			$('#result-search').hide();
		}
	});
	
	$('#icon-clear-search-patients').bind('vclick',function (e)  {
	    $('#searchPatientField').val('');
	    $('#result-search div article').remove ();
	    $(this).delay(700).fadeOut(300);
	    $('#result-search').hide();
	    $('#result-queue').focus();
	 });
	 
	$('#icon-clear-search-tools').bind('vclick',function (e) {
		$('#searchToolField').val('');
		$(this).delay(700).fadeOut(300);
	});
	
	$('#searchPatientField').keyup ( function () {
		//$('#result-search div article').clear ()
		if ($(this).val().length > 0) {
	        $('#icon-clear-search-patients').fadeIn(300);
	    }
	    else {
	        $('#icon-clear-search-patients').fadeOut(300);
	    }
		delay(function(){ startSearchPatient ()  }, 500);
		
	});
	
	$('#searchToolField').keyup ( function () {
		//$('#result-search div article').clear ()
		if ($(this).val().length > 0) {
	        $('#icon-clear-search-tools').fadeIn(300);
	    }
	    else {
	        $('#icon-clear-search-tools').fadeOut(300);
	    }
		
	});
	
	$('.list-icn').bind('vclick',function (e) {
		e.preventDefault();			 			 			
		e.stopPropagation ();	
		$('#popupDepartment').popup("open");
	});
	
	//scroll refresh 	  
	
	$('.reload-icn').bind('vclick',function (e)  {
		console.log ('Reload patient.');				
		$('#service-container').hide();
		$("#summary-container").fadeIn (250,function () {
			reloadPatientSummaryDetail () ;
			if ($('#content').hasClass('with-toolbar')) {
				closeToolBarPanel () ;
			} else {
				
			}
		});	
	});
	
	$('#toools-panel header #logout-btt').bind ('vclick', function (e){
		
		e.preventDefault();			 			 			
		e.stopPropagation ();
		$.mobile.loading ('show', {text: 'Summary Reload...',textVisible: true,theme: 'a',html: ""});
		$.ajax({
			type : "POST",
			url : __config['medico_url'] + __config['medico_summary'],		
			data : {
					method: 'logout',					
					accountId:accountId,					
					sessionId: sessionId},
			success : function (data){
				$.mobile.loading ('hide');
				if (data.error_code=='0') {
					if (RunningMode.phonegapActive()) {
						window.location = "ipad.html";
					} else {
						window.location = "index.html";	
					}
					
				} else {
					alert ('Logout not complete.');
				}
			},
			error : function (data) {
				alert ('Logout fail.');
				$.mobile.loading ('hide');
			},
			dataType : "json",
		});
	});

	
	$('.addQueue-icn').bind('vclick',function (e) {	
		e.preventDefault();			 			 			
		e.stopPropagation ();	
		openNewPatientInfo ();
	});	
	  
	
	$('#start-service-now a:first').click (function (e) {
		e.preventDefault();			 			 					
		openToolBarPanel ();
		$('#service-container').show();
	});
	
	$('#files-section a:first').click (function () {
		if (!$(this).hasClass("trigger")) {
			$(this).addClass("trigger");	
			setTimeout (function () {
				$("#summary-container").hide();
				openToolBarPanel ();
				$('#service-container').show();
				var param = {}					
				
				LoadServiceModule ('files.html',param, "FilesPage");	
			},250);
		}
	});
	
	$('#appointment-section a:first').click (function () {
		if (!$(this).hasClass("trigger")) {
			$(this).addClass("trigger");	
			setTimeout (function () {
				$("#summary-container").hide();
				openToolBarPanel ();
				$('#service-container').show();
				var param = {}					
				
				LoadServiceModule ('appointment.html',param, "AppointmentPage");	
			},250);
		}
	});
	
	$('#caution-section a:first').click (function () {
		if (!$(this).hasClass("trigger")) {
			$(this).addClass("trigger");	
			setTimeout (function () {
				$("#summary-container").hide();
				openToolBarPanel ();
				$('#service-container').show();
				var param = {}					
				
				LoadServiceModule ('caution.html',param, "CautionPage");	
			},250);
		}
	});
	
	$('#drug-allergy-section a:first').click (function () {
		if (!$(this).hasClass("trigger")) {
			$(this).addClass("trigger");
			setTimeout (function () {
				$("#summary-container").hide();
				openToolBarPanel ();
				$('#service-container').show();
				var param = {}	
				LoadServiceModule ('drug-allergy.html',param, "DrugAllergyPage");	
			},250);
		}
	});
	
	$('#vitalsign-section a:first').click (function () {
		if (!$(this).hasClass("trigger")) {
			$(this).addClass("trigger");
			setTimeout (function () {
				$("#summary-container").hide();
				openToolBarPanel ();
				$('#service-container').show();
				var param = {};	
				LoadServiceModule ('vitalsign.html',param, "VitalsignPage");
			},250);
		}
	});
	
	$('#patient-history-section a:first').click (function () {
		if (!$(this).hasClass("trigger")) {
			$(this).addClass("trigger");
			setTimeout (function () {
				$("#summary-container").hide();
				openToolBarPanel ();
				$('#service-container').show();
				var param = {};					
				LoadServiceModule ('patient-history.html',param, "PatientHistoryPage");
			},250);
		}
	});
	
	$('#icd10-section a:first').click (function () {
		if (!$(this).hasClass("trigger")) {
			$(this).addClass("trigger");
			setTimeout (function () {
				$("#summary-container").hide();
				openToolBarPanel ();
				$('#service-container').show();
				var param = {};					
				LoadServiceModule ('icd10.html',param, "ICD10Page");
			},250);
		}
	});
	
	$('#drnote-section a:first').click (function () {
		if (!$(this).hasClass("trigger")) {
			$(this).addClass("trigger");
			setTimeout (function () {
				$("#summary-container").hide();
				openToolBarPanel ();
				$('#service-container').show();
				var param = {};					
				LoadServiceModule ('drnote.html',param, "DrNotePage");
			},250);
		}
	});
	
	$('#present-illness-section a:first').click (function () {
		if (!$(this).hasClass("trigger")) {
			$(this).addClass("trigger");
			setTimeout (function () {
				$("#summary-container").hide();
				openToolBarPanel ();
				$('#service-container').show();
				var param = {};					
				LoadServiceModule ('present-illness.html',param, "PresentIllnessPage");
			},250);
		}
	});
	
	$('#physical-exam-section a:first').click (function () {
		if (!$(this).hasClass("trigger")) {
			$(this).addClass("trigger");
			setTimeout (function () {
				$("#summary-container").hide();
				openToolBarPanel ();
				$('#service-container').show();
				var param = {};					
				LoadServiceModule ('physical-exam.html',param, "PhysicalExamPage");
			},250);
		}
	});
	
	$('#medication-section a:first').click (function () {	
		
		if (!$(this).hasClass("trigger")) {	
			$(this).addClass("trigger");
			setTimeout (function () {
				$("#summary-container").hide();
				openToolBarPanel ();
				$('#service-container').show();
				var param = {};					
				LoadServiceModule ('medication.html',param, "MedicationPage");
			},250);
		}
	});
	
	$('#diagnosis-section a:first').click (function () {
		if (!$(this).hasClass("trigger")) {
			$(this).addClass("trigger");
			setTimeout (function () {
				$("#summary-container").hide();
				openToolBarPanel ();
				$('#service-container').show();
				var param = {};					
				LoadServiceModule ('diagnosis.html',param, "DiagnosisPage");
			},250);
		}
	});
	
	$('#procedure-section a:first').click (function () {
		if (!$(this).hasClass("trigger")) {
			$(this).addClass("trigger");
			setTimeout (function () {
				$("#summary-container").hide();
				openToolBarPanel ();
				$('#service-container').show();
				var param = {};					
				LoadServiceModule ('procedure.html',param, "ProcedurePage");
			},250);
		}
	});
	
	$('#service-container').live ("swiperight",function (){
		console.log ("swiperight");
		if (toolbarIsOpen) {
			$('#service-container').hide();
			$("#summary-container").fadeIn (250,function () {
				reloadPatientSummaryDetail () ;			
				closeToolBarPanel();
			});
		}
	});
	
	$('#service-tools nav>ul>li a').each (function (index) {			
		var url = $(this).attr ('href');
		var setupFunc = $(this).attr ('setup');			
		var param = {};
		$(this).click (function (e) {	
			e.preventDefault();			
			e.stopPropagation();
			
			//if (!toolbarIsOpen) {
			if ($("#summary-container").is(":visible") || !toolbarIsOpen) {
				$("#summary-container").hide();
				openToolBarPanel ();
				$('#service-container').show();
				LoadServiceModule (url,param, setupFunc);
			} else {
				LoadServiceModule (url, param, setupFunc);
			}
		});
		
	});
	
}

function openNewPatientInfo (defaultName) {
	LoadServiceModule ('patient-info.html',{}, "PatientInfoPage", "true");
	
	$("#summary-container").hide();
	openToolBarPanel ();
	$('#service-container').show();
	clearPatient();
	var nameElement  =  $('#patient-summary header h1');		
	$(nameElement).text ("Please Tab on image.");
	PatientInfoPage.clearFormQuick ();
	if (typeof defaultName !='undefined') {
		setTimeout("PatientInfoPage.clearFormQuick ();$('#patient-info-page-add').find('input').first().val('"+defaultName+"');$('#patient-info-page-add').find('input').first().focus();",800);
	}
}

function autoLoadQueue () {
	
}
 
// OTHER FUNCTION

function pullUpAction () {	
	changeDepartment (currentStationId,'',true);		
}

function setupScrollRefresh() {
	pullUpEl = document.getElementById('pullUp');	
	pullUpOffset = pullUpEl.offsetHeight;
	
	scrollQueue = new iScroll('result-queue', {
		useTransition: true,
		/*topOffset: pullDownOffset,*/
		onRefresh: function () {

			if (pullUpEl.className.match('loading')) {
				pullUpEl.className = '';				
				pullUpEl.querySelector('.pullUpLabel').innerHTML = 'Pull up to load more...';
			}
		},
		onScrollMove: function () {
			if (this.y < (this.maxScrollY - 5) && !pullUpEl.className.match('flip')) {
				pullUpEl.className = 'flip';
				pullUpEl.querySelector('.pullUpLabel').innerHTML = 'Release to refresh...';
				this.maxScrollY = this.maxScrollY;
			} else if (this.y > (this.maxScrollY + 5) && pullUpEl.className.match('flip')) {
				pullUpEl.className = '';
				pullUpEl.querySelector('.pullUpLabel').innerHTML = 'Pull to load more queue...';
				this.maxScrollY = pullUpOffset;
			}
		},
		onScrollEnd: function () {
			if (pullUpEl.className.match('flip')) {
				pullUpEl.className = 'loading';
				pullUpEl.querySelector('.pullUpLabel').innerHTML = 'Loading More Queue...';				
				pullUpAction();	// Execute custom function (ajax call?)
			}
		}
	});
	
	setTimeout(function () { document.getElementById('result-queue').style.left = '0'; }, 800);
}

function selectFirstQueue () {
	var _el = $('#result-queue div  article');	
	
	if ($(_el).length > 0) {	
		
		$(_el[0]).trigger('click');
	}	
}
	   
function generateQueue () {
   	console.log ('generateQueue');
	var numRand =  randomNum ();
	var num = 0;
	var _el = $('#result-queue div  article');		
	queuePatientHTMLElement = $(_el[0]).clone();	
	_el.remove();
	for (var i=0; i < numRand ; i++) {
		newChild = $(queuePatientHTMLElement).clone();	
		tmp = $(newChild).find ('a').first();
		tmp.removeClass();				
		$(newChild).click (function () {				
			addQHandlerer (this); 
		});
		$('#result-queue div').prepend(newChild);
	}
}
   
function addQHandlerer (objRef, queueId, paitentId, visitId) {
  	var _el = $('#result-queue div  article');
	var cnt = $(_el).length;

	for (var j=0 ; j < cnt; j++)	{
		var tmp = $(_el[j]).find ('a').first();
		if ($(objRef)[0] == $(_el[j])[0]) {								
			tmp.addClass('active');	
			
			$('#service-container').hide();
			$("#summary-container").fadeIn (250,function () {
				reloadPatientSummaryDetail(queueId, paitentId, visitId);
				if ($('#content').hasClass('with-toolbar')) {
					closeToolBarPanel () ;
				} else {
					
				}
			});
			
		} else {
			
			tmp.removeClass();	
		}
	}
}

function startSearchPatient() {
	$('#result-search').removeClass('fade-in-element');
	$('#notfound').remove ();
	if ($('#searchPatientField').val() != '' && lastSearchTxt != $('#searchPatientField').val()) {
		//alert (data+" "+status);
		$('#result-search div article').remove();
		$('#patient-search-loading').addClass('rotate');
		$('#patient-search-loading').show();
		$.ajax({
			type : "POST",
			url : __config['medico_url'] + __config['medico_summary'],		
			data : {
					method: 'patient_search',
					data: {searchTxt:$('#searchPatientField').val()},
					accountId:accountId,					
					sessionId: sessionId},
			success : searchPatientResult,
			error : searchPatientFail,
			dataType : "json",
		});
		
	} else {		
		if ($('#searchPatientField').val() == "") {		
			$('#result-search div article').remove();
		}
		if (lastSearchTxt == $('#searchPatientField').val()) {
			$('#result-search').addClass('fade-in-element');
		}
		
	}
}

function searchPatientResult (data, status) {
	lastSearchTxt = $('#searchPatientField').val();
	var numRand =  randomNum ();
	$('#patient-search-loading').hide();
	$('#patient-search-loading').removeClass ('rotate');
	var newChild,tmp;
	
	if (data.error_code=='0' && data.count > 0) {
 		$.each (data.patient, function (no,pInfo){
 			objEl = $(queueElementPrototype).clone();
 			
 			if (pInfo.photo!='') {
				$(objEl).find('img').attr ('src',__config['image_path']+'/'+pInfo.photo);
				 if  (pInfo.sex=="1") {
				 	sexName = "ชาย"
				 } else {
				 	sexName = "หญิง"	
				 }
			} else  if  (pInfo.sex=="1") {
				sexName = "ชาย"
				$(objEl).find('img').attr ('src','images/icons/male-icon-mn.png');
			} else {
				sexName = "หญิง"
				$(objEl).find('img').attr ('src','images/icons/female-icon-mn.png');
			}
			//tmp.removeClass();				
			$(objEl).click (function () {
				currentSelectQueuePatientId = pInfo.patientId;
				$('#popupRegistQueue').popup("open");
			});
			$(objEl).find('h1').first().text (pInfo.fullname_shot);
			$(objEl).find('p').first().text ("HN: "+pInfo.hn);
			
			$(objEl).find('.queue-sex').first ().text (sexName);
						
			$('#result-search div').first().append (objEl);
			
 		});
 		$('#result-search').addClass('fade-in-element');
	} else {
		objEl = $(queuePatientNotfoundElement).clone();		
		$('#result-search div').first().append (objEl);
		
		$(objEl).click (function (e) {
			e.preventDefault();			
			e.stopPropagation();
			
			$('#searchPatientField').val('');
		    $(objEl).remove ();		    
		    $('#result-search').hide();
			openNewPatientInfo (lastSearchTxt);		
		});
		$('#result-search').addClass('fade-in-element');
	}
	if (RunningMode.phonegapActive()) {
		scrollSearchQueue.refresh();
	}

}
    
function searchPatientFail (data, status) {				
	alert ('Patient search Connection Fail.');
	$('#patient-search-loading').hide();
	$('#patient-search-loading').removeClass ('rotate');
	currentSelectQueuePatientId = 0;

}

function loadHXSummaryDetail (visitId, patientId) {
	clearPatient();
	if (visitId>0 || patientId>0) {
		
		$.mobile.loading ('show', {text: 'Summary Reload...',
						 textVisible: true,
						 theme: 'a',
						 html: ""
				});
		$.ajax({
			type : "POST",
			url : __config['medico_url'] + __config['medico_summary'],		
			data : {
					method: 'patient_summary_hx_data',
					accountId:accountId,
					sessionId: sessionId,
					visitId: visitId,
					patientId: patientId},
					
			success : patientSummaryHxDetailSuccess,
			error : reloadPatientSummaryDetailFail,
			dataType : "json",
		});
	}
}

function patientSummaryHxDetailSuccess (data,resultcode) {
	$.mobile.loading ('hide');
	
	if (data.error_code=='0') {
		patientSummaryRender(data);
	}
}

function reloadPatientSummaryDetail (queueId, patientId, visitId) {
	//alert (queueId+" "+patientId);
	clearPatient();
	if (typeof queueId == 'undefined') {
		queueId = (currentQueueId)?currentQueueId:0;
	}
	
	if (typeof patientId == 'undefined') {
		patientId = (currentPatientId)?currentPatientId:0;
	}
	
	if (typeof visitId != 'undefined') {
		currentVisitId = visitId;
	}
	
	if (patientId>0 || queueId>0) {
		currentQueueId = queueId;
		currentPatientId = patientId;
		
		$.mobile.loading ('show', {text: 'Summary Reload...',
						 textVisible: true,
						 theme: 'a',
						 html: ""
				});
		
		$.ajax({
			type : "POST",
			url : __config['medico_url'] + __config['medico_summary'],		
			data : {
					method: 'patient_summary_data',
					accountId:accountId,
					sessionId: sessionId,
					queueId: queueId,
					patientId: patientId},
					
			success : reloadPatientSummaryDetailSuccess,
			error : reloadPatientSummaryDetailFail,
			dataType : "json",
		});
	}
}

function reloadPatientSummaryDetailSuccess (data,resultcode) {
	
	$.mobile.loading ('hide');
	
	if (data.error_code=='0') {
		visitinfoDS = data.visit;
		
		if (visitinfoDS.length>0) {
			$('#scroll-rx-summary>ul>*').each (function (){
				if ($(this).attr('id') != "history-rx-loading") {
					$(this).remove();
				}
			});	
			html = '<li><a href="#">RX SUMMARY OF: TODAY</a></li>';
			obj = $(html);
			$(obj).find('a').first().bind('vclick', function (e) {		
				e.preventDefault();			 			 			
				e.stopPropagation ();		
				reloadPatientSummaryDetail () ;
				$('#summary-container .toggle-list ul li a').each (function () {
					$(this).removeClass ('current');
				});
				setTimeout("$('#summary-container .toggle-list').removeClass ('target');",400);
				$('#summary-container .toggle-list p').first ().text ('RX SUMMARY OF: TODAY');
			});
			prependListSearch ('summary-container', obj);
			
	 		$.each (visitinfoDS, function (index,visit){ 
	 				if (currentVisitId != visit.visitId ) {
						html = '<li><a href="#">';
						html+=  "RX SUMMARY OF : "+ visit.registerTime_format;
						html+= '</a></li>';		
						obj = $(html);
						
						//alert ($(obj).find('a').first().length);
						$(obj).find('a').first().bind('vclick', function (e) {						
							e.preventDefault();			 			 			
							e.stopPropagation ();									
							$('#summary-container .toggle-list p').first ().text ('RX SUMMARY OF: '+visit.registerTime_format);
							$('#summary-container .toggle-list ul li a').each (function () {
								$(this).removeClass ('current');
							});
							
							$(this).addClass ('current');		
							setTimeout("$('#summary-container .toggle-list').removeClass ('target');",400);			
							loadHXSummaryDetail (visit.visitId, visit.patientId) ;		
																										
						});
						prependListSearch ('summary-container', obj);	
					}		
			});
			//scrollRxHistory.refresh();					 	
		 	
		}
		patientSummaryRender(data);
		summaryCash ();
		//$.mobile.initializePage();
	} else {
	 	console.log ('load fail.');
	}
	
	
}

function reloadPatientSummaryDetailFail (data,resultcode) {
	$.mobile.loading ('hide');
	alert ('Fail load patient summary.')
	//portotype case
	//setTimeout("reloadPatientSummaryDetailSuccess ('',200)",800);
}

function clearPatient () {
	
	var nameElement  =  $('#patient-summary header h1');
	var picElement = $('#patient-summary header img');
	var patientInfoSlide = $('#royalSlider ul.royalSlidesContainer li');
	
	currentPatientId = 0;
	currentQueueId = 0;
	currentVisitId = 0;
	currentInvoiceStatusId = 0;
	currentSelectQueuePatientId = 0;
	
	
	$(nameElement).text ("");
	$(picElement).attr("src","images/icons/male-icon-md.png");	
	$(patientInfoSlide[0]).html ("");
			
	$('#summary-container .toggle-list').removeClass ('target');
		
	$('#summary-content-inner section').each (function () {
		if ($(this).attr('id') !='start-service-now') { 
 			$(this).find ('a').first().html ("");
 		}
		
		if ($(this).attr('id') !='last-summary-section') { 
			$(this).hide();	
		}
	});
}

function patientInfoRender (data) {
	patientinfoDS = data.patient;
	addressinfoDS  = data.address; 
	var nameElement  =  $('#patient-summary header h1');
	var picElement = $('#patient-summary header img');
	var patientInfoSlide = $('#royalSlider ul.royalSlidesContainer li');
	var name = patientinfoDS.prefixName+" "+patientinfoDS.fname+" "+patientinfoDS.lname;
	$(nameElement).text (name);
	
	if (typeof patientinfoDS.photo!='undefined' && patientinfoDS.photo!=null && patientinfoDS.photo!='') {
		$(picElement).attr("src",__config['image_path']+'/'+patientinfoDS.photo);
	} else if (patientinfoDS.sexId==1) {
		$(picElement).attr("src","images/icons/male-icon-md.png");
	} else {
		$(picElement).attr("src","images/icons/female-icon-md.png");
	}
	
	if (typeof addressinfoDS[0] != 'undefined') {
		var address = addressinfoDS[0].address+" หมู่ที่ "+addressinfoDS[0].village +" ตำบล "+addressinfoDS[0].tambonName+" อำเภอ "+addressinfoDS[0].aumphurName;
		address+= " จังหวัด "+addressinfoDS[0].provinceName+" รหัสไปรษณีย์ "+addressinfoDS[0].zipcode 
	
		$(patientInfoSlide[0]).html('<strong>ที่อยู่</strong> '+address+'<br/><strong>เบอร์ติดต่อ</strong> '+addressinfoDS[0].mobile);
	}
}

function patientSummaryRender (data) {
	patientInfoRender (data);

	var patientInfoSlide = $('#royalSlider ul.royalSlidesContainer li');
	var coverage = '<strong>สิทธิ</strong> '+visitinfoDS[0].coverageTypeName;
	
	if (visitinfoDS[0].cardNo!='') {
		coverage+= '&nbsp;&nbsp;&nbsp;<strong>เลขที่</strong> '+visitinfoDS[0].cardNo;
	}
	if (visitinfoDS[0].overageContractName!='') {
		coverage+= '&nbsp;&nbsp;&nbsp;<strong>คู่สัญญา</strong>  '+visitinfoDS[0].coverageContractName;
	}
	coverage+= '<br/>';
	if (visitinfoDS[0].startDate && visitinfoDS[0].startDate!='null') {
		coverage+= '&nbsp;&nbsp;&nbsp;<strong>วันออกบัตร</strong> '+visitinfoDS[0].startDate;
	}
	if (visitinfoDS[0].expireDate && visitinfoDS[0].expireDate!='null') {
 		coverage+= '&nbsp;&nbsp;&nbsp;<strong>วันหมดอายุ</strong> '+visitinfoDS[0].expireDate;
 	}
	
	$(patientInfoSlide[1]).html( coverage );
	
	$(patientInfoSlide[2]).html('<strong>Queue of today: </strong> '+visitinfoDS[0].vnOfDay+'&nbsp;&nbsp;<strong>Visit count: </strong>'+visitinfoDS[0].rpCountVisit+'<br/><strong>Register: </strong>'+visitinfoDS[0].registerTime);
	
	$('#royalSlider').fadeIn(800);
	$('#slide-nav').fadeIn(800);  
	
	
	//cautionRender (data.caution);
	if (data.vitalsign.length > 0) {
		vitalsignRender (data.vitalsign[0]) ;
	}
	presentIllnessRender (data.presentIllness);
	drugAllergyRender (data.drugallergy);
	historyRxRender (data.historyrx);
	icd10Render (data.icd10);
	diagnosisRender (data.diagnosis);
	drnoteRender ( data.drnote);
	physicalExamRender ( data.physicalExam );
	medicationRender ( data.medication );
	appointmentRender ( data.appointment );
	filesRender ( data.files );
	procedureRender ( data.procedure );
	$('#summary-content-inner').show ();
	if (RunningMode.phonegapActive()) {			
		scrollContent.refresh();
		scrollContent.scrollTo(0, 0, 200); 
	}
	//start-service-now
	var count_show = 0;
	$('#summary-content-inner section').each (function () {		
		if ($(this).is(":visible") && $(this)[0].id !='start-service-now' && $(this)[0].id!='last-summary-section') {						
			count_show++;
		} 
	});
	
	if (count_show==0) {
		$('#start-service-now').show ();
	} else {
		$('#start-service-now').hide ();
	}
	
	infoSlideWrapperObj.refresh ();

}

function cautionRender (data) {
	if (data!='') {
		var obj = $('#caution-section').find('a').first ();
		$(obj).html (data);
		$('#caution-section').show();
	}
}

function drugAllergyRender (data) {
	if (data!='') {
		var obj = $('#drug-allergy-section').find('a').first ();
		$(obj).html (data);
		$('#drug-allergy-section').show();
	}
}

function historyRxRender (data) {
	if (data!='') {
		var obj = $('#patient-history-section').find('a').first ();
		$(obj).html (data);
		$('#patient-history-section').show();
	}
}

function diagnosisRender (data) {
	if (data!='') {
		var obj = $('#diagnosis-section').find('a').first ();
		$(obj).html (data);
		$('#diagnosis-section').show();
	}
}

function physicalExamRender (data) {
	if (data!='') {
		var obj = $('#physical-exam-section').find('a').first ();
		$(obj).html (data);
		$('#physical-exam-section').show();
	}
}

function physicalExamRender (data) {
	if (data!='') {
		var obj = $('#physical-exam-section').find('a').first ();
		$(obj).html (data);
		$('#physical-exam-section').show();
	}
}

function vitalsignRender (data) {
	//BP : 120/80 mmHg , T: 38.5 c°, P: 62 ครั้ง/นาที, R: 22 ครั้ง/นาที, Weight : 68 Kg, Height: 180cm
	var html = "";
	var obj = $('#vitalsign-section').find('a').first();
	html+= (data.bpHigh)?"BP : "+data.bpHigh+"/"+data.bpLow+" mmHg, ":"";
	html+= (data.pulse)?"P: "+data.pulse+" time/min. ,":"";
	html+= (data.respiration)?"R: "+data.respiration+" time/min. ,":"";
	html+= (data.weight)? "Weight: "+data.weight+ "Kg. ,":"";
	html+= (data.height)? "Height: "+data.height+ "cm. ,":"";
	html+= (data.temperatureC)? "Temp.: "+data.temperatureC+ "  'c, ":"";	
	if (data.weight && data.height) { 
		var bmi = data.weight / (data.height * data.height / 10000.00);
		bmi = bmi.toFixed(2);
		html+=  "BMI: "+bmi;	
	}	
	$(obj).html (html);
	$('#vitalsign-section').show();
}

function icd10Render (data) {
	if (data!='') {
		var obj = $('#icd10-section').find('a').first ();
		$(obj).html (data);
		$('#icd10-section').show();
	}
}

function drnoteRender (data) {
	if (data!='') {
		var obj = $('#drnote-section').find('a').first ();
		$(obj).html (data);
		$('#drnote-section').show();
	}
}

function presentIllnessRender (data) {
	if (data!='') {
		var obj = $('#present-illness-section').find('a').first();
		$(obj).html (data);
		$('#present-illness-section').show();
	}
}

function medicationRender (data) {
	if (data.length!=0) {
		var html = "<ul>";
		//<li><strong>Paracetamol 300mg/2ml</strong> Inj_2 ml 200 เม็ด <br/>sig.: ก่อนอาหาร 3 เวลา เช้ากลางวันเย็น</li> 
		$.each (data, function (k,v){
			html+="<li>";
			html+="<strong>"+v.nameTrade+"</strong> ";
			html+=" &nbsp;"+v.drugAmount+"&nbsp;"+v.drugUnitNameEng;
			if ( v.drugLabelNameEng != '' || v.drugLabelName!='') {
				if (v.drugLabelNameEng!="") {
					html+= "<br/><strong>sig.</strong>: &nbsp;"+v.drugLabelNameEng;
				} else {
					html+= "<br/><strong>sig.</strong>: &nbsp;"+v.drugLabelName;
				}		
			}
			html+="</li>";
		});
		html+="</ul>";
		
		var obj = $('#medication-section').find('a').first();
		$(obj).html (html);
		$('#medication-section').show();
	}
}

function filesRender (data) {
	if (typeof data !='undefined' && data.length > 0) {
		var html = "<ul>";		
		$.each (data, function (k,v){
			html+="<li>";
			html+="<strong>"+v.helpNote+"</strong> ";
			html+=" &nbsp;"+v.fileName;			
			html+="</li>";
		});
		html+="</ul>";
		
		var obj = $('#files-section').find('a').first();
		$(obj).html (html);
		$('#files-section').show();
	}
}

function appointmentRender (data) {
	if (data.length!=0) {
		var html = "<ul>";
		//<li><strong>Paracetamol 300mg/2ml</strong> Inj_2 ml 200 เม็ด <br/>sig.: ก่อนอาหาร 3 เวลา เช้ากลางวันเย็น</li> 
		$.each (data, function (k,v){
			html+="<li>";
			html+="<strong>"+v.apmTimeStart+"</strong> ";
			html+=" &nbsp;"+v.detail;			
			html+="</li>";
		});
		html+="</ul>";
		
		var obj = $('#appointment-section').find('a').first();
		$(obj).html (html);
		$('#appointment-section').show();
	}
}

function procedureRender ( data ) {
	if ( data.length != 0) {
		var html = "<ul>";
		 
		$.each (data, function (k,v){
			html+="<li>";
			html+="<strong>"+v.serviceItemName+"</strong> ";
			html+=" &nbsp;"+v.serviceItemAmount+"&nbsp; Items";			
			html+="</li>";
		});
		html+="</ul>";
		
		var obj = $('#procedure-section').find('a').first();
		$(obj).html (html);
		$('#procedure-section').show ();
	}
}

function summaryCash () {
	$.mobile.loading ('show', {text: 'Cash Update...',textVisible: true,theme: 'a',html: ""});
		$.ajax({
			type : "POST",
			url : __config['medico_url'] + __config['cash'],		
			data : {
					method: 'summary_cash',
					accountId:accountId,
					sessionId: sessionId,
					visitId: visitinfoDS[0].visitId,
					queueId: currentQueueId,
					patientId: currentPatientId},
					
			success : summaryCashSuccess,
			error : summaryCashlFail,
			dataType : "json",
		});
}

function summaryCashSuccess (data) {
	$.mobile.loading ('hide');
	$('#bttReceive').hide();
	if (data.error_code=='0') {		
		if (typeof data['invoice'][0]!='undefined') {
			currentInvoiceStatusId = data['invoice'][0]['invoiceStatusId'];
			
			
			var total = data['invoice'][0]['totalMoney'];
			if (currentInvoiceStatusId==1 && parseFloat(total)>0) {
				$('#bttReceive').show();
			} else {
				$('#bttReceive').hide();
			}
			$('#totalcost').val (total);
			
			if (data['invoice'][0]['invoiceStatusId']!='5') {			
				$('#popupCashier #total-cost-input').val (total);
				$('#popupCashier #invoiceId').val(data['invoice'][0]['invoiceId']);
				$('#popupCashier #coverageTypeId').val(data['invoice'][0]['coverageTypeId']);
				$('#popupCashier #patientCoverageId').val(data['invoice'][0]['patientCoverageId']);
				$('#popupCashier #coveragePaymentType01Id').val(data['patientCoverageInfo']['coveragePaymentType01Id']);
				$('#popupCashier #coveragePaymentType02Id').val(data['patientCoverageInfo']['coveragePaymentType02Id'])	;	
			} 
		}
	} else {
		$('#totalcost').val (0);
		//alert ('Can not complete summary.');			
	}
	
}

function summaryCashlFail (data) {
	alert ('Cash summary connection Fail.');
	$.mobile.loading ('hide');
}


function receiveCash () {
	var flagValid = true;	
	if ($('#invoiceId').val()=='' || $('#invoiceId').val()==0) {
		alert ('Not found invoice');
		flagValid = false;
	}
	
	if ($('#receive-payment-input').val()=='') {
		alert ('Empty amount')
		flagValid = false;
	}
	if (flagValid) {
		var _recv = new Number ( $('#receive-payment-input').val());
		var _total = new Number ( $('#total-cost-input').val());
   		var _returnVal = 0 ;
   		if (_recv > _total) {   			
   			_returnVal = _recv - _total;
   		} else {
   			_returnVal = 0;
   		}
   		
   		$.mobile.loading ('show', {text: 'Receive Cash...',textVisible: true,theme: 'a',html: ""});	
		$.ajax({
			type : "POST",
			url : __config['medico_url'] + __config['cash'],		
			data : {
					method: 'receive_cash',
					data: {cashPayment01: (_recv - _returnVal), 
						  invoiceId: $('#popupCashier #invoiceId').val(),
						  coverageTypeId: $('#popupCashier #coverageTypeId').val(),
						  patientCoverageId :$('#popupCashier #patientCoverageId').val(),
						  coveragePaymentType01Id : $('#popupCashier #coveragePaymentType01Id').val(),
						  coveragePaymentType02Id : $('#popupCashier #coveragePaymentType02Id').val(),
						  
					},				
					empId:employeeDS.EMP_ID,							
					patientId: currentSelectQueuePatientId,
					stationId: currentStationId,
					accountId: accountDS.ACCOUNT_ID,
					sessionId: sessionId},
			success : function (data) {
				$.mobile.loading ('hide');
				if (data.error_code==0) {	
					summaryCash();
				}			
				$('#popupCashier').popup ('close');		
			},
			error : function (data) {
				$.mobile.loading ('hide');
				alert  ('Receive Cash Fail.');
				$('#popupCashier').popup ('close');
			},
			dataType : "json"
		});
	}
}
