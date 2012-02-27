(function () {
  var touchId = 0,
      mice = {};
  function Touch(mouseEvent) {
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
      this.screenX = mouseEvent.screenX;
      this.screenY = mouseEvent.screenY;
      this.clientX = mouseEvent.clientX;
      this.clientY = mouseEvent.clientY;
      this.pageX = mouseEvent.pageX;
      this.pageY = mouseEvent.pageY;
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
    'item': function (id) {
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

  function TouchEvent() {
    // Generate a TouchList for this event
    this.touchList = new TouchList();
  }
  TouchEvent.prototype = {
    'eventType': 'touchstart',
    'update': function () {
      // Localize the last mouse event
      var mouseEvent = this.lastMouse,
          eventType = this.eventType,
      // Create a generic event
          event = document.createEvent('Events');
      event.initEvent(eventType, mouseEvent.bubbles, mouseEvent.cancealable);

      // Generate TouchEvent keys as properties
      event.altKey = mouseEvent.altKey;
      event.ctrlKey = mouseEvent.ctrlKey;
      event.shiftKey = mouseEvent.shiftKey;
      event.metaKey = mouseEvent.metaKey;

      // Define the event type as a property
      event.type = eventType;

      // Due to the nature of one click, we will have these all be equal for now
      event.changedTouches = event.targetTouches = event.touches = this.touchList;

      // Save the event to this
      this.event = event;

      // Return this for a fluent interface
      return this;
    },
    'changeType': function (eventType) {
      // Save the type, update, and return
      this.eventType = eventType;
      this.update();
      return this;
    },
    'addMouse': function (mouseEvent) {
      // Generate a new touch with the mouse event
      var touch = new Touch(mouseEvent);

      // Add the touch to this touchlist
      this.touchList.add(touch);

      // Save this mouse event to this
      this.lastMouse = mouseEvent;

      // Update this
      this.update();

      // Return the touch's identifier
      return touch.identifier;
    }
  };

  // document.addEventListener('mousedown', function (e) {
  document.getElementById('example').addEventListener('mousedown', function (e) {
    var elt = this,
        touchEvent = new TouchEvent(),
        mouseId = touchEvent.addMouse(e);

    elt.dispatchEvent(touchEvent.event);

    // For a touch move, enter, leave, etc to occur a touch must currently be happening
    // Set up event functions for binding and removal
    function mouseMove(e) {
      touchEvent.changeType('touchmove');
      Touch.moveTouch(mouseId, e);
      elt.dispatchEvent(touchEvent.event);
    }

    function mouseUp(e) {
      touchEvent.changeType('touchend');
      Touch.moveTouch(mouseId, e);
      elt.dispatchEvent(touchEvent.event);

      // Remove the event listeners
      elt.removeEventListener('mousemove', mouseMove, false);
      elt.removeEventListener('mouseup', mouseUp, false);
    }

    // Add the motion and end event listeners
    elt.addEventListener('mousemove', mouseMove, false);
    elt.addEventListener('mouseup', mouseUp, false);
  });

  // TODO: Mouse enter, leave, cancel
  // TODO: Movement of a mouse should be handled by TouchEvent to update the proper pieces accordingly
}());

// We are designing for one mouse that can be multiplexed
// This means we have one mouse as the center of all actions
// We will use things like shift to add new clicks and ctrl to remove them
// Alt will be for editing a click - e.g. radius (maybe via a popup slider)