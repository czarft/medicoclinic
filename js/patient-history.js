///////////////////////////////////////////////////////////////////////////////
// Patient History PAGE 
/////////////////

var PatientHistoryPage = function () {
	var currentOrientation;
	var patient_hx_page_id = "patient-history-page";
	var patientHxItemHTMLElement;
	var currentHelpNote = null;
	var currentHelpNoteServiceId = 0;
	var currentServiceId = 0;
	var suggestionWordScroll;	
	var wordSuggestObj;
	var helpTypeId = 7;
	return {
		getHelpTypeId: function () {
			return helpTypeId;
		},
		getPageId: function () {
			return patient_hx_page_id;
		},
		setup: function () {		
			if (typeof loaded_service ["patient-history.html"]=='undefined') {		
				var tmp = $("#"+patient_hx_page_id+" div.entry .history-list");		
				patientHxItemHTMLElement = $(tmp[0]).clone ();
				loaded_service ["patient-history.html"] = patient_hx_page_id;	
				$(tmp).remove ();
				PatientHistoryPage.setupBindPatientHistoryPage();
			}			
			$("#"+patient_hx_page_id+" .edit-icn").hide();		
			$('#patient-history-section a:first').removeClass("trigger");	
			clearToolbar(); 
			$('#toolbar-patient-history a').addClass('current');
				
			setupDeleteButton(patient_hx_page_id);	
			PatientHistoryPage.getPatientHxItems();
		},
		
		setupBindPatientHistoryPage: function () {						
			
			setupClicksound (patient_hx_page_id) ;
			setupClicksound ('patient-history-edit') ;
			
			$(window).bind( 'orientationchange', function(e){  			 
				PatientHistoryPage.closePatientHxEdit();			  	
			});
			
			$("#patient-history-edit .drawing-icn").click (function(e){
				e.preventDefault();		
				e.stopPropagation ();
				openDrawing = true;
				PatientHistoryPage.closePatientHxEdit ();
				$("#drawing-form input[name='visitId']").val (currentVisitId);
				$("#drawing-form input[name='type']").val (patient_hx_page_id);				 										
			});  
			
			suggestionWordScroll =  new iScroll($("#patient-history-edit aside div")[0], {
				momentum: true,
				hScrollbar: false,
				vScrollbar: true
			});
			
			$('#patient-history-edit textarea').bind ("vmousemove", function(e){
				e.preventDefault();								    
			});
			
			$('#patient-history-edit textarea').bind ("keyup", function(e){
				e.preventDefault();	
				delay(function(){ PatientHistoryPage.searchWord ();  }, 400);					
				
			});
			 
			
			
			$("#"+patient_hx_page_id+" .edit-icn").bind('vclick',function (e){
				e.preventDefault();	
				e.stopPropagation();
				console.log ('Edit : openPatientHxEdit');
				$('#patient-history-edit textarea').val (currentHelpNote);		
				PatientHistoryPage.openPatientHxEdit (); 
				$('#patient-history-edit textarea').focus().caretToEnd();
			});
					
			$("#"+patient_hx_page_id+" #title-page .add-icn").bind('click',function(e) {			
				e.preventDefault();	
				e.stopPropagation();
				console.log ('Add: openPatientHxEdit CLICK');
				PatientHistoryPage.openPatientHxEdit (); 				
				$('#patient-history-edit textarea').focus();
			});
			
			$("#patient-history-edit input:submit").bind ('vclick',function (e) {
				e.preventDefault();	
				e.stopPropagation();
				PatientHistoryPage.setPatientHxItems(currentHelpNoteServiceId, $("#patient-history-edit textarea").val(), currentServiceId);
			});
			
			$("#patient-history-edit input:reset").bind('vclick',function(e) {
				e.preventDefault();		
				e.stopPropagation();		
				$("#"+patient_hx_page_id+" .edit-icn").hide();
				$("#"+patient_hx_page_id+" .edit-btn").hide();	
				$("#"+patient_hx_page_id+" .add-icn").show();
				PatientHistoryPage.closePatientHxEdit (); 
				PatientHistoryPage.clearTrigger();
			});
								
			
			$('#patient-history-edit').bind({
			   popupafterclose: function(event, ui) { 
			   		console.log ('patient-history-edit event popupafterclose ');
			   		if (currentOrientation == window.orientation) {		   		
						PatientHistoryPage.clearInput();			
					}
			   						
					$('#patient-history-edit textarea').blur();					
					openDrawingTool ();
			   }
			});					
		},
		
		clearInput : function () {
			$('#patient-history-edit textarea').val ("");
			currentHelpNote = null;
			currentHelpNoteServiceId = null;
			currentServiceId = null;	
		},
		
		clearTrigger : function () {
			$("#"+patient_hx_page_id+" div.entry .history-list").each (function () {
				$(this).find('a').first().removeClass("trigger");
				$(this).find('.delete-btn').first().hide();
			});
		},		
		
		closePatientHxEdit: function () {	
			$('#patient-history-edit').popup ('close');
		},		
		
		openPatientHxEdit: function () {
			currentOrientation = window.orientation;	
			if ($('#patient-history-edit aside ul li').length == 0) {
				dao.findSuggestionType (PatientHistoryPage.getHelpTypeId(),function (data) {//HX.
					PatientHistoryPage.setupSuggestion (data);
				});	
			}				 			
			$('#patient-history-edit').popup ('open', {	x:0,
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
		
		getPatientHxItems: function () {
			if (currentQueueId>0) {
				$.mobile.loading ('show', {text: 'Loading patient hx. data...', textVisible: true,theme: 'a',html: ""});
				
				$("#"+patient_hx_page_id+" div.entry .history-list").remove();
				$.ajax({
					type : "POST",
					url : __config['medico_url'] + __config['medico_summary'],		
					data : {
							method: 'historyrx_data',							
							empId:employeeDS.EMP_ID,
							queueId: currentQueueId,
							type: patient_hx_page_id,
							patientId: currentPatientId,
							visitId: visitinfoDS[0].visitId,
							accountId: accountDS.ACCOUNT_ID,
							sessionId: sessionId},
					success : PatientHistoryPage.getPatientHxItemsSuccess,
					error : PatientHistoryPage.getPatientHxItemsFail,
					dataType : "json",
				});
			}
		},
		
		getPatientHxItemsSuccess: function  (data) {
			$.mobile.loading ('hide');
			if (typeof data == 'undefined' || data==null) return false;
			if (data.count > 0 && data.error_code=='0') {
				$.each (data.historyrx, function (k,v){
					if (k!='count') {
						var elm = $(patientHxItemHTMLElement).clone();
						$(elm).find('.delete-btn').first().bind('vclick',function (e) {
							$(this).addClass ('trigger');
							PatientHistoryPage.removePatientHxItems(v.helpNoteServiceId);
						});
						$(elm).find('.edit-btn').first().bind('vclick',function (e) {
							e.preventDefault();	
							e.stopPropagation();
							console.log ('Edit : openPatientHxEdit');
							$('#patient-history-edit textarea').val (currentHelpNote);		
							PatientHistoryPage.openPatientHxEdit (); 
							$('#patient-history-edit textarea').focus().caretToEnd();
						});
						$(elm).find('h2').first().text (v.lastUpdate+" "+v.prefixName+" "+v.fname+" "+v.lname);
						$(elm).find('a>p').last().replaceWith (v.helpNote);
						$(elm).find('.delete-btn').hide();
						$(elm).find('.edit-btn').hide();	
						if ( typeof v.files !='undefined' && v.files!='') {	
							$(elm).find('a').first().bind ('vclick',function (e) {
								e.preventDefault();	
								e.stopPropagation();
								$('#image-popup').find ('img').first().attr ('src',__config['image_path']+'/'+v.files);
								$("#image-popup input[name='updateId']").val (v.patientImageId);
								$("#image-popup input[name='type']").val (patient_hx_page_id);
								openImagePopup () 
							});
						} else {
							$(elm).find('a').first().bind ('vclick',function () {
							if ($(this).hasClass ('trigger')) {
								$(this).removeClass ('trigger');
								$(elm).find('.delete-btn').first().hide();
								$(elm).find('.edit-btn').first().hide();
								//$("#"+patient_hx_page_id+" .edit-icn").hide();
								$("#"+patient_hx_page_id+" .add-icn").show();
								currentHelpNote = null;
								currentHelpNoteServiceId = null;
								currentServiceId = null;
							} else {
								$(this).addClass ('trigger');
								$(elm).find('.delete-btn').first().show();
								$(elm).find('.edit-btn').first().show();
								//$("#"+patient_hx_page_id+" .edit-icn").show();
								$("#"+patient_hx_page_id+" .edit-icn").hide();
								$("#"+patient_hx_page_id+" .add-icn").hide();
								currentHelpNote = data.historyrx_text[k].helpNote;
								currentHelpNoteServiceId = v.helpNoteServiceId;
								currentServiceId = v.serviceId;
							}							
						});
						}
						
						$(elm).appendTo('#'+patient_hx_page_id+' div.entry');
						setupNewDeleteButton(elm);
					}
					
				});
				$('#'+patient_hx_page_id+' .recent-present >ul').show ();
				
			} else {
				PatientHistoryPage.openPatientHxEdit();
				$('#patient-history-edit textarea').focus();
			}
		},
		
		getPatientHxItemsFail: function ()  {
			alert("Fail get data.");
			$.mobile.loading ('hide');	
		},
		
		removePatientHxItems: function (helpNoteServiceId) {
			
			console.log ("removePatientHxItems "+ helpNoteServiceId);
			$.ajax({
				type : "POST",
				url : __config['medico_url'] + __config['medico_summary'],		
				data : {
						method: 'historyrx_delete',		
						data: {helpNoteServiceId:helpNoteServiceId},						
						empId:employeeDS.EMP_ID,
						queueId: currentQueueId,
						patientId: currentPatientId,
						visitId: visitinfoDS[0].visitId,
						accountId: accountDS.ACCOUNT_ID,
						sessionId: sessionId},
				success : PatientHistoryPage.removePatientHxItemsSuccess,
				error : PatientHistoryPage.removePatientHxItemsFail,
				dataType : "json",
			});
		},
		
		removePatientHxItemsSuccess: function (data,resultcode) {
			$.mobile.loading ('hide');
			PatientHistoryPage.getPatientHxItems();
			$("#"+patient_hx_page_id+" .edit-icn").hide();
			$("#"+patient_hx_page_id+" .edit-btn").hide();	
			$("#"+patient_hx_page_id+" .add-icn").show();
			currentHelpNote = null;
			currentHelpNoteServiceId = null;
			currentServiceId = 0;
		},
		
		removePatientHxItemsFail: function  (data,resultcode) {	
			alert ('PatientHx Set Fail. ');
			$.mobile.loading ('hide');	
			$("#"+patient_hx_page_id+" .edit-icn").hide();
			$("#"+patient_hx_page_id+" .edit-btn").hide();	
			$("#"+patient_hx_page_id+" .add-icn").show();
			currentHelpNote = null;
			currentHelpNoteServiceId = null;
			currentServiceId = 0;
		},
		
		setPatientHxItems: function  (id, note, serviceId) {
			console.log("INSERT PATIENT HX "+id+" "+note);
			
			if (note !='') {
				$.mobile.loading ('show', {text: 'Save Patient Hx. data...',textVisible: true,theme: 'a',html: ""});
				PatientHistoryPage.setSuggestionWord (note);
				$.ajax({
					type : "POST",
					url : __config['medico_url'] + __config['medico_summary'],		
					data : {
							method: 'historyrx_set',
							data: {helpNoteServiceId:id, helpNote: note, serviceId: serviceId, helpTypeId: helpTypeId},				
							empId:employeeDS.EMP_ID,
							queueId: currentQueueId,
							visitId: visitinfoDS[0].visitId,
							patientId: currentPatientId,
							accountId: accountDS.ACCOUNT_ID,
							sessionId: sessionId},
					success : PatientHistoryPage.setPatientHxItemsSuccess,
					error : PatientHistoryPage.setPatientHxItemsFail,
					dataType : "json",
				});
			}		
		},
		
		setPatientHxItemsSuccess: function  (data,resultcode) {			
			$.mobile.loading ('hide');
			$("#"+patient_hx_page_id+" .edit-icn").hide();
			$("#"+patient_hx_page_id+" .edit-btn").hide();	
			$("#"+patient_hx_page_id+" .add-icn").show();
			PatientHistoryPage.clearTrigger();
			PatientHistoryPage.closePatientHxEdit();
			PatientHistoryPage.getPatientHxItems();
		},
		
		setPatientHxItemsFail: function  (data,resultcode) {
			$.mobile.loading ('hide');
			$("#"+patient_hx_page_id+" .edit-icn").hide();
			$("#"+patient_hx_page_id+" .edit-btn").hide();	
			$("#"+patient_hx_page_id+" .add-icn").show();
			PatientHistoryPage.clearTrigger();
			PatientHistoryPage.closePatientHxEdit();
			alert ('PatientHx Set Fail. ');
		},
		
		setupSuggestion: function (data) {
			if (typeof wordSuggestObj=='undefined') {
				wordSuggestObj = $('#patient-history-edit aside ul li').first().clone();
			}
			$('#patient-history-edit aside ul li').remove();
			if (data.length > 0) {
				$.each (data, function (k,v){
					var elm = $(wordSuggestObj).clone();					
					$(elm).find ('a').first().html (v.word);
					$(elm).find ('a').click (function (e) {
						e.preventDefault();	
						e.stopPropagation();			
						var lastTxt = findLastWord($('#patient-history-edit textarea').first().val());
						var tmpTxt;
						if (lastTxt!='' &&  v.word.indexOf (lastTxt)===0) {
							tmpTxt = replaceLastWord ($('#patient-history-edit textarea').first().val(),  v.word);							 
						}  else {
							tmpTxt = $('#patient-history-edit textarea').val ()+" "+v.word;
						}						
						
						$('#patient-history-edit textarea').val (tmpTxt);	
						$('#patient-history-edit textarea').focus();  
						PatientHistoryPage.searchWord();
					});
					$(elm).appendTo('#patient-history-edit aside ul');
				});
			}
		},
		searchWord : function () {
			//console.log ($.caretPos($('#patient-history-edit textarea').get(0)));			
			var txt = new String($('#patient-history-edit textarea').first().val());
			var _tmpResult;
			if (txt.substr(txt.length-1,1) == ' ' || txt.charAt(txt.length-1)==10) {
				_tmpResult = '';	
			} else {
				_tmpResult = findLastWord(txt);
			}
			
			console.log ('break at '+_tmpResult);
			if (_tmpResult!='') {
				dao.findSuggestionWord (_tmpResult,function (data) {
					PatientHistoryPage.setupSuggestion (data);
				},helpTypeId);
			} else {
				dao.findSuggestionType (helpTypeId,function (data) {//HX.
					PatientHistoryPage.setupSuggestion (data);
				});
			}
		},
		setSuggestionWord : function (note) {
			var _tmpArr = note.split(" ");
			if (_tmpArr.length>0) {
				for (var index=0; index < _tmpArr.length; index++) {
					if (_tmpArr[index]!='') {
						dao.setSuggestionWord (_tmpArr[index], function () {
							// notthing
							console.log ('setSuggestionWord: reload suggestion');
							dao.findSuggestionType (PatientHistoryPage.getHelpTypeId(),function (data) {//HX.
								PatientHistoryPage.setupSuggestion (data);
							});
						},helpTypeId);
					}
				}
			}
		}
	};
}();