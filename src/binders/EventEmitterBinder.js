/*
 *	"expression, ...args"
 *	expression: to get the IEventEmitter
 */
(function(){
	Binders.EventEmitterBinder = class_create(IBinder, {
		on: function(exp, model, ctx, ctr, cb){
			call('on', exp, model, ctr, cb);
		},
		off: function(exp, model, ctr, cb){
			call('off', exp, model, ctr, cb);
		},
	});

	function call (method, expr, model, ctr, cb) {
		var arr = expression_evalStatements(expr, model, null, ctr);
		var observable = arr.shift();
		if (observable == null || observable[method] == null) {
			log_error('Method is undefined on observable: ' + method);
			return;
		}
		arr.push(cb);
		observable[method].apply(observable, arr);
	}
}());