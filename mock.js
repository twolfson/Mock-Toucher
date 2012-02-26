(function () {
  var touchId = 0,
      mice = {};
  function Touch(mouseEvent) {
    var id = touchId;
    this.identifier = id;

    // Save this to the class' hash
    mice[id] = this;

    // Increment the touchId
    touchId += 1;
  }
  /**
   * Static class method to update a mouse action
   * TODO: Complete
   */
  Touch.moveTouch = function (id, mouseEvent) {

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

  document.addEventListener('mousedown', function (e) {
    var touchEvent = new TouchEvent();
    touchEvent.addMouse(e);
    console.log(e);

    document.dispatchEvent(touchEvent.event);
  });

  // document.addEventListener('mousemove', function (e) {
  //   var f = new TouchEvent('touchmove', e);
  //   document.dispatchEvent(f);
  // });

  // document.addEventListener('mouseup', function (e) {
    // var f = new TouchEvent('touchend', e);
    // document.dispatchEvent(f);
  // });

  // TODO: Mouse enter, leave, cancel
}());

/** Touch Event spec **/
// TouchEvent.changedTouches
    // A TouchList of all the Touch objects representing individual points of contact whose states changed between the previous touch event and this one. Read only.
// TouchEvent.targetTouches
    // A TouchList of all the Touch  objects that are both currently in contact with the touch surface and were also started on the same element that is the target of the event. Read only.
// TouchEvent.touches
    // A TouchList of all the Touch  objects representing all current points of contact with the surface, regardless of target or changed status. Read only.

/** Touch spec **/    
// Touch.screenX
    // The X coordinate of the touch point relative to the screen, not including any scroll offset. Read only.
// Touch.screenY
    // The Y coordinate of the touch point relative to the screen, not including any scroll offset. Read only.
// Touch.clientX
    // The X coordinate of the touch point relative to the viewport, not including any scroll offset. Read only.
// Touch.clientY
    // The Y coordinate of the touch point relative to the viewport, not including any scroll offset. Read only.
// Touch.pageX
    // The X coordinate of the touch point relative to the viewport, including any scroll offset. Read only.
// Touch.pageY
    // The Y coordinate of the touch point relative to the viewport, including any scroll offset. Read only.
// Touch.radiusX
    // The X radius of the ellipse that most closely circumscribes the area of contact with the screen. The value is in pixels of the same scale as screenX. Read only.
// Touch.radiusY
    // The Y radius of the ellipse that most closely circumscribes the area of contact with the screen. The value is in pixels of the same scale as screenY. Read only.
// Touch.rotationAngle
    // The angle (in degrees) that the ellipse described by radiusX and radiusY must be rotated, clockwise, to most accurately cover the area of contact between the user and the surface. Read only.
// Touch.force
    // The amount of pressure being applied to the surface by the user, as a float between 0.0 (no pressure) and 1.0 (maximum pressure). Read only.