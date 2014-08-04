(function(window) {
	var version = '1.0.1',
		separator = '.',
		//eventsList = ['blur', 'focus', 'focusin', 'focusout', 'load', 'resize', 'scroll', 'unload', 'click', 'dblclick', 'mousedown', 'mouseup', 'mousemove', 'mouseover', 'mouseout', 'mouseenter', 'mouseleave', 'change', 'select', 'submit', 'keydown', 'keypress', 'keyup', 'error', 'contextmenu'],
		isDomEvent = function(element, eventName) {
			element = element || window;
			return 'on' + eventName in element;
		},
		_isElement = function(obj) {
			try {
				return obj instanceof HTMLElement;
			}
			catch(e){
				return (typeof obj==='object') && (obj.nodeType === 1) && (typeof obj.style === 'object') && (typeof obj.ownerDocument === 'object');
			}
		},
		removeListener = function(el, eventName, arr, handler) {
			arr.forEach(function(item, i) {
				if (handler && handler !== item.userHandler) return true;

				if ( isDomEvent(el, eventName) ) {
					if (el.removeEventListener) el.removeEventListener(eventName, item, false);
					else el.detachEvent(eventName, item);
					return true;
				}

				arr.splice(i, 1);
			});
		},
		eventsIterator = function(el, types, callback, callbackEnd) {
			var eventName, eventId, result;

			if (!types) {
				var obj2 = el.events,
					key2;
				for (key2 in obj2) {
					if (!obj2.hasOwnProperty(key2)) continue;
					
					var obj3 = obj2[key2],
						key3;
					for (key3 in obj3) {
						if (!obj3.hasOwnProperty(key3)) continue;
						if (typeof callback === 'function') callback(key2, eventId, obj3[key3]);
					}
				}

				if (typeof callbackEnd === 'function') callbackEnd(key2, eventId, 3);
				return true;
			}

			types = types.split(' ');

			types.forEach(function(item) {
				item = item.split(separator);
				eventName = item[0];
				eventId = item[1];

				if (el.events[eventName] && el.events[eventName][eventId]) {
					if (typeof callback === 'function') callback(eventName, eventId, el.events[eventName][eventId]);
					if (typeof callbackEnd === 'function') callbackEnd(eventName, eventId, 1);
				}

				if (eventName && !eventId) {
					var obj = el.events[eventName],
						key;
					for (key in obj) {
						if (!obj.hasOwnProperty(key)) continue;
						if (typeof callback === 'function') callback(eventName, eventId, obj[key]);
					}

					if (typeof callbackEnd === 'function') callbackEnd(eventName, eventId, 2);
				}

				if (!el.events[eventName] && eventId) {
					var obj4 = el.events,
						key4;
					for (key4 in obj4) {
						if (!obj4.hasOwnProperty(key4) || !obj4[key4][eventId]) continue;
						if (typeof callback === 'function') callback(key4, eventId, obj4[key4][eventId]);
						if (typeof callbackEnd === 'function') callbackEnd(key4, eventId, 4, obj4[key4]);
					}
				}
			});
		},
		Edom = function(element) {
			this.element = element;
		};

	Edom.version = version;

	//[element], types, [data], handler
	Edom.prototype.on = function() {
		var length = arguments.length,
			el = _isElement(arguments[0]) ? arguments[0] : this.element,
			types, data, handler, eventName, eventId, handlerWraper;

		if (!el) return this;
		if (!el.events) el.events = {};
		if (!this.element && el) this.element = el;

		if (length === 2) {
			types = arguments[0];
			handler = arguments[1];
		}

		if (length === 3) {
			types = (typeof arguments[1] === 'string') ? arguments[1] : arguments[0];
			data = (typeof arguments[1] !== 'string') ? arguments[1] : undefined;
			handler = (typeof arguments[2] === 'function') ? arguments[2] : arguments[3];
		}

		if (length === 4) {
			el = arguments[0];
			types = arguments[1];
			data = arguments[2];
			handler = arguments[3];
		}

		handlerWraper = function(e) {
			if (arguments.length === 1 && typeof arguments === 'object' && data) arguments[0].data = data;
			handler.apply(this, arguments);
		};

		handlerWraper.userHandler = handler;

		types = types.split(' ');

		types.forEach(function(item) {
			item = item.split(separator);
			eventName = item[0];
			eventId = item[1];

			if (!el.events[eventName]) el.events[eventName] = {};
			
			if (!eventId) {
				if (!el.events[eventName].all) el.events[eventName].all = [];
				el.events[eventName].all.push(handlerWraper);
			} else {
				if (!el.events[eventName][eventId]) el.events[eventName][eventId] = [];
				el.events[eventName][eventId].push(handlerWraper)
			}

			if ( isDomEvent(el, eventName) ) {
				if (el.addEventListener) el.addEventListener(eventName, handlerWraper, false);
				else el.attachEvent(eventName, handlerWraper);
			}
		});

		return this;
	};

	//[element], types, [handler]
	Edom.prototype.off = function() {
		var length = arguments.length,
			el, types, eventName, handler, eventId;

		if (!length) {
			el = this.element;
		}

		if (length === 1) {
			el = this.element;
			types = arguments[0];
		}

		if (length === 2 && typeof arguments[1] === 'string') {
			el = arguments[0];
			types = arguments[1];
		}

		if (length === 2 && typeof arguments[1] === 'function') {
			el = this.element;
			types = arguments[0];
			handler = arguments[1];
		}

		if (length === 3) {
			el = arguments[0];
			types = arguments[1];
			handler = arguments[2];
		}

		eventsIterator(el, types, 
			function(name, id, arr) {
				removeListener(el, name, arr, handler);
			}, function(name, id, ifCounter, eventObj) {
				switch (ifCounter){
					case 1: delete el.events[name][id];
					break;
					case 2: if (!handler) delete el.events[name];
					break;
					case 3: delete el.events;
					break;
					default: delete eventObj[eventId];
				}
			});
		
		return this;
	};

	//element, types
	Edom.prototype.trigger = function() {
		var el = _isElement(arguments[0]) ? arguments[0] : this.element,
			types = _isElement(arguments[0]) ? arguments[1] : arguments[0],
			args = Array.prototype.slice.call(arguments, 1) || [],
			eventName, eventId;

		if (!el) return this;

		eventsIterator(el, types, function(name, id, arr, ifCounter) {
			arr.forEach(function(eventHandler) {
				eventHandler.apply(null, args);
			});
		});

		return this;
	};

	window.Edom = Edom;
	window.Edom.e = new Edom();
}(this));