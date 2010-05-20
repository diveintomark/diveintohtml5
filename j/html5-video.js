/*
html5-video.js
Lets you pretend that <video> works in IE (via Flash and FlowPlayer)

NOTE: AS OF MAY 2010, THIS CODE IS DEPRECATED.
I NO LONGER RECOMMEND USING IT FOR ANY PURPOSE.
IT IS INCLUDED HERE SIMPLY SO OLD LINKS TO IT DO NOT BREAK.
SEE http://diveintohtml5.org/video.html#example
OR  http://camendesign.com/code/video_for_everybody/test.html
FOR A BETTER SOLUTION TO FALL BACK TO FLASH VIDEO.

Copyright (c) 2009, Mark Pilgrim, All rights reserved.

Redistribution and use in source and binary forms, with or without modification,
are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice,
  this list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS 'AS IS'
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
POSSIBILITY OF SUCH DAMAGE.
*/

/* This is really the only configuration option available.
   This URL is relative to your HTML page, not this script. */
var FLOWPLAYER_URL = "j/flowplayer-3.1.4.swf";
 
function html5_video_replace(video, index) {
  /* find a video source that Flash can play */
  var video_url = "";
  var sources = video.getElementsByTagName("source");
  for (var i = 0; i < sources.length; i++) {
    var source = sources[i];
    var type = source.getAttribute("type");
    type = type.toLowerCase();
    type = type.split(";", 1)[0];
    if (type == "video/mp4") {
      video_url = source.getAttribute("src");
      if (video_url.substring(0, 2) == "//") {
        video_url = document.location.protocol + video_url;
      }
      break;
    }
  }
  if (video_url) {
    /* get info about the video */
    var video_id = video.getAttribute("id");
    var video_width = video.getAttribute("width");
    var video_height = video.getAttribute("height");
    var video_autoplay = video.getAttribute("autoplay") != null;
    var video_preload = (video.getAttribute("preload") != null) ? (video.getAttribute("preload") == "auto") : false;
    var video_controls = (video.getAttribute("controls") != null) ? {autoHide:"always",hideDelay:1000} : null;
 
    /* create a dummy div for Flowplayer to use */
    video.innerHTML = "<div id=video" + index + "fallback style=" +
                      "width:" + video_width + "px;" + 
                      "height:" + video_height + "px></div>";

    /* play the video */
    flowplayer("video" + index + "fallback", {
      src: FLOWPLAYER_URL,
      version: [9, 115]
    }, {
      clip: {
        url: video_url,
        autoPlay: video_autoplay,
        autoBuffering: video_preload
      },
      plugins: {
        controls: video_controls
      }
    });
  }
}
function html5_video_init() {
  if (!!!document.createElement('video').canPlayType) {
    /* no HTML5 video support; let's try Flash */
    var videos = document.getElementsByTagName("video");
    for (var i = 0; i < videos.length; i++) {
      var video = videos[i];
      if (!!video.getAttribute("id")) {
        video.id = "video" + i;
      }
      html5_video_replace(video, i);
    }
  }
}
if (!!$ && !!$(document).ready) {
  /* jQuery users can initialize as soon as the DOM is ready */
  $(document).ready(html5_video_init);
} else {
  /* Everyone else can wait until onload */
  /* addEvent function via http://www.ilfilosofo.com/blog/2008/04/14/addevent-preserving-this/ */
  var addEvent = function( obj, type, fn ) {
    if (obj.addEventListener)
      obj.addEventListener(type, fn, false);
    else if (obj.attachEvent) 
      obj.attachEvent('on' + type, function() { return fn.apply(obj, new Array(window.event));});
  }
  addEvent(window, "load", html5_video_init);
}
