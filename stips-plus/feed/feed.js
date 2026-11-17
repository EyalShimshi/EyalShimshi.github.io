// A shared Stips+ feed (#40): what the link says (n: name, e: emoji, s: new|hot|mixed, w: week|month, u: unanswered
// only, t: a tag, x: a tag left out), shown as text only, and "Open in Stips+" as an Android intent link, which opens the
// app even where Android didn't verify its link, and comes back here when the app isn't installed.
(function () {
  "use strict";

  var PACKAGE = "io.github.eyalshimshi.betterstips";
  var params = new URLSearchParams(window.location.search);
  var name = (params.get("n") || "").trim().slice(0, 30);
  var emoji = (params.get("e") || "").trim().slice(0, 8);
  var tags = params.getAll("t").map(function (t) { return t.trim().replace(/^#+/, ""); }).filter(Boolean).slice(0, 15);
  var excluded = params.getAll("x").map(function (t) { return t.trim().replace(/^#+/, ""); }).filter(Boolean).slice(0, 15);
  var order = (params.get("s") || "new").toLowerCase();
  var unanswered = params.get("u") === "1";

  var nameLine = document.getElementById("feed-name");
  if (!name || tags.length === 0) {
    nameLine.textContent = "?";
    document.getElementById("feed-missing").hidden = false;
    document.getElementById("open-app").hidden = true;
    return;
  }
  nameLine.textContent = emoji ? emoji + " " + name : name;

  var orders = {
    new: { he: "השאלות החדשות ראשונות", en: "Newest questions first" },
    hot: { he: "השאלות החמות", en: "Hot questions" },
    mixed: { he: "שאלה מכל תגית בתורה", en: "One question from each tag in turn" },
  };
  var kind = orders[order] || orders.new;
  var kindLine = document.getElementById("feed-kind");
  [["he", kind.he + (unanswered ? " · רק ללא תשובות" : "")], ["en", kind.en + (unanswered ? " · unanswered only" : "")]].forEach(function (pair) {
    var span = document.createElement("span");
    span.lang = pair[0];
    span.textContent = pair[1];
    kindLine.appendChild(span);
  });
  kindLine.hidden = false;

  var chips = document.getElementById("feed-tags");
  tags.forEach(function (tag) {
    var chip = document.createElement("span");
    chip.className = "chip";
    chip.textContent = "#" + tag;
    chips.appendChild(chip);
  });
  excluded.forEach(function (tag) {
    var chip = document.createElement("span");
    chip.className = "chip";
    chip.style.opacity = "0.6";
    chip.textContent = "− #" + tag;
    chips.appendChild(chip);
  });

  // Android opens Stips+ with this link; without the app, the browser comes back to the Stips+ page.
  var fallback = "https://www.shimshii.com/stips-plus/";
  var link = "intent://www.shimshii.com/stips-plus/feed/" + window.location.search +
    "#Intent;scheme=https;package=" + PACKAGE + ";S.browser_fallback_url=" + encodeURIComponent(fallback) + ";end";
  var open = document.getElementById("open-app");
  if (/android/i.test(navigator.userAgent)) {
    open.href = link;
  } else {
    // Not a phone with Stips+: the button leads to the page that explains it.
    open.href = fallback;
  }
})();
