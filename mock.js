(function () {
  function MockEvent(eventType, baseEvent) {
    // Create a generic event based off of the original event
    var mockEvent = document.createEvent('Events');
    mockEvent.initEvent(eventType, true, true);

    // Copy remaining event properties
    for (key in baseEvent) {
      // Do not to .hasOwnProperty check since we want to be as accurate as possible?
      mockEvent[key] = baseEvent[key];
    }

    // TODO: Create TouchEvent properties

    return mockEvent;
  }

  document.addEventListener('mousedown', function (e) {
    var f = MockEvent('touchstart', e);
    console.log(f);
    document.dispatchEvent(f);
  });

  document.addEventListener('mousemove', function (e) {
    var f = MockEvent('touchmove', e);
    document.dispatchEvent(f);
  });

  document.addEventListener('mouseup', function (e) {
    var f = MockEvent('touchend', e);
    document.dispatchEvent(f);
  });
}());