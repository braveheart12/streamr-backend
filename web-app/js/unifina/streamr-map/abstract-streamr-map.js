
(function(exports) {

    var TRACE_REDRAW_BATCH_SIZE = 10000

    // default non-directional marker icon
    var DEFAULT_MARKER_ICON = "fa fa-map-marker fa-4x"

    

    function AbstractStreamrMap(parent, options) {

        var _this = this

        this.parent = $(parent)

        this.untouched = true

        this.markers = {}
        this.pendingMarkerUpdates = {}
        this.pendingLineUpdates = []

        this.animationFrameRequested = false

        // Default options
        this.options = $.extend({}, {
            zoom: 2,
            minZoom: 2,
            maxZoom: 18,
            traceWidth: 2,
            drawTrace: false,
            markerIcon: DEFAULT_MARKER_ICON
        }, options || {})

        this.defaultAutoZoomBounds = {
            lat: {
                min: Infinity,
                max: -Infinity
            },
            lng: {
                min: Infinity,
                max: -Infinity
            }
        }
        this.autoZoomBounds = this.defaultAutoZoomBounds

        if (!this.parent.attr("id")) {
            this.parent.attr("id", "map-" + Date.now())
        }
        
		this.createMap()
		this.createMapLayer()

        if (this.options.drawTrace) {
            this.lineLayer = this.createTraceLayer()
        }
    }

    AbstractStreamrMap.prototype.createMap = function() {
		var _this = this
		
		this.map = new L.Map(this.parent[0], {
			center: new L.LatLng(this.options.centerLat, this.options.centerLng),
			zoom: this.options.zoom,
			minZoom: this.options.minZoom,
			maxZoom: this.options.maxZoom
		})
		var mouseEventHandler = function() {
			_this.untouched = false
		}
	
		this.map.once("dragstart click", mouseEventHandler)
		// For some reason, listening to 'wheel' event didn't work
		this.map._container.addEventListener("mousewheel", mouseEventHandler)
		// 'mousewheel' doesn't work in Firefox but 'DOMMouseScroll' does
		this.map._container.addEventListener("DOMMouseScroll", mouseEventHandler)
	
		//this.map.on("moveend", function() {
		//	$(_this).trigger("move", {
		//		centerLat: _this.getCenter().lat,
		//		centerLng: _this.getCenter().lng,
		//		zoom: _this.getZoom()
		//	})
		//})
		return this.map
	}

    AbstractStreamrMap.prototype.createTraceLayer = function() {
        var _this = this
        this.traceUpdates = {}
        this.lastLatLngs = {}
        function isInsideCanvas(point, canvas) {
            return point.x >= 0 && point.x <= canvas.width && point.y >= 0 && point.y <= canvas.height
        }
        var TraceLayer       = L.CanvasLayer.extend({
            renderLines: function(canvas, ctx, updates) {
                ctx.lineWidth = _this.options.traceWidth
                ctx.strokeStyle = updates[0] && updates[0].color || 'rgba(255,0,0,1)'
                ctx.beginPath()
                var length = updates.length
                while(length--) {
                    var from = _this.map.latLngToContainerPoint(updates[length].fromLatLng)
                    var to = _this.map.latLngToContainerPoint(updates[length].toLatLng)
                    if (from.x != to.x || from.y != to.y || isInsideCanvas(from, canvas) || isInsideCanvas(to, canvas) ) {
                        if (ctx.strokeStyle !== updates[length].color) {
                            ctx.strokeStyle = updates[length].color || 'rgba(255,0,0,1)'
                        }
                        ctx.moveTo(from.x, from.y)
                        ctx.lineTo(to.x, to.y)
                    }
                }
                ctx.stroke()
            },
            
            render: function(changesOnly) {
                var linePointLayer = this
                var canvas = this.getCanvas()
                var ctx = canvas.getContext('2d')

                var updates = []
                if (changesOnly) {
                    updates = _this.pendingLineUpdates
                } else {
                    _.each(_this.traceUpdates, function(t) {
                        updates.push(t)
                    })
                    // clear canvas
                    ctx.clearRect(0, 0, canvas.width, canvas.height)
                }

                if (!changesOnly && _this.requestedAnimationFrame) {
                    L.util.cancelAnimFrame(_this.requestedAnimationFrame)
                }
                
                function redrawTrace(i) {
                    var count = i + TRACE_REDRAW_BATCH_SIZE
                    if (updates.length) {
                        _this.requestedAnimationFrame = L.Util.requestAnimFrame(function() {
                            redrawTrace(count)
                        })
                    }
                    linePointLayer.renderLines(canvas, ctx, updates.splice(0, count))
                }
                redrawTrace(0)
    
    
                _this.pendingLineUpdates = []
            }
        })

        return new TraceLayer({
            zIndexOffset: 10
        }).addTo(this.map)
    }
    
    AbstractStreamrMap.prototype.getZoom = function() {
        return this.map.getZoom()
    }

    AbstractStreamrMap.prototype.getCenter = function() {
        return this.map.getCenter()
    }

    AbstractStreamrMap.prototype.setCenter = function(lat, lng) {
        this.map.setView(new L.LatLng(lat, lng))
    }

    AbstractStreamrMap.prototype.addMarker = function(attr) {
        var id = attr.id
        var label = attr.label || attr.id
        var lat = attr.y
        var lng = attr.x
        var rotation = attr.dir
        var color = attr.color
        var latlng = new L.LatLng(lat, lng)

        if(this.options.autoZoom && this.untouched) {
            this.setAutoZoom(lat, lng)
        }

        var marker = this.markers[id]
        if (marker === undefined) {
            this.markers[id] = this.createMarker(id, label, latlng, rotation)
        } else {
            this.moveMarker(id, lat, lng, rotation)
        }
        if(this.options.drawTrace) {
            var tracePointId = attr.tracePointId
            this.addTracePoint(id, lat, lng, color, tracePointId)
        }

        return marker
    }
    
    AbstractStreamrMap.prototype.removeMarkerById = function(id) {
        var marker = this.markers[id]
        delete this.markers[id]
        delete this.pendingMarkerUpdates[id]
        if (this.lastLatLngs) {
            delete this.lastLatLngs[id]
        }
        this.map.removeLayer(marker)
    }
    
    AbstractStreamrMap.prototype.removeMarkersByIds = function(idList) {
        for (var i in idList) {
            this.removeMarkerById(idList[i])
        }
    }
    
    AbstractStreamrMap.prototype.removeTracePoints = function(tracePointIds) {
        for (var i=0; i < tracePointIds.length; ++i) {
            delete this.traceUpdates[tracePointIds[i]]
        }
        this.lineLayer.render()
    }
    
    AbstractStreamrMap.prototype.setAutoZoom = function(lat, lng) {
        var _this = this

        this.autoZoomBounds.lat.min = Math.min(lat, this.autoZoomBounds.lat.min)
        this.autoZoomBounds.lat.max = Math.max(lat, this.autoZoomBounds.lat.max)
        this.autoZoomBounds.lng.min = Math.min(lng, this.autoZoomBounds.lng.min)
        this.autoZoomBounds.lng.max = Math.max(lng, this.autoZoomBounds.lng.max)

        this.lastEvent = [
            [this.autoZoomBounds.lat.max, this.autoZoomBounds.lng.min],
            [this.autoZoomBounds.lat.min, this.autoZoomBounds.lng.max]
        ]

        if (this.autoZoomTimeout === undefined) {
            this.autoZoomTimeout = setTimeout(function() {
                _this.autoZoomTimeout = undefined
                _this.map.fitBounds(_this.lastEvent)
            }, 1000)
        }
    }

    AbstractStreamrMap.prototype.createMarker = function(id, label, latlng, rotation) {
        var marker = this.options.directionalMarkers ? L.marker(latlng, {
            icon: L.divIcon({
                iconSize:     [19, 48], // size of the icon
                iconAnchor:   [10, 10], // point of the icon which will correspond to marker's location
                popupAnchor:  [0, -41], // point from which the popup should open relative to the iconAnchor,
                className: 'streamr-map-icon ' + this.options.markerIcon
            })
        }) : L.marker(latlng, {
            icon: L.divIcon({
                iconSize:     [19, 48], // size of the icon
                iconAnchor:   [13.5, 43], // point of the icon which will correspond to marker's location
                popupAnchor:  [0, -41], // point from which the popup should open relative to the iconAnchor,
                className: 'streamr-map-icon fa fa-map-marker fa-4x'
            })
        })
        marker.bindPopup("<span>"+label+"</span>", {
            closeButton: false,
        })
        marker.on("mouseover", function() {
            marker.openPopup()
        })
        marker.on("mouseout", function() {
            marker.closePopup()
        })
        if (rotation) {
            marker.setRotationAngle(rotation)
        }
        marker.addTo(this.map)
        return marker
    }

    AbstractStreamrMap.prototype.moveMarker = function(id, lat, lng, rotation) {
        var newLatLng = L.latLng(lat, lng)
        var update = { latlng: newLatLng }
        if (this.options.directionalMarkers) {
            if (rotation) {
                update.rotation = rotation
            } else if (this.markers[id] !== undefined) {
                // if "heading" input isn't connected,
                //   rotate marker so that it's "coming from" the previous latlng
                var oldLatLng = this.markers[id].getLatLng()
                var oldP = this.map.project(oldLatLng)
                var newP = this.map.project(newLatLng)
                var dx = newP.x - oldP.x
                var dy = newP.y - oldP.y
                if (Math.abs(dx) > 0.000001 || Math.abs(dy) > 0.000001) {
                    update.rotation = Math.atan2(dx, -dy) / Math.PI * 180;
                }
            }
        }

        this.pendingMarkerUpdates[id] = update
        this.requestUpdate()
    }

    AbstractStreamrMap.prototype.requestUpdate = function() {
        if (!this.animationFrameRequested) {
            this.animationFrameRequested = true;
            L.Util.requestAnimFrame(this.animate, this, true);
        }
    }

    AbstractStreamrMap.prototype.animate = function() {
        var _this = this
        Object.keys(this.pendingMarkerUpdates).forEach(function(id) {
            var update = _this.pendingMarkerUpdates[id]

            // Update marker position
            var marker = _this.markers[id]
            marker.setLatLng(update.latlng)
            if (update.hasOwnProperty("rotation")) {
                marker.setRotationAngle(update.rotation)
            }
        })

        if (this.lineLayer) {
            this.lineLayer.render(true)
        }

        this.pendingMarkerUpdates = {}
        this.animationFrameRequested = false
    }

    AbstractStreamrMap.prototype.addTracePoint = function(id, lat, lng, color, tracePointId) {
        var latlng = L.latLng(lat,lng)
        var lastLatLng = this.lastLatLngs[id]
        if (lastLatLng) {
            var update = {
                id: id,
                fromLatLng: latlng,
                toLatLng: lastLatLng,
                color: color,
                tracePointId: tracePointId
            }
            this.pendingLineUpdates.push(update)
            this.traceUpdates[tracePointId] = update
        }
        
        this.lastLatLngs[id] = latlng
    }

    

    AbstractStreamrMap.prototype.resize = function(width, height) {
        this.parent.css("width", width+"px")
        this.parent.css("height", height+"px")
        this.map.invalidateSize()
        if(this.options.drawTrace)
            this.lineLayer.redraw()
    }

    AbstractStreamrMap.prototype.toJSON = function() {
        return this.getCenterAndZoom();
    }

   

    AbstractStreamrMap.prototype.clear = function() {
        var _this = this
        $.each(this.markers, function(k, v) {
            _this.map.removeLayer(v)
        })
        if(this.lineLayer) {
            var ctx = this.lineLayer.getCanvas().getContext('2d')
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            this.traceUpdates = {}
            this.lastLatLngs = {}
        }

        this.autoZoomBounds = this.defaultAutoZoomBounds

        this.markers = {}
        this.pendingMarkerUpdates = {}
        this.pendingLineUpdates = []
    }

    exports.AbstractStreamrMap = AbstractStreamrMap

})(typeof(exports) !== 'undefined' ? exports : window)
