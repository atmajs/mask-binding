(function() {
	
	var class_INVALID = '-validate-invalid';

	mask.registerValidator = function(type, validator) {
		Validators[type] = validator;
	};

	function Validate() {}

	mask.registerHandler(':validate', Validate);




	Validate.prototype = {
		constructor: Validate,
		renderStart: function(model, cntx, container) {
			this.element = container;
			this.model = model;
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

			if (this.attr.getter) {
				input = obj_getProperty({
					node: this,
					element: element
				}, this.attr.getter);
			}

			if (this.validators == null) {
				this.initValidators();
			}

			for (var i = 0, x, length = this.validators.length; i < length; i++) {
				x = this.validators[i];
				if (x.validate(this, input) === false) {
					notifyInvalid(element, this.message, oncancel);
					return false;
				}
			}

			makeValid(element);
			return true;
		},
		initValidators: function() {
			this.validators = [];
			this.message = this.attr.message;
			delete this.attr.message;

			for (var key in this.attr) {
				if (key in Validators === false) {
					console.error('Unknown Validator:', key, this);
					continue;
				}
				var Validator = Validators[key];
				if (typeof Validator === 'function') {
					Validator = new Validator(this);
				}
				this.validators.push(Validator);
			}
		}
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

		next
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
		domLib(element).next('.' + class_INVALID).hide();
	}

	var Validators = {
		match: {
			validate: function(node, str) {
				return new RegExp(node.attr.match).test(str);
			}
		},
		unmatch: {
			validate: function(node, str) {
				return !(new RegExp(node.attr.unmatch)).test(str);
			}
		},
		minLength: {
			validate: function(node, str) {
				return str.length >= parseInt(node.attr.minLength, 10);
			}
		},
		maxLength: {
			validate: function(node, str) {
				return str.length <= parseInt(node.attr.maxLength, 10);
			}
		},
		check: {
			validate: function(node, str){
				return expression_eval(node.attr.check, node.model, {x: str}, node);
			}
		}

	};



}());
