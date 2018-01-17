/* jshint -W053 */




(function(global, mask) {
	"use strict";

	var builder_build = mask.build,
		Dom = mask.Dom;

	var log_warn  = console.warn.bind(console),
		log_error = console.error.bind(console),
		error_withCompo = log_error;

	// source /ref-utils/lib/utils.embed.js
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
	// end:source /ref-utils/lib/utils.embed.js

	// source vars
	var __Compo = typeof Compo !== 'undefined' ? Compo : (mask.Compo || global.Compo),
	    __dom_addEventListener = __Compo.Dom.addEventListener,
	    __registerHandler = mask.registerHandler,
	    __registerAttr = mask.registerAttrHandler,
	    __registerUtil = mask.registerUtil,
	    
		domLib = __Compo.config.getDOMLibrary();
		
	
	// end:source vars
	// source utils/
	// source object
	var obj_callFn;
	(function () {
		obj_callFn = function (obj, path, args) {
			var end = path.lastIndexOf('.');
			if (end === -1) {
				return call(obj, path, args);
			}
			var host = obj,
				i = -1;
			while (host != null && i !== end) {
				var start = i;
				i = path.indexOf('.', i);
				
				var key = path.substring(start + 1, i);
				host = host[key];
			}
			return call(host, path.substring(end + 1), args);
		};
		function call(obj, key, args) {
			var fn = null;
			if (obj != null)
				fn = obj[key];
	
			if (typeof fn !== 'function') {
				console.error('Not a function', key);
				return null;
			}
			return fn.apply(obj, args);
		}
	}());
	// end:source object
	// source object_observe
	var obj_addObserver,
		obj_hasObserver,
		obj_removeObserver,
		obj_lockObservers,
		obj_unlockObservers,
		obj_ensureObserversProperty,
		obj_addMutatorObserver,
		obj_removeMutatorObserver
		;
	
	(function(){
		(function () {
			obj_addObserver = function(obj, property, cb) {
				if (obj == null) {
					log_error('Not possible to add the observer for "' + property + '" as current model is undefined.');
					return;
				}
				// closest observer
				var parts = property.split('.'),
					imax  = parts.length,
					i = -1,
					x = obj;
	
				if (pushClosest(obj[parts[0]], parts, 1, cb)) {
					/* We have added a callback as close as possible to the observle property owner
					 * But also add the cb to myself to listen different object path level setters
					 */
					var cbs = pushListener_(obj, property, cb);
					if (cbs.length === 1) {
						var arr = parts.splice(0, i);
						if (arr.length !== 0)
							attachProxy_(obj, property, cbs, arr, true);
					}
					if (parts.length > 1) {
						obj_defineCrumbs(obj, parts);
					}
					return;
				}
				
				var cbs = pushListener_(obj, property, cb);
				if (cbs.length === 1)
					attachProxy_(obj, property, cbs, parts, true);
	
				var val = obj_getProperty(obj, property),
					mutators = getSelfMutators(val);
				if (mutators != null) {
					objMutator_addObserver(
						val, mutators, cb
					);
				}
			};
	
			function pushClosest(ctx, parts, i, cb) {
				if (ctx == null) {
					return false;
				}
				if (i < parts.length - 1 && pushClosest(ctx[parts[i]], parts, i + 1, cb)) {
					return true;
				}
				var obs = ctx[prop_OBS];
				if (obs == null) {
					return false;
				}
				var prop = toProp(parts, i);
				var arr = obs[prop];
				if (arr == null) {
					// fix [obj.test](hosts)
					var proxy = obs[prop_PROXY];
					if (proxy != null && proxy[prop] === true) {					
						pushListener_(ctx, prop, cb);
						return true;
					}
					return false;
				}
				pushListener_(ctx, prop, cb);
				return true;
			}
		}());
		
	
		obj_hasObserver = function(obj, property, callback){
			// nested observer
			var parts = property.split('.'),
				imax  = parts.length,
				i = -1,
				x = obj;
			while ( ++i < imax ) {
				x = x[parts[i]];
				if (x == null)
					break;
	
				if (x[prop_OBS] != null) {
					if (obj_hasObserver(x, parts.slice(i + 1).join('.'), callback))
						return true;
	
					break;
				}
			}
	
			var obs = obj[prop_OBS];
			if (obs == null || obs[property] == null)
				return false;
	
			return arr_contains(obs[property], callback);
		};
	
		obj_removeObserver = function(obj, property, callback) {
			if (obj == null) {
				log_error('Not possible to remove the observer for "' + property + '" as current model is undefined.');
				return;
			}
			// nested observer
			var parts = property.split('.'),
				imax  = parts.length,
				i = -1,
				x = obj;
			while ( ++i < imax ) {
				x = x[parts[i]];
				if (x == null)
					break;
	
				if (x[prop_OBS] != null) {
					obj_removeObserver(x, parts.slice(i + 1).join('.'), callback);
					break;
				}
			}
	
			var obs = obj_getObserversProperty(obj, property);
			if (obs != null) {
				if (callback === void 0) {
					// callback not provided -> remove all observers
					obs.length = 0;
				} else {
					arr_remove(obs, callback);
				}
			}
			var val = obj_getProperty(obj, property),
				mutators = getSelfMutators(val);
			if (mutators != null)
				objMutator_removeObserver(val, mutators, callback)
	
		};
		obj_lockObservers = function(obj) {
			var obs = obj[prop_OBS];
			if (obs != null)
				obs[prop_DIRTY] = {};
		};
		obj_unlockObservers = function(obj) {
			var obs = obj[prop_OBS],
				dirties = obs == null ? null : obs[prop_DIRTY];
			if (dirties == null)
				return;
	
			obs[prop_DIRTY] = null;
	
			var prop, cbs, val, imax, i;
			for(prop in dirties) {
				cbs = obj[prop_OBS][prop];
				imax = cbs == null ? 0 : cbs.length;
				if (imax === 0)
					continue;
	
				i = -1;
				val = prop === prop_MUTATORS
						? obj
						: obj_getProperty(obj, prop)
						;
				while ( ++i < imax ) {
					cbs[i](val);
				}
			}
		};
	
		var obj_getObserversProperty = function (obj, type){
			var obs = obj[prop_OBS];
			return obs == null ? null : obs[type];		
		};
		obj_ensureObserversProperty = function(obj, type){
			var obs = obj[prop_OBS];
			if (obs == null) {
				obs = {
					__dirty: null,
					__dfrTimeout: null,
					__mutators: null,
					__rebinders: {},
					__proxies: {}
				};
				defineProp_(obj, '__observers', {
					value: obs,
					enumerable: false
				});
			}
			if (type == null)
				return obs;
	
			var arr = obs[type];
			return arr == null
				? (obs[type] = [])
				: arr
				;
		};
	
		var obj_ensureRebindersProperty = function(obj){
			var hash = obj[prop_REBINDERS];
			if (hash == null) {
				hash = {};
				defineProp_(obj, prop_REBINDERS, {
					value: hash,
					enumerable: false
				});
			}
			return hash;
		};
	
		obj_addMutatorObserver = function(obj, cb){
			var mutators = getSelfMutators(obj);
			if (mutators != null)
				objMutator_addObserver(obj,  mutators, cb);
		};
		obj_removeMutatorObserver = function(obj, cb){
			objMutator_removeObserver(obj, null, cb);
		};
	
		// PRIVATE
		var prop_OBS = '__observers',
			prop_MUTATORS = '__mutators',
			prop_TIMEOUT = '__dfrTimeout',
			prop_DIRTY = '__dirty',
			prop_REBINDERS = '__rebinders',
			prop_PROXY = '__proxies';
	
		var defineProp_ = Object.defineProperty;
	
	
		//Resolve object, or if property do not exists - create
		function ensureProperty_(obj, chain) {
			var i = -1,
				imax = chain.length - 1,
				key
				;
			while ( ++i < imax ) {
				key = chain[i];
	
				if (obj[key] == null)
					obj[key] = {};
	
				obj = obj[key];
			}
			return obj;
		}
		function getSelfMutators(obj) {
			if (obj == null || typeof obj !== 'object')
				return null;
	
			if (typeof obj.length === 'number' && typeof obj.slice === 'function')
				return MUTATORS_.Array;
			if (typeof obj.toUTCString === 'function')
				return MUTATORS_.Date;
	
			return null;
		}
		var MUTATORS_ = {
			Array: {
				throttle: false,
				methods: [
					// native mutators
					'push',
					'unshift',
					'splice',
					'pop',
					'shift',
					'reverse',
					'sort',
					// collection mutators
					'remove'
				]
			},
			Date: {
				throttle: true,
				methods: [
					'setDate',
					'setFullYear',
					'setHours',
					'setMilliseconds',
					'setMinutes',
					'setMonth',
					'setSeconds',
					'setTime',
					'setUTCDate',
					'setUTCFullYear',
					'setUTCHours',
					'setUTCMilliseconds',
					'setUTCMinutes',
					'setUTCMonth',
					'setUTCSeconds',
				]
			}
		};
		function attachProxy_(obj, property, cbs, chain) {
			var length = chain.length;
				
			if (length > 1) {
				if (obj_defineCrumbs(obj, chain) === false) {
					return;
				}
			}
	
			// TODO: ensure is not required, as defineCrumbs returns false when path contains null value */
			var parent = length > 1
				? ensureProperty_(obj, chain) 
				: obj,
			key = chain[length - 1],
			currentVal = parent[key];
	
			if ('length' === key) {
				var mutators = getSelfMutators(parent);
				if (mutators != null) {
					objMutator_addObserver(
						parent, mutators, function(){
							var imax = cbs.length,
								i = -1
								;
							while ( ++i < imax ) {
								cbs[i].apply(null, arguments);
							}
						});
					return currentVal;
				}
	
			}
	
			var obs = obj_ensureObserversProperty(parent);		
			var hash = obs[prop_PROXY];
			if (hash[key] === true) return;
	
			hash[key] = true;
	
			defineProp_(parent, key, {
				get: function() {
					return currentVal;
				},
				set: function(x) {
					if (x === currentVal)
						return;
					var oldVal = currentVal;
	
					currentVal = x;
					var i = 0,
						imax = cbs.length,
						mutators = getSelfMutators(x);
	
	
					if (mutators != null) {
						for(; i < imax; i++) {
							objMutator_addObserver(
								x, mutators, cbs[i]
							);
						}
					}
	
					if (obj[prop_OBS][prop_DIRTY] != null) {
						obj[prop_OBS][prop_DIRTY][property] = 1;
						return;
					}
	
					for (i = 0; i < imax; i++) {
						cbs[i](x);
					}
	
					obj_sub_notifyListeners(obj, property, oldVal);
					obj_deep_notifyListeners(obj, chain, oldVal, currentVal, cbs);
				},
				configurable: true,
				enumerable : true
			});
	
			return currentVal;
		}
	
		/* return false, when path contains null values */
		function obj_defineCrumbs(obj, chain) {
			var rebinder = obj_crumbRebindDelegate(obj),
				path = '', key;
	
			var imax = chain.length - 1,
				i = 0, x = obj;
			for(; i < imax; i++) {
				key = chain[i];
				path += key + '.';
	
				obj_defineCrumb(path, x, key, rebinder);
				x = x[key];
				if (x == null) {
					return false;
				}
			}
			return true;
		}
	
		function obj_defineCrumb(path, obj, key, rebinder) {
			var cbs = obj[prop_OBS] && obj[prop_OBS][key];
			if (cbs != null) {
				return;
			}
	
			var value = obj[key],
				old;
	
			var hash = obj_ensureRebindersProperty(obj);
			var set = hash[key];
			if (set != null) {
				if (set[path] == null) {
					set[path] = rebinder;
				}
				return;			
			}
	
			set = hash[key] = {}; 
			set[path] = rebinder;
	
			defineProp_(obj, key, {
				get: function() {
					return value;
				},
				set: function(x) {
					if (x === value)
						return;
	
					old = value;
					value = x;
	
					for (var _path in set) {
						set[_path](_path, old);
					}
				},
				configurable: true,
				enumerable : true
			});
		}
		function obj_sub_notifyListeners(obj, path, oldVal) {
			var obs = obj[prop_OBS];
			if (obs == null)
				return;
			for(var prop in obs) {
				if (prop.indexOf(path + '.') !== 0)
					continue;
	
				var cbs = obs[prop].slice(0),
					imax = cbs.length,
					i = 0, oldProp, cb;
				if (imax === 0)
					continue;
	
				var val = obj_getProperty(obj, prop);
				for (i = 0; i < imax; i++) {
					cb = cbs[i];
					obj_removeObserver(obj, prop, cb);
	
					if (oldVal != null && typeof oldVal === 'object') {
						oldProp = prop.substring(path.length + 1);
						obj_removeObserver(oldVal, oldProp, cb);
					}
				}
				for (i = 0; i < imax; i++){
					cbs[i](val);
				}
				for (i = 0; i < imax; i++){
					obj_addObserver(obj, prop, cbs[i]);
				}
			}
		}
	
	
		var obj_deep_notifyListeners;
		(function () {
			obj_deep_notifyListeners = function (obj, chain, oldVal, currentVal, fns) {
				var i = 0,
					imax = chain.length,
					ctx = obj,
					arr = fns.slice(0);
				
				do {
					ctx = ctx[chain[i]];
					if (ctx == null) {
						return;
					}
	
					var obs = ctx[prop_OBS];
					if (obs == null) {
						continue;
					}
					var prop = toProp(chain, i + 1);
					var cbs = obs[prop];
					if (cbs == null) {
						continue;
					}
	
					for (var j = 0; j < cbs.length; j++) {
						var cb = cbs[j]
						if (arr.indexOf(cb) !== -1) {
							continue;
						}
						cb(currentVal);
						arr.push(cb);
					}
				}
				while(++i < imax - 1);
			};		
		}());
	
	
		function toProp(arr, start) {
			var str = '',
				imax = arr.length,
				i = start - 1;
			while(++i < imax){
				if (i !== start) str += '.';
				str += arr[i]; 
			}
			return str;
		}
		
	
		function obj_crumbRebindDelegate(obj) {
			return function(path, oldValue){
				obj_crumbRebind(obj, path, oldValue);
			};
		}
		function obj_crumbRebind(obj, path, oldValue) {
			var obs = obj[prop_OBS];
			if (obs == null)
				return;
	
			for (var prop in obs) {
				if (prop.indexOf(path) !== 0)
					continue;
	
				var cbs = obs[prop].slice(0),
					imax = cbs.length,
					i = 0;
	
				if (imax === 0)
					continue;
	
				var val = obj_getProperty(obj, prop),
					oldProp = prop.substring(path.length),
					oldVal = obj_getProperty(oldValue, oldProp);
	
				for (i = 0; i < imax; i++) {
					var cb = cbs[i];
					obj_removeObserver(obj, prop, cb);
	
					if (oldValue != null && typeof oldValue === 'object') {
						obj_removeObserver(oldValue, oldProp, cb);
					}
				}
				if (oldVal !== val) {
					for (i = 0; i < imax; i++){
						cbs[i](val);
					}
				}
	
	
				for (i = 0; i < imax; i++){
					obj_addObserver(obj, prop, cbs[i]);
				}
			}
		}
	
		// Create Collection - Check If Exists - Add Listener
		function pushListener_(obj, property, cb) {
			var obs = obj_ensureObserversProperty(obj, property);
			if (arr_contains(obs, cb) === false)
				obs.push(cb);
			return obs;
		}
	
		var objMutator_addObserver,
			objMutator_removeObserver;
		(function(){
			objMutator_addObserver = function(obj, mutators, cb){
				var methods = mutators.methods,
					throttle = mutators.throttle,
					obs = obj_ensureObserversProperty(obj, prop_MUTATORS);
				if (obs.length === 0) {
					var imax = methods.length,
						i = -1,
						method, fn;
					while( ++i < imax ){
						method = methods[i];
						fn = obj[method];
						if (fn == null)
							continue;
	
						obj[method] = objMutator_createWrapper_(
							obj
							, fn
							, method
							, throttle
						);
					}
				}
				obs[obs.length++] = cb;
			};
			objMutator_removeObserver = function(obj, mutators, cb){
				var obs = obj_getObserversProperty(obj, prop_MUTATORS);
				if (obs == null) {
					return;
				}
				if (cb === void 0) {
					obs.length = 0;
					return;
				}
				arr_remove(obs, cb);
			};
	
			function objMutator_createWrapper_(obj, originalFn, method, throttle) {
				var fn = throttle === true ? callDelayed : call;
				return function() {
					return fn(
						obj,
						originalFn,
						method,
						_Array_slice.call(arguments)
					);
				};
			}
			function call(obj, original, method, args) {
				var cbs = obj_ensureObserversProperty(obj, prop_MUTATORS),
					result = original.apply(obj, args);
	
				tryNotify(obj, cbs, method, args, result);
				return result;
			}
			function callDelayed(obj, original, method, args) {
				var cbs = obj_ensureObserversProperty(obj, prop_MUTATORS),
					result = original.apply(obj, args);
	
				var obs = obj[prop_OBS];
				if (obs[prop_TIMEOUT] != null)
					return result;
	
				obs[prop_TIMEOUT] = setTimeout(function(){
					obs[prop_TIMEOUT] = null;
					tryNotify(obj, cbs, method, args, result);
				});
				return result;
			}
	
			function tryNotify(obj, cbs, method, args, result){
				if (cbs.length === 0)
					return;
	
				var obs = obj[prop_OBS];
				if (obs[prop_DIRTY] != null) {
					obs[prop_DIRTY][prop_MUTATORS] = 1;
					return;
				}
				var imax = cbs.length,
					i = -1,
					x;
				while ( ++i < imax ){
					x = cbs[i];
					if (typeof x === 'function') {
						x(obj, method, args, result);
					}
				}
			}
		}());
	
	}());
	// end:source object_observe
	// source date
	var date_ensure;
	(function(){
		date_ensure = function(val){
			if (val == null || val === '') 
				return null;
			
			var date = val;
			var type = typeof val;
			if (type === 'string') {
				date = new Date(val);
				
				if (rgx_es5Date.test(date) && val.indexOf('Z') === -1) {
					// adjust to local time (http://es5.github.io/x15.9.html#x15.9.1.15)
					val.setMinutes(val.getTimezoneOffset());
				}
			}
			if (type === 'number') {
				date = new Date(val);
			}
			
			return isNaN(date) === false && typeof date.getFullYear === 'function'
				? date
				: null
				;
		};
		
		var rgx_es5Date = /^\d{4}\-\d{2}/;
	}());
	// end:source date
	// source dom
	var dom_removeElement,
		dom_removeAll,
		dom_insertAfter,
		dom_insertBefore,
		dom_hideEl,
		dom_hideAll,
		dom_showEl,
		dom_showAll;
	(function(){
		dom_removeElement = function(el) {
			var parent = el.parentNode;
			if (parent == null) {
				return el;
			}
			return parent.removeChild(el);
		};
		dom_removeAll = function(arr) {
			arr_each(arr, dom_removeElement);
		};
		dom_hideEl = function(el){
			if (el != null) {
				el.style.display = 'none';
			}
		};
		dom_hideAll = function(arr) {
			arr_each(arr, dom_hideEl);
		};
		dom_showEl = function(el){
			if (el != null) {
				el.style.display = '';
			}
		};
		dom_showAll = function(arr) {
			arr_each(arr, dom_showEl);
		};
		dom_insertAfter = function(el, anchor) {
			return anchor.parentNode.insertBefore(el, anchor.nextSibling);
		};
		dom_insertBefore = function(el, anchor) {
			return anchor.parentNode.insertBefore(el, anchor);
		};
	}());
	// end:source dom
	// source compo
	var compo_fragmentInsert,
		compo_render,
		compo_renderChildren,
		compo_renderElements,
		compo_dispose,
		compo_disposeChildren,
		compo_inserted,
		compo_attachDisposer,
		compo_hasChild,
		compo_getScopeFor,
		compo_transferChildren
		;
	(function(){
	
		compo_fragmentInsert = function(compo, index, fragment, placeholder) {
			if (compo.components == null) {
				return dom_insertAfter(fragment, placeholder || compo.placeholder);
			}
			var compos = compo.components,
				anchor = null,
				insertBefore = true,
				imax = compos.length,
				i = index - 1;
	
			if (anchor == null) {
				while (++i < imax) {
					var arr = compos[i].elements;
					if (arr != null && arr.length !== 0) {
						anchor = arr[0];
						break;
					}
				}
			}
			if (anchor == null) {
				insertBefore = false;
				i = index < imax
					? index
					: imax
					;
				while (--i > -1) {
					var arr = compos[i].elements;
					if (arr != null && arr.length !== 0) {
						anchor = arr[arr.length - 1];
						break;
					}
				}
			}
			if (anchor == null) {
				anchor = placeholder || compo.placeholder;
			}
			if (insertBefore) {
				return dom_insertBefore(fragment, anchor);
			}
			return dom_insertAfter(fragment, anchor);
		};
		compo_render = function(parentCtr, template, model, ctx, container) {
			return mask.render(template, model, ctx, container, parentCtr);
		};
		compo_renderChildren = function(compo, anchor, model){
			var fragment = document.createDocumentFragment();
			compo.elements = compo_renderElements(
				compo.nodes,
				model || compo.model,
				compo.ctx,
				fragment,
				compo
			);
			dom_insertBefore(fragment, anchor);
			compo_inserted(compo);
		};
		compo_renderElements = function(nodes, model, ctx, el, ctr){
			if (nodes == null){
				return null;
			}
			var arr = [];
			builder_build(nodes, model, ctx, el, ctr, arr);
			return arr;
		};
		compo_dispose = function(compo, parent) {
			if (compo == null)
				return false;
	
			if (compo.elements != null) {
				dom_removeAll(compo.elements);
				compo.elements = null;
			}
			__Compo.dispose(compo);
	
			var compos = (parent && parent.components) || (compo.parent && compo.parent.components);
			if (compos == null) {
				log_error('Parent Components Collection is undefined');
				return false;
			}
			return arr_remove(compos, compo);
		};
	
		compo_disposeChildren = function(compo){
			var els = compo.elements;
			if (els != null) {
				dom_removeAll(els);
				compo.elements = null;
			}
			var compos = compo.components;
			if (compos != null) {
				var imax = compos.length, i = -1;
				while (++i < imax){
					Compo.dispose(compos[i]);
				}
				compos.length = 0;
			}
		};
	
		compo_inserted = function(compo) {
			__Compo.signal.emitIn(compo, 'domInsert');
		};
	
		compo_attachDisposer = function(ctr, disposer) {
			if (typeof ctr.dispose === 'function') {
				var previous = ctr.dispose;
				ctr.dispose = function(){
					disposer.call(this);
					previous.call(this);
				};
	
				return;
			}
			ctr.dispose = disposer;
		};
	
		compo_hasChild = function(compo, compoName){
			var arr = compo.components;
			if (arr == null || arr.length === 0) {
				return false;
			}
			var imax = arr.length,
				i = -1;
			while (++i < imax) {
				if (arr[i].compoName === compoName) {
					return true;
				}
			}
			return false;
		};
	
		compo_getScopeFor = function(ctr, path){
			var key = path;
			var i = path.indexOf('.');
			if (i !== -1) {
				key = path.substring(0, i);
				if (key.charCodeAt(key.length - 1) === 63 /*?*/) {
					key = key.slice(0, -1);
				}
			}
			while (ctr != null) {
				if (ctr.scope != null && ctr.scope.hasOwnProperty(key)) {
					return ctr.scope;
				}
				ctr = ctr.parent;
			}
			return null;
		};
		compo_transferChildren = function(compo){
			var x = {
				elements: compo.elements,
				components: compo.components
			};
			compo.elements = compo.components = null;
			return x;
		};
	
	}());
	// end:source compo
	// source expression
	var expression_eval,
		expression_eval_strict,
		expression_evalStatements,
		expression_bind,
		expression_unbind,
		expression_createBinder,
		expression_createListener,
		expression_callFn,
	
		expression_parse,
		expression_varRefs,
		expression_getHost
		;
	
	(function(){
		var Expression = mask.Utils.Expression;
	
		expression_eval_strict = Expression.eval;
		expression_parse = Expression.parse;
		expression_varRefs = Expression.varRefs;
		expression_evalStatements = Expression.evalStatements;
	
		expression_eval = function(expr, model, ctx, ctr, node){
			var x = expression_eval_strict(expr, model, ctx, ctr, node);
			return x == null ? '' : x;
		};
	
		expression_bind = function(expr, model, ctx, ctr, cb) {
			if (expr === '.') {
				if (model != null) {
					obj_addMutatorObserver(model, cb);
				}
				return;
			}
			toggleExpressionsBindings(
				obj_addObserver,
				expr, 
				model, 
				ctr, 
				cb
			);
		};
	
		expression_unbind = function(expr, model, ctr, cb) {
			if (expr === '.') {
				if (model != null) {
					obj_removeMutatorObserver(model, cb);
				}
				return;
			}
			toggleExpressionsBindings(
				obj_removeObserver, 
				expr, 
				model, 
				ctr, 
				cb
			);
		};
	
		function toggleExpressionsBindings (fn, expr, model, ctr, cb) {
			var mix = expression_varRefs(expr, model, null, ctr);
			if (mix == null) return null;
			if (typeof mix === 'string') {
				_toggleObserver(fn, model, ctr, mix, cb);
				return;
			}		
			var arr = mix,
				imax = arr.length,
				i = -1;
			while (++i < imax) {
				var accs = arr[i];
				if (typeof accs === 'string')
				if (accs.charCodeAt(0) === 95 /*_*/ && accs.charCodeAt(0) === 46 /*.*/) {
					continue;
				}
				else if (typeof accs === 'object') {
					if (accs.ref === '_') {
						continue;
					}
				}
				_toggleObserver(fn, model, ctr, accs, cb);
			}
		}
	
		expression_callFn = function (accessor, model, ctx, ctr, args) {
			var tuple = expression_getHost(
				accessor, 
				model, 
				ctx, 
				ctr
			);
			if (tuple != null) {
				var obj = tuple[0],
					path = tuple[1];
	
				return obj_callFn(obj, path, args);
			}
			return null;
		};
		/**
		 * expression_bind only fires callback, if some of refs were changed,
		 * but doesnt supply new expression value
		 **/
		expression_createBinder = function(expr, model, ctx, ctr, fn) {
			return expression_createListener(function(){
				var value = expression_eval(expr, model, ctx, ctr);
				var args =  _Array_slice.call(arguments);
				args[0] = value;
	
				fn.apply(this, args);
			});
		};
	
		expression_createListener = function(callback){
			var locks = 0;
			return function(){
				if (++locks > 1) {
					locks = 0;
					log_warn('<listener:expression> concurrent binder');
					return;
				}
				callback.apply(this, _Array_slice.call(arguments));
				locks--;
			}
		};
	
		(function () {
			// [ObjectHost, Property]
			var tuple = [null, null];
			expression_getHost = function (accessor, model, ctx, ctr) {
				var result = get(accessor, model, ctx, ctr);
				if (result == null || result[0] == null) {
					error_withCompo('Observable host is undefined or is not allowed: ' + accessor.toString(), ctr);
					return null;
				}
				return result;
			};
			function get(accessor, model, ctx, ctr) {
				if (accessor == null)
					return;
	
				if (typeof accessor === 'object') {
					var obj = expression_eval_strict(accessor.accessor, model, null, ctr);
					if (obj == null || typeof obj !== 'object') {
						return null;
					}
					tuple[0] = obj;
					tuple[1] = accessor.ref;
					return tuple;
				}
				var property = accessor,
					parts = property.split('.'),
					imax = parts.length;
	
				if (imax > 1) {
					var first = parts[0];
					if (first === 'this' || first === '$c' || first === '$') {
						// Controller Observer
						var owner  = _getObservable_Controller(ctr, parts[1]);					
						var cutIdx = first.length + 1;
						tuple[0] = owner;
						tuple[1] = property.substring(cutIdx);
						return tuple;
					}
					if (first === '$scope') {
						// Controller Observer
						var scope = _getObservable_Scope(ctr, parts[1]);
						var cutIdx = 6 + 1;
						tuple[0] = scope;
						tuple[1] = property.substring(cutIdx);
						return tuple;
					}				
				}
	
				var obj = null;
				if (_isDefined(model, parts[0])) {
					obj = model;
				}
				if (obj == null) {
					obj = _getObservable_Scope(ctr, parts[0]);
				}
				if (obj == null) {
					obj = model;
				}
				tuple[0] = obj;
				tuple[1] = property;
				return tuple;
			}
		}());
		
		function _toggleObserver(mutatorFn, model, ctr, accessor, callback) {		
			var tuple = expression_getHost(accessor, model, null, ctr);
			if (tuple == null) return;
			var obj = tuple[0],
				property = tuple[1];
	
			if (obj == null) return;
			mutatorFn(obj, property, callback);
		}
	
		function _getObservable_Controller(ctr_, key) {
			var ctr = ctr_;
			while(ctr != null){
				if (_isDefined(ctr, key))
					return ctr;
				ctr = ctr.parent;
			}
			return ctr;
		}
		function _getObservable_Scope(ctr_, property, imax) {
			var ctr = ctr_, scope;
			while(ctr != null){
				scope = ctr.scope;
				if (_isDefined(scope, property)) {
					return scope;
				}
				ctr = ctr.parent;
			}
			return null;
		}
		function _isDefined(obj_, key_){
			var key = key_;
			if (key.charCodeAt(key.length - 1) === 63 /*?*/) {
				key = key.slice(0, -1);
			}
			return obj_ != null && key in obj_;
		}
	
	
	}());
	
	// end:source expression
	// source signal
	var signal_parse,
		signal_create
		;
	
	(function(){
		
		
		signal_parse = function(str, isPiped, defaultType) {
			var signals = str.split(';'),
				set = [],
				i = 0,
				imax = signals.length,
				x,
				signalName, type,
				signal;
				
		
			for (; i < imax; i++) {
				x = signals[i].split(':');
				
				if (x.length !== 1 && x.length !== 2) {
					log_error('Too much ":" in a signal def.', signals[i]);
					continue;
				}
				
				
				type = x.length === 2 ? x[0] : defaultType;
				signalName = x[x.length === 2 ? 1 : 0];
				
				signal = signal_create(signalName.trim(), type, isPiped);
				
				if (signal != null) {
					set.push(signal);
				}
			}
			
			return set;
		};
		
		
		signal_create = function(signal, type, isPiped) {
			if (isPiped !== true) {
				return {
					signal: signal,
					type: type
				};
			}
			
			var index = signal.indexOf('.');
			if (index === -1) {
				log_error('No pipe name in a signal', signal);
				return null;
			}
			
			return {
				signal: signal.substring(index + 1),
				pipe: signal.substring(0, index),
				type: type
			};
		};
	}());
	
	// end:source signal
	// end:source utils/

	// source binders/
	var Binders = {};
	(function(){
		// source ./IBinder.js
		var IBinder = class_create({
			constructor: function (exp, model, ctr) {
				this.exp = exp;
				this.ctr = ctr;
				this.model = model;
				this.cb = null;
			},
			bind: function(cb){
				this.cb = cb;
				// we have here no access to the ctx, so pass null
				this.on(this.exp, this.model, null, this.ctr, cb);
			},
			dispose: function(){
				this.off(this.exp, this.model, this.ctr, this.cb);
				this.exp = this.model = this.ctr = this.cb = null;
			}
		});
		// end:source ./IBinder.js
		// source ./ExpressionBinder.js
		Binders.ExpressionBinder = class_create(IBinder, {
			on: expression_bind,
			off: expression_unbind
		});
		// end:source ./ExpressionBinder.js
		// source ./EventEmitterBinder.js
		/*
		 *	"expression, ...args"
		 *	expression: to get the IEventEmitter
		 */
		(function(){
			Binders.EventEmitterBinder = class_create(IBinder, {
				on: function(exp, model, ctx, ctr, cb){
					call('on', exp, model, ctr, cb);
				},
				off: function(exp, model, ctr, cb){
					call('off', exp, model, ctr, cb);
				},
			});
		
			function call (method, expr, model, ctr, cb) {
				var arr = expression_evalStatements(expr, model, null, ctr);
				var observable = arr.shift();
				if (observable == null || observable[method] == null) {
					log_error('Method is undefined on observable: ' + method);
					return;
				}
				arr.push(cb);
				observable[method].apply(observable, arr);
			}
		}());
		// end:source ./EventEmitterBinder.js
		// source ./RxBinder.js
		/*
		 *	"expression, ...args"
		 *	expression: to get the RxObservable {subscribe:IDisposable}
		 */
		
		Binders.RxBinder = class_create(IBinder, {
			stream: null,
			on: function call (expr, model, ctr, cb) {
				var arr = expression_evalStatements(expr, model, null, ctr);
		
				var stream = arr.shift();
				if (stream == null || stream.subscribe == null) {
					error_withCompo('Subscribe method is undefined on RxObservable', ctr);
					return;
				}
				arr.push(cb);
				this.stream = stream.subscribe.apply(stream, arr);
			},
			off: function(){
				if (this.stream == null) {
					return;
				}
				this.stream.dispose();
			},
		});
		
		// end:source ./RxBinder.js
	}());
	// end:source binders/
	// source DomObjectTransport
	var DomObjectTransport;
	(function(){
	
		var objectWay = {
			get: function(provider, expression) {
				var getter = provider.objGetter;
				if (getter == null) {
					return expression_eval(
						expression
						, provider.model
						, provider.ctx
						, provider.ctr
					);
				}
	
				var ctr = provider.ctr.parent,
					model = provider.model;
				return expression_callFn(
					getter, 
					provider.model,
					provider.ctx,
					ctr,
					[ expression, model, ctr ]
				);			
			},
			set: function(obj, property, value, provider) {
				var setter = provider.objSetter;
				if (setter == null) {
					obj_setProperty(obj, property, value);
					return;
				}
				var ctr = provider.ctr.parent,
					model = provider.model;
				return expression_callFn(
					setter, 
					provider.model,
					provider.ctx,
					ctr,
					[ value, property, model, ctr ]
				);
			}
		};
		var domWay  = {
			get: function(provider) {
				var getter = provider.domGetter;
				if (getter == null) {
					return obj_getProperty(provider, provider.property);
				}
				var ctr = provider.ctr.parent;
				if (isValidFn_(ctr, getter, 'Getter') === false) {
					return null;
				}
				return ctr[getter](provider.element);
			},
			set: function(provider, value) {
				var setter = provider.domSetter;
				if (setter == null) {
					obj_setProperty(provider, provider.property, value);
					return;
				}
				var ctr = provider.ctr.parent;
				if (isValidFn_(ctr, setter, 'Setter') === false) {
					return;
				}
				ctr[setter](value, provider.element);
			}
		};
		var DateTimeDelegate = {
			domSet: function(format){
				return function(prov, val){
					var date = date_ensure(val);
					prov.element.value = date == null ? '' : format(date);
				}
			},
			objSet: function(extend){
				return function(obj, prop, val){
	
					var date = date_ensure(val);
					if (date == null)
						return;
	
					var target = obj_getProperty(obj, prop);
					if (target == null) {
						obj_setProperty(obj, prop, date);
						return;
					}
					if (target.getFullYear == null || isNaN(target)) {
						target = date_ensure(target) || date;
						extend(target, date);
						obj_setProperty(obj, prop, target);
						return;
					}
					extend(target, date);
				}
			}
		};
	
		DomObjectTransport = {
			// generic
			objectWay: objectWay,
			domWay: domWay,
	
			SELECT: {
				get: function(provider) {
					var el = provider.element,
						i = el.selectedIndex;
					if (i === -1)
						return '';
	
					var opt = el.options[i],
						val = opt.getAttribute('value');
					return val == null
						? opt.getAttribute('name') /* obsolete */
						: val
						;
				},
				set: function(provider, val) {
					var el = provider.element,
						options = el.options,
						imax = options.length,
						opt, x, i;
					for(i = 0; i < imax; i++){
						opt = options[i];
						x = opt.getAttribute('value');
						if (x == null)
							x = opt.getAttribute('name');
	
						/* jshint eqeqeq: false */
						if (x == val) {
							/* jshint eqeqeq: true */
							el.selectedIndex = i;
							return;
						}
					}
					log_warn('Value is not an option', val);
				}
			},
			SELECT_MULT: {
				get: function(provider) {
					return coll_map(provider.element.selectedOptions, function(x){
						return x.value;
					});
				},
				set: function(provider, mix) {
					coll_each(provider.element.options, function(el){
						el.selected = false;
					});
					if (mix == null) {
						return;
					}
					var arr = is_ArrayLike(mix) ? mix : [ mix ];
					coll_each(arr, function(val){
						var els = provider.element.options,
							imax = els.length,
							i = -1;
						while (++i < imax) {
							/* jshint eqeqeq: false */
							if (els[i].value == val) {
								/* jshint eqeqeq: true */
								els[i].selected = true;
							}
						}
						log_warn('Value is not an option', val);
					});
				}
			},
			DATE: {
				domWay: {
					get: domWay.get,
					set: function(prov, val){
						var date = date_ensure(val);
						prov.element.value = date == null ? '' : formatDate(date);
					}
				},
				objectWay: {
					get: objectWay.get,
					set: DateTimeDelegate.objSet(function(a, b){
						var offset = a.getTimezoneOffset();
						a.setFullYear(b.getFullYear());
						a.setMonth(b.getMonth());
						a.setDate(b.getDate());
						var diff = offset - a.getTimezoneOffset();
						if (diff !== 0) {
							var h = (diff / 60) | 0;
							a.setHours(a.getHours() + h);
						}
					})
				}
			},
			TIME: {
				domWay: {
					get: domWay.get,
					set: DateTimeDelegate.domSet(formatTime)
				},
				objectWay: {
					get: objectWay.get,
					set: DateTimeDelegate.objSet(function(a, b){
						a.setHours(b.getHours());
						a.setMinutes(b.getMinutes());
						a.setSeconds(b.getSeconds());
					})
				}
			},
			MONTH: {
				domWay: {
					get: domWay.get,
					set: DateTimeDelegate.domSet(formatMonth)
				},
				objectWay: {
					get: objectWay.get,
					set: DateTimeDelegate.objSet(function(a, b){
						a.setFullYear(b.getFullYear());
						a.setMonth(b.getMonth());
					})
				}
			},
			RADIO: {
				domWay: {
					get: function(provider){
						var el = provider.element;
						return el.checked ? el.value : null;
					},
					set: function(provider, value){
						var el = provider.element;
						el.checked = el.value === value;
					}
				},
			}
	
		};
	
		function isValidFn_(obj, prop, name) {
			if (obj== null || typeof obj[prop] !== 'function') {
				log_error('BindingProvider. Controllers accessor.', name, 'should be a function. Property:', prop);
				return false;
			}
			return true;
		}
		function getAccessorObject_(provider, accessor) {
			var ctr = provider.ctr.parent;
			if (ctr[accessor] != null)
				return ctr;
			var model = provider.model;
			if (model[accessor] != null)
				return model;
	
			log_error('BindingProvider. Accessor `', accessor, '`should be a function');
			return null;
		}
		function formatDate(date) {
			var YYYY = date.getFullYear(),
				MM = date.getMonth() + 1,
				DD = date.getDate();
			return YYYY
				+ '-'
				+ (MM < 10 ? '0' : '')
				+ (MM)
				+ '-'
				+ (DD < 10 ? '0' : '')
				+ (DD)
				;
		}
		function formatTime(date) {
			var H = date.getHours(),
				M = date.getMinutes();
			return H
				+ ':'
				+ (M < 10 ? '0' : '')
				+ (M)
				;
		}
		function formatMonth(date) {
			var YYYY = date.getFullYear(),
				MM = date.getMonth() + 1;
			return YYYY
				+ '-'
				+ (MM < 10 ? '0' : '')
				+ (MM);
		}
	}());
	
	// end:source DomObjectTransport
	// source ValidatorProvider
	var ValidatorProvider,
		Validators;
	(function() {
		var class_INVALID = '-validate__invalid';
		
		ValidatorProvider = {
			getFnFromModel: fn_fromModelWrapp,
			getFnByName: fn_byName,
			validate: validate,
			validateUi: function(fns, val, ctr, el, oncancel) {
				var error = validate(fns, val, ctr);
				if (error != null) {
					ui_notifyInvalid(el, error, oncancel);
					return error;
				}
				ui_clearInvalid(el);
				return null;
			}
		};
		
		function validate(fns, val, ctr) {
			if (fns == null) {
				return null;
			}
			var imax = fns.length,
				i = -1,
				error, fn;
			while ( ++i < imax ){
				fn = fns[i];
				if (fn == null) {
					continue;
				}
				error = fn(val, ctr);
				if (error != null) {
					if (is_String(error)) {
						return {
							message: error,
							actual: val
						};
					}
					if (error.actual == null) {
						error.actual = val;
					}
					return error;
				}
			}
		}
		
		function fn_fromModel(model, prop) {
			if (is_Object(model) === false) {
				return null;
			}
			var Validate = model.Validate;
			if (Validate != null) {
				var fn = null;
				if (is_Function(fn = Validate)) {
					return fn;
				}
				if (is_Function(fn = Validate[prop])) {
					return fn;
				}
			}
			
			var i = prop.indexOf('.');
			if (i !== -1) {
				return fn_fromModel(
					model[prop.substring(0, i)], prop.substring(i+1)
				);
			}
			return null;
		}
		function fn_fromModelWrapp(model, prop) {
			var fn = fn_fromModel(model, prop);
			if (fn == null) {
				return null;
			}
			return function(){
				var mix = fn.apply(model, arguments),
					message, error;
				if (mix == null) {
					return null;
				}
				if (is_String(mix)) {
					return {
						message: mix,
						property: prop,
						ctx: model
					};
				}
				mix.property = prop;
				mix.ctx = model;
				return mix;
			};
		}
		
		function fn_byName(name, param, message) {
			var Delegate = Validators[name];
			if (Delegate == null) {
				log_error('Invalid validator', name, 'Supports:', Object.keys(Validators));
				return null;
			}
			var fn = Delegate(param);
			return function(val, ctr){
				var mix = fn(val, ctr);
				if (mix == null || mix === true) {
					return null;
				}
				if (mix === false) {
					return message || ('Check failed: `' + name + '`');
				}
				if (is_String(mix) && mix.length !== 0) {
					return mix;
				}
				return null;
			};
		}
		
		function ui_notifyInvalid(el, error, oncancel) {
			
			var message = error.message || error;
			var next = domLib(el).next('.' + class_INVALID);
			if (next.length === 0) {
				next = domLib('<div>')
					.addClass(class_INVALID)
					.html('<span></span><button>&otimes;</button>')
					.insertAfter(el);
			}
	
			return next
				.children('button')
				.off()
				.on('click', function() {
					next.hide();
					oncancel && oncancel();
		
				})
				.end()
				.children('span').text(message)
				.end()
				.show();
		}
	
		function ui_clearInvalid(el) {
			return domLib(el).next('.' + class_INVALID).hide();
		}
		
		Validators = {
			match: function (match) {		
				return function (str){
					return new RegExp(match).test(str);
				};
			},
			unmatch: function (unmatch) {
				return function (str){
					return !(new RegExp(unmatch).test(str));
				};
			},
			minLength: function (min) {
				return function (str){
					return str.length >= parseInt(min, 10);
				};
			},
			maxLength: function (max) {
				return function (str){
					return str.length <= parseInt(max, 10);
				};
			},
			check: function (condition, node){
				return function (str){
					return expression_eval('x' + condition, node.model, {x: str}, node);
				};
			}
		};
	}());
	// end:source ValidatorProvider
	// source BindingProvider
	var CustomProviders,
	    BindingProvider;
	(function() {
	    CustomProviders = {};
	
	    BindingProvider = class_create({
	        validations: null,
	        constructor: function BindingProvider(model, element, ctr, bindingType) {
	            if (bindingType == null) {
	                bindingType = 'dual';
	
	                var name = ctr.compoName;
	                if (name === ':bind' || name === 'bind') {
	                    bindingType = 'single';
	                }
	            }
	            var attr = ctr.attr;
	
	
	            this.ctr = ctr;
	            this.ctx = null;
	            this.model = model;
	            this.element = element;
	            this.value = attr.value;
	            this.property = attr.property;
	            this.domSetter = attr['dom-setter'] || attr.setter;
	            this.domGetter = attr['dom-getter'] || attr.getter;
	            this.objSetter = attr['obj-setter'];
	            this.objGetter = attr['obj-getter'];
	            this.mapToObj = attr['map-to-obj'];
	            this.mapToDom = attr['map-to-dom'];
	            this.changeEvent = attr['change-event'] || 'change';
	
	            /* Convert to an instance, e.g. Number, on domchange event */
	            this['typeof'] = attr['typeof'] || null;
	
	            this.dismiss = 0;
	            this.bindingType = bindingType;
	            this.log = false;
	            this.signal_domChanged = null;
	            this.signal_objectChanged = null;
	            this.locked = false;
	
	            var isCompoBinder = ctr.node.parent.tagName === ctr.parent.compoName;
	            if (isCompoBinder && (element.nodeType !== 1 || element.tagName !== 'INPUT')) {
	                if (this.domSetter == null) this.domSetter = 'setValue';
	                if (this.domGetter == null) this.domGetter = 'getValue';
	                if (attr['dom-slot'] == null) attr['dom-slot'] = 'input';
	            }
	
	            if (this.property == null && this.domGetter == null) {
	
	                switch (element.tagName) {
	                    case 'INPUT':
	                        // Do not use .type accessor, as some browsers do not support e.g. date
	                        var type = element.getAttribute('type');
	                        if ('checkbox' === type) {
	                            this.property = 'element.checked';
	                            break;
	                        } else if ('date' === type || 'time' === type || 'month' === type) {
	                            var x = DomObjectTransport[type.toUpperCase()];
	                            this.domWay = x.domWay;
	                            this.objectWay = x.objectWay;
	                        } else if ('number' === type) {
	                            this['typeof'] = 'Number';
	                        } else if ('radio' === type) {
	                            var x = DomObjectTransport.RADIO;
	                            this.domWay = x.domWay;
	                            break;
	                        }
	                        this.property = 'element.value';
	                        break;
	                    case 'TEXTAREA':
	                        this.property = 'element.value';
	                        break;
	                    case 'SELECT':
	                        this.domWay = element.multiple ?
	                            DomObjectTransport.SELECT_MULT :
	                            DomObjectTransport.SELECT;
	                        break;
	                    default:
	                        this.property = 'element.innerHTML';
	                        break;
	                }
	            }
	
	            if (attr['log']) {
	                this.log = true;
	                if (attr.log !== 'log') {
	                    this.logExpression = attr.log;
	                }
	            }
	
	            // Send signal on OBJECT or DOM change
	            if (attr['x-signal']) {
	                var signals = signal_parse(attr['x-signal'], null, 'dom'),
	                    i = signals.length;
	                while (--i > -1) {
	                    var signal = signals[i],
	                        signalType = signal && signal.type;
	                    if (signalType !== 'dom' && signalType !== 'object') {
	                        log_error('Signal typs is not supported', signal);
	                        continue;
	                    }
	                    this['signal_' + signalType + 'Changed'] = signal.signal;
	                }
	            }
	
	            // Send PIPED signal on OBJECT or DOM change
	            if (attr['x-pipe-signal']) {
	                var signals = signal_parse(attr['x-pipe-signal'], true, 'dom'),
	                    i = signals.length;
	                while (--i > -1) {
	                    var signal = signals[i],
	                        signalType = signal && signal.type;
	                    if (signalType !== 'dom' && signalType !== 'object') {
	                        log_error('Pipe type is not supported', signal);
	                        continue;
	                    }
	                    this['pipe_' + signalType + 'Changed'] = signal;
	                }
	            }
	
	            var domSlot = attr['dom-slot'];
	            if (domSlot != null) {
	                this.slots = {};
	                // @hack - place dualb. provider on the way of a signal
	                //
	                var parent = ctr.parent,
	                    newparent = parent.parent;
	
	                parent.parent = this;
	                this.parent = newparent;
	                this.slots[domSlot] = function(sender, value) {
	                    this.domChanged(sender, value);
	                };
	            }
	
	            /*
	             *  @obsolete: attr name : 'x-pipe-slot'
	             */
	            var pipeSlot = attr['object-pipe-slot'] || attr['x-pipe-slot'];
	            if (pipeSlot) {
	                var str = pipeSlot,
	                    index = str.indexOf('.'),
	                    pipeName = str.substring(0, index),
	                    signal = str.substring(index + 1);
	
	                this.pipes = {};
	                this.pipes[pipeName] = {};
	                this.pipes[pipeName][signal] = function() {
	                    this.objectChanged();
	                };
	
	                __Compo.pipe.addController(this);
	            }
	
	
	            var expression = attr.expression || ctr.expression;
	            if (expression) {
	                this.expression = expression;
	                if (this.value == null && bindingType !== 'single') {
	                    var refs = expression_varRefs(this.expression);
	                    if (typeof refs === 'string') {
	                        this.value = refs;
	                    } else {
	                        log_warn('Please set value attribute in DualBind Control.');
	                    }
	                }
	                return;
	            }
	
	            this.expression = this.value;
	        },
	        dispose: function() {
	            expression_unbind(this.expression, this.model, this.ctr, this.binder);
	        },
	        objectChanged: function(x) {
	            if (this.dismiss-- > 0) {
	                return;
	            }
	            if (this.locked === true) {
	                log_warn('Concurance change detected', this);
	                return;
	            }
	            this.locked = true;
	
	            if (x == null || this.objGetter != null) {
	                x = this.objectWay.get(this, this.expression);
	            }
	            if (this.mapToDom != null) {
	                x = expression_callFn(
	                    this.mapToDom,
	                    this.model,
	                    null,
	                    this.ctr, [x]
	                );
	            }
	
	            this.domWay.set(this, x);
	
	            if (this.log) {
	                console.log('[BindingProvider] objectChanged -', x);
	            }
	            if (this.signal_objectChanged) {
	                __Compo.signal.emitOut(this.ctr, this.signal_objectChanged, this.ctr, [x]);
	            }
	            if (this.pipe_objectChanged) {
	                var pipe = this.pipe_objectChanged;
	                __Compo.pipe(pipe.pipe).emit(pipe.signal);
	            }
	
	            this.locked = false;
	        },
	        domChanged: function(event, val_) {
	            if (this.locked === true) {
	                log_warn('Concurance change detected', this);
	                return;
	            }
	            this.locked = true;
	
	            var value = val_;
	            if (value == null)
	                value = this.domWay.get(this);
	
	            var typeof_ = this['typeof'];
	            if (typeof_ != null) {
	                var Converter = window[typeof_];
	                value = Converter(value);
	            }
	            if (this.mapToObj != null) {
	                value = expression_callFn(
	                    this.mapToObj,
	                    this.model,
	                    null,
	                    this.ctr, [value]
	                );
	            }
	
	            var error = this.validate(value);
	            if (error == null) {
	                this.dismiss = 1;
	
	                var tuple = expression_getHost(this.value, this.model, null, this.ctr.parent);
	                if (tuple != null) {
	                    var obj = tuple[0],
	                        prop = tuple[1];
	                    this.objectWay.set(obj, prop, value, this);
	                }
	
	                this.dismiss = 0;
	                if (this.log) {
	                    console.log('[BindingProvider] domChanged -', value);
	                }
	                if (this.signal_domChanged != null) {
	                    __Compo.signal.emitOut(this.ctr, this.signal_domChanged, this.ctr, [value]);
	                }
	                if (this.pipe_domChanged != null) {
	                    var pipe = this.pipe_domChanged;
	                    __Compo.pipe(pipe.pipe).emit(pipe.signal);
	                }
	            }
	            this.locked = false;
	        },
	        addValidation: function(mix) {
	            if (this.validations == null) {
	                this.validations = [];
	            }
	            if (is_Array(mix)) {
	                this.validations = this.validations.concat(mix);
	                return;
	            }
	            this.validations.push(mix);
	        },
	        validate: function(val) {
	            var fns = this.validations,
	                ctr = this.ctr,
	                el = this.element;
	            if (fns == null || fns.length === 0) {
	                return null;
	            }
	            var val_ = arguments.length !== 0 ?
	                val :
	                this.domWay.get(this);
	
	            return ValidatorProvider.validateUi(
	                fns, val_, ctr, el, this.objectChanged.bind(this)
	            );
	        },
	        objectWay: DomObjectTransport.objectWay,
	        domWay: DomObjectTransport.domWay,
	    });
	
	    obj_extend(BindingProvider, {
	        create: function(model, el, ctr, bindingType) {
	
	            /* Initialize custom provider */
	            var type = ctr.attr.bindingProvider,
	                CustomProvider = type == null ? null : CustomProviders[type],
	                provider;
	
	            if (typeof CustomProvider === 'function') {
	                return new CustomProvider(model, el, ctr, bindingType);
	            }
	
	            provider = new BindingProvider(model, el, ctr, bindingType);
	
	            if (CustomProvider != null) {
	                obj_extend(provider, CustomProvider);
	            }
	            return provider;
	        },
	
	        bind: function(provider) {
	            return apply_bind(provider);
	        }
	    });
	
	    function apply_bind(provider) {
	
	        var expr = provider.expression,
	            model = provider.model,
	            onObjChanged = provider.objectChanged = provider.objectChanged.bind(provider);
	
	        provider.binder = expression_createBinder(expr, model, provider.ctx, provider.ctr, onObjChanged);
	
	        expression_bind(expr, model, provider.ctx, provider.ctr, provider.binder);
	
	        if (provider.bindingType === 'dual') {
	            var attr = provider.ctr.attr;
	
	            if (!attr['dom-slot'] && !attr['change-pipe-event']) {
	                var element = provider.element,
	                    eventType = provider.changeEvent,
	                    onDomChange = provider.domChanged.bind(provider);
	
	                __dom_addEventListener(element, eventType, onDomChange);
	            }
	
	
	            if (provider.objectWay.get(provider, provider.expression) == null) {
	                // object has no value, so check the dom
	                setTimeout(function() {
	                    if (provider.domWay.get(provider))
	                    // and apply when exists
	                        provider.domChanged();
	                });
	                return provider;
	            }
	        }
	
	        // trigger update
	        provider.objectChanged();
	        return provider;
	    }
	
	    obj_extend(BindingProvider, {
	        addObserver: obj_addObserver,
	        removeObserver: obj_removeObserver
	    });
	}());
	// end:source BindingProvider

	// source handlers/
	// source visible
	/**
	 * visible handler. Used to bind directly to display:X/none
	 *
	 * attr =
	 *    check - expression to evaluate
	 *    bind - listen for a property change
	 */
	
	function VisibleHandler() {}
	
	__registerHandler(':visible', VisibleHandler);
	
	
	VisibleHandler.prototype = {
		constructor: VisibleHandler,
	
		refresh: function(model, container) {
			container.style.display = expression_eval(this.attr.check, model) ? '' : 'none';
		},
		renderStart: function(model, cntx, container) {
			this.refresh(model, container);
	
			if (this.attr.bind) {
				obj_addObserver(model, this.attr.bind, this.refresh.bind(this, model, container));
			}
		}
	};
	
	// end:source visible
	// source validate
	var ValidationCompo;
	(function() {	
		var class_INVALID = '-validate-invalid';
	
		ValidationCompo = class_create({
	        attr: null,
			element: null,
			validators: null,
			
			constructor: function(){
				this.validators = [];
			},
			renderStart: function(model, ctx, container) {
				this.element = container;
				
				var prop = this.attr.value;
				if (prop) {
					var fn = ValidatorProvider.getFnFromModel(model, prop);
					if (fn != null) {
						this.validators.push(fn);
					}
				}
			},
			/**
			 * @param input - {control specific} - value to validate
			 * @param element - {HTMLElement} - (optional, @default this.element) -
			 *				Invalid message is schown(inserted into DOM) after this element
			 * @param oncancel - {Function} - Callback function for canceling
			 *				invalid notification
			 */
			validate: function(val, el, oncancel) {
				var element = el == null ? this.element : el,
					value   = val;
				if (arguments.length === 0) {
					value = obj_getProperty(this.model, this.attr.value);
				}
				if (this.validators.length === 0) {
					this.initValidators();
				}
				var fns = this.validators,
					type = this.attr.silent ? 'validate' : 'validateUi'
					;
				
				return ValidatorProvider[type](
					fns, value, this, element, oncancel
				);
			},
			initValidators: function() {
				var attr = this.attr,
					message = this.attr.message,
					isDefault = message == null
				
				if (isDefault) {
					message = 'Invalid value of `' + this.attr.value + '`';
				}
				for (var key in attr) {				
					switch (key) {
						case 'message':
						case 'value':
						case 'getter':
						case 'silent':
							continue;
					}				
					if (key in Validators === false) {
						log_error('Unknown Validator:', key, this);
						continue;
					}
					var str = isDefault ? (message + ' Validation: `' + key + '`') : message 
					var fn = ValidatorProvider.getFnByName(key, attr[key], str);
					if (fn != null) {
						this.validators.push(fn);
					}
				}
			}
		});
		
		__registerHandler(':validate', ValidationCompo);
		
		__registerHandler(':validate:message', Compo({
			template: 'div.' + class_INVALID + ' { span > "~[bind:message]" button > "~[cancel]" }',
			
			onRenderStart: function(model){
				if (typeof model === 'string') {
					model = {
						message: model
					};
				}
				
				if (!model.cancel) {
					model.cancel = 'cancel';
				}
				
				this.model = model;
			},
			compos: {
				button: '$: button',
			},
			show: function(message, oncancel){
				var that = this;
				
				this.model.message = message;
				this.compos.button.off().on(function(){
					that.hide();
					oncancel && oncancel();
					
				});
				
				this.$.show();
			},
			hide: function(){
				this.$.hide();
			}
		}));
		
	}());
	
	// end:source validate
	// source validate_group
	function ValidateGroup() {}
	
	__registerHandler(':validate:group', ValidateGroup);
	
	
	ValidateGroup.prototype = {
		constructor: ValidateGroup,
		validate: function() {
			var validations = getValidations(this);
	
	
			for (var i = 0, x, length = validations.length; i < length; i++) {
				x = validations[i];
				if (!x.validate()) {
					return false;
				}
			}
			return true;
		}
	};
	
	function getValidations(component, out){
		if (out == null){
			out = [];
		}
	
		if (component.components == null){
			return out;
		}
		var compos = component.components;
		for(var i = 0, x, length = compos.length; i < length; i++){
			x = compos[i];
	
			if (x.compoName === 'validate'){
				out.push(x);
				continue;
			}
	
			getValidations(x);
		}
		return out;
	}
	
	// end:source validate_group
	
	
	
	// if BROWSER
	// source bind
	/**
	 *  Mask Custom Tag Handler
	 *	attr =
	 *		attr: {String} - attribute name to bind
	 *		prop: {Stirng} - property name to bind
	 *		- : {default} - innerHTML
	 */
	
	
	
	(function() {
	
		function Bind() {}
	
		__registerHandler(':bind', Bind);
		__registerHandler( 'bind', Bind);
	
		Bind.prototype = {
			constructor: Bind,
			renderEnd: function(els, model, cntx, container){
				
				this.provider = BindingProvider.create(model, container, this, 'single');
				
				BindingProvider.bind(this.provider);
			},
			dispose: function(){
				if (this.provider && typeof this.provider.dispose === 'function') {
					this.provider.dispose();
				}
			}
		};
	
	
	}());
	
	// end:source bind
	// source dualbind
	/**
	 *	Mask Custom Handler
	 *
	 *	2 Way Data Model binding
	 *
	 *
	 *	attr =
	 *		value: {string} - property path in object
	 *		?property : {default} 'element.value' - value to get/set from/to HTMLElement
	 *		?changeEvent: {default} 'change' - listen to this event for HTMLELement changes
	 *
	 *		?setter: {string} - setter function of a parent controller
	 *		?getter: {string} - getter function of a parent controller
	 *
	 *
	 */
	var DualbindCompo = class_create({
	
		renderEnd: function(elements, model, ctx, container) {
			this.provider = BindingProvider.create(model, container, this);		
			var compos = this.components;
			if (compos != null) {
				var imax = compos.length,
					i = -1, x;
				while ( ++i < imax ){
					x = compos[i];
					if (x.compoName === ':validate') {
						this.provider.addValidation(x.validations);
					}
				}
			}
			if (this.attr['no-validation'] == null) {
				var fn = ValidatorProvider.getFnFromModel(model, this.provider.value);
				if (fn != null) {
					this.provider.addValidation(fn);
				}
			}
			BindingProvider.bind(this.provider);
		},
		dispose: function() {
			var dispose = this.provider && this.provider.dispose;
			if (dispose != null) {
				dispose.call(this.provider);
			}
		},	
		validate: function(){
			return this.provider && this.provider.validate();
		},	
		handlers: {
			attr: {
				'x-signal': function() {}
			}
		}
	});
	
	__registerHandler(':dualbind', DualbindCompo);
	__registerHandler( 'dualbind', DualbindCompo);
	// end:source dualbind
	// endif
	// end:source handlers/
	// source utilities/
	// source bind
	/**
	 *	Mask Custom Utility - for use in textContent and attribute values
	 */
	(function(){
	
		function attr_strReplace(attrValue, currentValue, newValue) {
			if (!attrValue)
				return newValue;
	
			if (currentValue == null || currentValue === '')
				return attrValue + ' ' + newValue;
	
			return attrValue.replace(currentValue, newValue);
		}
	
		function refresherDelegate_NODE(el){
			return function(value) {
				el.textContent = value;
			};
		}
		/** Attributes */
		function refresherDelegate_ATTR(el, attrName, currentValue) {
			var current_ = currentValue;
			return function(value){
				var currentAttr = el.getAttribute(attrName),
					attr = attr_strReplace(currentAttr, current_, value);
	
				if (attr == null || attr === '') {
					el.removeAttribute(attrName);
				} else {
					el.setAttribute(attrName, attr);
				}
				current_ = value;
			};
		}
		function refresherDelegate_ATTR_COMPO(ctr, attrName, currentValue) {
			var current_ = currentValue;
			return function(val){
				if (current_ === val) {
					return;
				}
				current_ = val;
				var fn = ctr.setAttribute;
				if (is_Function(fn)) {
					fn.call(ctr, attrName, val);
					return;
				}
				ctr.attr[attrName] = val;
			};
		}
		function refresherDelegate_ATTR_PROP(element, attrName, currentValue) {
			return function(value){
				switch(typeof element[attrName]) {
					case 'boolean':
						currentValue = element[attrName] = !!value;
						return;
					case 'number':
						currentValue = element[attrName] = Number(value);
						return;
					case 'string':
						currentValue = element[attrName] = attr_strReplace(element[attrName], currentValue, value);
						return;
					default:
						log_warn('Unsupported elements property type', attrName);
						return;
				}
			};
		}
	
		/** Properties */
		function refresherDelegate_PROP_NODE(el, property, currentValue) {
			return function(value){			
				obj_setProperty(el, property, value);
			};
		}
		function refresherDelegate_PROP_COMPO(ctr, property, currentValue) {
			var current_ = currentValue;
			return function(val){
				if (current_ === val) {
					return;
				}
				current_ = val;
				obj_setProperty(ctr, property, val);
			};
		}
	
		function create_refresher(type, expr, element, currentValue, attrName, ctr) {
			if ('node' === type) {
				return refresherDelegate_NODE(element);
			}
			if ('attr' === type) {
				switch(attrName) {
					case 'value':
					case 'disabled':
					case 'checked':
					case 'selected':
					case 'selectedIndex':
						if (attrName in element) {
							return refresherDelegate_ATTR_PROP(element, attrName, currentValue);
						}
				}
				return refresherDelegate_ATTR(element, attrName, currentValue);
			}
			if ('prop' === type) {
				return refresherDelegate_PROP_NODE(element, attrName, currentValue);
			}
			if ('compo-attr' === type) {
				return refresherDelegate_ATTR_COMPO(ctr, attrName, currentValue)
			}
			if ('compo-prop' === type) {
				return refresherDelegate_PROP_COMPO(ctr, attrName, currentValue)
			}
			throw Error('Unexpected binder type: ' + type);
		}
	
	
		function bind (current, expr, model, ctx, element, ctr, attrName, type){
			var	refresher =  create_refresher(type, expr, element, current, attrName, ctr),
				binder = expression_createBinder(expr, model, ctx, ctr, refresher);
	
			expression_bind(expr, model, ctx, ctr, binder);
	
			compo_attachDisposer(ctr, function(){
				expression_unbind(expr, model, ctr, binder);
			});
		}
	
		__registerUtil('bind', {
			mode: 'partial',
			current: null,
			element: null,
			nodeRenderStart: function(expr, model, ctx, el, ctr, type, node){
	
				var current = expression_eval(expr, model, ctx, ctr, node);
	
				// though we apply value's to `this` context, but it is only for immediat use
				// in .node() function, as `this` context is a static object that share all bind
				// utils
				this.element = document.createTextNode(current);
	
				return (this.current = current);
			},
			node: function(expr, model, ctx, container, ctr){
				var el = this.element,
					val = this.current;
				bind(
					val
					, expr
					, model
					, ctx
					, el
					, ctr
					, null
					, 'node'
				);
				this.element = null;
				this.current = null;
				return el;
			},
	
			attrRenderStart: function(expr, model, ctx, el, ctr, type, node){
				return (this.current = expression_eval(expr, model, ctx, ctr, node));
			},
			attr: function(expr, model, ctx, element, controller, attrName, type){
				bind(
					this.current,
					expr,
					model,
					ctx,
					element,
					controller,
					attrName,
					type);
	
				return this.current;
			}
		});
	
	}());
	
	// end:source bind
	// end:source utilities/
	// source attributes/
	// source xxVisible
	__registerAttr('xx-visible', function(node, attrValue, model, ctx, el, ctr) {
	
		var binder = expression_createBinder(attrValue, model, ctx, ctr, function(value){
			el.style.display = value ? '' : 'none';
		});
	
		expression_bind(attrValue, model, ctx, ctr, binder);
	
		compo_attachDisposer(ctr, function(){
			expression_unbind(attrValue, model, ctr, binder);
		});
	
		if (!expression_eval(attrValue, model, ctx, ctr, node)) {
			el.style.display = 'none';
		}
	});
	// end:source xxVisible
	// source xToggle
	/**
	 *	Toggle value with ternary operator on an event.
	 *
	 *	button x-toggle='click: foo === "bar" ? "zet" : "bar" > 'Toggle'
	 */
	__registerAttr('x-toggle', 'client', function(node, attrValue, model, ctx, el, ctr){
	    var event = attrValue.substring(0, attrValue.indexOf(':')),
	        expression = attrValue.substring(event.length + 1),
	        ref = expression_varRefs(expression);
	    
		if (typeof ref !== 'string') {
			// assume is an array
			ref = ref[0];
		}
		
	    __dom_addEventListener(el, event, function(){
	        var val = expression_eval(expression, model, ctx, ctr, node);
	        obj_setProperty(model, ref, val);
	    });
	});
	
	// end:source xToggle
	// source xClassToggle
	/**
	 *	Toggle Class Name
	 *
	 *	button x-toggle='click: selected'
	 */
	
	__registerAttr('x-class-toggle', 'client', function(node, attrVal, model, ctx, element){
	    
	    var event = attrVal.substring(0, attrVal.indexOf(':')),
	        klass = attrVal.substring(event.length + 1).trim();
	    
		
	    __dom_addEventListener(element, event, function(){
	         domLib(element).toggleClass(klass);
	    });
	});
	
	// end:source xClassToggle
	// end:source attributes/
	// source statements/
	(function(){
		var custom_Statements = mask.getStatement();
	
		// source 1.utils.js
		var _getNodes,
			_renderPlaceholder,
			_compo_initAndBind,
			els_toggleVisibility
			;
		
		(function(){
			_getNodes = function(name, node, model, ctx, controller){
				return custom_Statements[name].getNodes(node, model, ctx, controller);
			};
			_renderPlaceholder = function(staticCompo, compo, container){
				var placeholder = staticCompo.placeholder;
				if (placeholder == null) {
					placeholder = document.createComment('');
					container.appendChild(placeholder);
				}
				compo.placeholder = placeholder;
			};
		
			_compo_initAndBind = function(compo, node, model, ctx, container, controller) {
				compo.parent = controller;
				compo.model = model;
				compo.ctx = ctx;
				compo.refresh = fn_proxy(compo.refresh, compo);
				compo.binder = expression_createBinder(
					compo.expr || compo.expression,
					model,
					ctx,
					controller,
					compo.refresh
				);
				expression_bind(compo.expr || compo.expression, model, ctx, controller, compo.binder);
			};
		
			(function(){
				els_toggleVisibility = function(mix, state){
					if (mix == null)
						return;
					if (is_Array(mix)) {
						_arr(mix, state);
						return;
					}
					_single(mix, state);
				};
				function _single(el, state) {
					el.style.display = state ? '' : 'none';
				}
				function _arr(els, state) {
					var imax = els.length, i = -1;
					while (++i < imax) _single(els[i], state);
				}
			}());
		}());
		// end:source 1.utils.js
		// source 2.if.js
		(function(){
			__registerHandler('+if', {
				placeholder: null,
				meta: {
					serializeNodes: true
				},
				render: function(model, ctx, container, ctr, children){
					var node = this,
						nodes = _getNodes('if', node, model, ctx, ctr),
						index = 0,
						next = node;
					while(next.nodes !== nodes){
						index++;
						next = node.nextSibling;
						if (next == null || next.tagName !== 'else') {
							index = null;
							break;
						}
					}
					this.attr['switch-index'] = index;
					return compo_renderElements(nodes, model, ctx, container, ctr, children);
				},
		
				renderEnd: function(els, model, ctx, container, ctr){
					var compo = new IFStatement(),
						index = this.attr['switch-index'];
		
					_renderPlaceholder(this, compo, container);
					return initialize(
						compo
						, this
						, index
						, els
						, model
						, ctx
						, container
						, ctr
					);
				},
		
				serializeNodes: function(current){
					var nodes = [ current ];
					while (true) {
						current = current.nextSibling;
						if (current == null || current.tagName !== 'else') {
							break;
						}
						nodes.push(current);
					}
					return mask.stringify(nodes);
				}
		
			});
		
		
			function IFStatement() {}
		
			IFStatement.prototype = {
				compoName: '+if',
				ctx : null,
				model : null,
				controller : null,
		
				index : null,
				Switch : null,
				binder : null,
		
				refresh: function() {
					var currentIndex = this.index,
						model = this.model,
						ctx = this.ctx,
						ctr = this.controller,
						switch_ = this.Switch,
						imax = switch_.length,
						i = -1;
					while ( ++i < imax ){
						var node = switch_[i].node;
						var expr = node.expression;
						if (expr == null)
							break;				
						if (expression_eval(expr, model, ctx, ctr, node))
							break;
					}
		
					if (currentIndex === i)
						return;
		
					if (currentIndex != null)
						els_toggleVisibility(switch_[currentIndex].elements, false);
		
					if (i === imax) {
						this.index = null;
						return;
					}
		
					this.index = i;
		
					var current = switch_[i];
					if (current.elements != null) {
						els_toggleVisibility(current.elements, true);
						return;
					}
		
					var nodes = current.node.nodes,
						frag = document.createDocumentFragment(),
						owner = { components: [], parent: ctr },
						els = compo_renderElements(nodes, model, ctx, frag, owner);
		
					dom_insertBefore(frag, this.placeholder);
					current.elements = els;
		
					compo_inserted(owner);
					if (ctr.components == null) {
						ctr.components = [];
					}
					ctr.components.push.apply(ctr.components, owner.components);
				},
				dispose: function(){
					var switch_ = this.Switch,
						imax = switch_.length,
						i = -1,
		
						x, expr;
		
					while( ++i < imax ){
						x = switch_[i];
						expr = x.node.expression;
		
						if (expr) {
							expression_unbind(
								expr,
								this.model,
								this.controller,
								this.binder
							);
						}
		
						x.node = null;
						x.elements = null;
					}
		
					this.controller = null;
					this.model = null;
					this.ctx = null;
				}
			};
		
			function initialize(compo, node, index, elements, model, ctx, container, ctr) {
		
				compo.model = model;
				compo.ctx = ctx;
				compo.controller = ctr;
				compo.refresh = fn_proxy(compo.refresh, compo);
				compo.binder = expression_createListener(compo.refresh);
				compo.index = index;
				compo.Switch = [{
					node: node,
					elements: null
				}];
		
				expression_bind(node.expression, model, ctx, ctr, compo.binder);
		
				while (true) {
					node = node.nextSibling;
					if (node == null || node.tagName !== 'else')
						break;
		
					compo.Switch.push({
						node: node,
						elements: null
					});
		
					if (node.expression)
						expression_bind(node.expression, model, ctx, ctr, compo.binder);
				}
				if (index != null) {
					compo.Switch[index].elements = elements;
				}
				return compo;
			}
		
		
		}());
		// end:source 2.if.js
		// source 3.switch.js
		(function(){
		
			var $Switch = custom_Statements['switch'],
				attr_SWITCH = 'switch-index'
				;
		
			var _nodes,
				_index;
		
			__registerHandler('+switch', {
				meta: {
					serializeNodes: true
				},
				serializeNodes: function(current){
					return mask.stringify(current);
				},
				render: function(model, ctx, container, ctr, children){
					var value = expression_eval(this.expression, model, ctx, ctr);
		
					resolveNodes(value, this.nodes, model, ctx, ctr);
					var nodes = _nodes,
						index = _index;
		
					if (nodes == null) {
						return null;
					}
		
					this.attr[attr_SWITCH] = index;
					return compo_renderElements(nodes, model, ctx, container, ctr, children);
				},
		
				renderEnd: function(els, model, ctx, container, ctr){
		
					var compo = new SwitchStatement(),
						index = this.attr[attr_SWITCH];
		
					_renderPlaceholder(this, compo, container);
		
					return initialize(
						compo
						, this
						, index
						, els
						, model
						, ctx
						, container
						, ctr
					);
				}
			});
		
		
			function SwitchStatement() {}
		
			SwitchStatement.prototype = {
				compoName: '+switch',
				ctx: null,
				model: null,
				controller: null,
		
				index: null,
				nodes: null,
				Switch: null,
				binder: null,
		
				refresh: function(value) {
		
					var compo = this,
						Switch = compo.Switch,
						model = compo.model,
						ctx = compo.ctx,
						ctr = compo.controller
						;
		
					resolveNodes(value, compo.nodes, model, ctx, ctr);
					var nodes = _nodes,
						index = _index;
		
					if (index === compo.index) {
						return;
					}
					if (compo.index != null) {
						els_toggleVisibility(Switch[compo.index], false);
					}
		
					compo.index = index;			
					if (index == null) {
						return;
					}
		
					var elements = Switch[index];
					if (elements != null) {
						els_toggleVisibility(elements, true);
						return;
					}
		
					var result = mask.render(nodes, model, ctx, null, ctr);
					Switch[index] = result.nodeType === Node.DOCUMENT_FRAGMENT_NODE
						? _Array_slice.call(result.childNodes)
						: result
						;
					dom_insertBefore(result, compo.placeholder);
				},
				dispose: function(){
					expression_unbind(
						this.expr,
						this.model,
						this.controller,
						this.binder
					);
		
					this.controller = null;
					this.model = null;
					this.ctx = null;
		
					var switch_ = this.Switch,
						key,
						els, i, imax
						;
		
					for(key in switch_) {
						els = switch_[key];
		
						if (els == null)
							continue;
		
						imax = els.length;
						i = -1;
						while ( ++i < imax ){
							if (els[i].parentNode != null)
								els[i].parentNode.removeChild(els[i]);
						}
					}
				}
			};
		
			function resolveNodes(val, nodes, model, ctx, ctr) {
		
				_nodes = $Switch.getNodes(val, nodes, model, ctx, ctr);
				_index = null;
		
				if (_nodes == null)
					return;
		
				var imax = nodes.length,
					i = -1;
				while( ++i < imax ){
					if (nodes[i].nodes === _nodes)
						break;
				}
		
				_index = i === imax ? null : i;
			}
		
			function initialize(compo, node, index, elements, model, ctx, container, ctr) {
		
				compo.ctx = ctx;
				compo.expr = node.expression;
				compo.model = model;
				compo.controller = ctr;
				compo.index = index;
				compo.nodes = node.nodes;
		
				compo.refresh = fn_proxy(compo.refresh, compo);
				compo.binder = expression_createBinder(
					compo.expr,
					model,
					ctx,
					ctr,
					compo.refresh
				);
		
				compo.Switch = new Array(node.nodes.length);
		
				if (index != null) {
					compo.Switch[index] = elements;
				}
				expression_bind(node.expression, model, ctx, ctr, compo.binder);
		
				return compo;
			}
		
		
		}());
		// end:source 3.switch.js
		// source 4.with.js
		(function(){
			__registerHandler('+with', {
				meta: {
					serializeNodes: true
				},
				rootModel: null,
				render: function(model, ctx, container, ctr){
					var expr = this.expression,
						nodes = this.nodes,
						val = expression_eval_strict(
							expr, model, ctx, ctr
						)
						;
					this.rootModel = model;
					return compo_renderElements(nodes, val, ctx, container, ctr);
				},
				onRenderStartClient: function(model, ctx){
					this.rootModel = model;
					this.model = expression_eval_strict(
						this.expression, model, ctx, this
					);
				},
				renderEnd: function(els, model_, ctx, container, ctr){
					var model = this.rootModel || model_,
						compo = new WithStatement(this);
		
					compo.elements = els;
					compo.model = model;
					compo.parent = ctr;
					compo.refresh = fn_proxy(compo.refresh, compo);
					compo.binder = expression_createBinder(
						compo.expr,
						model,
						ctx,
						ctr,
						compo.refresh
					);
					expression_bind(
						compo.expr,
						model,
						ctx,
						ctr,
						compo.binder
					);
					_renderPlaceholder(this, compo, container);
					return compo;
				}
			});
		
			function WithStatement(node){
				this.expr = node.expression;
				this.nodes = node.nodes;
			}
			WithStatement.prototype = {
				compoName: '+with',
				elements: null,
				binder: null,
				model: null,
				parent: null,
				refresh: function(model){
					compo_disposeChildren(this);
					compo_renderChildren(this, this.placeholder, model);
				},
				dispose: function(){
					expression_unbind(
						this.expr,
						this.model,
						this.parent,
						this.binder
					);
					this.parent = null;
					this.model = null;
					this.ctx = null;
				}
			};
		}());
		// end:source 4.with.js
		// source 5.visible.js
		(function(){
			var $Visible = custom_Statements['visible'];
				
			__registerHandler('+visible', {
				meta: {
					serializeNodes: true
				},
				render: function(model, ctx, container, ctr, childs){
					return build(this.nodes, model, ctx, container, ctr);
				},
				renderEnd: function(els, model, ctx, container, ctr){
					
					var compo = new VisibleStatement(this);
					compo.elements = els;
					compo.model = model;
					compo.parent = ctr;
					compo.refresh = fn_proxy(compo.refresh, compo);
					compo.binder = expression_createBinder(
						compo.expr,
						model,
						ctx,
						ctr,
						compo.refresh
					);
					
					expression_bind(compo.expr, model, ctx, ctr, compo.binder);
					compo.refresh();
					return compo;
				}
			});
			
			
			function VisibleStatement(node){
				this.expr = node.expression;
				this.nodes = node.nodes;
			}
			
			VisibleStatement.prototype = {
				compoName: '+visible',
				elements: null,
				binder: null,
				model: null,
				parent: null,
				refresh: function(){
					var isVisible = expression_eval(
						this.expr, this.model, this.ctx, this
					);
					$Visible.toggle(this.elements, isVisible);
				},
				dispose: function(){
					expression_unbind(
						this.expr,
						this.model,
						this.parent,
						this.binder
					);
				
					this.parent = null;
					this.model = null;
					this.ctx = null;
				}
				
			};
			
			function build(nodes, model, ctx, container, ctr){
				var els = [];
				builder_build(nodes, model, ctx, container, ctr, els);
				return els;
			}
		}());
		// end:source 5.visible.js
		// source 6.listen.js
		(function(){
			__registerHandler('listen', class_create({
				disposed: false,
				placeholder: null,
				compoName: 'listen',
				show: null,
				hide: null,
				binder: null,
				meta: {
					serializeNodes: true,
					attributes: {
						animatable: false,
						on: false,
						rx: false,
					}
				},
				renderEnd: function(els, model, ctx, container, ctr){
					_renderPlaceholder(this, this, container);
		
					var fn = Boolean(this.attr.animatable)
						? this.refreshAni
						: this.refreshSync;
		
					this.refresh = fn_proxy(fn, this);
					this.elements = els;
		
					var Ctor = this.getBinder();
					this.binder = new Ctor(this.expression, model, this);
					this.binder.bind(this.refresh);
				},
				getBinder: function(){
					if (this.attr.on) {
						return Binders.EventEmitterBinder;
					}
					if (this.attr.rx) {
						return Binders.RxBinder;
					}
					return Binders.ExpressionBinder;
				},
				dispose: function(){
					this.binder.dispose();
		
					this.disposed = true;
					this.elements = null;
					this.parent = null;
					this.model = null;
					this.ctx = null;
				},
				refresh: function(){
					throw new Error('Should be defined');
				},
				refreshSync: function(){
					compo_disposeChildren(this);
					this.create();
				},
				create: function(){
					compo_renderChildren(this, this.placeholder);
				},
				refreshAni: function(){
					var x = compo_transferChildren(this);
					var me = this;
					var show = me.getAni('show');
					var hide = me.getAni('hide');
					if (this.attr.animatable === 'parallel') {
						show.start(me.create());
						hide.start(x.elements, function(){
							compo_dispose(x);
						});
						return;
					}
					hide.start(x.elements, function(){
						if (me.disposed === true) {
							return;
						}
						compo_dispose(x);
						show.start(me.create());
					});
				},
				getAni: function (name) {
					var x = this[name];
					if (x != null) {
						return x;
					}
					var ani = Compo.child('Animation#' + name);
					if (ani != null) {
						return (this[name] = ani.start.bind(ani));
					}
		
				},
			}));
		}());
		// end:source 6.listen.js
		// source loop/exports.js
		(function(){
			
			// source utils.js
			var arr_createRefs,
				list_sort,
				list_update,
				list_remove;
			(function() {
				arr_createRefs = function(array){
					var imax = array.length,
						i = -1;
					while ( ++i < imax ){
						//create references from values to distinguish the models
						var x = array[i];
						switch (typeof x) {
						case 'string':
						case 'number':
						case 'boolean':
							array[i] = Object(x);
							break;
						}
					}
				};
				list_sort = function(self, array){
			
					var compos = self.node.components,
						i = 0,
						imax = compos.length,
						j = 0,
						jmax = null,
						element = null,
						compo = null,
						fragment = document.createDocumentFragment(),
						sorted = [];
			
					for (; i < imax; i++) {
						compo = compos[i];
						if (compo.elements == null || compo.elements.length === 0) 
							continue;
						
						for (j = 0, jmax = compo.elements.length; j < jmax; j++) {
							element = compo.elements[j];
							element.parentNode.removeChild(element);
						}
					}
					
					outer: for (j = 0, jmax = array.length; j < jmax; j++) {
			
						for (i = 0; i < imax; i++) {
							if (array[j] === self._getModel(compos[i])) {
								sorted[j] = compos[i];
								continue outer;
							}
						}
						console.warn('No Model Found for', array[j]);
					}
			
					for (i = 0, imax = sorted.length; i < imax; i++) {
						compo = sorted[i];
			
						if (compo.elements == null || compo.elements.length === 0) {
							continue;
						}
			
						for (j = 0, jmax = compo.elements.length; j < jmax; j++) {
							element = compo.elements[j];
			
							fragment.appendChild(element);
						}
					}
			
					self.components = self.node.components = sorted;
					dom_insertBefore(fragment, self.placeholder);
				};
				list_update = function(self, deleteIndex, deleteCount, insertIndex, rangeModel){
					
					var node = self.node,
						compos = node.components
						;
					if (compos == null) 
						compos = node.components = []
					
					var prop1 = self.prop1,
						prop2 = self.prop2,
						type = self.type,
						
						ctx = self.ctx,
						ctr = self.node
						;
					
					if (deleteIndex != null && deleteCount != null) {
						var i = deleteIndex,
							length = deleteIndex + deleteCount;
			
						if (length > compos.length) 
							length = compos.length;
						
						for (; i < length; i++) {
							if (compo_dispose(compos[i], node)){
								i--;
								length--;
							}
						}
					}
			
					if (insertIndex != null && rangeModel && rangeModel.length) {
			
						var i = compos.length,
							imax,
							fragment = self._build(node, rangeModel, ctx, ctr),
							new_ = compos.splice(i)
							; 
						compo_fragmentInsert(node, insertIndex, fragment, self.placeholder);
						
						compos.splice.apply(compos, [insertIndex, 0].concat(new_));
						i = 0;
						imax = new_.length;
						for(; i < imax; i++){
							__Compo.signal.emitIn(new_[i], 'domInsert');
						}
					}
				};
				list_remove = function(self, removed){
					var compos = self.components,
						i = compos.length;
					while(--i > -1){
						var x = compos[i];
						if (removed.indexOf(x.model) === -1) {
							continue;
						}
						compo_dispose(x, self.node);
					}
				};
			
			}());
			// end:source utils.js
			// source proto.js
			var LoopStatementProto = {
				ctx: null,
				model: null,
				parent: null,
				binder: null,
				refresh: function(value, method, args, result){
					var i = 0,
						x, imax;
						
					var node = this.node,
						
						model = this.model,
						ctx = this.ctx,
						ctr = this.node
						;
			
					if (method == null) {
						// this was new array/object setter and not an immutable function call
						
						var compos = node.components;
						if (compos != null) {
							var imax = compos.length,
								i = -1;
							while ( ++i < imax ){
								if (compo_dispose(compos[i], node)){
									i--;
									imax--;
								}
							}
							compos.length = 0;
						}
						
						var frag = this._build(node, value, ctx, ctr);
						
						dom_insertBefore(frag, this.placeholder);
						arr_each(node.components, compo_inserted);
						return;
					}
			
					var array = value;
					arr_createRefs(value);
					
			
					switch (method) {
					case 'push':
						list_update(this, null, null, array.length - 1, array.slice(array.length - 1));
						break;
					case 'pop':
						list_update(this, array.length, 1);
						break;
					case 'unshift':
						list_update(this, null, null, 0, array.slice(0, 1));
						break;
					case 'shift':
						list_update(this, 0, 1);
						break;
					case 'splice':
						var sliceStart = args[0],
							sliceRemove = args.length === 1 ? this.components.length : args[1],
							sliceAdded = args.length > 2 ? array.slice(args[0], args.length - 2 + args[0]) : null;
			
						list_update(this, sliceStart, sliceRemove, sliceStart, sliceAdded);
						break;
					case 'sort':
					case 'reverse':
						list_sort(this, array);
						break;
					case 'remove':
						if (result != null && result.length) 
							list_remove(this, result);
						break;
					}
				},
				
				dispose: function(){
					
					expression_unbind(
						this.expr || this.expression, this.model, this.parent, this.binder
					);
				}
			};
			
			// end:source proto.js
			// source for.js
			(function(){
				
				var For = custom_Statements['for'],
				
					attr_PROP_1 = 'for-prop-1',
					attr_PROP_2 = 'for-prop-2',
					attr_TYPE = 'for-type',
					attr_EXPR = 'for-expr'
					;
					
				
				__registerHandler('+for', {
					meta: {
						serializeNodes: true
					},
					serializeNodes: function(node){
						return mask.stringify(node);
					},
					render: function(model, ctx, container, ctr, children){
						var directive = For.parseFor(this.expression),
							attr = this.attr;
						
						attr[attr_PROP_1] = directive[0];
						attr[attr_PROP_2] = directive[1];
						attr[attr_TYPE] = directive[2];
						attr[attr_EXPR] = directive[3];
						
						var value = expression_eval_strict(directive[3], model, ctx, ctr);
						if (value == null) 
							return;
						
						if (is_Array(value)) 
							arr_createRefs(value);
						
						For.build(
							value,
							directive,
							this.nodes,
							model,
							ctx,
							container,
							this,
							children
						);
					},
					
					renderEnd: function(els, model, ctx, container, ctr){
						
						var compo = new ForStatement(this, this.attr);
						_renderPlaceholder(this, compo, container);			
						_compo_initAndBind(compo, this, model, ctx, container, ctr);
						return compo;
					},
					
					getHandler: function(name, model){
						
						return For.getHandler(name, model);
					}
					
				});
				
				function initialize(compo, node, els, model, ctx, container, ctr) {
					
					compo.parent = ctr;
					compo.model = model;
					
					compo.refresh = fn_proxy(compo.refresh, compo);
					compo.binder = expression_createBinder(
						compo.expr,
						model,
						ctx,
						ctr,
						compo.refresh
					);
					
					
					expression_bind(compo.expr, model, ctx, ctr, compo.binder);
					
				}
				
				function ForStatement(node, attr) {
					this.prop1 = attr[attr_PROP_1];
					this.prop2 = attr[attr_PROP_2];
					this.type = attr[attr_TYPE];
					this.expr = attr[attr_EXPR];
					
					if (node.components == null) 
						node.components = [];
					
					this.node = node;
					this.components = node.components;
				}
				
				ForStatement.prototype = {
					compoName: '+for',
					model: null,
					parent: null,
					
					refresh: LoopStatementProto.refresh,
					dispose: LoopStatementProto.dispose,
					
					_getModel: function(compo) {
						return compo.scope[this.prop1];
					},
					
					_build: function(node, model, ctx, component) {
						var nodes = For.getNodes(node.nodes, model, this.prop1, this.prop2, this.type);
						
						return builder_build(nodes, this.model, ctx, null, component);
					}
				};
				
			}());
			// end:source for.js
			// source each.js
			(function(){
				
				var Each = custom_Statements['each'];
				var EachBinded =  {
					meta: {
						serializeNodes: true
					},
					serializeNodes: function(node){
						return mask.stringify(node);
					},
					//modelRef: null,
					render: function(model, ctx, container, ctr, children){
						//this.modelRef = this.expression;
						var array = expression_eval(this.expression, model, ctx, ctr);
						if (array == null) 
							return;
						
						arr_createRefs(array);
						
						build(
							this.nodes,
							array,
							ctx,
							container,
							this,
							children
						);
					},
					
					renderEnd: function(els, model, ctx, container, ctr){
						var compo = new EachStatement(this, this.attr);
						
						_renderPlaceholder(this, compo, container);
						_compo_initAndBind(compo, this, model, ctx, container, ctr);
						return compo;
					}
					
				};
				
				var EachItem = class_create({
					compoName: 'each::item',
					scope: null,
					model: null,
					modelRef: null,
					parent: null,
			
					// if BROWSER
					renderStart: null,
					// endif
					renderEnd: function(els) {
						this.elements = els;
					},
					dispose: function(){
						if (this.elements != null) {
							this.elements.length = 0;
							this.elements = null;
						}
					}
				});
				
				var EachStatement = class_create(LoopStatementProto, {
					compoName: '+each',
					constructor: function EachStatement(node, attr) {
						this.expression = node.expression;
						this.nodes = node.nodes;
						
						if (node.components == null) 
							node.components = [];
						
						this.node = node;
						this.components = node.components;
					},		
					_getModel: function(compo) {
						return compo.model;
					},		
					_build: function(node, model, ctx, component) {
						var fragment = document.createDocumentFragment();
						
						build(node.nodes, model, ctx, fragment, component);
						
						return fragment;
					}
				});
				
				// METHODS
				
				function build(nodes, array, ctx, container, ctr, elements) {
					var imax = array.length,
						nodes_ = new Array(imax),
						i = 0, node;
					
					for(; i < imax; i++) {
						node = createEachNode(nodes, i);
						builder_build(node, array[i], ctx, container, ctr, elements);
					}
				}
				
				function createEachNode(nodes, index){
					var item = new EachItem;
					item.scope = { index: index };
					
					return {
						type: Dom.COMPONENT,
						tagName: 'each::item',
						nodes: nodes,
						controller: function() {
							return item;
						}
					};
				}
				
				// EXPORTS
				
				__registerHandler('each::item', EachItem);
				__registerHandler('+each', EachBinded);
			}());
			// end:source each.js
			
		}());
		
		// end:source loop/exports.js
		
	}());
	// end:source statements/

	// source api/utils
	obj_extend(mask.obj, {
		addObserver   : obj_addObserver,
		removeObserver: obj_removeObserver,
	});
	// end:source api/utils

}(typeof window !== 'undefined' && window.navigator ? window : global, mask));
