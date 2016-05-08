(function(){
	__registerHandler('listen', class_create({
		disposed: false,
		placeholder: null,
		compoName: 'listen',
		show: null,
		hide: null,
		meta: {
			serializeNodes: true,
			attributes: {
				animatable: false
			}
		},
		renderEnd: function(els, model, ctx, container, ctr){
			_renderPlaceholder(this, this, container);

			var fn = Boolean(this.attr.animatable)
				? this.refreshAni
				: this.refreshSync;

			this.refresh = fn_proxy(fn, this);
			this.elements = els;
			expression_bind(
				this.expression,
				model,
				ctx,
				this,
				this.refresh
			);
		},
		dispose: function(){
			expression_unbind(
				this.expression,
				this.model,
				this,
				this.refresh
			);
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