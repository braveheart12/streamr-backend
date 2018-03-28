(function() {
    var savedSignalPath
    var addToSaved = function() {
        savedSignalPath = SignalPath.toJSON()
    }
    if (typeof SignalPath !== 'undefined') {
        $(SignalPath).on('new', addToSaved)
        $(SignalPath).on('saved', addToSaved)
        $(SignalPath).on('loaded', addToSaved)

        window.addEventListener('beforeunload', function(e) {
            if (JSON.stringify(savedSignalPath) !== JSON.stringify(SignalPath.toJSON())) {
                return e.preventDefault()
            }
        })
    } else {
        throw new Error('No SignalPath!')
    }
})()
