Events = function() {
	function array_search(val, arr) {
		var i = arr.length;
		while (i--) { 
			if (arr[i] && arr[i] === val) break; 
		}
		return i;
	}

	function IEEventHandler(e) {
		e = e || window.event;
		var evTypeRef = '__' + e.type, retValue = true;
		for (var i = 0, j = this[evTypeRef].length; i < j; i++) {
			if (this[evTypeRef][i]) {
				if (Function.call) {
					retValue = this[evTypeRef][i].call(this, e) && retValue;
				} else {
					this.__fn = this[evTypeRef][i];
					retValue = this.__fn(e) && retValue;
				}
			}
		}
		if (this.__fn) {
			try { 
				delete this.__fn; 
			} catch(e) { 
				this.__fn = null; 
			}
		}
		return retValue;
	}

	return {
		_addEvent : function(obj, evType, fn, useCapture) {
			if (!useCapture) {
				useCapture = false;
			}
			if (obj.addEventListener) {
				obj.addEventListener(evType, fn, useCapture);
			} else {
				if (useCapture) {
					alert('This browser does not support event capturing!');
				} else {
					var evTypeRef = '__' + evType;
					if (obj[evTypeRef]) {
						if (array_search(fn, obj[evTypeRef]) > -1) 
							return;
					} else {
						obj[evTypeRef] = [];
						if (obj['on'+evType])
							obj[evTypeRef][0] = obj['on'+evType];
						obj['on'+evType] = IEEventHandler;
					}
					obj[evTypeRef][obj[evTypeRef].length] = fn;
				}
			}
		},
		
		_removeEvent : function(obj, evType, fn, useCapture) {
			if (!useCapture) {
				useCapture = false;
			}
			if (obj.removeEventListener) {
				obj.removeEventListener(evType, fn, useCapture);
			} else {
				var evTypeRef = '__' + evType;
				if (obj[evTypeRef]) {
					var i = array_search(fn, obj[evTypeRef]);
					if (i > -1) {
						try {
							delete obj[evTypeRef][i];
						} catch(e) {
							obj[evTypeRef][i] = null;
						}
					}
				}
			}
		},
		
		_addEventForEach : function(list, type, fn, cpt) {
			list.applyForEach(Events._addEvent, type, fn, cpt);
		},
		
		_removeEventForEach : function(list, type, fn, cpt) {
			list.applyForEach(Events._removeEvent, type, fn, cpt);
		},
				
		loading : function(callback) {
			Events._addEvent(window, "load", callback);
		}
	};
}();

Element.prototype.addEvent = function(type, fn, capture) {
	if (Function !== fn) {
		throw new TypeError("Function expected!");
	}
	if (arguments.length < 4) {
		Events._addEvent(this, type, fn, capture);
	} else {
		var args = [];
		for (var i=1, lang=arguments.length; i<lang; i++) {
			args.push(arguments[i]);
		}
		var tmpfn = function() {
			fn.apply(this, args);
		}
		Events._addEvent(this, type, tmpfn, capture);
	}
}

Element.prototype.remEvent = function(type, fn, capture) {
	if (Function !== fn) {
		throw new TypeError("Function expected!");
	}
	Events._removeEvent(this, type, fn, capture);
}

Object.prototype.addEventForEach = function(type, fn, cpt) {
	Events._addEventForEach(this, type, fn, cpt);
}

Object.prototype.remEventForEach = function(type, fn, cpt) {
	Events._removeEventForEach(this, type, fn, cpt);
}