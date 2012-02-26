(function () {
  var touchId = 0;
  function Touch() {
    this.identitifer = touchId++;
  }

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
    }
  };

  function TouchEvent(eventType, mouseEvent) {
    // Create a generic event based off of the original event
    var event = document.createEvent('Events');
    event.initEvent(eventType, mouseEvent.bubbles, mouseEvent.cancealable);

    // Generate TouchEvent keys as properties
    event.altKey = mouseEvent.altKey;
    event.ctrlKey = mouseEvent.ctrlKey;
    event.shiftKey = mouseEvent.shiftKey;
    event.metaKey = mouseEvent.metaKey;

    // Define the event type as a property
    event.type = eventType;

    // Generate TouchList
    var touchList = new TouchList(),
        touch = new Touch();
    touchList.add(touch);

    // Due to the nature of one click, we will have these all be equal for now
    event.changedTouches = event.targetTouches = event.touches = touchList;

    return event;
  }

  document.addEventListener('mousedown', function (e) {
    var f = TouchEvent('touchstart', e);
    console.log(e);
    document.dispatchEvent(f);
  });

  // document.addEventListener('mousemove', function (e) {
  //   var f = TouchEvent('touchmove', e);
  //   document.dispatchEvent(f);
  // });

  document.addEventListener('mouseup', function (e) {
    var f = TouchEvent('touchend', e);
    document.dispatchEvent(f);
  });

  // TODO: Mouse enter, leave, cancel
}());

/** Touch Event spec **/
// TouchEvent.changedTouches
    // A TouchList of all the Touch objects representing individual points of contact whose states changed between the previous touch event and this one. Read only.
// TouchEvent.targetTouches
    // A TouchList of all the Touch  objects that are both currently in contact with the touch surface and were also started on the same element that is the target of the event. Read only.
// TouchEvent.touches
    // A TouchList of all the Touch  objects representing all current points of contact with the surface, regardless of target or changed status. Read only.