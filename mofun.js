/*@preserve
	mofun.js 
	v1.0.0 , updated 2014-10-5
	http://danml.com/mofun/
	(c) 2014 dandavis
	mofun may be freely distributed under 
	[CCBY4.0]@dandavis *//*, Or with these and all code comments, under the MIT license.
	
	
Contains many standalone functional programming helpers, function composers, iterations, comparators, sorters, filters, common transforms, and much more.

----------
a few code comments were taken from the following great projects:

https://raw.githubusercontent.com/jashkenas/underscore/master/underscore.js
	Underscore.js 1.7.0
	http://underscorejs.org
	(c) 2009-2014 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
	Underscore may be freely distributed under the MIT license.

https://github.com/sstephenson/prototype/tree/master/src/prototype
	Prototype JavaScript framework
	(c) 2005-2010 Sam Stephenson
	Prototype is freely distributable under the terms of an MIT-style license.
	For details, see the Prototype web site: http://www.prototypejs.org/

----------
inspiration found from:
http://danml.com/pub/lib/f.htm
http://blog.osteele.com/posts/2007/07/functional-javascript/ (cool back in the day)
http://osteele.com/sources/javascript/functional/
http://fungusjs.com/  (cool in the future)
----------
code notes:
- there is some repetition in the methods to avoid any inner-dependences. each method is an island.
- this need not be an object, and in the context of [].map/filter/forEach/etc, the value will be converted to an object unless in "use strict" mode.
		the value's toString() will remain the same, so it's a good indexer: x[this]
		Number's valueOf() does not change, so 1/this is fine
		functions work fine: this(a) is ok
		Arrays and Objects and RegExps and Dates are passed via this as-is, so this.test(), this.getTime, this.slice(), etc are ok

- formal parameters suggest an argument type using the following convention:
	s a String
	r an Array
	n a Number
	f a Function
	o an Object
	v a value (could be anything)
	sr a String or Array

*/


