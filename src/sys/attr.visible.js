var attr_visible = (function() {

	var VisibleProto = {
		refresh: function(){

			var visible = expression_eval(this.attr.visible, this.model, this.cntx, this);

			for(var i = 0, x, length = this.elements.length; i < length; i++){
				x = this.elements[i];
				x.style.display = visible ? '' : 'none';
			}


		}
	};

	return function (self, model, cntx, container) {

		expression_bind(self.attr.visible, model, cntx, self, VisibleProto.refresh.bind(self));

		VisibleProto.refresh.call(self);
	};

}());
