buster.testCase('Render', {
	'binded sys': function() {

		var model = {
			users: ['A', 'B', 'C']
		},
			dom = mask.render('div > %% each="users" > span > "~[.]"', model);

		assert.equals(dom.textContent, 'ABC', 'Render Failed');

		model.users.push('E');
		assert.equals(dom.textContent, 'ABCE', 'Push Failed');

		model.users.unshift('0');
		assert.equals(dom.textContent, '0ABCE', 'Unshift Failed');

		model.users.splice(1, 0, '1', '2');
		assert.equals(dom.textContent, '012ABCE', 'Splice Failed');

		model.users.reverse();
		assert.equals(dom.textContent, 'ECBA210', 'Reverse Failed');

		model.users.sort();
		assert.equals(dom.textContent, '012ABCE', 'Sort Failed');

		model.users.sort(function(a, b) {
			return isNaN(+a) ? -1 : 1;
		});
		assert.equals(dom.textContent, 'ABCE210', 'FN Sort Failed');

		model.users.splice(0);
		assert.equals(dom.textContent, '', 'Empty Failed');

		model.users.unshift('F');
		assert.equals(dom.textContent, 'F', 'Unshift Failed');

		model.users.push('1');
		model.users.push('2');
		model.users.push('3');
		model.users.push('4');
		model.users.splice(1, 4, '5', '6', '7');
		model.users.splice(0, 1, 'A');
		assert.equals(dom.textContent, 'A567', 'Complex splice Failed');


		model.users = ['X', 'Z'];
		assert.equals(dom.textContent, 'XZ', 'Model redefine failed');


		model.users.unshift('Y');
		assert.equals(dom.textContent, 'YXZ', 'Unshift failed after redefine');

	},
	'bind util': function(){
		var model = {
			name: 'A',
			age: 1
		},
		span = mask.render('span data-age="~[bind:name]" > "~[bind:age]"', model);

		assert.equals(span.getAttribute('data-age'), 'A');
		assert.equals(span.textContent, '1');

		model.name = 'B';
		model.age = 2;
		assert.equals(span.getAttribute('data-age'), 'B');
		assert.equals(span.textContent, '2');
	},
	'bind handler': function(){
		var model = {
			user: {
				name: 'A'
			}
		};

		var dom = mask.render('input type="text" > :bind value="user.name" property="element.value";', model);

		assert.equals(dom.value, 'A');

		model.user.name = 'C';
		assert.equals(dom.value, 'C');

	}
});