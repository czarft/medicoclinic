///////////////////////////////////////////////////////////////////////////////
// Diagnosis PAGE 
/////////////////
var DiagnosisPage = function () {
	
	var diagnosis_page_id = "diagnosis-page";
	var diagnosisItemHTMLElement;
	var diagnosisJHistoryItemHTMLElement
	
	return {
		setup :function () {
			if (typeof loaded_service ["diagnosis.html"]=='undefined') {
				setupHistoryTab(diagnosis_page_id);
				
				var tmp = $("#"+diagnosis_page_id+" .recent-present>ul>li");				
				diagnosisItemHTMLElement = $(tmp[0]).clone ();
				$(tmp).remove ();
				
				var tmp = $("#"+diagnosis_page_id+" .recent-present table tr");				
				diagnosisJHistoryItemHTMLElement = $(tmp[0]).clone ();
				$(tmp).remove ();
				
				loaded_service ["diagnosis.html"] = diagnosis_page_id;
				DiagnosisPage.setupBindDiagnosisPage();
			}
		
			$('#diagnosis-section a:first').removeClass("trigger");	
			$('#diagnosis-search-field-loading>*').hide ();
			clearToolbar(); 
			$('#toolbar-diagnosis a').addClass('current');
				
			setupDeleteButton(diagnosis_page_id);	
			DiagnosisPage.getDiagnosisItems();
			
		},
		
		setupBindDiagnosisPage: function () {
			setupClicksound (diagnosis_page_id) ;
			
			$("#"+diagnosis_page_id).bind('vclick', function (e){
				$('#'+diagnosis_page_id+'  .toggle-list').removeClass('target');	
				DiagnosisPage.removeLoadingDiagnosis();
			});
			
			$('#diagnosis-search-field').bind('vclick', function (e){		
				e.stopPropagation();	
			});
			
			$("#"+diagnosis_page_id+" #tabs .recent").bind('vclick', function(e) {
				e.preventDefault();
				DiagnosisPage.getDiagnosisHistoryItems();
			});
			
			$("#"+diagnosis_page_id+" .toggle-list .add-icn").bind('vclick', function(e) {
				e.preventDefault();
				e.stopPropagation();
			   
				if  ( $('#'+diagnosis_page_id+' div.toggle-list').hasClass('target') ) {
			    	$('#'+diagnosis_page_id+' div.toggle-list').removeClass('target');	
			   	} else {
			   		clearSearchList(diagnosis_page_id) ;
			   	 	$('#'+diagnosis_page_id+' div.toggle-list').addClass('target');
			   	 	DiagnosisPage.searchDiagnosis();
			   	}
			});
			
			$('#diagnosis-search-field').keyup  ( function () {
				clearSearchList(diagnosis_page_id) ;
				$('#diagnosis-search-field-loading>*').show();
				$('#diagnosis-search-field-loading').addClass('rotate');
				delay(function(){  DiagnosisPage.searchDiagnosis ()  }, 700);			
			});
			
			$('#diagnosis-search-field').focusin(function() {
				clearSearchList(diagnosis_page_id) ;
				$('#'+diagnosis_page_id+' div.toggle-list').addClass ('target');
				DiagnosisPage.searchDiagnosis();
			});
			
		},
		
		searchDiagnosis : function () {
				$.ajax({
					type : "POST",
					url : __config['medico_url'] + __config['medico_summary'],		
					data : {
							method: 'diagnosis_search',
							data: {searchTxt:$('#diagnosis-search-field').val()},
							accountId:accountId,
							sessionId: sessionId},
					success : DiagnosisPage.searchDiagnosisSuccess,
					error : DiagnosisPage.searchDiagnosisFail,
					dataType : "json",
				});
			
		},
		
		searchDiagnosisSuccess: function (data) { 
		
			var html = "";
			var obj;
			var code,id;
			
			if (data.error_code=='0' && data.count > 0) {
		 		$.each (data, function (k,v){
		 			if ( k!='count' && typeof v.code != 'undefined') {
						html = '<li><a href="#">';
						html+= v.name;
						html+= '</a></li>';		
						obj = $(html);
						$(obj).find('a').first().bind('vclick', function (e) {						
							e.preventDefault();	
							e.stopPropagation();										
							$(this).addClass ('trigger');		
							$('#diagnosis-search-field').val('');
							setTimeout("$('#"+diagnosis_page_id+" div.toggle-list').removeClass ('target');$('#diagnosis-search-field').blur();",800);			
							DiagnosisPage.setDiagnosisItems (v.diagThaiTypeId);																		
						});
						prependListSearch (diagnosis_page_id, obj);
					} 
				});
			} else {
				html = '<li><a href="#">';
				html+= 'ไม่พบข้อมูล ท่านต้องการเพิ่ม "'+$('#diagnosis-search-field').val()+'" หรือไม่';
				html+= '</a></li>';		
				obj = $(html);
				$(obj).find('a').bind('click', function (e) {											
					e.preventDefault();	
					e.stopPropagation();																				
					setTimeout("$('#"+diagnosis_page_id+" div.toggle-list').removeClass ('target');$('#diagnosis-search-field').val('');$('#diagnosis-search-field').blur();",800);
					DiagnosisPage.setDiagnosisItems (0, $('#diagnosis-search-field').val());
																												
				});
				prependListSearch (diagnosis_page_id, obj);
			}
			
			var myScroll = new iScroll('diagnosis-list-search', {momentum: true,hScrollbar: false,vScrollbar: false});
			DiagnosisPage.removeLoadingDiagnosis();
		},
		
		searchDiagnosisFail: function  (data, resultcode) {
			alert ('Diagnosis search Connection Fail.');
			DiagnosisPage.removeLoadingDiagnosis();
		},
		
		setDiagnosisItems: function  (id, newDiag) {
			if (typeof newDiag == 'undefined') newDiag = ''; 
			console.log("INSERT Diagnosis "+id);
			
			if (id!='' || newDiag!='') {
				$.mobile.loading ('show', {text: 'Save Diagnosis data...',textVisible: true,theme: 'a',html: ""});
				$.ajax({
					type : "POST",
					url : __config['medico_url'] + __config['medico_summary'],		
					data : {
							method: 'diagnosis_set',
							data: {diagThaiTypeId:id, newDiag: newDiag},				
							empId:employeeDS.EMP_ID,
							visitId: visitinfoDS[0].visitId,
							patientId: currentPatientId,
							accountId: accountDS.ACCOUNT_ID,
							sessionId: sessionId},
					success : DiagnosisPage.setDiagnosisItemsSuccess,
					error : DiagnosisPage.setDiagnosisItemsFail,
					dataType : "json",
				});
			}
		
		},
		
		setDiagnosisItemsSuccess: function  (data,resultcode) {			
			$.mobile.loading ('hide');
			DiagnosisPage.getDiagnosisItems();
		},
		
		setDiagnosisItemsFail: function  (data,resultcode) {
			alert ('Diagnosis Set Fail. ')
		},
		
		removeDiagnosisItems: function  (diagThaiId) {

			$.ajax({
				type : "POST",
				url : __config['medico_url'] + __config['medico_summary'],		
				data : {
						method: 'diagnosis_delete',		
						data: {diagThaiId:diagThaiId},						
						empId:employeeDS.EMP_ID,
						queueId: currentQueueId,
						patientId: currentPatientId,
						visitId: visitinfoDS[0].visitId,
						accountId: accountDS.ACCOUNT_ID,
						sessionId: sessionId},
				success : DiagnosisPage.removeDiagnosisItemsSuccess,
				error : DiagnosisPage.removeDiagnosisItemsFail,
				dataType : "json",
			});
		},
		
		removeDiagnosisItemsSuccess: function  (data,resultcode) {
			if (data.error_code=='0') {
				if ($("#"+diagnosis_page_id+" .recent-present>ul>li").length==0) {
					$("#"+diagnosis_page_id+" .recent-present>ul").hide ();
				}
			} else {
				alert ('Cannot delete this items');
				DiagnosisPage.getDiagnosisItems();
			}
			$.mobile.loading ('hide');
		},
		
		removeDiagnosisItemsFail: function  (data,resultcode) {	
			alert ('Diagnosis Set Fail. ');
			$.mobile.loading ('hide');	
		},
		
		getDiagnosisItems: function () {
			if (currentPatientId>0) {
				$.mobile.loading ('show', {text: 'Loading diagnosis data...', textVisible: true,theme: 'a',html: ""});
				
				$('#'+diagnosis_page_id+' .recent-present >ul>li').remove();
				$.ajax({
					type : "POST",
					url : __config['medico_url'] + __config['medico_summary'],		
					data : {
							method: 'diagnosis_data',							
							empId:employeeDS.EMP_ID,
							queueId: currentQueueId,
							patientId: currentPatientId,
							visitId: visitinfoDS[0].visitId,
							accountId: accountDS.ACCOUNT_ID,
							sessionId: sessionId},
					success : DiagnosisPage.getDiagnosisItemsSuccess,
					error : DiagnosisPage.getDiagnosisItemsFail,
					dataType : "json",
				});
			}
		},
		
		getDiagnosisItemsSuccess: function  (data) {
			$.mobile.loading ('hide');
			if (typeof data == 'undefined' || data==null) return false;
			if (data.count > 0 && data.error_code=='0') {
				
				$.each (data.diagnosis, function (k,v){
					if (k!='count') {
						var elm = $(diagnosisItemHTMLElement).clone();
						$(elm).find('.delete-btn').first().bind('vclick',function (e) {
							$(this).addClass ('trigger');
							var tmpEle = $(this);
							$(this).parent().fadeOut(500 , function () {
								tmpEle.parent().remove ();
								DiagnosisPage.removeDiagnosisItems (v.diagThaiId);
								$.mobile.loading ('show', {text: 'Delete diagnosis items...',
								 textVisible: true,
								 theme: 'a',
								 html: ""
								});
							});
						});
						$(elm).find('h2').first().text (v.name);
						$(elm).find('p').last().text (v.fnameOrder+" "+v.lnameOrder);
						$(elm).appendTo('#'+diagnosis_page_id+' .recent-present >ul');
						setupNewDeleteButton(elm);
						$(elm).bind ('vclick',function (e) {
							e.preventDefault();	
							e.stopPropagation();	
							if ($(this).find ('.delete-btn').first().is(":visible")) {
								$(this).find ('.delete-btn').first().hide();
							}  else {
								$(this).find ('.delete-btn').first().show();
							}																		
						});
					}
					
					//alert ($(elm).html());
					
				});
				$('#'+diagnosis_page_id+' .recent-present >ul').show ();
			
			} else {
				clearSearchList(diagnosis_page_id) ;
		   	 	$('#'+diagnosis_page_id+' div.toggle-list').addClass('target');
		   	 	DiagnosisPage.searchDiagnosis();
		   	 	$('#diagnosis-search-field').focus();
			}
			if ($("#"+diagnosis_page_id+" .recent-present>ul>li").length==0) {
				$("#"+diagnosis_page_id+" .recent-present>ul").hide ();
			}
		},
		
		getDiagnosisItemsFail: function  ()  {
			alert("Fail get data.");
			$.mobile.loading ('hide');	
		},
		
		removeLoadingDiagnosis: function  () {
			$('#diagnosis-search-field-loading>*').hide();
			$('#diagnosis-search-field-loading').removeClass('rotate');		
		},
		
		getDiagnosisHistoryItems: function () {
			$.mobile.loading ('show', {text: 'Loading diagnosis data...',
							 textVisible: true,
							 theme: 'a',
							 html: ""
					});
			
			clearTableHistory(diagnosis_page_id);
			$.ajax({
				type : "POST",
				url : __config['medico_url'] + __config['medico_summary'],		
				data : {
						method: 'diagnosis_history_data',							
						empId:employeeDS.EMP_ID,
						queueId: currentQueueId,
						patientId: currentPatientId,						
						accountId: accountDS.ACCOUNT_ID,
						sessionId: sessionId},
				success : DiagnosisPage.getDiagnosisHistoryItemsSuccess,
				error : DiagnosisPage.getDiagnosisHistoryItemsFail,
				dataType : "json",
			});
		},
		
		getDiagnosisHistoryItemsSuccess: function  (data) {
			$.mobile.loading ('hide');
			if (data.count > 0 && data.error_code=='0') {
				
				$.each (data.diagnosis, function (k,v){
					if (k!='count') {
						var elm = $(diagnosisJHistoryItemHTMLElement).clone();
						$(elm).find('th').first().text (k);
						var tmpHTML = "<ul>";
						
						for (var index=0; index < v.length ; index++) {																
							tmpHTML+= "<li><h2>"+ v[index].name+ "</h2>";
							tmpHTML+= "<p>"+v[index].fnameOrder+" "+v[index].lnameOrder+"</p></li>";																	
						}
						tmpHTML+="</ul>";
						$(elm).find('td').first().html (tmpHTML);
						$(elm).appendTo('#'+diagnosis_page_id+' .recent-present >table');											
					}					
				});
			
			
			} else {
				console.log("Zero ItemsLoading.");
			}
		},
		
		getDiagnosisHistoryItemsFail: function  ()  {
			alert("Fail get data.");
			$.mobile.loading ('hide');	
		},
	};
}();