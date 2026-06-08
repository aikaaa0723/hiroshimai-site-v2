/* ============================================================
   Shared layout: injects the global header + footer on every
   page, wires up the dropdown / mobile drawer / scroll behaviour.
   ============================================================ */
(function () {
  "use strict";

  /* ---- root prefix (set per page via window.SITE_ROOT) ---- */
  var ROOT = (typeof window.SITE_ROOT === "string") ? window.SITE_ROOT : "";

  /* ---- current path → active nav state (works on file:// and http) ---- */
  var path = location.pathname;
  function has(seg) { return path.indexOf(seg) >= 0; }
  function ends(name) { return path.indexOf(name, path.length - name.length) >= 0; }
  function aClass(cond) { return cond ? " active" : ""; }
  function curr(cond) { return cond ? ' aria-current="page"' : ""; }

  var inCompany = has("/company/");
  var inServices = has("/services/");
  var inNews = has("/news/");
  var inRecruit = has("/recruit/");

  /* ---- Header ---- */
  var header =
    '<header class="site-header" id="siteHeader">' +
      '<div class="header-inner">' +
        '<a href="' + ROOT + 'index.html" class="brand" aria-label="HiroshimAI ホーム">' +
          '<span class="brand-mark">Hiroshim<span class="brand-ai">AI</span></span>' +
        '</a>' +
        '<nav class="global-nav" aria-label="グローバルナビゲーション">' +
          '<ul>' +
            '<li class="has-dropdown">' +
              '<a href="' + ROOT + 'company/index.html" class="nav-top' + aClass(inCompany) + '" aria-haspopup="true">会社情報<span class="caret"></span></a>' +
              '<div class="dropdown">' +
                '<a href="' + ROOT + 'company/index.html"' + curr(ends("/company/index.html") || ends("/company/")) + '>会社概要</a>' +
                '<a href="' + ROOT + 'company/message.html"' + curr(ends("message.html")) + '>CEOメッセージ</a>' +
                '<a href="' + ROOT + 'company/vision.html"' + curr(ends("vision.html")) + '>ミッション・ビジョン</a>' +
              '</div>' +
            '</li>' +
            '<li><a href="' + ROOT + 'services/index.html" class="nav-top' + aClass(inServices) + '">製品・サービス</a></li>' +
            '<li><a href="' + ROOT + 'news/index.html" class="nav-top' + aClass(inNews) + '">ニュース</a></li>' +
            '<li><a href="' + ROOT + 'recruit/index.html" class="nav-top' + aClass(inRecruit) + '">採用情報</a></li>' +
          '</ul>' +
        '</nav>' +
        '<div class="header-utility">' +
          '<button class="lang-toggle" type="button" aria-label="言語切り替え">JP<span>/EN</span></button>' +
          '<a href="' + ROOT + 'contact.html" class="btn-contact">お問い合わせ</a>' +
          '<button class="nav-burger" id="navBurger" type="button" aria-label="メニューを開く" aria-expanded="false">' +
            '<span></span><span></span><span></span>' +
          '</button>' +
        '</div>' +
      '</div>' +
      '<div class="mobile-drawer" id="mobileDrawer" hidden>' +
        '<ul>' +
          '<li class="drawer-group">' +
            '<button class="drawer-acc" type="button" aria-expanded="false">会社情報<span class="acc-icon"></span></button>' +
            '<div class="drawer-sub" hidden>' +
              '<a href="' + ROOT + 'company/index.html">会社概要</a>' +
              '<a href="' + ROOT + 'company/message.html">CEOメッセージ</a>' +
              '<a href="' + ROOT + 'company/vision.html">ミッション・ビジョン</a>' +
            '</div>' +
          '</li>' +
          '<li><a href="' + ROOT + 'services/index.html">製品・サービス</a></li>' +
          '<li><a href="' + ROOT + 'news/index.html">ニュース</a></li>' +
          '<li><a href="' + ROOT + 'recruit/index.html">採用情報</a></li>' +
          '<li><a href="' + ROOT + 'contact.html" class="drawer-contact">お問い合わせ</a></li>' +
        '</ul>' +
      '</div>' +
    '</header>';

  /* ---- Footer ---- */
  var footer =
    '<footer class="site-footer">' +
      '<div class="footer-inner">' +
        '<div class="footer-brand">' +
          '<a href="' + ROOT + 'index.html" class="brand-mark">Hiroshim<span class="brand-ai">AI</span></a>' +
          '<p>AIで広島から、未来を実装する。</p>' +
        '</div>' +
        '<nav class="footer-nav" aria-label="フッターナビゲーション">' +
          '<div class="footer-col">' +
            '<h4>会社情報</h4>' +
            '<ul>' +
              '<li><a href="' + ROOT + 'company/index.html">会社概要</a></li>' +
              '<li><a href="' + ROOT + 'company/message.html">CEOメッセージ</a></li>' +
              '<li><a href="' + ROOT + 'company/vision.html">ミッション・ビジョン</a></li>' +
            '</ul>' +
          '</div>' +
          '<div class="footer-col">' +
            '<h4>事業</h4>' +
            '<ul>' +
              '<li><a href="' + ROOT + 'services/index.html">製品・サービス</a></li>' +
              '<li><a href="' + ROOT + 'news/index.html">ニュース</a></li>' +
              '<li><a href="' + ROOT + 'recruit/index.html">採用情報</a></li>' +
              '<li><a href="' + ROOT + 'contact.html">お問い合わせ</a></li>' +
            '</ul>' +
          '</div>' +
          '<div class="footer-col">' +
            '<h4>会社概要</h4>' +
            '<ul class="footer-meta">' +
              '<li>HiroshimAI株式会社</li>' +
              '<li>代表取締役　住田 隆真</li>' +
              '<li>設立　2026年</li>' +
              '<li>広島県広島市</li>' +
            '</ul>' +
          '</div>' +
        '</nav>' +
      '</div>' +
      '<div class="footer-bottom">' +
        '<ul class="footer-legal">' +
          '<li><a href="#">利用規約</a></li>' +
          '<li><a href="#">プライバシーポリシー</a></li>' +
        '</ul>' +
        '<p class="copyright">© 2026 HiroshimAI Inc. All Rights Reserved.</p>' +
      '</div>' +
    '</footer>';

  /* ---- Site-wide background video (full-screen, rotated) ---- */
  var bg = document.createElement("div");
  bg.className = "site-bg";
  bg.setAttribute("aria-hidden", "true");
  bg.innerHTML =
    '<video class="site-bg-video" autoplay muted loop playsinline preload="auto">' +
      '<source src="' + ROOT + 'assets/hiroshima.mp4" type="video/mp4" />' +
    '</video>' +
    '<div class="site-bg-overlay"></div>';
  document.body.insertBefore(bg, document.body.firstChild);

  /* ---- Inject ---- */
  var hMount = document.getElementById("app-header");
  var fMount = document.getElementById("app-footer");
  if (hMount) hMount.outerHTML = header;
  if (fMount) fMount.outerHTML = footer;

  /* ---- Header shadow on scroll ---- */
  var hdr = document.getElementById("siteHeader");
  function onScroll() {
    if (window.scrollY > 10) hdr.classList.add("scrolled");
    else hdr.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobile drawer ---- */
  var burger = document.getElementById("navBurger");
  var drawer = document.getElementById("mobileDrawer");
  burger.addEventListener("click", function () {
    var open = drawer.hidden;
    drawer.hidden = !open;
    burger.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
  });
  /* drawer accordion */
  var acc = drawer.querySelector(".drawer-acc");
  if (acc) {
    acc.addEventListener("click", function () {
      var sub = acc.nextElementSibling;
      var open = sub.hidden;
      sub.hidden = !open;
      acc.classList.toggle("open", open);
      acc.setAttribute("aria-expanded", String(open));
    });
  }

  /* ---- Typewriter splitter (shared; used here + by home.js) ---- */
  function isCJK(s) { return /[　-ヿ一-鿿＀-￯]/.test(s); }
  window.__twSplit = function (el, step) {
    if (el.__tw) return el.__twChars || 0;
    step = step || 42;
    var idx = 0;
    function walk(node, parent) {
      Array.prototype.forEach.call(node.childNodes, function (c) {
        if (c.nodeType === 3) {
          c.nodeValue.split(/(\s+)/).forEach(function (tok) {
            if (tok === "") return;
            if (/^\s+$/.test(tok)) { parent.appendChild(document.createTextNode(tok)); return; }
            var word = document.createElement("span");
            word.className = "tw-word" + (isCJK(tok) ? " cjk" : "");
            tok.split("").forEach(function (ch) {
              var s = document.createElement("span");
              s.className = "tw-c";
              s.textContent = ch;
              s.style.transitionDelay = (idx * step) + "ms";
              idx++;
              word.appendChild(s);
            });
            parent.appendChild(word);
          });
        } else if (c.nodeName === "BR") {
          parent.appendChild(c.cloneNode(false));
        } else if (c.nodeType === 1) {
          var clone = c.cloneNode(false);
          parent.appendChild(clone);
          walk(c, clone);
        }
      });
    }
    var frag = document.createDocumentFragment();
    walk(el, frag);
    el.innerHTML = "";
    el.appendChild(frag);
    var caret = document.createElement("span");
    caret.className = "tw-caret";
    caret.textContent = "▍";
    el.appendChild(caret);
    el.classList.add("tw");
    el.__tw = true;
    el.__twChars = idx;
    el.__twTotal = idx * step + 360;
    return idx;
  };
  /* trigger one typewriter line (re-triggerable) */
  window.__twPlay = function (el) {
    if (!el.__tw) return;
    el.classList.remove("tw-done");
    el.classList.add("tw-in");
    clearTimeout(el.__twTimer);
    el.__twTimer = setTimeout(function () { el.classList.add("tw-done"); }, el.__twTotal);
  };

  /* ---- Scroll reveal: typewriter for headings, fade for the rest ---- */
  (function () {
    var rootEl = document.documentElement;
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      rootEl.classList.remove("anim");
      return;
    }

    var TW = ".section-title, .page-hero h1, .section-jp, .page-hero .page-jp, " +
             ".block-head .en, .block-head h2, .mission-text, .contact-title, .plans-title";
    var FADE = ".lead-text, .steps-lead, .mission-sub, .contact-lead, .rep-lead, " +
               ".rep-text, .rep-name, .rep-history, .profile-table, .pt-lead, [data-reveal]";

    var twNodes = Array.prototype.slice.call(document.querySelectorAll(TW))
      .filter(function (el) { return !el.closest(".hero"); });
    twNodes.forEach(function (el) { window.__twSplit(el, 42); });

    var fadeNodes = Array.prototype.slice.call(document.querySelectorAll(FADE))
      .filter(function (el) { return !el.closest(".hero"); });
    var counts = new WeakMap();
    fadeNodes.forEach(function (el) {
      var p = el.parentElement;
      var n = counts.get(p) || 0;
      counts.set(p, n + 1);
      el.style.transitionDelay = Math.min(n * 70, 420) + "ms";
    });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        if (e.target.classList.contains("tw")) window.__twPlay(e.target);
        else e.target.classList.add("in");
        io.unobserve(e.target);
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -6% 0px" });

    twNodes.concat(fadeNodes).forEach(function (el) { io.observe(el); });
  })();
})();
