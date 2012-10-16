///////////////////////////////////////////////////////////////////////////////
// Medication PAGE 
/////////////////
var MedicationPage = function () {
	
	var medication_page_id = "medication-page";
	var medicationItemHTMLElement;
	var medicationHistoryItemHTMLElement;
	
	return {
		setup :function () {
			if (typeof loaded_service ["medication.html"]=='undefined') {
				setupHistoryTab(medication_page_id);
				var tmp = $("#"+medication_page_id+" .recent-present>ul>li");				
				medicationItemHTMLElement = $(tmp[0]).clone ();
				$(tmp).remove ();
				
				tmp = $("#"+medication_page_id+" .recent-present table tr");
				medicationHistoryItemHTMLElement = $(tmp[0]).clone ();
				$(tmp).remove ();
				
				loaded_service ["medication.html"] = medication_page_id;
				MedicationPage.setupBindMedicationPage();
			}
		
			$('#medication-section a:first').removeClass("trigger");	
			$('#medication-search-field-loading>*').hide ();
			$('#instruction-search-field-loading>*').hide ();
			
			clearToolbar(); 
			$('#toolbar-medication a').addClass('current');
				
			setupDeleteButton(medication_page_id);	
			MedicationPage.getMedicationItems();
			
		},
		
		setupBindMedicationPage: function () {
			setupClicksound (medication_page_id) ;
			
			$("#"+medication_page_id).bind('vclick', function (e){
				$('#'+medication_page_id+'  .toggle-list').removeClass('target');	
				MedicationPage.removeLoadingMedication();
			});
			
			$('#medication-search-field').bind('vclick', function (e){		
				e.stopPropagation();	
			});
			
			$('#instruction-search-field').bind('vclick', function (e){		
				e.stopPropagation();	
			});
			
			
			
			$("#"+medication_page_id+" .toggle-list .add-icn").bind('vclick', function(e) {
				e.preventDefault();
				e.stopPropagation();
			   
				if  ( $('#'+medication_page_id+' div.toggle-list').hasClass('target') ) {
			    	$('#'+medication_page_id+' div.toggle-list').removeClass('target');	
			   	} else {
			   		clearSearchList(medication_page_id) ;
			   	 	$('#'+medication_page_id+' div.toggle-list').addClass('target');
			   	 	MedicationPage.searchMedication();
			   	}
			});
			
			
			$("#drugusing_add_icn").bind('vclick', function(e) {
				e.preventDefault();
				e.stopPropagation();			 			
				
				if  ( $('#'+medication_page_id+' div.toggle-list-in').hasClass('target') ) {			    
			    	$('#'+medication_page_id+' div.toggle-list-in').removeClass ('target');
			   	} else {			   					   	 						   	
			   	 	MedicationPage.clearInstructionSearchList ();
					MedicationPage.searchInstruction ("");
					$('#'+medication_page_id+' div.toggle-list-in').addClass ('target');
			   	}
			});
			
			
			$('#medication-search-field').keyup  ( function () {
				clearSearchList(medication_page_id) ;
				$('#medication-search-field-loading>*').show();
				$('#medication-search-field-loading').addClass('rotate');
				delay(function(){  MedicationPage.searchMedication ()  }, 500);			
			});
			
			$('#medication-search-field').focusin(function() {
				clearSearchList(medication_page_id) ;
				$('#'+medication_page_id+' div.toggle-list').addClass ('target');
				MedicationPage.searchMedication();
			});
			
			$('#instruction-search-field').keyup ( function () {
				MedicationPage.clearInstructionSearchList ();
				$('#instruction-search-field-loading>*').show();
				$('#instruction-search-field-loading').addClass('rotate');
				delay(function(){  MedicationPage.searchInstruction ()  }, 500);
			});
			
			$('#instruction-search-field').focusin(function() {
				MedicationPage.clearInstructionSearchList ();
				$('#instruction-search-field').val("");
				$('#'+medication_page_id+' div.toggle-list-in').addClass ('target');
				MedicationPage.searchInstruction();
			});
			
			$('#medication-save-btt').bind ('vclick', function () {
				MedicationPage.setMedicationItems ();
				
				
			});
			
			$('#medication-cancel-btt').bind ('vclick', function () {
				MedicationPage.clearFormItemsEdit();
				$('#'+medication_page_id+' .toggle-form').hide();				
			});
			
			$("#"+medication_page_id+" #tabs .recent").bind('vclick', function(e) {
				e.preventDefault();
				MedicationPage.getMedicationHistoryItems();
			});
		},
		
		clearInstructionSearchList : function () {
			var el = $("#"+medication_page_id+" .toggle-list-in div ul>li");
			$.each (el, function () {
				if (!$(this).hasClass('loading') ) {
					$(this).remove ();
				}
			});
		},
		
		searchMedication : function (txt) {
			var txtSrch;
			if (typeof txt!='undefined') {
				txtSrch = txt;
			} else {
				txtSrch = $('#medication-search-field').val();
			}
			$.ajax({
				type : "POST",
				url : __config['medico_url'] + __config['medico_summary'],		
				data : {
						method: 'medication_search',
						data: {searchTxt:txtSrch},
						accountId:accountId,
						coverageTypeId:visitinfoDS[0].coverageTypeId,
						sessionId: sessionId},
				success : MedicationPage.searchMedicationSuccess,
				error : MedicationPage.searchMedicationFail,
				dataType : "json",
			});
			
		},
		
		searchInstruction : function (txt) {
			var txtSrch;
			if (typeof txt!='undefined') {
				txtSrch = txt;
			} else {
				txtSrch = $('#instruction-search-field').val();
			}
			$.ajax({
				type : "POST",
				url : __config['medico_url'] + __config['medico_summary'],		
				data : {
						method: 'drugusing_search',
						data: {searchTxt:txtSrch},
						accountId:accountId,
						sessionId: sessionId},
				success : MedicationPage.searchInstructionSuccess,
				error : MedicationPage.searchInstructionFail,
				dataType : "json",
			});			
		},
		
		searchMedicationSuccess: function (data) { 
		
			var html = "";
			var obj;
			var code,id;
			
			if (data.error_code=='0') {
		 		$.each (data, function (k,v){
		 			if (typeof v.code != 'undefined') {
						html = '<li><a href="#">';
						html+= v.code+': '+v.nameTrade;
						html+= '</a></li>';		
						obj = $(html);
						$(obj).find('a').first().bind('vclick', function (e) {	
							//alert (v.medicationId+" "+v.code);		
							e.preventDefault();	
							e.stopPropagation();										
							$(this).addClass ('trigger');		
							$('#medication-search-field').val('');
							setTimeout("$('#"+medication_page_id+" div.toggle-list').removeClass ('target');$('#medication-search-field').blur();",800);			
							
							MedicationPage.checkDrugAllergy ();
							MedicationPage.checkItemConflict();
							
							MedicationPage.openFormItemsEdit (v);																		
						});
						prependListSearch (medication_page_id, obj);
					} 
				});
			}
			
			var myScroll = new iScroll('medication-list-search', 
									{momentum: true,
									hScrollbar: false,
									vScrollbar: false
									});
			MedicationPage.removeLoadingMedication();
		},
		
		searchMedicationFail: function  (data, resultcode) {
			alert ('Medication search Connection Fail.');
			$('#'+medication_page_id+' div.toggle-list').removeClass ('target');
			MedicationPage.removeLoadingMedication();
		},
		
		searchInstructionSuccess: function (data) { 
		
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
							//alert (v.medicationId+" "+v.code);		
							e.preventDefault();	
							e.stopPropagation();										
							$(this).addClass ('trigger');		
							$('#'+medication_page_id+' div.toggle-list-in').removeClass ('target');
							$('#instruction-search-field').blur();			
							$('#'+medication_page_id+" #instruction-search-field").val (v.name);	
							$('#'+medication_page_id+" #drugLabel").val (v.code);												
						});
					
						$(obj).insertBefore("#"+medication_page_id+" .toggle-list-in div ul>li.loading");
					} 
				});
			}
			
			var myScroll = new iScroll('instruction-list-search', 
									{momentum: true,
									hScrollbar: false,
									vScrollbar: false
									});
			MedicationPage.removeLoadingInstruction();
		},
		
		searchInstructionFail: function  (data, resultcode) {
			alert ('Medication Instruction Connection Fail.');
			$('#'+medication_page_id+' div.toggle-list-in').removeClass ('target');
			MedicationPage.removeLoadingInstruction();
		},
		
		checkDrugAllergy : function () {
			// conflict with drug allergy
		},
		
		checkItemConflict : function () {
			// check duplicate items
		},
		
		openFormItemsEdit: function (aData) {
			var frmMedication =  $('#'+medication_page_id+' .toggle-form');
			frmMedication.show();
			frmMedication.find ('header>ul>li').eq(0).text (aData.code);
			frmMedication.find ('header>ul>li').eq(1).text (aData.name);
			frmMedication.find ('#drugAmount').val (aData.drugAmount);
			frmMedication.find ('#drugPrice').val (aData.defaultCost);
			frmMedication.find ('from>ul>li>span').eq(0).val (aData.drugUnitName);
			
			frmMedication.find ('#drugId').val(aData.drugId);
			frmMedication.find ('#properties').val(aData.properties);
			frmMedication.find ('#usingWarning').val(aData.usingWarning);
			frmMedication.find ('#drugUnitId').val(aData.drugUnitId);
			frmMedication.find ('#drugLabel').val (aData.drugLabel);
			frmMedication.find ('#drugNote').val (aData.drugNote);
			frmMedication.find ('#drugUnitName').val (aData.drugUnitName);
			frmMedication.find ('#drugServiceCostTypeId').val (aData.drugServiceCostTypeId);
			if (aData.drugLabelName!='') {				
				frmMedication.find ('#instruction-search-field').val (aData.drugLabelName);				
			}
			$('#'+medication_page_id+' div.toggle-list').removeClass('target');
			
		},
		
		clearFormItemsEdit: function () {
			var frmMedication =  $('#'+medication_page_id+' .toggle-form');
			frmMedication.find ('header>ul>li').eq(0).text ("");
			frmMedication.find ('header>ul>li').eq(1).text ("");
			frmMedication.find ('#drugAmount').val (0);
			frmMedication.find ('#drugPrice').val (0);
			frmMedication.find ('from>ul>li>span').eq(0).val ('');
			frmMedication.find ('#drugId').val(0);
			frmMedication.find ('#properties').val('');
			frmMedication.find ('#usingWarning').val('');
			frmMedication.find ('#drugUnitId').val(1);
			frmMedication.find ('#drugLabel').val ('');
			frmMedication.find ('#drugNote').val ('');						
			frmMedication.find ('#instruction-search-field').val ('');		
			frmMedication.find ('#drugUnitName').val ('');
			frmMedication.find ('#drugServiceCostTypeId').val (0);	
						
		},
				
		setMedicationItems: function  () {
			
			var frmMedication =  $('#'+medication_page_id+' .toggle-form');
			var aData = {};
			aData = { drugId: frmMedication.find ('#drugId').val(),
					  drugAmount:frmMedication.find ('#drugAmount').val (),
					  drugPrice: frmMedication.find ('#drugPrice').val (),
					  serviceId: frmMedication.find ('#serviceId').val (),
					  properties: frmMedication.find ('#properties').val (),
					  drugCoverageTypeId :visitinfoDS[0].coverageTypeId,
					  usingWarning: frmMedication.find ('#usingWarning').val (),
					  drugUnitId: frmMedication.find ('#drugUnitId').val (),
					  drugUnitName: frmMedication.find ('#drugUnitName').val (),
					  instruction: frmMedication.find ('#instruction-search-field').val (),
					  drugLabel: frmMedication.find ('#drugLabel').val (),
					  drugNote: frmMedication.find ('#drugNote').val (),
					  drugServiceCostTypeId:  frmMedication.find ('#drugServiceCostTypeId').val (),
					};
			console.log("INSERT Medication "+aData.drugId+" "+aData.drugLabel);
			if (aData.drugId!='' && aData.drugAmount !='') {
				$.mobile.loading ('show', {text: 'Save Medication data...',
								 textVisible: true,
								 theme: 'a',
								 html: ""
						});
				$.ajax({
					type : "POST",
					url : __config['medico_url'] + __config['medico_summary'],		
					data : {
							method: 'medication_set',
							data: aData,				
							empId:employeeDS.EMP_ID,
							queueId: currentQueueId,
							patientId: currentPatientId,
							accountId: accountDS.ACCOUNT_ID,
							sessionId: sessionId},
					success : MedicationPage.setMedicationItemsSuccess,
					error : MedicationPage.setMedicationItemsFail,
					dataType : "json",
				});
			}
		
		},
		
		setMedicationItemsSuccess: function  (data,resultcode) {			
			$.mobile.loading ('hide');
			MedicationPage.clearFormItemsEdit();
			MedicationPage.getMedicationItems();
			$('#'+medication_page_id+' .toggle-form').hide();
		},
		
		setMedicationItemsFail: function  (data,resultcode) {
			alert ('Medication Set Fail. ');
			MedicationPage.clearFormItemsEdit();
			$.mobile.loading ('hide');
			$('#'+medication_page_id+' .toggle-form').hide();
		},
		
		removeMedicationItems: function  (drugRxId) {

			$.ajax({
				type : "POST",
				url : __config['medico_url'] + __config['medico_summary'],		
				data : {
						method: 'medication_delete',		
						data: {drugRxId:drugRxId},						
						empId:employeeDS.EMP_ID,
						queueId: currentQueueId,
						patientId: currentPatientId,
						visitId: visitinfoDS[0].visitId,
						accountId: accountDS.ACCOUNT_ID,
						sessionId: sessionId},
				success : MedicationPage.removeMedicationItemsSuccess,
				error : MedicationPage.removeMedicationItemsFail,
				dataType : "json",
			});
		},
		
		removeMedicationItemsSuccess: function  (data,resultcode) {
			if (data.error_code=='0') {
				if ($("#"+medication_page_id+" .recent-present>ul>li").length==0) {
					$("#"+medication_page_id+" .recent-present>ul").hide ();
				}
			} else {
				alert ('Cannot delete this items');
				MedicationPage.getMedicationItems();
			}
			$.mobile.loading ('hide');
		},
		
		removeMedicationItemsFail: function  (data,resultcode) {	
			alert ('Medication Set Fail. ');
			$.mobile.loading ('hide');	
		},
		
		getMedicationItems: function () {
			if (currentQueueId>0) {
				$.mobile.loading ('show', {text: 'Loading medication data...',
								 textVisible: true,
								 theme: 'a',
								 html: ""
						});
				
				$('#'+medication_page_id+' .recent-present >ul>li').remove();
				$.ajax({
					type : "POST",
					url : __config['medico_url'] + __config['medico_summary'],		
					data : {
							method: 'medication_data',							
							empId:employeeDS.EMP_ID,
							queueId: currentQueueId,
							patientId: currentPatientId,
							visitId: visitinfoDS[0].visitId,
							accountId: accountDS.ACCOUNT_ID,
							sessionId: sessionId},
					success : MedicationPage.getMedicationItemsSuccess,
					error : MedicationPage.getMedicationItemsFail,
					dataType : "json",
				});
			}
		},
		
		getMedicationItemsSuccess: function  (data) {
			$.mobile.loading ('hide');
			if (typeof data == 'undefined' || data==null) return false;
			if (data.count > 0 && data.error_code=='0') {
				
				$.each (data.medication, function (k,v){
					if (k!='count') {
						var elm = $(medicationItemHTMLElement).clone();
						$(elm).find('.delete-btn').first().bind('vclick',function (e) {
							$(this).addClass ('trigger');
							var tmpEle = $(this);
							$(this).parent().fadeOut(500 , function () {
								tmpEle.parent().remove ();
								MedicationPage.removeMedicationItems (v.drugRxId);
								$.mobile.loading ('show', {text: 'Delete medication items...',
								 textVisible: true,
								 theme: 'a',
								 html: ""
								});
							});
						});
						$(elm).find('h2').eq(0).text (v.codeNameTrade+" : "+v.nameTrade);
						$(elm).find('h2').eq(1).text (v.drugAmount+" "+v.drugUnitName);
						$(elm).find('p').eq(1).text ("sig: "+v.drugLabelName);
						$(elm).find('p').eq(2).text ((v.drugAmount * v.drugPrice)+ " บาท");
						$(elm).appendTo('#'+medication_page_id+' .recent-present >ul');
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
				$('#'+medication_page_id+' .recent-present >ul').show ();

				
			} else {
				clearSearchList(medication_page_id) ;
		   	 	$('#'+medication_page_id+' div.toggle-list').addClass('target');
		   	 	MedicationPage.searchMedication();
		   	 	$('#medication-search-field').focus();
			}
			if ($("#"+medication_page_id+" .recent-present>ul>li").length==0) {
				$("#"+medication_page_id+" .recent-present>ul").hide ();
			}
		},
		
		getMedicationItemsFail: function  ()  {
			alert("Fail get data.");
			$.mobile.loading ('hide');	
		},
		
		removeLoadingMedication: function  () {
			$('#medication-search-field-loading>*').hide();
			$('#medication-search-field-loading').removeClass('rotate');		
		},
		
		removeLoadingInstruction: function  () {
			$('#instruction-search-field-loading>*').hide();
			$('#instruction-search-field-loading').removeClass('rotate');		
		},
		
		getMedicationHistoryItems: function () {
			$.mobile.loading ('show', {text: 'Loading medication history data...',textVisible: true,theme: 'a',html: ""});
				
			clearTableHistory(medication_page_id);
			$.ajax({
				type : "POST",
				url : __config['medico_url'] + __config['medico_summary'],		
				data : {
						method: 'medication_history_data',							
						empId:employeeDS.EMP_ID,
						queueId: currentQueueId,
						patientId: currentPatientId,						
						accountId: accountDS.ACCOUNT_ID,
						sessionId: sessionId},
				success : MedicationPage.getMedicationHistoryItemsSuccess,
				error : MedicationPage.getMedicationHistoryItemsFail,
				dataType : "json",
			});
		},
		
		getMedicationHistoryItemsSuccess: function  (data) {
			$.mobile.loading ('hide');
			if (data.count > 0 && data.error_code=='0') {
				
				$.each (data.medication, function (k,v){
					if (k!='count') {
						var elm = $(medicationHistoryItemHTMLElement).clone();
						
						$(elm).find('th').first().text (k);
						var tmpHTML = "<ul>";
						
						for (var index=0; index < v.length ; index++) {	
							tmpHTML+= '<li>';    
				            tmpHTML+= '<h2 style="float: left;">'+v[index].codeNameTrade+" : "+v[index].nameTrade+'</h2> ';               
				            tmpHTML+= '<h2 style="float: right;">'+v[index].drugAmount+" "+v[index].drugUnitName+'</h2>';    
				            tmpHTML+= '<br/>';
				            tmpHTML+= '<p style="float: left;"> sig: '+v[index].drugLabelName+'</p>';    
				            tmpHTML+= '<p style="float: right;">'+(v[index].drugAmount * v[index].drugPrice)+ ' บาท </p>';    
				           	tmpHTML+= ' <br/></li>';    																	
						}
						tmpHTML+="</ul>";
						$(elm).find('td').first().html (tmpHTML);
						
						$(elm).appendTo('#'+medication_page_id+' .recent-present >table');						
					}					
				});
				$('#'+medication_page_id+' .recent-present >table').show ();

				
			} else {
				console.log ('zero items');
			}
			
		},
		
		getMedicationHistoryItemsFail: function  ()  {
			alert("Fail get data.");
			$.mobile.loading ('hide');	
		}
		
		
		
	};
}();