///////////////////////////////////////////////////////////////////////////////
// Procedure PAGE 
/////////////////

var ProcedurePage = function () {
	
	var procedure_page_id = "procedure-page";
	var procedureItemHTMLElement;
	var procedureJHistoryItemHTMLElement;
	
	return {
		setup :function () {
			if (typeof loaded_service ["procedure.html"]=='undefined') {
				setupHistoryTab(procedure_page_id);
				var tmp = $("#"+procedure_page_id+" .recent-present>ul>li");				
				procedureItemHTMLElement = $(tmp[0]).clone ();
				$(tmp).remove ();
				
				tmp = $("#"+procedure_page_id+" .recent-present table tr");				
				procedureJHistoryItemHTMLElement = $(tmp[0]).clone ();
				$(tmp).remove ();
				
				loaded_service ["procedure.html"] = procedure_page_id;
				ProcedurePage.setupBindProcedurePage();
			}
		
			$('#procedure-section a:first').removeClass("trigger");	
			$('#procedure-search-field-loading>*').hide ();			
			
			clearToolbar(); 
			$('#toolbar-procedure a').addClass('current');
				
			setupDeleteButton(procedure_page_id);	
			ProcedurePage.getProcedureItems();
			
		},
		
		setupBindProcedurePage: function () {
			setupClicksound (procedure_page_id) ;
			
			$("#"+procedure_page_id).bind('vclick', function (e){
				$('#'+procedure_page_id+'  .toggle-list').removeClass('target');	
				ProcedurePage.removeLoadingProcedure();
			});
			
			$('#procedure-search-field').bind('vclick', function (e){		
				e.stopPropagation();	
			});
						
			
			$("#"+procedure_page_id+" .toggle-list .add-icn").bind('vclick', function(e) {
				e.preventDefault();
				e.stopPropagation();
			   
				if  ( $('#'+procedure_page_id+' div.toggle-list').hasClass('target') ) {
			    	$('#'+procedure_page_id+' div.toggle-list').removeClass('target');	
			   	} else {
			   		clearSearchList(procedure_page_id) ;
			   	 	$('#'+procedure_page_id+' div.toggle-list').addClass('target');
			   	 	ProcedurePage.searchProcedure();
			   	}
			});
			
			$("#"+procedure_page_id+" #tabs .recent").bind('vclick', function(e) {
				e.preventDefault();
				ProcedurePage.getProcedureHistoryItems();
			});
			
			$('#procedure-search-field').keyup  ( function () {
				clearSearchList(procedure_page_id) ;
				$('#procedure-search-field-loading>*').show();
				$('#procedure-search-field-loading').addClass('rotate');
				delay(function(){  ProcedurePage.searchProcedure ()  }, 500);			
			});
			
			$('#procedure-search-field').focusin(function() {
				clearSearchList(procedure_page_id) ;
				$('#'+procedure_page_id+' div.toggle-list').addClass ('target');
				ProcedurePage.searchProcedure();
			});
			
		
			
			$('#procedure-save-btt').bind ('vclick', function () {
				ProcedurePage.setProcedureItems ();
			});
			
			$('#procedure-cancel-btt').bind ('vclick', function () {
				ProcedurePage.clearFormItemsEdit();
				$('#'+procedure_page_id+' .toggle-form').hide();				
			});
		},
		
	
		
		searchProcedure : function () {
			$.ajax({
				type : "POST",
				url : __config['medico_url'] + __config['medico_summary'],		
				data : {
						method: 'procedure_search',
						data: {searchTxt:$('#procedure-search-field').val()},
						accountId:accountId,
						coverageTypeId:visitinfoDS[0].coverageTypeId,
						sessionId: sessionId},
				success : ProcedurePage.searchProcedureSuccess,
				error : ProcedurePage.searchProcedureFail,
				dataType : "json",
			});
			
		},
		
		
		
		searchProcedureSuccess: function (data) { 
		
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
							//alert (v.procedureId+" "+v.code);		
							e.preventDefault();	
							e.stopPropagation();										
							$(this).addClass ('trigger');		
							$('#procedure-search-field').val('');
							setTimeout("$('#"+procedure_page_id+" div.toggle-list').removeClass ('target');$('#procedure-search-field').blur();",800);			
							
							ProcedurePage.checkDrugAllergy ();
							ProcedurePage.checkItemConflict();
							
							ProcedurePage.openFormItemsEdit (v);																		
						});
						prependListSearch (procedure_page_id, obj);
					} 
				});
			}
			
			var myScroll = new iScroll('procedure-list-search', 
									{momentum: true,
									hScrollbar: false,
									vScrollbar: false
									});
			ProcedurePage.removeLoadingProcedure();
		},
		
		searchProcedureFail: function  (data, resultcode) {
			alert ('Procedure search Connection Fail.');
			$('#'+procedure_page_id+' div.toggle-list').removeClass ('target');
			ProcedurePage.removeLoadingProcedure();
		},
				
		
		checkDrugAllergy : function () {
			// conflict with drug allergy
		},
		
		checkItemConflict : function () {
			// check duplicate items
		},
		
		openFormItemsEdit: function (aData) {
			var frmProcedure =  $('#'+procedure_page_id+' .toggle-form');
			frmProcedure.show();
			frmProcedure.find ('header>ul>li').eq(0).text (aData.code);
			frmProcedure.find ('header>ul>li').eq(1).text (aData.name);
			frmProcedure.find ('#serviceItemAmount').val (aData.quantity);
			frmProcedure.find ('#serviceItemPrice').val (aData.defaultCost);
			frmProcedure.find ('#serviceItemId').val(aData.serviceItemId);
			frmProcedure.find ('#serviceItemCostTypeId').val(aData.serviceItemCostTypeId);
			frmProcedure.find ('#serviceItemCoverageTypeId').val(visitinfoDS[0].coverageTypeId);
			$('#'+procedure_page_id+' div.toggle-list').removeClass('target');
			
		},
		
		clearFormItemsEdit: function () {
			var frmProcedure =  $('#'+procedure_page_id+' .toggle-form');
			frmProcedure.find ('header>ul>li').eq(0).text ('');
			frmProcedure.find ('header>ul>li').eq(1).text ('');
			frmProcedure.find ('#serviceItemAmount').val (0);
			frmProcedure.find ('#serviceItemPrice').val (0);
			frmProcedure.find ('#serviceItemId').val(0);
			frmProcedure.find ('#serviceItemCostTypeId').val(0);
			frmProcedure.find ('#serviceItemCoverageTypeId').val(0);
			frmProcedure.find ('#serviceDetailId').val(0);
						
		},
				
		setProcedureItems: function  () {
			
			var frmProcedure =  $('#'+procedure_page_id+' .toggle-form');
			var aData = {};
			aData = { serviceId: frmProcedure.find ('#serviceId').val(),
					  serviceItemId:frmProcedure.find ('#serviceItemId').val (),
					  serviceItemAmount: frmProcedure.find ('#serviceItemAmount').val (),
					  serviceId: frmProcedure.find ('#serviceId').val (),
					  serviceItemPrice: frmProcedure.find ('#serviceItemPrice').val (),
					  serviceItemCoverageTypeId :frmProcedure.find ('#serviceItemCoverageTypeId').val (),
					  serviceItemCostTypeId: frmProcedure.find ('#serviceItemCostTypeId').val (),
					  serviceDetailId: frmProcedure.find ('#serviceDetailId').val ()					  
					};
			console.log("INSERT Procedure "+aData.serviceItemId+" "+aData.serviceItemPrice);
			if (aData.serviceItemId!='' && aData.serviceItemPrice !='') {
				$.mobile.loading ('show', {text: 'Save Procedure data...',
								 textVisible: true,
								 theme: 'a',
								 html: ""
						});
				$.ajax({
					type : "POST",
					url : __config['medico_url'] + __config['medico_summary'],		
					data : {
							method: 'procedure_set',
							data: aData,				
							empId:employeeDS.EMP_ID,
							queueId: currentQueueId,
							patientId: currentPatientId,
							accountId: accountDS.ACCOUNT_ID,
							sessionId: sessionId},
					success : ProcedurePage.setProcedureItemsSuccess,
					error : ProcedurePage.setProcedureItemsFail,
					dataType : "json",
				});
			}
		
		},
		
		setProcedureItemsSuccess: function  (data,resultcode) {			
			$.mobile.loading ('hide');
			ProcedurePage.clearFormItemsEdit();
			ProcedurePage.getProcedureItems();
			$('#'+procedure_page_id+' .toggle-form').hide();
		},
		
		setProcedureItemsFail: function  (data,resultcode) {
			alert ('Procedure Set Fail. ');
			ProcedurePage.clearFormItemsEdit();
			$.mobile.loading ('hide');
			$('#'+procedure_page_id+' .toggle-form').hide();
		},
		
		removeProcedureItems: function  (serviceDetailId, serviceId, serviceItemId) {

			$.ajax({
				type : "POST",
				url : __config['medico_url'] + __config['medico_summary'],		
				data : {
						method: 'procedure_delete',		
						data: {serviceDetailId:serviceDetailId, serviceId:serviceId, serviceItemId:serviceItemId},						
						empId:employeeDS.EMP_ID,
						queueId: currentQueueId,
						patientId: currentPatientId,
						visitId: visitinfoDS[0].visitId,
						accountId: accountDS.ACCOUNT_ID,
						sessionId: sessionId},
				success : ProcedurePage.removeProcedureItemsSuccess,
				error : ProcedurePage.removeProcedureItemsFail,
				dataType : "json",
			});
		},
		
		removeProcedureItemsSuccess: function  (data,resultcode) {
			if (data.error_code=='0') {
				if ($("#"+procedure_page_id+" .recent-present>ul>li").length==0) {
					$("#"+procedure_page_id+" .recent-present>ul").hide ();
				}
			} else {
				alert ('Cannot delete this items');
				ProcedurePage.getProcedureItems();
			}
			$.mobile.loading ('hide');
		},
		
		removeProcedureItemsFail: function  (data,resultcode) {	
			alert ('Procedure Set Fail. ');
			ProcedurePage.getProcedureItems();
			$.mobile.loading ('hide');	
		},
		
		getProcedureItems: function () {
			if (currentQueueId>0) {
				$.mobile.loading ('show', {text: 'Loading procedure data...',
								 textVisible: true,
								 theme: 'a',
								 html: ""
						});
				
				$('#'+procedure_page_id+' .recent-present >ul>li').remove();
				$.ajax({
					type : "POST",
					url : __config['medico_url'] + __config['medico_summary'],		
					data : {
							method: 'procedure_data',							
							empId:employeeDS.EMP_ID,
							queueId: currentQueueId,
							patientId: currentPatientId,
							visitId: visitinfoDS[0].visitId,
							accountId: accountDS.ACCOUNT_ID,
							sessionId: sessionId},
					success : ProcedurePage.getProcedureItemsSuccess,
					error : ProcedurePage.getProcedureItemsFail,
					dataType : "json",
				});
			}
		},
		
		getProcedureItemsSuccess: function  (data) {
			$.mobile.loading ('hide');
			if (data.count > 0 && data.error_code=='0') {
				
				$.each (data.procedure, function (k,v){
					if (k!='count') {
						var elm = $(procedureItemHTMLElement).clone();
						$(elm).find('.delete-btn').first().bind('vclick',function (e) {
							$(this).addClass ('trigger');
							var tmpEle = $(this);
							$(this).parent().fadeOut(500 , function () {
								tmpEle.parent().remove ();
								ProcedurePage.removeProcedureItems (v.serviceDetailId, v.serviceId, v.serviceItemId);
								$.mobile.loading ('show', {text: 'Delete procedure items...',
								 textVisible: true,
								 theme: 'a',
								 html: ""
								});
							});
						});
						$(elm).find('h2').eq(0).text (v.serviceItemName);
						$(elm).find('h2').eq(1).text (v.serviceItemAmount+" รายการ");
						$(elm).find('p').eq(1).text (v.fnameOrder+" "+v.lnameOrder);
						$(elm).find('p').eq(2).text ((v.cost*v.serviceItemAmount)+ " บาท");
						$(elm).appendTo('#'+procedure_page_id+' .recent-present >ul');
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
				$('#'+procedure_page_id+' .recent-present >ul').show ();
			
			} else {
				clearSearchList(procedure_page_id) ;
		   	 	$('#'+procedure_page_id+' div.toggle-list').addClass('target');
		   	 	ProcedurePage.searchProcedure();
		   	 	$('#procedure-search-field').focus();
			}
			if ($("#"+procedure_page_id+" .recent-present>ul>li").length==0) {
				$("#"+procedure_page_id+" .recent-present>ul").hide ();
			}
		},
		
		getProcedureItemsFail: function  ()  {
			alert("Fail get data.");
			$.mobile.loading ('hide');	
		},
		
		removeLoadingProcedure: function  () {
			$('#procedure-search-field-loading>*').hide();
			$('#procedure-search-field-loading').removeClass('rotate');		
		},
		
		getProcedureHistoryItems: function () {
			$.mobile.loading ('show', {text: 'Loading procedure history data...',
							 textVisible: true,
							 theme: 'a',
							 html: ""
					});
			
			clearTableHistory(procedure_page_id);
			$.ajax({
				type : "POST",
				url : __config['medico_url'] + __config['medico_summary'],		
				data : {
						method: 'procedure_history_data',							
						empId:employeeDS.EMP_ID,
						queueId: currentQueueId,
						patientId: currentPatientId,						
						accountId: accountDS.ACCOUNT_ID,
						sessionId: sessionId},
				success : ProcedurePage.getProcedureHistoryItemsSuccess,
				error : ProcedurePage.getProcedureHistoryItemsFail,
				dataType : "json",
			});
		},
		
		getProcedureHistoryItemsSuccess: function  (data) {
			$.mobile.loading ('hide');
			if (data.count > 0 && data.error_code=='0') {
				
				$.each (data.procedure, function (k,v){
					if (k!='count') {
						var elm = $(procedureJHistoryItemHTMLElement).clone();	
						
						$(elm).find('th').first().text (k);
						var tmpHTML = "<ul>";
						
						for (var index=0; index < v.length ; index++) {	
							tmpHTML+= '<li>';    
				            tmpHTML+= '<h2 style="float: left;">'+v[index].serviceItemName+'</h2> ';               
				            tmpHTML+= '<h2 style="float: right;">'+v[index].serviceItemAmount+'</h2>';    
				            tmpHTML+= '<br/>';
				            tmpHTML+= '<p style="float: left;">'+v[index].fnameOrder+" "+v[index].lnameOrder+'</p>';    
				            tmpHTML+= '<p style="float: right;">'+(v[index].cost * v[index].serviceItemAmount)+ ' บาท </p>';    
				           	tmpHTML+= ' <br/></li>';    																	
						}
						tmpHTML+="</ul>";
						$(elm).find('td').first().html (tmpHTML);
						
						$(elm).appendTo('#'+procedure_page_id+' .recent-present >table');		

					}
					
					//alert ($(elm).html());
					
				});
				
			
			} else {
				console.log ('zero items');
			}
			
		},
		
		getProcedureHistoryItemsFail: function  ()  {
			alert("Fail get data.");
			$.mobile.loading ('hide');	
		}
	};
}();