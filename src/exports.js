obj_extend(mask, {
	Validators: Validators,
	registerValidator: function(type, fn) {
		Validators[type] = fn;
	},
	BindingProviders: CustomProviders,
	registerBinding: function(name, Prov) {
		CustomProviders[name] = Prov;
	}
});
