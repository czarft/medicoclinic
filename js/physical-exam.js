///////////////////////////////////////////////////////////////////////////////
// Present illness PAGE 
/////////////////

var PhysicalExamPage = function () {
	var currentOrientation;
	var physical_exam_page_id = "physical-exam-page";
	var physicalExamItemHTMLElement;
	var physicalExamHistoryItemHTMLElement;
	var currentHelpNote = null;
	var currentHelpNoteServiceId = 0;
	var currentServiceId = 0;
	var suggestionWordScroll;
	var wordSuggestObj;
	var helpTypeId = 3;
	
	return {
		getHelpTypeId: function () {
			return helpTypeId;
		},
		getPageId: function () {
			return physical_exam_page_id;
		},
		setup: function () {		
			if (typeof loaded_service ["physical-exam.html"]=='undefined') {		
				setupHistoryTab(physical_exam_page_id);
				
				var tmp = $("#"+physical_exam_page_id+" div.entry .tabs-content-present .history-list");		
				physicalExamItemHTMLElement = $(tmp[0]).clone ();
				$(tmp).remove ();
				
				tmp = $("#"+physical_exam_page_id+" div.entry .tabs-content-recent .history-list");
				physicalExamHistoryItemHTMLElement =   $(tmp[0]).clone ();
				$(tmp).remove ();
				
				loaded_service ["physical-exam.html"] = physical_exam_page_id;					
				PhysicalExamPage.setupBindPhysicalExamPage();
			}			
			$("#"+physical_exam_page_id+" .edit-icn").hide();		
			$('#physical-exam-section a:first').removeClass("trigger");	
			clearToolbar(); 
			$('#toolbar-physical-exam a').addClass('current');
				
			setupDeleteButton(physical_exam_page_id);	
			PhysicalExamPage.getPhysicalExamItems();
		},
		
		setupBindPhysicalExamPage: function () {
			setupClicksound (physical_exam_page_id) ;
			setupClicksound ('physical-exam-edit') ;
			
			$("#physical-exam-edit .drawing-icn").click (function(e){
				e.preventDefault();		
				e.stopPropagation ();
				openDrawing = true;
				PhysicalExamPage.closePhysicalExamEdit();
				$("#drawing-form input[name='visitId']").val (currentVisitId);
				$("#drawing-form input[name='type']").val (physical_exam_page_id);				 										
			}); 


			suggestionWordScroll =  new iScroll($("#physical-exam-edit aside div")[0], {
				momentum: true,
				hScrollbar: false,
				vScrollbar: true
			});
			
			$('#physical-exam-edit textarea').bind ("vmousemove", function(e){
				e.preventDefault();								    
			});

			
			$('#physical-exam-edit textarea').bind ("keyup", function(e){
				e.preventDefault();	
				delay(function(){ PhysicalExamPage.searchWord ();  }, 500);								
			});
			
			$("#"+physical_exam_page_id+" .edit-icn").bind('click',function (e){
				e.preventDefault();	
				e.stopPropagation();
				console.log ('Edit : openPhysicalExamEdit');
				$('#physical-exam-edit textarea').val (currentHelpNote);		
				PhysicalExamPage.openPhysicalExamEdit (); 
				$('#physical-exam-edit textarea').focus();
			});
			
			$("#"+physical_exam_page_id+" #title-page .add-icn").bind('click',function(e) {			
				e.preventDefault();	
				e.stopPropagation();
				console.log ('Add: openPhysicalExamEdit');
				PhysicalExamPage.openPhysicalExamEdit (); 
				$('#physical-exam-edit textarea').focus();
			});
			
			$("#physical-exam-edit input:submit").bind ('click',function (e) {
				e.preventDefault();	
				e.stopPropagation();
				PhysicalExamPage.setPhysicalExamItems(currentHelpNoteServiceId, $("#physical-exam-edit textarea").val(), currentServiceId);
			});
			
			$("#physical-exam-edit input:reset").bind('click',function(e) {
				e.preventDefault();
				e.stopPropagation();
				$("#"+physical_exam_page_id+" .edit-icn").hide();
				$("#"+physical_exam_page_id+" .edit-btn").hide();
				$("#"+physical_exam_page_id+" .add-icn").show();
				PhysicalExamPage.closePhysicalExamEdit (); 
				PhysicalExamPage.clearTrigger();
			});
			
			$("#physical-exam-edit aside ul>li a").bind ('vclick', function (e) {
				e.preventDefault();	
				e.stopPropagation();			
				var tmpTxt = $('#physical-exam-edit textarea').val ()+" "+$(this).text ();
				$('#physical-exam-edit textarea').val (tmpTxt);	
				$('#physical-exam-edit textarea').focus();  
			});
			
			$("#"+physical_exam_page_id+" #tabs .recent").bind('vclick', function(e) {
				e.preventDefault();
				PhysicalExamPage.getPhysicalExamHistoryItems();		
			});
			
			
			$(window).bind( 'orientationchange', function(e){  			 
				PhysicalExamPage.closePhysicalExamEdit();			  
			});
			
			$('#physical-exam-edit').bind({
			   popupafterclose: function(event, ui) { 
			   		console.log ('physical-exam-edit event popupafterclose ');		
			   		if (currentOrientation == window.orientation) {		   		
						PhysicalExamPage.clearInput();			
					}	   				
					$('#physical-exam-edit textarea').blur();
					openDrawingTool ();
			   }
			});
		},
		clearInput: function () {
			$('#physical-exam-edit textarea').val ("");
			currentHelpNote = null;
			currentHelpNoteServiceId = null;
			currentServiceId = 0;
		},
		
		clearTrigger : function () {
			$("#"+physical_exam_page_id+" div.entry .history-list").each (function () {
				$(this).find('a').first().removeClass("trigger");
				$(this).find('.delete-btn').first().hide();
			});
		},
		
		closePhysicalExamEdit: function () {	
			$('#physical-exam-edit').popup ('close');			
		},		
		
		
		openPhysicalExamEdit: function () {	
			currentOrientation = window.orientation;				 			
			$('#physical-exam-edit').popup ('open', {	x:0,
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
		
		getPhysicalExamItems: function () {
			if (currentQueueId>0) {
				$.mobile.loading ('show', {text: 'Loading Present Examination data...',textVisible: true,theme: 'a',html: ""});
				
				$("#"+physical_exam_page_id+" div.entry .history-list").remove();
				$.ajax({
					type : "POST",
					url : __config['medico_url'] + __config['medico_summary'],		
					data : {
							method: 'physical_exam_data',							
							empId:employeeDS.EMP_ID,
							queueId: currentQueueId,
							type: physical_exam_page_id,
							patientId: currentPatientId,
							visitId: visitinfoDS[0].visitId,
							accountId: accountDS.ACCOUNT_ID,
							sessionId: sessionId},
					success : PhysicalExamPage.getPhysicalExamItemsSuccess,
					error : PhysicalExamPage.getPhysicalExamItemsFail,
					dataType : "json",
				});
			}
		},
		
		getPhysicalExamItemsSuccess: function  (data) {
			$.mobile.loading ('hide');
			if (typeof data == 'undefined' || data==null) return false;
			if (data.count > 0 && data.error_code=='0') {
			
				$.each (data.physicalexam, function (k,v){
					if (k!='count') {
						var elm = $(physicalExamItemHTMLElement).clone();
						$(elm).find('.delete-btn').first().bind('vclick',function (e) {
							$(this).addClass ('trigger');
							PhysicalExamPage.removePhysicalExamItems(v.helpNoteServiceId);
						});
						$(elm).find('.edit-btn').first().bind('vclick',function (e) {
							e.preventDefault();	
							e.stopPropagation();
							console.log ('Edit : openPhysical Exam');
							$('#physical-exam-edit textarea').val (currentHelpNote);		
							PhysicalExamPage.openPhysicalExamEdit(); 
							$('#physical-exam-edit textarea').focus().caretToEnd();
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
								$("#image-popup input[name='type']").val (physical_exam_page_id);
								openImagePopup();
							});
						} else {
							$(elm).find('a').first().bind ('vclick',function () {
								if ($(this).hasClass ('trigger')) {
									$(this).removeClass ('trigger');
									$(elm).find('.delete-btn').first().hide();
									$(elm).find('.edit-btn').first().hide();									
									$("#"+physical_exam_page_id+" .add-icn").show();
									currentHelpNote = null;
									currentHelpNoteServiceId = null;
									currentServiceId = null;
								} else {
									$(this).addClass ('trigger');
									$(elm).find('.delete-btn').first().show();
									$(elm).find('.edit-btn').first().show();
									$("#"+physical_exam_page_id+" .edit-icn").hide();
									$("#"+physical_exam_page_id+" .add-icn").hide();
									currentHelpNote = data.physicalexam_text[k].helpNote;
									currentHelpNoteServiceId = v.helpNoteServiceId;
									currentServiceId = v.serviceId;
								}							
							});
						}
						$(elm).appendTo('#'+physical_exam_page_id+' div.entry .tabs-content-present');
						setupNewDeleteButton(elm);
					}
					$('#'+physical_exam_page_id+' #tabs ul>li.present').trigger('click');
				});
				$('#'+physical_exam_page_id+' .recent-present >ul').show ();
				
			} else {
				PhysicalExamPage.openPhysicalExamEdit();
				$('#physical-exam-edit textarea').focus();
			}
		},
		
		getPhysicalExamItemsFail: function ()  {
			alert("Fail get data.");
			$.mobile.loading ('hide');	
		},
		
		removePhysicalExamItems: function (helpNoteServiceId) {
			
			console.log ("removePhysicalExamItems "+ helpNoteServiceId);
			$.ajax({
				type : "POST",
				url : __config['medico_url'] + __config['medico_summary'],		
				data : {
						method: 'physical_exam_delete',		
						data: {helpNoteServiceId:helpNoteServiceId},						
						empId:employeeDS.EMP_ID,
						queueId: currentQueueId,
						patientId: currentPatientId,
						visitId: visitinfoDS[0].visitId,
						accountId: accountDS.ACCOUNT_ID,
						sessionId: sessionId},
				success : PhysicalExamPage.removePhysicalExamItemsSuccess,
				error : PhysicalExamPage.removePhysicalExamItemsFail,
				dataType : "json",
			});
		},
		
		removePhysicalExamItemsSuccess: function (data,resultcode) {
			$.mobile.loading ('hide');
			PhysicalExamPage.getPhysicalExamItems();
			$("#"+physical_exam_page_id+" .edit-icn").hide();
			$("#"+physical_exam_page_id+" .edit-btn").hide();
			$("#"+physical_exam_page_id+" .add-icn").show();
			currentHelpNote = null;
			currentHelpNoteServiceId = null;
			currentServiceId = 0;
		},
		
		removePhysicalExamItemsFail: function  (data,resultcode) {	
			alert ('PhysicalExam Set Fail. ');
			$.mobile.loading ('hide');	
			$("#"+physical_exam_page_id+" .edit-icn").hide();
			$("#"+physical_exam_page_id+" .edit-btn").hide();
			$("#"+physical_exam_page_id+" .add-icn").show();
			currentHelpNote = null;
			currentHelpNoteServiceId = null;
			currentServiceId = 0;
		},
		
		setPhysicalExamItems: function  (id, note, serviceId) {
			console.log("INSERT Physical Examination "+id+" "+note);
			
			if (note !='') {
				$.mobile.loading ('show', {text: 'Save Physical examination. data...', textVisible: true, theme: 'a',html: ""});
				PhysicalExamPage.setSuggestionWord (note);
				$.ajax({
					type : "POST",
					url : __config['medico_url'] + __config['medico_summary'],		
					data : {
							method: 'physical_exam_set',
							data: {helpNoteServiceId:id, helpNote: note, serviceId: serviceId, helpTypeId: helpTypeId},				
							empId:employeeDS.EMP_ID,
							queueId: currentQueueId,
							visitId: visitinfoDS[0].visitId,
							patientId: currentPatientId,
							accountId: accountDS.ACCOUNT_ID,
							sessionId: sessionId},
					success : PhysicalExamPage.setPhysicalExamItemsSuccess,
					error : PhysicalExamPage.setPhysicalExamItemsFail,
					dataType : "json",
				});
			}		
		},
		
		setPhysicalExamItemsSuccess: function  (data,resultcode) {			
			$.mobile.loading ('hide');
			$("#"+physical_exam_page_id+" .edit-icn").hide();
			$("#"+physical_exam_page_id+" .edit-btn").hide();
			$("#"+physical_exam_page_id+" .add-icn").show();
			PhysicalExamPage.closePhysicalExamEdit();
			PhysicalExamPage.getPhysicalExamItems();
		},
		
		setPhysicalExamItemsFail: function  (data,resultcode) {
			$("#"+physical_exam_page_id+" .edit-icn").hide();
			$("#"+physical_exam_page_id+" .edit-btn").hide();
			$("#"+physical_exam_page_id+" .add-icn").show();
			PhysicalExamPage.closePhysicalExamEdit();
			alert ('PhysicalExam Set Fail. ')
		},
		
		getPhysicalExamHistoryItems: function () {
			$.mobile.loading ('show', {text: 'Loading present illness history data...',textVisible: true,theme: 'a',html: ""});
			
			$("#"+physical_exam_page_id+" div.tabs-content-recent .history-list").remove();
			$.ajax({
				type : "POST",
				url : __config['medico_url'] + __config['medico_summary'],		
				data : {
						method: 'physical_exam_history_data',							
						empId:employeeDS.EMP_ID,
						queueId: currentQueueId,
						patientId: currentPatientId,						
						accountId: accountDS.ACCOUNT_ID,
						sessionId: sessionId},
				success : PhysicalExamPage.getPhysicalExamHistoryItemsSuccess,
				error : PhysicalExamPage.getPhysicalExamHistoryItemsFail,
				dataType : "json",
			});
		},
		
		getPhysicalExamHistoryItemsSuccess: function  (data) {
			$.mobile.loading ('hide');
			if (data.count > 0 && data.error_code=='0') {
			
				$.each (data.physicalexam, function (k,v){
					if (k!='count') {
						var elm = $(physicalExamHistoryItemHTMLElement).clone();
						if ( typeof v.files !='undefined' && v.files!='') {	
							$(elm).find('a').first().bind ('vclick',function (e) {
								e.preventDefault();	
								e.stopPropagation();
								$('#image-popup').find ('img').first().attr ('src',__config['image_path']+'/'+v.files);								
								$('#image-popup').popup ('open',{
									y:20,
									theme: 'a',
									overlayTheme: 'a',
									shadow: true,
									corners: false,							
									transition: "fade"							
									
								});
							});
						}								
						$(elm).find('h2').first().text (v.lastUpdate+" "+v.prefixName+" "+v.fname+" "+v.lname);
						$(elm).find('a>p').last().replaceWith (v.helpNote);						
						$(elm).appendTo('#'+physical_exam_page_id+' div.entry .tabs-content-recent');						
					}					
				});

			} else {
				console.log("Zero ItemsLoading.");
			}
		},
		
		getPhysicalExamHistoryItemsFail: function ()  {
			alert("Fail get data.");
			$.mobile.loading ('hide');	
		},
		
		setupSuggestion: function (data) {
			if (typeof wordSuggestObj=='undefined') {
				wordSuggestObj = $('#physical-exam-edit aside ul li').first().clone();
			}
			
			$('#physical-exam-edit aside ul li').remove();
			if (data.length > 0) {
				$.each (data, function (k,v){
					var elm = $(wordSuggestObj).clone();					
					$(elm).find ('a').first().html (v.word);
					$(elm).find ('a').click (function (e) {
						e.preventDefault();	
						e.stopPropagation();			
						var lastTxt = findLastWord($('#physical-exam-edit textarea').first().val());
						var tmpTxt;
						if (lastTxt!='' &&  v.word.indexOf (lastTxt)===0) {
							tmpTxt = replaceLastWord ($('#physical-exam-edit textarea').first().val(),  v.word);							 
						}  else {
							tmpTxt = $('#physical-exam-edit textarea').val ()+" "+v.word;
						}
						$('#physical-exam-edit textarea').val (tmpTxt);	
						$('#physical-exam-edit textarea').focus();  
						PhysicalExamPage.searchWord();
					});
					$(elm).appendTo('#physical-exam-edit aside ul');
				});
			}
		},
		
		searchWord : function () {
						
			var txt = new String($('#physical-exam-edit textarea').first().val());			
			if (txt.substr(txt.length-1,1) == ' ' || txt.charAt(txt.length-1)==10) {
				_tmpResult = '';	
			} else {
				_tmpResult = findLastWord(txt);
			}
			console.log ('break at '+_tmpResult);
			if (_tmpResult!='') {
				dao.findSuggestionWord (_tmpResult,function (data) {
					PhysicalExamPage.setupSuggestion (data);
				},helpTypeId);
			} else {
				dao.findSuggestionType (helpTypeId,function (data) {//HX.
					PhysicalExamPage.setupSuggestion (data);
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
							dao.findSuggestionType (PhysicalExamPage.getHelpTypeId(),function (data) {//HX.
								PhysicalExamPage.setupSuggestion (data);
							});
						},helpTypeId);
					}
				}
			}
		}
	};
}();

