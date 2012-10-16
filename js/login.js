///////////////////////////////////////////////////////////////////////////////
// LOGIN PAGE 
/////////////////

var accountId = 0;
var sessionId = 0;

$("#login-page").live('pageshow', function() {	  
  	$("#login-form,#button-register-help").show();  		  	  		
    console.log ("login-page pageshow");       		
});

$("#login-page").live('pagehide', function() {	
	backLoginAnim();
});


$("#login-page").live('pagecreate', function() {
	
	setupClicksound ('login-page') ;
	$('.description-note').hide();
	$("#loading-element > li").hide();
	// set up contact form link
	$('.panel .register').bind('tap',function (e) {
		$('.panel').addClass('flip');
		e.preventDefault();
	});
	$('.panel .login').bind('tap',function (e) {
		$('.panel').removeClass('flip');
		// just for effect we'll update the content
		e.preventDefault();
	});
	
	$('#loginBtt').bind ('click',function (e) {
		e.preventDefault();  	
		submitForm ();
	});
	
	$("#login-form").submit( function (e) {
	  e.preventDefault(); 
	  submitForm ();		  
	} );
	
	$('#close-btt').click (function (e){
		e.preventDefault();  		
		window.close();
	});
	$('input[type=text],input[type=password]').css('color','#000');
	
	$('#userName').focus();
});

function submitForm () {
	if ($('#userName').val()=='') {
		alert ('Username is empty.');	
		return;
	}
	 
	if ($('#userPassword').val()=='') {
		alert ('Password is empty.');
		return;
	}
	$('#userName').blur();
	$('#userPassword').blur();		
	$('#button-register-help').hide();
	$("#login-form").fadeOut(500,  completeLoginAnim);
}


function gotoSummary() {
	// ajax call
	//$.post(__config['medico_url']+__config['medico_auth'], $("#login-form").serialize(),loginResult, "json");
	//window.open (__config['medico_url'] + __config['medico_auth']);
	$.ajax({
		type : "POST",
		url : __config['medico_url'] + __config['medico_auth'],
		data : $("#login-form").serialize(),
		success : loginResult,
		error : loginFail,
		dataType : "json",
	});
}

function loginFail(data, status) {
	//alert (data+" "+status);
	//$.mobile.changePage( "summary.html", { transition: "flip"} );
	//location = 'summary.html';
	//loginResult(data, status)
	alert ("Can not connect to server.");
	backLoginAnim();
}

function loginResult(data, status) {
	
	if (data.error_code!=0) {
		alert (data.error_desc);
		backLoginAnim();		
	} else {
		accountId =  data.accountId;
		sessionId = data.sessionId;
		//dbo.setSetting ($('#userName').val(), $('#userPassword').val(),'');
		$.mobile.changePage("summary.html", {
			transition : "flow",
			reverse : false,
			reloadPage : true,
			changeHash : true
		});
	}
}

function completeLoginAnim() {
	$("#loading-element > li").show();
	$('#loading-element > li').addClass('rotate')	
	setTimeout("gotoSummary()", 800);
}

function backLoginAnim() {
	$("#loading-element > li").hide();
	$('#button-register-help').show();
	$('#loading-element > li').removeClass('rotate');
	$('#logo-element, #button-register-help, #loading-element').removeClass('login-start')
	$("#login-form").fadeIn(500);	
}

