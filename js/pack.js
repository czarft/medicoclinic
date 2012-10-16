/******************************************************************************
 * Copyright (c) 2005 By MedicoSoft Co.,Ltd.
 * All rights reserved.
 * Project : Medico mobile
 * 
 * $URL: $
 * $Rev: $
 * $Author: $
 * $Date:$
 * $Id: $
 ******************************************************************************/
/** @file  contain common function share function
 *  @brief 
 *
 */


///////////////////////////////////////////////////////////////////////////////
// Function
/////////////////
function setupHistoryTab (scope) {
	//alert ($('#'+scope+' #tabs').attr('setup') );
	
	if (typeof $('#'+scope+' #tabs').attr('setup') == "undefined") 
	{
		$('#'+scope+' #tabs').attr('setup','true');
	
		$('#'+scope+' #tabs ul>li.present').addClass('active');
		$('#'+scope+' #tabs ul>li.recent').removeClass('active');
		//$('#toggle-list').hide();
		
		$('#service-container #'+scope+' .entry .recent-present table').hide();
		$('#service-container #'+scope+' .entry .tabs-content-recent').hide();	
		
		$('#service-container #'+scope+' .entry .recent-present>ul').show();
		$('#service-container #'+scope+' .entry .tabs-content-present').show();	
		$('#service-container #'+scope+' .entry .toggle-list').show();
		
		
		$('#'+scope+' #tabs ul>li.recent').bind('vclick',function (e) {
			$('#service-container #'+scope+'  .entry .toggle-list').hide();
			$('#'+scope+' #tabs ul>li').removeClass('active');
			$('#'+scope+' .toggle-list').hide();
			$('#service-container #'+scope+' .entry .recent-present>ul').hide();
			$('#service-container #'+scope+' .entry .tabs-content-present').hide();
			$('#'+scope+' .toggle-form').hide();
			$(this).addClass('active');
			$('#service-container #'+scope+' .entry .recent-present table').show();
			$('#service-container #'+scope+' .entry .tabs-content-recent').show();
		});
		
		$('#'+scope+' #tabs ul>li.present').bind('vclick',function (e) {
			$('#service-container #'+scope+' .entry .toggle-list').show();
			$('#'+scope+' #tabs ul>li').removeClass('active');
			$('#service-container #'+scope+' .entry .recent-present table').hide();
			$('#service-container #'+scope+' .entry .tabs-content-recent').hide();
			$(this).addClass('active');
			$('#'+scope+' .toggle-list').show();
			
			if ($('#service-container #'+scope+' .recent-present > ul>li').length==0) {
				$("#icd10-page .recent-present >ul").hide ();
			} else {
				$('#service-container #'+scope+' .entry .recent-present>ul').show();
			}
			$('#service-container #'+scope+' .entry .tabs-content-present').show();
			//$('.toggle-form').show();
		}); 
	}
	$('#'+scope+' .toggle-form').hide();
	
	
}

function setupNewDeleteButton (obj) {
	$(obj).find(".delete-btn").first().hide();
	
	
	$(obj).live ('swipeleft',function (e) {
		e.stopPropagation();	
		$(this).find ('.delete-btn').first().show();
	});
	$(obj).live ('swiperight',function (e) {
		e.stopPropagation();
		$(this).find ('.delete-btn').first().hide();
	});
}

function setupDeleteButton (scope) {
	
	$('#'+scope+' .delete-btn').hide();
	
	//alert ($(".recent-present ul li").length);
	$('#'+scope+' .recent-present >ul >li').live ('swipeleft',function (e) {
		e.stopPropagation();	
		$(this).find ('.delete-btn').first().fadeIn(500);
	});
	$('#'+scope+' .recent-present >ul >li').live ('swiperight',function (e) {
		e.stopPropagation();
		$(this).find ('.delete-btn').first().fadeOut();
	});
	
	
}
function HideOtherService () {
	$('#service-container>div').each (function () {
		$(this).hide();
	});
} 

function LoadServiceModule (url, param, setupFunc, arg) {
	HideOtherService ();
	if (typeof setupFunc == 'undefined' || setupFunc =='')
 	{
 		alert ("Module fail.");
 		return;
 	}	
 	
 	
 	if (typeof loaded_service [url] !='undefined') {
 		console.log("LoadServiceModule: switch "+loaded_service [url]);
		$("#"+loaded_service [url]).show();
		if (setupFunc.indexOf("setup")==0) {
			eval (setupFunc+"()");	
		} else {
			if (typeof arg !='undefined') {
				eval (setupFunc+".setup("+arg+")");				
			} else {
				eval (setupFunc+".setup()");
			}
		}
		
	} else {
		console.log("LoadServiceModule: "+url);
		$.ajax({
			type : "GET",
			url : url,
			cache: false,
			data : {},
			success : function (html) {				
				$(html).hide().appendTo('#service-container').show().trigger('pageload');				
				if (setupFunc.indexOf("setup")==0) {
					eval (setupFunc+"()");	
				} else {
					if (typeof arg !='undefined') {
						eval (setupFunc+".setup("+arg+")");						
					} else {
						eval (setupFunc+".setup()");
					}
				}					
			},
			error : function () {
				alert('module load fail.');				
			},
			dataType : "html",
		});
	}
}


function randomNum ()  {
	var adjustedHigh = (parseFloat(6) - parseFloat(2)) + 1;
    var numRand = Math.floor(Math.random()*adjustedHigh) + parseFloat(1);
    //alert (numRand);
	return numRand;
}

