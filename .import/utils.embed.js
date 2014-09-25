// source /src/polyfill/arr.js
if (Array.prototype.forEach === void 0) {
	Array.prototype.forEach = function(fn, ctx){
		var imax = this.length,
			i, x;
		for(i = 0; i < imax; i++ ){
			x = this[i];
			if (ctx === void 0) {
				fn(x, i);
				continue;
			}
			fn.call(ctx, x, i);
		}
	};
}
if (Array.prototype.indexOf === void 0) {
	Array.prototype.indexOf = function(x){
		var imax = this.length,
			i;
		for(i = 0; i < imax; i++ ){
			if (x === this[i]) 
				return i;
		}
		return -1;
	};
}

// end:source /src/polyfill/arr.js

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
			&& typeof arr.splice === 'function'
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