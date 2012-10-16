

PatientInfoPage = function () {
	var patient_info_page_id  = 'patient-info-page';
	var scrollPatientInfo;
	var scrollPatientInfoEdit;
	var scrollPatientInfoAdd;
	return {
		setup : function (flagNew) {				
			if (typeof loaded_service ["patient-info.html"]=='undefined') {						
				loaded_service ["patient-info.html"] = patient_info_page_id;
				PatientInfoPage.setupBindPatientInfoPage();
			} else {
				if (RunningMode.phonegapActive()) {
					scrollPatientInfo.refresh();
					scrollPatientInfoEdit.refresh ();
				}
			}
		
			clearToolbar(); 
			$('#toolbar-patient-info a').addClass('current');
			$('#'+patient_info_page_id+' #patient-info-edit').hide();
			
			if (!flagNew || typeof flagNew == 'undefined') {
				
				$('#'+patient_info_page_id+' #patient-info-view').show();
			
				$('#patient-info-page-add').hide();
				$('#'+patient_info_page_id+' #title-page span').html("EDIT PATIENT INFO");
				$("#"+patient_info_page_id+" .edit-icn").show();
				PatientInfoPage.getInfo();
				PatientInfoPage.clearView();
			} else {
				$('#'+patient_info_page_id+' #patient-info-view').hide();
				
				$('#patient-info-page-add').show();	
				$('#'+patient_info_page_id+' #title-page span').html("ADD NEW PATIENT INFO");
				$("#"+patient_info_page_id+" .edit-icn").hide();
			}
			
		},
	
		setupBindPatientInfoPage : function () {
			$('#patient-info-page-edit #birthDate').bind ('change', function () {
				calAge($(this).val(), $('#patient-info-page-edit #ageYY'));				
			});
			
			$('#patient-info-page-edit #ageYY').bind ('change', function () {
				calBirthDate($(this).val(), $('#patient-info-page-edit #birthDate'));				
			});
			
			if (RunningMode.phonegapActive()) {
				if ($('#patient-info-page-view').length>0) {
					scrollPatientInfo = new iScroll('patient-info-page-view', {
									momentum: true,
									hScrollbar: false,
									vScrollbar: true
								 });
				}
				
			
				if ($('#patient-info-page-edit').length>0) {
					scrollPatientInfoEdit = new iScroll('patient-info-page-edit', {
										momentum: true,
										hScrollbar: false,
										vScrollbar: true,
										
										onBeforeScrollStart: function (e) {
											var target = e.target;
											while (target.nodeType != 1) target = target.parentNode;
								
											if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA')
												e.preventDefault();
										}
								 });
				}
				
				if ($('#patient-info-page-edit').length>0) {
					scrollPatientInfoAdd = new iScroll('patient-info-page-add', {
										momentum: true,
										hScrollbar: false,
										vScrollbar: true,
										
										onBeforeScrollStart: function (e) {
											var target = e.target;
											while (target.nodeType != 1) target = target.parentNode;
								
											if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA')
												e.preventDefault();
										}
								 });
				}
			}
			setupClicksound (patient_info_page_id) ;
			
			
			$("#"+patient_info_page_id+"  .edit-icn").bind('vclick', function(e) {
				e.preventDefault();		
				PatientInfoPage.getInfoEdit ();					   
				   	
			});
			
			$("#"+patient_info_page_id+"  input:submit").bind('vclick', function(e) {
				e.preventDefault();			
				e.stopPropagation ();					   
				PatientInfoPage.setPatientinfo ();
			});
			
			$("#"+patient_info_page_id+"  input:reset").bind('vclick', function(e) {
				e.preventDefault();				
				e.stopPropagation ();				   
				$('#'+patient_info_page_id+' #patient-info-view').show();
				$('#'+patient_info_page_id+' #patient-info-edit').hide();
				PatientInfoPage.getInfo();	
			});
			
			PatientInfoPage.setupQuickRegist ();
		},
		
		getInfo : function () {
			if (currentPatientId>0) {
				$.mobile.loading ('show', {text: 'Edit patient data...',
						 textVisible: true,
						 theme: 'a',
						 html: ""
				});
				$.ajax({
					type : "POST",
					url : __config['medico_url'] + __config['medico_summary'],		
					data : {
							method: 'patient_info_data',							
							empId:employeeDS.EMP_ID,
							patientId: currentPatientId,						
							accountId: accountDS.ACCOUNT_ID,
							sessionId: sessionId},
					success : PatientInfoPage.getPatientinfoItemsSuccess,
					error : PatientInfoPage.getPatientinfoItemsFail,
					dataType : "json",
				});
			}
		},
		
		getInfoEdit : function () {
			if (currentPatientId > 0) {
				$.mobile.loading ('show', {text: 'Loading paitent data...',
						 textVisible: true,
						 theme: 'a',
						 html: ""
				});		
				$.ajax({
					type : "POST",
					url : __config['medico_url'] + __config['medico_summary'],		
					data : {
							method: 'patient_info_data',							
							empId:employeeDS.EMP_ID,						
							patientId: currentPatientId,
							accountId: accountDS.ACCOUNT_ID,
							sessionId: sessionId},
					success : PatientInfoPage.getPatientinfoEditItemsSuccess,
					error : PatientInfoPage.getPatientinfoItemsFail,
					dataType : "json",
				});	
			}
		},
		
		getPatientinfoItemsSuccess : function (data) {
			$.mobile.loading ('hide');	
			if (data.error_code=='0') {
				if (typeof data.patient != 'undefined') {
					console.log ("patient-info li amt > "+$("#"+patient_info_page_id+" #patient-info-view li").length);
					$("#"+patient_info_page_id+" #patient-info-view li").eq(0).find('p').text (data.patient.fname);//first
					$("#"+patient_info_page_id+" #patient-info-view li").eq(1).find('p').text (data.patient.lname);//last
					$("#"+patient_info_page_id+" #patient-info-view li").eq(2).find('p').text (data.patient.sexNameEng);//last
					$("#"+patient_info_page_id+" #patient-info-view li").eq(3).find('p').text (data.patient.cid);// cid
					if (data.patient.birthDate!=null) {
						$("#"+patient_info_page_id+" #patient-info-view li").eq(4).find('p').text (data.patient.birthDate);//birthday
					
						$("#"+patient_info_page_id+" #patient-info-view li").eq(5).find('p').text (data.patient.age);//age
					}
					$("#"+patient_info_page_id+" #patient-info-view li").eq(6).find('p').text (data.patient.mobile+" "+data.patient.telHome);//mobile
					$("#"+patient_info_page_id+" #patient-info-view li").eq(7).find('p').text (data.patient.email);//email					
				}				
				
				if (typeof data.address!='undefined') {
					var addr = data.address[0];
					if (typeof addr !='undefined' && typeof addr.address!='undefined') {
						var address = addr.address
						address+= (addr.village!='')?" หมู่ที่ "+addr.village:"" 
						address+= (addr.tambonName!='')?" ตำบล "+addr.tambonName:"";
						address+= (addr.aumphurName!='')?" อำเภอ "+addr.aumphurName:"";
						address+= (addr.provinceName!='')?" จังหวัด "+addr.provinceName:"";
						address+= (addr.zipcode!="")? " รหัสไปรษณีย์ "+addr.zipcode :"";
						
						$("#"+patient_info_page_id+" #patient-info-view li").eq(8).find('p').text (address);//Address
					}
				}
				//scrollPatientInfo.refresh ();
				
				if (typeof patientInfoRender == 'function') {
					patientInfoRender (data);
				}
			}
		},
		
		getPatientinfoEditItemsSuccess: function (data) {
			$.mobile.loading ('hide');	
			if (data.error_code=='0') {
				if (typeof data.patient != 'undefined') {					
					$("#"+patient_info_page_id+"  #patient-info-edit #fname").val (data.patient.fname);
					$("#"+patient_info_page_id+"  #patient-info-edit #lname").val (data.patient.lname);
					//$("#"+patient_info_page_id+"  #patient-info-edit #sex").val (data.patient.sexId);
					
					if (data.patient.sexId==1) {					
						$('#' +patient_info_page_id+ ' input:radio[name="sex"]').filter('[value="1"]').attr('checked', true);
					} else {
						$('#' +patient_info_page_id+ ' input:radio[name="sex"]').filter('[value="2"]').attr('checked', true);
					}
					
					$("#"+patient_info_page_id+"  #patient-info-edit #cid").val (data.patient.cid);
					if (data.patient.birthDate) {
						$("#"+patient_info_page_id+"  #patient-info-edit #birthDate").val (data.patient.birthDate);
					}
					calAge($('#patient-info-page-edit #birthDate').val(), $('#patient-info-page-edit #ageYY'));
					$("#"+patient_info_page_id+"  #patient-info-edit #mobile").val (data.patient.mobile);
					$("#"+patient_info_page_id+"  #patient-info-edit #email").val (data.patient.email);
									
				}				
				
				if (typeof data.address!='undefined') {
					var addr = data.address[0];
					if (typeof addr!='undefined') {
						$("#"+patient_info_page_id+"  #patient-info-edit #addressInfo").val (addr.village);
					}	
				}
				$('#'+patient_info_page_id+' #patient-info-view').hide();
				$('#'+patient_info_page_id+' #patient-info-edit').show();
				
				//setTimeout("PatientInfoPage.scrollPatientInfoEdit.refresh ();",800);
				//scrollPatientInfoEdit.refresh ();
			}
		},
		
		setPatientinfo: function () {			
			$.mobile.loading ('show', {text: 'Save Patient data...',
							 textVisible: true,
							 theme: 'a',
							 html: ""
					});
			var data = {};
			 
			data = {
				fname : $("#"+patient_info_page_id+"  #patient-info-edit #fname").val (),
				lname: $("#"+patient_info_page_id+"  #patient-info-edit #lname").val (),
				lname: $("#"+patient_info_page_id+"  #patient-info-edit #lname").val (),
				cid: $("#"+patient_info_page_id+"  #patient-info-edit #cid").val (),
				birthDate: $("#"+patient_info_page_id+"  #patient-info-edit #birthDate").val (),
				birthDatepicker: $("#"+patient_info_page_id+"  #patient-info-edit #birthDatepicker").val (),
				mobile: $("#"+patient_info_page_id+"  #patient-info-edit #mobile").val (),
				//sex: $("#"+patient_info_page_id+"  #patient-info-edit #sex").val (),
				sex: $('#'+patient_info_page_id+' input[name=sex]:checked').val(),
				email : $("#"+patient_info_page_id+"  #patient-info-edit #email").val ()
			};
			$.ajax({
				type : "POST",
				url : __config['medico_url'] + __config['medico_summary'],		
				data : {
						method: 'patient_info_set',
						data: data,				
						empId:employeeDS.EMP_ID,						
						patientId: currentPatientId,					
						sessionId: sessionId},
				success : PatientInfoPage.setPatientInfoSuccess,
				error : PatientInfoPage.setPatientInfoFail,
				dataType : "json",
			});
			
		},
		
		setPatientInfoSuccess : function () {
			$.mobile.loading ('hide');
			PatientInfoPage.getInfo();
			
			$('#'+patient_info_page_id+' #patient-info-view').show();
			$('#'+patient_info_page_id+' #patient-info-edit').hide();
		},
		
		setPatientInfoFail: function () {
			$.mobile.loading ('hide');
			alert ('Caution Set Fail. ');
			
			$('#'+patient_info_page_id+' #patient-info-view').show();
			$('#'+patient_info_page_id+' #patient-info-edit').hide();
		},
		
		getPatientinfoItemsFail: function () {
			alert("Fail load patient data.");
			$.mobile.loading ('hide');	
			$('#'+patient_info_page_id+' #patient-info-view').show();
			$('#'+patient_info_page_id+' #patient-info-edit').hide();
		},
	
		
		clearForm : function () {
			$("#"+patient_info_page_id+" #patient-info-view li").eq(0).find('p').text ('');//first
			$("#"+patient_info_page_id+" #patient-info-view li").eq(1).find('p').text ('');//last
			$("#"+patient_info_page_id+" #patient-info-view li").eq(2).find('p').text ('');// cid
			$("#"+patient_info_page_id+" #patient-info-view li").eq(3).find('p').text ('');//birthday
			$("#"+patient_info_page_id+" #patient-info-view li").eq(4).find('p').text ('');//mobile
			$("#"+patient_info_page_id+" #patient-info-view li").eq(5).find('p').text ('');//email
			$("#"+patient_info_page_id+" #patient-info-view li").eq(6).find('p').text ('');//Address
		},
		
		clearFormQuick : function () {			
			$("#patient-info-page-add  #fname").val ('');
			$("#patient-info-page-add  #lname").val ('');
			$("#patient-info-page-add  #cid").val ('');
			$("#patient-info-page-add  #birthDate").val ('');
			$("#patient-info-page-add  #ageYY").val ('');
			$("#patient-info-page-add  #mobile").val ('');
			$("#patient-info-page-add  #email").val ('');
			$("#patient-info-page-add  #addressInfo").val ('');
		},
		
		clearView : function () {
			$("#"+patient_info_page_id+"  #patient-info-page-edit #fname").val ('');
			$("#"+patient_info_page_id+"  #patient-info-page-edit #lname").val ('');
			$("#"+patient_info_page_id+"  #patient-info-page-edit #cid").val ('');
			$("#"+patient_info_page_id+"  #patient-info-page-edit #birthDate").val ('');
			$("#"+patient_info_page_id+"  #patient-info-page-edit #ageYY").val ('');
			$("#"+patient_info_page_id+"  #patient-info-page-edit #mobile").val ('');
			$("#"+patient_info_page_id+"  #patient-info-page-edit #email").val ('');
			$("#"+patient_info_page_id+"  #patient-info-page-edit #addressInfo").val ('');
		},
		
		setupQuickRegist : function () {
			$('#patient-info-page-add #birthDatepicker').bind ('change', function () {
				calAge($(this).val(), $('#patient-info-page-add #ageYY'));				
			});
			
			$('#patient-info-page-add #ageYY').bind ('change', function () {
				calBirthDate($(this).val(), $('#patient-info-page-add #birthDatepicker'));				
			});
			//$('#patient-info-page-add #birthDate').attr('type','date');
			if (RunningMode.phonegapActive()) {
				$('#patient-info-page-add #birthDatepicker').replaceWith('<input id="birthDatepicker" type="date" value="" autocapitalize="off"  data-role="none"  >');
			} else {
				$.datepicker.setDefaults( $.datepicker.regional[ "th" ] );
				$('#birthDatepicker').datepicker({
					changeMonth: true,
					changeYear: true,
					showButtonPanel: true,
					dateFormat: "yy-mm-dd",
					yearRange: "c-80:c"
				});
			}
			
			$("#patient-info-page-add input:submit").bind('vclick', function(e) {
				e.preventDefault();		
				e.stopPropagation ();						   
				PatientInfoPage.setQuickPatientinfo ();
			});
			
			$("#patient-info-page-add input:reset").bind('vclick', function(e) {
				e.preventDefault();	
				e.stopPropagation ();			
				$('#'+patient_info_page_id+' #patient-info-page-add').hide();
				$('#'+patient_info_page_id+' #patient-info-view').hide();
				$('#'+patient_info_page_id+' #patient-info-edit').hide();				   				
				changeDepartment (currentStationId);
				reloadPatientSummaryDetail () ;		
				closeToolBarPanel (); 
				$('#toolbar-patient-info a').removeClass('current');
			});
			
			
		},
		
		setQuickPatientinfo: function () {			
			$.mobile.loading ('show', {text: 'Save Patient data...',
							 textVisible: true,
							 theme: 'a',
							 html: ""
					});
			var data = {};
			data = {
				fname : $("#patient-info-page-add .patient-info #fname").val (),
				lname: $("#patient-info-page-add  .patient-info #lname").val (),
				cid: $("#patient-info-page-add .patient-info #cid").val (),
				sex: $('#patient-info-page-add input[name=sex]:checked').val(),
				//sex: $("#patient-info-page-add .patient-info #sex").val (),
				birthDate: $("#patient-info-page-add  .patient-info #birthDate").val (),
				birthDatepicker: $("#patient-info-page-add  .patient-info #birthDatepicker").val (),
				mobile: $("#patient-info-page-add  .patient-info #mobile").val (),
				email : $("#patient-info-page-add  .patient-info #email").val ()
			};
			$.ajax({
				type : "POST",
				url : __config['medico_url'] + __config['medico_summary'],		
				data : {
						method: 'patient_info_quick_set',
						data: data,				
						empId:employeeDS.EMP_ID,											
						sessionId: sessionId},
				success : PatientInfoPage.setQuickPatientinfoSuccess,
				error : PatientInfoPage.setQuickPatientinfoFail,
				dataType : "json",
			});
			
		},
		
		setQuickPatientinfoSuccess : function (data) {
			$.mobile.loading ('hide');
			if (data.error_code=='0') {
				changeDepartment (currentStationId);
				$('#toolbar-patient-info a').removeClass('current');
			} else {
				alert ('Create new Patient Fail.');
			}			
		},
		
		setQuickPatientinfoFail: function (data) {
			alert ('New Patient Fail.');
			$.mobile.loading ('hide');			
		}, 
		
		
	};
}();

	

