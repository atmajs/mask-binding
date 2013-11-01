var attr_each = (function() {

	// import attr.each.helper.js

	var Component = mask.Dom.Component,
		ListItem = (function() {
			var Proto = Component.prototype;

			function ListItem(template, model, parent) {
				this.nodes = template;
				this.model = model;
				this.parent = parent;
			}

			ListItem.prototype = {
				constructor: ListProto,
				renderEnd: function(elements) {
					this.elements = elements;
				}
			};

			for (var key in Proto) {
				ListItem.prototype[key] = Proto[key];
			}

			return ListItem;

		}());


	var ListProto = {
		append: function(model) {
			var item = new ListItem(this.template, model, this);

			mask.render(item, model, null, this.container, this);
		}
	};


	var EachProto = {
		refresh: function(array, method, args, result) {
			var i = 0,
				x, imax;

			if (method == null) {
				// this was new array setter and not an immutable function call

				if (this.components != null) {
					for (i = 0, imax = this.components.length; i < imax; i++) {
						x = this.components[i];
						if (compo_dispose(x, this)) {
							i--;
							imax--;
						}
					}
				}


				this.components = [];
				this.nodes = list_prepairNodes(this, array);

				dom_insertBefore(compo_render(this, this.nodes), this.placeholder);
				
				arr_each(this.components, compo_inserted);
				return;
			}


			for (imax = array.length; i < imax; i++) {
				//create references from values to distinguish the models
				x = array[i];
				switch (typeof x) {
				case 'string':
				case 'number':
				case 'boolean':
					array[i] = Object(x);
					break;
				}
			}

			switch (method) {
			case 'push':
				list_update(this, null, null, array.length, array.slice(array.length - 1));
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
				if (result != null && result.length) {
					list_remove(this, result);
				}
				break;
			}

		},
		dispose: function() {
			expression_unbind(this.expr, this.model, this, this.refresh);
		}
	};



	return function attr_each(self, model, cntx, container) {
		if (self.nodes == null && typeof Compo !== 'undefined') {
			Compo.ensureTemplate(self);
		}

		var expr = self.attr.each || self.attr.foreach,
			current = expression_eval(expr, model, cntx, self);

		obj_extend(self, {
			expr: expr,
			binder: expression_createBinder(expr, model, cntx, self, EachProto.refresh.bind(self)),
			template: self.nodes,
			container: container,
			placeholder: document.createComment(''),

			dispose: EachProto.dispose
		});

		container.appendChild(self.placeholder);

		expression_bind(self.expr, model, cntx, self, self.binder);

		for (var method in ListProto) {
			self[method] = ListProto[method];
		}


		self.nodes = list_prepairNodes(self, current);
	};

}());
