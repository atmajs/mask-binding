var compo_fragmentInsert,
	compo_render,
	compo_dispose,
	compo_inserted,
	compo_attachDisposer,
	compo_trav_children,
	compo_getScopeFor
	;
(function(){
	
	compo_fragmentInsert = function(compo, index, fragment, placeholder) {
		if (compo.components == null) 
			return dom_insertAfter(fragment, placeholder || compo.placeholder);
		
		var compos = compo.components,
			anchor = null,
			insertBefore = true,
			imax = compos.length,
			i = index - 1,
			elements;
		
		if (anchor == null) {
			while (++i < imax) {
				elements = compos[i].elements;
		
				if (elements && elements.length) {
					anchor = elements[0];
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
				elements = compos[i].elements;
				if (elements && elements.length) {
					anchor = elements[elements.length - 1];
					break;
				}
			}
		}
		if (anchor == null) 
			anchor = placeholder || compo.placeholder;
		
		if (insertBefore) 
			return dom_insertBefore(fragment, anchor);
		
		return dom_insertAfter(fragment, anchor);
	};
	
	compo_render = function(parentCtr, template, model, ctx, container) {
		return mask.render(template, model, ctx, container, parentCtr);
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

	compo_trav_children = function(compo, compoName){
		var out = [],
			arr = compo.components || [],
			imax = arr.length,
			i = -1;
		
		while ( ++i < imax ){
			if (arr[i].compoName === compoName) {
				out.push(arr[i]);
			}
		}
		return out;
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
}());