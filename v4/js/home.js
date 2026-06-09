/* Home hero carousel with typewriter titles (top page only) */
(function () {
  "use strict";
  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dotsWrap = document.getElementById("heroDots");
  if (!slides.length || !dotsWrap) return;

  var current = 0, timer = null, INTERVAL = 6500;

  /* pre-split kicker + title of every slide into typewriter chars */
  var canTW = typeof window.__twSplit === "function";
  if (canTW) {
    slides.forEach(function (s) {
      var k = s.querySelector(".hero-kicker");
      var t = s.querySelector(".hero-title");
      if (k) window.__twSplit(k, 55);
      if (t) window.__twSplit(t, 46);
    });
  }

  function twReset(slide) {
    slide.querySelectorAll(".tw").forEach(function (el) {
      el.classList.remove("tw-in", "tw-done");
      clearTimeout(el.__twTimer);
    });
  }
  function twPlay(slide) {
    if (!canTW) return;
    var k = slide.querySelector(".hero-kicker");
    var t = slide.querySelector(".hero-title");
    if (k) window.__twPlay(k);
    if (t) setTimeout(function () { window.__twPlay(t); }, k ? Math.min(k.__twTotal, 560) : 0);
  }

  slides.forEach(function (_, i) {
    var b = document.createElement("button");
    b.type = "button";
    b.setAttribute("role", "tab");
    b.setAttribute("aria-label", "スライド " + (i + 1));
    if (i === 0) b.classList.add("active");
    b.addEventListener("click", function () { go(i); restart(); });
    dotsWrap.appendChild(b);
  });
  var dots = Array.prototype.slice.call(dotsWrap.children);

  function go(n) {
    twReset(slides[current]);
    slides[current].classList.remove("is-active");
    dots[current].classList.remove("active");
    current = (n + slides.length) % slides.length;
    slides[current].classList.add("is-active");
    dots[current].classList.add("active");
    twPlay(slides[current]);
  }
  function next() { go(current + 1); }
  function restart() { if (timer) clearInterval(timer); timer = setInterval(next, INTERVAL); }

  var hero = document.querySelector(".hero");
  hero.addEventListener("mouseenter", function () { if (timer) clearInterval(timer); });
  hero.addEventListener("mouseleave", restart);

  /* start after the welcome intro finishes (or immediately if none) */
  var started = false;
  function start() {
    if (started) return;
    started = true;
    twPlay(slides[0]);
    if (slides.length > 1) restart();
  }
  if (document.getElementById("intro")) {
    window.addEventListener("intro:done", start, { once: true });
    setTimeout(start, 5600); /* fallback if event never fires */
  } else {
    start();
  }
})();
