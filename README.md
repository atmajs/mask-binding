All possible bindings for MaskJS
-----

<h4>One way binding</h4>

<ul>

	<li>
		<h6>Inline Binding Utility</h6>
		<div><code> "~[bind:EXPRESSION]"</code></div>
		<div><code> "Users name is ~[bind: name +'!']"</code></div>

		<div>
			Can be used in literals and attribute values. Usually you would use this util for binding view with a model,
			but sometimes you may also need some special bindings. For that cases you can use ":bind" tag and define some custom binding provider
			for [setting/getting] [to/from] [DOM/Model]
		</div>
	</li>

	<li>
		<h6>Custom Tag Handler</h6>
		<code>:bind ...;</code><br\>
		Binds Model Properties to parents node
		<code>
			div > :bind attr='data-name' value='name';
		</code>
		<div>Attributes</div>
		<ul>
			<li> <code>value</code> - path to the value in a model</li>
			<li> <code>expression</code> - instead of value (simple property path) could be expression used </li>
			<li> <code>bindingProvider</code> - {optional} - property name of a custom Binding Provider</li>

			<li> <code>attr</code> - {optional} - attribute name of an element</li>
			<li> <code>prop</code> - {optional} - property name of an element</li>
			<li> <code>-</code> - {default} - binds to parents .innerHTML</li>
		</ul>
	</li>

	<li>
		<h6>Binded Percent Handler</h6>
		<code>%%</code>
		<div>
			<code>%% each="users" { // template </code>
			Add object and array observer and modify list on any mutable functions call:
			<code>push, pop, shift, unshift, splice, sort, reverse</code>
		</div>
		<div>
			<code>%% if="x < 10" { // template </code>
			Toggle/Render template on condition change
		</div>
		<div>
			<code>%% else { // template </code>
			Use after "IF"
		</div>

		<div>
			<code>%% use="some.property" { // template </code>
			Template will be re-rendered after "some.property = newObject"
		</div>

		<div>
			<code>%% log="name" { // template </code>
			Log "name" property any time it is changed
		</div>
		<div>
			<code>%% visible="EXPRESSION" { // template </code>
			Render underlined template, but set display:none, if expression fails, and change display
			each time variable references in expression changes.
		</div>

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
		<li> <code>value</code> - property PATH in a MODEL to BIND</li>
		<li> <code>expression</code> - parse and evaluate expression, listen to all variable changes in expression,
			(though it could be used instead "value" argument in single binder, but in dual binder "value" should be specified, if expression
			contains more then one variable reference)
		</li>
		<li> <code>property</code> - {default: "element.value"} - property PATH in a PROVIDER to BIND</li>
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
				<li>check='EXPRESSION' - argument name is "x" - example: :validate check="x>10" message="..";</li>
			</ul>
		</li>
		<li> <code>getter</code> - normally, BindingProvider resolves value for validation, but it is possible to use this control without :dualbind; control, so you may want to specify getter path.</li>
	</ul>
</ul>

```javascript
mask.registerValidator('mycustom', {
	validate: function(node, string){
		return doSomeChecks(string);
		// or if some check settings specified ->
		return doSomeChecks(node.attr.mycustom, string);
	}
})
```

```css
:validate mycustom message="failed";
:validate mycustom="some setting" message="failed";
```

<h4>Binding Provider API</h4>
````javascript
// Default Binding Provider Properties

	this.node // mask DOM Node
	this.model // model object
	this.element // HTMLElement
	this.value // property PATH in a MODEL to BIND
	this.expression // @default = this.value | expression to parse and evaluate
	this.property //  property PATH in a PROVIDER to BIND @default 'element.value' for dualbinder, OR 'element.innerHTML' for singlebinder
	this.setter = node.attr.setter; // @default null, use controller function as setter
	this.getter = node.attr.getter; // @default null, use controller function as getter
````

````javascript
mask.registerBinding('bindingName', {
	/**
	 * (Optional) override default Setter/Getter to/from a DOM
	 */
	domWay: {
		get: function(provider){
			// retrieve value from dom
			return value;
		},
		/**
		 * - provider(BindingProvider)
		 * - value (Object): new value, that should be set to the DOM
		 */
		set: function(provider, value){
			// set value to dom
		}
	},
	/**
	 * (Optional) override default Setter/Getter to/from an Object.
	 */
	objectWay: {
		/**
		 * - property (String): Dot chained, example: "user.name"
		 **/
		get: function(obj, property){
			// get and return value
		},
		set: function(obj, property, value){
			// set value to obj
		}
	}
})
````



More complex example:
<a href='.dev/index.dev.html'>bindings examples</a>
