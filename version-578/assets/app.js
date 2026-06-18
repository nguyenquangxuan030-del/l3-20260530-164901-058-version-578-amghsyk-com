(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  var toggle = qs('[data-menu-toggle]');
  var mobileNav = qs('[data-mobile-nav]');
  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = qs('[data-hero]');
  if (hero) {
    var slides = qsa('.hero-slide', hero);
    var dots = qsa('.hero-dots button', hero);
    var index = 0;
    var timer = null;

    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    qsa('[data-hero-next]', hero).forEach(function (button) {
      button.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    });

    qsa('[data-hero-prev]', hero).forEach(function (button) {
      button.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    });

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
        start();
      });
    });

    show(0);
    start();
  }

  qsa('[data-filter-form]').forEach(function (form) {
    var root = document;
    var input = qs('[data-filter-input]', form);
    var region = qs('[data-filter-region]', form);
    var type = qs('[data-filter-type]', form);
    var year = qs('[data-filter-year]', form);
    var cards = qsa('.searchable-card', root);
    var empty = qs('[data-empty-results]', root);

    function normalize(value) {
      return String(value || '').trim().toLowerCase();
    }

    function apply() {
      var text = normalize(input && input.value);
      var regionValue = normalize(region && region.value);
      var typeValue = normalize(type && type.value);
      var yearValue = normalize(year && year.value);
      var visible = 0;

      cards.forEach(function (card) {
        var keywords = normalize(card.getAttribute('data-keywords'));
        var cardRegion = normalize(card.getAttribute('data-region'));
        var cardType = normalize(card.getAttribute('data-type'));
        var cardYear = normalize(card.getAttribute('data-year'));
        var ok = true;

        if (text && keywords.indexOf(text) === -1) {
          ok = false;
        }
        if (regionValue && cardRegion !== regionValue) {
          ok = false;
        }
        if (typeValue && cardType !== typeValue) {
          ok = false;
        }
        if (yearValue && cardYear !== yearValue) {
          ok = false;
        }

        card.style.display = ok ? '' : 'none';
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    ['input', 'change'].forEach(function (eventName) {
      [input, region, type, year].forEach(function (element) {
        if (element) {
          element.addEventListener(eventName, apply);
        }
      });
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      apply();
    });

    var query = new URLSearchParams(window.location.search).get('q');
    if (query && input) {
      input.value = query;
    }
    apply();
  });

  qsa('[data-player]').forEach(function (box) {
    var video = qs('video', box);
    var cover = qs('.player-cover', box);
    var button = qs('.player-button', box);
    var stream = box.getAttribute('data-stream');
    var ready = false;
    var hls = null;

    function prepare() {
      if (ready || !video || !stream) {
        return;
      }

      video.controls = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
      } else {
        video.src = stream;
      }

      ready = true;
    }

    function play() {
      prepare();
      box.classList.add('is-playing');
      var result = video.play();
      if (result && result.catch) {
        result.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        play();
      });
    }

    if (cover) {
      cover.addEventListener('click', function () {
        play();
      });
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!ready) {
          play();
        }
      });
      video.addEventListener('play', function () {
        box.classList.add('is-playing');
      });
      video.addEventListener('error', function () {
        if (hls && hls.destroy) {
          hls.destroy();
          hls = null;
        }
      });
    }
  });
})();
