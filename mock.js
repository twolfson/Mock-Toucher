(function () {
  var touchId = 0,
      mice = {};
  function Touch(mouseEvent) {
    // Fallback mouseEvent
    mouseEvent = mouseEvent || {};

    // Grab the current id
    var id = touchId;
    this.identifier = id;

    // Update the touch's details with the mouseEvent
    this.update(mouseEvent);

    // Mouse clicks are very tiny and mono-directional so set up default radii and angle
    this.changeRadius(1, 1);
    this.changeAngle(0);
    this.changeForce(1);

    // Save this to the class' hash
    mice[id] = this;

    // Increment the touchId
    touchId += 1;
  }
  /**
   * Static class method to update a mouse action
   */
  Touch.moveTouch = function (id, mouseEvent) {
    mice[id].update(mouseEvent);
  };
  Touch.prototype = {
    'update': function (mouseEvent) {
      this.screenX = mouseEvent.screenX || 0;
      this.screenY = mouseEvent.screenY || 0;
      this.clientX = mouseEvent.clientX || 0;
      this.clientY = mouseEvent.clientY || 0;
      this.pageX = mouseEvent.pageX || 0;
      this.pageY = mouseEvent.pageY || 0;
    },
    'changeRadius': function (radiusX, radiusY) {
      this.radiusX = radiusX;
      this.radiusy = radiusY;
    },
    'changeAngle': function (rotAngle) {
      this.rotationAngle = rotAngle;
    },
    'changeForce': function (force) {
      this.force = force;
    }
  };

  // Set up mouse circle style and constructor
  mouseCircleStyle = [
    "position: absolute; top: -100px; left: -100px",
    "width: 50px; height: 50px",
    "border-radius: 50%; -webkit-border-radius: 50%; -moz-border-radius: 50%",
    "background: red; opacity: 0.5",
    "pointer-events: none"].join('; ');
  function MouseCircle() {
    var circle = this.circle = document.createElement('div');
    circle.setAttribute('style', mouseCircleStyle);
    document.body.appendChild(circle);
  }
  MouseCircle.prototype = {
    'width': 50,
    'height': 50,
    'halfWidth': 25,
    'halfHeight': 25,
    'moveTo': function (x, y) {
      var circle = this.circle,
          circleStyle = circle.style;
      circleStyle.top = y - this.halfWidth + 'px';
      circleStyle.left = x - this.halfHeight + 'px';
    },
    'hide': function () {
      var circle = this.circle,
          circleStyle = circle.style;
      circleStyle.top = '-100px';
      circleStyle.left = '-100px';
    },
    'delete': function () {
      document.body.removeChild(this.circle);
      delete this.circle;
    }
  };

  /**
   * Constructor for TouchList
   * @constructor
   */
  function TouchList() {
    this.length = 0;
    this._items = [];
  }
  TouchList.prototype = {
    /**
     * Update function for accessors
     * @returns this
     */
    'update': function () {
      // Localize items and get the length
      var items = this._items,
          _len = this.length,
          len = items.length,
          i;

      // If there are fewer items on the list, delete the excess items
      if (_len > len) {
        for (i = len + 1; i < _len; i++) {
          delete this[i];
        }
      }

      // Overwrite all items
      for (i = 0, len = items.length; i < len; i++) {
        this[i] = items[i];
      }

      // Save the new length
      this.length = len;

      // Return this for a fluent interface
      return this;
    },
    /**
     * Addition method for 'Touch's
     * @param {Object<Touch>} touch Touch to add to the list
     * @returns this
     */
    'add': function (touch) {
      // Add the items to the list
      this._items.push(touch);

      // Update the list
      this.update();

      // Return this for a fluent interface
      return this;
    },
    /**
     * Removal method for 'Touch's
     * @param {Object<Touch>} touch Touch to remove from the list
     * @returns this
     */
    'remove': function (touch) {
      // Search the list for the item (avoiding indexOf for one less cross-browser issue)
      var items = this._items,
          i = 0,
          len = items.length;
      for (; i < len; i++) {
        // If the item matches
        if (items[i] === touch) {
          // Remove it from the array and break out of the loop
          items.splice(i, 1);
          break;
        }
      }

      // Return this for a fluent interface
      return this;
    },
    /**
     * Item method as specified by MDN
     * @param {Number} index Index of touch to return
     * @returns {Object<Touch>|undefined} Touch at the specified index
     * TODO: Find out what proper action is for an invalid index
     */
    'item': function (index) {
      return this[index];
    },
    /**
     * Identified touch method as specified by MDN
     * @param {Number} id Identifier of touch to retrieve
     * @returns {Object<Touch>|undefined} Touch at the specified index
     * TODO: Find out what proper action is for an invalid index
     */
    'identifiedTouch': function (id) {
      // Search the list for the item
      var items = this._items,
          i = 0,
          len = items.length,
          item;
      for (; i < len; i++) {
        item = items[i];
        // If the item matches
        if (item.identifier === id) {
          // Return the item
          return item;
        }
      }

      // Otherwise, return undefined
      return;
    }
  };

  function TouchCollection() {
    // Generate a TouchList for this event
    this.touchList = new TouchList();

    // Set up the mouse for this event
    var touch = new Touch();

    // Add the touch to this touchlist
    this.touchList.add(touch);

    // Save the mouse identifer
    this.mouseId = touch.identifier;
  }
  TouchCollection.prototype = {
    'eventType': 'touchstart',
    'update': function (mouseEvent) {
      var eventType = this.eventType,
      // Create a generic event
          event = document.createEvent('Events');
      event.initEvent(eventType, mouseEvent.bubbles, mouseEvent.cancealable);

      // Generate TouchCollection keys as properties
      event.altKey = mouseEvent.altKey;
      event.ctrlKey = mouseEvent.ctrlKey;
      event.shiftKey = mouseEvent.shiftKey;
      event.metaKey = mouseEvent.metaKey;

      // Define the event type as a property
      event.type = eventType;

      // Due to the nature of one click, we will have these all be equal for now
      // TODO: If there is the ability for a touch to become fixed, start updating these
      // Should be a comparison of the old touch location vs new touch location
      event.changedTouches = event.targetTouches = event.touches = this.touchList;

      // Save the event to this
      this.event = event;

      // Update the mouse circle location
      Touch.moveTouch(this.mouseId, mouseEvent);
      // TODO: Move all relatively

      // Return this for a fluent interface
      return this;
    },
    'changeType': function (eventType) {
      // Save the type, update, and return
      this.eventType = eventType;
      return this;
    },
    'start': function (mouseEvent) {
      // Change the event type
      this.changeType('touchstart');

      // TODO: Show all circles (method showAll)

      // Update this event
      this.update(mouseEvent);

      // Fluent interface
      return this;
    },
    'moveMouseTo': function (mouseEvent) {
      // Change the event type
      this.changeType('touchmove');

      // Update this event
      this.update(mouseEvent);

      // Fluent interface
      return this;
    },
    'end': function (mouseEvent) {
      // Change the event type
      this.changeType('touchend');

      // Update this event
      this.update(mouseEvent);

      // TODO: Hide all circles (method hideAll)

      // Fluent interface
      return this;
    }
  };

  // Generate our global touch collection
  var touchCollection = new TouchCollection();

  // document.addEventListener('mousedown', function (e) {
  function noop() {}
  var elt = document.getElementById('example'),
      mouseMove = noop,
      mouseUp = noop,
      mouseDown = function (e) {
        // Start the mouse click
        touchCollection.start(e);

        // And dispatch the event
        elt.dispatchEvent(touchCollection.event);

        // For a touch move, enter, leave, etc to occur a touch must currently be happening
        // Set up event functions for binding and removal
        mouseMove = function (e) {
          // When the mouse moves, move the collection
          touchCollection.moveMouseTo(e);

          // And dispatch the event
          elt.dispatchEvent(touchCollection.event);
        }

        mouseUp = function (e) {
          // When the mouse is lifted, end the movement
          touchCollection.end(e);

          elt.dispatchEvent(touchCollection.event);

          // Remove the event listeners
          elt.removeEventListener('mousemove', mouseMove, false);
          elt.removeEventListener('mouseup', mouseUp, false);

          // and prevent any accidental calls
          mouseMove = noop;
          mouseUp = noop;
        }

        // Add the motion and end event listeners
        elt.addEventListener('mousemove', mouseMove, false);
        elt.addEventListener('mouseup', mouseUp, false);
      };

  // Begin listening for mousedown actions on the select element
  elt.addEventListener('mousedown', mouseDown);

  // TODO: Mouse enter, leave, cancel
  // TODO: Movement of a mouse should be handled by TouchCollection to update the proper pieces accordingly
  // TODO: Element selector panel -- allow for CSS query or visual binding (abs position overlay)
  document.onkeydown = function (e) {
    // Shift = 16, Ctrl = 17;
    console.log(e.keyCode);
  };
}());

// We are designing for one mouse that can be multiplexed
// This means we have one mouse as the center of all actions
// We will use things like shift to add new clicks and ctrl to remove them
// Alt will be for editing a click - e.g. radius (maybe via a popup slider)

// When the mouse is clicked, all cursors should appear and drag with the content
// When shift is pressed, all cursors should appear (relative to the mouse position) and stay fixed in place as long as shift is held
// Any mouseup's during shift will add a new cursor at that location (this is to allow for hot-resumes)
// Ctrl will have the same effect but for subtraction (this will require removing pointer events)