// source /src/refs.js
var _Array_slice = Array.prototype.slice,
	_Array_splice = Array.prototype.splice,
	_Array_indexOf = Array.prototype.indexOf,

	_Object_create = null, // in obj.js
	_Object_hasOwnProp = Object.hasOwnProperty,
	_Object_getOwnProp = Object.getOwnPropertyDescriptor,
	_Object_defineProperty = Object.defineProperty;

// end:source /src/refs.js

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
	is_rawObject,
	is_Date,
	is_NODE,
	is_DOM;

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
	is_Date = function(x) {
		if (x == null || typeof x !== 'object') {
			return false;
		}
		if (x.getFullYear != null && isNaN(x) === false) {
			return true;
		}
		return false;
	};
	is_DOM = typeof window !== 'undefined' && window.navigator != null;
	is_NODE = !is_DOM;

}());

// end:source /src/is.js
// source /src/obj.js
var obj_getProperty,
	obj_setProperty,
	obj_hasProperty,
	obj_extend,
	obj_extendDefaults,
	obj_extendMany,
	obj_extendProperties,
	obj_extendPropertiesDefaults,
	obj_create,
	obj_toFastProps,
	obj_defineProperty;
(function(){
	obj_getProperty = function(obj_, path){
		if ('.' === path) // obsolete
			return obj_;

		var obj = obj_,
			chain = path.split('.'),
			imax = chain.length,
			i = -1;
		while ( obj != null && ++i < imax ) {
			var key = chain[i];
			if (key.charCodeAt(key.length - 1) === 63 /*?*/) {
				key = key.slice(0, -1);
			}
			obj = obj[key];
		}
		return obj;
	};
	obj_setProperty = function(obj_, path, val) {
		var obj = obj_,
			chain = path.split('.'),
			imax = chain.length - 1,
			i = -1,
			key;
		while ( ++i < imax ) {
			key = chain[i];
			if (key.charCodeAt(key.length - 1) === 63 /*?*/) {
				key = key.slice(0, -1);
			}
			var x = obj[key];
			if (x == null) {
				x = obj[key] = {};
			}
			obj = x;
		}
		obj[chain[i]] = val;
	};
	obj_hasProperty = function(obj, path) {
		var x = obj_getProperty(obj, path);
		return x !== void 0;
	};
	obj_defineProperty = function(obj, path, dscr) {
		var x = obj,
			chain = path.split('.'),
			imax = chain.length - 1,
			i = -1, key;
		while (++i < imax) {
			key = chain[i];
			if (x[key] == null)
				x[key] = {};
			x = x[key];
		}
		key = chain[imax];
		if (_Object_defineProperty) {
			if (dscr.writable	 === void 0) dscr.writable	 = true;
			if (dscr.configurable === void 0) dscr.configurable = true;
			if (dscr.enumerable   === void 0) dscr.enumerable   = true;
			_Object_defineProperty(x, key, dscr);
			return;
		}
		x[key] = dscr.value === void 0
			? dscr.value
			: (dscr.get && dscr.get());
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
	obj_extendDefaults = function(a, b){
		if (b == null)
			return a || {};
		if (a == null)
			return obj_create(b);

		for(var key in b) {
			if (a[key] == null) {
				a[key] = b[key];
				continue;
			}
			if (key === 'toString' && a[key] === Object.prototype.toString) {
				a[key] = b[key];
			}
		}
		return a;
	}
	var extendPropertiesFactory = function(overwriteProps){
		if (_Object_getOwnProp == null)
			return overwriteProps ? obj_extend : obj_extendDefaults;

		return function(a, b){
			if (b == null)
				return a || {};

			if (a == null)
				return obj_create(b);

			var key, descr, ownDescr;
			for(key in b){
				descr = _Object_getOwnProp(b, key);
				if (descr == null)
					continue;
				if (overwriteProps !== true) {
					ownDescr = _Object_getOwnProp(a, key);
					if (ownDescr != null) {
						continue;
					}
				}
				if (descr.hasOwnProperty('value')) {
					a[key] = descr.value;
					continue;
				}
				_Object_defineProperty(a, key, descr);
			}
			return a;
		};
	};

	obj_extendProperties		 = extendPropertiesFactory(true);
	obj_extendPropertiesDefaults = extendPropertiesFactory(false );

	obj_extendMany = function(a){
		var imax = arguments.length,
			i = 1;
		for(; i<imax; i++) {
			a = obj_extend(a, arguments[i]);
		}
		return a;
	};
	obj_toFastProps = function(obj){
		/*jshint -W027*/
		function F() {}
		F.prototype = obj;
		new F();
		return;
		eval(obj);
	};
	_Object_create = obj_create = Object.create || function(x) {
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
	arr_contains,
	arr_pushMany;
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
	arr_pushMany = function(arr, arrSource){
		if (arrSource == null || arr == null || arr === arrSource)
			return;

		var il = arr.length,
			jl = arrSource.length,
			j = -1
			;
		while( ++j < jl ){
			arr[il + j] = arrSource[j];
		}
	};
}());

// end:source /src/arr.js
// source /src/fn.js
var fn_proxy,
	fn_apply,
	fn_doNothing,
	fn_createByPattern;
(function(){
	fn_proxy = function(fn, ctx) {
		return function(){
			var imax = arguments.length,
				args = new Array(imax),
				i = 0;
			for(; i<imax; i++) args[i] = arguments[i];
			return fn_apply(fn, ctx, args);
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

	fn_createByPattern = function(definitions, ctx){
		var imax = definitions.length;
		return function(){
			var l = arguments.length,
				i = -1,
				def;

			outer: while(++i < imax){
				def = definitions[i];
				if (def.pattern.length !== l) {
					continue;
				}
				var j = -1;
				while(++j < l){
					var fn  = def.pattern[j];
					var val = arguments[j];
					if (fn(val) === false) {
						continue outer;
					}
				}
				return def.handler.apply(ctx, arguments);
			}

			console.error('InvalidArgumentException for a function', definitions, arguments);
			return null;
		};
	};

}());

// end:source /src/fn.js
// source /src/str.js
var str_format,
	str_dedent;
(function(){
	str_format = function(str_){
		var str = str_,
			imax = arguments.length,
			i = 0, x;
		while ( ++i < imax ){
			x = arguments[i];
			if (is_Object(x) && x.toJSON) {
				x = x.toJSON();
			}
			str_ = str_.replace(rgxNum(i - 1), String(x));
		}

		return str_;
	};
	str_dedent = function(str) {
		var rgx = /^[\t ]*\S/gm,
			match = rgx.exec(str),
			count = -1;
		while(match != null) {			
			var x = match[0].length;
			if (count === -1 || x < count) count = x;
			match = rgx.exec(str);
		}		
		if (--count < 1)
			return str;

		var replacer = new RegExp('^[\\t ]{1,' + count + '}', 'gm');		
		return str
			.replace(replacer, '')
			.replace(/^[\t ]*\r?\n/,'')
			.replace(/\r?\n[\t ]*$/,'')
			;
	};
	var rgxNum;
	(function(){
		rgxNum = function(num){
			return cache_[num] || (cache_[num] = new RegExp('\\{' + num + '\\}', 'g'));
		};
		var cache_ = {};
	}());
}());

// end:source /src/str.js
// source /src/class.js
/**
 * create([...Base], Proto)
 * Base: Function | Object
 * Proto: Object {
 *    constructor: ?Function
 *    ...
 */
var class_create,

	// with property accessor functions support
	class_createEx;
(function(){

	class_create   = createClassFactory(obj_extendDefaults);
	class_createEx = createClassFactory(obj_extendPropertiesDefaults);

	function createClassFactory(extendDefaultsFn) {
		return function(){
			var args = _Array_slice.call(arguments),
				Proto = args.pop();
			if (Proto == null)
				Proto = {};

			var Ctor;

			if (Proto.hasOwnProperty('constructor')) {
				Ctor = Proto.constructor;
				if (Ctor.prototype === void 0) {
					var es6Method = Ctor;
					Ctor = function ClassCtor () {
						var imax = arguments.length, i = -1, args = new Array(imax);
						while (++i < imax) args[i] = arguments[i];
						return es6Method.apply(this, args);
					};
				}
			}
			else {
				Ctor = function ClassCtor () {};
			}

			var i = args.length,
				BaseCtor, x;
			while ( --i > -1 ) {
				x = args[i];
				if (typeof x === 'function') {
					BaseCtor = wrapFn(x, BaseCtor);
					x = x.prototype;
				}
				extendDefaultsFn(Proto, x);
			}
			return createClass(wrapFn(BaseCtor, Ctor), Proto);
		};
	}

	function createClass(Ctor, Proto) {
		Proto.constructor = Ctor;
		Ctor.prototype = Proto;
		return Ctor;
	}
	function wrapFn(fnA, fnB) {
		if (fnA == null) {
			return fnB;
		}
		if (fnB == null) {
			return fnA;
		}
		return function(){
			var args = _Array_slice.call(arguments);
			var x = fnA.apply(this, args);
			if (x !== void 0)
				return x;

			return fnB.apply(this, args);
		};
	}
}());

// end:source /src/class.js
// source /src/error.js
var error_createClass,
	error_formatSource,
	error_formatCursor,
	error_cursor;

(function(){
	error_createClass = function(name, Proto, stackSliceFrom){
		var Ctor = _createCtor(Proto, stackSliceFrom);
		Ctor.prototype = new Error;

		Proto.constructor = Error;
		Proto.name = name;
		obj_extend(Ctor.prototype, Proto);
		return Ctor;
	};

	error_formatSource = function(source, index, filename) {
		var cursor  = error_cursor(source, index),
			lines   = cursor[0],
			lineNum = cursor[1],
			rowNum  = cursor[2],
			str = '';
		if (filename != null) {
			str += str_format(' at {0}:{1}:{2}\n', filename, lineNum, rowNum);
		}
		return str + error_formatCursor(lines, lineNum, rowNum);
	};

	/**
	 * @returns [ lines, lineNum, rowNum ]
	 */
	error_cursor = function(str, index){
		var lines = str.substring(0, index).split('\n'),
			line = lines.length,
			row = index + 1 - lines.slice(0, line - 1).join('\n').length;
		if (line > 1) {
			// remote trailing newline
			row -= 1;
		}
		return [str.split('\n'), line, row];
	};

	(function(){
		error_formatCursor = function(lines, lineNum, rowNum) {

			var BEFORE = 3,
				AFTER  = 2,
				i = lineNum - BEFORE,
				imax   = i + BEFORE + AFTER,
				str  = '';

			if (i < 0) i = 0;
			if (imax > lines.length) imax = lines.length;

			var lineNumberLength = String(imax).length,
				lineNumber;

			for(; i < imax; i++) {
				if (str)  str += '\n';

				lineNumber = ensureLength(i + 1, lineNumberLength);
				str += lineNumber + '|' + lines[i];

				if (i + 1 === lineNum) {
					str += '\n' + repeat(' ', lineNumberLength + 1);
					str += lines[i].substring(0, rowNum - 1).replace(/[^\s]/g, ' ');
					str += '^';
				}
			}
			return str;
		};

		function ensureLength(num, count) {
			var str = String(num);
			while(str.length < count) {
				str += ' ';
			}
			return str;
		}
		function repeat(char_, count) {
			var str = '';
			while(--count > -1) {
				str += char_;
			}
			return str;
		}
	}());

	function _createCtor(Proto, stackFrom){
		var Ctor = Proto.hasOwnProperty('constructor')
			? Proto.constructor
			: null;

		return function(){
			obj_defineProperty(this, 'stack', {
				value: _prepairStack(stackFrom || 3)
			});
			obj_defineProperty(this, 'message', {
				value: str_format.apply(this, arguments)
			});
			if (Ctor != null) {
				Ctor.apply(this, arguments);
			}
		};
	}

	function _prepairStack(sliceFrom) {
		var stack = new Error().stack;
		return stack == null ? null : stack
			.split('\n')
			.slice(sliceFrom)
			.join('\n');
	}

}());

// end:source /src/error.js

// source /src/class/Dfr.js
var class_Dfr;
(function(){
	class_Dfr = function(mix){
		if (typeof mix === 'function') {
			return class_Dfr.run(mix);
		}
	};
	class_Dfr.prototype = {
		_isAsync: true,
		_done: null,
		_fail: null,
		_always: null,
		_resolved: null,
		_rejected: null,

		defer: function(){
			this._rejected = null;
			this._resolved = null;
			return this;
		},
		isResolved: function(){
			return this._resolved != null;
		},
		isRejected: function(){
			return this._rejected != null;
		},
		isBusy: function(){
			return this._resolved == null && this._rejected == null;
		},
		resolve: function() {
			var done = this._done,
				always = this._always
				;

			this._resolved = arguments;

			dfr_clearListeners(this);
			arr_callOnce(done, this, arguments);
			arr_callOnce(always, this, [ this ]);

			return this;
		},
		reject: function() {
			var fail = this._fail,
				always = this._always
				;

			this._rejected = arguments;

			dfr_clearListeners(this);
			arr_callOnce(fail, this, arguments);
			arr_callOnce(always, this, [ this ]);
			return this;
		},
		then: function(filterSuccess, filterError){
			return this.pipe(filterSuccess, filterError);
		},
		done: function(callback) {
			if (this._rejected != null)
				return this;
			return dfr_bind(
				this,
				this._resolved,
				this._done || (this._done = []),
				callback
			);
		},
		fail: function(callback) {
			if (this._resolved != null)
				return this;
			return dfr_bind(
				this,
				this._rejected,
				this._fail || (this._fail = []),
				callback
			);
		},
		always: function(callback) {
			return dfr_bind(
				this,
				this._rejected || this._resolved,
				this._always || (this._always = []),
				callback
			);
		},
		pipe: function(mix /* ..methods */){
			var dfr;
			if (typeof mix === 'function') {
				dfr = new class_Dfr;
				var done_ = mix,
					fail_ = arguments.length > 1
						? arguments[1]
						: null;

				this
					.done(delegate(dfr, 'resolve', done_))
					.fail(delegate(dfr, 'reject',  fail_))
					;
				return dfr;
			}

			dfr = mix;
			var imax = arguments.length,
				done = imax === 1,
				fail = imax === 1,
				i = 0, x;
			while( ++i < imax ){
				x = arguments[i];
				switch(x){
					case 'done':
						done = true;
						break;
					case 'fail':
						fail = true;
						break;
					default:
						console.error('Unsupported pipe channel', arguments[i])
						break;
				}
			}
			done && this.done(delegate(dfr, 'resolve'));
			fail && this.fail(delegate(dfr, 'reject' ));

			function pipe(dfr, method) {
				return function(){
					dfr[method].apply(dfr, arguments);
				};
			}
			function delegate(dfr, name, fn) {
				return function(){
					if (fn != null) {
						var override = fn.apply(this, arguments);
						if (override != null && override !== dfr) {
							if (isDeferred(override)) {
								override.then(delegate(dfr, 'resolve'), delegate(dfr, 'reject'));
								return;
							}

							dfr[name](override)
							return;
						}
					}
					dfr[name].apply(dfr, arguments);
				};
			}

			return this;
		},
		pipeCallback: function(){
			var self = this;
			return function(error){
				if (error != null) {
					self.reject(error);
					return;
				}
				var args = _Array_slice.call(arguments, 1);
				fn_apply(self.resolve, self, args);
			};
		},
		resolveDelegate: function(){
			return fn_proxy(this.resolve, this);
		},
		
		rejectDelegate: function(){
			return fn_proxy(this.reject, this);
		},
		
	};

	class_Dfr.run = function(fn, ctx){
		var dfr = new class_Dfr();
		if (ctx == null)
			ctx = dfr;

		fn.call(
			ctx
			, fn_proxy(dfr.resolve, ctx)
			, fn_proxy(dfr.reject, dfr)
			, dfr
		);
		return dfr;
	};
	class_Dfr.all = function(promises){
		var dfr = new class_Dfr,
			arr = new Array(promises.length),
			wait = promises.length,
			error = null;
		if (wait === 0) {
			return dfr.resolve(arr);
		}
		function tick (index) {
			if (error != null) {
				return;
			}
			var args = _Array_slice.call(arguments, 1);
			arr.splice.apply(arr, [index, 0].concat(args));
			if (--wait === 0) {
				dfr.resolve(arr);
			}
		}
		function onReject (err) {
			dfr.reject(error = err);
		}
		var imax = promises.length,
			i = -1;
		while(++i < imax){
			var x = promises[i];
			if (x == null || x.then == null) {
				tick(i, x);
				continue;
			}
			x.then(tick.bind(null, i), onReject);
		}		
		return dfr; 
	};

	// PRIVATE

	function dfr_bind(dfr, arguments_, listeners, callback){
		if (callback == null)
			return dfr;

		if ( arguments_ != null)
			fn_apply(callback, dfr, arguments_);
		else
			listeners.push(callback);

		return dfr;
	}

	function dfr_clearListeners(dfr) {
		dfr._done = null;
		dfr._fail = null;
		dfr._always = null;
	}

	function arr_callOnce(arr, ctx, args) {
		if (arr == null)
			return;

		var imax = arr.length,
			i = -1,
			fn;
		while ( ++i < imax ) {
			fn = arr[i];

			if (fn)
				fn_apply(fn, ctx, args);
		}
		arr.length = 0;
	}
	function isDeferred(x){
		return x != null 
			&& typeof x === 'object' 
			&& is_Function(x.then)
		;
	}
}());

// end:source /src/class/Dfr.js
// source /src/class/EventEmitter.js
var class_EventEmitter;
(function(){

	class_EventEmitter = function() {
		this._listeners = {};
	};
	class_EventEmitter.prototype = {
		on: function(event, fn) {
			if (fn != null){
				(this._listeners[event] || (this._listeners[event] = [])).push(fn);
			}
			return this;
		},
		once: function(event, fn){
			if (fn != null) {
				fn._once = true;
				(this._listeners[event] || (this._listeners[event] = [])).push(fn);
			}
			return this;
		},

		pipe: function(event){
			var that = this,
				args;
			return function(){
				args = _Array_slice.call(arguments);
				args.unshift(event);
				fn_apply(that.trigger, that, args);
			};
		},

		emit: event_trigger,
		trigger: event_trigger,

		off: function(event, fn) {
			var listeners = this._listeners[event];
			if (listeners == null)
				return this;

			if (arguments.length === 1) {
				listeners.length = 0;
				return this;
			}

			var imax = listeners.length,
				i = -1;
			while (++i < imax) {

				if (listeners[i] === fn) {
					listeners.splice(i, 1);
					i--;
					imax--;
				}

			}
			return this;
		}
	};

	function event_trigger() {
		var args = _Array_slice.call(arguments),
			event = args.shift(),
			fns = this._listeners[event],
			fn, imax, i = 0;

		if (fns == null)
			return this;

		for (imax = fns.length; i < imax; i++) {
			fn = fns[i];
			fn_apply(fn, this, args);

			if (fn._once === true){
				fns.splice(i, 1);
				i--;
				imax--;
			}
		}
		return this;
	}
}());

// end:source /src/class/EventEmitter.js
// source /src/class/Uri.es6
"use strict";

var class_Uri;
(function () {

	class_Uri = class_create({
		protocol: null,
		value: null,
		path: null,
		file: null,
		extension: null,

		constructor: function constructor(uri) {
			if (uri == null) {
				return this;
			}if (util_isUri(uri)) {
				return uri.combine("");
			}uri = normalize_uri(uri);

			this.value = uri;

			parse_protocol(this);
			parse_host(this);

			parse_search(this);
			parse_file(this);

			// normilize path - "/some/path"
			this.path = normalize_pathsSlashes(this.value);

			if (/^[\w]+:\//.test(this.path)) {
				this.path = "/" + this.path;
			}
			return this;
		},
		cdUp: function cdUp() {
			var path = this.path;
			if (path == null || path === "" || path === "/") {
				return this;
			}

			// win32 - is base drive
			if (/^\/?[a-zA-Z]+:\/?$/.test(path)) {
				return this;
			}

			this.path = path.replace(/\/?[^\/]+\/?$/i, "");
			return this;
		},
		/**
   * '/path' - relative to host
   * '../path', 'path','./path' - relative to current path
   */
		combine: function combine(path) {

			if (util_isUri(path)) {
				path = path.toString();
			}

			if (!path) {
				return util_clone(this);
			}

			if (rgx_win32Drive.test(path)) {
				return new class_Uri(path);
			}

			var uri = util_clone(this);

			uri.value = path;

			parse_search(uri);
			parse_file(uri);

			if (!uri.value) {
				return uri;
			}

			path = uri.value.replace(/^\.\//i, "");

			if (path[0] === "/") {
				uri.path = path;
				return uri;
			}

			while (/^(\.\.\/?)/ig.test(path)) {
				uri.cdUp();
				path = path.substring(3);
			}

			uri.path = normalize_pathsSlashes(util_combinePathes(uri.path, path));

			return uri;
		},
		toString: function toString() {
			var protocol = this.protocol ? this.protocol + "://" : "";
			var path = util_combinePathes(this.host, this.path, this.file) + (this.search || "");
			var str = protocol + path;

			if (!(this.file || this.search)) {
				str += "/";
			}
			return str;
		},
		toPathAndQuery: function toPathAndQuery() {
			return util_combinePathes(this.path, this.file) + (this.search || "");
		},
		/**
   * @return Current Uri Path{String} that is relative to @arg1 Uri
   */
		toRelativeString: function toRelativeString(uri) {
			if (typeof uri === "string") uri = new class_Uri(uri);

			if (this.path.indexOf(uri.path) === 0) {
				// host folder
				var p = this.path ? this.path.replace(uri.path, "") : "";
				if (p[0] === "/") p = p.substring(1);

				return util_combinePathes(p, this.file) + (this.search || "");
			}

			// sub folder
			var current = this.path.split("/"),
			    relative = uri.path.split("/"),
			    commonpath = "",
			    i = 0,
			    length = Math.min(current.length, relative.length);

			for (; i < length; i++) {
				if (current[i] === relative[i]) continue;

				break;
			}

			if (i > 0) commonpath = current.splice(0, i).join("/");

			if (commonpath) {
				var sub = "",
				    path = uri.path,
				    forward;
				while (path) {
					if (this.path.indexOf(path) === 0) {
						forward = this.path.replace(path, "");
						break;
					}
					path = path.replace(/\/?[^\/]+\/?$/i, "");
					sub += "../";
				}
				return util_combinePathes(sub, forward, this.file);
			}

			return this.toString();
		},

		toLocalFile: function toLocalFile() {
			var path = util_combinePathes(this.host, this.path, this.file);

			return util_win32Path(path);
		},
		toLocalDir: function toLocalDir() {
			var path = util_combinePathes(this.host, this.path, "/");

			return util_win32Path(path);
		},
		toDir: function toDir() {
			var str = this.protocol ? this.protocol + "://" : "";

			return str + util_combinePathes(this.host, this.path, "/");
		},
		isRelative: function isRelative() {
			return !(this.protocol || this.host);
		},
		getName: function getName() {
			return this.file.replace("." + this.extension, "");
		}
	});

	var rgx_protocol = /^([a-zA-Z]+):\/\//,
	    rgx_extension = /\.([\w\d]+)$/i,
	    rgx_win32Drive = /(^\/?\w{1}:)(\/|$)/,
	    rgx_fileWithExt = /([^\/]+(\.[\w\d]+)?)$/i;

	function util_isUri(object) {
		return object && typeof object === "object" && typeof object.combine === "function";
	}

	function util_combinePathes() {
		var args = arguments,
		    str = "";
		for (var i = 0, x, imax = arguments.length; i < imax; i++) {
			x = arguments[i];
			if (!x) continue;

			if (!str) {
				str = x;
				continue;
			}

			if (str[str.length - 1] !== "/") str += "/";

			str += x[0] === "/" ? x.substring(1) : x;
		}
		return str;
	}

	function normalize_pathsSlashes(str) {

		if (str[str.length - 1] === "/") {
			return str.substring(0, str.length - 1);
		}
		return str;
	}

	function util_clone(source) {
		var uri = new class_Uri(),
		    key;
		for (key in source) {
			if (typeof source[key] === "string") {
				uri[key] = source[key];
			}
		}
		return uri;
	}

	function normalize_uri(str) {
		return str.replace(/\\/g, "/").replace(/^\.\//, "")

		// win32 drive path
		.replace(/^(\w+):\/([^\/])/, "/$1:/$2");
	}

	function util_win32Path(path) {
		if (rgx_win32Drive.test(path) && path[0] === "/") {
			return path.substring(1);
		}
		return path;
	}

	function parse_protocol(obj) {
		var match = rgx_protocol.exec(obj.value);

		if (match == null && obj.value[0] === "/") {
			obj.protocol = "file";
		}

		if (match == null) {
			return;
		}obj.protocol = match[1];
		obj.value = obj.value.substring(match[0].length);
	}

	function parse_host(obj) {
		if (obj.protocol == null) {
			return;
		}if (obj.protocol === "file") {
			var match = rgx_win32Drive.exec(obj.value);
			if (match) {
				obj.host = match[1];
				obj.value = obj.value.substring(obj.host.length);
			}
			return;
		}

		var pathStart = obj.value.indexOf("/", 2);

		obj.host = ~pathStart ? obj.value.substring(0, pathStart) : obj.value;

		obj.value = obj.value.replace(obj.host, "");
	}

	function parse_search(obj) {
		var question = obj.value.indexOf("?");
		if (question === -1) {
			return;
		}obj.search = obj.value.substring(question);
		obj.value = obj.value.substring(0, question);
	}

	function parse_file(obj) {
		var match = rgx_fileWithExt.exec(obj.value),
		    file = match == null ? null : match[1];

		if (file == null) {
			return;
		}
		obj.file = file;
		obj.value = obj.value.substring(0, obj.value.length - file.length);
		obj.value = normalize_pathsSlashes(obj.value);

		match = rgx_extension.exec(file);
		obj.extension = match == null ? null : match[1];
	}

	class_Uri.combinePathes = util_combinePathes;
	class_Uri.combine = util_combinePathes;
})();
/*args*/
//# sourceMappingURL=Uri.es6.map
// end:source /src/class/Uri.es6