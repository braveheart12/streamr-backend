modules = {
	"jquery" {
		resource url:[dir:'js/jquery', file:'jquery-1.11.1.min.js'], disposition: 'head'
	}
	"jquery-ui" {
		dependsOn "jquery"
		resource url:[dir:'js/jquery-ui', file:'jquery-ui.min.js']
		resource url:[dir:'js/jquery-ui', file:'jquery-ui.min.css']
		resource url:[dir:'js/jquery-ui', file:'jquery-ui.theme.min.css']
	}
	"draggabilly" {
		resource url:[dir:'js/draggabilly/dist', file:'draggabilly.pkgd.js']
	}
	// jquery-migrate can be removed when there are no longer dependencies on pre-1.9 jquery
	"jquery-migrate" {
		dependsOn 'jquery'
		resource url:[dir:'js/jquery-migrate-1.2.1', file:'jquery-migrate-1.2.1.min.js']
	}
	"touchpunch" {
		dependsOn 'jquery-ui'
		resource url:[dir:'js/touchpunch/', file:'jquery.ui.touch-punch.min.js', disposition: 'head']
	}
	"password-meter" {
		dependsOn 'jquery'
		resource url:[dir:'js/unifina/password-meter', file:'password-meter.js']
		resource url:[dir:'css/signalPath/widgets', file:'password-meter.css']
		resource url:[dir:'js/zxcvbn', file:'zxcvbn-async.min.js']
	}
	tablesorter {
		dependsOn 'jquery'
		resource url:[dir:'js/tablesorter', file:'jquery.tablesorter.min.js']
	}
	highstock {
		resource url:[dir:'js/highstock-2.0.3', file:'highstock.min.js']
		resource url:[dir:'js/highstock-2.0.3', file:'highcharts-more.js']
	}
	bootstrap {
		dependsOn 'jquery'
		resource url:[dir:'js/bootstrap-3.2.0-dist/js', file:'bootstrap.js']
		resource url:[dir:'js/bootstrap-3.2.0-dist/css', file:'bootstrap.min.css']
	}
	'font-awesome' {
		resource url: "https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"
	}
	'bootstrap-docs' {
		dependsOn "bootstrap"
		resource url:[dir:'js/bootstrap-3.2.0-assets/css', file:'docs.min.css']
	}
	'bootstrap-contextmenu' {
		dependsOn 'bootstrap'
		resource url:[dir:'js/bootstrap-contextmenu', file:'contextmenu.js']
	}
	bootbox {
		dependsOn 'bootstrap'
		resource url:[dir:'js/bootbox', file:'bootbox.js']
	}
	'bootstrap-datepicker' {
		dependsOn 'bootstrap'
		// Current version is from: https://raw.github.com/n9/bootstrap-datepicker/6deee4ec7fa22bd1dee78913e0340f3841f58982/js/bootstrap-datepicker.js
		// due to this issue not yet fixed: https://github.com/eternicode/bootstrap-datepicker/issues/775
		resource url:[dir:'js/bootstrap-datepicker/js', file:'bootstrap-datepicker.js']
	}
	hopscotch {
		resource url:[dir:'js/hopscotch', file:'hopscotch.css']
		resource url:[dir:'js/hopscotch', file:'hopscotch.js']
	}
	typeahead {
		dependsOn 'jquery'
		resource url:[dir:'js/typeahead', file:'typeahead.bundle.js']
	}
	mustache {
		resource url:[dir:'js/mustache-0.8.2', file:'mustache.js']
	}
	codemirror {
		resource url:[dir:'js/codemirror-3.21', file:'codemirror-compressed.js']
		resource url:[dir:'js/codemirror-3.21', file:'codemirror.css']
	}
	jsplumb {
		dependsOn 'jquery'
		dependsOn 'jquery-ui'
		resource url:[dir:'js/jsPlumb/', file:'jquery.jsPlumb-1.5.3.js']
	}
	jstree {
		dependsOn 'jquery'
		resource url:[dir:'js/jsTree', file:'jquery.jstree.js']
		// If you change the theme, check SignalPathTagLib too
		resource url:[dir:'js/jsTree/themes/classic', file:'style.css']
		resource url:[dir:'css/signalPath/widgets', file:'jstree-overrides.css']
	}
	hotkeys {
		dependsOn 'jquery'
		resource url:[dir:'js/hotkeys', file:'jquery.hotkeys.js']
	}
	joyride {
		dependsOn 'jquery'
		resource url:[ dir: 'js/joyride-2.1', file: 'joyride-2.1.css']
		resource url:[ dir: 'js/joyride-2.1', file: 'modernizr.mq.js']
		resource url:[ dir: 'js/joyride-2.1', file: 'jquery.cookie.js']
		resource url:[ dir: 'js/joyride-2.1', file: 'jquery.joyride-2.1.js']
	}
	pnotify {
		dependsOn 'jquery'
		resource url:[dir:'js/pnotify-1.2.0', file:'jquery.pnotify.1.2.2-snapshot.js'], disposition: 'head' // streamr module depends on this and has disposition: head
		resource url:[dir:'js/pnotify-1.2.0', file:'jquery.pnotify.default.css']
	}
	slimscroll {
		dependsOn 'jquery'
		resource url:[dir:'js/slimScroll-1.3.0/', file:'jquery.slimscroll.min.js']
	}
	'raf-polyfill' {
		resource url:[dir:'js/raf-polyfill', file:'raf-polyfill.js']
	}
	webcomponents {
		resource url:[dir:'js/webcomponentsjs', file:'webcomponents.min.js'], disposition:'head'
	}
	lodash {
		resource url:[dir:'js/lodash-3.10.1', file:'lodash.min.js'], disposition: 'head' // streamr module depends on this and has disposition: head
	}
	backbone {
		dependsOn 'lodash,jquery'
		resource url:[dir:'js/backbone', file:'backbone.js']
	}
	'backbone-associations' {
		dependsOn 'backbone'
		resource url:[dir:'js/backbone-associations', file:'backbone-associations-min.js']
	}
	leaflet {
		resource url:[dir:'js/leaflet', file:'leafletGlobalOptions.js']
		resource url:[dir:'js/leaflet', file:'leaflet-src.js']
		resource url:[dir:'js/leaflet', file:'leaflet_canvas_layer.js']
		resource url:[dir:'js/leaflet', file:'leaflet.css']
		resource url:[dir:'js/Leaflet.RotatedMarker', file:'leaflet.rotatedMarker.js']
	}
	dropzone {
		resource url:[dir:'js/dropzone', file:'dropzone.js']
	}
	mathjax {
		resource url:'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.2.0/MathJax.js?config=TeX-AMS_HTML'
	}
	switcher {
		resource url:[dir:'js/pixel-admin', file:'switcher.js']
	}
	// color picker (for search)
	spectrum {
		resource url:[dir:'js/spectrum', file:'spectrum.js']
		resource url:[dir:'js/spectrum', file:'spectrum.css']
	}
	moment {
		resource url:[dir:'js/moment', file:'moment.js']
	}
	'moment-timezone' {
		dependsOn 'moment'
		resource url:[dir:'js/moment', file:'moment-timezone-with-data-2010-2020.js']
	}
	clipboardjs {
		resource url:[dir:'js/clipboardjs', file:'clipboard.js']
	}

	/**
	 * In-house widgets and resources
	 */
	streamr {
		dependsOn 'pnotify, lodash'
		resource url:[dir:'js/unifina', file:'streamr.js'], disposition: 'head' // disposition: head because some react-based stuff outside grails resource management depend on this
	}
	tour {
		dependsOn 'hopscotch, streamr'
		resource url:[dir:'js/unifina/tour', file:'tour.js']
	}
	'webcomponent-resources' {
		dependsOn 'streamr-client, streamr-chart, streamr-heatmap, streamr-table, streamr-button, streamr-switcher, streamr-text-field, streamr-map'
	}
	'stream-fields' {
		dependsOn 'jquery, backbone'
		resource url:[dir:'js/unifina/stream-fields', file:'stream-fields.js']
	}
	'streamr-search' {
		dependsOn 'typeahead'
		dependsOn 'lodash'
		resource url:[dir:'js/unifina/streamr-search', file:'streamr-search.js']
	}
	'streamr-floating-search' {
		dependsOn 'streamr-search'
		resource url:[dir:'js/unifina/streamr-search', file:'streamr-floating-search.js']
	}
	'remote-tabs' {
		dependsOn 'bootbox, mustache'
		resource url:[dir:'js/unifina/remote-tabs', file:'remote-tabs.js']
	}
	'sharing-dialog' {
		dependsOn 'bootbox, backbone, switcher'
		resource url: [dir: 'js/unifina/sharing-dialog', file: 'sharing-dialog.js']
	}
	'signalpath-browser' {
		dependsOn 'remote-tabs'
		resource url:[dir:'js/unifina/signalpath-browser', file:'signalpath-browser.js']
	}
	'module-browser' {
		dependsOn 'mathjax, bootstrap, lodash, streamr'
		resource url:[dir:'js/unifina/module-browser', file:'module-browser.js']
	}
	'key-value-editor' {
		dependsOn 'bootstrap, backbone, mustache, list-editor'
		resource url:[dir:'js/unifina/key-value-editor', file:'key-value-editor.js']
	}
	'list-editor' {
		dependsOn 'bootstrap, backbone, mustache'
		resource url:[dir:'js/unifina/list-editor', file:'list-editor.js']
	}
	toolbar {
		dependsOn 'jquery'
		resource url:[dir:'js/unifina/toolbar', file:'toolbar.js']
	}
	'global-error-handler' {
		dependsOn 'jquery, bootbox'
		resource url:[dir:'js/unifina', file:'globalJavascriptExceptionHandler.js']
		resource url:[dir:'js/unifina', file:'globalAjaxSessionExpirationHandler.js']
	}
	'signalpath-widgets' {
		resource url:[dir:'css/signalPath/widgets', file:'loadBrowser.css']
	}
	'streamr-client' {
		resource url:[dir:'js/unifina/streamr-client', file:'streamr-client.js']
	}
	'streamr-chart' {
		dependsOn 'jquery,highstock'
		resource url:[dir:'js/unifina/streamr-chart', file:'streamr-chart.js']
	}
	'streamr-button' {
		dependsOn 'jquery'
		resource url:[dir:'js/unifina/streamr-button', file:'streamr-button.js']
	}
	'streamr-switcher' {
		dependsOn 'jquery'
		resource url:[dir:'js/unifina/streamr-switcher', file:'streamr-switcher.js']
	}
	'streamr-text-field' {
		dependsOn 'jquery'
		resource url:[dir:'js/unifina/streamr-text-field', file:'streamr-text-field.js']
	}
	'streamr-heatmap' {
		dependsOn 'jquery, leaflet'
		resource url:[dir:'js/unifina/streamr-heatmap', file:'heatmap.min.js']
		resource url:[dir:'js/unifina/streamr-heatmap', file:'leaflet-heatmap.js']
		resource url:[dir:'js/unifina/streamr-heatmap', file:'streamr-heatmap.js']
	}
	'streamr-map' {
		dependsOn 'jquery, leaflet, font-awesome'
		resource url:[dir:'css/signalPath/widgets/', file:'streamr-map.css']
		resource url:[dir:'js/unifina/streamr-map', file:'streamr-map.js']
	}
	'streamr-table' {
		resource url:[dir:'js/unifina/streamr-table', file:'streamr-table.js']
	}
	'streamr-credentials-control' {
		dependsOn 'backbone, streamr, clipboardjs, bootbox, confirm-button'
		resource url:[dir:'js/unifina/streamr-credentials-control', file:'streamr-credentials-control.js']
	}
	'scrollspy-helper' {
		resource url:[dir:'js/unifina/scrollspy-helper', file:'scrollspy-helper.js']
	}
	'canvas-controls' {
		dependsOn 'signalpath-core, backbone'
		resource url:[dir:'js/unifina/signalPath/controls', file:'canvas-start-button.js']
	}
	'name-editor' {
		resource url:[dir:'js/unifina/streamr-name-editor', file:'streamr-name-editor.js']
	}
	'confirm-button' {
		resource url:[dir:'js/unifina/confirm-button', file:'confirm-button.js']
	}
	'signalpath-core' {
		// Easier to merge if dependencies are one-per-row instead of comma-separated list
		dependsOn 'streamr'
		dependsOn 'streamr-client'
		dependsOn 'streamr-chart'
		dependsOn 'streamr-table'
		dependsOn 'streamr-heatmap'
		dependsOn 'streamr-map'
		dependsOn 'streamr-button'
		dependsOn 'streamr-switcher'
		dependsOn 'streamr-text-field'
		dependsOn 'jsplumb'
		dependsOn 'jstree'
		dependsOn 'highstock'
		dependsOn 'codemirror'
		dependsOn 'tablesorter'
		dependsOn 'bootstrap-contextmenu'
		dependsOn 'typeahead'
		dependsOn 'raf-polyfill'
		dependsOn 'signalpath-widgets'
		dependsOn 'mathjax'
		dependsOn 'spectrum'
		dependsOn 'lodash'
		dependsOn 'key-value-editor'
		dependsOn 'list-editor'
		dependsOn 'confirm-button'
		dependsOn 'name-editor'
		dependsOn 'draggabilly'
		dependsOn 'streamr-search'
		dependsOn 'streamr-floating-search'
		resource url:[dir:'js/unifina/signalPath/core', file:'signalPath.js']
		resource url:[dir:'js/unifina/signalPath/generic', file:'emptyModule.js']
		resource url:[dir:'js/unifina/signalPath/generic', file:'genericModule.js']
		resource url:[dir:'js/unifina/signalPath/generic', file:'uiChannelModule.js']
		resource url:[dir:'js/unifina/signalPath/core', file:'IOSwitch.js']
		resource url:[dir:'js/unifina/signalPath/core', file:'Endpoint.js']
		resource url:[dir:'js/unifina/signalPath/core', file:'Input.js']
		resource url:[dir:'js/unifina/signalPath/core', file:'VariadicInput.js']
		resource url:[dir:'js/unifina/signalPath/core', file:'VariadicOutput.js']
		resource url:[dir:'js/unifina/signalPath/core', file:'Parameter.js']
		resource url:[dir:'js/unifina/signalPath/core', file:'Output.js']
		resource url:[dir:'js/unifina/signalPath/specific', file:'chartModule.js']
		resource url:[dir:'js/unifina/signalPath/specific', file:'heatmapModule.js']
		resource url:[dir:'js/unifina/signalPath/specific', file:'mapModule.js']
		resource url:[dir:'js/unifina/signalPath/specific', file:'imageMapModule.js']
		resource url:[dir:'js/unifina/signalPath/specific', file:'inputModule.js']
		resource url:[dir:'js/unifina/signalPath/specific', file:'gaugeModule.js']
		resource url:[dir:'js/unifina/signalPath/specific', file:'customModule.js']
		resource url:[dir:'js/unifina/signalPath/specific', file:'solidityModule.js']
		resource url:[dir:'js/unifina/signalPath/specific', file:'ethereumContractInput.js']
		resource url:[dir:'js/unifina/signalPath/specific', file:'tableModule.js']
		resource url:[dir:'js/unifina/signalPath/specific', file:'commentModule.js']
		resource url:[dir:'js/unifina/signalPath/specific', file:'labelModule.js']
		resource url:[dir:'js/unifina/signalPath/specific', file:'schedulerModule.js']
		resource url:[dir:'js/unifina/signalPath/specific', file:'scheduler.js']
		resource url:[dir:'js/unifina/signalPath/specific', file:'streamModule.js']
		resource url:[dir:'js/unifina/signalPath/specific', file:'filterModule.js']
		resource url:[dir:'js/unifina/signalPath/generic', file:'subCanvasModule.js']
		resource url:[dir:'js/unifina/signalPath/specific', file:'canvasModule.js']
		resource url:[dir:'js/unifina/signalPath/specific', file:'forEachModule.js']
		resource url:[dir:'js/unifina/signalPath/specific', file:'exportCSVModule.js']
	}
	'signalpath-theme' {
		dependsOn 'signalpath-core'
		resource url:[dir:'css/signalPath/themes/light', file:'light.css']
		resource url:[dir:'css/signalPath/themes/light', file:'light.js']
	}
	'main-theme' {
		dependsOn 'bootstrap, font-awesome'
		resource url: "https://fonts.googleapis.com/css?family=Open+Sans:300italic,400italic,600italic,700italic,400,600,700,300&subset=latin", attrs: [type: "css"]
		resource url:[dir:'css/compiled-less', file:'main.css']
	}
	'marked' {
		resource url:[dir: 'js/marked/', file: 'marked.min.js']
	}
	'swagger' {
		dependsOn 'jquery, lodash, jquery-migrate, marked'
		resource url:[dir: 'js/swagger-ui/dist/lib/', file: 'jquery.slideto.min.js']
		resource url:[dir: 'js/swagger-ui/dist/lib/', file: 'jquery.wiggle.min.js']
		resource url:[dir: 'js/swagger-ui/dist/lib/', file: 'jquery.ba-bbq.min.js']
		resource url:[dir: 'js/swagger-ui/dist/lib/', file: 'handlebars-2.0.0.js']
		resource url:[dir: 'js/swagger-ui/dist/lib/', file: 'backbone-min.js']
		resource url:[dir: 'js/swagger-ui/dist/', file: 'swagger-ui.min.js']
		resource url:[dir: 'js/swagger-ui/dist/lib/', file: 'highlight.7.3.pack.js']
		resource url:[dir: 'js/swagger-ui/dist/lib/', file: 'jsoneditor.min.js']
		resource url:[dir: 'js/swagger-ui/dist/lib/', file: 'swagger-oauth.js']
		resource url:[dir: 'js/swagger-ui/dist/css/', file: 'reset.css']
		resource url:[dir: 'js/swagger-ui/dist/css/', file: 'screen.css']
	}

}
