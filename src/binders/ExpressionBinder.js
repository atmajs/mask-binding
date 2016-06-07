Binders.ExpressionBinder = class_create(IBinder, {
	on: expression_bind,
	off: expression_unbind
});