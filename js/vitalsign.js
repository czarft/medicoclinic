///////////////////////////////////////////////////////////////////////////////
// Vitalsign PAGE 
/////////////////
var VitalsignPage = function () {
	
	var currentOrientation;
	var vitalsign_page = "vitalsign-page";
	var vitalSignItemHTMLElement;
	var currentServiceId = 0;
	var vitalSignHeadElement = '<tr><th>Time</th><th>Blood Pressure</th><th>Temperature \'c</th><th>Pulse</th><th>Respiration</th><th>Weight</th><th>Height</th><th>BMI</th></tr>';
	var vitalSignTailElement = '<tr><td colspan="7"><p class="delete-btn">Delete</p></td></tr>'
	var scrollFormEdit;
	return {
	
		setup: function () {
			VitalsignPage.checkOrientation();		
			if (typeof loaded_service ["vitalsign.html"]=='undefined') {						
				var htmlTxt = '<tr><th rowspan="2">27 MAY 2012</th><td>120/80</td><td>35</td>';
				htmlTxt+= '<td>62</td><td>22</td><td>68</td><td>180</td><td>20.00</td></tr>';	
				vitalsignItemHTMLElement = $(htmlTxt).clone ();
				loaded_service ["vitalsign.html"] = vitalsign_page;	
				//alert ($("#"+vitalsign_page+" div.entry table tr").length);
				$("#"+vitalsign_page+" div.entry table tr").remove();
				VitalsignPage.setupBindVitalsignPage();
			}			
			$("#"+vitalsign_page+" .edit-icn").hide();		
			$('#vitalsign-section a:first').removeClass("trigger");	
			clearToolbar(); 
			$('#toolbar-vitalsign a').addClass('current');
				
				
			setupDeleteButton(vitalsign_page);	
			VitalsignPage.getVitalsignItems();
		},
		
		checkOrientation : function () {
			if (window.orientation==90 || window.orientation==-90) {
		  		$('#bmiLine').hide();
		  	} else {
		  		$('#bmiLine').show();
		  	}
		},
		
		setupBindVitalsignPage: function () {
			setupClicksound (vitalsign_page) ;
			setupClicksound ('vitalsign-edit') ;
			
			$(window).bind( 'orientationchange', function(e){  			 
				VitalsignPage.closeVitalsignEdit();
			  	VitalsignPage.checkOrientation();
			});
			
			if (RunningMode.phonegapActive() ) {
				scrollFormEdit = new iScroll('vitalsignScrollFromEdit', {
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
			}
			$('#vitalsign-edit #height, #vitalsign-edit #weight').bind ('keyup',function (e) {
				calBMI();
			});
			
			
			$("#"+vitalsign_page+" .edit-icn").bind('vclick',function (e){
				e.preventDefault();	
				e.stopPropagation();
				console.log ('Edit : openVitalsignEdit');				
				VitalsignPage.openVitalsignEdit (); 
				$('#vitalsign-edit #weight').focus();
			});
			
			$("#"+vitalsign_page+" #title-page .add-icn").bind('vclick',function(e) {			
				e.preventDefault();	
				e.stopPropagation();
				console.log ('Add: openVitalsignEdit');
				VitalsignPage.openVitalsignEdit (); 
				$('#vitalsign-edit #weight').focus();
			});
			
			$("#vitalsign-edit input:submit").bind ('vclick',function (e) {
				e.preventDefault();	
				e.stopPropagation();
				VitalsignPage.setVitalsignItems();
			});
			
			$("#vitalsign-edit input:reset").bind('vclick',function(e) {
				e.preventDefault();
				e.stopPropagation();
				$("#"+vitalsign_page+" .edit-icn").hide();
				$("#"+vitalsign_page+" .add-icn").show();
				VitalsignPage.closeVitalsignEdit (); 
				VitalsignPage.clearTrigger();
			});
			
			$('#vitalsign-edit').bind({
			   popupafterclose: function(event, ui) { 
			   		console.log ('vitalsign-edit event popupafterclose ');	
			   		if (currentOrientation == window.orientation) {		   		
						VitalsignPage.clearInput();			
					}
					$('#vitalsign-edit #weight').blur();					
			   }
			});
		},
		
		
		clearTrigger : function () {
			$("#"+vitalsign_page+" div.entry .recent-present").each (function () {				
				$(this).find('.delete-btn').first().hide();
			});
		},
		
		closeVitalsignEdit: function () {	
			$('#content').focus();
			$('#vitalsign-edit').popup ('close');
		},
	
		openVitalsignEdit: function () {
			currentOrientation = window.orientation; 			 			 
			$('#vitalsign-edit').popup ('open', {
							x:0,
							y:0,
							theme: 'a',
							overlayTheme: 'a',
							shadow: true,
							corners: true,
							positionTo: '#search-queue',
							transition: "slidedown",							
							tolerance: "1,1,10,1"
			});
			
		},
		
		clearInput : function () {
			currentHelpNote = null;
			currentHelpNoteServiceId = null;
			currentServiceId = 0;
			$('#vitalsignScrollFromEdit #weight').val ('');
			$('#vitalsignScrollFromEdit #height').val ('');
			$('#vitalsignScrollFromEdit #bpHigh').val ('');
			$('#vitalsignScrollFromEdit #bpLow').val ('');
			$('#vitalsignScrollFromEdit #pulse').val ('');
			$('#vitalsignScrollFromEdit #temperatureC').val ('');
			$('#vitalsignScrollFromEdit #respiration').val ('');
			$('#vitalsignScrollFromEdit #bmi').val ('');
		},
		getVitalsignItems: function () {
			if (currentQueueId>0) {
				$.mobile.loading ('show', {text: 'Loading patient vitalsign. data...',textVisible: true,theme: 'a',html: ""});
				
				$("#"+vitalsign_page+" div.entry table tr").remove();
				$.ajax({
					type : "POST",
					url : __config['medico_url'] + __config['medico_summary'],		
					data : {
							method: 'vitalsign_data',							
							empId:employeeDS.EMP_ID,
							queueId: currentQueueId,
							patientId: currentPatientId,
							visitId: visitinfoDS[0].visitId,
							accountId: accountDS.ACCOUNT_ID,
							sessionId: sessionId},
					success : VitalsignPage.getVitalsignItemsSuccess,
					error : VitalsignPage.getVitalsignItemsFail,
					dataType : "json",
				});
			}
		},
		
		getVitalsignItemsSuccess: function  (data) {
			$.mobile.loading ('hide');
			if (typeof data == 'undefined' || data==null) return false;
			if (data.count > 0 && data.error_code=='0') {
				var tmpElem = $(vitalSignHeadElement);
				$(tmpElem).appendTo('#'+vitalsign_page+' div.entry table'); // thead
				var _tmpElement = "";
				$.each (data.vitalsign, function (k,v){
					if (k!='count') {
						var elm = $(vitalsignItemHTMLElement).clone();	
						//alert ($(elm).find('th').first().length);					
						$(elm).find('th').first().text (v.recordTime);
						$(elm).find('td').eq(0).text (v.bpHigh+"/"+v.bpLow);
						$(elm).find('td').eq(1).text (v.temperatureC);
						$(elm).find('td').eq(2).text (v.pulse);		
						$(elm).find('td').eq(3).text (v.respiration);	
						$(elm).find('td').eq(4).text (v.weight);
						$(elm).find('td').eq(5).text (v.height);	
						
						if (v.weight && v.height) { 
							var bmi = v.weight / (v.height * v.height / 10000.00);
							bmi = bmi.toFixed(2);							
							$(elm).find('td').eq(6).text (bmi);
						}											
						$(elm).appendTo('#'+vitalsign_page+' div.entry table');
						
						var elementTail = $(vitalSignTailElement);
						_tmpElement = v.recordPrefixName+"&nbsp;"+v.recordFname+"&nbsp;"+v.recordLname+'<p class="delete-btn">Delete</p>';
						$(elementTail).find ('td').first().html(_tmpElement);						
						$(elementTail).appendTo('#'+vitalsign_page+' div.entry table');
						
						$(elementTail).find ('.delete-btn').first().hide();
						console.log('bind vitalsign page.');
						
						$(elementTail).find ('.delete-btn').bind ('vclick',function (e) {
							VitalsignPage.removeVitalsignItems (v.vitalSignId);
						});
						
						$(elm).bind ('vclick',function (e) {
							e.preventDefault();	
							e.stopPropagation();	
							if ($(elementTail).find ('.delete-btn').is(":visible")) {
								$(elementTail).find ('.delete-btn').first().hide();
							}  else {
								$(elementTail).find ('.delete-btn').first().show();
							}																		
						});
						
						$(elm).bind ('swipeleft',function (e) {
							console.log('swipeleft vitalsign element');
							e.preventDefault();	
							e.stopPropagation();				
		
							$(elementTail).find ('.delete-btn').first().show();
						});
						
						$(elm).bind ('swiperight',function (e) {
							console.log('swiperight vitalsign element');
							e.stopPropagation();
							e.stopPropagation();
							$(elementTail).find ('.delete-btn').first().hide();
						});
					}					
				});	
			 	$("#"+vitalsign_page+" .recent-present table").show ();	
				
			} else {				
				VitalsignPage.openVitalsignEdit();
				$('#vitalsign-edit #weight').focus();
			}
			if ($("#"+vitalsign_page+" .recent-present table tr").length==0) {
				$("#"+vitalsign_page+" .recent-present table").hide ();
			}
		},
		
		getVitalsignItemsFail: function ()  {
			alert("Fail load vitalsigns data.");
			$.mobile.loading ('hide');	
		},
		
		removeVitalsignItems: function (vitalSignId) {
			
			console.log ("removeVitalsignItems "+ vitalSignId);
			$.ajax({
				type : "POST",
				url : __config['medico_url'] + __config['medico_summary'],		
				data : {
						method: 'vitalsign_delete',		
						data: {vitalSignId:vitalSignId},						
						empId:employeeDS.EMP_ID,
						queueId: currentQueueId,
						patientId: currentPatientId,
						visitId: visitinfoDS[0].visitId,
						accountId: accountDS.ACCOUNT_ID,
						sessionId: sessionId},
				success : VitalsignPage.removeVitalsignItemsSuccess,
				error : VitalsignPage.removeVitalsignItemsFail,
				dataType : "json",
			});
		},
		
		removeVitalsignItemsSuccess: function (data,resultcode) {
			$.mobile.loading ('hide');
			VitalsignPage.getVitalsignItems();
			$("#"+vitalsign_page+" .edit-icn").hide();
			$("#"+vitalsign_page+" .add-icn").show();
		},
		
		removeVitalsignItemsFail: function  (data,resultcode) {	
			alert ('Vitalsign Remove Fail. ');
			$.mobile.loading ('hide');	
			$("#"+vitalsign_page+" .edit-icn").hide();
			$("#"+vitalsign_page+" .add-icn").show();
		},
		
		setVitalsignItems: function  () {
			console.log("INSERT VITALSIGN ITEM ");
			
			
			$.mobile.loading ('show', {text: 'Save Vitalsign data...',
							 textVisible: true,
							 theme: 'a',
							 html: ""
					});
			$.ajax({
				type : "POST",
				url : __config['medico_url'] + __config['medico_summary'],		
				data : {
						method: 'vitalsign_set',
						data: $('#vitalsign-edit-form').serialize(),				
						empId:employeeDS.EMP_ID,
						queueId: currentQueueId,
						visitId: visitinfoDS[0].visitId,
						patientId: currentPatientId,
						accountId: accountDS.ACCOUNT_ID,
						sessionId: sessionId},
				success : VitalsignPage.setVitalsignItemsSuccess,
				error : VitalsignPage.setVitalsignItemsFail,
				dataType : "json",
			});
		
		},
		
		setVitalsignItemsSuccess: function  (data,resultcode) {			
			$.mobile.loading ('hide');
			$("#"+vitalsign_page+" .edit-icn").hide();
			$("#"+vitalsign_page+" .add-icn").show();
			VitalsignPage.closeVitalsignEdit();
			VitalsignPage.getVitalsignItems();
		},
		
		setVitalsignItemsFail: function  (data,resultcode) {
			$("#"+vitalsign_page+" .edit-icn").hide();
			$("#"+vitalsign_page+" .add-icn").show();
			VitalsignPage.closeVitalsignEdit();
			alert ('Vitalsign Set Fail. ');
			$.mobile.loading ('hide');
		},
		
		removeLoadingVitalsign: function  () {
			$('#caution-search-field-loading>*').hide();
			$('#caution-search-field-loading').removeClass('rotate');		
		}
	};
}();