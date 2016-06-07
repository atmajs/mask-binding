/*
 *	"expression, ...args"
 *	expression: to get the RxObservable {subscribe:IDisposable}
 */

Binders.RxBinder = class_create(IBinder, {
	stream: null,
	on: function call (expr, model, ctr, cb) {
		var arr = expression_evalStatements(expr, model, null, ctr);

		var stream = arr.shift();
		if (stream == null || stream.subscribe == null) {
			error_withCompo('Method is undefined on RxObservable: ' + method, ctr);
			return;
		}
		arr.push(cb);
		this.stream = stream.subscribe.apply(stream, arr);
	},
	off: function(){
		if (this.stream == null) {
			return;
		}
		this.stream.dispose();
	},
});
