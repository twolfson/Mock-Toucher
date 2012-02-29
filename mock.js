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
      this.updateTarget();
      this.circle.moveTo(x, y);
    },
    'moveToEvent': function (mouseEvent) {
      this.screenX = mouseEvent.screenX || 0;
      this.screenY = mouseEvent.screenY || 0;
      this.clientX = mouseEvent.clientX || 0;
      this.clientY = mouseEvent.clientY || 0;
      var x = this.pageX = mouseEvent.pageX || 0,
          y = this.pageY = mouseEvent.pageY || 0;
      this.updateTarget();
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
    'updateTarget': function () {
      var target = this.target,
          position = this.getLastPosition();
      this.lastTarget = target;
      this.target = document.elementFromPoint(position.x, position.y);
    },
    'moveToLastPosition': function () {
      this.circle.moveToLastPosition();
    },
    'hide': function () {
      // Hide the circle
      this.circle.hide();

      // Remove the last target (since now there is none)
      delete this.lastTarget;
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

  // Set up a Set constructor
  function Set() {
    this.length = 0;
  }
  Set.prototype = {
    'add': function (item) {
      var inArr = this.indexOf(item) >= 0;

      // If the item is not in the array
      if (inArr === false) {
        // Add it to the set
        this[this.length] = item;

        // and update the length
        this.length += 1;
      }
    },
    'indexOf': function (item) {
      var i = 0,
          len = this.length,
          index = -1;

      // Go through the current items
      for (; i < len; i++) {
        // If the item exists
        if (item === this[i]) {
          // Update the index and stop searching
          index = i;
          break;
        }
      }

      return index;
    }
  }

  function TouchCollection() {
    // Set up linked clicks
    this.pseudoClicks = [];
  }
  TouchCollection.prototype = {
    'eventType': 'touchstart',
    'update': function (mouseEvent) {
      // Update the mouse location
      var mouseTouch = this.mouseTouch;

      // If there is no previous mouseTouch (e.g. it has been deleted or this is a fresh collection)
      if (!mouseTouch) {
        // Set up the mouse for this event
        var touch = new Touch();

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

      // Generate a TouchList of all touches
      var touches = new TouchList();
      this.eachTouch(function (touch) { touches.add(touch); });

      // TODO: Create own WeakMap
      // Generate a weak map for all targets and collection of all targets
      var targetMap = new WeakMap(),
          targets = this.targets = new Set();

      // Loop through all touches
      this.eachTouch(function (touch) {
        // Put in a stub map of touches for the current and last target
        var lastTarget = touch.lastTarget,
            target = touch.target;

        // If the target is not off screen
        if (target) {
          targetMap.set(target, {'same': [], 'add': [], 'rem': []});
          targets.add(target);
        }

        // If the there was a last target
        if (lastTarget) {
          targetMap.set(lastTarget, {'same': [], 'add': [], 'rem': []});
          targets.add(lastTarget);
        }
      });

      // Loop through all touches again
      this.eachTouch(function (touch) {
        // Get the last target, current target, and if it has changed
        var lastTarget = touch.lastTarget,
            target = touch.target,
            thereIsATarget = !!target;
            thereWasALastTarget = !!lastTarget;

        // D E = Does not exist, DNE = does not exist
        // Target D E, lastTarget D E, target === lastTarget ->       same / target
        // Target D E, lastTarget D E, target !== lastTarget -> add target / remove lastTarget
        // Target D E, lastTarget DNE, target === lastTarget -> Not possible
        // Target D E, lastTarget DNE, target !== lastTarget -> add target
        // Target DNE, lastTarget D E, target === lastTarget -> Not possible
        // Target DNE, lastTarget D E, target !== lastTarget ->            / remove lastTarget
        // Target DNE, lastTarget DNE, target === lastTarget -> Not relevant
        // Target DNE, lastTarget DNE, target !== lastTarget -> Not possible
        
        // There is no possibility for duplication within the arrays since touches are unique

        // If the touch has a target
        if (thereIsATarget) {
          // If the touch had a last target
          if (thereWasALastTarget) {
            // If the target is the same, add to the same array
            if (target === lastTarget) {
              targetMap.get(target).same.push(touch);
            } else {
            // Otherwise, add to add and remove arrays respectively
              targetMap.get(target).add.push(touch);
              targetMap.get(lastTarget).rem.push(touch);
            }
          } else {
          // Otherwise, add the target to the add array
            targetMap.get(target).add.push(touch);
          }
        } else if (thereWasALastTarget) {
        // Otherwise, if the touch had a last target
          // Add the touch to the rem array of the lastTarget
          targetMap.get(lastTarget).rem.push(touch);
        }
      });

      // Time to create some events and their corresponding TouchLists
      // Iterate the targets
      var eventType = this.eventType,
          i = 0,
          len = targets.length,
          target,
          event,
          targetEventArr = [],
      // By default, don't do any filtering (e.g. touchstart, touchend)
          eventFilterArr = [{'eventType': eventType, 'filter': function (changeObj) {
            var retArr = [].concat(changeObj.add).concat(changeObj.same).concat(changeObj.rem);
            return retArr;
          }}],
          j,
          len2,
          eventFilter,
          eventType;

      // TODO: Change filterArr if we are looping through a mousemove
      if (eventType === 'touchmove') {
        eventFilterArr = [{
          'eventType': 'touchmove',
          'filter': function (changeObj) {
            return changeObj.same;
          }
        }, {
          'eventType': 'touchenter',
          'filter': function (changeObj) {
            return changeObj.add;
          }
        }, {
          'eventType': 'touchleave',
          'filter': function (changeObj) {
            return changeObj.rem;
          }
        }];
      }
      // TODO: Touchcancel (see how document.blur works)

      /* TouchEvent.changedTouches
          A TouchList of all the Touch objects representing individual points of contact
          whose states changed between the previous touch event and this one. Read only. */
      /* TouchEvent.targetTouches
          A TouchList of all the Touch  objects that are both currently in contact with the touch surface
          and were also started on the same element that is the target of the event. Read only. */
      /* TouchEvent.touches
          A TouchList of all the Touch  objects representing all current points of contact
          with the surface, regardless of target or changed status. Read only. */

      for (; i < len; i++) {
        target = targets[i];
        
        // Go through each event
        for (j = 0, len2 = eventFilterArr.length; j < len2; j++) {
          eventFilter = eventFilterArr[j];
          eventType = eventFilter.eventType;

          // Create a generic event
          event = document.createEvent('Events');

          // TODO: Conditional mousemove logic
          event.initEvent(eventType, mouseEvent.bubbles, mouseEvent.cancealable);

          // Generate TouchCollection keys as properties
          event.altKey = mouseEvent.altKey;
          event.ctrlKey = mouseEvent.ctrlKey;
          event.shiftKey = mouseEvent.shiftKey;
          event.metaKey = mouseEvent.metaKey;

          // Define the event type as a property
          event.type = eventType;

          // TODO: Ask MDN about what they mean about 'started on the same elements' for targetTouches. 'Currently on' would make a lot more sense.
          // TODO: Switch over to .initialTarget tracking if MDN comes back with 'started on'.
          // Since any action affects all clicks, assume that changedTouches = touches
          // TODO: If there is the ability for a touch to become fixed, start updating these
          // Should be a comparison of the old touch location vs new touch location (this will require semantic repair of .getLastLocation to .getRestoreLocation)
          event.changedTouches = event.targetTouches = event.touches = touches;

          // Save the event to an array
          targetEventArr.push({'target': target, 'event': event});
        }
      }

      // Save the events for dispatching
      this.events = targetEventArr;

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
    },
    'dispatchEvents': function () {
      // Take the list of events and their targets
      var events = this.events,
          event,
          i = 0,
          len = events.length;

      // Iterate the events and targets
      for (; i < len; i++) {
        // Dispatch each event to its respective target
        event = events[i];
        event.target.dispatchEvent(event.event);
      }

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
          touchCollection.dispatchEvents();

          // For a touch move, enter, leave, etc to occur a touch must currently be happening
          // Set up event functions for binding and removal
          mouseMove = function (e) {
            // When the mouse moves, move the collection
            touchCollection.moveMouseTo(e);

            // And dispatch the event
            touchCollection.dispatchEvents();
          }

          mouseUp = function (e) {
            // When the mouse is lifted, end the movement
            touchCollection.end(e);

            // And dispatch the event
            touchCollection.dispatchEvents();

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
  overlay.id = 'MOCKTOUCHERoverlay';
  overlayHidden.id = 'MOCKTOUCHERoverlayHidden';
  overlay.setAttribute('style', overlayStyle);
  overlayHidden.setAttribute('style', overlayStyle + '; display: none; background: limegreen; color: purple; cursor: pointer; padding: 0; font-size: .5em;');
  overlay.innerHTML = ['<div style="text-align: center; color: purple;"><strong>Mock Toucher</strong> by <a href="http://twolfson.com/" target="_blank">Todd Wolfson</a></div>',
    // '<div>&nbsp;</div>',
    // '<div>',
      // '<label for="MOCKTOUCHERshowCircles">Show circles: </label>',
      // '<input type="checkbox" id="MOCKTOUCHERshowCircles" name="MOCKTOUCHERshowCircles" checked="checked"/>',
    // '</div>',
    // '<div>&nbsp;</div>',
    '<div style="text-align: center"><span id="MOCKTOUCHERhideText" style="color: red; text-decoration: underline; cursor: pointer;">Hide Panel</span></div>'].join('');
  overlayHidden.innerHTML = '&raquo;';
  // overlayHidden.innerHTML = '<div>M</div><div>O</div><div>C</div><div>K</div><div>&nbsp;</div><div>T</div><div>O</div><div>U</div><div>C</div><div>H</div><div>E</div><div>R</div>';
  document.body.appendChild(overlay);
  document.body.appendChild(overlayHidden);

  // Bindings for overlay
  var cssSelector = document.getElementById('MOCKTOUCHERcssSelector'),
      // showCircles = document.getElementById('MOCKTOUCHERshowCircles'),
      hideText = document.getElementById('MOCKTOUCHERhideText');

  function ex(fn) {
    fn();
    return fn;
  }

  // When the CSS selector is changed
  lastMocker = new MockToucher(document);
  // cssSelector.onchange = ex(function () {
    // // Get the query
    // var query = cssSelector.value,
        // elt;

    // // Attempt to select the element
    // try {
      // elt = document.querySelector(query);
    // } catch (e) {}

    // // If there was a last MockToucher, delete it
    // if (lastMocker) {
      // lastMocker.delete();
      // lastMocker = null;
    // }

    // // If a new element has been found
    // if (elt) {
      // // Create and save the new MockToucher for it
      // lastMocker = new MockToucher(elt);
    // }
  // });

  // // Show circles logic
  // showCircles.onclick = function () {
  // };

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