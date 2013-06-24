var attr_visible = (function() {

	var VisibleProto = {
		refresh: function(){

			if (this.refreshing === true) {
				return;
			}
			this.refreshing = true;

			var visible = expression_eval(this.expr, this.model, this.cntx, this);

			for(var i = 0, imax = this.elements.length; i < imax; i++){
				this.elements[i].style.display = visible ? '' : 'none';
			}

			this.refreshing = false;
		},

		dispose: function(){
			expression_unbind(this.expr, this.model, this, this.binder);
		}
	};

	return function (self, model, cntx) {

		var expr = self.attr.visible;

		obj_extend(self, {
			expr: expr,
			binder: expression_createBinder(expr, model, cntx, self, VisibleProto.refresh.bind(self)),

			dispose: VisibleProto.dispose
		});


		expression_bind(expr, model, cntx, self, self.binder);

		VisibleProto.refresh.call(self);
	};

}());
