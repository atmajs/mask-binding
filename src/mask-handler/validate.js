(function() {
	
	var class_INVALID = '-validate-invalid';

	mask.registerValidator = function(type, validator) {
		Validators[type] = validator;
	};

	function Validate() {}

	mask.registerHandler(':validate', Validate);




	Validate.prototype = {
		constructor: Validate,
        attr: {},
		renderStart: function(model, cntx, container) {
			this.element = container;
			
			if (this.attr.value) {
				var validatorFn = Validate.resolveFromModel(model, this.attr.value);
					
				if (validatorFn) {
					this.validators = [new Validator(validatorFn)];
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
		validate: function(input, element, oncancel) {
			if (element == null){
				element = this.element;
			}

			if (this.attr) {
				
				if (input == null && this.attr.getter) {
					input = obj_getProperty({
						node: this,
						element: element
					}, this.attr.getter);
				}
				
				if (input == null && this.attr.value) {
					input = obj_getProperty(this.model, this.attr.value);
				}
			}
			
			

			if (this.validators == null) {
				this.initValidators();
			}

			for (var i = 0, x, imax = this.validators.length; i < imax; i++) {
				x = this.validators[i].validate(input)
				
				if (x && !this.attr.silent) {
					this.notifyInvalid(element, x, oncancel);
					return false;
				}
			}

			this.makeValid(element);
			return true;
		},
		notifyInvalid: function(element, message, oncancel){
			return notifyInvalid(element, message, oncancel);
		},
		makeValid: function(element){
			return makeValid(element);
		},
		initValidators: function() {
			this.validators = [];
			
			for (var key in this.attr) {
				
				
				switch (key) {
					case 'message':
					case 'value':
					case 'getter':
						continue;
				}
				
				if (key in Validators === false) {
					console.error('Unknown Validator:', key, this);
					continue;
				}
				
				var x = Validators[key];
				
				this.validators.push(new Validator(x(this.attr[key], this), this.attr.message));
			}
		}
	};

	
	Validate.resolveFromModel = function(model, property){
		return obj_getProperty(model.Validate, property);
	};
	
	Validate.createCustom = function(element, validator){
		var validate = new Validate();
		
		validate.element = element;
		validate.validators = [new Validator(validator)];
		
		return validate;
	};
	
	
	function Validator(fn, defaultMessage) {
		this.fn = fn;
		this.message = defaultMessage;
	}
	Validator.prototype.validate = function(value){
		var result = this.fn(value);
		
		if (result === false) {
			return this.message || ('Invalid - ' + value);
		}
		return result;
	};
	

	function notifyInvalid(element, message, oncancel) {
		console.warn('Validate Notification:', element, message);

		var next = domLib(element).next('.' + class_INVALID);
		if (next.length === 0) {
			next = domLib('<div>')
				.addClass(class_INVALID)
				.html('<span></span><button>cancel</button>')
				.insertAfter(element);
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

	function makeValid(element) {
		return domLib(element).next('.' + class_INVALID).hide();
	}

	mask.registerHandler(':validate:message', Compo({
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
	
	
	var Validators = {
		match: function(match) {
			
			return function(str){
				return new RegExp(match).test(str);
			};
		},
		unmatch:function(unmatch) {
			
			return function(str){
				return !(new RegExp(unmatch).test(str));
			};
		},
		minLength: function(min) {
			
			return function(str){
				return str.length >= parseInt(min, 10);
			};
		},
		maxLength: function(max) {
			
			return function(str){
				return str.length <= parseInt(max, 10);
			};
		},
		check: function(condition, node){
			
			return function(str){
				return expression_eval('x' + condition, node.model, {x: str}, node);
			};
		}
		

	};



}());
