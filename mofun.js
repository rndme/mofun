/*	mofun.js v2014.10.1   
	http://danml.com/mofun/
	(c) 2014 dandavis
	mofun may be freely distributed under the MIT license as is, or under [CCBY2.0]@dandavis when code comments are stripped (aka minified/uglifies/closured)

Contains many standalone functional programming helpers, function composers, comparators, sorters, filters, common transforms, and much more.

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
- this need not be an object, and in the context of [].map/filter/forEach/etc, the value will be converted to an object.
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
		return [].slice.call(root.querySelectorAll(css));
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
					r.splice(r.indexOf(v), 1) : 
					r.unshift(v);
		};
	}, 

	If: function(s) { // a quick and dirty filter maker from a string expression
		return Function("a,b,c", "return  " + s + "?a:undefined");
	},

	K: function(v) { // the identity function returns the first argument
		return v;
	},

	_: Function.call.bind([].slice), // turns an array-like thing (NodeList, arguments, etc) into a true Array

	a: function(a, b, c) { //returns the first argument, alias for K
		return a;
	},

	abs: Math.abs, // returns the absolute value of a numerical value given to the first argument

	add: function(v,_,__) { // adds this onto the first argument. use F.sum() to add two arguments.
		return v + this;
	},

	addProperty: function(o,_,__) { // given a [key,value] array as this, sets that value on the first argument
		o[this[0]] = this[1];
		return o;
	},

	addNumber: function(n,_,__) { // adds this onto the first argument. coerces to Number to avoid accidental concatenation. 
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

	argument: function() { // returns the argument slot specified by a numerical this value.
		return arguments[this];
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

	at: function(o,_,__){ // given an object first argument, and a index specified as a number or array of numbers as this, returns an array of values at each index
	  return [].concat(this).map(function(k,_,__){return this[k]},o);
	},
	
	avg: function(v, i, r) { // returns the value divided by the number of items in the third argument; a running average. usage: [1,2,3].map(F.avg, [0]).pop().
		return this[0] += v / r.length, this[0];
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

	capture: function() { // returns an array of all the arguments
		return [].slice.call(arguments);
	},

	ceil: Math.ceil, // returns the closes integer furthest from zero from the number passed to the first argument

	censor: function(r,_,__) { // given an object first argument and a string array this, returns the object without properties listed in the array.
		this.forEach(function(k,_,__) {
			delete this[k]
		}, r);
		return r;
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
		return String.prototype.replace.call(s, /\s+/g, " ").trim();
	},

	clone: function(o, bInherit) { // given an object argument, returns a deep copy that links to sub-objects "by-ref", and duplicates primitives. bInherit copies non-owns
		var o2 = {};
		for (var k in o) if (bInherit || [].hasOwnProperty.call(o, k)) o2[k] = o[k];
		return o2;
	},

	compact: function(v) { // used with [].filter(), returns a copy of the array without any null or undefined values.
		return v != null;
	},

	compose: function(f) { // compose a function 1st argument with a function this value to return a composition. the function by this should expect 1 arg.
		var that = this;
		return function() {
			return that.call(this, f.apply(this, arguments));
		};
	},

	concat: function(sr, sr2,_,__) { // concats the 1st argument with the 2nd. good for flattening arrays using arrOfArr.reduce(F.concat)
		return sr.concat(sr2);
	},

	constant: function(v){ // returns a function that returns a value given by the first argument
		return v.valueOf.bind(v);
	},
	
	contains: function(sr,_,__) { // returns true if the argument contains the value specified by this as one of it's accessor properties
		return sr.indexOf(this) > -1;
	},

	count: function count(o, v, i,_) { // for [].reduce, given an object and array of value, adds a value count to the object under a key set by the value. 
		if (i === 1) o = {};
		o[v] = o[v] ? (o[v] + 1) : 1;
		return o;
	},

	create: Object.create || function(o){ function f(){} f.prototype=p; return new f;}, // returns a new Object that inherits from the object passed as the first argument

	dasherize: function(s) { // converts a stringy first argument from camelCaseFormat to separated-by-dashes-format
		return (s + '').replace(/([a-z\d])([A-Z])/g, '$1-$2').toLowerCase();
	},

	dataURL: function(s) { // given a stringy first argument and an option string this to indicate mime type, returns a dataURL contain the first argument
		return "data:" + (this == ("" + this) ? this : "text/plain") + "," + encodeURIComponent("" + s);
	},
	
	date: function(v){ // a more versatile version of Date - can call/apply it with parts to make a new date
		if(!v) return new Date();
		if(v.join){ return new Date(+v[0]||0,+v[1]||0,+v[2]||0,+v[3]||0,+v[4]||0,+v[5]||0); }
		return new Date(v);
	},
	
	dateParts: function(v){ // given a date, returns an array of parts like [y,m,d,h,m,s,ms]
		return new Date( new Date(v) - (new Date().getTimezoneOffset() * 60000)).toUTCString().split(/\W+/).map(Number);
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
		n -= +this || 1;
		return n;
	},

	defaults: function(o,_,__) { // given an object this, fills missing key:value pairs on an object in the first argument
		Object.keys(this).forEach(function(k,_,__){var u;if(u===o[k]) o[k]=this[k]; }, this);
		return o;
	},
	
	defer: setTimeout, // given a function, waits the #of ms specified by the 2nd argument to execute the function

	define: function(s,v){ // defined a named property on this named by the first argument and set by the 2nd
		this[s]=v;
		return this;
	},
	
	defined: function(v) { // returns true if the argument is not undefined or null
		return v != null;
	},

	delta: function(v, n, r) { // used with [].map/filter, returns the difference with the last element, or 0.
		return n ? (r[n - 1] - v) : 0;
	},

	difference: function(v,_,__) { // Similar to without, but returns the values from argument that are not present in this
		return this.indexOf(v) === -1;
	},

	divide: function(n,_,__) { // divides this by a numerical first argument. 
		return n / this;
	},

	each: Function.call.bind([].forEach), // given an array as the first argument and a function as the 2nd, execute the function on each element in the array.
	
	endsWith: function(s,_,__) { // returns true if the argument ends with this
		return s.lastIndexOf(this) + this.length === s.length;
	},

	equal: function(v,_,__) { // returns true if the argument is exactly the same as a value given by this
		return v === this;
	},

	equiv: function(v,_,__) { // returns true if the argument is loosely the same as a value given by this
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

	f: function f(s, n) { // a quick and dirty function maker from a string of code. must be a single expression (use comma continuation if needed)
		return f["CACHE_"+s+n] || (f["CACHE_"+s+n]=Function(  // make a new function:
			"a,b,c,d,e,f,g,h,i".split(",").slice(0, (typeof n==="number")? n : 3) , //determine arity, defaulting to 3 for map/filter arity
			(s.indexOf("return")>-1?"":"return ") + s+";")
		); 
	},

	fill: function(v) { // returns value of this or calling this (if function) against the arguments
		return this.apply ? this.apply(v, arguments) : this;
	},

	filter: function filter(r, f, v) { // like [].filter except: arg1+2 can be string, sparse arrays are visited, callback's 3rd arg is orig (not clone), faster.
		var m= r.length,
			o= [],
			i= 0,
			x;
			
		if(f.split) f= filter[0+f] || (filter[0+f]=Function("a,b,c","return "+ f+";")) ;
		
		if(v==null){
			for (; i<m; i++) if(x=f(r[i],i,r)) o[o.length]=r[i];
		}else{
			for (; i<m; i++) if(x=f.call(v,r[i],i,r)) o[o.length]=r[i];
		}
		return o;
	},

	find: [].find ? Function.call.bind([].find) : function(r,f,o){var i=0;r.some(function(){i++; return f.apply(this,arguments); }, o||this);return r[i];}, // returns the value of the first element in an array given to the 1st argument that returns true when called like [].map to the function given to the 2nd argument

		
	findIndex: [].findIndex ? Function.call.bind([].findIndex) : function(r,f,o){var i=0;r.some(function(){i++; return f.apply(this,arguments); }, o||this);return i;}, // returns the index of the first element in an array given to the 1st argument that returns true when called like [].map to the function given to the 2nd argument
	
	findIndices: function(r,f,o){// returns the indices of elements in array given to 1st argument that return true when called like [].map to the function given to the 2nd argument
		var c=[];
		r.forEach(function(a,b,_){var x=f.apply(this,arguments); if(x)c.push(b);}, o||this);
	  return c;
	},
	
	first: function(sr) { // returns the first value of the first argument, be it a string or array (not ie7 compat)
		return sr.slice(0, 1)[0]
	},

	floor: Math.floor, // returns an integer closest to zero from the number passed to the first argument

	forEach: Function.call.bind([].forEach), // given an array as the first argument and a function as the 2nd, execute the function on each element in the array.

	formatNumber: function(n) { // returns a pretty string from a numerical first argument with commas separating out large numbers. set this a number to limit the # of decimals
		n = ("" + n).split(".");
		return n[0].replace(/(\d)(?=(?:\d{3})+$)/g, "$1,") + (n[1] ? ("." + n[1].slice(0, + this || 35)) : "");
	},

	getComments: function(s) { // returns multi-line comments (js/css/php/etc) from a stringy first argument
		return ((s + '').match(/\/\*([\w\W]+?)\*\//g) || []).map(function(a,_,__) {
			return a.slice(2, - 2)
		}).join("\n");
	},

	gt: function(v,_,__) { // greater than value compare
		return v > this;
	},

	gte: function(v,_,__) { // greater than or equals value compare	(use: )
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

	guard: function(v, n) { //given a function, limits the accepted # of arguments to that function to the number specified by the 2nd argument. prevents array methods from seeing the collection.
		return function() {
			return v.call(this, [].slice.call(arguments, 0, + n || 99));
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

	is:  Object.is || function(v, v2) {return v === v2 || (isNaN(v) && isNaN(v2));}, // returns true if the first argument is the same as the 2nd

	isArray: Array.isArray.bind(Array), // returns true if the argument is an array

	isBoolean: function(v) { // returns true if the argument is a strict boolean value
		return v === true || v === false;
	},

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
		return typeof v == this;
	},

	isConstructor: function(v) { // returns true if the argument's constructor is the same as this specifies
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
		return +v || v === 0;
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

	last: function(sr) { // returns the last value of the first argument, be it a string or array.
		return sr.slice(-1)[0];
	},

	later: function() { // returns a new Promise set to resolve when the stack clears.
		return new Promise(setTimeout);
	},

	lcase: Function.call.bind(String.prototype.toLowerCase), // returns a lower-case version of the value passed to the first argument

	left: function(sr,_,__) { // returns a slice from the left a numerical value given to this # of slots
		return sr.slice(0, + this);
	},

	less: function(n, n2) { // returns the smaller of two (and only two) numerical values. (Math.min accepts unlimited arguments)
		return Math.min(n, n2);
	},
	
	log: function(v){ // prints the first argument to the console and returns the first argument. safe to call even if no console in host
		if(typeof console!=="undefined") console.log(v);
		return v;
	},

	lt: function(v,_,__) { // returns true if the argument is less than this
		return v < this;
	},

	lte: function(v,_,__) { // returns true if the argument is less than or equal to this
		return v <= this;
	},

	lut: function(r){ // given an array first argument, returns a Look Up Table for the array to allow fast index lookup by array element value
		var o={},i=-1,m=r.length;
		for(;++i<m;)o[r[i]]=i;
	  return o;
	},
	
	map: function map(r, f, v) { // like [].map except: arg1+2 can be string, sparse arrays are visited, callback's 3rd arg is orig (not clone), faster.
		var m= r.length,
			o= Array(m),
			i= 0;
			
		if(f.split) f= map[0+f] || (map[0+f]=Function("a,b,c","return "+ f)) ;
		
		if(v==null){
			for (; i<m; i++) o[i]= f(r[i],i,r);
		}else{
			for (; i<m; i++) o[i]= f.call(v,r[i],i,r);
		}
		return o;
	},
  	
	mapPure: function mapPure(r, f, v) { // BETA! like F.map except: needs pure functions (no closures), runs WAY faster, and moves this into a 4th argument
		var m= r.length,
			o= Array(m),
			c= ""+f,
			i= 0; 
			
		
		if(f.split) f= map[0+f] || (map[0+f]=Function("a,b,c,d","return "+ f)) ;
		
		/* catch existing user-land functions and re-rewrite them to new anons that run faster:*/
		if(c.length!=4 &&c.indexOf("na"+"tive code")===-1){ /* no atives or bound functions please. weak smoking gun here. */
			if(mapPure[0+f]){
				f=mapPure[0+f];
			}else{
				var args=c.split(/[)(]/)[1].trim().split(/\s*,\s*/).filter(Boolean).concat("_","__","___").slice(0,3).join(",")+",that";
				var bod=c.split("{").slice(1).join("{").trim().slice(0,-1).trim().replace(/\bthis\b/g,"that"); /* yeah, it can clash with strings, careful! */
				f=mapPure[0+f]=Function(args, bod);
			}
		}
		
		for (; i<m; i++) o[i]= f(r[i],i,r,v);
		return o;
	},
  
   
  
	match: function(sr,_,__) { // returns true if the argument contains a match of a value given as this
		return sr.indexOf(this) !== -1;
	},

	max: Function.apply.bind(Math.max, Math), // returns the largest value in an array given to the first argument. use Math.max to find the max of many arguments instead of an array.

	memomize: function(f) { // memorizes calls to the function given by the first argument by it's first argument, returning the stored value if available
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
		return n % this;
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
		return n * this;
	},

	negate: function(f) { // returns a function from the first argument that returns the boolean opposite of what it used to
		return function() {
			return !f.apply(this, arguments);
		}
	},

	noop: function() { // does nothing, but cheap to run. note: my research suggests that for most argument types, Boolean is faster in V8 is you don't casre about the output. 

	},

	not: function(v,_,__) { // a soft compare of the arguments and this
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

	ord: function(s){ // returns the ascii value of the first character of a string first argument 
		return (""+s).charCodeAt(0);
	},
	
	pairMap: function(r) { // applies a function specified by this to an array by the first argument
		return this.apply(r[0], r);
	},

	partial: function(fn) { // Partially apply a function in the first arguments by filling in any number of its arguments, without changing its dynamic this value. 
		var args = [].slice.call(arguments, 1);
		return function() {
			return fn.apply(this, args.concat([].slice.call(arguments)));
		}
	},

	partition: function(arr, fnDecide) { // splits a collection into two arrays: one whose elements all satisfy the given predicate, and one whose elements all do not satisfy the predicate.
		var oks = arr.filter(fnDecide),
			bads = arr.filter(function(e,_,__) {
				return this.indexOf(e) === -1;
			}, oks);
		return [oks, bads];
	},

	percent: function(n,_,__) { // returns the first argument as a ratio to a numerical this value
		return n / this;
	},

	pick: function(o,_,__) { // copies an object, filtered to only have values  white-listed by an array of valid keys. includes inherited properties (so it can use the DOM).
		var temp = {};
		this.forEach(function(k,_,__) {
			if (this[k] !== undefined) temp[k] = this[k];
		}, o);
		return temp;
	},

	pluck: function(o,_,__) { // returns a property named by this from the object passed to the first argument. alias for F.extract
		return o[""+this];
	},

	populate: function(r) { // fills an array with value of this or calling this (if function) against the arguments
		for (var i = 0, m = r.length; i < m; i++) {
			r[i] = this.apply ? this.apply(v, arguments) : this;
		}
		return r;
	},

	prependProperty: function(o,_,__) { // given a [key,value] array as this, prepends that value to an existing property on the first argument
		o[this[0]] = this[1] + o[this[0]];
		return o;
	},

	prepend: function(s,_,__) { // prepends this onto string passed as the first argument. like F.add, but backwards. has same effect on numbers as F.add
		return this + s;
	},


	pretty: function(v) { // pretty-prints a JS Object or Array using JSON
		return JSON.stringify(v, null, "\t");
	},

	property: function(k){ //returns a function that returns a property named by the first argument on an object passed to it's first argument. ~50% faster than F.pluck
		return function(o,_,__){return o[k];};
	},

	properties: Object.getOwnPropertyNames, // returns an array of all own property names in an object 

	propIsEquiv: function(o,_,__){ // returns true if an object given to the first argument contains a property named by this[0] that is == this[1]
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
		var	m=r.length-1,
			i=0,u;
			if(v===u) v= r[i];
			if(f.split) f= reduce[0+f]||(reduce[0+f]=Function("a,b,c,d","return "+f));
		for(; i<m; i+=2) { // unroll X2 for large-array perf
			v=f(v, r[i], i, r);
			v=f(v, r[i+1], i+1, r);
		}
		return (++i<r.length) ? f(v, r[i], i, r) : v ;
	}, 
		
	regexp: RegExp.prototype.test, // used with [].filter to match array elements with a regular expression

	reject: function(r,f,v) { // like [].filter(), but returns elements which invoke the callback to return falsy
		function o(){return !f.apply(this, arguments);}
		return v!=null ? r.filter(o,v) : r.filter(o);
	},

	rest: function(e) { // returns the rest of the values of the first argument. Pass an index to return the values of the array from that index onward.
		return e.slice(-1 * this);
	},

	repeat: function(s, n) { // given a string and a number, repeats that string a number of times.
		return Array((+n || 0) + 2).join(s || "");
	},

	repeated: function(v, i, r) { // used with [].filter, returns true if the current element is the same value as the previous one. see also: F.changed
		return r[i - 1] === v;
	},

	replace: function(s,_,__) { // given a 2-element array as this, replaces a string first argument's matches for this[0] with this[1]
		return ("" + s).replace(this[0], this[1].call ? this[1].bind(s) : this[1]);
	},

	resolve: function(o) { // given an array of nested property names using this, grabs value at that relative location from the argument. invokes methods (w/o args).
		return this.reduce(function(o, k,_,__) {
			var v = o && o[k];
			return typeof v === "function" ? v.call(o) : v;
		}, o);
	},

	result: function(o,s){ // given a function, returns the result of calling the function, otherwise returns the first argument
		if(!s){ s=o; o=this; }
		return typeof o[s] === "function" ? o[s].call(o) : o[s];
	},
	
	reverse: function(s) { // reverses accessor property order on a stringy or array-y first argument
		return [].slice.call(s).reverse()[typeof s === "string" ? "join" : "valueOf"]("");
	},

	right: function(sr,_,__) { // returns a slice from the right a numerical value given to this # of slots
		return sr.slice(-1 * this);
	},

	round: Math.round, // returns an integer closest to the number passed to the first argument

	rPartial: function(f) { // Partially apply a function in the first arguments, later filling in any number of the result's arguments. 
		var args = [].slice.call(arguments, 1);
		return function() {
			return f.apply(this, [].slice.call(arguments).concat(args));
		}
	},

	run: function(v,_,__) { // given a function as this, run the function passing the first argument
		return this(v);
	},

	same: function(v,_,__) { // returns true if the argument is equivalent to this
		return v == this;
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
			this[k] = o[k];
		}, o2);
		return o2;
	},

	selMatchValue: function(o,_,__) { // given an object first argument and a regexp this, returns a new object with only properties whose value matches the regexp
		var o2 = {};
		Object.keys(o).forEach(function(k,_,__) {
			if (this.test(o[k])) o2[k] = o[k];
		}, this);
		return o2;
	},

	setProp: function(o,_,__) { // given a 2-slot array as this, sets a property on the first argument named by the first this element with a value of the 2nd this element
		o[this[0]] = this[1];
		return o;
	},

	setProps: function(o,_,__) { // given an object as this, sets a property on the first argument named and set by the keys and values of the this object; a merge
		Object.keys(this).forEach(function(k,_,__) {
			o[k] = this[k];
		}, this);
		return o;
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
		var i=0;
		r.every(function(_,__,___){i++; return f.apply(this,arguments); }, o||this);
		return r.slice(Math.max(0,i-1));
	},
	
	slice: function(n,_,__) { // returns the first # of items from a string or array argument, specified by a numerical this value
		return [].slice.call(n, + this || 0);
	},
	
	some: Function.call.bind([].some), // given an array first argument and a function 2nd argument, returns true if any elements cause the function to return truish

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
		o = o[this];
		o2 = o2[this];
		return o > o2 ? 1 : ((o == o2) - 1);
	},

	sorter: function(v, v2) { // a generic sorter that returns 0 for a match, and 1 of the first argument is more than the 2nd
		return v > v2 ? 1 : (v == v2) - 1;
	},
	
	sqrt: Math.sqrt, // returns the square root of the first argument

	square: function(n,_,__) { // returns the square of a numerical first argument
		return n * n;
	},

	startsWith: function(s,_,__) { // returns true if the argument starts with this. use "".startsWith to go from this to the first argument
		return s.indexOf(this) === 0;
	},

	stripComments: function(s) { // removes multi-line comments (js/css/php/etc) from a stringy first argument
		return (s + "").replace(/\/\*([\w\W]+?)\*\//g, "");
	},

	stripTags: function(s) { // removes well-formed xml and html tags from a stringy first argument
		return (s + "").split(/<\/?[^>]+?>/).join("");
	},

	substr: function(sr,_,__) { // return part of a string (or array) based on [start, [end]] array given to this
		return sr.slice(this[0]||0, this[1]||9e9);
	},
	
	subtract: function(n,_,__) { // subtracts this from a numerical first argument. 
		return n - this;
	},

	subFilter: function(f, s) { //returns a new function that runs on a property of the argument specified by s instead of the arguments.
		return function(v) {
			return f.apply(this, v[s].concat([].slice.call(arguments,1)));
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
		return this + s + this;
	},

	tag: function(s,_,__) { // makes an html tag, name specified by this, wrapping around the value of the first argument
		return "<" + this + ">" + s + "</" + this + ">";
	},

	tail: function(sr) { // returns the last value(s) of the first argument. Pass an index to return the values of the array from that index onward.
		return sr.slice(-1 * (+this||9e9));
	},

	takeWhile: function(r, f, o){ // given an array 1st argument, returns elements until the function of the 2nd argument returns false (called as [].map)
		var i=0;
		r.every(function(){i++; return f.apply(this,arguments); }, o||this);
		return r.slice(0, Math.max(0,i-1));
	},
	
	template: function(o, _, __) { // given a string this and an object first argument, injects own property of that object into that string via {{key}} placeholders
		var r= ("" + this).split("{{"),
			s= "";
		for (var i= 0, m= r.length; i < m; i++) {
			var p = r[i].split("}}");
			s += i ? (o[p[0]] + p[1]) : r[i];
		}
		return s;
	},

	that: function(_,__,___) { // returns this, like F.fill() without the dynamic capability of accepting functions.
		return this;
	},

	this2a: function(v,_,__) { // run method given by this on object given by first argument. unlike F.run(), the argument becomes this. use w/ methods like "".toLowerCase
		return this.call(v);
	},

	flip: function(f) { // for a 1-arg function, returns a new function from a function given as the first argument that flips this and the first argument 
		return function(v) {
			return f.call(v, this);
		}
	},
	
	tee: function(a,_,__){ // runs a function specified by this on the first argument and returns the first argument
		this(a);
		return a
	},

	thisAt: function(s,_,__) { // given a key, returns this at the key
		return this[s];
	},

	thisOverA: function(n,_,__) { // returns this over the first argument (division)
		return this / n;
	},

	time: function(v){ // given a date (or nothing for the current time) as the first argument, returns the time portion of the date in local format
		return new Date(v||+new Date()).toLocaleTimeString()
	},
	
	timer: 	typeof performance !== "undefined" ? performance.now.bind(performance) : Date.now , // returns a time in ms 

	times: function(n,_,__) { // multiplies the first argument by a numerical this value 
		return n * this;
	},

	toArray: Function.call.bind([].slice), // turns an array-like value into a true Array

	to$: function(f) { // converts a function written for [].filter for use with $.filter, or [].forEach to $.each, or vice versa
		return function(a, b, c) {
			return f.call(this, b, a, c);
		}
	},

	toFixed: function(n,_,__) { // limits the decimal places of a numerical first argument by this # of spaces, defaults to 2 if this is non-numeric
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
		return v !== this;
	},

	unequiv: function(v,_,__) { // returns true if the argument does not loosely equate to this
		return v != this;
	},

	unique: function(v, i, r) { // used by [].filter(), returns true of the current item is the only one of it's exact value in the array
		return r.lastIndexOf(v) == i;
	},

	uniqueId: function uniqueId(s){ // returns a unique string, with an optional prefix passed to the first argument
		uniqueId.id=uniqueId.id||0;
		return (prefix||"")+uniqueId.id++;
	},
	
	union: function(r,_,__) { // Computes the list of values that are the intersection of all the arrays. Each value in the result is present in each of the arrays.
		return r.concat(this).filter(function(a, b, c) {
			return c.indexOf(a) === b;
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
			return this[k];
		}, o);
	},

	where: function(o,_,__) { // returns true for objects containing specific key:value pair defined by an object given as this
		return Object.keys(this).every(function(k,_,__) {
			return o[k] === this[k];
		}, this);
	},

	without: function(v,_,__) { // returns true if this does not contain the first argument
		return this.indexOf(v) === -1;
	},

	words: function(s,_,__) { // returns an array of all the words in a string version of the first argument
		return String.prototype.match.call(s, /\b\w+\b/g) || [];
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