//	Object.prototype.forEachApply = function(fn) 
Object.prototype.applyForEach = function(fn) 
{
	if ("function" != typeof fn)
		throw new TypeError("Function expected!");
	var args = [];
	for (var i=1, lang=arguments.length; i<lang; i++) {
		args.push(arguments[i]);
	}
	for (var i=0, len=this.length >>> 0; i<len; i++) {
		if (i in this) {
			fn.apply(this[i], args);
		}
	}
}

Function.prototype.forEvery = function(list)
{
	for (var i=0, len=list.length >>> 0; i<len; i++) {
		if (i in list) {
			this.call(list[i]);
		}
	}
}

// by Gavin Kistner
Function.prototype.extend = function(parentClassOrObject)
{
	if ("function" == typeof parentClassOrObject.constructor) {
		this.prototype = new parentClassOrObject;
		this.prototype.constructor = this;
		this.prototype.parent = parentClassOrObject.prototype;
	} else {
		this.prototype = parentClassOrObject;
		this.prototype.constructor = this;
		this.prototype.parent = parentClassOrObject;
	}
	return this;
}

Element.prototype.isChildOf = function(ContainerObject) 
{ 
	if ("string" == typeof ContainerObject) {
		ContainerObject = document.getElementById(ContainerObject);
	}
	if (1 != ContainerObject.nodeType) {
		throw new TypeError("Container Object is not an Element");
	}
	var curobj = this;
	do { 
		curobj = curobj.parentNode;
		if (curobj == ContainerObject) {
			return true;
		}
	} while ("undefined" != typeof curobj);
	return false;
} 

HTMLElement.prototype.appendElement = function(name, text, attr) 
{
	var EN = Code.createCustomElement(name, text, attr);
	this.appendChild(EN);
	return EN;
}

Code = {
	getElementsByClassName : function (className, tag, elm) 
	{
		if (document.getElementsByClassName) {
			Code.getElementsByClassName = function (className, tag, elm) {
				elm = elm || document;
				var elements = elm.getElementsByClassName(className),
					nodeName = (tag) ? new RegExp("\\b" + tag + "\\b", "i") : null,
					returnElements = [],
					current;
				for (var i=0, il=elements.length; i<il; i++) {
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
				for (var j=0, jl=classes.length; j<jl; j++) {
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
					elements = (tag === "*" && elm.all)? elm.all : elm.getElementsByTagName(tag),
					current,
					returnElements = [],
					match;
				for (var k=0, kl=classes.length; k<kl; k++) {
					classesToCheck.push(new RegExp("(^|\\s)" + classes[k] + "(\\s|$)"));
				}
				for (var l=0, ll=elements.length; l<ll; l++) {
					current = elements[l];
					match = false;
					for (var m=0, ml=classesToCheck.length; m<ml; m++) {
						match = classesToCheck[m].test(current.className);
						if (!match) { break; }
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
	createCustomElement : function(name, text, attr) 
	{
		var EN = document.createElement(name);
		var TN = document.createTextNode(text);
		EN.appendChild(TN);
		for (var j in attr) {
			if ("function" == typeof attr[j]) { continue; }
			var AN = document.createAttribute(j);
			AN.nodeValue = attr[j];
			EN.setAttributeNode(AN);
		}
		return EN;
	},
	createCookie : function(name, value, days) 
	{
		if (days) {
			var date = new Date();
			date.setTime(date.getTime()+(days*24*60*60*1000));
			var expires = "; expires="+date.toGMTString();
		}
		else 
			var expires = "";
		document.cookie = name+"="+value+expires+"; path=/";
	},
	readCookie : function(name) 
	{
		var l, nameEQ = name + "=";
		var ca = document.cookie.split(";"); // "; " ?
		for (var i=0; i<ca.length; i++) {
			var c = ca[i];
			while (" " == c.charAt(0)) 
				c = c.substring(1);
			if (0 == c.indexOf(nameEQ)) 
				return c.substring(nameEQ.length);
		}
		return null;
	},
	eraseCookie : function(name) 
	{
		Code.createCookie(name, "", -1);
	}
}
