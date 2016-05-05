(function(){
	__registerHandler('listen', class_create({
		placeholder: null,
		compoName: 'listen',
		show: null,
		hide: null,
		disposed: false,
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
			this.elements = null;
			this.parent = null;
			this.model = null;
			this.ctx = null;
		},
		refresh: function(){
			throw new Error('Should be defined');
		},
		refreshSync: function(){
			this.destroy();
			this.create();
		},
		create: function(){
			compo_renderChildren(this, this.placeholder);
		},
		destroy: function(){
			compo_disposeChildren(this);
		},
		refreshAni: function(){
			var x = _compo_transferChildren(this);
			this.create();
			return this.ani.run('hide', 'show', function(){
				compo_disposeChildren(x);
			});

			return this.ani.run('hide', this.destroy, this.create, 'show');
		},
		refreshAniPar: function(){

		},
		getAni: function (name) {

		},

	}));
}());