include.js({
	ruqq: ['dom/jquery', 'utils'],
	lib: ['mask', 'mask.binding/mask.binding'],
	compo: ['datepicker']
}).ready(function() {

	window.model = {
		name: 'Alex',
		paths: ['path1.html', 'path2.html'],
		date: new Date,
		height: 10,
		array: [1,2]
	};

	mask.registerBinding('pathsProvider', {
		domWay: {
			get: function(provider) {
				return provider.element.value.split('\n');
			},
			set: function(provider, value) {
				console.log('path, set', value);
				provider.element.value = value.join('\n');
			}
		}
	});


	mask.registerBinding("heightBinder", {
		domWay: {
			set: function(provider, value) {
				provider.element.style.height = value + 'px';
			}
		}
	});

	mask.registerBinding("datePickerProvider", {
		domWay: {
			get: function(provider) {
				console.log('getDate', provider.node.parent);
				return provider.node.parent.getDate();
			},
			set: function(provider, value) {
				console.log('setDate', value, typeof value);
				provider.node.parent.setDate(new Date(value));
			}
		}
	});


	/* switcher */
	mask.registerHandler(':radio', Compo({
		events: {
			'click: button': function(event) {

				this.$.children('.active').removeClass('active');
				this.$.trigger('changed', event.target);

				$(event.currentTarget).addClass('active');
			}
		},
		onRenderStart: function() {
			jmask(this).tag('div').addClass('radio');
		}
	}));

	mask.registerHandler(':switcher2', Compo({
		events: {
			'changed: .radio': function(event, sender) {
				this.text = sender.textContent;
			}
		},
		onRenderStart: function() {
			this.text = 'click to start tracking';
		}
	}));

	/** switcher */

	mask.registerHandler(':slotHandler', {
		slots: {
			onclick: function(){
				alert('slot plucked');
			},
			arrayPush: function(){
				model.array.push(1);
			},
			arrayPop: function(){
				model.array.pop();
			}
		}
	})


	var App = Compo({
		attr: {
			template: '#layout'
		}
	});

	Compo.initialize(App, model, document.body);

});
