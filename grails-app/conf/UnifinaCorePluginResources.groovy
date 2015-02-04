modules = {
	// jquery-migrate can be removed when there are no longer dependencies on pre-1.9 jquery
	"jquery-migrate" {
		dependsOn 'jquery'
		resource url:[dir:'js/jquery-migrate-1.2.1', file:'jquery-migrate-1.2.1.min.js', plugin: 'unifina-core']
	}
	"touchpunch" {
		dependsOn 'jquery-ui'
		resource url:[dir:'js/touchpunch/', file:'jquery.ui.touch-punch.min.js', disposition: 'head', plugin: 'unifina-core']
	}
	"password-meter" {
		dependsOn 'jquery'
		resource url:[dir:'js/unifina/password-meter', file:'password-meter.js', plugin: 'unifina-core']
		resource url:[dir:'css/signalPath/widgets', file:'password-meter.css', plugin: 'unifina-core']
		resource url:[dir:'js/zxcvbn', file:'zxcvbn-async.min.js', plugin: 'unifina-core']
	}
	tablesorter {
		dependsOn 'jquery'
		resource url:[dir:'js/tablesorter', file:'jquery.tablesorter.min.js', plugin: 'unifina-core']
	}
	highstock {
		resource url:[dir:'js/highstock-2.0.3', file:'highstock.js', plugin: 'unifina-core']
		resource url:[dir:'js/highstock-2.0.3', file:'highcharts-more.js', plugin: 'unifina-core']
	}
	bootstrap {
		dependsOn 'jquery'
		// resource url:[dir:'js/bootstrap-3.2.0-dist/js', file:'bootstrap.min.js', plugin: 'unifina-core']
		resource url:[dir:'js/bootstrap-3.2.0-dist/js', file:'bootstrap.js', plugin: 'unifina-core']
		resource url:[dir:'js/bootstrap-3.2.0-dist/css', file:'bootstrap.min.css', plugin: 'unifina-core']
	}
	'bootstrap-contextmenu' {
		dependsOn 'bootstrap'
		resource url:[dir:'js/bootstrap-contextmenu', file:'contextmenu.js', plugin: 'unifina-core']
	}
	bootbox {
		dependsOn 'bootstrap'
		resource url:[dir:'js/bootbox', file:'bootbox.js', plugin: 'unifina-core']
	}
	'bootstrap-datepicker' {
		dependsOn 'bootstrap'
		// Current version is from: https://raw.github.com/n9/bootstrap-datepicker/6deee4ec7fa22bd1dee78913e0340f3841f58982/js/bootstrap-datepicker.js
		// due to this issue not yet fixed: https://github.com/eternicode/bootstrap-datepicker/issues/775
		resource url:[dir:'js/bootstrap-datepicker/js', file:'bootstrap-datepicker.js', plugin: 'unifina-core']
		resource url:[dir:'js/bootstrap-datepicker/css', file:'datepicker.css', plugin: 'unifina-core']
	}
	hopscotch {
		resource url:[dir:'js/hopscotch', file:'hopscotch.css', plugin: 'unifina-core']
		resource url:[dir:'js/hopscotch', file:'hopscotch.js', plugin: 'unifina-core']
	}
	typeahead {
		dependsOn 'jquery'
		resource url:[dir:'js/typeahead', file:'typeahead.bundle.min.js', plugin: 'unifina-core']
	}
	mustache {
		resource url:[dir:'js/mustache-0.8.2', file:'mustache.js', plugin: 'unifina-core']
	}
	codemirror {
		resource url:[dir:'js/codemirror-3.21', file:'codemirror-compressed.js', plugin: 'unifina-core']
		resource url:[dir:'js/codemirror-3.21', file:'codemirror.css', plugin: 'unifina-core']
	}
	jsplumb {
		dependsOn 'jquery'
		dependsOn 'jquery-ui'
		resource url:[dir:'js/jsPlumb/', file:'jquery.jsPlumb-1.5.3.js', plugin: 'unifina-core']
	}
	jstree {
		dependsOn 'jquery'
		resource url:[dir:'js/jsTree', file:'jquery.jstree.js', plugin: 'unifina-core']
		// If you change the theme, check SignalPathTagLib too
		resource url:[dir:'js/jsTree/themes/classic', file:'style.css', plugin: 'unifina-core']
		resource url:[dir:'css/signalPath/widgets', file:'jstree-overrides.css', plugin: 'unifina-core']
	}
	atmosphere {
		dependsOn 'jquery, jquery-migrate'
		resource url:[dir:'js/atmosphere', file:'jquery.atmosphere.js', plugin: 'unifina-core']
	}
	"socket-io" {
		resource url:[dir:'js/socket.io-1.2.1', file:'socket.io-1.2.1.min.js', plugin: 'unifina-core']
	}
	hotkeys {
		dependsOn 'jquery'
		resource url:[dir:'js/hotkeys', file:'jquery.hotkeys.js', plugin: 'unifina-core']
	}
	joyride {
		dependsOn 'jquery'
		resource url:[ dir: 'js/joyride-2.1', file: 'joyride-2.1.css', plugin: 'unifina-core']
		resource url:[ dir: 'js/joyride-2.1', file: 'modernizr.mq.js', plugin: 'unifina-core']
		resource url:[ dir: 'js/joyride-2.1', file: 'jquery.cookie.js', plugin: 'unifina-core']
		resource url:[ dir: 'js/joyride-2.1', file: 'jquery.joyride-2.1.js', plugin: 'unifina-core']
	}
	pnotify {
		dependsOn 'jquery'
//		resource url:[dir:'js/pnotify-1.2.0', file:'jquery.pnotify.min.js']
		resource url:[dir:'js/pnotify-1.2.0', file:'jquery.pnotify.1.2.2-snapshot.js', plugin: 'unifina-core']
		resource url:[dir:'js/pnotify-1.2.0', file:'jquery.pnotify.default.css', plugin: 'unifina-core']
	}
	slimscroll {
		dependsOn 'jquery'
		resource url:[dir:'js/slimScroll-1.3.0/', file:'jquery.slimscroll.min.js', plugin: 'unifina-core']
	}
	'detect-timezone' {
		resource url:[dir:'js/timezones', file:'detect_timezone.js', plugin: 'unifina-core']
		resource url:[dir:'js/timezones', file:'list_timezones.js', plugin: 'unifina-core']
	}
	'raf-polyfill' {
		resource url:[dir:'js/raf-polyfill', file:'raf-polyfill.js', plugin: 'unifina-core']
	}
	webcomponents {
		resource url:[dir:'js/webcomponentsjs', file:'webcomponents.min.js', plugin: 'unifina-core'], disposition:'head'
	}
	underscore {
		resource url:[dir:'js/underscore', file:'underscore-min.js', plugin: 'unifina-core']
	}
	backbone {
		dependsOn 'underscore,jquery'
		resource url:[dir:'js/backbone', file:'backbone.js', plugin: 'unifina-core']
	}
	
	/**
	 * In-house widgets and resources
	 */
	streamr {
		resource url:[dir:'js/unifina', file:'streamr.js', plugin: 'unifina-core']
	}
	tour {
		dependsOn 'hopscotch, streamr'
		resource url:[dir:'js/unifina/tour', file:'tour.js', plugin: 'unifina-core']
	}
	'stream-fields' {
		dependsOn 'jquery, backbone'
		resource url:[dir:'js/unifina/stream-fields', file:'stream-fields.js', plugin: 'unifina-core']
	}
	'search-control' {
		dependsOn 'typeahead'
		resource url:[dir:'js/unifina/search-control', file:'search-control.js', plugin: 'unifina-core']
	}
	'remote-tabs' {
		dependsOn 'bootbox, mustache'
		resource url:[dir:'js/unifina/remote-tabs', file:'remote-tabs.js', plugin: 'unifina-core']
	}
	'signalpath-browser' {
		dependsOn 'remote-tabs'
		resource url:[dir:'js/unifina/signalpath-browser', file:'signalpath-browser.js', plugin: 'unifina-core']
	}
	toolbar {
		dependsOn 'jquery'
		resource url:[dir:'js/unifina/toolbar', file:'toolbar.js', plugin: 'unifina-core']
	}
	'global-error-handler' {
		dependsOn 'jquery, bootbox'
		resource url:[dir:'js/unifina', file:'globalJavascriptExceptionHandler.js', plugin: 'unifina-core']
		resource url:[dir:'js/unifina', file:'globalAjaxSessionExpirationHandler.js', plugin: 'unifina-core']
	}
	'signalpath-widgets' {
		resource url:[dir:'css/signalPath/widgets', file:'loadBrowser.css', plugin: 'unifina-core']
		resource url:[dir:'css/signalPath/widgets', file:'typeahead.css', plugin: 'unifina-core']
	}
	'streamr-client' {
		dependsOn 'jquery, socket-io'
		resource url:[dir:'js/unifina/streamr-socketio-client', file:'streamr-client.js', plugin: 'unifina-core']
	}
	'signalpath-core' {
		dependsOn 'streamr, streamr-client, jsplumb, jstree, highstock, codemirror, tablesorter, bootstrap-contextmenu, typeahead, detect-timezone, raf-polyfill, signalpath-widgets'
		resource url:[dir:'js/unifina/signalPath/core', file:'signalPath.js', plugin: 'unifina-core']
		resource url:[dir:'js/unifina/signalPath/generic', file:'emptyModule.js', plugin: 'unifina-core']
		resource url:[dir:'js/unifina/signalPath/generic', file:'genericModule.js', plugin: 'unifina-core']
		resource url:[dir:'js/unifina/signalPath/core', file:'IOSwitch.js', plugin: 'unifina-core']
		resource url:[dir:'js/unifina/signalPath/core', file:'Endpoint.js', plugin: 'unifina-core']
		resource url:[dir:'js/unifina/signalPath/core', file:'Input.js', plugin: 'unifina-core']
		resource url:[dir:'js/unifina/signalPath/core', file:'Parameter.js', plugin: 'unifina-core']
		resource url:[dir:'js/unifina/signalPath/core', file:'Output.js', plugin: 'unifina-core']
		resource url:[dir:'js/unifina/signalPath/specific', file:'chartModule.js', plugin: 'unifina-core']
		resource url:[dir:'js/unifina/streamr-chart', file:'streamr-chart.js', plugin: 'unifina-core']
		resource url:[dir:'css/signalPath/modules', file:'chartModule.css', plugin: 'unifina-core']
		resource url:[dir:'css/signalPath/modules', file:'eventTable.css', plugin: 'unifina-core']
		resource url:[dir:'js/unifina/signalPath/specific', file:'gaugeModule.js', plugin: 'unifina-core']
		resource url:[dir:'js/unifina/signalPath/specific', file:'customModule.js', plugin: 'unifina-core']
		resource url:[dir:'js/unifina/signalPath/specific', file:'tableModule.js', plugin: 'unifina-core']
		resource url:[dir:'js/unifina/signalPath/specific', file:'commentModule.js', plugin: 'unifina-core']
		resource url:[dir:'css/signalPath/modules', file:'commentModule.css', plugin: 'unifina-core']
		resource url:[dir:'js/unifina/signalPath/specific', file:'labelModule.js', plugin: 'unifina-core']
	}
	'signalpath-theme' {
		dependsOn 'signalpath-core'
		resource url:[dir:'css/signalPath/themes/light', file:'light.css', plugin: 'unifina-core']
		resource url:[dir:'css/signalPath/themes/light', file:'light.js', plugin: 'unifina-core']
	}
	'main-theme' {
		dependsOn 'bootstrap'
		resource url: "https://fonts.googleapis.com/css?family=Open+Sans:300italic,400italic,600italic,700italic,400,600,700,300&subset=latin", attrs: [type: "css"]
		resource url:[dir:'css/compiled-less', file:'main.css', plugin: 'unifina-core']
	}
}
