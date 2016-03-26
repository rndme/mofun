mofun
=====

Make JS mo' fun by writing less of it via functional programming


note: not actively maintained...

About
--------------
mofun.js is special because it's a vanilla-flavored collection of stand-alone functions. Most of the functions use this to avoid hard-coding a one-off anonymous function for a simple sub-task. Think of this in JS as a function argument that gets called in a different way than the formal parameters (since that's exactly what this is). By using this to send one more customization to the function logic, generic functions become viable in a whole lot of places that used to require a customized anonymous function. In short, the literal "function" will appear a lot less in code using mofun.

mofun.js is not a functional framework like Prototype.js, Oliver Steele's functional, Underscore.js, or jQuery. To use most of the functions in mofun.js, you'll need to pass them to existing higher-order functions like vanilla's [].map() and [].filter(), or to an existing framework method like _.map(), or even $.map(). Most of the included functions are pure functions, which execute quickly, have no side-effects or dependencies, and are inherently testable. None of mofun's methods have any internal dependencies. Cut and paste them ad-hoc from the listing below if you don't want/need them all. Since it's all based on pure vanilla, you can rip the library apart and like the T-1000, each little piece survives and works independently.

mofun.js compliments shortcomings in other-wise great libraries like Prototype.js and Underscore by providing common and highly-recyclable low-level helpers that eliminate many of the specialized anonymous functions typical of functional javascript programming. Those libraries provide a framework to build, mofun.js provides pre-fabricated modules to attach to that framework. These days, you don't really need underscore or prototype to underpin the handy functional style; it's built into any browser since IE9, and IE8 can be easily polyfilled to support mofun. If vanilla is too plain, mofun.js plays well with virtually any framework. Run fast, pack light, don't pollute, and never ever repeat yourself: mofun.js.


Usage
-------------
browsers:  `<script src=mofun.min.js></script>`  (as _window.F or AMD name)

node.js:   `npm install mofun`











Project Page
--------------
Visit the [project page](http://danml.com/mofun/) for examples, annoted source, and more 
