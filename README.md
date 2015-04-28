### MaskJS bindings system (_Node.JS and Browsers_)

[![Build Status](https://travis-ci.org/atmajs/mask-binding.png?branch=master)](https://travis-ci.org/atmajs/mask-binding)

#### Property watchers

_Support: **`IE9+`**_

> Property observers, not object observers.

- works with **any** object, array, array-alike object, date.
- listen only for a specific single property change, array or date mutation.
- support **deep nestings**, like: `obj_addObserver(obj, 'foo.baz.qux.name', cb)`.
- support **breadcrumbs** for nested objects. `obj.foo = { baz: { qux: { name: 'New name' } } }` would
rebind listener and will trigger the 'name' listener callback.
- after the component is removed all the listeners are also removed to prevent memory leaks.


#### One-way binding

- Inline Binding Util

	```mask
	~[bind:EXPRESSION]
	```
	
	```mask
	"Users name is ~[bind: name +'!']"
	```
	
	Can be used in literals and attribute values. Usually you would use this util for binding view with a model,
	but sometimes you may also need some special bindings. For that cases you can use ":bind" tag and define some custom binding provider
	for [setting/getting] [to/from] [DOM/Model]

- Binded Statements
	- `+if`
	
		```mask
		+if (expression) {}
		```
	- `+for..of`
	
		```mask
		+for (value of ARRAY) {}
		+for ((value, index) of ARRAY) {}
		```
	- `+for..in`
	
		```mask
		+for (key in object) {}
		+for ((key, value) in object) {}
		```
	- `+each`
	
		```mask
		+each (expression) {}
		```
	- `+with`
	
		```mask
		+with (expression) {}
		```
	- `+visible`
	
		```mask
		+visible (expression) {}
		```
		
- Custom Tag: fox complex binders, e.g. with setters/getters support for the component.

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

	Component should trigger the `change` event to notify the binder.

#### Two way data binding

- Custom Tag Handler: **``` :dualbind ...; ```**

Binds Model to the parent node.

```mask
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
	
Support HTML elements:
- `textarea`
- `input` with `text`, *`date`*, *`time`*, `number`, `email` etc.
- `select`

#### Validations

Usually you want to validate user inputs **before** setting them to the model and this custom tag is used in dualbind control to keep the model valid.
	
```mask
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
// custom validation
mask.registerValidator('mycustom', {
	validate: function(node, string){
		return doSomeChecks(string);
		// or if some check option specified ->
		return doSomeChecks(node.attr.mycustom, string);
	}
})
```

```mask
input type=text >
	:dualbind value='user.username' {
	
		// predefined validator
		:validate minLength=3 message='Too Short';
		
		// regexp validator
		:validate match='^\w+$' message='Only chars and numbers';
		
		// custom validator
		:validate mycustom message='Foo Message';
		
		// with check option `some_option`
		:validate mycustom='some_option' message='Baz Message';
	}
```

#### Binding Provider API
```javascript
// Default Binding Provider Properties

	this.ctr // :dualbind component
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
	\*/
	domWay: {
		get: function(provider){
			// get value from dom or the parent component
			return value;
		},
		/**
		 * - provider(BindingProvider)
		 * - value (Object): new value, that should be set to the DOM
		\*/
		set: function(provider, value){
			// set value to dom or the parent component
		}
	},
	/**
	 * (Optional) override default Setter/Getter to/from an Object.
	\*/
	objectWay: {
		/**
		 * - property (String): Dot chained, example: "user.name"
		\*/
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
:copyright: MIT — 2014-2015 — Atma Project