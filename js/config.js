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
/** @file
 *  @brief 
 *
 */
var toolbarIsOpen = false;			// Toolbar Status
var __config = new Array ();			// global config
var loaded_service = new Array ();  // loaded service 
var lastsendToDS = new Array ();	// Datasorce lastsend department
var openDrawing = false;			// state control for open Drawing tool
var my_media =null;					// resource click sound for phonegap 
var mediaTimer=null;				// not used	
var dbo;								//Main DB object
var dbname = 'medico';				//Main DB object
var reloadQueueInterval = 15000;

__config['medico_url'] = 'http://localhost/medico';
__config['medico_mobile_folder'] = '/mobile/mobile';
__config['medico_auth'] = __config['medico_mobile_folder']+'/auth.php';
__config['medico_summary'] = __config['medico_mobile_folder']+'/summary.php';
__config['queue'] = __config['medico_mobile_folder']+'/queue.php';
__config['sendto'] = __config['medico_mobile_folder']+'/sendto.php';
__config['image'] = __config['medico_mobile_folder']+'/image.php';
__config['files'] = __config['medico_mobile_folder']+'/files.php';
__config['sync'] = __config['medico_mobile_folder']+'/sync.php';
__config['camera-flash'] = __config['medico_mobile_folder']+'/camera-flash.php';
__config['cash'] = __config['medico_mobile_folder']+'/cash.php';
__config['files_att'] = __config['medico_url']+'/share/share/showImageFile.php';


var RunningMode = function () {
	var currentmode = "window";
	var _phonegapActive = false;
	return {
		windows : function () {
			currentmode = 'window';
			// switch to medicoclinic.com when deploy to server
			//__config['medico_url'] = 'http://localhost/medico';
			__config['medico_url'] = 'http://www.medico.in.th/medico-multilang';
  			__config['image_path'] = __config['medico_url']+__config['medico_mobile_folder'];			
		},
		ipad : function () {
			currentmode = 'ipad';
			//__config['medico_url'] = 'http://localhost/medico';
			__config['medico_url'] = 'http://www.medico.in.th/medico-multilang';
  			__config['image_path'] = __config['medico_url']+__config['medico_mobile_folder'];
		},
		getmode : function () {
			return this.currentmode;
		},
		phonegapActive : function (val) {
			if (typeof val == 'undefined') {
				return _phonegapActive;
			} else {
				_phonegapActive = val;
			}
		}
	};	
}();

// GLOBAL DELAY FUNCTION
var delay = (function(){
var timer = 0;
  return function(callback, ms){
    clearTimeout (timer);
    timer = setTimeout(callback, ms);
  };
})();

// PHONEGAP EVENT
document.addEventListener("deviceready", 
function () {
	console.log('[deviceready] start.');        
    pictureSource=navigator.camera.PictureSourceType;
    destinationType=navigator.camera.DestinationType;
    RunningMode.phonegapActive(true);     
	my_media = new Media("wav/click-1.wav", onPlayAudioSuccess, onPlayAudioError);
	my_media.prepare (); 
	
}, false);
 
// PAGEINIT EVENT FOR JQUERY MOBILE 
$( document ).bind( "pageinit", function() {
	//init for phonegap
	$.support.cors = true;
	$.mobile.buttonMarkup.hoverDelay = true;
    $.mobile.allowCrossDomainPages = true;
    $.mobile.pushStateEnabled = false;
    
});

$(window).bind( 'orientationchange', function(e){
  console.log( 'orientation: ' + window.orientation );
});


// MOBILEINIT EVENT FOR JQUERY MOBILE
$(document).bind("mobileinit", function () {
	console.log ('mobileinit.');
	$.mobile.ignoreContentEnabled = true;           
});
if (typeof $.datepicker !='undefined') {
	jQuery(function($){
		$.datepicker.regional['th'] = {
			closeText: 'ปิด',
			prevText: '&laquo;&nbsp;ย้อน',
			nextText: 'ถัดไป&nbsp;&raquo;',
			currentText: 'วันนี้',
			monthNames: ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
			'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'],
			monthNamesShort: ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.',
			'ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'],
			dayNames: ['อาทิตย์','จันทร์','อังคาร','พุธ','พฤหัสบดี','ศุกร์','เสาร์'],
			dayNamesShort: ['อา.','จ.','อ.','พ.','พฤ.','ศ.','ส.'],
			dayNamesMin: ['อา.','จ.','อ.','พ.','พฤ.','ศ.','ส.'],
			weekHeader: 'Wk',
			dateFormat: 'dd/mm/yy',
			firstDay: 0,
			isRTL: false,
			showMonthAfterYear: false,
			yearSuffix: ''};
		$.datepicker.setDefaults($.datepicker.regional['th']);
	});
}

// ONLOAD DOCUMENT FOR JQUERY 
$(document).ready(function(){

	
    
	
});
