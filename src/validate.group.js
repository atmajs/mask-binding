mask.registerHandler(':validate:group', ValidateGroup);

function ValidateGroup() {}

ValidateGroup.prototype = {
	constructor: ValidateGroup,
	render: function(model, container, cntx) {
		if (this.firstChild){
			mask.render(this.firstChild, model, container, cntx);
		}
	},
	validate: function() {
		var validations = getValidations(this);


		for (var i = 0, x, length = validations.length; i < length; i++) {
			x = validations[i];
			if (!x.validate()) {
				return false;
			}
		}
		return true;
	}
};

function getValidations(component, out){
	if (out == null){
		out = [];
	}

	if (component.components == null){
		return out;
	}
	var compos = component.components;
	for(var i = 0, x, length = compos.length; i < length; i++){
		x = compos[i];

		if (x.compoName === 'validate'){
			out.push(x);
			continue;
		}

		getValidations(x);
	}
	return out;
}
