(function(){
	
	// source ../src/client/bootstrap.js
	var atma = typeof atma === 'undefined'
		? window
		: atma
		;
		
	var mask = atma.mask,
		Compo = mask.Compo
		Dom = mask.Dom;
	
	var custom_Attributes = mask.getAttrHandler(),
		custom_Tags = mask.getHandler(),
		custom_Utils = mask.getUtility();
	
	var __models,
		__ID = 0;
	
	
	// source ../util/function.js
	
	function fn_isFunction(fn) {
		return typeof fn === 'function';
	}
	
	function fn_empty() {
		return false;
	}
	// end:source ../util/function.js
	// source ../util/array.js
	function arr_isArray(array){
		return array != null
			&& typeof array.length === 'number'
			&& typeof array.splice === 'function';
	}
	// end:source ../util/array.js
	// source ../mock/Meta.js
	Meta = (function(){
		
		var seperator_CODE = 30,
			seperator_CHAR = String.fromCharCode(seperator_CODE);
		
		function val_stringify(mix) {
			if (typeof mix !== 'string') 
				return val_stringify(JSON.stringify(mix));
			
			return mix;
		}
		
		var parser_Index,
			parser_Length,
			parser_String;
			
		var tag_OPEN = '<!--',
			tag_CLOSE = '-->';
				
			
		function parse_ID(json){
			
			if (parser_String[parser_Index] !== '#') {
				return;
			}
			parser_Index++;
			
			var end = parser_String.indexOf(seperator_CHAR);
			
			if (end === -1) {
				end = parser_String.length;
			}
			
			json.ID = parseInt(parser_String.substring(parser_Index, end), 10);
			parser_Index = end;
		}
		
		function parse_property(json) {
			if (parser_Index > parser_Length - 5) 
				return false;
			
			
			if (parser_String[parser_Index++] !== seperator_CHAR || parser_String[parser_Index++] !== ' '){
				parser_Index = -1;
				return false;
			}
			
			var index = parser_Index,
				str = parser_String;
			
			var colon = str.indexOf(':', index),
				key = str.substring(index, colon);
				
			var end = str.indexOf(seperator_CHAR + ' ', colon),
				value = str.substring(colon + 1, end);
				
			
			if (key === 'attr') {
				value = JSON.parse(value);
			}
			
			json[key] = value;
			
			parser_Index = end;
			return true;
		}
		
		
		return {
			stringify: function(json, info){
				
				switch (info.mode) {
					case 'server':
					case 'server:all':
						return '';
				}
				
				
				var	type = info.type,
					isSingle = info.single,
				
					string = tag_OPEN + type;
					
					if (json.ID) 
						string += '#' + json.ID;
					
					string += seperator_CHAR + ' ';
				
				for (var key in json) {
					if (key === 'ID') 
						continue;
					
					if (json[key] == null) 
						continue;
					
					
					string += key
						+ ':'
						+ val_stringify(json[key])
						+ seperator_CHAR
						+ ' ';
				}
				
				if (isSingle)
					string += '/';
					
				string += tag_CLOSE;
				
				return string;
			},
			
			close: function(json, info){
				switch (info.mode) {
					case 'server':
					case 'server:all':
						return '';
				}
				
				
				return tag_OPEN
					+'/'
					+ info.type
					+ (json.ID ? '#' + json.ID : '')
					+ tag_CLOSE;
			},
			
			parse: function (string){
				parser_Index = 0;
				parser_String = string;
				parser_Length = string.length;
				
				
				var json = {},
					c = string[parser_Index];
					
				if (c === '/') {
					json.end = true;
					parser_Index++;
				}
				
				json.type = string[parser_Index++];
				
				
				parse_ID(json);
				
				while (parse_property(json));
				
				if (parser_Index === -1) 
					return {};
				
				
				if (string[parser_Length - 1] === '/') 
					json.single = true;
				
				return json;
			}
		};
	}());
	// end:source ../mock/Meta.js
	
	// source model.js
	var model_parse;
	
	(function(){
		
		model_parse = function(str){
			
			return Class.parse(str);
		};
		
	}());
	// end:source model.js
	// source mock.js
	function mock_appendChild(container) {
		
		return function(element){
			
			return container.appendChild(element);
		};
	}
	
	function mock_Container(container, elements) {
		this.container = container;
		this.elements = elements;
	}
	
	mock_Container.prototype = {
		_after: function(){
			return this.elements[this.elements.length - 1] || this.container;
		},
		_before: function(){
			return this.elements[0] || this.container;
		},
		appendChild: function(child){
			var last = this._after();
			
			if (last.nextSibling) {
				last.parentNode.insertBefore(child, last.nextSibling);
				return;
			}
			
			last.parentNode.appendChild(child);
		}
	}
	// end:source mock.js
	// source traverse.js
	function trav_getElements(meta) {
		if (meta.isDocument) 
			return Array.prototype.slice.call(document.body.childNodes);
		
	
		var id = 'mask-htmltemplate-' + meta.ID,
			startNode = document.getElementById(id),
			endNode = document.getElementsByName(id)[0];
	
		
	
		if (startNode == null || endNode == null) {
			console.error('Invalid node range to initialize mask components');
			return null;
		}
	
		var array = [],
			node = startNode.nextSibling;
		while (node != null && node != endNode) {
			array.push(node);
	
			node = node.nextSibling;
		}
	
		return array;
	}
	
	function trav_getElement(node){
		var next = node.nextSibling;
		while(next && next.nodeType !== Node.ELEMENT_NODE){
			next = next.nextSibling;
		}
		
		return next;
	}
	
	function trav_getMeta(node){
		while(node && node.nodeType !== Node.COMMENT_NODE){
			node = node.nextSibling;
		}
		return node;
	}
	// end:source traverse.js
	// source setup.js
	function setup(node, model, cntx, container, controller, childs) {
		
		if (node.nodeType === Node.ELEMENT_NODE) {
			if (childs != null) 
				childs.push(node);
			
			if (node.firstChild) 
				setup(node.firstChild, model, cntx, node, controller);
			
			if (childs == null && node.nextSibling) 
				setup(node.nextSibling, model, cntx, container, controller);
			
			
			return node;
		}
		
		if (node.nodeType !== Node.COMMENT_NODE) {
			if (childs == null && node.nextSibling) 
				setup(node.nextSibling, model, cntx, container, controller);
			
			return node;
		}
		
		var metaContent = node.textContent;
		
		if (metaContent === '/m') {
			return;
		}
		
		if (metaContent === '~') {
			setup(node.nextSibling, model, cntx, node.previousSibling, controller);
			return;
		}
		
		if (metaContent === '/~') {
			setup(node.nextSibling, model, cntx, node.parentNode, controller);
			return;
		}
		
		var meta = Meta.parse(metaContent);
		
		if (meta.modelID) 
			model = __models[meta.modelID];
		
		if ('a' === meta.type) {
			
			// source setup-attr.js
			var handler = custom_Attributes[meta.name],
				element = trav_getElement(node);
				
			if (handler == null) {
				console.warn('Custom Attribute Handler was not defined', meta.name);
				return;
			}
			
			if (element == null){
				console.error('Browser has cut off nested tag for the comment', node);
				return;
			}
			
			handler(null, meta.value, model, cntx, element, controller, container);
			// end:source setup-attr.js
		}
		
		if ('u' === meta.type) {
			
			// source setup-util.js
			var handler = custom_Utils[meta.utilName];
			var element = trav_getElement(node);
			
			if (handler == null) {
				console.log('Custom Utility Handler was not defined', meta.name);
				return;
			}
			
			if (typeof handler === 'function') {
				
				handler(meta.value, model, cntx, element, controller, meta.attrName, meta.utilType);
				
			}else if (handler.process) {
				//@TODO refactor )
				
				if (handler.mode === 'partial') {
					var fnStart = meta.utilType + 'RenderStart';
						fn = meta.utilType;
					
					handler[fnStart](meta.value, model, cntx, element, controller);
					handler.element = element;
					handler[fn](meta.value, model, cntx, element, controller, meta.attrName);
				} else{
					
					handler.process(meta.value, model, cntx, element, controller, meta.attrName, meta.utilType);
				}
			}
			
			// end:source setup-util.js
		}
		
		if ('t' === meta.type) {
			
			if (__ID < meta.ID) 
				__ID = meta.ID;
			
			
			// source setup-tag.js
			
			var compoName = meta.compoName,
				Handler = compoName
					? custom_Tags[meta.compoName]
					: {}
					;
				
			var maskNode;
			if (meta.nodes) {
				maskNode = mask.parse(meta.nodes);
				if (maskNode.type === mask.Dom.FRAGMENT)
					maskNode = maskNode.nodes[0];
			}
			
			if (Handler == null) {
				if (controller.getHandler)
					Handler = controller.getHandler(compoName);
				
				if (Handler == null) {
					console.error('Component is not loaded for client reder - ', compoName);
					Handler = function() {};
				}
			}
			
			
			if (meta.mask != null) {
				var _node = {
					type: Dom.COMPONENT,
					tagName: compoName,
					attr: meta.attr,
					nodes: meta.mask ? mask.parse(meta.mask) : null,
					controller: Handler,
					expression: meta.expression
				};
				
				/* Dangerous:
				 *
				 * Hack with mocking `appendChild`
				 * We have to pass origin container into renderer,
				 * but we must not append template, but insert
				 * rendered template before Comment Placeholder
				 *
				 * Careful:
				 *
				 * If a root node of the new template is some async component,
				 * then containers `appendChild` would be our mocked function
				 *
				 * Info: Appending to detached fragment has also perf. boost,
				 * so it is not so bad idea.
				 */
				
				var fragment = document.createDocumentFragment(),
					container = node.parentNode,
					originalAppender = container.appendChild;
				
				container.appendChild = mock_appendChild(fragment);
				
				mask.render(_node, model, cntx, container, controller);
				
				container.insertBefore(fragment, node);
				container.appendChild = originalAppender;
			} else {
				var compo, isStatic;
				if (typeof Handler === 'function') 
					compo = new Handler(model);
				
				if (compo == null && Handler.__Ctor) {
					compo = new Handler.__Ctor(maskNode, controller);
					isStatic = true;
				}
				
				if (compo == null) 
					compo = Handler;
				
				compo.compoName = compoName;
				compo.attr = meta.attr;
				compo.parent = controller;
				compo.ID = meta.ID;
				compo.expression = meta.expression;
				compo.model = model;
				
				if (controller.components == null) 
					controller.components = [];
					
				
				if (isStatic !== true) {
					controller
						.components
						.push(compo);
				}
					
				if (compo.onRenderStartClient) {
					compo.onRenderStartClient(model, cntx, container, controller);
					
					model = compo.model;
				}
				
				if (meta.single !== false) {
					var elements = [],
						textContent;
					
					node = node.nextSibling;
					while(node != null){
						
						if (node.nodeType === Node.COMMENT_NODE) {
							textContent = node.textContent;
							
							if (textContent === '/t#' + meta.ID) {
								break;
							}
							
							if (textContent === '~') {
								container = node.previousSibling;
								node = node.nextSibling;
								continue;
							}
							
							if (textContent === '/~') {
								container = container.parentNode;
								node = node.nextSibling;
								continue;
							}
						}
						
						var endRef = setup(node, model, cntx, container, compo, elements);
						
						if (endRef == null) 
							throw new Error('Unexpected end of the reference');
						
						node = endRef.nextSibling;
					}
					
				}
				
				
				
				if (fn_isFunction(compo.renderEnd)) {
					
					var _container = container;
					if (isStatic) {
						_container = new mock_Container(container, elements);
					}
					
					compo = compo.renderEnd(
						elements,
						model,
						cntx,
						_container,
						controller
					);
					
					if (isStatic && compo != null) 
						controller.components.push(compo);
				}
				
				if (childs != null && childs !== elements){
					var il = childs.length,
						jl = elements.length;
				
					j = -1;
					while(++j < jl){
						childs[il + j] = elements[j];
					}
				}
			}
			
			// end:source setup-tag.js
			
			
			if (childs != null) 
				return node;
			
		}
		
		
		if (node && node.nextSibling) {
			setup(node.nextSibling, model, cntx, container, controller);
		}
	
		return node;
	}
	
	
	// end:source setup.js
	
	function bootstrap(container, compo) {
		
		if (container == null) 
			container = document.body;
			
		if (compo == null) 
			compo = {};
		
		
		var metaNode = trav_getMeta(container.firstChild),
			metaContent = metaNode && metaNode.textContent,
			meta = metaContent && Meta.parse(metaContent);
			
			
		if (meta == null || meta.type !== 'm') {
			console.error('Meta Inforamtion not defined', container);
			return;
		}
		
		if (meta.ID != null) 
			mask.setCompoIndex(__ID = meta.ID);
		
		__models = model_parse(meta.model);
		
		var model = compo.model = __models.m1,
			el = metaNode.nextSibling;
		
		
		setup(el, model, {}, el.parentNode, compo);
		
		Compo.signal.emitIn(compo, 'domInsert');
	}
	// end:source ../src/client/bootstrap.js
	
	mask.Compo.bootstrap = bootstrap;
	
}());