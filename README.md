#DOM events

Edom - global constructor;

##Bind events, ver.1
```javascript
var e = new Edom(),
	element = document.getElementById('test');
	handler = function(e) {
		console.log('Click');
		console.log(e.data); //{test : 'test'}
	};

//Simple bind
e.on(element, 'click', handler);
e.on(element, 'click', {test : 'test'}, handler);

//Bind with event ID
e.on(element, 'click.someID', handler);

//Custom event
e.on(element, 'myEvent', handler);
e.on(element, 'myEvent.myID', handler);
```

##Bind events, ver.2
```javascript
var e = new Edom( document.getElementById('test') ),
	handler = function() {
		alert('Click');
	};

//Simple bind
e.on('click', handler);

//Bind with event ID
e.on('click.someID', handler);

//Custom event
e.on('myEvent', handler);
e.on('myEvent.myID', handler);
```

##Unbind events
```javascript
var e = new Edom( document.getElementById('test') ),
	handler = function() {
		alert('Click');
	};

//Simple unbind
e.on('click', handler);
e.off('click');
e.off('click', handler);

//Unbind by event name and event ID or simple all events by event ID
e.on('click.someID', handler);
e.off('click.someID');
e.off('.someID');

//Custom event
e.on('myEvent.myID', handler);
e.off('myEvent', handler);
e.off('myEvent');
e.off('.myID');
```

##Trigger events
```javascript
var e = new Edom( document.getElementById('test') ),
	handler = function() {
		console.log(arguments);
	};


e.on('click.clickID', handler);

e.trigger('click');
e.trigger('.clickID');
e.trigger('click', 1, 2, 3, 4, 5, 6);
```

- instance - __new Edom([DOM element])__
- on - __Edom.e.on([element], events, [data] callback)__ bind events
- off - __Edom.e.off([element], events, [callback])__ unbind events
- trigger - __Edom.e.trigger([element], events, [data])__ trigger events
