mofun
=====

Make JS mo' fun by writing less of it via functional programming

About
--------------
mofun.js is special because it's just a vanilla-flavored collection of stand-alone functions. Most of the functions use this to avoid hard-coding a one-off anonymous function for a simple sub-task. Think of this in JS as a function argument that gets called in a different way than the formal parameters (since that's exactly what this is). By using this to send one more customization to the function logic, generic functions become viable in a whole lot of places that used to require a customized anonymous function. In short, the literal "function" will appear a lot less in code using mofun.

mofun.js is not a functional framework like Prototype.js, Oliver Steele's functional, Underscore.js, or jQuery. To use most of the functions in mofun.js, you'll need to pass them to existing higher-order functions like vanilla's [].map() and [].filter(), or to an existing framework method like _.map(), or even $.map(). Most of the included functions are pure functions, which execute quickly, have no side-effects or dependencies, and are inherently testable. None of mofun's methods have any internal dependencies. Cut and paste them ad-hoc from the listing below if you don't want/need them all. Since it's all based on pure vanilla, you can rip the library apart and like the T-1000, each little piece survives and works independently.

mofun.js compliments shortcomings in other-wise great libraries like Prototype.js and Underscore by providing common and highly-recyclable low-level helpers that eliminate many of the specialized anonymous functions typical of functional javascript programming. Those libraries provide a framework to build, mofun.js provides pre-fabricated modules to attach to that framework. These days, you don't really need underscore or prototype to underpin the handy functional style; it's built into any browser since IE9, and IE8 can be easily polyfilled to support mofun. If vanilla is too plain, mofun.js plays well with virtually any framework. Run fast, pack light, don't pollute, and never ever repeat yourself: mofun.js.



Examples
---------------
**Render many objects with one template**  
`[{a:1, b:2}, {a:11, b:22}, {a:111, b:222}] .map(F.template, "val: {{a}}")`

**Flip arguments to render many templates with one object**  
`['val: {{a}}', '{{a}}/{{b}}', 'b is {{b}}' ] .map( F.flip(F.template), {a:1, b:2} )`

**Merge an array of arrays into a flat array**  
`[[1,2],[3,4],[5,6]].reduce(F.concat)`

**Count letters in a string**  
`"Hello World Wide Web!".match(/\w/g).reduce(F.count)`

**Group an array of strings by length**  
`F.groupBy( F.$w("now is the time for all good men"), "length")`

**Get the HEX value of numbers in an array**  
`[10,20,30,40,50].map(F.method, ["toString", 16])`

**Get the ASCII Codes of a string**  
`[].map.call("ABCDEFG", F.char)`

**Chart a few numbers using 'ASCII art'**  
`[1,2,7,4,9].map( F.partial( F.repeat, "▉") )`

**Square the result of adding 2 numbers**  
`var addThenSquare = F.compose.call(F.square, F.sum); addThenSquare(2, 3); // math version: (2+3)^2`

**Filtering via sub-property**  
`F.$("section") .map(F.pluck, "textContent")	// grab text of all sections .filter( F.subFilter( F.gt, "length"), 3000 ) // filter out those under 3000 chars .map(F.left, 40)	// summarize`

**Make a list of the first ten numbers**  
`F.range(10)`

**Make a range of 10 random numbers 0-1**  
`F.range(10).map(F.random)`

**Make a range of 10 random pretty numbers**  
`F.range(10) .map(F.random) .map(F.thisOverA, 10000) .map(F.formatNumber, 2)`

**Sort Numbers**  
`[4523, 99, -23, 12, 0, 5 ].sort(F.sortNumber)`

**Sort Numerical Integers**  
`["5px", "2px", "21px", "0px"].sort(F.sortInt)`

**Benchmark array iteration**  
`F.populate( Array(6), 0) .map(F.unmethod( performance, "now")) .map(F.delta) .map(F.add, "ms")`

**Make a range from 100-109**  
`F.range(10).map(F.addNumber, 100)`

**Get the even numbers from 1-10**  
`[1,2,3,4,5,6,7,8,9,10].filter(F.even)`

**Get the numbers from 1-10 that are less than 5**  
`[1,2,3,4,5,6,7,8,9,10].filter(F.lt, 5)`

**Get a randomized uniform list of numbers from 1-10**  
`[1,2,3,4,5,6,7,8,9,10].map(F.shuffle)`

**Remove gaps in an array**  
`var arr=new Array(5); arr[1]=1; arr[3]=2; arr[4]=3; arr.filter(F.compact)`

