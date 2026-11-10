// The Stips+ page (#24): the language (shared with the rest of shimshii.com), the download button pointed at the newest
// APK, and the app's feel: the top app bar's scroll state and title, and the ripple on press.
(function () {
  "use strict";

  var REPO = "EyalShimshi/stips-plus";
  var root = document.documentElement;

  // Hebrew for phones that know Hebrew, English otherwise, until the visitor picks (kept on their phone only).
  function stored() {
    try {
      return localStorage.getItem("lang");
    } catch (e) {
      return null;
    }
  }

  function browserLang() {
    var langs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""];
    for (var i = 0; i < langs.length; i++) {
      if (/^(he|iw)\b/i.test(langs[i])) return "he";
    }
    return "en";
  }

  var titles = {
    he: "Stips+ · סטיפס, בנוח",
    en: "Stips+ · Stips, made comfortable",
  };

  function setLang(lang) {
    root.lang = lang;
    root.dir = lang === "he" ? "rtl" : "ltr";
    document.title = titles[lang];
  }

  setLang(stored() === "en" || stored() === "he" ? stored() : browserLang());

  document.getElementById("lang").addEventListener("click", function () {
    var next = root.lang === "he" ? "en" : "he";
    setLang(next);
    try {
      localStorage.setItem("lang", next);
    } catch (e) {
      // Private browsing: the pick lasts until the page closes.
    }
  });

  // The top app bar: its container color once the page scrolls under it, its title once the big one has gone.
  var bar = document.getElementById("bar");
  function onScroll() {
    bar.classList.toggle("scrolled", window.scrollY > 0);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  var title = document.getElementById("title");
  if ("IntersectionObserver" in window && title) {
    new IntersectionObserver(
      function (entries) {
        bar.classList.toggle("titled", !entries[0].isIntersecting);
      },
      { rootMargin: "-64px 0px 0px 0px" }
    ).observe(title);
  } else {
    bar.classList.add("titled");
  }

  // Material's ripple, spreading from where the finger lands; not with reduced motion.
  var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!calm) {
    document.addEventListener("pointerdown", function (event) {
      var target = event.target.closest ? event.target.closest(".ripple") : null;
      if (!target) return;
      var rect = target.getBoundingClientRect();
      var size = Math.max(rect.width, rect.height) * 2;
      var wave = document.createElement("span");
      wave.className = "wave";
      wave.style.width = wave.style.height = size + "px";
      wave.style.left = event.clientX - rect.left - size / 2 + "px";
      wave.style.top = event.clientY - rect.top - size / 2 + "px";
      target.appendChild(wave);
      wave.addEventListener("animationend", function () {
        if (wave.parentNode) wave.parentNode.removeChild(wave);
      });
    });
  }

  // Every build is a pre-release named build-N with stipsplus-N.apk (GitHub's "latest" skips pre-releases). Without
  // an answer (offline, or GitHub's 60 calls an hour), the button stays on the Releases page.
  function newest(releases) {
    var best = null;
    for (var i = 0; i < releases.length; i++) {
      var release = releases[i];
      var match = /^build-(\d+)$/.exec(release.tag_name || "");
      if (!match || release.draft) continue;
      var number = Number(match[1]);
      var assets = release.assets || [];
      for (var j = 0; j < assets.length; j++) {
        if (assets[j].name === "stipsplus-" + number + ".apk" && (!best || number > best.number)) {
          best = { number: number, release: release, apk: assets[j] };
        }
      }
    }
    return best;
  }

  function sizeText(bytes) {
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  function dateText(iso, locale) {
    var date = new Date(iso);
    if (isNaN(date.getTime())) return "";
    try {
      return date.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
    } catch (e) {
      return "";
    }
  }

  // Each part keeps its own direction, so "3.6 MB" and the version number don't trade places in Hebrew.
  function isolate(text) {
    return "\u2068" + text + "\u2069";
  }

  function show(best) {
    document.getElementById("download").href = best.apk.browser_download_url;
    var links = document.querySelectorAll(".notes-link");
    for (var i = 0; i < links.length; i++) links[i].href = best.release.html_url;
    var version = (best.release.name || "").replace(/^Stips\+\s*/, "") || String(best.number);
    var he = ["גרסה " + version, sizeText(best.apk.size), dateText(best.release.published_at, "he-IL")];
    var en = ["Version " + version, sizeText(best.apk.size), dateText(best.release.published_at, "en-GB")];
    var line = document.getElementById("version");
    line.querySelector('[lang="he"]').textContent = he.filter(Boolean).map(isolate).join(" · ");
    line.querySelector('[lang="en"]').textContent = en.filter(Boolean).map(isolate).join(" · ");
    line.hidden = false;
  }

  if (!window.fetch) return;
  fetch("https://api.github.com/repos/" + REPO + "/releases?per_page=20", {
    headers: { Accept: "application/vnd.github+json" },
  })
    .then(function (response) {
      return response.ok ? response.json() : null;
    })
    .then(function (releases) {
      var best = Array.isArray(releases) ? newest(releases) : null;
      if (best) show(best);
    })
    .catch(function () {
      // The Releases page link stays.
    });
})();