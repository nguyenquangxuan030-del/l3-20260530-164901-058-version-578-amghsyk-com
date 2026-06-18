(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
      return;
    }
    callback();
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('open');
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero-carousel]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === index);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    show(0);
    start();
  }

  function setupSearchForms() {
    Array.prototype.slice.call(document.querySelectorAll('.site-search')).forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"]');
        var query = input ? input.value.trim() : '';
        var target = form.getAttribute('action') || './search.html';
        window.location.href = target + (query ? '?q=' + encodeURIComponent(query) : '');
      });
    });
  }

  function setupFilters() {
    var input = document.querySelector('[data-filter-input]');
    var select = document.querySelector('[data-filter-select]');
    var scope = document.querySelector('[data-filter-scope]');
    var empty = document.querySelector('[data-empty-state]');
    if (!scope || !input) {
      return;
    }
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-movie-card]'));
    var urlInput = document.querySelector('[data-url-query]');
    if (urlInput) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q') || '';
      input.value = query;
    }

    function apply() {
      var keyword = input.value.trim().toLowerCase();
      var year = select ? select.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var data = card.getAttribute('data-search') || '';
        var matchKeyword = !keyword || data.indexOf(keyword) !== -1;
        var matchYear = !year || data.indexOf(year) !== -1;
        var show = matchKeyword && matchYear;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });
      if (empty) {
        empty.classList.toggle('show', visible === 0);
      }
    }

    input.addEventListener('input', apply);
    if (select) {
      select.addEventListener('change', apply);
    }
    apply();
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearchForms();
    setupFilters();
  });
})();
