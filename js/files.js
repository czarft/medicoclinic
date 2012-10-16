///////////////////////////////////////////////////////////////////////////////
// Files PAGE 
/////////////////
var FilesPage = function () {
	
	var files_page_id = "files-page";
	var filesItemHTMLElement;
	var filesHistoryItemHTMLElement;
	var bar;
	var percent;
	var status;
	
	return {
		getPageId: function () {
			return files_page_id;
		},

		setup: function () {		
			if (typeof loaded_service ["files.html"]=='undefined') {		
				setupHistoryTab(files_page_id);
				var tmp = $("#"+files_page_id+" div.entry .tabs-content-present .history-list");		
				filesItemHTMLElement = $(tmp[0]).clone ();
				$(tmp).remove ();
				
				tmp = $("#"+files_page_id+" div.entry .tabs-content-recent .history-list");				
				filesHistoryItemHTMLElement = $(tmp[0]).clone ();
				$(tmp).remove ();
				
				loaded_service ["files.html"] = files_page_id;					
				FilesPage.setupBindFiles();
			}			
			$("#"+files_page_id+" .edit-icn").hide();		
			$('#files-section a:first').removeClass("trigger");	
			clearToolbar(); 
			$('#toolbar-files a').addClass('current');
				
			setupDeleteButton(files_page_id);	
			FilesPage.getFilesItems();
		},
		
		setupBindFiles: function () {
			bar = $('.files-form-bar');
			percent = $('.files-form-percent');
			status = $('#files-form-status');
			
			setupClicksound (files_page_id) ;
			setupClicksound ('files-edit') ;
		
			   
			$('#files-form-edit').ajaxForm({
			    beforeSend: function() {
			        status.empty();
			        var percentVal = '0%';
			        bar.width(percentVal)
			        percent.html(percentVal);
			    },
			    uploadProgress: function(event, position, total, percentComplete) {
			        var percentVal = percentComplete + '%';
			        bar.width(percentVal)
			        percent.html(percentVal);
					console.log(percentVal, position, total);
			    },
				complete: function(xhr) {
					status.html(xhr.responseText);
				}
			}); 
		
		
			$('#files-edit textarea').bind ("vmousemove", function(e){
				e.preventDefault();								    
			});
			
			
			$("#"+files_page_id+" #title-page .add-icn").bind('click',function(e) {			
				e.preventDefault();	
				e.stopPropagation();
				console.log ('Add: openFilesEdit');
				FilesPage.openFilesEdit (); 
				$('#files-edit #files-note').focus();
			});
			
			$("#files-edit #files-save").bind ('vclick',function (e) {
				e.preventDefault();	
				e.stopPropagation();							
				FilesPage.setFilesItems();
			});
			
			$("#files-edit #files-cancel").bind('vclick',function(e) {
				e.preventDefault();
				e.stopPropagation();
				$("#"+files_page_id+" .edit-icn").hide();
				$("#"+files_page_id+" .edit-btn").hide();
				$("#"+files_page_id+" .add-icn").show();
				FilesPage.closeFilesEdit (); 
				FilesPage.clearTrigger();
			});			
			
			$("#"+files_page_id+" #tabs .recent").bind('vclick', function(e) {
				e.preventDefault();
				FilesPage.getFilesHistoryItems();		
			});
			
			$('#files-edit').bind({
			   popupafterclose: function(event, ui) { 
			   		console.log ('files-edit event popupafterclose ');
			   		$('#files-edit textarea').val ("");						
					$('#files-edit textarea').blur();					
			   }
			});
			
		},
		
		clearTrigger : function () {
			$("#"+files_page_id+" div.entry .history-list").each (function () {
				$(this).find('a').first().removeClass("trigger");
				$(this).find('.delete-btn').first().hide();
			});
		},
		
		closeFilesEdit: function () {				
			$('#files-edit').popup ('close');
		},
		
		openFilesEdit: function () {					 			 			
			$('#files-edit').popup ('open', {	
							theme: 'a',
							overlayTheme: 'a',
							shadow: true,
							corners: true,
							positionTo: 'window',
							transition: "slidedown"
			});
			
		},
		
		getFilesItems: function () {
			if (currentQueueId > 0) {
				$.mobile.loading ('show', {text: 'Loading files data...',textVisible: true,theme: 'a',html: ""});
				
				$("#"+files_page_id+" div.tabs-content-present .history-list").remove();
				$.ajax({
					type : "POST",
					url : __config['medico_url'] + __config['medico_summary'],		
					data : {
							method: 'files_data',							
							empId:employeeDS.EMP_ID,
							queueId: currentQueueId,
							type: files_page_id,
							patientId: currentPatientId,
							visitId: visitinfoDS[0].visitId,
							accountId: accountDS.ACCOUNT_ID,
							sessionId: sessionId},
					success : FilesPage.getFilesItemsSuccess,
					error : FilesPage.getFilesItemsFail,
					dataType : "json",
				});
			}
		},
		
		getFilesItemsSuccess: function  (data) {
			$.mobile.loading ('hide');
			if (typeof data == 'undefined' || data==null) return false;
			if (data.count > 0 && data.error_code=='0') {
			
				$.each (data.files, function (k,v){
					if (k!='count') {
						var elm = $(filesItemHTMLElement).clone();
						$(elm).find('.delete-btn').first().bind('vclick',function (e) {
							$(this).addClass ('trigger');
							FilesPage.removeFilesItems(v.patientImageId);
						});
						
						$(elm).find('.edit-btn').first().bind('vclick',function (e) {
							e.preventDefault();	
							e.stopPropagation();
							//window.open(__config['files_att']+"?sessionId="+sessionId+"&filesId="+v.filesId);
							window.open(__config['image_path']+'/'+v.files);
						});
						
						$(elm).find('h2').first().text (v.lastUpdate+" "+v.prefixName+" "+v.fname+" "+v.lname);
						$(elm).find('a>p').last().replaceWith (v.helpNote);
						$(elm).find('.delete-btn').hide();
						$(elm).find('.edit-btn').hide();
						
						$(elm).find('a').first().bind ('vclick',function () {
							if ($(this).hasClass ('trigger')) {
								$(this).removeClass ('trigger');
								$(elm).find('.delete-btn').first().hide();
								$(elm).find('.edit-btn').first().hide();								
								$("#"+files_page_id+" .edit-icn").hide();
								$("#"+files_page_id+" .add-icn").show();								
							} else {
								$(this).addClass ('trigger');
								$(elm).find('.delete-btn').first().show();
								$(elm).find('.edit-btn').first().show();
								
								$("#"+files_page_id+" .edit-icn").hide();
								$("#"+files_page_id+" .add-icn").hide();
								
							}							
						});
						
						$(elm).appendTo('#'+files_page_id+' div.entry .tabs-content-present');
						setupNewDeleteButton(elm);
					}
					$('#'+files_page_id+' #tabs ul>li.present').trigger('click');
				});
				$('#'+files_page_id+' .recent-present >ul').show ();
				
			} else {
				FilesPage.openFilesEdit();
			}
		},
		
		getFilesItemsFail: function ()  {
			alert("Fail get data.");
			$.mobile.loading ('hide');	
		},
		
		removeFilesItems: function (patientImageId) {
			
			console.log ("removeFilesItems "+ patientImageId);
			$.ajax({
				type : "POST",
				url : __config['medico_url'] + __config['files'],		
				data : {
						method: 'files_delete',		
						data: {patientImageId:patientImageId},						
						empId:employeeDS.EMP_ID,
						queueId: currentQueueId,
						patientId: currentPatientId,
						visitId: visitinfoDS[0].visitId,
						accountId: accountDS.ACCOUNT_ID,
						sessionId: sessionId},
				success : FilesPage.removeFilesItemsSuccess,
				error : FilesPage.removeFilesItemsFail,
				dataType : "json",
			});
		},
		
		removeFilesItemsSuccess: function (data,resultcode) {
			$.mobile.loading ('hide');
			FilesPage.getFilesItems();
			$("#"+files_page_id+" .edit-icn").hide();
			$("#"+files_page_id+" .edit-btn").hide();
			$("#"+files_page_id+" .add-icn").show();			
		},
		
		removeFilesItemsFail: function  (data,resultcode) {	
			alert ('Files Set Fail. ');
			$.mobile.loading ('hide');	
			$("#"+files_page_id+" .edit-icn").hide();
			$("#"+files_page_id+" .edit-btn").hide();
			$("#"+files_page_id+" .add-icn").show();
		},
		
		setFilesItems: function  () {
			console.log("INSERT DOCUMENT FILES ");
			var note = $('#files-edit #files-note').val();
			//var desc = $('#files-edit #files-description').val();
			
				$.mobile.loading ('show', {text: 'Save Document Files data...',textVisible: true,theme: 'a',html: ""});
				$('#files-form-edit').ajaxSubmit({
					type : "POST",
					url : __config['medico_url'] + __config['files'],		
					data : {
							method: 'files_set',
							data: {
									note: note,
									type: FilesPage.getPageId()
									},				
							empId:employeeDS.EMP_ID,
							queueId: currentQueueId,							
							visitId: visitinfoDS[0].visitId,
							patientId: currentPatientId,
							accountId: accountDS.ACCOUNT_ID,
							sessionId: sessionId},
					success : FilesPage.setFilesItemsSuccess,
					error : FilesPage.setFilesItemsFail,
					dataType : "json",
				}); 
			
		},
		
		setFilesItemsSuccess: function  (data,resultcode) {			
			$.mobile.loading ('hide');
			$("#"+files_page_id+" .edit-icn").hide();
			$("#"+files_page_id+" .edit-btn").hide();
			$("#"+files_page_id+" .add-icn").show();
			FilesPage.closeFilesEdit();
			FilesPage.getFilesItems();
		},
		
		setFilesItemsFail: function  (data,resultcode) {
			$("#"+files_page_id+" .edit-icn").hide();
			$("#"+files_page_id+" .edit-btn").hide();
			$("#"+files_page_id+" .add-icn").show();
			FilesPage.closeFilesEdit();
			alert ('Files Set Fail. ')
		},
		
		
		getFilesHistoryItems: function () {
			$.mobile.loading ('show', {text: 'Loading files history data...',textVisible: true,theme: 'a',html: ""});
			
			$("#"+files_page_id+" div.tabs-content-recent .history-list").remove();
			$.ajax({
				type : "POST",
				url : __config['medico_url'] + __config['medico_summary'],		
				data : {
						method: 'files_history_data',							
						empId:employeeDS.EMP_ID,
						queueId: currentQueueId,
						patientId: currentPatientId,						
						accountId: accountDS.ACCOUNT_ID,
						sessionId: sessionId},
				success : FilesPage.getFilesHistoryItemsSuccess,
				error : FilesPage.getFilesHistoryItemsFail,
				dataType : "json",
			});
		},
		
		getFilesHistoryItemsSuccess: function  (data) {
			$.mobile.loading ('hide');
			if (data.count > 0 && data.error_code=='0') {
			
				$.each (data.files, function (k,v){
					if (k!='count') {
						var elm = $(filesHistoryItemHTMLElement).clone();
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
						$(elm).appendTo('#'+files_page_id+' div.entry .tabs-content-recent');						
					}					
				});

			} else {
				console.log("Zero ItemsLoading.");
			}
		},
		
		getFilesHistoryItemsFail: function ()  {
			alert("Fail get data.");
			$.mobile.loading ('hide');	
		},
		
	};
}();
