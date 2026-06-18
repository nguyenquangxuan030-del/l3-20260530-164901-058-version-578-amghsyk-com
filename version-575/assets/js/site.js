(function () {
  const toggleButton = document.querySelector(".menu-toggle");
  const mobilePanel = document.querySelector(".mobile-panel");

  if (toggleButton && mobilePanel) {
    toggleButton.addEventListener("click", function () {
      const expanded = toggleButton.getAttribute("aria-expanded") === "true";
      toggleButton.setAttribute("aria-expanded", String(!expanded));
      mobilePanel.hidden = expanded;
      toggleButton.textContent = expanded ? "☰" : "×";
    });
  }

  const carousel = document.querySelector("[data-hero-carousel]");

  if (carousel) {
    const slides = Array.from(carousel.querySelectorAll(".hero-slide"));
    const dots = Array.from(carousel.querySelectorAll(".hero-dot"));
    const prev = carousel.querySelector(".hero-prev");
    const next = carousel.querySelector(".hero-next");
    let index = 0;
    let timer = null;

    const showSlide = function (nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    };

    const start = function () {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    };

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        showSlide(Number(dot.dataset.slide || 0));
        start();
      });
    });

    showSlide(0);
    start();
  }

  const filterInput = document.getElementById("card-filter");
  const categoryFilter = document.getElementById("category-filter");
  const filterRegion = document.querySelector("[data-filter-region]");

  const runFilter = function () {
    if (!filterRegion) {
      return;
    }

    const cards = Array.from(filterRegion.querySelectorAll(".searchable-card"));
    const keyword = filterInput ? filterInput.value.trim().toLowerCase() : "";
    const category = categoryFilter ? categoryFilter.value : "";

    cards.forEach(function (card) {
      const haystack = card.dataset.search || "";
      const cardCategory = card.dataset.category || "";
      const keywordMatched = !keyword || haystack.includes(keyword);
      const categoryMatched = !category || cardCategory === category;
      card.hidden = !(keywordMatched && categoryMatched);
    });
  };

  if (filterInput) {
    filterInput.addEventListener("input", runFilter);
  }

  if (categoryFilter) {
    categoryFilter.addEventListener("change", runFilter);
  }

  const pageSearchInput = document.getElementById("search-page-input");
  const searchResults = document.getElementById("search-results");
  const searchEmpty = document.getElementById("search-empty");

  if (pageSearchInput && searchResults && Array.isArray(window.SITE_MOVIES || SITE_MOVIES)) {
    const params = new URLSearchParams(window.location.search);
    const initialQuery = params.get("q") || "";
    pageSearchInput.value = initialQuery;

    const renderResultCard = function (movie) {
      return [
        '<article class="movie-card compact-card searchable-card">',
        '  <a class="poster-link" href="' + movie.url + '">',
        '    <img src="' + movie.poster + '" alt="' + escapeHtml(movie.title) + ' 海报" loading="lazy">',
        '    <span class="poster-badge">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + '</span>',
        '  </a>',
        '  <div class="movie-card-body">',
        '    <p class="card-kicker">' + escapeHtml(movie.category) + '</p>',
        '    <h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
        '    <p class="card-meta">' + escapeHtml(movie.type) + ' / ' + escapeHtml(movie.genre) + '</p>',
        '    <p class="card-desc">' + escapeHtml(movie.oneLine) + '</p>',
        '  </div>',
        '</article>'
      ].join("");
    };

    const runSearch = function () {
      const query = pageSearchInput.value.trim().toLowerCase();
      const pool = window.SITE_MOVIES || SITE_MOVIES;
      const matched = pool.filter(function (movie) {
        const text = [movie.title, movie.region, movie.year, movie.type, movie.genre, movie.tags, movie.category, movie.oneLine].join(" ").toLowerCase();
        return !query || text.includes(query);
      }).slice(0, 120);

      searchResults.innerHTML = matched.map(renderResultCard).join("");
      searchEmpty.hidden = matched.length > 0;
    };

    pageSearchInput.addEventListener("input", runSearch);
    runSearch();
  }

  const player = document.getElementById("movie-player");
  const playerOverlay = document.getElementById("player-overlay");
  const playerConfig = document.getElementById("player-config");

  if (player && playerOverlay && playerConfig) {
    let attached = false;
    let hlsInstance = null;
    const config = JSON.parse(playerConfig.textContent || "{}");
    const source = config.src || "";

    const attachSource = function () {
      if (attached || !source) {
        return;
      }

      attached = true;

      if (player.canPlayType("application/vnd.apple.mpegurl")) {
        player.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(player);
      } else {
        player.src = source;
      }
    };

    const startPlayback = function () {
      attachSource();
      playerOverlay.hidden = true;
      const playRequest = player.play();

      if (playRequest && typeof playRequest.catch === "function") {
        playRequest.catch(function () {
          playerOverlay.hidden = false;
        });
      }
    };

    playerOverlay.addEventListener("click", startPlayback);
    player.addEventListener("click", function () {
      if (player.paused) {
        startPlayback();
      }
    });
    player.addEventListener("play", function () {
      playerOverlay.hidden = true;
    });
    player.addEventListener("pause", function () {
      if (!player.ended) {
        playerOverlay.hidden = false;
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
