"use strict";

// NodeList.prototype.applyForEach = function (fn) 
Object.prototype.applyForEach = function (fn) 
{
	if (!(fn instanceof Function)) {
		throw new TypeError("Function expected!");
	}
	for (var i = 0, len = this.length; i < len; i++) {
		if (i in this) {
			fn.apply(this[i], Array.prototype.slice.call(arguments, 1));
		}
	}
};
// I wonder if I'll ever need this
Element.prototype.isChildOf = function (ContainerObject) 
{ 
	if ("string" === typeof ContainerObject) {
		ContainerObject = document.getElementById(ContainerObject);
	}
	if (!(ContainerObject instanceof Element)) {
		throw new TypeError("Container Object is not an Element");
	}
	var curobj = this;
	do { 
		curobj = curobj.parentNode;
		if (curobj === ContainerObject) {
			return true;
		}
	} while (curobj instanceof Element);
	return false;
};

Element.prototype.appendElement = function (name, text, attr) 
{
	var EN = Code.createCustomElement(name, text, attr);
	this.appendChild(EN);
	return EN;
};
// preferred, if no function parameters are required
Function.prototype.forEvery = function (list)
{
	for (var i = 0, len = list.length; i < len; i++) {
		if (i in list) {
			this.call(list[i]);
		}
	}
};
// by Gavin Kistner
Function.prototype.extend = function (ParentClassOrObject)
{
	if (ParentClassOrObject.constructor instanceof Function) {
		this.prototype = new ParentClassOrObject;
		this.prototype.constructor = this;
		this.prototype.parent = ParentClassOrObject.prototype;
	} else {
		this.prototype = ParentClassOrObject;
		this.prototype.constructor = this;
		this.prototype.parent = ParentClassOrObject;
	}
};

Code = {
// by class name
	getElementsByClassName : function (className, tag, elm) 
	{
		if (document.getElementsByClassName) {
			Code.getElementsByClassName = function (className, tag, elm) {
				elm = elm || document;
				var elements = elm.getElementsByClassName(className),
					nodeName = (tag) ? new RegExp("\\b" + tag + "\\b", "i") : null,
					returnElements = [],
					current;
				for (var i = 0, il = elements.length; i < il; i++) {
					current = elements[i];
					if (!nodeName || nodeName.test(current.nodeName)) {
						returnElements.push(current);
					}
				}
				return returnElements;
			};
		} else if (document.evaluate) {
			Code.getElementsByClassName = function (className, tag, elm) {
				tag = tag || "*";
				elm = elm || document;
				var classes = className.split(" "),
					classesToCheck = "",
					xhtmlNamespace = "http://www.w3.org/1999/xhtml",
					namespaceResolver = (document.documentElement.namespaceURI === xhtmlNamespace) ? xhtmlNamespace : null,
					returnElements = [],
					elements,
					node;
				for (var j = 0, jl = classes.length; j < jl; j++) {
					classesToCheck += "[contains(concat(' ', @class, ' '), ' " + classes[j] + " ')]";
				}
				try	{
					elements = document.evaluate(".//" + tag + classesToCheck, elm, namespaceResolver, 0, null);
				} catch (e) {
					elements = document.evaluate(".//" + tag + classesToCheck, elm, null, 0, null);
				}
				while ((node = elements.iterateNext())) {
					returnElements.push(node);
				}
				return returnElements;
			};
		} else {
			Code.getElementsByClassName = function (className, tag, elm) {
				tag = tag || "*";
				elm = elm || document;
				var classes = className.split(" "),
					classesToCheck = [],
					elements = (tag === "*" && elm.all) ? elm.all : elm.getElementsByTagName(tag),
					current,
					returnElements = [],
					match;
				for (var k = 0, kl = classes.length; k < kl; k++) {
					classesToCheck.push(new RegExp("(^|\\s)" + classes[k] + "(\\s|$)"));
				}
				for (var l = 0, ll = elements.length; l < ll; l++) {
					current = elements[l];
					match = false;
					for (var m = 0, ml = classesToCheck.length; m < ml; m++) {
						match = classesToCheck[m].test(current.className);
						if (!match) { 
							break; 
						}
					}
					if (match) {
						returnElements.push(current);
					}
				}
				return returnElements;
			};
		}
		return Code.getElementsByClassName(className, tag, elm);
	},
// create element
	createCustomElement : function (name, text, attr) 
	{
		var EN = document.createElement(name);
		var TN = document.createTextNode(text);
		EN.appendChild(TN);
		for (var j in attr) {
			if (attr.hasOwnProperty(j) && !(attr[j] instanceof Function)) { 
				var AN = document.createAttribute(j);
				AN.nodeValue = attr[j];
				EN.setAttributeNode(AN);
			}
		}
		return EN;
	},
// use cookies
	createCookie : function (name, value, days) 
	{
		var date, 
		    expires = "";
		if (days) {
			date = new Date();
			date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
			expires = "; expires=" + date.toGMTString();
		}
		document.cookie = name + "=" + value + expires + "; path=/";
	},
	readCookie : function(name) 
	{
		var i, l, c, ca, 
		    nameEQ = name + "=";
		ca = document.cookie.split(";");
		for (i = 0, l = ca.length; i < l; i++) {
			c = ca[i];
			while (" " === c.charAt(0)) { // instead of trim()
				c = c.substring(1);
			}
			if (0 === c.indexOf(nameEQ)) {
				return c.substring(nameEQ.length);
			}
		}
		return null;
	},
	eraseCookie : function (name) 
	{
		Code.createCookie(name, "", -1);
	}
};

function $(name, base, tag)
{
	var first = name.charAt(0);
	if ("#" === first) {
		return document.getElementById(name.substring(1));
	}
	if ("." === first) {
		return Code.getElementsByClassName(name.substring(1), tag, base);
	}
	if (!(base instanceof Element)) {
		base = document;
	}
	return base.getElementsByTagName(name);
}

var ErrorLog = (function ()
{
	var errors = [];
	
	function logError(e)
	{
		var num, trace, text;
		if (e instanceof Error) {
			text  = e.message;
			num   = e.lineNumber || e.number || "-";
			trace = e.stacktrace || e.stack  || "-";
		}
		else if ("string" === typeof e) {
			text  = e;
			trace = num = "-";
		}
		else {
		//	alert("Unable to log Error");
			return false;
		}
		errors.push({ 
			time  : (new Date()).toString(),
			msg   : text,
			line  : num,
			stack : trace 
		});
		return true;
	}
	
	function getProperty(name, num)
	{
		if (undefined === num) {
			num = errors.length - 1;
		}
		if (0 < errors.length && num < errors.length) {
			return errors[num][name];
		}
		return null;
	
	}
	
	return {
		// public interface
		log : function (e)
		{
			if (console) {
				console.info(e);
			}
			return logError(e);
		},
		all : function ()
		{
			return errors;
		},
		getMessage : function (num)
		{
			return getProperty("msg", num);
		},
		getTime : function (num)
		{
			return getProperty("time", num);
		},
		getLine : function (num)
		{
			return getProperty("line", num);
		},
		getStackTrace : function (num)
		{
			return getProperty("stack", num);
		},
		toString : function ()
		{
			var i, l, txt = "";
			for (i = 0, l = errors.length; i < l; i++) {
				txt += "<p>" + errors[i].msg + "</p>";
			}
			return txt || "<p>no JavaScript errors</p>";
		}
	}
})();