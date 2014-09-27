// source /src/coll.js
var coll_each,
	coll_remove,
	coll_map,
	coll_indexOf,
	coll_find;
(function(){
	coll_each = function(coll, fn, ctx){
		if (ctx == null) 
			ctx = coll;
		if (coll == null) 
			return coll;
		
		var imax = coll.length,
			i = 0;
		for(; i< imax; i++){
			fn.call(ctx, coll[i], i);
		}
		return ctx;
	};
	coll_indexOf = function(coll, x){
		if (coll == null) 
			return -1;
		var imax = coll.length,
			i = 0;
		for(; i < imax; i++){
			if (coll[i] === x) 
				return i;
		}
		return -1;
	};
	coll_remove = function(coll, x){
		var i = coll_indexOf(coll, x);
		if (i === -1) 
			return false;
		coll.splice(i, 1);
		return true;
	};
	coll_map = function(coll, fn, ctx){
		var arr = new Array(coll.length);
		coll_each(coll, function(x, i){
			arr[i] = fn.call(this, x, i);
		}, ctx);
		return arr;
	};
	coll_find = function(coll, fn, ctx){
		var imax = coll.length,
			i = 0;
		for(; i < imax; i++){
			if (fn.call(ctx || coll, coll[i], i))
				return true;
		}
		return false;
	};
}());
// end:source /src/coll.js

// source /src/polyfill/arr.js
if (Array.prototype.forEach === void 0) {
	Array.prototype.forEach = function(fn, ctx){
		coll_each(this, fn, ctx);
	};
}
if (Array.prototype.indexOf === void 0) {
	Array.prototype.indexOf = function(x){
		return coll_indexOf(this, x);
	};
}

// end:source /src/polyfill/arr.js
// source /src/polyfill/str.js
if (String.prototype.trim == null){
	String.prototype.trim = function(){
		var start = -1,
			end = this.length,
			code;
		if (end === 0) 
			return this;
		while(++start < end){
			code = this.charCodeAt(start);
			if (code > 32)
				break;
		}
		while(--end !== 0){
			code = this.charCodeAt(end);
			if (code > 32)
				break;
		}
		return start !== 0 && end !== length - 1
			? this.substring(start, end + 1)
			: this;
	};
}
// end:source /src/polyfill/str.js
// source /src/polyfill/fn.js

if (Function.prototype.bind == null) {
	var _Array_slice;
	Function.prototype.bind = function(){
		if (arguments.length < 2 && typeof arguments[0] === "undefined") 
			return this;
		var fn = this,
			args = _Array_slice.call(arguments),
			ctx = args.shift();
		return function() {
			return fn.apply(ctx, args.concat(_Array_slice.call(arguments)));
		};
	};
}
// end:source /src/polyfill/fn.js

// source /src/is.js
var is_Function,
	is_Array,
	is_ArrayLike,
	is_String,
	is_Object,
	is_notEmptyString,
	is_rawObject;

(function() {
	is_Function = function(x) {
		return typeof x === 'function';
	};
	is_Object = function(x) {
		return x != null && typeof x === 'object';
	};
	is_Array = is_ArrayLike = function(arr) {
		return arr != null
			&& typeof arr === 'object'
			&& typeof arr.length === 'number'
			&& typeof arr.slice === 'function'
			;
	};
	is_String = function(x) {
		return typeof x === 'string';
	};
	is_notEmptyString = function(x) {
		return typeof x === 'string' && x !== '';
	};
	is_rawObject = function(obj) {
		if (obj == null || typeof obj !== 'object')
			return false;

		return obj.constructor === Object;
	};
}());
// end:source /src/is.js
// source /src/obj.js
var obj_getProperty,
	obj_setProperty,
	obj_extend,
	obj_create;
(function(){
	obj_getProperty = function(obj, path){
		if ('.' === path) // obsolete
			return obj;
		
		var chain = path.split('.'),
			imax = chain.length,
			i = -1;
		while ( obj != null && ++i < imax ) {
			obj = obj[chain[i]];
		}
		return obj;
	};
	obj_setProperty = function(obj, path, val) {
		var chain = path.split('.'),
			imax = chain.length - 1,
			i = -1,
			key;
		while ( ++i < imax ) {
			key = chain[i];
			if (obj[key] == null) 
				obj[key] = {};
			
			obj = obj[key];
		}
		obj[chain[i]] = val;
	};
	obj_extend = function(a, b){
		if (b == null)
			return a || {};
		
		if (a == null)
			return obj_create(b);
		
		for(var key in b){
			a[key] = b[key];
		}
		return a;
	};
	obj_create = Object.create || function(x) {
		var Ctor = function(){};
		Ctor.prototype = x;
		return new Ctor;
	};
}());
// end:source /src/obj.js
// source /src/arr.js
var arr_remove,
	arr_each,
	arr_indexOf,
	arr_contains;
(function(){
	arr_remove = function(array, x){
		var i = array.indexOf(x);
		if (i === -1) 
			return false;
		array.splice(i, 1);
		return true;
	};
	arr_each = function(arr, fn, ctx){
		arr.forEach(fn, ctx);
	};
	arr_indexOf = function(arr, x){
		return arr.indexOf(x);
	};
	arr_contains = function(arr, x){
		return arr.indexOf(x) !== -1;
	};
}());
// end:source /src/arr.js
// source /src/fn.js
var fn_proxy,
	fn_apply,
	fn_doNothing;
(function(){
	fn_proxy = function(fn, ctx) {
		return function(){
			return fn_apply(fn, ctx, arguments);
		};
	};
	
	fn_apply = function(fn, ctx, args){
		var l = args.length;
		if (0 === l) 
			return fn.call(ctx);
		if (1 === l) 
			return fn.call(ctx, args[0]);
		if (2 === l) 
			return fn.call(ctx, args[0], args[1]);
		if (3 === l) 
			return fn.call(ctx, args[0], args[1], args[2]);
		if (4 === l)
			return fn.call(ctx, args[0], args[1], args[2], args[3]);
		
		return fn.apply(ctx, args);
	};
	
	fn_doNothing = function(){
		return false;
	};
}());
// end:source /src/fn.js

// source /src/refs.js
var _Array_slice = Array.prototype.slice,
	_Array_splice = Array.prototype.splice,
	_Array_indexOf = Array.prototype.indexOf,
	
	_Object_create = obj_create,
	_Object_hasOwnProp = Object.hasOwnProperty;
// end:source /src/refs.js