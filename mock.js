(function () {
  // Set up mouse circle style and constructor
  var mouseCircleStyle = [
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
    'lastPositionX': 0,
    'lastPositionY': 0,
    'moveTo': function (x, y) {
      var circle = this.circle,
          circleStyle = circle.style,
          lastPositionX = this.lastPositionX = x - this.halfHeight,
          lastPositionY = this.lastPositionY = y - this.halfWidth;
      circleStyle.top = y - this.halfWidth + 'px';
      circleStyle.left = x - this.halfHeight + 'px';
    },
    'enableClick': function () {
      this.circle.style.pointerEvents = '';
    },
    'disableClick': function () {
      this.circle.style.pointerEvents = 'none';
    },
    'hide': function () {
      var circle = this.circle,
          circleStyle = circle.style;
      circleStyle.top = '-100px';
      circleStyle.left = '-100px';
    },
    'delete': function () {
      // Remove the circle from the DOM
      document.body.removeChild(this.circle);

      // Delete the internal circle
      delete this.circle;
    },
    'moveToLastPosition': function () {
      this.moveTo(this.lastPositionX, this.lastPositionY);
    },
    'addEventListener': function () {
      var args = [].slice.call(arguments),
          circle = this.circle;
      circle.addEventListener.apply(circle, args);
    },
    'removeEventListener': function () {
      var args = [].slice.call(arguments),
          circle = this.circle;
      circle.removeEventListener.apply(circle, args);
    },
  };

  var touchId = 0,
      mice = {};
  function Touch() {
    // Grab the current id
    var id = touchId;
    this.identifier = id;

    // Create a circle for the item
    this.circle = new MouseCircle();

    // Mouse clicks are very tiny and mono-directional so set up default radii and angle
    this.changeRadius(1, 1);
    this.changeAngle(0);
    this.changeForce(1);

    // Create mouse event store
    this.mouseEvents = [];

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
    'screenX': 0,
    'screenY': 0,
    'clientX': 0,
    'clientY': 0,
    'pageX': 0,
    'pageY': 0,
    'getLastPosition': function () {
      return {'x': this.pageX, 'y': this.pageY};
    },
    'moveRel': function (relX, relY) {
      this.screenX += relX;
      this.screenY += relY;
      this.clientX += relX;
      this.clientY += relY;
      var x = this.pageX = this.pageX + relX,
          y = this.pageY = this.pageY + relY;
      this.circle.moveTo(x, y);
    },
    'moveToEvent': function (mouseEvent) {
      this.screenX = mouseEvent.screenX || 0;
      this.screenY = mouseEvent.screenY || 0;
      this.clientX = mouseEvent.clientX || 0;
      this.clientY = mouseEvent.clientY || 0;
      var x = this.pageX = mouseEvent.pageX || 0,
          y = this.pageY = mouseEvent.pageY || 0;
      this.circle.moveTo(x, y);
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
    },
    'moveToLastPosition': function () {
      this.circle.moveToLastPosition();
    },
    'hide': function () {
      this.circle.hide();
    },
    'delete': function () {
      // Delete the touch from storage
      delete mice[this.identifier];

      // and delete the mouse circle
      this.circle.delete();
    },
    'addMouseEvent': function (fn) {
      // Save the function to cache
      this.mouseEvents.push(fn);

      // Enable clicking on the circle
      this.circle.enableClick();

      // Add the event listener
      this.circle.addEventListener('click', fn, false);
    },
    'clearMouseEvents': function () {
      // Remove all event listeners
      var circle = this.circle,
          mouseEvents = this.mouseEvents,
          i = 0,
          len = mouseEvents.length,
          fn;
      for (; i < len; i++) {
        fn = mouseEvents[i];
        circle.removeEventListener('click', fn, false);
      }
      // Clear out the cache
      this.mouseEvents = [];

      // Disable click
      this.circle.disableClick();
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

    // Set up linked clicks
    this.pseudoClicks = [];
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

      // Update the mouse location
      var mouseTouch = this.mouseTouch;

      // If there is no previous mouseTouch (e.g. it has been deleted or this is a fresh collection)
      if (!mouseTouch) {
        // Set up the mouse for this event
        var touch = new Touch();

        // Add the touch to this touchlist
        this.touchList.add(touch);

        // Save the mouse touch
        mouseTouch = this.mouseTouch = touch;
      }

      var lastMousePosition = mouseTouch.getLastPosition(),
          diffX = mouseEvent.pageX - lastMousePosition.x,
          diffY = mouseEvent.pageY - lastMousePosition.y;

      // Move all cursors relative to the change in the mouseTouch
      this.eachTouch(function (touch, isMouseTouch) {
        touch.moveRel(diffX, diffY);
      });

      // Return this for a fluent interface
      return this;
    },
    'changeType': function (eventType) {
      // Save the type, update, and return
      this.eventType = eventType;
      return this;
    },
    // Sugar function that applies a function to each touch. It is given (touch, isMouseTouch)
    'eachTouch': function (fn) {
      // Call function for each pseudo click
      var clicks = this.pseudoClicks,
          i = 0,
          len = clicks.length,
          click;

      for (; i < len; i++) {
        click = clicks[i];
        fn.call(click, click, false);
      }

      // and once for the mouse touch
      click = this.mouseTouch;
      if (click) {
        fn.call(click, click, true);
      }

      // Fluent interface
      return this;
    },
    'moveToLastPosition': function () {
      // Move all the mouse circles to their respective last positions
      this.eachTouch(function (touch) {
        touch.moveToLastPosition();
      });

      // Fluent interface
      return this;

    },
    'hideAll': function () {
      // Hide all the mouse circles
      this.eachTouch(function (touch) {
        touch.hide();
      });

      // Fluent interface
      return this;
    },
    'addTouch': function (touch, saveAsMouseTouch) {
      // Save the pseudo click as the touch
      var pseudoClick = touch;

      // If we are to overwrite the mouse touch, do so
      if (saveAsMouseTouch === true) {
        pseudoClick = this.mouseTouch;
        this.mouseTouch = touch;
      }

      // Save the pseudo click as a pseudo click
      if (pseudoClick) {
        this.pseudoClicks.push(pseudoClick);
      }

      // Add the click to our touch list
      this.touchList.add(touch);

      // Fluent interface
      return this;
    },
    'removeTouch': function (touch) {
      var clicks = this.pseudoClicks,
          i,
          len;

      // If we are erasing the mouse touch
      if (touch === this.mouseTouch) {
        // Fallback on the last pseudoClick (this may be null)
        this.mouseTouch = clicks.pop();
      } else {
      // Otherwise, remove the item from the pseudoClicks
        for (i = 0, len = clicks.length; i < len; i++) {
          if (clicks[i] === touch) {
            clicks.splice(i, 1);
            break;
          }
        }
      }

      // Remove the item from the touchList
      this.touchList.remove(touch);

      // Delete the touch
      touch.delete();

      // Fluent interface
      return this;
    },
    'start': function (mouseEvent) {
      // Change the event type
      this.changeType('touchstart');

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

      // Hide all circles
      this.hideAll();

      // Fluent interface
      return this;
    }
  };

  function noop() {}
  function MockToucher(elt) {
    // Generate our global touch collection
    var touchCollection = new TouchCollection(),
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

            // And dispatch the event
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
    elt.addEventListener('mousedown', mouseDown, false);

    function keyDown(e) {
      // If either shift or ctrl is pressed AND the mouse is not currently moving
      var ctrlKey = e.ctrlKey,
          shiftKey = e.shiftKey;
      if (ctrlKey === true || shiftKey === true && mouseMove === noop) {
        // Prevent any additional keydowns
        document.removeEventListener('keydown', keyDown, false);

        // Unbind mousedown handler
        elt.removeEventListener('mousedown', mouseDown, false);

        // Show current touch collection
        touchCollection.moveToLastPosition();

        // If shift is pressed
        if (shiftKey === true) {
          // Create a touch stub variable
          var touch;

          // When the mouse is moved
          var shiftMouseMove = function (e) {
                // If there is no touch, create one
                if (!touch) {
                  touch = new Touch();
                }

                // Move the new touch as well
                touch.moveToEvent(e);
              },
          // When the mouse is clicked
              shiftMouseClick = function (e) {
                if (touch) {
                  // Add the touch to the collection
                  touchCollection.addTouch(touch, true);

                  // and break memory connection to the touch
                  touch = null;
                }
              };

          // Bind the previous functions appropriately
          elt.addEventListener('mousemove', shiftMouseMove, false);
          elt.addEventListener('click', shiftMouseClick, false);

          // When the shift key is released
          function shiftKeyUp(e) {
            if (e.shiftKey === false) {
              // Remove the mousemove handler
              elt.removeEventListener('mousemove', shiftMouseMove, false);

              // Remove the click handler
              elt.removeEventListener('click', shiftMouseClick, false);

              // Remove the key up handler
              document.removeEventListener('keyup', shiftKeyUp, false);

              // Delete the touch
              if (touch) {
                touch.delete();
              }
            }
          }

          // Set up the key release binding
          document.addEventListener('keyup', shiftKeyUp, false);
        } else {
        // Otherwise...
          touchCollection.eachTouch(function (touch) {
            // When a touch is clicked on
            touch.addMouseEvent(function () {
              // Remove it from the collection
              touchCollection.removeTouch(touch);
            });
          });

          // On ctrl key release
          function ctrlKeyUp(e) {
            if (e.ctrlKey === false) {
              // Stop listening to mouse events on the touch collection
              touchCollection.eachTouch(function (touch) {
                touch.clearMouseEvents();
              });

              // Remove the key up handler
              document.removeEventListener('keyup', ctrlKeyUp, false);
            }
          }

          // Bind ctrl key listener
          document.addEventListener('keyup', ctrlKeyUp, false);
        }
      }

      // When ctrl and/or shift is released
      function keyUp(e) {
        if ((shiftKey === true && e.shiftKey === false) || (ctrlKey === true && e.ctrlKey === false)) {
          // Rebind the keyDown handler
          document.addEventListener('keydown', keyDown, false);

          // Rebind the mousedown handler
          elt.addEventListener('mousedown', mouseDown, false);

          // Unbind this handler
          document.removeEventListener('keyup', keyUp, false);

          // Hide the cursors
          touchCollection.hideAll();
        }
      }

      // Bind the key release listener to the DOM
      document.addEventListener('keyup', keyUp, false);
    }

    // Bind the key press listener to the DOM
    document.addEventListener('keydown', keyDown, false);

    // Add a custom deletion function properties for deletion
    this.delete = function () {
      document.removeEventListener('keydown', keyDown, false);
      elt.removeEventListener('mousedown', mouseDown, false);
      if (mouseMove !== noop) {
        elt.removeEventListener('mousemove', mouseMove, false);
      }
      if (mouseUp !== noop) {
        elt.removeEventListener('mouseup', mouseUp, false);
      }
    }
  };

  // Overlay business
  var overlay = document.createElement('div'),
      overlayHidden = document.createElement('div'),
      overlayStyle = 'position: absolute; top: 20px; left: 0; background: linen; border: 1px solid purple; border-left: 0; padding: 5px; overflow: hidden;',
      lastMocker;
  overlay.setAttribute('style', overlayStyle);
  overlayHidden.setAttribute('style', overlayStyle + '; display: none; background: limegreen; color: purple; cursor: pointer; padding: 0; font-size: .5em;');
  overlay.innerHTML = ['<div style="text-align: center; color: purple;"><strong>Mock Toucher</strong></div>',
    '<div>&nbsp;</div>',
    '<div>',
      '<label for="MOCKTOUCHERcssSelector">CSS Selector: </label>',
      '<input type="text" id="MOCKTOUCHERcssSelector" name="MOCKTOUCHERcssSelector" value="canvas"/>',
    '</div>',
    '<div>Only applies to first element</div>',
    '<div>&nbsp;</div>',
    '<div>',
      '<label for="MOCKTOUCHERshowCircles">Show circles: </label>',
      '<input type="checkbox" id="MOCKTOUCHERshowCircles" name="MOCKTOUCHERshowCircles" selected="selected"/>',
    '</div>',
    '<div>&nbsp;</div>',
    '<div style="text-align: center"><span id="MOCKTOUCHERhideText" style="color: red; text-decoration: underline; cursor: pointer;">Hide Panel</span></div>'].join('');
  overlayHidden.innerHTML = '&raquo;';
  // overlayHidden.innerHTML = '<div>M</div><div>O</div><div>C</div><div>K</div><div>&nbsp;</div><div>T</div><div>O</div><div>U</div><div>C</div><div>H</div><div>E</div><div>R</div>';
  document.body.appendChild(overlay);
  document.body.appendChild(overlayHidden);
  
  // Bindings for overlay
  var cssSelector = document.getElementById('MOCKTOUCHERcssSelector'),
      showCircles = document.getElementById('MOCKTOUCHERshowCircles'),
      hideText = document.getElementById('MOCKTOUCHERhideText');
      
  function ex(fn) {
    fn();
    return fn;
  }
  
  // When the CSS selector is changed
  cssSelector.onchange = ex(function () {
    // Get the query
    var query = cssSelector.value,
        elt;
    
    // Attempt to select the element
    try {
      elt = document.querySelector(query);
    } catch (e) {}
    
    // If there was a last MockToucher, delete it
    if (lastMocker) {
      lastMocker.delete();
      lastMocker = null;
    }
    
    // If a new element has been found
    if (elt) {
      // Create and save the new MockToucher for it
      lastMocker = new MockToucher(elt);
    }
  });
  
  // TODO: Show circles logic
  showCircles.onchange = function () {
  };
  
  // Hide logic
  hideText.onclick = function () {
    overlay.style.display = 'none';
    overlayHidden.style.display = '';
  };
  overlayHidden.onclick = function () {
    overlay.style.display = '';
    overlayHidden.style.display = 'none';
  };
}());

// TODO: Mouse enter, leave, cancel
// TODO: Selector panel should have checkbox for 'show circles' which adds display: none
// TODO: Convert into bookmarklet