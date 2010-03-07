var alphabet_index = 0;

function status_message(status) {
  if (status == 0) {
      return "not cached";
  } else if (status == 1) {
      return "fully cached and operational offline";
  } else if (status == 2) {
      return "checking for changes to the cache manifest...";
  } else if (status == 3) {
      return "downloading changed resources...";
  } else if (status == 4) {
      return "ready to switch to updated offline version";
  }
  return "";
}

window.setInterval(function () {
  document.getElementById('clock').innerHTML = new Date();
  var status = window.applicationCache.status;
  document.getElementById('status').innerHTML = status + " [" + status_message(status) + "]";
  alphabet_index = alphabet_index + 1;
  if (alphabet_index == 9) {
      alphabet_index = 10;
  }
  if (alphabet_index == 20) {
      alphabet_index = 21;
  }
  if (alphabet_index > 25) {
      alphabet_index = 0;
  }
  document.getElementById("alphabet").src = "http://b.wearehugh.com/dih5/aoc-" + String.fromCharCode(97 + alphabet_index) + ".png";
}, 1000);

window.applicationCache.addEventListener("updateready", function() {
  window.applicationCache.swapCache();
}, false);
