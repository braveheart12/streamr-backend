function TwoFingerScrollDiv(element, options) {
    var _this = this
    this.element = element
    this.scrollEnabled = true
    
    this.element.addEventListener('touchmove', function(e) {
        if (e.targetTouches.length < 2 && _this.scrollEnabled) {
            _this.disableScroll()
        } else if (!_this.scrollEnabled) {
            _this.enableScroll()
        }
    })
    this.element.addEventListener('touchend', function(e) {
        if (!_this.scrollEnabled) {
            _this.enableScroll()
        }
    })
}

TwoFingerScrollDiv.prototype.disableScroll = function() {
    this.scrollEnabled = false
    this.element.style['pointer-events'] = 'none'
}

TwoFingerScrollDiv.prototype.enableScroll = function() {
    this.scrollEnabled = true
    this.element.style['pointer-events'] = 'auto'
}

if ($ && $.fn) {
    $.twoFingerScrollDiv = function(options) {
        new TwoFingerScrollDiv(this, options)
    }
}

new TwoFingerScrollDiv(document.getElementById('container'))