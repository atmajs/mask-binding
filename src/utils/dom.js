var dom_removeElement,
	dom_removeAll,
	dom_insertAfter,
	dom_insertBefore,
	dom_hideElement,
	dom_hideAll;
(function(){
	dom_removeElement = function(el) {
		var parent = el.parentNode;
		if (parent == null) {
			return el;
		}
		return parent.removeChild(el);
	};
	dom_removeAll = function(arr) {
		arr_each(arr, dom_removeElement);
	};
	dom_hideElement = function(el){
		if (el != null) {
			el.style.display = 'none';
		}
	};
	dom_hideAll = function(arr) {
		arr_each(arr, dom_hideElement);
	};
	dom_insertAfter = function(el, anchor) {
		return anchor.parentNode.insertBefore(el, anchor.nextSibling);
	};
	dom_insertBefore = function(el, anchor) {
		return anchor.parentNode.insertBefore(el, anchor);
	};

}());
