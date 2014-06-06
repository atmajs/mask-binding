### MaskJS Bindings System For Node.JS and Browsers

[![Build Status](https://travis-ci.org/atmajs/mask-binding.png?branch=master)](https://travis-ci.org/atmajs/mask-binding)

#### Property watchers

_Support: **`IE9+`**_

> Property observers, not object observers.

- works with **any** object, array and array-alike object
- listen only for a specific single property change or array mutation
- support **nestings**, like: `obj_addObserver(obj, 'foo.baz.qux.name', cb)`
- use 'breadcrumbs' for nested objects. `obj.foo = { baz: { qux: { name: 'New name' } } }` would
rebind listener and will trigger the 'name' listener callback
- after the component is removed all the listeners are also removed to prevent memory leaks.


#### One-way binding

- Inline Binding Util
	**``` "~[bind:EXPRESSION]" ```**
	
	``` "Users name is ~[bind: name +'!']"```
	
	Can be used in literals and attribute values. Usually you would use this util for binding view with a model,
	but sometimes you may also need some special bindings. For that cases you can use ":bind" tag and define some custom binding provider
	for [setting/getting] [to/from] [DOM/Model]

- Binded Statements
	- ``` +if (expression) {} ```
	- ``` +for (key of ARRAY) {} ```
	- ``` +each (expression) {} ```
	- ``` +with (expression) {} ```

- Custom Tag Handler
	**`:bind ...;`**
	```mask
		:datepicker >
			:bind value='date' getter='getDate' setter='setDate';
	```
		
	Attributes
	- `value` - model's property
	- `expression` - evaluate and bind to the expression _use instead `value` attribute_
	- `getter / setter` - binding can be applied also for components
	- `bindingProvider` - {optional} - property name of a custom Binding Provider
	- `attr` - {optional} - attribute name of an element
	- `prop` - {optional} - property name of an element
	- `-` - {default} - binds to parents .innerHTML


#### Two way data binding


- Custom Tag Handler: **``` :dualbind ...; ```**

Binds Model to parents node, and update model on parent node change

```sass
input type=text >
	:dualbind value='currentUser.name';
```

Attributes

- ```value``` - property in a model to bind
- ```expression``` - parse and evaluate expression, listen to all variable changes in expression, (though it could be used instead "value" argument in single binder, but in dual binder "value" should be specified, if expression contains more then one variable reference)
- ```property``` - {default: "element.value"} - property PATH in a PROVIDER to BIND
- ```changeEvent``` - {default: change} - event to listen for DOM Changes
- ```getter``` - {optional} - if parent is custom tag(controller) with getter you define some function to resolve value
- ```setter``` - {optional} - if parent is custom tag(controller) with setter you define some function to apply value
- ```bindingProvider``` - {optional} - you can register custom binding provider with: mask.registerBinding(name, handler)
	


#### Validations

Usually you want to validate user inputs **before** setting them to the model and this custom tag is used in dualbind control to keep the model valid.
	
```sass
div > input type=text > :dualbind value='currentUser.name' {
	:validate validatorName='validatorProperties' message='some message on invalid';
	:validate maxLength=20 message='Max Length is 20 Characters'
}
```

Attributes

	
- ```validatorName``` - any register validator name
	Already defined validators:
	
	- match='some regexp'
	- unmatch='some regexp'
	- minLength='min str length'
	- maxLength='maxLength'
	- check='EXPRESSION' - argument name is "x" - example: :validate check="x>10" message="..";


```javascript
mask.registerValidator('mycustom', {
	validate: function(node, string){
		return doSomeChecks(string);
		// or if some check settings specified ->
		return doSomeChecks(node.attr.mycustom, string);
	}
})
```

```sass
input type=text >
	:dualbind value='user.username' {
		:validate minLength=3 message="Too Short";
		:validate match='^\w+$' message='Only chars and numbers';
		:validate mycustom message="Foo Message";
		:validate mycustom="some setting" message="Baz Message";
	}
```

#### Binding Provider API
```javascript
// Default Binding Provider Properties

	this.node // mask DOM Node
	this.model // model object
	this.element // HTMLElement
	this.value // property PATH in a MODEL to BIND
	this.expression // @default = this.value | expression to parse and evaluate
	this.property //  property PATH in a PROVIDER to BIND @default 'element.value' for dualbinder, OR 'element.innerHTML' for singlebinder
	this.setter = node.attr.setter; // @default null, use controller function as setter
	this.getter = node.attr.getter; // @default null, use controller function as getter
```

```javascript
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
```


----
(c) 2014 Atma Project