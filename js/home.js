/* Home hero carousel (only loaded on the top page) */
(function () {
  "use strict";
  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dotsWrap = document.getElementById("heroDots");
  if (!slides.length || !dotsWrap) return;

  var current = 0, timer = null, INTERVAL = 6000;

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
    slides[current].classList.remove("is-active");
    dots[current].classList.remove("active");
    current = (n + slides.length) % slides.length;
    slides[current].classList.add("is-active");
    dots[current].classList.add("active");
  }
  function next() { go(current + 1); }
  function restart() { if (timer) clearInterval(timer); timer = setInterval(next, INTERVAL); }
  if (slides.length > 1) restart();

  var hero = document.querySelector(".hero");
  hero.addEventListener("mouseenter", function () { if (timer) clearInterval(timer); });
  hero.addEventListener("mouseleave", restart);
})();