var F= { // the main attraction, F contains everything in mofun.

	$: function(css, root) { // returns an array of elements matching the CSS selector given to the first argument. the 2nd arg (optional) spcifies a root node to look under.
		if(typeof document==="undefined") return [];
		root = root || document.documentElement; /* (the ONLY browser-specific method) */
		return Array.apply(0, root.querySelectorAll(css));
	},

	$w: function(s) { // Splits a string into an Array, treating all white-space as delimiters. Equivalent to Ruby's %w{foo bar} or Perl's qw(foo bar).
		return ("" + s).trim().split(/\s+/);
	},

	$c: function(s) { // Splits a string into an Array, treating commas as delimiters. 
		return ("" + s).trim().split(",");
	},

	EE: function() { // returns a tiny EventEmitter
		var E={};
		return function(k, v, del) {
			var r=E[k] || (E[k]=[]);
			return typeof v != "function" ? 
				r.some(function(f,_,__){return f.call(r,v,k)===false;}) : 
				del===true ? 
					((_=r.indexOf(v))!==-1 && r.splice(_, 1)) : 
					r.unshift(v);
		};
	}, 

	"If": function(f, v, v2){ //given a conditional function first argument and 2 more arguments for true and false, returns a new function that returns the value/result of the 2nd if the result of the first is false, otherwise returning the result/value the third argument
		return function(){
			var c= f.apply(this, arguments) ? v : v2;
			if(typeof c==="function"){return c.apply(this, arguments);}
			return c;
		};
	},

	_: Function.call.bind([].slice), // turns an array-like thing (NodeList, arguments, etc) into a true Array

	a: function(a, b, c) { //returns the first argument, alias for K
		return a;
	},

	abs: Math.abs, // returns the absolute value of a numerical value given to the first argument

	add: function(v,_,__) { // adds this onto the first argument. use F.sum() to add two arguments.
		"use strict";
		return v + this;
	},

	addProperty: function(o,_,__) { // given a [key,value] array as this, sets that value on the first argument
		o[this[0]] = this[1];
		return o;
	},

	addProperties: function(o,_,__) { // given an object as this, sets a property on the first argument named and set by the keys and values of the this object; a merge. used to be called setProps
		Object.keys(this).forEach(function(k,_,__) {
			o[k] = this[k];
		}, this);
		return o;
	},
	
	addNumber: function(n,_,__) { // adds this onto the first argument. coerces to Number to avoid accidental concatenation. 
		"use strict";
		return +n + +this;
	},

	all: Function.call.bind([].every), // given an array first argument and a function 2nd argument, returns true if any elements cause the function to return truish
	
	allProps: function(v) { // returns a list of all properties, own and inherited, enumerable and non
		var r = Object.getOwnPropertyNames(v);
		for (var i in v) {
			if (r.indexOf(i) === -1) r.push(i);
		}
		return r;
	},

	any: Function.call.bind([].some), // given an array first argument and a function 2nd argument, returns true if any elements cause the function to return truish
	
	appendProperty: function(o,_,__) { // given a [key,value] array as this, appends that value to an existing property on the first argument
		o[this[0]] += this[1];
		return o;
	},
	
	append: function(v,_,__) { // append this onto first argument. backwards version of prepend
		"use strict";
		var t=this;
		if(typeof t==="function"){ t=t(v,_,__); }
		return v.concat ? v.concat(t) : (v+t);
	},
	

	arg: function(f,n,v,call) { // given a function , arguments index, a value, returns a new function that  has the specified argument called with the value. ex: lock-in 16 on number.toString()
		"use strict";
		return function(_,__,___) {
			var r=Array.apply(null,arguments);
			r[n]=v;
		 return call===true? f.apply(r[0], r.slice(1)) : f.apply(this, r);
		};
	}, 
	
	argument: function() { // returns the argument slot specified by a numerical this value.
		"use strict";
		return arguments[this];
	}, 

	arguments: function() { // returns the argument slot specified by a numerical this value.
		"use strict";
		return Array.apply(null, arguments);
	},
	
	assert: function(v, s) { // if given a string, evaluates that string and returns a boolean or the 2nd argument on false and if specified
		if(!v) return s || false;
		if(v===true) return v;
		try{ 
			return (0||eval)(v) || s || v || false; 
		}catch(y){ 
			return (y+":  "+(s||v));
		}
	},
	
	assign: function(o, s) { // returns a function that assigns it's received first argument to the object and property specified
		return function(v) {
			return o[s] = v;
		};
	},

	avg: function(v, n, c, r) { // returns the numerical average of an array of numbers. [1,2,3].reduce(F.avg)
		return r.length-1 === c ? 
			(v + n) / r.length : 
			v + n ;
	},

	b: function(a, b, c) { //returns the 2nd argument. good for making ranged integer list by capturing [].map()'s 2nd argument.
		return b;
	},

	bind: Function.call.bind(Function.bind), // creates a new function with a frozen this set by the first argument, and additional arguments curried in front of the new function's parameters

	blank: Function.call.bind(/^\S*$/.test), // returns true if the first argument is an empty or white-space-only string

	c: function(a, b, c) { // returns the third argument
		return c;
	},

	call: function(f) {// turns a method first argument into a function with call-style arity
		return Function.call.bind(f);
	}, 

	camelize: function(s,_,__) { // convert a stringy first argument from separated-by-dashes-format to camelCaseFormat
		return "".replace.call(s, /\-([a-z])?/g, function(j, x,_,__) {
			return x.toUpperCase();
		});
	},

	catch: function(f){ // return a function that returns an error when it has a problem
		try{
			return f.apply(this, arguments);
		}catch(y){
			return y;
		}
	},
	
	capture: function() { // returns an array of all the arguments
		return Array.apply(null, arguments);
	},

	ceil: Math.ceil, // returns the closes integer furthest from zero from the number passed to the first argument

	censor: function(o,_,__) { // given an object first argument and a string array this, returns the object without properties listed in the array.
		for(var i=0,m=this.length;i<m;i++)	delete o[this[i]];
		return o;
	},
	

	changed: function(v, i, r) { // used with [].filter, returns true if the current element is different than as the previous one. see also: F.repeated
		return r[i - 1] !== v;
	},

	chars: function(s) { // returns an array of all the chars in a string version of the first argument
		return "".split.call(s, "");
	},

	char: function(s) { // returns first char code of stringy argument 
		return ("" + s).charCodeAt(0);
	},

	clean: function(s) { // given a string argument, replaces padding white-space and condenses multiple white-spaces into one space
		return "".replace.call(s, /\s+/g, " ").trim();
	},

	clone: function(o, bInherit) { // given an object argument, returns a deep copy that links to sub-objects "by-ref", and duplicates primitives. bInherit copies non-owns
		var o2 = {};
		for (var k in o) if (bInherit || [].hasOwnProperty.call(o, k)) o2[k] = o[k];
		return o2;
	},

	compact: function(v,_,__) { // used with [].filter(), returns a copy of the array without any null or undefined values.
		return v != null;
	},

	compose: function(f) { // compose a function 1st argument with a function this value to return a composition. the function by this should expect 1 arg.
		var that = this;
		return function() {
			return that.call(this, f.apply(this, arguments));
		};
	},

	concat: function(sr1, sr2,_,__) { // concats the 1st argument with the 2nd. good for flattening arrays using arrOfArr.reduce(F.concat)
		return sr1.concat(sr2);
	},

	constant: function(v){ // returns a function that returns a value given by the first argument
		return v.valueOf.bind(v);
	},
	
	count: function(o, v, i,_) { // for [].reduce, given an object and array of value, adds a value count to the object under a key set by the value. 
		if (i === 1) o = {};
		o[v] = o[v] ? (o[v] + 1) : 1;
		return o;
	},

	create: Object.create || function(o){ function f(){} f.prototype=p; return new f;}, // returns a new Object that inherits from the object passed as the first argument

	dasherize: function(s) { // converts a stringy first argument from camelCaseFormat to separated-by-dashes-format
		return (s + '').replace(/([a-z\d])([A-Z])/g, '$1-$2').toLowerCase();
	},

	dataURL: function(s) { // given a stringy first argument and an option string this to indicate mime type, returns a dataURL contain the first argument
		"use strict";
		return "data:" + (this == ("" + this) ? this : "text/plain") + "," + encodeURIComponent("" + s);
	},
	
	date: function(v){ // a more versatile version of Date - can call/apply it with parts to make a new date
		if(!v) return new Date();
		if(v.join){ return new Date(+v[0]||0,+v[1]||0,+v[2]||0,+v[3]||0,+v[4]||0,+v[5]||0); }
		return new Date(v);
	},
	
	dateParts: function(s){ // given a date, returns an array of parts like [y,m,d,h,m,s,ms]
		return new Date( new Date(s) - (new Date().getTimezoneOffset() * 60000)).toUTCString().split(/\W+/)
	},
	
	delProperty: function(o,_,__) { // delete a property of the first argument named by this. faster than F.censor for removing a single property
		delete o[this];
		return o;
	},

	delMatch: function(o,_,__) { // given an object first argument and a regexp this, returns the object without properties matched by the regexp
		Object.keys(o).filter(/./.test, this).forEach(function(k,_,__) {
			delete o[k];
		});
		return o;
	},

	deBounce: function(f, n) { // snuffs repeated calls to the function given by the first argument until a specified duration (by the 2nd argument) from the last call has elapsed
		var ok;
		return function() {
			if (ok) return;
			ok = true;
			f.apply(this, arguments);
			setTimeout(function() {
				ok = false;
			}, n || 100);
		};
	},

	dec: function(n,_,__) { // decrements a numerical argument by one or by a number specified by this
		"use strict";
		n -= +this || 1;
		return n;
	},

	defaults: function(o,_,__) { // given an object this, fills missing key:value pairs on an object in the first argument
		Object.keys(this).forEach(function(k,_,__){var u;if(u===o[k]) o[k]=this[k]; }, this);
		return o;
	},
	 
	defer: setTimeout.bind(this), // given a function, waits the #of ms specified by the 2nd argument to execute the function

	define: function(s,v){ // defined a named property on this named by the first argument and set by the 2nd
		this[s]=v;
		return this;
	},
	
	def: function(o,s,v){ // shortcut for Object.defineProperty(). feature: pass a non-descriptor as 3rd argument to simply set a hidden value by name
		if(!v || (!v.set && !v.get && v.value===void 0)){ d={value:v}; }
		Object.defineProperty(o, s, d);
	},
	
	delta: function(v, n, r) { // used with [].map/filter, returns the difference with the last element, or 0.
		return n ? (r[n - 1] - v) : 0;
	},

	divide: function(n,_,__) { // divides this by a numerical first argument. 
		return n / this;
	},

	each: Function.call.bind([].forEach), // given an array as the first argument and a function as the 2nd, execute the function on each element in the array.
	
	endsWith:"".endsWith ? Function.call.bind("".endsWith) : function(s,_,__) { // returns true if the argument ends with this
		"use strict";
		return s.lastIndexOf(this) + this.length === s.length;
	},

	equal: function(v,_,__) { // returns true if the argument is exactly the same as a value given by this
		"use strict";
		return v === this;
	},

	equiv: function(v,_,__) { // returns true if the argument is loosely the same as a value given by this
		"use strict";
		return v == this;
	},

	encode: encodeURIComponent.bind(this), // returns a url query parameter-safe string from an arbitrary string

	escapeHTML: function(s) { // escapes reserved HTML chars into entities for safe display of html code
		return ("" + s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
	},

	escapeRX: function(s) { // returns a string safe to feed to "new RegExp()" without invoking regexp special characters
		return ("" + (s || "")).replace(/([.+?^\-*=!:${(})\|[\]\/\\])/g, '\\$1');
	},

	even: function(n,_,__) { // returns true if the argument is an even numerical value
		return n % 2 === 0;
	},

	every: Function.call.bind([].every), // given an array first argument and a function 2nd argument, returns true if all elements cause the function to return true
	
	exec: function(f) { // executes a function in the first argument with additional arguments curried
		return f.apply(this, [].slice.call(arguments, 1));
	},

	extend: function extend(o, o2) { // given an object as the first argument, adds to it properties owned by further object arguments 
		for (var k in o2) if ([].hasOwnProperty.call(o2, k)) o[k] = o2[k];
		if (arguments.length > 2) extend.apply(this, [o].concat([].slice.call(arguments, 2)));
		return o;
	},

	extract: function(o,_,__) { // returns a property named by this from the object passed to the first argument. alias for F.pluck.
		return o[""+this];
	},

	extractThis: function(k,_,__) { // returns a property named by the first argument from the object passed to this.
		return this[k];
	},

	extractList: function(o,_,__) { // returns an array of values contained by properties named by an array as this from the object passed to the first argument
		return this.map(function(t,_,__) {
			return o[t];
		});
	},

	extractObject: function(o,_,__) { // returns an object of key:values contained by properties named by an array as this from the object passed to the first argument
		var o2 = {};
		this.forEach(function(t,_,__) {
			return o2[t] = o[t];
		});
		return o2;
	},

	f: function f(s, n) { // a quick function maker from a string of code passed as the first argument. prepends "return " is not present in first argument.
		"use strict";
		if(typeof s==="function") return s; // make harmless
		return f["CACHE_"+s+n] || (f["CACHE_"+s+n]=Function(  // make a new function:
			"a,b,c,d,e,f,g,h,i".split(",").slice(0, (typeof n==="number")? n : 3) , //determine arity, defaulting to 3 for map/filter arity
			(s.indexOf("return")>-1?"":"return ") + s+";")
		); 
	},

	fill: function(v) { // returns value of this or calling this (if function) against the arguments
		"use strict";
		return this.apply ? this.apply(v, arguments) : this;
	},

	filter: function filter(r, f, v) { // like [].filter except: arg1+2 can be string, sparse arrays are visited, callback's 3rd arg is orig (not clone), faster.
		var m= r.length,
		o= [],
		i= 0, b;		
		if(typeof f==="string") f= filter[0+f] || (filter[0+f]=Function("a,b,c",'"use strict";return '+ f+";")) ;
		if(v==b){
			for(; i<m; i++) if(f(b=r[i],i,r)) o.push(b);
		}else{
			for(; i<m; i++) if(f.call(v,b=r[i],i,r)) o.push(b);
		}
		return o;
	},

	find: [].find ? Function.call.bind([].find) : function(r,f,o){var i=0;r.some(function(){i++; return f.apply(this,arguments); }, o||this);return r[i];}, // returns the value of the first element in an array given to the 1st argument that returns true when called like [].map to the function given to the 2nd argument

		
	findIndex: [].findIndex ? Function.call.bind([].findIndex) : function(r,f,o){var i=0;r.some(function(){i++; return f.apply(this,arguments); }, o||this);return i;}, // returns the index of the first element in an array given to the 1st argument that returns true when called like [].map to the function given to the 2nd argument
	
	findIndices: function(r,f,o){// returns the indices of elements in array given to 1st argument that return true when called like [].map to the function given to the 2nd argument
		var c=[],u;
		o=o===u?this:o;
		r.forEach(function(a,b,_){var x=f.apply(o,arguments); if(x)c.push(b);});
	  return c;
	},
	
	finnally: function(f,v){ // given a function 1st arg, returns a new function that transforms the return via translation object or function 2nd arg
		if(typeof v==="function"){
			return function(a,b,c){return v.call(this, f.apply(this, arguments)) ;}
		}
		return function(a,b,c){return v[f.apply(this, arguments)] ;}
	},
	
	first: function(sr) { // returns the first value of the first argument, be it a string or array (not ie7 compat)
		return sr.slice(0, 1)[0]
	},

	floor: Math.floor, // returns an integer closest to zero from the number passed to the first argument

	forEach: function forEach(r,f,v){ // given an array as the first argument and a function as the 2nd, execute the function on each element in the array.
		"use strict";
		if(arguments.length<2) return;
		if(f.split) f= forEach[0+f] || (forEach[0+f]=Function("a,b,c",'"use strict"; return '+ f)) ;
		var m=r.length, i=0, b;
		if(v!=b)f=f.bind(v);
		for(; i<m; i++) f(r[i], i, r);
	}, 

	formatNumber: function(n) { // returns a pretty string from a numerical first argument with commas separating out large numbers. set this a number to limit the # of decimals
		n = ("" + n).split(".");
		return n[0].replace(/(\d)(?=(?:\d{3})+$)/g, "$1,") + (n[1] ? ("." + n[1].slice(0, + this || 35)) : "");
	},

	getComments: function(s) { // returns multi-line comments (js/css/php/etc) from a stringy first argument
		return ((s + '').match(/\/\*([\w\W]+?)\*\//g) || []).map(function(a,_,__) {
			return a.slice(2, - 2)
		}).join("\n");
	},
	
	getKey: function(s) { // returns multi-line comments (js/css/php/etc) from a stringy first argument
		var i=-1, 
		t=this,
		ks=Object.keys(this);
		ks.some(function(a,b){ if(t[a]===s){i=b; return true;}});
		return ks[i]; 
	},

	gt: function(v,_,__) { // greater than value compare
		"use strict";
		return v > this;
	},

	gte: function(v,_,__) { // greater than or equals value compare	(use: )
		"use strict";
		return v >= this;
	},

	groupBy: function(r, s) { // given an array, returns an object or arrays keyed by a specified property of each array element
		var ret = {};
		r.forEach(function(a,_,__) {
			var k = a[s],
				b = ret[k] || (ret[k] = []);
			b.push(a);
		});
		return ret;
	},

	group: function(r, n){ // given an array first argument and a sub-array width 2nd argument, returns a new array with sub-arrays of the specified length
		var o= [],
			i= 0,
			m= r.length;
			n|| (n= 2);
		for(; i<m; i+=n) o.push(r.slice(i, i + n));
	  return o;
	},


	guard: function(v, n) { //given a function, limits the accepted # of arguments to that function to the number specified by the 2nd argument. prevents array methods from seeing the collection.
		return function() {
			return v.apply(this, [].slice.call(arguments, 0, + n || 99));
		}
	},

	has: function(o) { // returns true when the object of the first argument includes own or inherited properties named by a string this
		return o[this] !== undefined;
	},

	hasOwn: function(o) { // returns true when the object of the first argument includes own (not inherited) properties named by a string this
		return [].hasOwnProperty.call(o, this);
	},

	hasOwnThis: function(s) { // returns true when the object of this includes own (not inherited) properties named by a string first argument
		return [].hasOwnProperty.call(this, s);
	},

	head: function(sr,_,__) { // returns the first value(s) of the first argument. Pass an index to return the values of the array before that index.
		return sr.slice(0, +this||1);
	},
	
	inc: function(n,_,__) { // increments a numerical argument by one or by a number specified by this
		n += +this || 1;
		return n;
	},

	initial: function(sr,_,__) { // returns all but the last values of the first argument, be it a string or array (not ie7 compat)
		return sr.slice((-1 * this) || -1)[0]
	},

	intersect: function(v,_,__) { // returns true if this (string or array) contains the argument
		return this.indexOf(v) != -1;
	},

	invoke: function(v,_,__) { // invoke a named method on the argument (no arguments; use F.method to be specific)
		return v[this]();
	},

	invokeSelf: function(v,_,__) { // invoke a named method on the argument (passing itself; use F.method to be specific). good for linking urls, marking up colors, etc
		"use strict";
		return v[this](v);
	},

	is: function is(v, v2){ // returns true if the first argument is the same as the 2nd
		return v === v2 || (isNaN(v) && isNaN(v2));
	}, 


	isBoolean: function(v) { // returns true if the argument is a strict boolean value
		return v === true || v === false;
	},
	
	isArray: Array.isArray.bind(Array), // returns true if the argument is an array


	isDate: function(v) { // returns true if the argument is a proper Date object
		return v && v.constructor === Date;
	},

	isDefined: function(v) { // returns true if the argument is not null or undefined
		return v != null;
	},

	isFalse: function(v){ // returns true if the first argument is falsy, false if it is truish.
		return !v;
	},
	
	isTrue: Boolean, // returns true if the argument is not "",0,false,undefined,null,or NaN

	isType: function(v) { // returns true if the argument is of the type specified by this
		"use strict";
		return typeof v == this; //soft compare for non-strict this
	},

	isConstructor: function(v) { // returns true if the argument's constructor is the same as this specifies
		"use strict";
		return v.constructor == this;
	},

	isElement: function(v) { // returns true is the argument is an HTML element object
		return v instanceof Element;
	},

	isNode: function(v) { // returns true if the argument is an HTML node object (includes elements, comment nodes, textnodes, etc)
		return v instanceof Node;
	},

	isEmail: RegExp.prototype.test.bind(/\S+@\S+\.\S+/), // returns true if the argument is a potentially valid email address

	isEmpty: function(v) { // returns true if the object is false, and empty array ([]), or an empty object ({})
		if (!v) return !0;
		for (var i in v) if ([].hasOwnProperty.call(v, i)) return !1;
		return !0;
	},

	isInt: function(v) { // returns true if the argument is an integer (string or number or single-item array)
		return Math.floor(v) == v;
	},

	isNaN: isNaN, // returns true if the argument is NaN (an invalid number from a math operation)

	isNative: function(f){
		return typeof f==="function" && Function.toString.call(f).indexOf("[nat"+"ive code]")>-1;
	},

	isNeg: function(n) { // returns true if the argument is less than zero
		return n < 0;
	},

	isNull: function(v) { // returns true if the argument is exactly null 
		return v === null;
	},

	isNumber: function(v) { // returns true ifs the argument is a strong Number
		return (+v || v === 0) && typeof v === "number";
	},

	isNumerical: function(v) { // returns true if the argument can be used as a number
		return !!+v || v === 0;
	},

	isObject: function(v) { // returns true if the argument is an Object (of any kind)
		return Object(v) === v;
	},

	isPlainObject: function(v) { // returns true if the argument is an Object from a literal, JSON, or "new Something()"
		return typeof v === "object" && v.constructor === Object;
	},

	isOwn: Function.call.bind([].hasOwnProperty), // returns true if the first argument is an object with the 2nd argument as a non-inherited property.

	isPos: function(n) { // returns true if the argument is greater than or equal to zero
		return n >= 0;
	},

	isRegExp: function(v) { // returns true if the argument is a RegExp regular expression object
		return v && v.constructor === RegExp;
	},

	isSet: function(v) { // returns true if value given to first argument is set and is not null
		return v!=null;
	},

	isUndefined: function(v) { // returns true if the argument is exactly undefined
		var u;
		return v === u;
	},

	isURL: RegExp.prototype.test.bind(/https?:\/\/(www.)?[-a-zA-Z0-9@:%._+~#=]{2,256}.[a-z]{2,6}([-a-zA-Z0-9@:%_+.~#?&\/=]*)/), // returns true if the argument is a URL
	
	k: function(v) { // returns the first argument, alias for K
		return v;
	},

	keys: Object.keys, // returns an array of enumerable own property names in an object 

	largest: function(v,v2,_,__){ // use w/ reduce to find largest value in 1st arg array. the biggest number, most recent date, or last alphabetical string.
		return v > v2 ? v : v2;
	},
	
	last: function(sr) { // returns the last value of the first argument, be it a string or array.
		return sr.slice(-1)[0];
	},

	later: function() { // returns a new Promise set to resolve when the stack clears.
		return new Promise(setTimeout);
	},

	lcase: Function.call.bind(String.prototype.toLowerCase), // returns a lower-case version of the value passed to the first argument

	left: function(sr,_,__) { // returns a slice from the left a numerical value given to this # of slots
		"use strict";
		return sr.slice(0, + this);
	},
	
	less: function(n, n2) { // returns the smaller of two (and only two) numerical values. (Math.min accepts unlimited arguments)
		return Math.min(n, n2);
	},

	locale: function(v){ // returns a localized string view of a value (if available)
		return v==null ? String(v) : (v.toLocaleString? v.toLocaleString() : String(v) );
	},
	
	log: function(v){ // prints the first argument to the console and returns the first argument. safe to call even if no console in host
		if(typeof console!=="undefined") console.log(v);
		return v;
	},

	lt: function(v,_,__) { // returns true if the argument is less than this
		"use strict";
		return v < this;
	},

	lte: function(v,_,__) { // returns true if the argument is less than or equal to this
		"use strict";
		return v <= this;
	},

	lut: function(r){ // given an array first argument, returns a Look Up Table for the array to allow fast index lookup by array element value
		var o={},i=-1,m=r.length;
		for(;++i<m;)o[r[i]]=i;
	  return o;
	},

	lutKey: function(r, s, many){ // given an array first argument, and a property 2ns argument returns a Look Up Table for the array to allow fast index lookup by array element property value.
		var o={},i=-1,m=r.length;
		if(many){
			for(;++i<m;) (o[r[i][s]]=o[r[i][s]]||[]).push(r[i]); 
		}else{
			for(;++i<m;) o[r[i][s]]=r[i];
		}
	  return o;
	},
	
	map: function map(r, f, v) { // like [].map except: arg1+2 can be string, sparse arrays are visited, callback's 3rd arg is orig (not clone), faster.
		"use strict";
		var m= r.length,
			o= [],
			i= 0;
			
		if(f.split) f= map[0+f] || (map[0+f]=Function("a,b,c",'"use strict";return '+ f)) ;
		
		if(v==null){
			for (; i<m; i++) o[i]= f(r[i],i,r);
		}else{
			for (; i<m; i++) o[i]= f.call(v,r[i],i,r);
		}
		return o;
	},

	matches: function(sr,_,__) { // returns true if the argument matches a value (string or regexp (or any value with arrays)) given as this
		"use strict";
		if(typeof sr==="string") return sr.search(this) !== -1;
		return sr.indexOf(this) !== -1;
	},

	max: Function.apply.bind(Math.max, Math), // returns the largest value in an array given to the first argument. use Math.max to find the max of many arguments instead of an array.

	median:  function(sr){ // given an array or string first argument, returns the median value
		var i=sr.length/2, x;
		if(!sr.join){sr=sr.split("");}
		sr=sr.slice().sort(function(v,v2){return v>v2?1:(v==v2)-1});
		x=(i in sr) ? ((sr[~~i]+sr[~~i-1])/2) : sr[~~i];
		return isNaN(x) ? sr[~~i-1] : x; 
	},
	
	memoize: function(f) { // memorizes calls to the function given by the first argument by it's first argument, returning the stored value if available
		var cache = {}, has = cache.hasOwnProperty.bind(cache);
		return function(x) {
			return has(x) ? cache[x] : (cache[x] = f.apply(this.arguments));
		};
	},

	method: function(v, i, r) { // calls a method on the first argument given by an array as this: ["methodName", [...optionalMoreArgs]]
		return v[this[0]].apply(v, this.slice(1));
	},

	methods: function(e, t, n) { // calls a method on the first argument given by an array as this: ["methodName", ["call1arg1","call2arg1","call3arg1"...]]
		var k = this.shift();
		return this.pop().map(function(a,_,__) {
			return e[k].call(e, a);
		});
	},

	min: Function.apply.bind(Math.min, Math), // returns the smallest value in an array given to the first argument. use Math.min to find the min of many arguments instead of an array.

	mod: function(n,_,__) { // returns the division remainder (modulo) from dividing the first argument by this 
		"use strict";
		return n % this;
	},
	
	mode: function(r){ // given an array, returns the most common value in the value. works with almost any type of data
	  var c=[], u=[], m=0;
	  [].forEach.call(r, function(a){
		var n=u.indexOf(a);
		if(n==-1){ u.push(a); c[n=u.length-1]=0; }
		 c[n]++;
		 if(c[n]>m){ m=c[n]; }
	  });
	 return u[ c.indexOf(m) ];
	},

	modifyProperty: function(o,_,__) { // modifies a property of the first argument named by this[0] and specified by this[1](o[[this][0]])
		var f = this[1],
			k = this[0];
		o[k] = f.call(o, o[k]);
		return o;
	},

	more: function(v, v2) { // returns the larger of two (and only two) numerical values. (Math.max accepts unlimited arguments)
		return Math.max(v, v2);
	},

	multiply: function(n,_,__) { // multiplies this by a numerical first argument. 
		"use strict";
		return n * this;
	},

	negate: function(f) { // returns a function from the first argument that returns the boolean opposite of what it used to
		"use strict";
		return function() {
			return !f.apply(this, arguments);
		}
	},

	noop: function() { // does nothing, but cheap to run. note: my research suggests that for most argument types, Boolean is faster in V8 is you don't care about the output. 

	},

	not: function(v,_,__) { // a soft compare of the arguments and this
		"use strict";
		return v != this;
	},

	now: Date.now, // returns the current time in ms since 1970
	
	notNull: function(v) { // returns true for anything besides null or undefined.
		return v != null;
	},

	once: function(f) { // makes a copy of a function that can only be called once. Subsequent calls will have no effect, returning the value from the first call.
		var spent = false;
		return function() {
			if (spent) return f;
			spent = true;
			return f = f.apply(this, arguments);
		}
	},

	obKeysx: function(o) { // returns an array of enumerable property names in an object, including inherited properties
		var t = [],
			n = 0;
		for (var r in o) t[n++] = r;
		return t;
	},

	obMap: function(o) { // from each own key:value pain in an object, returns a 2-col array of [key,value], good for feeding to array methods.
		var t = [],
			n = 0;
		for (var r in o) o.hasOwnProperty(r) && (t[n++] = [r, o[r]]);
		return t;
	},

	obMapx: function(o) { // from each key:value pain in an object, including inherited ones, returns a 2-col array of [key,value], good for feeding to array methods.
		var t = [],
			n = 0;
		for (var r in o) t[n++] = [r, o[r]];
		return t;
	},

	obVals: function(o) { // returns an array of enumerable own property values in an object 
		var t = [],
			n = 0;
		for (var r in o) o.hasOwnProperty(r) && (t[n++] = o[r]);
		return t;
	},

	obValsx: function(o) { // returns an array of enumerable property names in an object, including inherited properties
		var t = [],
			n = 0;
		for (var r in o) t[n++] = o[r];
		return t;
	},

	odd: function(n,_,__) { // returns true if the argument is an odd numerical value
		return n % 2 !== 0;
	},

	ok: function(v) { // returns true if the argument is not null or undefined. alias for isDefined, among others.
		return v != null;
	},

	or: function(o,_,__){ // given a value 1st argument and an array of functions/values via this, returns the value of the first truthy one or undefined. strong compare, spec many flavors in this array to soften
		"use strict";
		var u,k;
		return [].some.call(this, function(a){
			k=a;
			return  typeof a==="function" ? (k=a(o)) : o===a;
		}) ? k : u;
	},
	
	ord: function(s){ // returns the ascii value of the first character of a string first argument 
		return (""+s).charCodeAt(0);
	},
	
	pad: function(s, n, s2) { // pads/trims the left side of a string first argument with 3rd argument (or spaces) until length is == 2nd argument.
        s2||(s2=" ");
        return n > s.length ? Array((1+n)-s.length).join(s2)+s : s.slice(0,n);
	},
	
	pairs2object: function(r, o){ // given a 2d array of 2-col sub-arrays, returns an object with keys defined by each subarray[0] and values from subarray[1]. reverts F.obMap output back to an object.
		o=Object(o||{});
		r.forEach(function(a,b,c){ o[a[0]]=a[1]; });
		return o;
	},

	partial: function(fn) { // Partially apply a function in the first arguments by filling in any number of its arguments, without changing its dynamic this value. 
		"use strict";
		var args = [].slice.call(arguments, 1);
		return function() {
			return fn.apply(this, args.concat(Array.apply(null,arguments)));
		}
	},

	partition: function(arr, fnDecide) { // splits a collection into two arrays: one whose elements all satisfy the given predicate, and one whose elements all do not satisfy the predicate.
		var oks = arr.filter(fnDecide),
			bads = arr.filter(function(e,_,__) {
				return oks.indexOf(e) === -1;
			});
		return [oks, bads];
	},

	percent: function(n,_,__) { // returns the first argument as a ratio to a numerical this value
		"use strict";
		return n / this;
	},

	pick: function(o,_,__) { // copies an object, filtered to only have values  white-listed by an array of valid keys. includes inherited properties (so it can use the DOM).
		"use strict";
		var temp = {};
		for(var i=0,m=this.length;i<m;i++)	if ( o[this[i]] !== undefined) temp[this[i]] = o[this[i]] ;
		return temp;
	},
	
	pluck: function(o,_,__) { // returns a single property named by this from the object passed to the first argument. alias for F.extract
		"use strict";
		return o[""+this];
	},

	populate: function(r) { // fills an array with value of this or calling this (if function) against the arguments
		"use strict";
		for (var i = 0, m = r.length; i < m; i++) {
			r[i] = this.apply ? this.apply(v, arguments) : this;
		}
		return r;
	},

	prependProperty: function(o,_,__) { // given a [key,value] array as this, prepends that value to an existing property on the first argument
		o[this[0]] = this[1] + o[this[0]];
		return o;
	},

	prepend: function(v,_,__) { // prepends this onto first argument. like F.add, but backwards. has same effect on numbers as F.add
		"use strict";
		var t=this;
		if(typeof t==="function"){ t=t(v,_,__); }
		return t.concat ? t.concat(v) : (t+v);
	},

	pretty: function(v) { // pretty-prints a JS Object or Array using JSON
		return JSON.stringify(v, null, "\t");
	},

	property: function(k){ //returns a function that returns a property named by the first argument on an object passed to it's first argument. ~50% faster than F.pluck
		"use strict";
		return function(o,_,__){return o[k];};
	},

	properties: Object.getOwnPropertyNames, // returns an array of all own property names in an object 

	propIsEquiv: function(o,_,__){ // returns true if an object given to the first argument contains a property named by this[0] that is == this[1]
		"use strict";
		return o[this[0]]==this[1];
	},

	propIs: function(o,_,__){ // returns true if an object given to the first argument contains a property named by this[0] that is === this[1]
		return o[this[0]]===this[1];
	},

	propIsIn: function(o,_,__){ // returns true if an object given to the first argument contains a property named by this[0] that is === to a element in an array from this[1]
		return this[1].indexOf(o[this[0]])>-1;
	},

	propIsNot: function(o,_,__){ // returns true if an object given to the first argument contains a property named by this[0] that is not === this[1]
		return o[this[0]]!==this[1];
	},
	
	propIsNotEquiv: function(o,_,__){ // returns true if an object given to the first argument contains a property named by this[0] that is not == this[1]
		return o[this[0]]!=this[1];
	},

	propIsLess: function(o,_,__){ // returns true if an object given to the first argument contains a property named by this[0] that is less than this[1]
		return o[this[0]] < this[1];
	},

	propIsMore: function(o,_,__){ // returns true if an object given to the first argument contains a property named by this[0] that is greater than this[1]
		return o[this[0]] > this[1];
	},
		
	quote: function(s) { // escapes nested quotes and restricted white-space and wraps quotes around a stringy first argument to form a valid JS string literal
		return JSON.stringify("" + s).replace(/\\t/g, "	");
	},

	range: function(n) { // returns an array of numbers from 0 to n;
		for(var r=[],i=0;i<n;i+=1) r.push(i);
      return r; 
	},
	
	random: Math.random, // returns a random number between zero and one

	randomString: function(n){ // given a length as the first argument, returns a string of random wordy chars.
		var s="", m=+n||16;
		while(s.length<m)s+=(1/Math.random()).toString(36).slice(3,-1).replace(/\W+/g, "").replace(/^\d+/,"");
		return s.slice(0, m);
	},

	reduce: function reduce(r, f, v) { // given an array as the first argument and a function as the 2nd,  perform a reduction on the array, left to right
		"use strict";
		var	m=r.length,
			i=0, u;
			if(v===u){ v= r[i++]; };
			if(f.split) f= reduce[0+f]||(reduce[0+f]=Function("a,b,c,d",'"use strict"; return '+f));
		for(; i<m; i++) {
			v=f(v, r[i],   i,   r);
		}
		return v;
	}, 
		
	regexp: RegExp.prototype.test, // used with [].filter to match array elements with a regular expression

	reject: function(r,f,v) { // like [].filter(), but returns elements which invoke the callback to return falsy
		function o(a,b,c){return !f.apply(this, arguments);}
		return v!=null ? r.filter(o,v) : r.filter(o);
	},

	redact: function(s) { // given a string first argument, replace wordy chars with hash symbols, or a replacement specified by this
		"use strict";
		return "".replace.call(s, /(\w)/g, this && this.charAt ? this : "#" );
	},

	repeat: function(s, n) { // given a string and a number, repeats that string a number of times.
		return Array((+n || 0) + 2).join(s || "");
	},

	repeated: function(v, i, r) { // used with [].filter, returns true if the current element is the same value as the previous one. see also: F.changed
		return r[i - 1] === v;
	},

	replaceAll: function(s,v,s2) { // given a string first argument, a string or regexp to match as 2nd arg, and a replament valuer as third argument, replace all matches with the replacement. uses split to allow RegExp capturing and sub-splitting
		"use strict";
		return "".split.call(s, v).join(s2);
	},

	replaceFirst: function(s,rx,s2) { // given a string first argument, a string or regexp to match as 2nd arg, and a replament valuer as third argument, replace first match with the replacement
		"use strict";
		var r2;
		if(typeof rx==="object"){
			r2=(rx+"").split("/");
			rx.compile( r2.slice(1,-1).join("/"), r2.pop().replace("g", ""));
		}
		return "".replace.call(s, rx); 
	},
	
	replaceThis: function(s) { // given a string first argument and conversion object {"repWith$1":/an rx/ig} as this, replaces value matches with key
		"use strict";
		var o=this;
		Object.keys(o).forEach(function(k){
			var rx=o[k];
			s=s.replace(rx, k);
		});
		return s;
	},
	
	replace: function(s,_,__) { // given a 2-element array as this, replaces a string first argument's matches for this[0] with this[1]
		return ("" + s).replace(this[0], this[1].call ? this[1].bind(s) : this[1]);
	},

	rest: function(e) { // returns the rest of the values of the first argument. Pass an index to return the values of the array from that index onward.
		return e.slice(-1 * this);
	},

	resolve: function(o) { // given an array of nested property names using this, grabs value at that relative location from the argument. invokes methods (w/o args).
		return this.reduce(function(o, k,_,__) {
			var v = o && o[k];
			return typeof v === "function" ? v.call(o) : v;
		}, o);
	},

	result: function(o,s){ // given a function, returns the result of calling the function, otherwise returns the first argument
		"use strict";
		if(!s){ s=o; o=this; }
		return typeof o[s] === "function" ? o[s].call(o) : o[s];
	},
	
	reverse: function(s) { // reverses accessor property order on a stringy or array-y first argument
		return [].slice.call(s).reverse()[typeof s === "string" ? "join" : "valueOf"]("");
	},

	right: function(sr,_,__) { // returns a slice from the right a numerical value given to this # of slots
		"use strict";
		return sr.slice(-1 * this);
	},

	round: Math.round, // returns an integer closest to the number passed to the first argument

	rPad: function(s, n, s2) { // pads/trims the right side of a string first argument with 3rd argument (or spaces) until length is == 2nd argument.
        s2||(s2=" ");
        return n > s.length ? s + Array((1+n)-s.length).join(s2) : s.slice(0,n);
	},
	
	rPartial: function(f) { // Partially apply a function in the first arguments, later filling in any number of the result's arguments. 
		"use strict";
		var args = [].slice.call(arguments, 1);
		return function() {
			return f.apply(this, Array.apply(0,arguments).concat(args));
		};
	},

	
	run: function(v,_,__) { // given a function as this, run the function passing the first argument
		"use strict";
		return this(v);
	},

	same: function(v,_,__) { // returns true if the argument is equivalent to this
		"use strict";
		return v == this;
	},

	sameAs: function(v,_,__) { // returns a new function that returns true if it's argument is equivalent to the first argument of sameAs
		return function(a){return v == a;}
	},
	
	sample: function(v, i, r) { // used with [].filter(), returns a single element of the array at random
		if (undefined === r._out) {
			r._out = Math.floor(Math.random() * r.length);
		}
		return i === r._out;
	},

	selMatch: function(o,_,__) { // given an object first argument and a regexp this, returns a new object with only properties matched by the regexp
		var o2 = o.constructor === Array ? [] : {};
		Object.keys(o).filter(/./.test, this).forEach(function(k,_,__) {
			o2[k] = o[k];
		});
		return o2;
	},

	selMatchValue: function(o,_,__) { // given an object first argument and a regexp this, returns a new object with only properties whose value matches the regexp
		var o2 = {}, t=this;
		Object.keys(o).forEach(function(k,_,__) {
			if (t.test(o[k])) o2[k] = o[k];
		});
		return o2;
	},

	shuffle: function(v, i, r) { // used with [].map to randomize the order of elements in an array
		var out = i ? r.r : r.r = r.slice(),
			ol = out.length;
		return ol === 1 && delete r.r, out.splice(Math.floor(Math.random() * ol), 1)[0];
	},

	size: function(sr) { // returns the length of the first argument or zero non non-lengthy things
		if(!sr || sr===true) return 0;
		if( sr.length-.1 ) return sr.length;
		return Object.keys(sr).length; 
	},

	skipWhile: function(r, f, o){ // given an array 1st argument, skips elements until the function of the 2nd argument returns false (called as [].map) then returns rest
		var i=0,u;
		o=o===u?this:o;
		r.every(function(_,__,___){i++; return f.apply(o,arguments); });
		return r.slice(Math.max(0,i-1));
	},
	
	slice: function(n,_,__) { // returns the first # of items from a string or array argument, specified by a numerical this value
		return [].slice.call(n, 0, +this || 9e9);
	},
	
	smallest: function(v,v2,_,__){ // use w/ reduce to find smallest value in 1st arg array. the lowest number, most oldest date, or first alphabetical string.
		return v < v2 ? v : v2;
	},
	
	some: Function.call.bind([].some), // given an array first argument and a function 2nd argument, returns true if any elements cause the function to return truish

	
	sortBy: function sortBy(r, s) { // a generic sorter using a property, named by arg 2, on an array of objects (arg 1) sorts by the property value
		"use strict";
		var s= /^[\w().]+$/.test(s) ? ("."+s) : ("["+JSON.stringify(s)+"]"),
		   fn=sortBy[0+s]||(sortBy[0+s]=Function("a, b",'"use strict";return  (a'+s+" > b"+s+" ? 1 : ( (a"+s+" === b"+s+") ? 0 : -1 ));"));
		   
		return r.sort(fn);
	},
	
	sortDate: function(d, d2) { // a fast numerical sorter for ordering arrays of Dates from oldest to newest
		return d - d2;
	},

	sortInt: function(n, n2) { // a format-forgiving numerical sorter for ordering numerical arrays from least to greatest
		return parseInt(n, 10) - parseInt(n2, 10);
	},

	sortNoCase: function(s, s1) { // a test sorter for ordering an array from A to Z the same as a to z (case insensitive)
		s = (s + '').toLowerCase();
		s1 = (s1 + '').toLowerCase();
		return s === s1 ? 0 : (s > s1 ? 1 : -1);
	},

	sortNumber: function(n, n1) { // a fast numerical sorter for ordering numerical arrays from least to greatest
		return n - n1;
	},

	sortProperty: function(o, o2) { // a generic sorter using a property, named by this, on an array of objects that returns 0 for a match, and 1 of the first argument is more than the 2nd
		"use strict";
		o = o[this];
		o2 = o2[this];
		return o > o2 ? 1 : ((o == o2) - 1);
	},
	
	sortObjectKeys: function(o) { // given an object first argument, rewrite its keys to alphabetical order (v8 automatically numbers numerical keys, and this function is NOT guaranteed to work or to produce the same output on every device, but it can make json views more human-friendly and it won't harm the data...
		Object.keys(o).sort().forEach(function(k){
			var v=o[k];
			delete o[k];
			o[k]=v;
		});
		return o;
	},

	sorter: function(v, v2) { // a generic sorter that returns 0 for a match, and 1 of the first argument is more than the 2nd
		return v > v2 ? 1 : (v == v2) - 1;
	},
	
	split: function(s,_,__){ // given a stringy first argument and a delimiter this (string or regexp), split the string by the delimiter
		"use strict";
		return "".split.call(s, this);
	},
	
	sqrt: Math.sqrt, // returns the square root of the first argument

	square: function(n,_,__) { // returns the square of a numerical first argument
		return n * n;
	},

	startsWith: "".startsWith ? Function.call.bind("".startsWith) : function(s,_,__) { // returns true if the argument starts with this. use "".startsWith to go from this to the first argument
		"use strict";
		return s.indexOf(this) === 0;
	},

	stripComments: function(s) { // removes multi-line comments (js/css/php/etc) from a stringy first argument
		return (s + "").replace(/\/\*([\w\W]+?)\*\/{1}/g, "");
	},

	stripTags: function(s) { // removes well-formed xml and html tags from a stringy first argument
		return (s + "").split(/<\/?[^>]+?>/).join("");
	},

	substr: function(sr,_,__) { // return part of a string (or array) based on [start, [end]] array given to this
		return sr.slice(+this[0]||+this||0, this[1]||9e9);
	},
	
	subtract: function(n,_,__) { // subtracts this from a numerical first argument. 
		"use strict";
		return n - this;
	},

	subMethod: function(f, s) { //given a 1st arg function, returns a new function that runs on a property of the element instead of the whole, specified by 2nd arg.
		return function(v,_,__) {
			return f.call(this, v[s], _, __);
		}
	},

	succ: function(s) { // converts the last character of a string argument to the following character
		return s.slice(0, - 1) + String.fromCharCode(s.slice(-1).charCodeAt(0) + 1);
	},

	sum: function(a, b,_,__) { // adds two numbers or concatenates two strings. good for [].reduce. use F.add for one good for [].map
		return a + b;
	},

	sumNumber: function(n, n2,_,__) { // adds the first argument to the 2nd, coercing as a number to prevent the concatenation of quoted numbers
		return +n + +n2;
	},

	surround: function(s,_,__) { // surrounds a stringy first argument with a stringy this value
		"use strict";
		return this + s + this;
	},

	tag: function(s,_,__) { // makes an html tag, name specified by this, wrapping around the value of the first argument
		"use strict";
		return "<" + this + ">" + s + "</" + this + ">";
	},

	tail: function(sr) { // returns the last value(s) of the first argument. Pass an index to return the values of the array from that index onward.
		"use strict";
		return sr.slice(-1 * (+this||9e9));
	},

	takeWhile: function(r, f, o){ // given an array 1st argument, returns elements until the function of the 2nd argument returns false (called as [].map)
		var i=0,u;
		o=o===u?this:o;
		r.every(function(){i++; return f.apply(o,arguments); });
		return r.slice(0, Math.max(0,i-1));
	},
	
	template: function(o, _, __) { // given a string this and an object first argument, injects own property of that object into that string via {{key}} placeholders
		"use strict";
		var r= ("" + this).split("{{"),
			s= "";
		for (var i= 0, m= r.length; i < m; i++) {
			var p = r[i].split("}}");
			s += i ? (o[p[0]] + p[1]) : r[i];
		}
		return s;
	},

	that: function(_,__,___) { // returns this, like F.fill() without the dynamic capability of accepting functions.
		"use strict";
		return this;
	},

	this2a: function(v,_,__) { // run method given by this on object given by first argument. unlike F.run(), the argument becomes this. use w/ methods like "".toLowerCase
		"use strict";
		return this.call(v);
	},

	flip: function(f) { // for a 1-arg function, returns a new function from a function given as the first argument that flips this and the first argument 
		"use strict";
		return function(v) {
			return f.call(v, this);
		}
	},
	
	tee: function(a,_,__){ // runs a function specified by this on the first argument and returns the first argument
		"use strict";
		this(a);
		return a
	},

	thisAt: function(s,_,__) { // given a key, returns this at the key
		"use strict";
		return this[s];
	},

	thisOverA: function(n,_,__) { // returns this over the first argument (division)
		"use strict";
		return this / n;
	},

	time: function(v){ // given a date (or nothing for the current time) as the first argument, returns the time portion of the date in local format
		return new Date(v||+new Date()).toLocaleTimeString()
	},
	
	timer: 	typeof performance !== "undefined" ? performance.now.bind(performance) : Date.now , // returns a time in ms 

	times: function(n,_,__) { // multiplies the first argument by a numerical this value 
		"use strict";
		return n * this;
	},

	toArray: Function.call.bind([].slice), // turns an array-like value into a true Array

	to$: function(f) { // converts a function written for [].filter for use with $.filter, or [].forEach to $.each, or vice versa
		"use strict";
		return function(a, b, c) {
			return f.call(this, b, a, c);
		}
	},

	toFixed: function(n,_,__) { // limits the decimal places of a numerical first argument by this # of spaces, defaults to 2 if this is non-numeric
		"use strict";
		return ((1 * n) || 0).toFixed(+this || 2);
	},

	trim: function(s) { // removes white-space from the start and end of a string
		return ("" + s).trim();
	},

	trimLeft: function(s) { // removes white-space from the start of a string
		return ("" + s).replace(/^\s+/, "");
	},

	trimRight: function(s) { // removes white-space from the end of a string
		return ("" + s).replace(/\s+$/, "");
	},

	trunc: Math.trunc || function(n) {
		return +("" + n).split(".")[0];
	}, // truncates the number given to the first argument at the decimal point.

	typeOf: function(v) { // returns the string type of the first argument
		return typeof v;
	},

	ucase: Function.call.bind(String.prototype.toUpperCase), // returns an upper-case version of the value passed to the first argument

	unequal: function(v,_,__) { // returns true if the argument does exactly equal this
		"use strict";
		return v !== this;
	},

	unequiv: function(v,_,__) { // returns true if the argument does not loosely equate to this
		"use strict";
		return v != this;
	},

	unique: function(v, i, r) { // used by [].filter(), returns true of the current item is the only one of it's exact value in the array
		return r.indexOf(v) === i;
	},

	uniqueId: function uniqueId(s){ // returns a unique string, with an optional prefix passed to the first argument
		uniqueId.id=uniqueId.id||0;
		return (s||"")+uniqueId.id++;
	},
	
	union: function(r,_,__) { // Computes the list of values that are the intersection of all the arrays. Each value in the result is present in each of the arrays.
		"use strict";
		return this.concat(r).filter(function(a,b,c){
			return c.indexOf(a)===b;
		});
	},

	unmethod: function(o, s) { // given an object and a method name,  returns that method bound to the object
		return o[s].bind(o);
	},

	uuid: function(){ // returns a UUID string
		return [8,4,4,4,12]
		.map(function(a,_,__){return ("abcde"+(1/Math.random()).toString(16)).slice(-1*a); })
		.join("-")
		.replace(/(.{14})./,"$14");
	},
	
	values: function(o) { // returns an array of values from an object given as the first argument
		return Object.keys(o).map(function(k,_,__) {
			return o[k];
		});
	},
	
	visit: function(o, f, c){ // given an object 2st argument and a function 2nd, runs the function on each property, like [].map(). optional this via 3rd arg
		var r={}, x;
		c= c===undefined ? o : c;
		for(var it in o) if((x=f.call(c,o[it],it,o))!=null) r[it]=x ;
		return r;
	},

	where: function(o,_,__) { // returns true for objects containing specific key:value pair defined by an object given as this
		var t=this;
		return Object.keys(t).every(function(k,_,__) {
			return o[k] === t[k];
		});
	},

	without: function(v,_,__) { // returns true if this does not contain the first argument
		"use strict";
		return this.indexOf(v) === -1;
	},

	words: function(s,_,__) { // returns an array of all the words in a string version of the first argument
		return "".match.call(s, /\b\w+\b/g) || [];
	},
	
	// EXCEL FUNCTIONS
		
	xAND: function(a,b){ // given two arguments, returns true if both are truthy
		return a && b && true;
	},
	
	
	xCOUNTA: function(r) { // returns a count of the non-empty values in an array passed to the first argument or all args
		var a=arguments;
		if(a.length>1) r=Array.apply(null,a);
		if(!r||!r.length) return 0;
		return [].filter.call(String).length;
	},

	xCOUNT: function(r) { // returns a count of the non-empty values in an array passed to the first argument or all args
		var a=arguments;
		if(a.length>1) r=Array.apply(null,a);
		if(!r||!r.length) return 0;		
		return [].filter.call(r, isFinite).length;
	},
	
	xCONCATENATE: Function.call.bind("".concat), // joins arguments together as a single string
	
	xIF: function(v, v1, v2){ // given three arguments, returns the 2nd if the 1st is true, otherwise returns the 3rd. use F.If for "lambda" version.
		return v ? v1 : v2 ;
	},
	
	xLEN: function(sr){ // returns the length of a string or array first argument
		return (sr && sr.length) || 0;
	},
	
	xNOT: function(a, b){ // given one or two arguments, returns true if all are falsy
		return !(a||b);
	},
	
	
	xOR: function(a,b){ // given two arguments, returns true if either is truthy
		return !!(a||b);
	},
	
	xSUM: function(r) { // returns the sum of values in an array passed to the first argument or all args
		var a=arguments;if(a.length>1) r=Array.apply(null,a);
		if(!r||!r.length) return 0;
		return [].filter.call(r,Number).reduce(function(a,b){return a+b;});
	},
	
	xTRIM: Function.call.bind("".trim), // removes wrapping spaces around a string
		
	xVLOOKUP: function(v, r, s, s2){// finds the 1st arg value in property specified by 3rd argument in an array of objects from 2nd arg. optional 4th arg plucks a result sub-property by name
		var v2=-1;
		r.some(function(a,b,c){ if(a[s]==v){ v2=b; return true;} });
		v=r[v2];
	  return v && s2 ? v[s2] : v;
	},
	
	xor: function xor(r1, r2){ // given two arrays, returns just the elements present in only 1 of the arrays, but not in both
		function no(a,b,c){return this.indexOf(a)===-1;}
		return r1.filter(no, r2).concat(r2.filter(no, r1));
	},
	
	zip: function(v, i,_) { // create a new array of the argument and this at the slot given by the 2nd argument
		return [v, this[i]];
	},
	
	_throw: function(){ // kills stack by throwing
		throw "STOPPED BY F.THROW";
	}
	
};



// PUBLISH (if needed), else just leave var F behind in script body to create global from normal external script file use, or a local in importScripts/eval uses:
if (typeof define === "function" && define.amd) {
	define(['exports'], function(){return F;}); 
} else {
	if(typeof module === "object" && module && module.exports){
		module.exports=F; 
	}
}
