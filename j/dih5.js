/*
 The following three functions are taken from
 http://code.google.com/p/javascript-search-term-highlighter/
 Copyright 2004 Dave Lemen
 
 Licensed under the Apache License, Version 2.0 (the "License"); 
 you may not use this file except in compliance with the License. 
 You may obtain a copy of the License at 
 
        http://www.apache.org/licenses/LICENSE-2.0 

Unless required by applicable law or agreed to in writing, software 
distributed under the License is distributed on an "AS IS" BASIS, 
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. 
See the License for the specific language governing permissions and 
limitations under the License.
*/

function getSearchTerms() {
    var highlighterParameters = 'q as_q as_epq as_oq query search';
    var a = new Array();
    var params = getParamValues(document.referrer/*document.location.href*/, highlighterParameters);
    var terms;
    for (i = 0; i < params.length; i++) {
	terms = parseTerms(params[i]);
	for (j = 0; j < terms.length; j++) {
	    if (terms[j] != '') {
		a.push(terms[j].toLowerCase());
	    }
	}
    }
    return a;
}
        
function parseTerms(query) {
    var s = query + '';
    s = s.replace(/(^|\s)(site|related|link|info|cache):[^\s]*(\s|$)/ig, ' ');
    s = s.replace(/[^a-z0-9_-]/ig, ' '); // word chars only.
    s = s.replace(/(^|\s)-/g, ' '); // +required -excluded ~synonyms
    s = s.replace(/\b(and|not|or)\b/ig, ' ');
    s = s.replace(/\b[a-z0-9]\b/ig, ' '); // one char terms
    return s.split(/\s+/);
}

function getParamValues(url, parameters) {
    var params = new Array();
    var p = parameters.replace(/,/, ' ').split(/\s+/);
    if (url.indexOf('?') > 0) {
	var qs = url.substr(url.indexOf('?') + 1);
	var qsa = qs.split('&');
	for (i = 0; i < qsa.length; i++) {
	    nameValue = qsa[i].split('=');
	    if (nameValue.length != 2) continue;
	    for (j = 0; j < p.length; j++) {
		if (nameValue[0] == p[j]) {
		    params.push(unescape(nameValue[1]).toLowerCase().replace(/\+/g, ' '));
		}
	    }
	}
    }
    return params;
}

/*
The rest of this script is
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

$(document).ready(function() {
	hideTOC();

	/* match <dfn> terms with incoming search keywords and jump to the containing section */
	var searchTerms = getSearchTerms();
	$("dfn").each(function() {
		var dfn = $(this);
		var dfnTerm = dfn.text().toLowerCase();
		if ($.inArray(dfnTerm, searchTerms) != -1) {
		    var section = dfn.parents("p,table,ul,ol,blockquote").prevAll("*:header").get(0);
		    if (section) {
			window.setTimeout(function() {document.location.hash = section.id;}, 0);
			return false;
		    }
		}
	    });

    }); /* document.ready */

function hideTOC() {
    var toc = '<a href="javascript:showTOC()">show table of contents</a>';
    $("#toc").html(toc);
}

function showTOC() {
    var toc = '';
    var old_level = 1;
    $('h2,h3').each(function(i, h) {
	    level = parseInt(h.tagName.substring(1));
	    if (level < old_level) {
		toc += '</ol>';
	    } else if (level > old_level) {
		toc += '<ol>';
	    }
	    toc += '<li><a href=#' + h.id + '>' + h.innerHTML + '</a>';
	    old_level = level;
	});
    while (level > 1) {
	toc += '</ol>';
	level -= 1;
    }
    toc = '<a href="javascript:hideTOC()">hide table of contents</a><ol start=0><li><a href=table-of-contents.html><span class=u>&uarr;</span> Full table of contents</a></li>' + toc.substring(4);
    $("#toc").html(toc);
}
