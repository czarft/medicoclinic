///////////////////////////////////////////////////////////////////////////////
// ICD10 PAGE 
/////////////////
var ICD10Page = function () {
	
	var icd10_page_id = "icd10-page";
	var icd10ItemHTMLElement;
	var icd10HistoryItemHTMLElement;
	
	return {
		setup :function () {
			if (typeof loaded_service ["icd10.html"]=='undefined') {
				setupHistoryTab(icd10_page_id);
				var tmp = $("#"+icd10_page_id+" .recent-present>ul>li");	
				icd10ItemHTMLElement = $(tmp[0]).clone ();
				$(tmp).remove ();

				tmp = $("#"+icd10_page_id+" .recent-present table tr");
				icd10HistoryItemHTMLElement = $(tmp[0]).clone ();
				$(tmp).remove ();
				
				loaded_service ["icd10.html"] = icd10_page_id;
				ICD10Page.setupBindICD10Page();
			}
		
			$('#icd10-section a:first').removeClass("trigger");	
			$('#icd10-search-field-loading>*').hide ();
			clearToolbar(); 
			$('#toolbar-icd10 a').addClass('current');
				
			setupDeleteButton(icd10_page_id);	
			ICD10Page.getICD10Items();
			//clearTableHistory (icd10_page_id);
			
		},
		
		setupBindICD10Page: function () {
			setupClicksound (icd10_page_id) ;
			
			$("#"+icd10_page_id).bind('vclick', function (e){
				$('#'+icd10_page_id+'  .toggle-list').removeClass('target');	
				ICD10Page.removeLoadingICD10();
			});
			
			$('#icd10-search-field').bind('vclick', function (e){		
				e.stopPropagation();	
			});
			
			
			
			$("#"+icd10_page_id+" .toggle-list .add-icn").bind('vclick', function(e) {
				e.preventDefault();
				e.stopPropagation();
			   
				if  ( $('#'+icd10_page_id+' div.toggle-list').hasClass('target') ) {
			    	$('#'+icd10_page_id+' div.toggle-list').removeClass('target');	
			   	} else {
			   		clearSearchList(icd10_page_id) ;
			   	 	$('#'+icd10_page_id+' div.toggle-list').addClass('target');
			   	 	ICD10Page.searchICD10();
			   	}
			});
			
			$("#"+icd10_page_id+" #tabs .recent").bind('vclick', function(e) {
				e.preventDefault();
				ICD10Page.getICD10History ();		
			});
			
			
			$('#icd10-search-field').keyup  ( function () {
				clearSearchList(icd10_page_id) ;
				$('#icd10-search-field-loading>*').show();
				$('#icd10-search-field-loading').addClass('rotate');
				delay(function(){  ICD10Page.searchICD10 ()  }, 500);			
			});
			
			$('#icd10-search-field').focusin(function() {
				clearSearchList(icd10_page_id) ;
				$('#'+icd10_page_id+' div.toggle-list').addClass ('target');
				ICD10Page.searchICD10();
			});
			
		},
		
		searchICD10 : function () {
				$.ajax({
					type : "POST",
					url : __config['medico_url'] + __config['medico_summary'],		
					data : {
							method: 'icd10_search',
							data: {searchTxt:$('#icd10-search-field').val()},
							accountId:accountId,
							sessionId: sessionId},
					success : ICD10Page.searchICD10Success,
					error : ICD10Page.searchICD10Fail,
					dataType : "json",
				});
			
		},
		
		searchICD10Success: function (data) { 
		
			var html = "";
			var obj;
			var code,id;
			
			if (data.error_code=='0') {
		 		$.each (data, function (k,v){
		 			if (typeof v.code != 'undefined') {
						html = '<li><a href="#">';
						html+= v.code+': '+v.name;
						html+= '</a></li>';		
						obj = $(html);
						$(obj).find('a').first().bind('vclick', function (e) {	
							//alert (v.icd10Id+" "+v.code);		
							e.preventDefault();	
							e.stopPropagation();										
							$(this).addClass ('trigger');		
							$('#icd10-search-field').val('');
							setTimeout("$('#"+icd10_page_id+" div.toggle-list').removeClass ('target');$('#icd10-search-field').blur();",800);			
							ICD10Page.setICD10Items (v.icd10Id, v.code);																		
						});
						prependListSearch (icd10_page_id, obj);
					} 
				});
			}
			
			var myScroll = new iScroll('icd10-list-search', 
									{momentum: true,
									hScrollbar: false,
									vScrollbar: false
									});
			ICD10Page.removeLoadingICD10();
		},
		
		searchICD10Fail: function  (data, resultcode) {
			alert ('ICD10 search Connection Fail.');
			ICD10Page.removeLoadingICD10();
		},
		
		setICD10Items: function  (id, code) {
			console.log("INSERT ICD10 "+id+" "+code);
			
			if (id!='' && code !='') {
				$.mobile.loading ('show', {text: 'Save ICD10 data...',textVisible: true,theme: 'a',html: ""});
				$.ajax({
					type : "POST",
					url : __config['medico_url'] + __config['medico_summary'],		
					data : {
							method: 'icd10_set',
							data: {icd10Id:id,code: code},				
							empId:employeeDS.EMP_ID,
							queueId: currentQueueId,
							patientId: currentPatientId,
							accountId: accountDS.ACCOUNT_ID,
							sessionId: sessionId},
					success : ICD10Page.setICD10ItemsSuccess,
					error : ICD10Page.setICD10ItemsFail,
					dataType : "json",
				});
			}
		
		},
		
		setICD10ItemsSuccess: function  (data,resultcode) {			
			$.mobile.loading ('hide');
			ICD10Page.getICD10Items();
		},
		
		setICD10ItemsFail: function  (data,resultcode) {
			alert ('ICD10 Set Fail. ')
		},
		
		removeICD10Items: function  (diagIcd10Id) {

			$.ajax({
				type : "POST",
				url : __config['medico_url'] + __config['medico_summary'],		
				data : {
						method: 'icd10_delete',		
						data: {diagIcd10Id:diagIcd10Id},						
						empId:employeeDS.EMP_ID,
						queueId: currentQueueId,
						patientId: currentPatientId,
						visitId: visitinfoDS[0].visitId,
						accountId: accountDS.ACCOUNT_ID,
						sessionId: sessionId},
				success : ICD10Page.removeICD10ItemsSuccess,
				error : ICD10Page.removeICD10ItemsFail,
				dataType : "json",
			});
		},
		
		removeICD10ItemsSuccess: function  (data,resultcode) {
			if ($("#"+icd10_page_id+" .recent-present>ul>li").length==0) {
				$("#"+icd10_page_id+" .recent-present>ul").hide ();
			}
			$.mobile.loading ('hide');
		},
		
		removeICD10ItemsFail: function  (data,resultcode) {	
			alert ('ICD10 Set Fail. ');
			$.mobile.loading ('hide');	
		},
		
		getICD10Items: function () {
			if (currentQueueId>0) {
				$.mobile.loading ('show', {text: 'Loading icd10 data...',
								 textVisible: true,
								 theme: 'a',
								 html: ""
						});
				
				$('#'+icd10_page_id+' .recent-present >ul>li').remove();
				$.ajax({
					type : "POST",
					url : __config['medico_url'] + __config['medico_summary'],		
					data : {
							method: 'icd10_data',							
							empId:employeeDS.EMP_ID,
							queueId: currentQueueId,
							patientId: currentPatientId,
							visitId: visitinfoDS[0].visitId,
							accountId: accountDS.ACCOUNT_ID,
							sessionId: sessionId},
					success : ICD10Page.getICD10ItemsSuccess,
					error : ICD10Page.getICD10ItemsFail,
					dataType : "json",
				});
			}
		},
		
		getICD10ItemsSuccess: function  (data) {
			$.mobile.loading ('hide');
			if (typeof data == 'undefined' || data==null) return false;
			if (data.count > 0 && data.error_code=='0') {
				
				$.each (data.icd10, function (k,v){
					if (k!='count') {
						var elm = $(icd10ItemHTMLElement).clone();
						$(elm).find('.delete-btn').first().bind('vclick',function (e) {
							$(this).addClass ('trigger');
							var tmpEle = $(this);
							$(this).parent().fadeOut(500 , function () {
								tmpEle.parent().remove ();
								ICD10Page.removeICD10Items (v.diagIcd10Id);
								$.mobile.loading ('show', {text: 'Delete icd10 items...',
								 textVisible: true,
								 theme: 'a',
								 html: ""
								});
							});
						});
						$(elm).find('h2').first().text (v.codeICD10+" : "+v.nameCommon);
						$(elm).find('p').last().text (v.fnameOrder+" "+v.lnameOrder);
						$(elm).appendTo('#'+icd10_page_id+' .recent-present >ul');
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
									
				});
				$('#'+icd10_page_id+' .recent-present >ul').show ();
				
			} else {
				clearSearchList(icd10_page_id) ;
		   	 	$('#'+icd10_page_id+' div.toggle-list').addClass('target');
		   	 	ICD10Page.searchICD10();
		   	 	$('#icd10-search-field').focus();
			}
			
			if ($("#"+icd10_page_id+" .recent-present>ul>li").length==0) {
				$("#"+icd10_page_id+" .recent-present>ul").hide ();
			}
		},		
		
		getICD10ItemsFail: function  ()  {
			alert("Fail get data.");
			$.mobile.loading ('hide');	
		},
		
		removeLoadingICD10: function  () {
			$('#icd10-search-field-loading>*').hide();
			$('#icd10-search-field-loading').removeClass('rotate');		
		},
		
		getICD10History: function () {
			$.mobile.loading ('show', {text: 'Loading icd10 history...',textVisible: true,theme: 'a',html: ""});			
			clearTableHistory(icd10_page_id);
			
			$.ajax({
				type : "POST",
				url : __config['medico_url'] + __config['medico_summary'],		
				data : {
						method: 'icd10_history_data',							
						empId: employeeDS.EMP_ID,
						queueId: currentQueueId,
						patientId: currentPatientId,						
						accountId: accountDS.ACCOUNT_ID,
						sessionId: sessionId},
				success : ICD10Page.getICD10HistoryItemsSuccess,
				error : ICD10Page.getICD10HistoryItemsFail,
				dataType : "json",
			});
		},
		
		getICD10HistoryItemsSuccess: function  (data) {
			$.mobile.loading ('hide');
			if ( data.error_code=='0' && data.count >0) {
				
				$.each (data.icd10, function (k,v){
					if (k!='count') {
						var elm = $(icd10HistoryItemHTMLElement).clone();
						$(elm).find('th').first().text (k);
						var tmpHTML = "<ul>";
						
						for (var index=0; index < v.length ; index++) {																
							tmpHTML+= "<li><h2>"+ v[index].codeICD10+" : "+v[index].nameCommon+ "</h2>";
							tmpHTML+= "<p>"+v[index].fnameOrder+" "+v[index].lnameOrder+"</p></li>";																	
						}
						tmpHTML+="</ul>";
						$(elm).find('td').first().html (tmpHTML);
						$(elm).appendTo('#'+icd10_page_id+' .recent-present >table');	
					}
					
				});
				
				$('#'+icd10_page_id+' .recent-present >table').show ();
				
				//$('#'+icd10_page_id+' #tabs ul>li.recent').trigger('click');
				
			} else {
				console.log("Zero History ItemsLoading.");			
			}
		},		
		
		getICD10HistoryItemsFail: function  ()  {
			alert("Fail get data.");
			$.mobile.loading ('hide');	
		},
	};
}();