Mock Toucher [![Donate on Gittip](http://badgr.co/gittip/twolfson.png)](https://www.gittip.com/twolfson/)
============
A TouchEvent testing tool for non-mobile devices. The script is a bookmarklet which fires touch events on elements based on mouse clicks and movements. It additionally supports multiplexing a mouse via <u>shift</u> which allows the user to add additional mouse points. These points can also be removed via <u>ctrl</u>. Unfortunately, browser supports is very limited and has only been tested in Firefox 10.

MDN Demo page: [https://developer.mozilla.org/en-US/demos/detail/mock-toucher/launch](https://developer.mozilla.org/en-US/demos/detail/mock-toucher/launch)

GitHub Demo page: [http://twolfson.github.com/Mock-Toucher/](http://twolfson.github.com/Mock-Toucher/)

Bookmarklet: <a href='javascript:(function(){var d=document,s=d.createElement("script"),t=document.getElementsByTagName("script")[0];s.async=true,s.src="//raw.github.com/twolfson/Mock-Toucher/master/mock.js";t.parentNode.insertBefore(s,t);}());void 0;'>Mock Toucher</a>

This script was written by <a href="http://twolfson.com/">Todd Wolfson</a> for <a href="https://developer.mozilla.org/en-US/demos/devderby">Mozilla Dev Derby February 2012 - Touch Events</a>.

&nbsp;

Things that cause modern-only support
--------------------------------------
 - document.elementFromPoint
 - CSS - pointer-events: none;
 - WeakMap (only one that can easily be replaced)