**Show the tag name of the first four tags in this document**  
`F.$("*").map(F.pluck, "tagName").slice(0,4)`

**Find the sum of numbers in an array**  
`[1,2,3,4,5].reduce(F.sum)`

**Generate 10 random integers from 0 to 100**  
`F.range(10).map(F.random).map(F.times, 100).map(F.floor)`

**Find instances of letter in a string**  
`F.chars("Hello World").filter(F.contains, "l")`

**Remove some letters (vowels) from a string**  
`[].filter.call("Hello World", F.without, "aeiou").join("")`

**Remove a letter from a string**  
`[].filter.call("Hello World", F.unequiv, "l").join("")`

**Exclude some letters (case-insensitive vowels) in a string using regexp**  
`[].filter.call("Hello World", F.negate(F.regexp) , /[aeiou]/i)`

**Exclude odd positions in a string using regexp**  
`F.delMatch.call( /[13579]$/, F.chars("Hello World") ).join("")`

**Select odd positions in a string using regexp**  
`F.selMatch.call( /[13579]$/, F.chars("Hello World") ).join("")`

**Find odd integers from 1-20 using regexp**  
`F.range(20).filter(F.regexp, /[13579]$/)`

**Make un-ordered list html from an array**  
`F.tag.call("ul", [1,2,3].map(F.tag, "li").join("\n"))`

**Trim each element of an array using native trim method**  
`F.$c(" a, b , c").map(F.invoke, "trim")`

**Trim each element of an array using F.trim**  
`" a, b , c".split(",").map(F.trim)`

**Get an array of properties from a single object**  
`["tagName", "childElementCount", "className" ] .map( F.extractThis, document.body )`

**Get an array of objects of properties from the links in the nav**  
`F.$(".nav .item a") .map(F.extractObject, ["tagName", "textContent", "href" ])`

**Get an array of arrays of properties from the links in the nav**  
`F.$(".nav .item a") .map(F.extractList, ["tagName", "textContent", "href" ])`

**Grab several attributes from the nav**  
`F.first( F.$("#nav") .map(F.methods, ["getAttribute", ["id","class","target"]]))`

**Grab several base versions of a single Number**  
`F.methods.call(["toString", [2,10,16]], 123 )`

**Grab objects of properties of tags in the document head**  
`F.$("head>*:not(style)").map(F.pick, ["tagName", "textContent", "href" ])`

**Count of enumerable own properties on window**  
`F.keys(window).length`

**Count of enumerable own and inherited properties on window**  
`F.obKeysx(window).length`

**Count of own properties on window**  
`F.properties(window).length`

**Count of all properties on window**  
`F.allProps(window).length`

**All used html elements without any child elements**  
`F.$("*") .filter( F.reject( F.pluck ), "childElementCount" ) .map(F.extract, "tagName") .filter(F.unique) .sort(F.sortNoCase);`

**Getting un-escaped text from a JavaScript function**  
`F.getComments(function(){ // note raw quotes and line breaks are cool in comments: /* body .modal-header { font-family:"helvetica new", verdana, tahoma, arial; background: #333; color:#ddd; }	*/ })`

**find things equivalent to one**  
`[1, 0, "1", -1, /1/, [1], true].filter(F.equiv, 1)`

**length of text in this page's sections**  
`F.$("section").map(F.resolve, ["textContent", "length", "toLocaleString"])`

**Specializing and map()-izing functions **  
`function isDivisibleBy(a, b) { return a % b === 0; }; var isEven = F.guard( // guard blocks extra call-time arguments F.rPartial(isDivisibleBy, 2)	// rPartial locks in 2 as the denominator (b) , 1 ); // guard all but the first [].map argument (a) [1,2,3,4,5].map(isEven) // see it in action`

**length of text in this page's sections**  
`F.$("section").map(F.resolve, ["textContent", "length", "toLocaleString"])`

**Clone an Object**  
`var a={a:1, b:2},	// an object b=F.clone(a);	// a dupe of the object b.c=3;	// modify the dupe [a, b] // view them both`

**decrement an entire array of numbers**  
`[1,2,3].map(F.dec)`

**Create a TOC page to download each mofun method using F.template**  
`F.obMap(F)	// grab [key,value] pairs from F's properties .filter( F.negate( F.bind(/./.test, /native code/)) )	// filter out native methods .map(F.modifyProperty, [1,F.dataURL.bind("text/plain")])	// turn value into a dataURL .map(F.template, "<a target=_blank download='{{0}}.js' href='{{1}}'>{{0}}") .join("\n")`
