(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');

    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        panel.classList.toggle('open');
      });
    }

    var slider = document.querySelector('[data-hero-slider]');
    if (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
      var prev = slider.querySelector('[data-hero-prev]');
      var next = slider.querySelector('[data-hero-next]');
      var active = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        active = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('active', i === active);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('active', i === active);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(active + 1);
        }, 5200);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
          start();
        });
      });

      if (prev) {
        prev.addEventListener('click', function () {
          show(active - 1);
          start();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(active + 1);
          start();
        });
      }

      slider.addEventListener('mouseenter', stop);
      slider.addEventListener('mouseleave', start);
      start();
    }

    var grids = Array.prototype.slice.call(document.querySelectorAll('[data-filter-grid]'));
    grids.forEach(function (grid) {
      var section = grid.closest('section') || document;
      var input = section.querySelector('[data-filter-input]');
      var buttons = Array.prototype.slice.call(section.querySelectorAll('[data-type-filter]'));
      var emptyState = section.querySelector('[data-empty-state]');
      var currentType = '全部';
      var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));

      function matchCard(card, query, type) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-genre') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-category') || '',
          card.textContent || ''
        ].join(' ').toLowerCase();
        var typeText = card.textContent || '';
        var queryOk = !query || haystack.indexOf(query) !== -1;
        var typeOk = type === '全部' || typeText.indexOf(type) !== -1 || haystack.indexOf(type.toLowerCase()) !== -1;
        return queryOk && typeOk;
      }

      function applyFilter() {
        var query = input ? input.value.trim().toLowerCase() : '';
        var visible = 0;
        cards.forEach(function (card) {
          var show = matchCard(card, query, currentType);
          card.hidden = !show;
          if (show) {
            visible += 1;
          }
        });
        if (emptyState) {
          emptyState.hidden = visible !== 0;
        }
      }

      if (input) {
        input.addEventListener('input', applyFilter);
      }

      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          currentType = button.getAttribute('data-type-filter') || '全部';
          buttons.forEach(function (btn) {
            btn.classList.toggle('active', btn === button);
          });
          applyFilter();
        });
      });
    });
  });
})();
