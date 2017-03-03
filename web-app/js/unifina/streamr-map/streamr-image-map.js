
(function(exports) {
	function StreamrImageMap(element, options) {
		Object.assign(options, {
			centerY: 0.5,
			centerX: 0.5
		}, options)
		
		if (!this.options.customImageUrl) {
			throw new Error("No image url!")
		}
		AbstractStreamrMap.call(this, element, options)
	}
	
	StreamrImageMap.prototype = AbstractStreamrMap.prototype
	
	StreamrImageMap.prototype.createMapLayer = function() {
		// Load image with jQuery to get width/height
		var _this = this
		$("<img/>", {
			src: this.options.customImageUrl,
			load: function() {
				_this.customImageWidth = this.width;
				_this.customImageHeight = this.height;
				console.info("Read", _this.options.customImageUrl, "with dimensions", this.width, "x", this.height)
				
				_this.map.options.crs = L.CRS.Simple
				_this.map.setView(L.latLng(_this.options.centerLat, _this.options.centerLng), _this.options.zoom, {
					animate: false
				})
				var bounds = L.latLngBounds(L.latLng(_this.customImageHeight, 0), L.latLng(0, _this.customImageWidth))
				L.imageOverlay(_this.options.customImageUrl, bounds).addTo(_this.map)
				_this.parent.find(".leaflet-tile-pane").css("z-index", 1000)
			}
		})
	}
	
	AbstractStreamrMap.prototype.getCenterAndZoom = function() {
		return {
			centerY: this.map.getCenter().lat / this.customImageHeight,
			centerX: this.map.getCenter().lng / this.customImageWidth,
			zoom: this.map.getZoom()
		}
	}
	
	AbstractStreamrMap.prototype.handleMessage = function(d) {
		if (d.t) {
			if (d.t === "p") {
				this.addMarker(d)
			} else if (d.t === "d") {
				if (d.markerList && d.markerList.length) {
					this.removeMarkersByIds(d.markerList)
				}
				if (d.pointList && d.pointList.length) {
					this.removeTracePoints(d.pointList)
				}
			}
		}
	}
	
})(typeof(exports) !== 'undefined' ? exports : window)