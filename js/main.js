// Main JS for Giada site
(function () {
  'use strict';

  // Helper
  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  // Add JS marker to enable animations; if JS disabled, content remains visible
  document.documentElement.classList.add('js');

  // Smooth scroll for nav links (works even if CSS smooth isn't supported)
  qsa('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var href = a.getAttribute('href');
      if (!href || href === '#') return;
      var target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({behavior: 'smooth', block: 'start'});
      // close mobile nav if open
      var nav = qs('#primary-nav');
      if (nav && nav.classList.contains('open')) {
        nav.classList.remove('open');
        qs('.nav-toggle').setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Mobile nav toggle
  var navToggle = qs('.nav-toggle');
  var primaryNav = qs('#primary-nav');
  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', function () {
      var open = primaryNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // keyboard accessible: Enter/Space
    navToggle.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        navToggle.click();
      }
    });
  }

  // Hero image rotation with fallback
  (function heroRotate() {
    var img = qs('#hero-img');
    if (!img) return;
    var images = ['images/hero/3.jpg','images/hero/6.jpg','images/hero/7.jpg'];
    // pick random but prefer 1.jpg as fallback
    var pick = images[Math.floor(Math.random()*images.length)];
    var tmp = new Image();
    tmp.onload = function () {
      img.src = pick;
      img.style.opacity = '1';
    };
    tmp.onerror = function () {
      img.src = 'images/1.jpg';
      img.style.opacity = '1';
    };
    tmp.src = pick;
  })();

  // Reveal sections on scroll (progressive reveal). If JS disabled, sections are visible by default.
  var sections = qsa('.section');
  function onScrollReveal() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    sections.forEach(function (sec) {
      if (sec.classList.contains('in-view')) return;
      var rect = sec.getBoundingClientRect();
      if (rect.top < vh - 80) {
        sec.classList.add('in-view');
      }
    });
  }
  onScrollReveal();
  window.addEventListener('scroll', throttle(onScrollReveal, 150));
  window.addEventListener('resize', throttle(onScrollReveal, 200));

  // Testimonials: show first three immediately; rest fade in horizontally when scrolled into view
  var testScroller = qs('.test-scroller');
  var testCards = qsa('.test-card');
  // mark first three visible
  testCards.slice(0,3).forEach(function(c){ c.classList.add('visible'); });

  // Intersection observer for remaining testimonials
  var hiddenCards = qsa('.test-card.hidden-on-load');
  if ('IntersectionObserver' in window && hiddenCards.length) {
    var obs = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          obs.unobserve(entry.target);
        }
      });
    }, {root: testScroller, threshold: 0.2});
    hiddenCards.forEach(function(c){ obs.observe(c); });
  } else {
    // fallback: reveal on scroll
    window.addEventListener('scroll', throttle(function(){
      hiddenCards.forEach(function(c){
        var rect = c.getBoundingClientRect();
        if (rect.top < (window.innerHeight || document.documentElement.clientHeight) - 60) {
          c.classList.add('visible');
        }
      });
    }, 200));
  }

  // Horizontal nudge controls for testimonials
  var leftBtn = qs('.test-arrow.left');
  var rightBtn = qs('.test-arrow.right');
  function nudge(amount) {
    if (!testScroller) return;
    // smooth scroll by amount
    testScroller.scrollBy({left: amount, behavior: 'smooth'});
  }
  if (leftBtn) leftBtn.addEventListener('click', function(){ nudge(-280); });
  if (rightBtn) rightBtn.addEventListener('click', function(){ nudge(280); });

  // Keyboard navigation for testimonial scroller
  if (testScroller) {
    testScroller.addEventListener('keydown', function(e){
      if (e.key === 'ArrowLeft') { e.preventDefault(); nudge(-280); }
      if (e.key === 'ArrowRight') { e.preventDefault(); nudge(280); }
    });
  }

  // Utility: throttle
  function throttle(fn, wait) {
    var time = Date.now();
    return function() {
      if ((time + wait - Date.now()) < 0) {
        fn.apply(this, arguments);
        time = Date.now();
      }
    };
  }

  // Accessibility: allow arrow buttons to be focused and activated by keyboard
  qsa('.test-arrow').forEach(function(btn){
    btn.setAttribute('tabindex','0');
    btn.addEventListener('keydown', function(e){
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
    });
  });

  // Ensure sections are visible if JS fails to run: we added .js class; but if JS runs we animate.
  // No further action needed.

})();
