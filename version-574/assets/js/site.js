(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMenu() {
    var button = document.querySelector(".menu-button");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var open = panel.classList.toggle("open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupSearchForms() {
    var forms = document.querySelectorAll("form[action='./search.html']");
    forms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = "./search.html";
        }
      });
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }
    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
      });
    });
    show(0);
    window.setInterval(function () {
      show(index + 1);
    }, 5200);
  }

  function setupFilters() {
    var panels = document.querySelectorAll(".filter-panel");
    panels.forEach(function (panel) {
      var target = document.querySelector(panel.getAttribute("data-target"));
      if (!target) {
        return;
      }
      var input = panel.querySelector(".page-search-input");
      var select = panel.querySelector(".year-filter");
      var cards = Array.prototype.slice.call(target.querySelectorAll(".movie-card"));
      var params = new URLSearchParams(window.location.search);
      var query = params.get("q") || "";
      if (input && query) {
        input.value = query;
      }
      function apply() {
        var keyword = normalize(input ? input.value : "");
        var year = select ? select.value : "";
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-text"));
          var cardYear = card.getAttribute("data-year") || "";
          var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
          var yearMatch = !year || cardYear === year;
          card.classList.toggle("hidden-card", !(keywordMatch && yearMatch));
        });
      }
      if (input) {
        input.addEventListener("input", apply);
      }
      if (select) {
        select.addEventListener("change", apply);
      }
      apply();
    });
  }

  window.initVideoPlayer = function (config) {
    var video = document.getElementById(config.videoId);
    var trigger = document.getElementById(config.triggerId);
    if (!video || !trigger || !config.source) {
      return;
    }
    var prepared = false;
    var hls = null;
    function prepare() {
      if (prepared) {
        return;
      }
      prepared = true;
      video.controls = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = config.source;
      } else if (typeof Hls !== "undefined" && Hls.isSupported()) {
        hls = new Hls({ enableWorker: true });
        hls.loadSource(config.source);
        hls.attachMedia(video);
      } else {
        video.src = config.source;
      }
    }
    function start() {
      prepare();
      trigger.classList.add("is-hidden");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {});
      }
    }
    trigger.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  ready(function () {
    setupMenu();
    setupSearchForms();
    setupHero();
    setupFilters();
  });
})();
