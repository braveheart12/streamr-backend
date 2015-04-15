(function(exports) {

//Change the variable signs from <%= var %> to {{ var }}
_.templateSettings = {
	evaluate : /\{\[([\s\S]+?)\]\}/g,
	escape : /\[\[([\s\S]+?)\]\]/g,
	interpolate : /\{\{([\s\S]+?)\}\}/g
};

var UiChannel = Backbone.Model.extend({
	defaults: {
		name:"",
		id: "",
		checked: false,
	},
	toggle: function () {
		this.set("checked", !this.get("checked"))
	}
})
  
var UiChannelList = Backbone.Collection.extend({
	model: UiChannel
})

var UiChannelView = Backbone.View.extend({
	tagName: "li",
	className: "uichannel",	
	template: _.template($("#uichannel-template").html()),

	events: {
		"click .uichannel-title" : "toggleChecked"
	},

	initialize: function () {
		if(this.model.get("checked"))
			this.$el.addClass("checked")
		this.listenTo(this.model, "change:checked", this.render)
	},

	render: function() {
		this.$el.html(this.template(this.model.toJSON()))
		if (this.model.get("checked")) {
			this.$el.addClass("checked")
		} else {
			this.$el.removeClass("checked")
		}
		return this
	},

	toggleChecked: function () {
		this.model.toggle();
		if (this.model.get("checked")) {
			this.$el.trigger("checked", [this.model])
		} else {
			this.$el.trigger("unchecked", [this.model])
		}
	}
})

var RunningSignalPath = Backbone.Model.extend({
	defaults: {
		name: "",
		uiChannels: ""
	},
	initialize: function (){
		this.howManyChecked = 0
		this.uiChannelCollection = new UiChannelList(this.get("uiChannels"))
		_.each(this.uiChannelCollection.models, function(model){
			if(model.get("checked"))
				this.howManyChecked++
		},this)
	}
})

var RunningSignalPathList = Backbone.Collection.extend({
	model: RunningSignalPath
})

var RunningSignalPathView = Backbone.View.extend({
	tagName: "li",
	className: "runningsignalpath mm-dropdown mm-dropdown-root",
	template: _.template($("#rsp-template").html()),

	events: {
		"click .rsp-title" : "openClose"
	},
	
	initialize: function (){
		this.model.uiChannelCollection.on("change:checked", function(model){
			if(model.get("checked") == true)
				this.model.howManyChecked++
			else {
				this.model.howManyChecked--
			}
			this.render()
		},this)
	},

	render: function() {
		if(!this.$el.children().length) {
			this.$el.append(this.template(this.model.toJSON()))
			this.$el.append(this.renderUIC())
		}
		if(this.model.howManyChecked)
			this.$el.find(".howmanychecked").html(this.model.howManyChecked)
		else this.$el.find(".howmanychecked").empty()
		return this
	},

	renderUIC: function () {
		var channels = this.el, list = $("<ul/>", {
			class: "mmc-dropdown-delay animated fadeInLeft"
		})
		_.each(this.model.uiChannelCollection.models, function(item){
			var uiChannelView = new UiChannelView({
				model: item
			})
			list.append(uiChannelView.render().el)
		}, this)
		return list
	},

	openClose: function() {
		this.$el.toggleClass("open")
	}
})

var DashboardItem = Backbone.AssociatedModel.extend({
	defaults: {
		title: "",
		uiChannel: {id: "", name: "", module: {id: ""}},
		ord: "",
		size: ""
	},
	makeBigger: function() {
		if(this.get("size") == "small")
			this.set("size", "medium")
		else if(this.get("size") == "medium")
			this.set("size", "large")
	},
	makeSmaller: function() {
		if(this.get("size") == "large")
			this.set("size", "medium")
		else if(this.get("size") == "medium")
			this.set("size", "small")
	}
})

var DashboardItemList = Backbone.Collection.extend({
	model: DashboardItem
})

var DashboardItemView = Backbone.View.extend({
	tagName: "li",
	className: "dashboarditem",	
	template: _.template($("#streamr-widget-template").html()),
	labelTemplate: _.template($("#streamr-label-template").html()),
	chartTemplate: _.template($("#streamr-chart-template").html()),
	heatmapTemplate: _.template($("#streamr-heatmap-template").html()),
	titlebarTemplate: _.template($("#titlebar-template").html()),

	events: {
		"click .delete-btn" : "delete",
		"click .edit" : "toggleEdit",
		"click .close-edit" : "toggleEdit",
		"keypress .name-input" : "updateOnEnter",
		"blur .name-input" : "blurEdit",
		"click .expand-btn" : "makeBigger",
		"click .compress-btn" : "makeSmaller"
	},

	initialize: function(){
		var _this = this
		this.model.on("remove", this.remove, this)
		this.$el.on("drop", function(e, index) {
			_this.model.collection.trigger("orderchange")
		})
	},

	render: function() {
		this.smallClass = "small-size col-xs-12 col-sm-6 col-md-4 col-lg-3 col-centered"
		this.mediumClass = "medium-size col-xs-12 col-sm-12 col-md-8 col-lg-6 col-centered"
		this.largeClass = "large-size col-xs-12 col-centered"

		var type = this.model.get("uiChannel").module.id
		this.$el.html(this.template(this.model.toJSON()))
		if(type == 67) {
			if(!this.model.get("size"))
				this.model.set("size", "medium")
			this.initSize()
			this.$el.find(".widget-content").append(this.chartTemplate(this.model.toJSON()))
		}
		else if(type == 145) {
			if(!this.model.get("size"))
				this.model.set("size", "small")
			this.initSize()
			this.$el.find(".widget-content").append(this.labelTemplate(this.model.toJSON()))
		}
		else if(type == 196) {
			if(!this.model.get("size"))
				this.model.set("size", "medium")
			this.initSize()
			this.$el.find(".widget-content").append(this.heatmapTemplate(this.model.toJSON()))
		}
		else {
			throw new Error("Module id not recognized!");
		}
		this.$el.find(".title").append(this.titlebarTemplate(this.model.toJSON()))
		return this
	},

	delete: function () {
		this.model.collection.remove(this.model)
	},

	toggleEdit: function () {
		_this = this
		//If the item is in editing mode update 'title' and remove class 'editing' 
		if(this.$el.hasClass("editing")){
			this.model.set("title", this.$el.find(".name-input").val())
			this.$el.removeClass("editing")
		//If not, add class 'editing' and focus into the name-input (focusing because of the blur-event)
		} else {
			this.$el.addClass("editing")
			setTimeout(function(){
			    _this.$el.find(".name-input").focus();
			}, 0);
		}

		this.$el.find(".title").empty()
		this.$el.find(".title").append(this.titlebarTemplate(this.model.toJSON()))
	},

	updateOnEnter: function(e) {
      if (e.keyCode == 13) this.toggleEdit();
    },

    blurEdit: function(e) {
    	if($(e.relatedTarget).hasClass("expand-btn")) {
    		this.makeBigger()
    		setTimeout(function(){
			    _this.$el.find(".name-input").focus();
			}, 0);
		}
    	else if($(e.relatedTarget).hasClass("compress-btn")) {
    		this.makeSmaller()
    		setTimeout(function(){
			    _this.$el.find(".name-input").focus();
			}, 0);
		}
    	else if($(e.relatedTarget).hasClass("delete-btn")) {
    		this.delete()
    	}
    	else {
    		this.toggleEdit()
    	}
    	
    },

    initSize: function() {
    	this.$el.removeClass(this.smallClass+ " " +this.mediumClass+ " " +this.largeClass)
    	if(this.model.get("size") == "small") {
    		this.$el.addClass(this.smallClass)
    	} else if(this.model.get("size") == "medium") {
    		this.$el.addClass(this.mediumClass)
    	} else if(this.model.get("size") == "large") {
    		this.$el.addClass(this.largeClass)
    	} else 
    		console.log("Module size not found")

    },

    makeBigger: function() {
    	this.model.makeBigger()
    	this.initSize()
    },

    makeSmaller: function() {
    	this.model.makeSmaller()
    	this.initSize()
    }
})

var SidebarView = Backbone.View.extend({
	events: {
		"checked" : "updateDIList",
		"unchecked" : "updateDIList",
		"click .save-button" : "save"
	},

	initialize: function (options) {
		this.el = options.el
		this.dashboard = options.dashboard
		this.allRSPs = options.RSPs
		this.RSPs = []
		_.each(this.allRSPs, function(rsp){
			rsp.uiChannels = _.filter(rsp.uiChannels, function(uic){
				return uic.module
			})
			if(rsp.uiChannels.length)
				this.RSPs.push(rsp)
		},this)
		this.setData(this.RSPs, this.dashboard.get("items"))
		this.listenTo(this.dashboard.get("items"), "remove", function(DI){
			this.uncheck(DI.get("uiChannel").id)
		})
		var _this = this
		this.dashboard.get("items").on("change", function () {
			_this.dashboard.saved = false
		})
		$("#main-menu-toggle").click(function () {
			if($("body").hasClass("editing"))
				_this.setEditMode(false)
			else
				_this.setEditMode(true)
		})
		this.setEditMode(options.edit)
		this.render()
		this.$el.find(".dashboard-name").change(function () {
			_this.dashboard.saved = false
		})

		this.dashboard.on('invalid', function(error) {
			console.log(error)
			$.pnotify({
				type: 'error',
        		title: 'Invalid value',
	        	text: _this.dashboard.validationError,
	        	delay: 4000
    		});
		})
	},

	setEditMode: function (active) {
		if(active){
			$("body").addClass("mme")
			$("body").removeClass("mmc")
			$("body").addClass("editing")
		} else {
			$("body").addClass("mmc")
			$("body").removeClass("mme")
			$("body").removeClass("editing")
		}

    	$("body").trigger("classChange")
	},

	render: function () {
		this.title = $("<div/>", {
			class: "menu-content",
			html: "<label>Dashboard name</label>"
		})
		this.titleInput = $("<input/>", {
			class: "dashboard-name title-input form-control",
			type: "text",
			name: "dashboard-name",
			value: this.dashboard.get("name"),
			placeholder: "Dashboard name"
		})
		this.rspTitle = $("<li/>", {
			class: "rsp-title",
			html: "<label>Running Signalpaths</label>"
		})
		this.list = $("<ul/>", {
			class: "navigation",
			id: "rsp-list"
		})
		var buttonTemplate = _.template($("#button-template").html())
		this.buttons = $(buttonTemplate(this.dashboard.toJSON()))
		this.$el.append(this.title)
		this.title.append(this.titleInput)
		this.$el.append(this.list)
		this.list.append(this.rspTitle)
		_.each(this.rspCollection.models, function(item) {
			this.list.append(this.renderRSP(item).el)
		}, this)
		this.$el.append(this.buttons)
		new Toolbar(this.buttons.find("form"))
	},

	renderRSP: function(item) {
		var runningSignalPathView = new RunningSignalPathView({
			model: item
		})
		return runningSignalPathView.render()
	},

	setData: function(RSPs, DIList) {
		this.DIList = DIList

		var checked = {}
		_.each(this.DIList.models, function(item) {
			checked[item.get("uiChannel").id] = true
		})
		_.each(RSPs, function(rsp) {
			_.each(rsp.uiChannels, function(uiChannel) {
				if (checked[uiChannel.id])
					uiChannel.checked = true
			})
		})
		this.rspCollection = new RunningSignalPathList(RSPs)
	},

	updateDIList: function(event, uiChannelModel) {
		if(event.type == "checked") {
			_.each(this.rspCollection.models, function(runningsignalpath){
				_.each(runningsignalpath.get("uiChannels"), function(uiChannel) {
					if(uiChannel.id == uiChannelModel.get("id")) {
						this.DIList.push({title: uiChannelModel.get("name"), uiChannel: uiChannel})
					}
				},this)
			},this)
		}
		if(event.type == "unchecked") {
			var list = _.filter(this.DIList.models, function(item) {
				return item.get("uiChannel").id == uiChannelModel.get("id")
			}, this)
			this.DIList.remove(list)
		}
	},

	uncheck: function (id) {
		_.each(this.rspCollection.models, function(RSP) {
			_.each(RSP.uiChannelCollection.models, function(uiChannelModel){
				if(uiChannelModel.get("id") == id)
					uiChannelModel.set("checked", false)
			})
		})
	},

	updateTitle: function (e) {
		var a = this.titleInput.val()
		this.dashboard.set({name: a})
	},

    save: function() {
    	var _this = this
    	this.updateTitle()

    	this.dashboard.save({}, {
    		success: function() {
	    		_this.dashboard.saved = true

			    $.pnotify({
					type: 'success',
	        		title: 'Saved!',
		        	text: 'Dashboard ' +_this.dashboard.get("name")+ ' saved successfully',
		        	delay: 4000
				});
	    	},
	    	error: function(model, response) {
		    	$.pnotify({
					type: 'error',
	        		title: 'Error while saving',
		        	text: response.responseText,
		        	delay: 4000,
		        	// addClass: "alert alert-danger alert-dark"
	    		});
	    	}
	    })
    },

    triggerClassChange: function () {
    	$("body").trigger("classChange")
    }
})

var Dashboard = Backbone.AssociatedModel.extend({
	relations: [
        {
            type: Backbone.Many,
            key: 'items',
            collectionType: DashboardItemList,
            relatedModel: DashboardItem
        }
    ],

	defaults: {
		name: "",
		items: []
	},

	validate: function() {
		if (!this.get("name"))
			return "Dashboard name can't be empty"
	},

	initialize: function (){
		this.saved = true
	}
})

var DashboardView = Backbone.View.extend({

	initialize: function(options) {
		var _this = this
		this.dashboardItemViews = []
		// Avoid needing jquery ui in tests
		if (this.$el.sortable) {
			this.$el.sortable({
				items: ".dashboarditem",
				// placeholder: "dashboarditem-placeholder ui-corner-all",
				stop: function(event, ui) {
					ui.item.trigger('drop');
	 	   	}
			})
			this.$el.droppable()
		}

		_.each(this.model.get("items").models, this.addDashboardItem, this)

		this.model.get("items").on("add", this.addDashboardItem, this)
		this.model.get("items").on("add", this.updateOrders, this)
		this.model.get("items").on("remove", this.removeDashboardItem, this)
		this.model.get("items").on("remove", this.updateOrders, this)
		this.model.get("items").on("orderchange", this.updateOrders,this)

		$("body").on("classChange", function() {
			if(!($("body").hasClass("editing"))) {
				if(!_this.model.saved){
					$.pnotify({
						type: 'error',
		        		title: 'Not saved',
			        	text: 'The dashboard has changes which are not saved',
			        	delay: 4000,
			        	// addClass: "alert alert-danger alert-dark"
		    		});
				}
				_this.ableSortable()
			} else {
				_this.disableSortable()
			}
		})
	},

	addDashboardItem: function(model) {
		var DIView = new DashboardItemView({
			model: model
		})
		this.$el.append(DIView.render().el)
		this.dashboardItemViews.push(DIView)
	},

	removeDashboardItem: function(model) {
		var viewsToRemove = _.filter(this.dashboardItemViews, function(DIView) {
			return DIView.model === model
		})
		viewsToRemove.forEach(function(view) { view.remove() })
		this.dashboardItemViews = _.without(this.dashboardItemViews, viewsToRemove)
	},

	updateOrders: function() {
		_.each(this.dashboardItemViews, function(item) {
				item.model.set("ord", item.$el.index())
		},this)
	},

	ableSortable: function() {
		if (this.$el.sortable) {
			this.$el.sortable("option", "disabled", false)
		}
	},

	disableSortable: function() {
		if (this.$el.sortable) {
			this.$el.sortable("option", "disabled", true)	
		}
	}
})

exports.Dashboard = Dashboard
exports.DashboardView = DashboardView
exports.SidebarView = SidebarView

})(typeof(exports) !== 'undefined' ? exports : window)