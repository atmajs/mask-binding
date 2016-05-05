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