function clearToolbar () {
	$('#service-tools nav>ul>li a').each (function (index) {
		$(this).removeClass ("current");
	});
}

function prependListSearch (page, html) {	
	$(html).insertBefore("#"+page+" .toggle-list div ul>li.loading");
	//$("#"+page+" .toggle-list div ul").append(html);
}

function clearSearchList (page) {
	var el = $("#"+page+" .toggle-list div ul>li");
	$.each (el, function () {
		if (!$(this).hasClass('loading') ) {
			$(this).remove ();
		}
	});
}

function removeClassToolbar () {
	if (RunningMode.phonegapActive()) {
		$('#content').removeClass('with-toolbar');	
		$('#content').removeClass('without-toolbar');
	}	
}

function openToolBarPanel () {
	if (RunningMode.phonegapActive()) {
		$('#content').removeClass('without-toolbar');
		$('#content').addClass('with-toolbar');
		toolbarIsOpen = true;
	}
}

function closeToolBarPanel () {
	if (RunningMode.phonegapActive()) {
		$('#content').removeClass('with-toolbar');
		$('#content').addClass('without-toolbar');
		toolbarIsOpen = false;
	}
}

// onSuccess Callback
//
function onPlayAudioSuccess() {
    console.log("playAudio():Audio Success");
}

// onError Callback 
//
function onPlayAudioError(error) {
    alert('code: '    + error.code    + '\n' + 
          'message: ' + error.message + '\n');
}

function setupClicksound (pageId) {	
	
	
	//console.log ("["+pageId+"] Bind amt = "+$('#'+pageId+' a, #'+pageId+' input:submit, #'+pageId+' [class$=icn]').length);
	$('#'+pageId+' a, #'+pageId+' input:submit, #'+pageId+' [class$=icn]').bind( 'vclick',function(){	        	       	    
       	if (RunningMode.phonegapActive()) {
       		my_media.play();
       	}
    });	
 
}

function clearTableHistory (pageId) {
	if (pageId!='') {
		$('#'+pageId+ ' div.recent-present table tr').remove();	
	}
}

function calBMI () {
	var w = parseFloat ($('#vitalsign-edit #weight').val());
	var h = parseFloat ($('#vitalsign-edit #height').val());
	
	var bmi = w / (h * h / 10000.00);
	bmi = bmi.toFixed(2);
	$('#vitalsign-edit #bmi').val(bmi);
}

function calBirthDate (val, obj) {
	var tmpObj  = $(obj);
	$.ajax({
		type : "POST",
		url : __config['medico_url'] + __config['medico_summary'],		
		data : {
				method: 'cal_birthdate',
				data: {age:val},																			
				sessionId: sessionId},
		success : function(data){
	         if (data.error_code=='0') {
	         	$(tmpObj).val(data.dateEng.yy+"-"+data.dateEng.mm+"-"+data.dateEng.dd);
	         	$('#patient-info-page-add #mobile').focus();
	         }
	    },
		error : function(data){
	         alert(data);
	    },
		dataType : "json",
	});
}

function calAge (val, obj) {
	var tmpObj  = $(obj);
 	$.ajax({
		type : "POST",
		url : __config['medico_url'] + __config['medico_summary'],		
		data : {
				method: 'cal_age',
				data: {birthday:val},				
				sessionId: sessionId},
		success : function(data){
	         if (data.error_code=='0') {
	         	$(tmpObj).val(data.age.year);	         	
	         	$('#patient-info-page-add #mobile').focus();
	         }
	    },
		error : function(data){
	         alert(data);
	    },
		dataType : "json",
	});
}

function calPayment () {
	var _total = new Number ($('#total-cost-input').val());
	var _recv = new Number ( $('#receive-payment-input').val());
	var _returnVal = 0 ;
	if (_recv > _total) {   			
		_returnVal = _recv - _total;
	} else {
		_returnVal = 0;
	}
	$('#return-payment-input').val (_returnVal);
}

function numpadClick (val) {
	if (val==null) {
		$('#receive-payment-input').val("");
	} else {
		var p = $('#receive-payment-input').val();
		$('#receive-payment-input').val (p+""+val);
		calPayment();
	}

}

function replaceLastWord (word,  lasword) {
	var _tmpTxt = word;
	var _tmpArr = _tmpTxt.split(" ");
	var retStr = '';
	var len = (_tmpArr.length>0)?_tmpArr.length-1:0;
	
	if (len==0) {
		retStr = lasword+" ";	
	} else {
		for (var index=len; index!=-1; index--) {
			if (_tmpArr[index]!='' && lasword) {
				_tmpArr[index] = lasword;
				lasword = '';
			} 
			retStr = _tmpArr[index]+" "+retStr;	
		}					
	}
	return retStr;
}

function findLastWord (word) {
	var _tmpResult = '';
	var _tmpTxt = word;
	var _tmpArr = _tmpTxt.split(" ");
	
	
	// abc test  12345 ooo|6
	//abc test  12345 ooo |5
	var len = (_tmpArr.length>0)?_tmpArr.length-1:0;
	
	if (len==0) {
		_tmpResult = _tmpArr[0];
	} else {
		for (var index=len; index!=0; index--) {
			if (_tmpArr[index]!='') {
				_tmpResult = _tmpArr[index];				
				break;
			} 
		}					
	}
	
	return _tmpResult;
}
