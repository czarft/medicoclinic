///////////////////////////////////////////////////////////////////////////////
// Drnote PAGE 
/////////////////
var DrNotePage = function () {
	
	var drnote_page_id = "drnote-page";
	var drnoteItemHTMLElement;
	var drnoteHistoryItemHTMLElement;
	var currentHelpNote = null;
	var currentHelpNoteServiceId = 0;
	var currentServiceId = 0;
	var suggestionWordScroll;
	var wordSuggestObj;
	var helpTypeId = 5;
	
	return {
		getHelpTypeId: function () {
			return helpTypeId;
		},
		
		getPageId: function () {
			return drnote_page_id;
		},

		setup: function () {		
			if (typeof loaded_service ["drnote.html"]=='undefined') {		
				setupHistoryTab(drnote_page_id);
				var tmp = $("#"+drnote_page_id+" div.entry .tabs-content-present .history-list");		
				drnoteItemHTMLElement = $(tmp[0]).clone ();
				$(tmp).remove ();
				
				tmp = $("#"+drnote_page_id+" div.entry .tabs-content-recent .history-list");				
				drnoteHistoryItemHTMLElement = $(tmp[0]).clone ();
				$(tmp).remove ();
				
				loaded_service ["drnote.html"] = drnote_page_id;					
				DrNotePage.setupBindDrNotePage();
			}			
			$("#"+drnote_page_id+" .edit-icn").hide();		
			$('#drnote-section a:first').removeClass("trigger");	
			clearToolbar(); 
			$('#toolbar-drnote a').addClass('current');
				
			setupDeleteButton(drnote_page_id);	
			DrNotePage.getDrnoteItems();
		},
		
		setupBindDrNotePage: function () {
			setupClicksound (drnote_page_id) ;
			setupClicksound ('drnote-edit') ;
			
			$("#drnote-edit .drawing-icn").click (function(e){
				e.preventDefault();		
				e.stopPropagation ();
				openDrawing = true;
				DrNotePage.closeDrnoteEdit();
				$("#drawing-form input[name='visitId']").val (currentVisitId);
				$("#drawing-form input[name='type']").val (drnote_page_id);				 										
			}); 
			
			suggestionWordScroll =  new iScroll($("#drnote-edit aside div")[0], {
				momentum: true,
				hScrollbar: false,
				vScrollbar: true
			});
			
			$('#drnote-edit textarea').bind ("vmousemove", function(e){
				e.preventDefault();								    
			});
			
			
			$('#drnote-edit textarea').bind ("keyup", function(e){
				e.preventDefault();	
				delay(function(){ DrNotePage.searchWord ();  }, 500);								
			});
			
			$("#"+drnote_page_id+" .edit-icn").bind('click',function (e){
				e.preventDefault();	
				e.stopPropagation();
				console.log ('Edit : openDrnoteEdit');
				$('#drnote-edit textarea').val (currentHelpNote);		
				DrNotePage.openDrnoteEdit (); 
				$('#drnote-edit textarea').focus();
			});
			
			$("#"+drnote_page_id+" #title-page .add-icn").bind('click',function(e) {			
				e.preventDefault();	
				e.stopPropagation();
				console.log ('Add: openDrnoteEdit');
				DrNotePage.openDrnoteEdit (); 
				$('#drnote-edit textarea').focus();
			});
			
			$("#drnote-edit input:submit").bind ('vclick',function (e) {
				e.preventDefault();	
				e.stopPropagation();
				DrNotePage.setDrnoteItems(currentHelpNoteServiceId, $("#drnote-edit textarea").val(), currentServiceId);
			});
			
			$("#drnote-edit input:reset").bind('vclick',function(e) {
				e.preventDefault();
				e.stopPropagation();
				$("#"+drnote_page_id+" .edit-icn").hide();
				$("#"+drnote_page_id+" .edit-btn").hide();
				$("#"+drnote_page_id+" .add-icn").show();
				DrNotePage.closeDrnoteEdit (); 
				DrNotePage.clearTrigger();
			});
		
			
			$("#"+drnote_page_id+" #tabs .recent").bind('vclick', function(e) {
				e.preventDefault();
				DrNotePage.getDrnoteHistoryItems();		
			});
			
			$('#drnote-edit').bind({
			   popupafterclose: function(event, ui) { 
			   		console.log ('drnote-edit event popupafterclose ');
			   		$('#drnote-edit textarea').val ("");
					currentHelpNote = null;
					currentHelpNoteServiceId = null;
					currentServiceId = 0;			
					$('#drnote-edit textarea').blur();
					openDrawingTool ();
			   }
			});
			
		},
		
		clearTrigger : function () {
			$("#"+drnote_page_id+" div.entry .history-list").each (function () {
				$(this).find('a').first().removeClass("trigger");
				$(this).find('.delete-btn').first().hide();
			});
		},
		
		closeDrnoteEdit: function () {				
			$('#drnote-edit').popup ('close');
		},
		
		openDrnoteEdit: function () {					 			 			
			$('#drnote-edit').popup ('open', {	x:0,
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
		
		getDrnoteItems: function () {
			if (currentQueueId >0) {
				$.mobile.loading ('show', {text: 'Loading drnote data...',textVisible: true,theme: 'a',html: ""});
				
				$("#"+drnote_page_id+" div.tabs-content-present .history-list").remove();
				$.ajax({
					type : "POST",
					url : __config['medico_url'] + __config['medico_summary'],		
					data : {
							method: 'drnote_data',							
							empId:employeeDS.EMP_ID,
							queueId: currentQueueId,
							type: drnote_page_id,
							patientId: currentPatientId,
							visitId: visitinfoDS[0].visitId,
							accountId: accountDS.ACCOUNT_ID,
							sessionId: sessionId},
					success : DrNotePage.getDrnoteItemsSuccess,
					error : DrNotePage.getDrnoteItemsFail,
					dataType : "json",
				});
			}
		},
		
		getDrnoteItemsSuccess: function  (data) {
			$.mobile.loading ('hide');
			if (typeof data == 'undefined' || data==null) return false;
			if (data.count > 0 && data.error_code=='0') {
			
				$.each (data.drnote, function (k,v){
					if (k!='count') {
						var elm = $(drnoteItemHTMLElement).clone();
						$(elm).find('.delete-btn').first().bind('vclick',function (e) {
							$(this).addClass ('trigger');
							DrNotePage.removeDrnoteItems(v.helpNoteServiceId);
						});
						
						$(elm).find('.edit-btn').first().bind('vclick',function (e) {
							e.preventDefault();	
							e.stopPropagation();
							console.log ('Edit : Drnote');
							$('#drnote-edit textarea').val (currentHelpNote);									
							DrNotePage.openDrnoteEdit();
							$('#drnote-edit textarea').focus().caretToEnd();
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
								$("#image-popup input[name='type']").val (drnote_page_id);
								openImagePopup();
							});
						} else {
							$(elm).find('a').first().bind ('vclick',function () {
								if ($(this).hasClass ('trigger')) {
									$(this).removeClass ('trigger');
									$(elm).find('.delete-btn').first().hide();
									$(elm).find('.edit-btn').first().hide();
									
									$("#"+drnote_page_id+" .edit-icn").hide();
									$("#"+drnote_page_id+" .add-icn").show();
									currentHelpNote = null;
									currentHelpNoteServiceId = null;
									currentServiceId = null;
								} else {
									$(this).addClass ('trigger');
									$(elm).find('.delete-btn').first().show();
									$(elm).find('.edit-btn').first().show();
									
									$("#"+drnote_page_id+" .edit-icn").hide();
									$("#"+drnote_page_id+" .add-icn").hide();
									currentHelpNote = data.drnote_text[k].helpNote;
									currentHelpNoteServiceId = v.helpNoteServiceId;
									currentServiceId = v.serviceId;
								}							
							});
						}
						$(elm).appendTo('#'+drnote_page_id+' div.entry .tabs-content-present');
						setupNewDeleteButton(elm);
					}
					$('#'+drnote_page_id+' #tabs ul>li.present').trigger('click');
				});
				$('#'+drnote_page_id+' .recent-present >ul').show ();
				
			} else {
				DrNotePage.openDrnoteEdit();
				$('#drnote-edit textarea').focus();
			}
		},
		
		getDrnoteItemsFail: function ()  {
			alert("Fail get data.");
			$.mobile.loading ('hide');	
		},
		
		removeDrnoteItems: function (helpNoteServiceId) {
			
			console.log ("removeDrnoteItems "+ helpNoteServiceId);
			$.ajax({
				type : "POST",
				url : __config['medico_url'] + __config['medico_summary'],		
				data : {
						method: 'drnote_delete',		
						data: {helpNoteServiceId:helpNoteServiceId},						
						empId:employeeDS.EMP_ID,
						queueId: currentQueueId,
						patientId: currentPatientId,
						visitId: visitinfoDS[0].visitId,
						accountId: accountDS.ACCOUNT_ID,
						sessionId: sessionId},
				success : DrNotePage.removeDrnoteItemsSuccess,
				error : DrNotePage.removeDrnoteItemsFail,
				dataType : "json",
			});
		},
		
		removeDrnoteItemsSuccess: function (data,resultcode) {
			$.mobile.loading ('hide');
			DrNotePage.getDrnoteItems();
			$("#"+drnote_page_id+" .edit-icn").hide();
			$("#"+drnote_page_id+" .edit-btn").hide();
			$("#"+drnote_page_id+" .add-icn").show();
			currentHelpNote = null;
			currentHelpNoteServiceId = null;
			currentServiceId = 0;
		},
		
		removeDrnoteItemsFail: function  (data,resultcode) {	
			alert ('Drnote Set Fail. ');
			$.mobile.loading ('hide');	
			$("#"+drnote_page_id+" .edit-icn").hide();
			$("#"+drnote_page_id+" .edit-btn").hide();
			$("#"+drnote_page_id+" .add-icn").show();
			currentHelpNote = null;
			currentHelpNoteServiceId = null;
			currentServiceId = 0;
		},
		
		setDrnoteItems: function  (id, note, serviceId) {
			console.log("INSERT PATIENT HX "+id+" "+note);
			
			if (note !='') {
				$.mobile.loading ('show', {text: 'Save Patient Hx. data...',textVisible: true,theme: 'a',html: ""});
				DrNotePage.setSuggestionWord (note);
				$.ajax({
					type : "POST",
					url : __config['medico_url'] + __config['medico_summary'],		
					data : {
							method: 'drnote_set',
							data: {helpNoteServiceId:id, helpNote: note, serviceId: serviceId, helpTypeId: helpTypeId},				
							empId:employeeDS.EMP_ID,
							queueId: currentQueueId,
							visitId: visitinfoDS[0].visitId,
							patientId: currentPatientId,
							accountId: accountDS.ACCOUNT_ID,
							sessionId: sessionId},
					success : DrNotePage.setDrnoteItemsSuccess,
					error : DrNotePage.setDrnoteItemsFail,
					dataType : "json",
				});
			}		
		},
		
		setDrnoteItemsSuccess: function  (data,resultcode) {			
			$.mobile.loading ('hide');
			$("#"+drnote_page_id+" .edit-icn").hide();
			$("#"+drnote_page_id+" .edit-btn").hide();
			$("#"+drnote_page_id+" .add-icn").show();
			DrNotePage.closeDrnoteEdit();
			DrNotePage.getDrnoteItems();
		},
		
		setDrnoteItemsFail: function  (data,resultcode) {
			$("#"+drnote_page_id+" .edit-icn").hide();
			$("#"+drnote_page_id+" .edit-btn").hide();
			$("#"+drnote_page_id+" .add-icn").show();
			DrNotePage.closeDrnoteEdit();
			alert ('Drnote Set Fail. ')
		},
		
		
		getDrnoteHistoryItems: function () {
			$.mobile.loading ('show', {text: 'Loading drnote history data...',textVisible: true,theme: 'a',html: ""});
			
			$("#"+drnote_page_id+" div.tabs-content-recent .history-list").remove();
			$.ajax({
				type : "POST",
				url : __config['medico_url'] + __config['medico_summary'],		
				data : {
						method: 'drnote_history_data',							
						empId:employeeDS.EMP_ID,
						queueId: currentQueueId,
						patientId: currentPatientId,						
						accountId: accountDS.ACCOUNT_ID,
						sessionId: sessionId},
				success : DrNotePage.getDrnoteHistoryItemsSuccess,
				error : DrNotePage.getDrnoteHistoryItemsFail,
				dataType : "json",
			});
		},
		
		getDrnoteHistoryItemsSuccess: function  (data) {
			$.mobile.loading ('hide');
			if (data.count > 0 && data.error_code=='0') {
			
				$.each (data.drnote, function (k,v){
					if (k!='count') {
						var elm = $(drnoteHistoryItemHTMLElement).clone();
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
						$(elm).appendTo('#'+drnote_page_id+' div.entry .tabs-content-recent');						
					}					
				});

			} else {
				console.log("Zero ItemsLoading.");
			}
		},
		
		getDrnoteHistoryItemsFail: function ()  {
			alert("Fail get data.");
			$.mobile.loading ('hide');	
		},
		setupSuggestion: function (data) {
			if (typeof wordSuggestObj=='undefined') {
				wordSuggestObj = $('#drnote-edit aside ul li').first().clone();
			}
			
			$('#drnote-edit aside ul li').remove();
			if (data.length > 0) {
				$.each (data, function (k,v){
					var elm = $(wordSuggestObj).clone();					
					$(elm).find ('a').first().html (v.word);
					$(elm).find ('a').click (function (e) {
						e.preventDefault();	
						e.stopPropagation();			
						var lastTxt = findLastWord($('#drnote-edit textarea').first().val());
						var tmpTxt;
						if (lastTxt!='' &&  v.word.indexOf (lastTxt)===0) {
							tmpTxt = replaceLastWord ($('#drnote-edit textarea').first().val(),  v.word);							 
						}  else {
							tmpTxt = $('#drnote-edit textarea').val ()+" "+v.word;
						}
						$('#drnote-edit textarea').val (tmpTxt);	
						$('#drnote-edit textarea').focus();  
						DrNotePage.searchWord();
					});
					$(elm).appendTo('#drnote-edit aside ul');
				});
			}
		},
		
		searchWord : function () {
			var txt = new String($('#drnote-edit textarea').first().val());			
			if (txt.substr(txt.length-1,1) == ' ' || txt.charAt(txt.length-1)==10) {
				_tmpResult = '';	
			} else {
				_tmpResult = findLastWord(txt);
			}
			console.log ('break at '+_tmpResult);
			if (_tmpResult!='') {
				dao.findSuggestionWord (_tmpResult,function (data) {
					DrNotePage.setupSuggestion (data);
				},helpTypeId);
			} else {
				dao.findSuggestionType (helpTypeId,function (data) {//HX.
					DrNotePage.setupSuggestion (data);
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
							dao.findSuggestionType (DrNotePage.getHelpTypeId(),function (data) {//HX.
								DrNotePage.setupSuggestion (data);
							});
						},helpTypeId);
					}
				}
			}
		}
		
	};
}();
