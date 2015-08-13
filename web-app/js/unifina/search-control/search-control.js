
function SearchControl(streamUrl, modulesUrl, $elem) {

	function modulesTypeAhead(q, cb) {
		var re = new RegExp(q, 'i')
		var matches = modules.filter(function(mod) {
			return re.test(mod.name) || re.test(mod.alternativeNames)
		})
		matches.sort(function(a,b){
			return (getSortScore(a, q) - getSortScore(b, q))
		})
		cb(matches.slice(0, 5))
	}

	function getSortScore (module, term){
		var name = module.name.toLowerCase()
		term = term.toLowerCase()
		if(name === term)
			return 0
		else if(name.indexOf(term) === 0)
			return 1
		else
			return 2
	}

	function streamsTypeAhead(q, cb) {
		$.get(streamUrl + '?term='+q, function(result) {
			cb(result.slice(0, 5))
		})
	}

	var modules = []
	var emptyTemplate = 'No streams or modules found.'

	$.get(modulesUrl, function(ds) {
		modules = ds
	})

	$(document).bind('keydown', 'alt+s', function(e) {
		$elem.focus()
		e.preventDefault()
	})

	$elem.typeahead({
		highlight: true,
		hint: true,
		autoselect: 'first'
	}, {
		name: 'modules',
		displayKey: 'name',
		source: modulesTypeAhead,
		templates: {
			header: '<span class="tt-dataset-header">Modules</span>',
			suggestion: function(item) {
				return "<div class='custom-tt-suggestion' draggable='true' data-id='"+item.id+"'>"+
							"<span class='tt-suggestion-name'>"+item.name+"</span>"+
						"</div>"
			}
		}
	}, {
		name: 'streams',
		displayKey: 'name',
		source: streamsTypeAhead,
		templates: {
			header: '<span class="tt-dataset-header">Streams</span>',
			suggestion: function(item) {
				return "<div class='custom-tt-suggestion' draggable='true' ondragstart='drag(event)' data-id='"+item.id+"'>"+
							"<div class='tt-suggestion-name'>"+item.name+"</div>"+
								(item.description ? "<div class='tt-suggestion-description'>"+item.description+"</div>" : "")+
						"</div>"
			}
		}
	})

	function drag(e){
		e.dataTransfer.setData("id", $(e.target).data("id"));
	}

	$("#canvas").on("drop", function(drop){
		SignalPath.addModule(drop.o.data('id'), {
			layout: {
				position: {
					top: drop.e.offsetY + 'px',
					left: drop.e.offsetX + 'px'
				}
			}
		})
	})

	$elem.on('typeahead:selected', function(e, mod) {
		$elem.typeahead('val', '')

		if (mod.module) { // is stream, specifies module
			SignalPath.addModule(mod.module, { params: [{ name: 'stream', value: mod.id }] })
		} else { // is module
			SignalPath.addModule(mod.id, {})
		}
	})

	// $elem.on('typeahead:open', function(e, mod) {
	// 	$elem.typeahead('val', '')

	// 	if (mod.module) { // is stream, specifies module
	// 		SignalPath.addModule(mod.module, { params: [{ name: 'stream', value: mod.id }] })
	// 	} else { // is module
	// 		SignalPath.addModule(mod.id, {})
	// 	}
	// })
}
