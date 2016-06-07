var IBinder = class_create({
	constructor: function (exp, model, ctr) {
		this.exp = exp;
		this.ctr = ctr;
		this.model = model;
		this.cb = null;
	},
	bind: function(cb){
		this.cb = cb;
		// we have here no access to the ctx, so pass null
		this.on(this.exp, this.model, null, this.ctr, cb);
	},
	dispose: function(){
		this.off(this.exp, this.model, this.ctr, this.cb);
		this.exp = this.model = this.ctr = this.cb = null;
	}
});