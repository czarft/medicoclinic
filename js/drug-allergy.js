///////////////////////////////////////////////////////////////////////////////
// DRUG ALLERGY PAGE 
/////////////////
DrugAllergyPage = function () {
	var drugallergy_page_id = "drugallergy-page";
	var drugallergyItemHTMLElement;

	return  {
		setup: function  () {
			
			if (typeof loaded_service ["drug-allergy.html"]=='undefined') {
				DrugAllergyPage.setupBindDrugAllergyPage();
				var tmp = $("#"+drugallergy_page_id+" .recent-present>ul>li");		
				drugallergyItemHTMLElement = $(tmp[0]).clone ();
				$(tmp).remove ();
				loaded_service ["drug-allergy.html"] = drugallergy_page_id;
			}
			
			$('#drug-allergy-section a:first').removeClass("trigger");	
			$('#drugallergy-search-field-loading>*').hide ();
			clearToolbar(); 
			$('#toolbar-drugallergy a').addClass('current');
				
			setupDeleteButton(drugallergy_page_id);	
			DrugAllergyPage.getDrugallergyItems();
			
				
		},
		
		setupBindDrugAllergyPage: function () {
			setupClicksound (drugallergy_page_id) ;
			$("#"+drugallergy_page_id).bind('vclick', function (e){
				$('#'+drugallergy_page_id+'  .toggle-list').removeClass('target');	
				DrugAllergyPage.removeLoadingDrugallergy();
			});
			
			$('#drugallergy-search-field').bind('vclick', function (e){		
				e.stopPropagation();	
			});
			
			
			
			$("#"+drugallergy_page_id+" .toggle-list .add-icn").bind('vclick', function(e) {
				e.preventDefault();
				e.stopPropagation();
			   
				if  ( $('#'+drugallergy_page_id+' div.toggle-list').hasClass('target') ) {
			    	$('#'+drugallergy_page_id+' div.toggle-list').removeClass('target');	
			   	} else {
			   	 	clearSearchList(drugallergy_page_id);
			   	 	$('#'+drugallergy_page_id+' div.toggle-list').addClass('target');	   	 	
			   	 	DrugAllergyPage.searchDrugallergy ();
			   	}	   	
			});
			
			$('#drugallergy-search-field').keyup  ( function () {
				clearSearchList(drugallergy_page_id) ;
				$('#drugallergy-search-field-loading>*').show();
				$('#drugallergy-search-field-loading').addClass('rotate');
				delay(function(){  DrugAllergyPage.searchDrugallergy ()  }, 500);		
			});
			
			$('#drugallergy-search-field').focusin(function() {
				if  ( !$('#'+drugallergy_page_id+' .toggle-list').hasClass('target') ) {
					clearSearchList(drugallergy_page_id) ;
					$('#'+drugallergy_page_id+' div.toggle-list').addClass ('target');
					DrugAllergyPage.searchDrugallergy ();
				}
			});
		},
		
		searchDrugallergy: function () {
				
		
			$.ajax({
				type : "POST",
				url : __config['medico_url'] + __config['medico_summary'],		
				data : {
						method: 'drugallergy_search',
						data: {searchTxt:$('#drugallergy-search-field').val()},
						accountId:accountId,
						sessionId: sessionId},
				success : DrugAllergyPage.searchDrugallergySuccess,
				error : DrugAllergyPage.searchDrugallergyFail,
				dataType : "json",
			});
	
		},
		
		searchDrugallergySuccess: function (data) { 
		
			var html = "";
			var obj;
			var code,id;
			var name;
			if ( data.error_code=='0' ) {
		 		$.each (data, function (k,v){
		 			//name = ((v.drugNameGenericName!=null)?v.drugNameGenericName:v.nameTrade);
		 			name = v.nameTrade;
		 			if (typeof v.drugId != 'undefined' && name!='') {
						html = '<li><a href="#">';
						html+= v.code+ " : "+ name;
						html+= '</a></li>';		
						obj = $(html);
						$(obj).find('a').first().bind('vclick', function (e) {						
							e.preventDefault();	
							e.stopPropagation();										
							$(this).addClass ('trigger');	
							$('#drugallergy-search-field').val('');	
							setTimeout("$('#"+drugallergy_page_id+" div.toggle-list').removeClass ('target');$('#drugallergy-search-field').blur();",500);			
							DrugAllergyPage.setDrugallergyItems (v.drugId, name);																		
						});
						prependListSearch (drugallergy_page_id, obj);
					} 
				});
			}
			
			var myScroll = new iScroll('drugallergy-list-search', 
									{momentum: true,
									hScrollbar: false,
									vScrollbar: false
									});
			DrugAllergyPage.removeLoadingDrugallergy();
		},
		
		searchDrugallergyFail: function (data,resultcode) {
			alert ('Drug search Connection Fail.');
			DrugAllergyPage.removeLoadingDrugallergy();
		},
		
		getDrugallergyItems: function () {
			if (currentPatientId > 0) {
				$.mobile.loading ('show', {text: 'Loading drug data...',textVisible: true,theme: 'a',html: ""});
				
				$('#'+drugallergy_page_id+' .recent-present >ul>li').remove();
				$.ajax({
					type : "POST",
					url : __config['medico_url'] + __config['medico_summary'],		
					data : {
							method: 'drugallergy_data',							
							empId:employeeDS.EMP_ID,
							queueId: currentQueueId,
							patientId: currentPatientId,
							visitId: visitinfoDS[0].visitId,
							accountId: accountDS.ACCOUNT_ID,
							sessionId: sessionId},
					success : DrugAllergyPage.getDrugallergyItemsSuccess,
					error : DrugAllergyPage.getDrugallergyItemsFail,
					dataType : "json",
				});
			}
		},
		
		getDrugallergyItemsSuccess: function (data) {
			$.mobile.loading ('hide');
			if (typeof data == 'undefined' || data==null) return false;
			if (data.count > 0 && data.error_code=='0') {
				
				$.each (data.drugallergy, function (k,v){
					if (k!='count') {
						var elm = $(drugallergyItemHTMLElement).clone();
						$(elm).find('.delete-btn').first().bind('vclick',function (e) {
							$(this).addClass ('trigger');
							var tmpEle = $(this);
							$(this).parent().fadeOut(500 , function () {
								tmpEle.parent().remove ();
								DrugAllergyPage.removeDrugallergyItems (v.drugAllergyId);
								$.mobile.loading ('show', {text: 'Delete drug allergy items...',
								 textVisible: true,
								 theme: 'a',
								 html: ""
								});
							});
						});
						//name = ((v.drugNameGeneric!=null)?v.drugNameGeneric:v.drugTradeName);
						$(elm).find('h2').first().text (v.drugTradeName);
						$(elm).find('p').last().text (v.updateEmpFname+" "+v.updateEmpLname);
						$(elm).appendTo('#'+drugallergy_page_id+' .recent-present >ul');
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
				
				$('#'+drugallergy_page_id+' .recent-present >ul').show ();
				
			} else {				
				clearSearchList(drugallergy_page_id);
			   	$('#'+drugallergy_page_id+' div.toggle-list').addClass('target');	   	 	
			   	DrugAllergyPage.searchDrugallergy ();
			   	$('#drugallergy-search-field').focus()
			}
			
			if ($("#"+drugallergy_page_id+" .recent-present>ul>li").length==0) {
				$("#"+drugallergy_page_id+" .recent-present>ul").hide ();
			}
		},
		
		getDrugallergyItemsFail: function ()  {
			alert("Fail get data.");
			$.mobile.loading ('hide');	
		},
		
		removeDrugallergyItems: function (drugAllergyId) {
			
			console.log ("removeDrugallergyItems "+ drugAllergyId);
			$.ajax({
				type : "POST",
				url : __config['medico_url'] + __config['medico_summary'],		
				data : {
						method: 'drugallergy_delete',		
						data: {drugallergyId:drugAllergyId},						
						empId:employeeDS.EMP_ID,
						queueId: currentQueueId,
						patientId: currentPatientId,
						visitId: visitinfoDS[0].visitId,
						accountId: accountDS.ACCOUNT_ID,
						sessionId: sessionId},
				success : DrugAllergyPage.removeDrugallergyItemsSuccess,
				error : DrugAllergyPage.removeDrugallergyItemsFail,
				dataType : "json",
			});
		},
		
		removeDrugallergyItemsSuccess: function  (data,resultcode) {
			if ($("#"+drugallergy_page_id+" .recent-present>ul>li").length==0) {
				$("#"+drugallergy_page_id+" .recent-present>ul").hide ();
			}
			$.mobile.loading ('hide');
		},
		
		removeDrugallergyItemsFail: function  (data,resultcode) {	
			alert ('Drugallergy Set Fail. ');
			$.mobile.loading ('hide');	
		},
		
		setDrugallergyItems: function  (id, name) {
			console.log("INSERT DRUG ALLERGY "+id+" "+name);
			
			if (id!='' && name !='') {
				$.mobile.loading ('show', {text: 'Save Drugallergy data...',
								 textVisible: true,
								 theme: 'a',
								 html: ""
						});
				$.ajax({
					type : "POST",
					url : __config['medico_url'] + __config['medico_summary'],		
					data : {
							method: 'drugallergy_set',
							data: {drugId:id, name: name},				
							empId:employeeDS.EMP_ID,
							queueId: currentQueueId,
							patientId: currentPatientId,
							accountId: accountDS.ACCOUNT_ID,
							sessionId: sessionId},
					success : DrugAllergyPage.setDrugallergyItemsSuccess,
					error : DrugAllergyPage.setDrugallergyItemsFail,
					dataType : "json",
				});
			}
		
		},
		
		setDrugallergyItemsSuccess: function  (data,resultcode) {		
			$.mobile.loading ('hide');
			DrugAllergyPage.getDrugallergyItems();
		},
		
		setDrugallergyItemsFail: function  (data,resultcode) {			
			alert ('Drug allergy Set Fail. ')
		},
		
		removeLoadingDrugallergy: function () {
			$('#drugallergy-search-field-loading>*').hide();
			$('#drugallergy-search-field-loading').removeClass('rotate');		
		}
	};
}();