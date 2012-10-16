///////////////////////////////////////////////////////////////////////////////
// Appointment PAGE 
/////////////////
var AppointmentPage = function () {
	
	var currentOrientation;
	var appointment_page = "appointment-page";
	var appointmentItemHTMLElement;
	var currentApmId;
	var currentApmDate;
	var currentApmTimeStart;
	var currentApmDetail;
	
	var scrollFormEdit;
    var curr = new Date().getFullYear();
	var opt = {}
    opt.date = {preset : 'date'};
	opt.datetime = { preset : 'datetime',  stepMinute: 5  };
	opt.time = {preset : 'time'};
	return {
	
		setup: function () {
			AppointmentPage.checkOrientation();		
			if (typeof loaded_service ["appointment.html"]=='undefined') {		
				var tmp = $("#"+appointment_page+" div.entry .history-list");		
				appointmentItemHTMLElement = $(tmp[0]).clone ();
				loaded_service ["appointment.html"] = appointment_page;	
				$(tmp).remove ();
				AppointmentPage.setupBindAppointmentPage();
			}				
			$("#"+appointment_page+" .edit-icn").hide();		
			$('#appointment-section a:first').removeClass("trigger");	
			clearToolbar(); 
			$('#toolbar-appointment a').addClass('current');
				
				
			setupDeleteButton(appointment_page);	
			AppointmentPage.getAppointmentItems();
		},
		
		checkOrientation : function () {
			if (window.orientation==90 || window.orientation==-90) {
		  		$('#bmiLine').hide();
		  	} else {
		  		$('#bmiLine').show();
		  	}
		},
		
		setupBindAppointmentPage: function () {
			setupClicksound (appointment_page) ;
			setupClicksound ('appointment-edit') ;
			
			$(window).bind( 'orientationchange', function(e){  			 
				AppointmentPage.closeAppointmentEdit();
			  	AppointmentPage.checkOrientation();
			});
			
			scrollFormEdit = new iScroll('appointmentScrollFromEdit', {
									momentum: true,
									hScrollbar: false,
									vScrollbar: true,
									
									onBeforeScrollStart: function (e) {
										var target = e.target;
										while (target.nodeType != 1) target = target.parentNode;
							
										if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA')
											e.preventDefault();
									}
							 });
			
			$('#appoint-date-form').scroller({
		        preset: 'date',		        
		        display: 'inline',
		        theme: 'jqm',
		        showLabel: true,
		        dateOrder: 'yymmdd',
		        dateFormat: 'yy-mm-dd',		        
		        mode: 'mixed'
		    });
		    
		    $('#appoint-time-form').scroller({
		        preset: 'time',		        
		        display: 'inline',
		        theme: 'jqm',
		        showLabel: true,
		        timeWheels: 'HHii',
		        stepMinute:	10,
		        timeFormat: 'HH:ii',		        
		        mode: 'mixed'
		    });    
			
			$("#"+appointment_page+" #title-page .add-icn").bind('vclick',function(e) {			
				e.preventDefault();	
				e.stopPropagation();
				console.log ('Add: openAppointment');
				AppointmentPage.openAppointmentEdit (); 
				$('#appointment-edit textarea').focus();
			});
			
			$("#appointment-edit #appoint-save").bind ('vclick',function (e) {
				e.preventDefault();	
				e.stopPropagation();
				AppointmentPage.setAppointmentItems();
			});
			
			$("#appointment-edit #appoint-cancel").bind('vclick',function(e) {
				e.preventDefault();
				e.stopPropagation();				
				$("#"+appointment_page+" .add-icn").show();
				AppointmentPage.closeAppointmentEdit (); 
				AppointmentPage.clearTrigger();
			});
			
			$('#appointment-edit').bind({
			   popupafterclose: function(event, ui) { 
			   		console.log ('appointment-edit event popupafterclose ');	
			   		if (currentOrientation == window.orientation) {		   		
						AppointmentPage.clearInput();			
					}
					$('#appointment-edit #appoint-date-form').blur();
					$('#appointment-edit #appoint-time-form').blur();
					$('#appointment-edit #appoint-description-form').blur();					
			   }
			});
		},
		
		clearTrigger : function () {
			$("#"+appointment_page+" div.entry .recent-present").each (function () {				
				$(this).find('.delete-btn').first().hide();
			});
		},
		
		closeAppointmentEdit: function () {	
			$('#content').focus();
			$('#appointment-edit').popup ('close');
		},
	
		openAppointmentEdit: function () {
			currentOrientation = window.orientation;
		 				 			 
			$('#appointment-edit').popup ('open',  {
							y:20,							
							shadow: true,
							corners: true,							
							transition: "slidedown"					
							
			});
			
		},
		
		clearInput : function () {
			
			var curr = new Date();
			var arrDate = new Array ();
			arrDate[0] = curr.getFullYear();
			arrDate[1] = curr.getMonth();
			arrDate[2] = curr.getDate();
			
			var arrTime = new Array ();
			arrTime[0] = curr.getHours();
			arrTime[1] = '00';
			arrTime[2] = '00';
			
			$('#appoint-date-form').scroller('setValue', arrDate);													
			$('#appoint-time-form').scroller('setValue', arrTime);
			$('#appointmentScrollFromEdit #appoint-date-form').val ('');
			$('#appointmentScrollFromEdit #appoint-time-form').val ('');
			$('#appointmentScrollFromEdit #appoint-description-form').val ('');
		},
		
		getAppointmentItems: function () {
			if (currentPatientId>0) {
				$.mobile.loading ('show', {text: 'Loading appintment. data...',textVisible: true,theme: 'a',html: ""});
				
				$("#"+appointment_page+"  div.entry .history-list").remove();
				$.ajax({
					type : "POST",
					url : __config['medico_url'] + __config['medico_summary'],		
					data : {
							method: 'appointment_data',							
							empId:employeeDS.EMP_ID,
							queueId: currentQueueId,
							patientId: currentPatientId,						
							accountId: accountDS.ACCOUNT_ID,
							sessionId: sessionId},
					success : AppointmentPage.getAppointmentItemsSuccess,
					error : AppointmentPage.getAppointmentItemsFail,
					dataType : "json",
				});
			}
		},
		
		getAppointmentItemsSuccess: function  (data) {
			$.mobile.loading ('hide');
			if (typeof data == 'undefined' || data==null) return false;
			if (data.count > 0 && data.error_code=='0') {								
				$.each (data.appointment, function (k,v){
					if (k!='count') {
						var elm = $(appointmentItemHTMLElement).clone();
						$(elm).find('.delete-btn').first().bind('vclick',function (e) {
							$(this).addClass ('trigger');
							AppointmentPage.removeAppointmentItems(v.apmId);
						});
						$(elm).find('.edit-btn').first().bind('vclick',function (e) {
							e.preventDefault();	
							e.stopPropagation();
							console.log ('Edit : openAppointmentEdit');
							$('#appointment-edit textarea').val (currentApmDetail);		
							AppointmentPage.openAppointmentEdit (); 
							$('#appointment-edit textarea').focus().caretToEnd();
						});
						$(elm).find('h2').first().text (v.lastUpdate+" "+v.apmRecordByFname+" "+v.apmRecordByLname);						
						$(elm).find('a>p').last().replaceWith ("<strong>Appointment Date:</strong> "+v.apmTimeStart+"<br/><strong>Detail:</strong> "+v.detail);
						$(elm).find('.delete-btn').hide();
						$(elm).find('.edit-btn').hide();	
						
						$(elm).find('a').first().bind ('vclick',function () {
							if ($(this).hasClass ('trigger')) {
								$(this).removeClass ('trigger');
								$(elm).find('.delete-btn').first().hide();	
								$(elm).find('.edit-btn').first().hide();							
								$("#"+appointment_page+" .add-icn").show();
								currentApmId = null;
								currentApmDate = null;
								currentApmTimeStart = null;
								currentApmDetail = null;
							} else {
								$(this).addClass ('trigger');
								$(elm).find('.delete-btn').first().show();
								$(elm).find('.edit-btn').first().show();							
								$("#"+appointment_page+" .add-icn").hide();
								currentApmId = v.apmId;
								_dateStr = new String(v.apmTimeStart);
								_arr = _dateStr.split(" ");								
								currentApmDate = _arr[0];		
								$('#appoint-date-form').scroller('setValue', currentApmDate.split("-"));						
								currentApmTimeStart = _arr[1];
								$('#appoint-time-form').scroller('setValue', currentApmTimeStart.split(":"));
								$('#appointment-edit #apmId').val(currentApmId);
								//alert ($('#appoint-date-form').scroller('getValue'));
								//alert ($('#appoint-time-form').scroller('getValue'));								
								currentApmDetail = v.detail;
							}
						});							
						
						
						
						$(elm).appendTo('#'+appointment_page+' div.entry');
						setupNewDeleteButton(elm);
					}				
				});	
				$('#'+appointment_page+' .recent-present >ul').show ();	
				
			} else {
				AppointmentPage.openAppointmentEdit();				
			}
			
		},
		
		getAppointmentItemsFail: function ()  {
			alert("Fail load vitalsigns data.");
			$.mobile.loading ('hide');	
		},
		
		removeAppointmentItems: function (apmId) {
			
			console.log ("removeAppiontItems "+ apmId);
			$.ajax({
				type : "POST",
				url : __config['medico_url'] + __config['medico_summary'],		
				data : {
						method: 'appointment_delete',		
						data: {
							apmId:apmId						
						},						
						empId:employeeDS.EMP_ID,
						queueId: currentQueueId,
						patientId: currentPatientId,						
						accountId: accountDS.ACCOUNT_ID,
						sessionId: sessionId},
				success : AppointmentPage.removeAppointmentItemsSuccess,
				error : AppointmentPage.removeAppointmentItemsFail,
				dataType : "json",
			});
		},
		
		removeAppointmentItemsSuccess: function (data,resultcode) {
			$.mobile.loading ('hide');
			AppointmentPage.getAppointmentItems();
			$("#"+appointment_page+" .edit-icn").hide();
			$("#"+appointment_page+" .add-icn").show();
		},
		
		removeAppointmentItemsFail: function  (data,resultcode) {	
			alert ('Appointment Remove Fail. ');
			$.mobile.loading ('hide');	
			$("#"+appointment_page+" .edit-icn").hide();
			$("#"+appointment_page+" .add-icn").show();
		},
		
		setAppointmentItems: function  () {
			console.log("INSERT APPOINTMENT ITEM ");
			
			
			$.mobile.loading ('show', {text: 'Save Appoint data...',textVisible: true,theme: 'a',html: ""});
			var tmpArr = $('#appoint-date-form').scroller('getValue');
			var dateData = tmpArr[0]+"-"+tmpArr[1]+"-"+tmpArr[2];
			tmpArr = $('#appoint-time-form').scroller('getValue');
			var timeData = tmpArr[0]+":"+tmpArr[1]+":00";
			$.ajax({
				type : "POST",
				url : __config['medico_url'] + __config['medico_summary'],		
				data : {
						method: 'appointment_set',
						data:{ apmId: $('#appointment-edit #apmId').val(),
							apmFname: patientinfoDS.fname,
							apmLname: patientinfoDS.lname,
							apmDateStart:dateData,
							apmTimeStart:timeData,
							detail:$('#appointment-edit #appoint-description-form').val()
						},		
						empId:employeeDS.EMP_ID,
						queueId: currentQueueId,
						visitId: visitinfoDS[0].visitId,
						patientId: currentPatientId,
						accountId: accountDS.ACCOUNT_ID,
						sessionId: sessionId},
				success : AppointmentPage.setAppointmentItemsSuccess,
				error : AppointmentPage.setAppointmentItemsFail,
				dataType : "json",
			});
		
		},
		
		setAppointmentItemsSuccess: function  (data,resultcode) {			
			$.mobile.loading ('hide');
			$("#"+appointment_page+" .edit-icn").hide();
			$("#"+appointment_page+" .add-icn").show();
			AppointmentPage.closeAppointmentEdit();
			AppointmentPage.getAppointmentItems();
		},
		
		setAppointmentItemsFail: function  (data,resultcode) {
			$("#"+appointment_page+" .edit-icn").hide();
			$("#"+appointment_page+" .add-icn").show();
			AppointmentPage.closeAppointmentEdit();
			alert ('Appointment Set Fail. ');
			$.mobile.loading ('hide');
		},
		
		
	};
}();