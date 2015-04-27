
function ZoomControl(parent, step, minZoom, maxZoom, cb) {
	// Create elements in parent
	// Bind button handlers
	var btnTemplate = ''
		+	'<div class="zoom-buttons btn-group btn-group-vertical">'
		+		'<button class="btn btn-default btn-sm zoom-in">'
		+			'<i class="fa fa-plus"></i>'
		+		'</button>'
		+		'<button class="btn btn-default btn-sm zoom-out">'
		+			'<i class="fa fa-minus"></i>'
		+		'</button>'
		+	'</div>'

	var buttons = $(btnTemplate)
	$(parent).append(buttons)

	var zoom = 1
	buttons.find(".zoom-out").click(function(){
		if(zoom > minZoom)
			zoom-=step
			cb(zoom)
	})
	buttons.find(".zoom-in").click(function(){
		if(zoom < maxZoom)
			zoom+=step
			cb(zoom)
	})
}