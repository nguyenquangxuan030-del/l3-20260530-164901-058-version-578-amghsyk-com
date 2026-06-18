(function () {
  var toggle = document.querySelector('[data-mobile-toggle]');
  var panel = document.querySelector('[data-mobile-panel]');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var carousel = document.querySelector('[data-carousel]');
  if (!carousel) {
    return;
  }

  var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
  var prev = carousel.querySelector('[data-hero-prev]');
  var next = carousel.querySelector('[data-hero-next]');
  var current = 0;
  var timer = null;

  function show(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === current);
    });
  }

  function go(step) {
    show(current + step);
  }

  function start() {
    timer = window.setInterval(function () {
      go(1);
    }, 5000);
  }

  function restart() {
    if (timer) {
      window.clearInterval(timer);
    }
    start();
  }

  if (prev) {
    prev.addEventListener('click', function () {
      go(-1);
      restart();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      go(1);
      restart();
    });
  }

  dots.forEach(function (dot, i) {
    dot.addEventListener('click', function () {
      show(i);
      restart();
    });
  });

  show(0);
  start();
})();
