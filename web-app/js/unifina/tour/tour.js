(function(exports) {

var tourUrlRoot = Streamr.createLink({ uri: 'static/js/tours/' })
var tourIdPrefix = Streamr.user
var startableTours = []
var continuableTours = []

var urlRe = /[\?\&]playTour=([0-9]*)/

function loadUserCompletedTours(cb) {
	$.get(Streamr.createLink({ controller: 'TourUser', action: 'list' }), cb)
}

function Tour() {
	this._modules = {}
	this._steps = []
	this._tourNumber = 0
	this._beforeStart = function(cb) {
		cb()
	}
}



Tour.startableTours = function(tourNumbers) {
	startableTours = tourNumbers
}

Tour.continuableTours = function(tourNumbers) {
	continuableTours = tourNumbers
}

/**
 * Selects and starts a tour:
 * - If a tour is specified in the URL, play it
 * - Else if a tour state is saved for this user and continuable from current page, continue
 * - Else if a tour is startable from current page, start it if the user has not completed it yet
 */
Tour.autoStart = function() {
	var urlParam = window.location.search.match(urlRe)
	if (urlParam) {
		return Tour.playTour(parseInt(urlParam[1], 10))
	}

	var state = hopscotch.getState()
	
	console.log("startableTours: "+startableTours+", continuableTours: "+continuableTours)
	console.log('Tour state', state)

	// Try continue
	if (state && continuableTours.length>0) {
		var prefix = state.split("#")[0]
		
		if (prefix !== tourIdPrefix) {
			console.log("Tour prefix does not match, not continuing. State: "+state+", Prefix: "+tourIdPrefix)
		}
		else {
			state = state.split("#")[1]
			var currentTour = parseInt(state.split(':')[0], 10) || 0
			var currentStep = parseInt(state.split(':')[1], 10) || 0
			
			if (continuableTours.indexOf(currentTour) !== -1 && currentStep>0) {
				return Tour.loadTour(currentTour, function(tour) {
					tour.start(currentStep)
				})				
			}
			else console.log("Can not continue tour on this page: "+state)
		}
	}

	// Try start
	if (startableTours.length>0) {
		loadUserCompletedTours(function(completedTours) {
			console.log('Tour.completedTours', completedTours)
	
			startableTours.some(function(tourNumber) {
				if (completedTours.indexOf(tourNumber) === -1) {
					Tour.playTour(tourNumber)
					return false
				}
			})
		})
	}
}

Tour.playTour = function(tourNumber, currentStep) {
	console.log('Tour.playTour', tourNumber)

	hopscotch.endTour()

	Tour.loadTour(tourNumber, function(tour) {
		tour.start(currentStep || 0)
	})
}

Tour.loadTour = function(tourNumber, cb) {
	var url = tourUrlRoot + tourNumber + '.js'

	Tour.create = function() {
		console.log('Tour.create', tourNumber)

		var tour = new Tour()
		tour.ready = function() {
			tour.setTourNumber(tourNumber)

			if (cb)
				cb(tour)

			return this
		}

		return tour
	}

	//Use jQuery instead of appending script tag to head due to caching issues
	$.getScript(url)
}

Tour.list = function(cb) {
	$.getJSON(tourUrlRoot + 'index.json', function(resp) {
		cb(resp)
	})
}

// ---

Tour.prototype.setGrailsPage = function(controller, action) {
	this._controller = controller
	this._action = action
	return this
}

Tour.prototype.setTourNumber = function(n) {
	this._tourNumber = n
}

Tour.prototype.next = function() {
	hopscotch.nextStep()
}

Tour.prototype._completed = function() {
	console.log('Tour completed', this._tourNumber)
	this._markAsCompleted()
}

Tour.prototype._markAsCompleted = function() {
	$.post(Streamr.createLink({ controller: 'TourUser', action: 'completed' }),
		{ tourNumber: this._tourNumber })
}

Tour.prototype._closed = function() {
	console.log('Tour closed', this._tourNumber)
	return this._markAsCompleted()
}

Tour.prototype.start = function(step) {
	var that = this

	if (step === 0 && this._controller && this._controller !== Streamr.controller) {
		window.location = Streamr.createLink(this._controller, this._action) +
			'?playTour=' + this._tourNumber
		return false;
	}

	window.tour = this // for debugging, may be removed

	this._beforeStart(function() {
		hopscotch.startTour({
			steps: that._steps,
			id: tourIdPrefix+"#"+that._tourNumber,
			onClose: function() {
				that._closed()
			},
			onEnd: function() {
				that._completed()
			},
		}, step)
	})
}

Tour.prototype.beforeStart = function(cb) {
	this._beforeStart = cb
	return this
}

Tour.prototype.offerNextTour = function(text) {
	var that = this

	return this.step(text, 'body', {
		ctaLabel: "Begin",
		showCTAButton: true,
		placement: 'top',
		yOffset: 300,
		xOffset: 200,
		nextOnTargetClick: false,
		showNextButton: false,
		onCTA: function() {
			Tour.playTour(that._tourNumber + 1)
		}
	})
}

Tour.prototype.step = function(content, target, opts, onShow) {
	var options = opts || {}

	if (typeof(opts) === 'function') {
		onShow = opts
		options = {}
	}

	if (!target && !opts) {
		// defaults for showing only text
		target = 'body'
		options = {
			placement: 'top',
			yOffset: 300,
			xOffset: 200,
			nextOnTargetClick: false
		}
	}

	this._steps.push($.extend({
		content: content,
		target: target,
		zindex: 3000,
		placement: 'right',
		showBackButton: false, // Back button disabled at least until CORE-227 is fixed
		showNextButton: (!onShow && !options.nextOnTargetClick),
		onShow: function() {
			var tgt = target
			
			if (typeof(target) === 'function')
				tgt = target()
			
			// Un-reference old targets and remove drag handlers
			$(".tour-current-target").closest(".ui-draggable").off("drag.tour")
			$(".tour-current-target").removeClass("tour-current-target")
			
			// Add the target class and drag handler to current target
			$(tgt).addClass("tour-current-target")
			$(tgt).closest(".ui-draggable").on("drag.tour", function() {
				hopscotch.refreshBubblePosition()
			})
			
			if (!onShow)
				return;

			// call onShow in next tick, as elements may not have been drawn yet
			setTimeout(onShow, 0)
		}
		
	}, options))

	return this
}

Tour.prototype.bindModule = function(moduleName, div) {
	if (!this._modules[moduleName])
		this._modules[moduleName] = 1

	div.addClass('tour' + moduleName + this._modules[moduleName]++)
}

Tour.prototype._getSpObject = function(name) {
	return $('.'+name).data('spObject')
}

Tour.prototype.waitForMultiple = function(waits) {
	var _cb = this.next.bind(this)
	var count = 0

	return function(cb) {
		if (cb)
			_cb = cb

		waits.forEach(function(waitFor) {
			setTimeout(function() {
				waitFor(function() {
					if (++count === waits.length)
						_cb()	
				})
			}, 0) // setup in next tick
		})
	}
}

Tour.prototype.waitForModulesAdded = function(moduleNames) {
	var that = this
	var _cb = this.next.bind(this)

	var count = 0

	function listener() {
		count++
		if (count === moduleNames.length)
			_cb()
	}

	return function(cb) {
		if (cb)
			_cb = cb
		moduleNames.forEach(function(mn) {
			that.waitForModuleAdded(mn)(listener)
		})
	}
}

Tour.prototype.waitForModuleAdded = function(moduleName) {
	var that = this
	var _cb = this.next.bind(this)

	return function(cb) {
		if (cb)
			_cb = cb

		function listener(e, jsonData, div) {
			if (jsonData.name !== moduleName)
				return;

			that.bindModule(moduleName, div)

			$(SignalPath).off('moduleAdded.tour', listener)

			_cb()
		}

		$(SignalPath).on('moduleAdded.tour', listener)
	}
}

Tour.prototype.waitForInput = function(selector, content) {
	var _cb = this.next.bind(this)

	return function(cb) {
		if (cb)
			_cb = cb

		var $sel = $(selector)

		function _listener() {
			if ($sel.val() === content) {
				$sel.off('change.tour keypress.tour paste.tour focus.tour textInput.tour input.tour', _listener)
				_cb()
			}
		}

		$sel.on('change.tour keypress.tour paste.tour focus.tour textInput.tour input.tour', _listener)
	}
}

Tour.prototype.waitForEvent = function(selector, eventName) {
	var _cb = this.next.bind(this)

	return function(cb) {
		if (cb)
			_cb = cb

		$(selector).one(eventName, _cb)
	}
}

Tour.prototype.waitForConditionOnEvent = function(selector, eventName, checkFunction) {
	var _cb = this.next.bind(this)

	return function(cb) {
		if (cb)
			_cb = cb

		$(selector).on(eventName+".tour", function(event) {
			if (checkFunction(event)) {
				$(selector).off(eventName+".tour")
				_cb()
			}
		})
	}
}

Tour.prototype.waitForYAxis = function(sourceSelector, sourceOutputName, chartSelector, targetYAxis) {
	return this.waitForConditionOnEvent(chartSelector, 'yAxisChanged', function(event) {
		// Get the correct y-axis change button 
		var eps = $(sourceSelector).data("spObject").getOutput(sourceOutputName).getConnectedEndpoints()
		var yAxisButton
		eps.forEach(function(it) {
			if (it.div.parents(chartSelector).length && it.div.find(".y-axis-number").length)
				yAxisButton = it.div.find(".y-axis-number")
		})
		
		if (yAxisButton)
			return yAxisButton.text() == targetYAxis
		else return true // don't get stuck
	})
}

Tour.prototype.waitForStream = function(selector, streamName) {
	var _cb = this.next.bind(this)

	return function(cb) {
		if (cb)
			_cb = cb

		var $module = $($(selector).data('spObject'))
		$module.on('updated.tour', function(e, data) {
			data.params.some(function(param) {
				if (!param.streamName)
					return;

				if (param.streamName === streamName) {
					$module.off('updated.tour')
					_cb()
					return true
				}
			})
		})
	}
}

Tour.prototype.waitForConnections = function(conns) {
	var that = this
	var _triggered = false
	var parsedConns = []
	var _cb = this.next.bind(this)

	conns.forEach(function(conn) {
		var from = conn[0], to = conn[1]
		var fromModule = from.split('.')[0]
		var fromEndpoint = from.split('.')[1]
		var toModule = to.split('.')[0]
		var toEndpoint = to.split('.')[1]
		parsedConns.push({
			fromModule: fromModule, fromEndpoint: fromEndpoint,
			toModule: toModule, toEndpoint: toEndpoint
		})
	})

	function checkConnections() {
		var connsMade = 0

		if (_triggered)
			return;

		parsedConns.forEach(function(c) {
			var targetModule = that._getSpObject(c.toModule)
			var targetEndpoints = targetModule.getInputs()

			if (c.toEndpoint)
				targetEndpoints = [ targetModule.getInput(c.toEndpoint) ]

			targetEndpoints.forEach(function(targetEp) {
				targetEp.getConnectedEndpoints().forEach(function(xEndpoint) {
					if (!xEndpoint.module.div.hasClass(c.fromModule))
						return;

					if (c.fromEndpoint && xEndpoint.json.name !== c.fromEndpoint)
						return;

					connsMade++

					if (connsMade === conns.length) {
						setListeners(false)
						_triggered = true
						_cb()
					}
				})
			})
		})
	}

	function setListeners(onOff) {
		parsedConns.forEach(function(c) {
			$('.'+c.toModule)[onOff ? 'on' : 'off']('spConnect', checkConnections)
		})
	}

	return function(cb) {
		if (cb)
			_cb = cb
		setListeners(true)
	}
}

exports.Tour = Tour

})(typeof(exports) !== 'undefined' ? exports : window)
