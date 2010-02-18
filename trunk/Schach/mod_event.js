"use strict";

var Events = (function () 
{
	function array_search(val, arr) 
	{
		var i = arr.length;
		while (i--) { 
			if (arr[i] && arr[i] === val) {
				break;
			} 
		}
		return i;
	}

	function IEEventHandler(e) 
	{
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
			} catch (f) { 
				this.__fn = null; 
			}
		}
		return retValue;
	}

	return {
		_addEvent : function (obj, evType, fn, useCapture) 
		{
			if (!(fn instanceof Function)) {
				throw new TypeError("Function expected!");
			}
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
						if (array_search(fn, obj[evTypeRef]) > -1) {
							return;
						}
					} else {
						obj[evTypeRef] = [];
						if (obj['on' + evType])
							obj[evTypeRef][0] = obj['on' + evType];
						obj['on' + evType] = IEEventHandler;
					}
					obj[evTypeRef][obj[evTypeRef].length] = fn;
				}
			}
		},
		
		_removeEvent : function (obj, evType, fn, useCapture) 
		{
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
						} catch (e) {
							obj[evTypeRef][i] = null;
						}
					}
				}
			}
		},
		
		_addEventForEach : function (list, type, fn, cpt) 
		{
			if (!(fn instanceof Function)) {
				throw new TypeError("Function expected.");
			}
			for (var i = 0, len = list.length; i < len; i++) {
				if (i in list) {
					Events._addEvent(list[i], type, fn, cpt);
				}
			}
		},
		
		_removeEventForEach : function (list, type, fn, cpt) 
		{
			if (!(fn instanceof Function)) {
				throw new TypeError("Function expected.");
			}
			for (var i = 0, len = list.length; i < len; i++) {
				if (i in list) {
					Events._remEvent(list[i], type, fn, cpt);
				}
			}
		},
				
		loading : function (callback) 
		{
			Events._addEvent(window, "load", callback);
		}
	};
})();

Element.prototype.addEvent = function (type, fn, cpt) 
{
	if (arguments.length < 4) {
		Events._addEvent(this, type, fn, cpt);
	} else {
		var args  = Array.prototype.slice.call(arguments, 3);
		var tmpfn = function () {
			fn.apply(this, args);
		};
		Events._addEvent(this, type, tmpfn, cpt);
	}
};

Element.prototype.remEvent = function (type, fn, capture) 
{
	Events._removeEvent(this, type, fn, capture);
};

Object.prototype.addEventForEach = function (type, fn, cpt) 
{
	if (arguments.length < 4) {
		Events._addEventForEach(this, type, fn, cpt);
	} else {
		var tmpfn = function() {
			fn.apply(this, Array.prototype.slice.call(arguments, 3));
		};
		Events._addEventForEach(this, type, tmpfn, cpt);
	}
};

Object.prototype.remEventForEach = function (type, fn, cpt) 
{
	Events._removeEventForEach(this, type, fn, cpt);
};
