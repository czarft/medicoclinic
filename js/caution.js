///////////////////////////////////////////////////////////////////////////////
// CAUTION PAGE 
/////////////////
CautionPage = function () {
	var caution_page_id = "caution-page";
	var cautionItemHTMLElement = null;
	var currentServiceId = 0;
	return  {
		 setup : function() {			
			if (typeof loaded_service ["caution.html"]=='undefined') {
				var tmp = $("#"+caution_page_id+" .recent-present>ul>li");
				cautionItemHTMLElement = $(tmp[0]).clone ();
				$(tmp).remove ();
				loaded_service ["caution.html"] = caution_page_id;
				CautionPage.setupBindCautionPage();
			} 
			
			$('#caution-section a:first').removeClass("trigger");	
			$('#caution-search-field-loading>*').hide ();
			clearToolbar(); 
			$('#toolbar-caution a').addClass('current');
				
			setupDeleteButton(caution_page_id);	
			CautionPage.getCautionItems();
			
		},
		
		setupBindCautionPage: function () {
			setupClicksound (caution_page_id) ;	
			
			$("#"+caution_page_id).bind('vclick', function (e){
				$('#'+caution_page_id+'  .toggle-list').removeClass('target');	
				CautionPage.removeLoadingCaution();
			});
			
			$('#caution-search-field').bind('vclick', function (e){		
				e.stopPropagation();	
			});
			
			$("#"+caution_page_id+" .toggle-list .add-icn").bind('vclick', function(e) {
				e.preventDefault();
				e.stopPropagation();
			   
				if  ( $('#'+caution_page_id+' div.toggle-list').hasClass('target') ) {
			    	$('#'+caution_page_id+' div.toggle-list').removeClass('target');	
			   	} else {
			   	 	clearSearchList(caution_page_id) ;
					$('#'+caution_page_id+' div.toggle-list').addClass ('target');
					CautionPage.searchCaution ();
			   	}	   	
			});
			
			$('#caution-search-field').keyup  ( function () {
				clearSearchList(caution_page_id) ;
				$('#caution-search-field-loading>*').show();
				$('#caution-search-field-loading').addClass('rotate');
				delay(function(){  CautionPage.searchCaution ()  }, 500);		
			});
			
			$('#caution-search-field').focusin(function() {
				if  ( !$('#'+caution_page_id+' .toggle-list').hasClass('target') ) {
					clearSearchList(caution_page_id) ;
					$('#'+caution_page_id+' div.toggle-list').addClass ('target');
					CautionPage.searchCaution ();
				}
			});
		},
		
		searchCaution: function () {
				
			
			$.ajax({
				type : "POST",
				url : __config['medico_url'] + __config['medico_summary'],		
				data : {
						method: 'caution_search',
						data: {searchTxt:$('#caution-search-field').val()},
						accountId:accountId,
						sessionId: sessionId},
				success : CautionPage.searchCautionSuccess,
				error : CautionPage.searchCautionFail,
				dataType : "json",
			});
		
		},
		
		searchCautionSuccess : function (data) { 
		
			var html = "";
			var obj;
			var code,id;
			
			if  ( data.error_code=='0') {
		 		$.each (data, function (k,v){
		 			if (typeof v.cautionTypeId != 'undefined') {
						html = '<li><a href="#">';
						html+= v.name;
						html+= '</a></li>';		
						obj = $(html);
						$(obj).find('a').first().bind('vclick', function (e) {						
							e.preventDefault();	
							e.stopPropagation();										
							$(this).addClass ('trigger');		
							$('#caution-search-field').val('');
							setTimeout("$('#"+caution_page_id+" div.toggle-list').removeClass ('target');$('#caution-search-field').blur();",800);			
							CautionPage.setCautionItems (v.cautionTypeId, v.name);																		
						});
						prependListSearch (caution_page_id, obj);
					} 
				});
			}
			
			var myScroll = new iScroll('caution-list-search', 
									{momentum: true,
									hScrollbar: false,
									vScrollbar: false
									});
			CautionPage.removeLoadingCaution();
		},
		
		searchCautionFail: function (data,resultcode) {
			alert ('Caution search Connection Fail.');
			CautionPage.removeLoadingCaution();
		},
		
		
		getCautionItems: function () {
			if (currentPatientId>0) {
				$.mobile.loading ('show', {text: 'Loading caution data...',
								 textVisible: true,
								 theme: 'a',
								 html: ""
						});
				//alert ("getICD10Items");
				
				$('#'+caution_page_id+' .recent-present >ul>li').remove();
				$.ajax({
					type : "POST",
					url : __config['medico_url'] + __config['medico_summary'],		
					data : {
							method: 'caution_data',							
							empId:employeeDS.EMP_ID,
							queueId: currentQueueId,
							patientId: currentPatientId,
							visitId: visitinfoDS[0].visitId,
							accountId: accountDS.ACCOUNT_ID,
							sessionId: sessionId},
					success : CautionPage.getCautionItemsSuccess,
					error : CautionPage.getCautionItemsFail,
					dataType : "json",
				});
			}
		},
		
		
		getCautionItemsSuccess: function (data) {
			$.mobile.loading ('hide');
			if (typeof data == 'undefined' || data==null) return false;
			if (data.count > 0 && data.error_code=='0') {
			
				$.each (data.caution, function (k,v){
					if (k!='count') {
						var elm = $(cautionItemHTMLElement).clone();
						$(elm).find('.delete-btn').first().bind('vclick',function (e) {
							$(this).addClass ('trigger');
							var tmpEle = $(this);
							$(this).parent().fadeOut(500 , function () {
								tmpEle.parent().remove ();
								CautionPage.removeCautionItems (v.cautionId);
								$.mobile.loading ('show', {text: 'Delete caution items...',
								 textVisible: true,
								 theme: 'a',
								 html: ""
								});
							});
						});
						$(elm).find('h2').first().text (v.name);
						$(elm).find('p').last().text (v.fname+" "+v.lname);
						$(elm).appendTo('#'+caution_page_id+' .recent-present >ul');
						setupNewDeleteButton(elm);
					}
					
		
					//alert ($(elm).html());
					
				});
				$('#'+caution_page_id+' .recent-present >ul').show ();
				
				//$('#'+caution_page_id+' #tabs ul>li.present').trigger('click');
				
				
			} else {
				console.log("Zero ItemsLoading.");
			}
			if ($("#"+caution_page_id+" .recent-present>ul>li").length==0) {
				$("#"+caution_page_id+" .recent-present>ul").hide ();
			}
		},
		
		getCautionItemsFail: function ()  {
			alert("Fail get data.");
			$.mobile.loading ('hide');	
		},
		
		removeCautionItems: function (cautionId) {
			
			console.log ("removeCautionItems "+ cautionId);
			$.ajax({
				type : "POST",
				url : __config['medico_url'] + __config['medico_summary'],		
				data : {
						method: 'caution_delete',		
						data: {cautionId:cautionId},						
						empId:employeeDS.EMP_ID,
						queueId: currentQueueId,
						patientId: currentPatientId,
						visitId: visitinfoDS[0].visitId,
						accountId: accountDS.ACCOUNT_ID,
						sessionId: sessionId},
				success : CautionPage.removeCautionItemsSuccess,
				error : CautionPage.removeCautionItemsFail,
				dataType : "json",
			});
		},
		
		removeCautionItemsSuccess: function  (data,resultcode) {
			if ($("#"+caution_page_id+" .recent-present>ul>li").length==0) {
				$("#"+caution_page_id+" .recent-present>ul").hide ();
			}
			$.mobile.loading ('hide');
		},
		
		removeCautionItemsFail: function  (data,resultcode) {	
			alert ('Caution Set Fail. ');
			$.mobile.loading ('hide');	
		},
		
		setCautionItems: function (id, name) {
			console.log("INSERT CAUTION "+id+" "+name);
			
			if (id!='' && name !='') {
				$.mobile.loading ('show', {text: 'Save Caution data...',
								 textVisible: true,
								 theme: 'a',
								 html: ""
						});
				$.ajax({
					type : "POST",
					url : __config['medico_url'] + __config['medico_summary'],		
					data : {
							method: 'caution_set',
							data: {cautionTypeId:id, name: name},				
							empId:employeeDS.EMP_ID,
							queueId: currentQueueId,
							patientId: currentPatientId,
							accountId: accountDS.ACCOUNT_ID,
							sessionId: sessionId},
					success : CautionPage.setCautionItemsSuccess,
					error : CautionPage.setCautionItemsFail,
					dataType : "json",
				});
			}
		
		},
		
		setCautionItemsSuccess: function  (data,resultcode) {
			//var elm = $('#'+caution_page_id+' .recent-present>ul');
			$.mobile.loading ('hide');
			CautionPage.getCautionItems();
		},
		
		setCautionItemsFail: function (data,resultcode) {			
			$.mobile.loading ('hide');
			alert ('Caution Set Fail. ')
		},
		
		removeLoadingCaution: function  () {
			$('#caution-search-field-loading>*').hide();
			$('#caution-search-field-loading').removeClass('rotate');		
		}
	};
}();