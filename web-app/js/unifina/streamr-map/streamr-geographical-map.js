
(function(exports) {
	
	var skins = {
		default: {
			layerUrl: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
			layerAttribution: "© OpenStreetMap contributors, Streamr"
		},
		cartoDark: {
			layerUrl: "http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png",
			layerAttribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://cartodb.com/attributions">CartoDB</a>, Streamr'
		},
		esriDark: {
			layerUrl: "{s}.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
			layerAttribution: "Esri, HERE, DeLorme, MapmyIndia, © OpenStreetMap contributors, Streamr"
		}
	}
	
	function StreamrGeographicalMap(element, options) {
		Object.assign(options, {
			centerY: 35,
			centerX: 15,
			skin: "default"
		}, options)
		this.skin = skins[this.options.skin] || skins.default
		
		AbstractStreamrMap.call(this, element, options)
	}
	
	StreamrGeographicalMap.prototype = AbstractStreamrMap.prototype
	
	StreamrGeographicalMap.prototype.createMapLayer = function() {
		L.tileLayer(
			this.skin.layerUrl, {
				attribution: this.skin.layerAttribution,
				minZoom: this.options.minZoom,
				maxZoom: this.options.maxZoom
			}
		).addTo(this.map)
	}
	
	AbstractStreamrMap.prototype.getCenterAndZoom = function() {
		return {
			centerY: this.map.getCenter().lat,
			centerX: this.map.getCenter().lng,
			zoom: this.map.getZoom()
		}
	}
	
})(typeof(exports) !== 'undefined' ? exports : window)