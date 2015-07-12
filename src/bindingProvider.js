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
			
			var attr = ctr.attr,
				type;
	
			this.node = ctr; // backwards compat.
			this.ctr = ctr;
			this.ctx = null;
	
			this.model = model;
			this.element = element;
			this.value = attr.value;
			this.property = attr.property;
			this.domSetter = attr.setter || attr['dom-setter'];
			this.domGetter = attr.getter || attr['dom-getter'];
			this.objSetter = attr['obj-setter'];
			this.objGetter = attr['obj-getter'];
			
			/* Convert to an instance, e.g. Number, on domchange event */
			this['typeof'] = attr['typeof'] || null;
			
			this.dismiss = 0;
			this.bindingType = bindingType;
			this.log = false;
			this.signal_domChanged = null;
			this.signal_objectChanged = null;
			this.locked = false;
			
			
			if (this.property == null && this.domGetter == null) {
	
				switch (element.tagName) {
					case 'INPUT':
						type = element.getAttribute('type');
						if ('checkbox' === type) {
							this.property = 'element.checked';
							break;
						}
						else if ('date' === type) {
							var x = DomObjectTransport.DATE;
							this.domWay = x.domWay;
							this.objectWay = x.objectWay;
						}
						else if ('number' === type) {
							this['typeof'] = 'Number';
						}
						else if ('radio' === type) {
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
						this.domWay = element.multiple
							? DomObjectTransport.SELECT_MULT
							: DomObjectTransport.SELECT;
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
				var signal = signal_parse(attr['x-signal'], null, 'dom')[0],
					signalType = signal && signal.type;
				
				switch(signalType){
					case 'dom':
					case 'object':
						this['signal_' + signalType + 'Changed'] = signal.signal;
						break;
					default:
						log_error('Signal typs is not supported', signal);
						break;
				}
			}
			
			// Send PIPED signal on OBJECT or DOM change
			if (attr['x-pipe-signal']) {
				var signal = signal_parse(attr['x-pipe-signal'], true, 'dom')[0],
					signalType = signal && signal.type;
					
				switch(signalType){
					case 'dom':
					case 'object':
						this['pipe_' + signalType + 'Changed'] = signal;
						break;
					default:
						log_error('Pipe type is not supported');
						break;
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
				this.slots[domSlot] = function(sender, value){
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
				this.pipes[pipeName][signal] = function(){
					this.objectChanged();
				};
				
				__Compo.pipe.addController(this);
			}
	
	
			if (attr.expression) {
				this.expression = attr.expression;
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

			if (x == null) {
				x = this.objectWay.get(this, this.expression);
			}

			this.domWay.set(this, x);

			if (this.log) {
				console.log('[BindingProvider] objectChanged -', x);
			}
			if (this.signal_objectChanged) {
				signal_emitOut(this.ctr, this.signal_objectChanged, [x]);
			}			
			if (this.pipe_objectChanged) {
				var pipe = this.pipe_objectChanged;
				__Compo.pipe(pipe.pipe).emit(pipe.signal);
			}

			this.locked = false;
		},
		domChanged: function(event, value) {
			if (this.locked === true) {
				log_warn('Concurance change detected', this);
				return;
			}
			this.locked = true;

			if (value == null) 
				value = this.domWay.get(this);
			
			var typeof_ = this['typeof'];
			if (typeof_ != null) {
				var Converter = window[typeof_];
				value = Converter(value);
			}
			
			var error = this.validate(value);
			if (error == null) {
				this.dismiss = 1;
				var obj = this.model;
				var prop = this.value;
				if (prop.charCodeAt(0) === 36 /*$*/) {
					var i = prop.indexOf('.');
					if (i !== -1) {
						var key = prop.substring(0, i);
						if (key === '$scope') {
							prop = prop.substring(i + 1);
							obj = compo_getScopeFor(this.ctr.parent, prop);
						}
					}
				}
				
				this.objectWay.set(obj, prop, value, this);
				this.dismiss = 0;

				if (this.log) {
					console.log('[BindingProvider] domChanged -', value);
				}
				if (this.signal_domChanged != null) {
					signal_emitOut(this.ctr, this.signal_domChanged, [value]);
				}
				if (this.pipe_domChanged != null) {
					var pipe = this.pipe_domChanged;
					__Compo.pipe(pipe.pipe).emit(pipe.signal);
				}	
			}
			this.locked = false;
		},
		addValidation: function(mix){
			if (this.validations == null) {
				this.validations = [];
			}
			if (is_Array(mix)) {
				this.validations = this.validations.concat(mix);
				return;
			}
			this.validations.push(mix);
		},
		validate: function (val) {
			var fns = this.validations,
				ctr = this.ctr,
				el = this.element
				;
			if (fns == null || fns.length === 0) {
				return null;
			}
			var val_ = arguments.length !== 0
				? val
				: this.domWay.get(this);
			
			return ValidatorProvider.validateUi(
				fns, val_, ctr, el, this.objectChanged.bind(this)
			);
		},
		objectWay: DomObjectTransport.objectWay,
		domWay: DomObjectTransport.domWay,
	});
		
	
	obj_extend(BindingProvider, {
		create: function (model, el, ctr, bindingType) {
	
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
		
		bind: function (provider){
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
			
			if (!attr['change-slot'] && !attr['change-pipe-event']) {
				var element = provider.element,
					/*
					 * @obsolete: attr name : 'changeEvent'
					 */
					eventType = attr['change-event'] || attr.changeEvent || 'change',
					onDomChange = provider.domChanged.bind(provider);
	
				__dom_addEventListener(element, eventType, onDomChange);
			}
			
				
			if (!provider.objectWay.get(provider, provider.expression)) {
				// object has no value, so check the dom
				setTimeout(function(){
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

	function signal_emitOut(ctr, signal, args) {
		if (ctr == null) 
			return;
		
		var slots = ctr.slots;
		if (slots != null && typeof slots[signal] === 'function') {
			if (slots[signal].apply(ctr, args) === false) 
				return;
		}
		
		signal_emitOut(ctr.parent, signal, args);
	}
	
	
	obj_extend(BindingProvider, {
		addObserver: obj_addObserver,
		removeObserver: obj_removeObserver
	});
}());
