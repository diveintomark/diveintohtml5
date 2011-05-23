/*
This implements a subset of the HTML5 canvas text API in Firefox 3.0,
which only shipped with a Mozilla-specific API because the HTML5
API wasn't stable yet:

  <https://developer.mozilla.org/en/Drawing_text_using_a_canvas>

It uses code from two different projects, Bespin and canvas.text.js.

*/
/* http://hg.mozilla.org/labs/bespin/file/tip/frontend/js/bespin/util/canvas.js
 * ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1
 *
 * The contents of this file are subject to the Mozilla Public License
 * Version 1.1 (the "License"); you may not use this file except in
 * compliance with the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS"
 * basis, WITHOUT WARRANTY OF ANY KIND, either express or implied.
 * See the License for the specific language governing rights and
 * limitations under the License.
 *
 * The Original Code is Bespin.
 *
 * The Initial Developer of the Original Code is Mozilla.
 * Portions created by the Initial Developer are Copyright (C) 2009
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *   Bespin Team (bespin@mozilla.com)
 *
 * ***** END LICENSE BLOCK ***** */

/* 
 * http://code.google.com/p/canvas-text/
 * @projectDescription An implementation of the <canvas> text functions in browsers that don't already have it
 * @author Fabien Ménager
 * @license MIT License <http://www.opensource.org/licenses/mit-license.php>
 */

(function() {
try {
  proto = window.CanvasRenderingContext2D ? window.CanvasRenderingContext2D.prototype : document.createElement('canvas').getContext('2d').__proto__

  // Setup measureText
  if (!proto.measureText && proto.mozMeasureText) {
     proto.measureText = function(text) {
       if (this.font) this.mozTextStyle = this.font;
       var width = this.mozMeasureText(text);
       return { width: width };
     };
  }

  // Setup html5MeasureText (adds limited support for ascent property)
  if (proto.measureText && !proto.html5MeasureText) {
    proto.html5MeasureText = proto.measureText;
    proto.measureText = function(text) {
      var textMetrics = this.html5MeasureText(text);

      // fake it 'til you make it
      textMetrics.ascent = this.html5MeasureText("m").width;

      return textMetrics;
    };
  }

  // Setup fillText with limited support for textAlign and textBaseline properties
  if (!proto.fillText && proto.mozDrawText) {
    proto.font = "10px sans-serif";
    proto.textAlign = "start";
    proto.textBaseline = "alphabetic";
    proto.fillText = function(textToDraw, x, y, maxWidth) {
      var canvasStyle = window.getComputedStyle(this.canvas, ''),
          metrics = this.measureText(textToDraw),
          offset = {x: 0, y: 0};

      switch (this.textAlign) {
        default:      
        case null:
        case 'left': break;
        case 'center': offset.x = -metrics.width/2; break;
        case 'right':  offset.x = -metrics.width; break;
        case 'start':  offset.x = (canvasStyle.direction == 'rtl') ? -metrics.width : 0; break;
        case 'end':    offset.x = (canvasStyle.direction == 'ltr') ? -metrics.width : 0; break;
      }
    
      switch (this.textBaseline) {
        case 'hanging': 
        case 'top': offset.y = metrics.ascent; break;
        case 'middle': offset.y = metrics.ascent / 2;
        default:
        case null:
        case 'alphabetic':
        case 'ideographic': break;
        case 'bottom': offset.y = 0; break;
      }

      this.translate(x + offset.x, y + offset.y);
      this.mozTextStyle = this.font;
      this.mozDrawText(textToDraw);
      this.translate(-x - offset.x, -y - offset.y);
    };
  }
} catch(err) {}
})();
