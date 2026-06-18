(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function textOf(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function uniqueValues(cards, name) {
    var seen = {};
    var values = [];
    cards.forEach(function (card) {
      var value = card.getAttribute(name) || "";
      if (value && !seen[value]) {
        seen[value] = true;
        values.push(value);
      }
    });
    return values.sort(function (a, b) {
      return b.localeCompare(a, "zh-CN");
    });
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function setupFilters() {
    var scope = document.querySelector("[data-filter-scope]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    if (!scope || !cards.length) {
      return;
    }

    var input = scope.querySelector("[data-filter-input]");
    var year = scope.querySelector("[data-filter-year]");
    var type = scope.querySelector("[data-filter-type]");
    var region = scope.querySelector("[data-filter-region]");
    var empty = document.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get("q") || "";

    fillSelect(year, uniqueValues(cards, "data-year"));
    fillSelect(type, uniqueValues(cards, "data-type"));
    fillSelect(region, uniqueValues(cards, "data-region"));

    if (input && queryValue) {
      input.value = queryValue;
    }

    function apply() {
      var q = textOf(input ? input.value : "");
      var y = year ? year.value : "";
      var t = type ? type.value : "";
      var r = region ? region.value : "";
      var visible = 0;

      cards.forEach(function (card) {
        var search = textOf(card.getAttribute("data-search"));
        var ok = true;
        if (q && search.indexOf(q) === -1) {
          ok = false;
        }
        if (y && card.getAttribute("data-year") !== y) {
          ok = false;
        }
        if (t && card.getAttribute("data-type") !== t) {
          ok = false;
        }
        if (r && card.getAttribute("data-region") !== r) {
          ok = false;
        }
        card.style.display = ok ? "" : "none";
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? "none" : "block";
      }
    }

    [input, year, type, region].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    if (!slides.length) {
      return;
    }

    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    start();
  }

  function setupBackTop() {
    var button = document.querySelector("[data-back-top]");
    if (!button) {
      return;
    }

    function update() {
      button.classList.toggle("is-visible", window.scrollY > 480);
    }

    button.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    window.addEventListener("scroll", update, { passive: true });
    update();
  }

  function setupImages() {
    Array.prototype.slice.call(document.querySelectorAll("img")).forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("is-hidden-image");
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupBackTop();
    setupImages();
  });
})();
