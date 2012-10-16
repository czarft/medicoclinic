///////////////////////////////////////////////////////////////////////////////
// Present illness PAGE 
/////////////////

var PresentIllnessPage = function () {
	
	var currentOrientation;
	var present_illness_page_id = "present-illness-page";
	var presentIllnessItemHTMLElement;
	var presentIllnessHistoryItemHTMLElement;
	var currentHelpNote = null;
	var currentHelpNoteServiceId = 0;
	var currentServiceId = 0;
	var suggestionWordScroll;
	var wordSuggestObj;
	var helpTypeId = 1;
	
	return {
		getHelpTypeId: function () {
			return helpTypeId;
		},
		getPageId: function () {
			return present_illness_page_id;
		},
		setup: function () {		
			if (typeof loaded_service ["present-illness.html"]=='undefined') {		
				setupHistoryTab(present_illness_page_id);
				var tmp = $("#"+present_illness_page_id+" div.entry .tabs-content-present .history-list");		
				presentIllnessItemHTMLElement = $(tmp[0]).clone ();
				$(tmp).remove ();
				
				tmp = $("#"+present_illness_page_id+" div.entry .tabs-content-recent .history-list");
				presentIllnessHistoryItemHTMLElement =  $(tmp[0]).clone ();
				$(tmp).remove ();
				
				loaded_service ["present-illness.html"] = present_illness_page_id;					
				PresentIllnessPage.setupBindPresentIllnessPage();
			}			
			$("#"+present_illness_page_id+" .edit-icn").hide();		
			$('#present-illness-section a:first').removeClass("trigger");	
			clearToolbar(); 
			$('#toolbar-present-illness a').addClass('current');
				
			setupDeleteButton(present_illness_page_id);	
			PresentIllnessPage.getPresentIllnessItems();
		},
		
		setupBindPresentIllnessPage: function () {
			setupClicksound (present_illness_page_id) ;
			setupClicksound ('present-illness-edit') ;
			
			$("#present-illness-edit .drawing-icn").click (function(e){
				e.preventDefault();		
				e.stopPropagation ();
				openDrawing = true;
				PresentIllnessPage.closePresentIllnessEdit();
				$("#drawing-form input[name='visitId']").val (currentVisitId);
				$("#drawing-form input[name='type']").val (present_illness_page_id);				 										
			}); 
			
			$(window).bind( 'orientationchange', function(e){  			 
				PresentIllnessPage.closePresentIllnessEdit();			  
			});
			
			suggestionWordScroll =  new iScroll($("#present-illness-edit aside div")[0], {
				momentum: true,
				hScrollbar: false,
				vScrollbar: true
			});
			
			$('#present-illness-edit textarea').bind ("vmousemove", function(e){
				e.preventDefault();								    
			});

			
			$('#present-illness-edit textarea').bind ("keyup", function(e){
				e.preventDefault();	
				delay(function(){ PresentIllnessPage.searchWord ();  }, 500);					
				
			});
			
			$("#"+present_illness_page_id+" .edit-icn").bind('click',function (e){
				e.preventDefault();	
				e.stopPropagation();
				console.log ('Edit : openPresentIllnessEdit');
				$('#present-illness-edit textarea').val (currentHelpNote);		
				PresentIllnessPage.openPresentIllnessEdit (); 
				$('#present-illness-edit textarea').focus();
			});
			
			$("#"+present_illness_page_id+" #title-page .add-icn").bind('click',function(e) {			
				e.preventDefault();	
				e.stopPropagation();
				console.log ('Add: openPresentIllnessEdit');
				PresentIllnessPage.openPresentIllnessEdit (); 
				$('#present-illness-edit textarea').focus();
			});
			
			$("#present-illness-edit input:submit").bind ('click',function (e) {
				e.preventDefault();	
				e.stopPropagation();
				PresentIllnessPage.setPresentIllnessItems(currentHelpNoteServiceId, $("#present-illness-edit textarea").val(), currentServiceId);
			});
			
			$("#present-illness-edit input:reset").bind('click',function(e) {
				e.preventDefault();
				e.stopPropagation();
				$("#"+present_illness_page_id+" .edit-icn").hide();
				$("#"+present_illness_page_id+" .edit-btn").hide();
				$("#"+present_illness_page_id+" .add-icn").show();
				PresentIllnessPage.closePresentIllnessEdit (); 
				PresentIllnessPage.clearTrigger();
			});
			
			$("#"+present_illness_page_id+" #tabs .recent").bind('vclick', function(e) {
				e.preventDefault();
				
				PresentIllnessPage.getPresentIllnessHistoryItems();		
			});
			
			
			$('#present-illness-edit').bind({
			   popupafterclose: function(event, ui) { 
			   		console.log ('present-illness-edit event popupafterclose ');
			   		if (currentOrientation == window.orientation) {		   		
						PresentIllnessPage.clearInput();			
					}
			   				
					$('#present-illness-edit textarea').blur();
					openDrawingTool ();
			   }
			});
		},
		
		clearInput : function () {
			$('#present-illness-edit textarea').val ("");
			currentHelpNote = null;
			currentHelpNoteServiceId = null;
			currentServiceId = 0;	
		},
		
		clearTrigger : function () {
			$("#"+present_illness_page_id+" div.entry .history-list").each (function () {
				$(this).find('a').first().removeClass("trigger");
				$(this).find('.delete-btn').first().hide();
			});
		},
		
		closePresentIllnessEdit: function () {	
			$('#present-illness-edit').popup ('close');		
		},
				
		
		openPresentIllnessEdit: function () {	
			currentOrientation = window.orientation;	 		 			 
			$('#present-illness-edit').popup ('open', {	x:0,
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
		
		getPresentIllnessItems: function () {
			if (currentQueueId>0) {
				$.mobile.loading ('show', {text: 'Loading Present illness data...',textVisible: true,theme: 'a',html: ""});
				
				$("#"+present_illness_page_id+" div.tabs-content-present .history-list").remove();
				$.ajax({
					type : "POST",
					url : __config['medico_url'] + __config['medico_summary'],		
					data : {
							method: 'present_illness_data',							
							empId:employeeDS.EMP_ID,
							queueId: currentQueueId,
							type: present_illness_page_id,
							patientId: currentPatientId,
							visitId: visitinfoDS[0].visitId,
							accountId: accountDS.ACCOUNT_ID,
							sessionId: sessionId},
					success : PresentIllnessPage.getPresentIllnessItemsSuccess,
					error : PresentIllnessPage.getPresentIllnessItemsFail,
					dataType : "json",
				});
			}
		},
		
		getPresentIllnessItemsSuccess: function  (data) {
			$.mobile.loading ('hide');
			if (typeof data == 'undefined' || data==null) return false;
			if (data.count > 0 && data.error_code=='0') {
			
				$.each (data.presentillness, function (k,v){
					if (k!='count') {
						var elm = $(presentIllnessItemHTMLElement).clone();
						$(elm).find('.delete-btn').first().bind('vclick',function (e) {
							$(this).addClass ('trigger');
							PresentIllnessPage.removePresentIllnessItems(v.helpNoteServiceId);
						});
						$(elm).find('.edit-btn').first().bind('vclick',function (e) {
							e.preventDefault();	
							e.stopPropagation();
							console.log ('Edit : openPresent Illness');
							$('#present-illness-edit textarea').val (currentHelpNote);		
							PresentIllnessPage.openPresentIllnessEdit(); 
							$('#present-illness-edit textarea').focus().caretToEnd();
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
								$("#image-popup input[name='type']").val (present_illness_page_id);
								openImagePopup();
							});
						} else {
							$(elm).find('a').first().bind ('vclick',function () {
								if ($(this).hasClass ('trigger')) {
									$(this).removeClass ('trigger');
									$(elm).find('.delete-btn').first().hide();
									$(elm).find('.edit-btn').first().hide();									
									$("#"+present_illness_page_id+" .add-icn").show();
									currentHelpNote = null;
									currentHelpNoteServiceId = null;
									currentServiceId = null;
								} else {
									$(this).addClass ('trigger');
									$(elm).find('.delete-btn').first().show();
									$(elm).find('.edit-btn').first().show();
									
									$("#"+present_illness_page_id+" .edit-icn").hide();
									$("#"+present_illness_page_id+" .add-icn").hide();
									currentHelpNote = data.presentillness_text[k].helpNote;
									currentHelpNoteServiceId = v.helpNoteServiceId;
									currentServiceId = v.serviceId;
								}							
							});
						}
						$(elm).appendTo('#'+present_illness_page_id+' div.entry .tabs-content-present');
						setupNewDeleteButton(elm);
					}
					$('#'+present_illness_page_id+' #tabs ul>li.present').trigger('click');
				});
				$('#'+present_illness_page_id+' .recent-present >ul').show ();
				
			} else {
				PresentIllnessPage.openPresentIllnessEdit();
				$('#present-illness-edit textarea').focus();
			}
		},
		
		getPresentIllnessItemsFail: function ()  {
			alert("Fail get data.");
			$.mobile.loading ('hide');	
		},
		
		removePresentIllnessItems: function (helpNoteServiceId) {
			
			console.log ("removePresentIllnessItems "+ helpNoteServiceId);
			$.ajax({
				type : "POST",
				url : __config['medico_url'] + __config['medico_summary'],		
				data : {
						method: 'present_illness_delete',		
						data: {helpNoteServiceId:helpNoteServiceId},						
						empId:employeeDS.EMP_ID,
						queueId: currentQueueId,
						patientId: currentPatientId,
						visitId: visitinfoDS[0].visitId,
						accountId: accountDS.ACCOUNT_ID,
						sessionId: sessionId},
				success : PresentIllnessPage.removePresentIllnessItemsSuccess,
				error : PresentIllnessPage.removePresentIllnessItemsFail,
				dataType : "json",
			});
		},
		
		removePresentIllnessItemsSuccess: function (data,resultcode) {
			$.mobile.loading ('hide');
			PresentIllnessPage.getPresentIllnessItems();
			$("#"+present_illness_page_id+" .edit-icn").hide();
			$("#"+present_illness_page_id+" .edit-btn").hide();
			$("#"+present_illness_page_id+" .add-icn").show();
			currentHelpNote = null;
			currentHelpNoteServiceId = null;
			currentServiceId = 0;
		},
		
		removePresentIllnessItemsFail: function  (data,resultcode) {	
			alert ('PresentIllness Set Fail. ');
			$.mobile.loading ('hide');	
			$("#"+present_illness_page_id+" .edit-icn").hide();
			$("#"+present_illness_page_id+" .edit-btn").hide();
			$("#"+present_illness_page_id+" .add-icn").show();
			currentHelpNote = null;
			currentHelpNoteServiceId = null;
			currentServiceId = 0;
		},
		
		setPresentIllnessItems: function  (id, note, serviceId) {
			console.log("INSERT Present Illness "+id+" "+note);
			
			if (note !='') {
				$.mobile.loading ('show', {text: 'Save Present illness. data...',textVisible: true,theme: 'a',html: ""});
				PresentIllnessPage.setSuggestionWord (note);
				$.ajax({
					type : "POST",
					url : __config['medico_url'] + __config['medico_summary'],		
					data : {
							method: 'present_illness_set',
							data: {helpNoteServiceId:id, helpNote: note, serviceId: serviceId, helpTypeId: helpTypeId},				
							empId:employeeDS.EMP_ID,
							queueId: currentQueueId,
							visitId: visitinfoDS[0].visitId,
							patientId: currentPatientId,
							accountId: accountDS.ACCOUNT_ID,
							sessionId: sessionId},
					success : PresentIllnessPage.setPresentIllnessItemsSuccess,
					error : PresentIllnessPage.setPresentIllnessItemsFail,
					dataType : "json",
				});
			}		
		},
		
		setPresentIllnessItemsSuccess: function  (data,resultcode) {			
			$.mobile.loading ('hide');
			$("#"+present_illness_page_id+" .edit-icn").hide();
			$("#"+present_illness_page_id+" .edit-btn").hide();
			$("#"+present_illness_page_id+" .add-icn").show();
			PresentIllnessPage.closePresentIllnessEdit();
			PresentIllnessPage.getPresentIllnessItems();
		},
		
		setPresentIllnessItemsFail: function  (data,resultcode) {
			$("#"+present_illness_page_id+" .edit-icn").hide();
			$("#"+present_illness_page_id+" .edit-btn").hide();	
			$("#"+present_illness_page_id+" .add-icn").show();
			PresentIllnessPage.closePresentIllnessEdit();
			alert ('PresentIllness Set Fail. ')
		},
		
		getPresentIllnessHistoryItems: function () {
			$.mobile.loading ('show', {text: 'Loading present illness history data...',textVisible: true,theme: 'a',html: ""});
			
			$("#"+present_illness_page_id+" div.tabs-content-recent .history-list").remove();
			$.ajax({
				type : "POST",
				url : __config['medico_url'] + __config['medico_summary'],		
				data : {
						method: 'present_illness_history_data',							
						empId:employeeDS.EMP_ID,
						queueId: currentQueueId,
						patientId: currentPatientId,						
						accountId: accountDS.ACCOUNT_ID,
						sessionId: sessionId},
				success : PresentIllnessPage.getPresentIllnessHistoryItemsSuccess,
				error : PresentIllnessPage.getPresentIllnessHistoryItemsFail,
				dataType : "json",
			});
		},
		
		getPresentIllnessHistoryItemsSuccess: function  (data) {
			$.mobile.loading ('hide');
			if (data.count > 0 && data.error_code=='0') {
			
				$.each (data.presentillness, function (k,v){
					if (k!='count') {
						
						var elm = $(presentIllnessHistoryItemHTMLElement).clone();
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
						$(elm).appendTo('#'+present_illness_page_id+' div.entry .tabs-content-recent');						
					}					
				});

			} else {
				console.log("Zero ItemsLoading.");
			}
		},
		
		getPresentIllnessHistoryItemsFail: function ()  {
			alert("Fail get data.");
			$.mobile.loading ('hide');	
		},
		setupSuggestion: function (data) {
			if (typeof wordSuggestObj=='undefined') {
				wordSuggestObj = $('#present-illness-edit aside ul li').first().clone();
			}
			
		
			$('#present-illness-edit aside ul li').remove();
			if (data.length > 0) {
				$.each (data, function (k,v){
					var elm = $(wordSuggestObj).clone();					
					$(elm).find ('a').first().html (v.word);
					$(elm).find ('a').click (function (e) {
						e.preventDefault();	
						e.stopPropagation();			
						var lastTxt = findLastWord($('#present-illness-edit textarea').first().val());
						var tmpTxt;
						if (lastTxt!='' &&  v.word.indexOf (lastTxt)===0) {
							tmpTxt = replaceLastWord ($('#present-illness-edit textarea').first().val(),  v.word);							 
						}  else {
							tmpTxt = $('#present-illness-edit textarea').val ()+" "+v.word;
						}	
						$('#present-illness-edit textarea').val (tmpTxt);	
						$('#present-illness-edit textarea').focus();  
						PresentIllnessPage.searchWord();
					});
					$(elm).appendTo('#present-illness-edit aside ul');
				});
			}
		},
		
		searchWord : function () {
			//console.log ($.caretPos($('#patient-history-edit textarea').get(0)));				
			var txt = new String($('#present-illness-edit textarea').first().val());			
			if (txt.substr(txt.length-1,1) == ' ' || txt.charAt(txt.length-1)==10) {
				_tmpResult = '';	
			} else {
				_tmpResult = findLastWord(txt);
			}
			console.log ('break at '+_tmpResult);
			
			if (_tmpResult!='') {
				dao.findSuggestionWord (_tmpResult,function (data) {
					PresentIllnessPage.setupSuggestion (data);
				},helpTypeId);
			} else {
				dao.findSuggestionType (helpTypeId,function (data) {//HX.
					PresentIllnessPage.setupSuggestion (data);
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
							dao.findSuggestionType (PresentIllnessPage.getHelpTypeId(),function (data) {//HX.
								PresentIllnessPage.setupSuggestion (data);
							});
						},helpTypeId);
					}
				}
			}
		}
	};
}();

