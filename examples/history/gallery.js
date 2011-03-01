function supports_history_api() {
  return !!(window.history && history.pushState);
}

function swapPhoto(url) {
  var req = new XMLHttpRequest();
  req.open("GET", "http://diveintohtml5.org/examples/history/gallery/"+url, false);
  req.send(null);
  if (req.status == 200) {
    document.getElementById("gallery").innerHTML = req.responseText;
    window.setTimeout(setupHistoryClicks, 1);
  }
}

function addClicker(link) {
  link.addEventListener("click", function(e) {
    var url = link.href.split("/").pop();
    swapPhoto(url);
    history.pushState({"url":url}, null, url);
    e.preventDefault();
  }, true);
}

function setupHistoryClicks() {
  addClicker(document.getElementById("photonext"));
  addClicker(document.getElementById("photoprev"));
}

window.onload = function() {
  if (!supports_history_api()) { return; }
  setupHistoryClicks();
  window.setTimeout(function() {
    window.addEventListener("popstate", function(e) {
      var state = e.state || {"url":location.href.split("/").pop()};
      swapPhoto(state["url"]);
    }, false);
  }, 1);
}
