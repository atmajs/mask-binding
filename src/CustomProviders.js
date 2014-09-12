var CustomProviders = {};

mask.registerBinding = function(name, Prov) {
	CustomProviders[name] = Prov;
};