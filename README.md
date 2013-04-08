All possible bindings for MaskJS
-----

<h4>One way binding</h4>

<ul>

	<li>
		Inline Binding Utility:
		<div><code> "~[bind:EXPRESSION]"</code></div>
		<div><code> "Users name is ~[bind: name +'!']"</code></div>

		<div>
			Can be used in literals and attribute values. Usually you would use this util for binding view with a model,
			but sometimes you may also need some special bindings. For that cases you can use ":bind" tag and define some custom binding provider
			for [setting/getting] [to/from] [DOM/Model]
		</div>
	</li>

	<li> Custom Tag Handler: <code>:bind ...;</code><br\>
		Binds Model Properties to parents node
		<code>
			div > :bind attr='data-name' value='name';
		</code>
		<div>Attributes</div>
		<ul>
			<li> <code>value</code> - path to the value in a model</li>
			<li> <code>attr</code> - {optional} - attribute name of an element</li>
			<li> <code>prop</code> - {optional} - property name of an element</li>
			<li> <code>-</code> - {default} - binds to parents .innerHTML</li>
		</ul>
	</li>
</ul>

<h4>Two way data binding</h4>
<ul>
	<li> Custom Tag Handler: <code>:dualbind ...;</code><br\>
	Binds Model to parents node, and update model on parent node change
<code>
input type=text > :dualbind value='currentUser.name';
</code>
	<div>Attributes</div>

	<ul>
		<li> <code>value</code> - path to the value in a model</li>
		<li> <code>property</code> - {default: 'element.value'} - path to get/set in a HTMLElement</li>
		<li> <code>changeEvent</code> - {default: change} - event to listen for DOM Changes</li>
		<li> <code>getter</code> - {optional} - if parent is custom tag(controller) with getter you define some function to resolve value</li>
		<li> <code>setter</code> - {optional} - if parent is custom tag(controller) with setter you define some function to apply value</li>
		<li> <code>bindingProvider</code> - {optional} - you can register custom binding provider with: mask.registerBinding(name, handler)</li>
	</ul>
</ul>

<h4>Validations</h4>
<ul>
	<li> Usually you want to validate user input data before setting them into model and this custom tag used in dualbind control keeps your model valid</li>
	Binds Model to parents node, and update model on parent node change
	<code>
	div > input type=text > :dualbind value='currentUser.name' {
		:validate validatorName='validatorProperties' message='some message on invalid';
		:validate maxLength=20 message='Max Length is 20 Characters'
	}
	</code>
	<div>Attributes</div>

	<ul>
		<li> <code>validatorName</code> - any register validator name
			<h6>Already defined validators:</h6>
			<ul>
				<li>match='some regexp'</li>
				<li>unmatch='some regexp'</li>
				<li>minLength='min str length'</li>
				<li>maxLength='maxLength'</li>
			</ul>
		</li>
		<li> <code>getter</code> - normally, BindingProvider resolves value for validation, but it is possible to use this control without :dualbind; control, so you may want to specify getter path.</li>
	</ul>
</ul>




More complex example:
<a href='.dev/index.dev.html'>bindings examples</a>
