(function () {
  var body = document.body;
  var menuToggle = document.querySelector("[data-menu-toggle]");

  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      body.classList.toggle("menu-open");
    });
  }

  document.querySelectorAll("[data-site-search]").forEach(function (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var input = form.querySelector("input[name='q']");
      var query = input ? input.value.trim() : "";
      var target = "./search.html";
      if (query) {
        target += "?q=" + encodeURIComponent(query);
      }
      window.location.href = target;
    });
  });

  var params = new URLSearchParams(window.location.search);
  var queryValue = params.get("q") || "";
  var pageSearch = document.querySelector("[data-page-search]");
  var grid = document.querySelector("[data-filter-grid]");
  var activeTag = "";

  if (pageSearch && queryValue) {
    pageSearch.value = queryValue;
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function applyFilter() {
    if (!grid) {
      return;
    }
    var text = normalize(pageSearch ? pageSearch.value : "");
    var tag = normalize(activeTag);
    grid.querySelectorAll("[data-card]").forEach(function (card) {
      var searchText = normalize(card.getAttribute("data-search"));
      var genreText = normalize(card.getAttribute("data-genre"));
      var textMatch = !text || searchText.indexOf(text) !== -1;
      var tagMatch = !tag || searchText.indexOf(tag) !== -1 || genreText.indexOf(tag) !== -1;
      card.hidden = !(textMatch && tagMatch);
    });
  }

  if (pageSearch) {
    pageSearch.addEventListener("input", applyFilter);
  }

  document.querySelectorAll("[data-filter-tag]").forEach(function (button) {
    button.addEventListener("click", function () {
      activeTag = button.getAttribute("data-filter-tag") || "";
      document.querySelectorAll("[data-filter-tag]").forEach(function (item) {
        item.classList.toggle("active", item === button);
      });
      applyFilter();
    });
  });

  applyFilter();

  document.querySelectorAll("[data-hero]").forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
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

    if (slides.length > 1) {
      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
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

      hero.addEventListener("mouseenter", stop);
      hero.addEventListener("mouseleave", start);
      start();
    }
  });
})();

function initMoviePlayer(sourceUrl) {
  var video = document.getElementById("moviePlayer");
  var cover = document.getElementById("playerCover");
  var hlsInstance = null;
  var attached = false;

  if (!video || !sourceUrl) {
    return;
  }

  function hideCover() {
    if (cover) {
      cover.classList.add("is-hidden");
    }
  }

  function showCover() {
    if (cover) {
      cover.classList.remove("is-hidden");
    }
  }

  function playVideo() {
    hideCover();
    var result = video.play();
    if (result && typeof result.catch === "function") {
      result.catch(function () {
        showCover();
      });
    }
  }

  function attachSource(callback) {
    if (attached) {
      callback();
      return;
    }
    attached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
      video.addEventListener("loadedmetadata", callback, { once: true });
      video.load();
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, callback);
      hlsInstance.on(window.Hls.Events.ERROR, function (_event, data) {
        if (data && data.fatal) {
          try {
            hlsInstance.destroy();
          } catch (error) {}
          video.src = sourceUrl;
          video.load();
        }
      });
      return;
    }

    video.src = sourceUrl;
    video.addEventListener("loadedmetadata", callback, { once: true });
    video.load();
  }

  function startPlayback() {
    attachSource(playVideo);
  }

  if (cover) {
    cover.addEventListener("click", startPlayback);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      startPlayback();
    }
  });

  video.addEventListener("play", hideCover);
}
