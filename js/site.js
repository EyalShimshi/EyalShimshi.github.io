// shimshii.com: one language at a time (Hebrew or English), kept on the visitor's phone. Shared by every page of the
// site, so a pick made on one page holds on the others. A page sets its titles in <html data-title-he/-en>.
(function () {
  "use strict";

  var root = document.documentElement;

  function stored() {
    try {
      return localStorage.getItem("lang");
    } catch (e) {
      return null;
    }
  }

  // Hebrew for browsers that know Hebrew, English otherwise, until the visitor picks.
  function browserLang() {
    var langs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""];
    for (var i = 0; i < langs.length; i++) {
      if (/^(he|iw)\b/i.test(langs[i])) return "he";
    }
    return "en";
  }

  function setLang(lang) {
    root.lang = lang;
    root.dir = lang === "he" ? "rtl" : "ltr";
    var title = root.getAttribute("data-title-" + lang);
    if (title) document.title = title;
  }

  var saved = stored();
  setLang(saved === "he" || saved === "en" ? saved : browserLang());

  var button = document.getElementById("lang");
  if (button) {
    button.addEventListener("click", function () {
      var next = root.lang === "he" ? "en" : "he";
      setLang(next);
      try {
        localStorage.setItem("lang", next);
      } catch (e) {
        // Private browsing: the pick lasts until the page closes.
      }
    });
  }

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
