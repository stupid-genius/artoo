(function() {
  'use strict';

  /**
   * Here is the list of every allowed parameter when using Emitter#on:
   * @type {Object}
   */
  var __allowedOptions = {
    once: 'boolean'
  };


  /**
   * The emitter's constructor. It initializes the handlers-per-events store and
   * the global handlers store.
   *
   * Emitters are useful for non-DOM events communication. Read its methods
   * documentation for more information about how it works.
   *
   * @return {Emitter}         The fresh new instance.
   */
  var Emitter = function() {
    this._enabled = true;
    this._children = [];
    this._handlers = {};
    this._handlersAll = [];
  };


  /**
   * This method binds one or more functions to the emitter, handled to one or a
   * suite of events. So, these functions will be executed anytime one related
   * event is emitted.
   *
   * It is also possible to bind a function to any emitted event by not
   * specifying any event to bind the function to.
   *
   * Recognized options:
   * *******************
   *  - {?boolean} once   If true, the handlers will be unbound after the first
   *                      execution. Default value: false.
   *
   * Variant 1:
   * **********
   * > myEmitter.on('myEvent', function(e) { console.log(e); });
   * > // Or:
   * > myEmitter.on('myEvent', function(e) { console.log(e); }, { once: true });
   *
   * @param  {string}   event   The event to listen to.
   * @param  {function} handler The function to bind.
   * @param  {?object}  options Eventually some options.
   * @return {Emitter}          Returns this.
   *
   * Variant 2:
   * **********
   * > myEmitter.on(
   * >   ['myEvent1', 'myEvent2'],
   * >   function(e) { console.log(e); }
   * >);
   * > // Or:
   * > myEmitter.on(
   * >   ['myEvent1', 'myEvent2'],
   * >   function(e) { console.log(e); }
   * >   { once: true }}
   * >);
   *
   * @param  {array}    events  The events to listen to.
   * @param  {function} handler The function to bind.
   * @param  {?object}  options Eventually some options.
   * @return {Emitter}          Returns this.
   *
   * Variant 3:
   * **********
   * > myEmitter.on({
   * >   myEvent1: function(e) { console.log(e); },
   * >   myEvent2: function(e) { console.log(e); }
   * > });
   * > // Or:
   * > myEmitter.on({
   * >   myEvent1: function(e) { console.log(e); },
   * >   myEvent2: function(e) { console.log(e); }
   * > }, { once: true });
   *
   * @param  {object}  bindings An object containing pairs event / function.
   * @param  {?object}  options Eventually some options.
   * @return {Emitter}          Returns this.
   *
   * Variant 4:
   * **********
   * > myEmitter.on(function(e) { console.log(e); });
   * > // Or:
   * > myEmitter.on(function(e) { console.log(e); }, { once: true});
   *
   * @param  {function} handler The function to bind to every events.
   * @param  {?object}  options Eventually some options.
   * @return {Emitter}          Returns this.
   */
  Emitter.prototype.on = function(a, b, c) {
    var i,
        l,
        k,
        event,
        eArray,
        bindingObject;

    // Variant 1 and 2:
    if (typeof b === 'function') {
      eArray = typeof a === 'string' ?
        [a] :
        a;

      for (i = 0, l = eArray.length; i !== l; i += 1) {
        event = eArray[i];

        // Check that event is not '':
        if (!event)
          continue;

        if (!this._handlers[event])
          this._handlers[event] = [];

        bindingObject = {
          handler: b
        };

        for (k in c || {})
          if (__allowedOptions[k])
            bindingObject[k] = c[k];
          else
            throw new Error(
              'The option "' + k + '" is not recognized by Emmett.'
            );

        this._handlers[event].push(bindingObject);
      }

    // Variant 3:
    } else if (a && typeof a === 'object' && !Array.isArray(a))
      for (event in a)
        Emitter.prototype.on.call(this, event, a[event], c);

    // Variant 4:
    else if (typeof a === 'function') {
      bindingObject = {
        handler: a
      };

      for (k in c || {})
        if (__allowedOptions[k])
          bindingObject[k] = c[k];
        else
          throw new Error(
            'The option "' + k + '" is not recognized by Emmett.'
          );

      this._handlersAll.push(bindingObject);
    }

    // No matching variant:
    else
      throw new Error('Wrong arguments.');

    return this;
  };


  /**
   * This method works exactly as the previous on, but will always add an
   * options object with the key "once" set to true as the last parameter.
   *
   * Variant 1:
   * **********
   * > myEmitter.once('myEvent', function(e) { console.log(e); });
   *
   * @param  {string}   event   The event to listen to.
   * @param  {function} handler The function to bind.
   * @return {Emitter}          Returns this.
   *
   * Variant 2:
   * **********
   * > myEmitter.once(
   * >   ['myEvent1', 'myEvent2'],
   * >   function(e) { console.log(e); }
   * > );
   *
   * @param  {array}    events  The events to listen to.
   * @param  {function} handler The function to bind.
   * @return {Emitter}          Returns this.
   *
   * Variant 3:
   * **********
   * > myEmitter.once({
   * >   myEvent1: function(e) { console.log(e); },
   * >   myEvent2: function(e) { console.log(e); }
   * > });
   *
   * @param  {object}  bindings An object containing pairs event / function.
   * @return {Emitter}          Returns this.
   *
   * Variant 4:
   * **********
   * > myEmitter.once(function(e) { console.log(e); });
   *
   * @param  {function} handler The function to bind to every events.
   * @return {Emitter}          Returns this.
   */
  Emitter.prototype.once = function(a, b) {
    this.on.apply(
      this,
      Array.prototype.splice.call(arguments, 0).concat({ once: true })
    );
    return this;
  };


  /**
   * This method unbinds one or more functions from events of the emitter. So,
   * these functions will no more be executed when the related events are
   * emitted. If the functions were not bound to the events, nothing will
   * happen, and no error will be thrown.
   *
   * Variant 1:
   * **********
   * > myEmitter.off('myEvent', myHandler);
   *
   * @param  {string}   event   The event to unbind the handler from.
   * @param  {function} handler The function to unbind.
   * @return {Emitter}          Returns this.
   *
   * Variant 2:
   * **********
   * > myEmitter.off(['myEvent1', 'myEvent2'], myHandler);
   *
   * @param  {array}    events  The events to unbind the handler from.
   * @param  {function} handler The function to unbind.
   * @return {Emitter}          Returns this.
   *
   * Variant 3:
   * **********
   * > myEmitter.off({
   * >   myEvent1: myHandler1,
   * >   myEvent2: myHandler2
   * > });
   *
   * @param  {object} bindings An object containing pairs event / function.
   * @return {Emitter}         Returns this.
   *
   * Variant 4:
   * **********
   * > myEmitter.off(myHandler);
   *
   * @param  {function} handler The function to unbind from every events.
   * @return {Emitter}          Returns this.
   */
  Emitter.prototype.off = function(events, handler) {
    var i,
        n,
        j,
        m,
        k,
        a,
        event,
        eArray = typeof events === 'string' ?
          [events] :
          events;

    if (arguments.length === 1 && typeof eArray === 'function') {
      handler = arguments[0];

      // Handlers bound to events:
      for (k in this._handlers) {
        a = [];
        for (i = 0, n = this._handlers[k].length; i !== n; i += 1)
          if (this._handlers[k][i].handler !== handler)
            a.push(this._handlers[k][i]);
        this._handlers[k] = a;
      }

      a = [];
      for (i = 0, n = this._handlersAll.length; i !== n; i += 1)
        if (this._handlersAll[i].handler !== handler)
          a.push(this._handlersAll[i]);
      this._handlersAll = a;
    }

    else if (arguments.length === 2) {
      for (i = 0, n = eArray.length; i !== n; i += 1) {
        event = eArray[i];
        if (this._handlers[event]) {
          a = [];
          for (j = 0, m = this._handlers[event].length; j !== m; j += 1)
            if (this._handlers[event][j].handler !== handler)
              a.push(this._handlers[event][j]);

          this._handlers[event] = a;
        }

        if (this._handlers[event] && this._handlers[event].length === 0)
          delete this._handlers[event];
      }
    }

    return this;
  };


  /**
   * This method unbinds every handlers attached to every or any events. So,
   * these functions will no more be executed when the related events are
   * emitted. If the functions were not bound to the events, nothing will
   * happen, and no error will be thrown.
   *
   * Usage:
   * ******
   * > myEmitter.unbindAll();
   *
   * @return {Emitter}      Returns this.
   */
  Emitter.prototype.unbindAll = function() {
    var k;

    this._handlersAll = [];
    for (k in this._handlers)
      delete this._handlers[k];

    return this;
  };


  /**
   * This method emits the specified event(s), and executes every handlers bound
   * to the event(s).
   *
   * Use cases:
   * **********
   * > myEmitter.emit('myEvent');
   * > myEmitter.emit('myEvent', myData);
   * > myEmitter.emit(['myEvent1', 'myEvent2']);
   * > myEmitter.emit(['myEvent1', 'myEvent2'], myData);
   *
   * @param  {string|array} events The event(s) to emit.
   * @param  {object?}      data   The data.
   * @return {Emitter}             Returns this.
   */
  Emitter.prototype.emit = function(events, data) {
    var i,
        n,
        j,
        m,
        a,
        event,
        child,
        handlers,
        eventName,
        self = this,
        eArray = typeof events === 'string' ?
          [events] :
          events;

    // Check that the emitter is enabled:
    if (!this._enabled)
      return this;

    data = data === undefined ? {} : data;

    for (i = 0, n = eArray.length; i !== n; i += 1) {
      eventName = eArray[i];
      handlers = (this._handlers[eventName] || []).concat(this._handlersAll);

      if (handlers.length) {
        event = {
          type: eventName,
          data: data || {},
          target: this
        };
        a = [];

        for (j = 0, m = handlers.length; j !== m; j += 1) {
          handlers[j].handler.call(this, event);
          if (!handlers[j].once)
            a.push(handlers[j]);
        }

        this._handlers[eventName] = a;
      }
    }

    // Events propagation:
    for (i = 0, n = this._children.length; i !== n; i += 1) {
      child = this._children[i];
      child.emit.apply(child, arguments);
    }

    return this;
  };


  /**
   * This method creates a new instance of Emitter and binds it as a child. Here
   * is what children do:
   *  - When the parent emits an event, the children will emit the same later
   *  - When a child is killed, it is automatically unreferenced from the parent
   *  - When the parent is killed, all children will be killed as well
   *
   * @return {Emitter} Returns the fresh new child.
   */
  Emitter.prototype.child = function() {
    var self = this,
        child = new Emitter();

    child.on('emmett:kill', function() {
      if (self._children)
        for (var i = 0, l = self._children.length; i < l; i++)
          if (self._children[i] === child) {
            self._children.splice(i, 1);
            break;
          }
    });
    this._children.push(child);

    return child;
  };


  /**
   * This method will first dispatch a "emmett:kill" event, and then unbinds all
   * listeners and make it impossible to ever rebind any listener to any event.
   */
  Emitter.prototype.kill = function() {
    this.emit('emmett:kill');

    this.unbindAll();
    this._handlers = null;
    this._handlersAll = null;
    this._enabled = false;

    if (this._children)
      for (var i = 0, l = this._children.length; i < l; i++)
        this._children[i].kill();

    this._children = null;
  };


  /**
   * This method disabled the emitter, which means its emit method will do
   * nothing.
   *
   * @return {Emitter} Returns this.
   */
  Emitter.prototype.disable = function() {
    this._enabled = false;

    return this;
  };


  /**
   * This method enables the emitter.
   *
   * @return {Emitter} Returns this.
   */
  Emitter.prototype.enable = function() {
    this._enabled = true;

    return this;
  };


  /**
   * Version:
   */
  Emitter.version = '2.0.0';


  // Export:
  artoo.emitter = Emitter;
}).call(this);
