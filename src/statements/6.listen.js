(function(){
	__registerHandler('listen', class_create({
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
			this.elements = null;
			this.parent = null;
			this.model = null;
			this.ctx = null;
		},
		refresh: function(){
			throw new Error('Should be defined');
		},
		refreshSync: function(){
			_compo_disposeChildren(this);

			var fragment = document.createDocumentFragment();
			this.elements = _renderElements(
				this.nodes,
				this.model,
				null,
				fragment,
				this
			);
			dom_insertBefore(fragment, this.placeholder);
			compo_inserted(this);
		}
	}));
}());