function list_prepairNodes(compo, arrayModel) {
	var nodes = [];

	if (arrayModel == null || typeof arrayModel !== 'object' || arrayModel.length == null) {
		return nodes;
	}

	var i = 0,
		length = arrayModel.length,
		model;

	for (; i < length; i++) {

		model = arrayModel[i];

		//create references from values to distinguish the models
		switch (typeof model) {
		case 'string':
		case 'number':
		case 'boolean':
			model = arrayModel[i] = Object(model);
			break;
		}

		nodes[i] = new ListItem(compo.template, model, compo);
	}
	return nodes;
}


function list_sort(self, array) {

	var compos = self.components,
		i = 0,
		imax = compos.length,
		j = 0,
		jmax = null,
		element = null,
		compo = null,
		fragment = document.createDocumentFragment(),
		sorted = [];

	for (; i < imax; i++) {
		compo = compos[i];
		if (compo.elements == null || compo.elements.length === 0) {
			continue;
		}

		for (j = 0, jmax = compo.elements.length; j < jmax; j++) {
			element = compo.elements[j];
			element.parentNode.removeChild(element);
		}
	}

	outer: for (j = 0, jmax = array.length; j < jmax; j++) {

		for (i = 0; i < imax; i++) {
			if (array[j] === compos[i].model) {
				sorted[j] = compos[i];
				continue outer;
			}
		}

		console.warn('No Model Found for', array[j]);
	}



	for (i = 0, imax = sorted.length; i < imax; i++) {
		compo = sorted[i];

		if (compo.elements == null || compo.elements.length === 0) {
			continue;
		}


		for (j = 0, jmax = compo.elements.length; j < jmax; j++) {
			element = compo.elements[j];

			fragment.appendChild(element);
		}
	}

	self.components = sorted;

	dom_insertBefore(fragment, self.placeholder);

}

function list_update(self, deleteIndex, deleteCount, insertIndex, rangeModel) {
	if (deleteIndex != null && deleteCount != null) {
		var i = deleteIndex,
			length = deleteIndex + deleteCount;

		if (length > self.components.length) {
			length = self.components.length;
		}

		for (; i < length; i++) {
			if (compo_dispose(self.components[i], self)){
				i--;
				length--;
			}
		}
	}

	if (insertIndex != null && rangeModel && rangeModel.length) {

		var component = new Component(),
			nodes = list_prepairNodes(self, rangeModel),
			fragment = compo_render(component, nodes),
			compos = component.components;

		compo_fragmentInsert(self, insertIndex, fragment);
		compo_inserted(component);

		if (self.components == null) {
			self.components = [];
		}

		self.components.splice.apply(self.components, [insertIndex, 0].concat(compos));
	}
}
