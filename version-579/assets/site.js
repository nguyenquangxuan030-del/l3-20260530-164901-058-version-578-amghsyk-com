
(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  const slides = Array.from(document.querySelectorAll('.hero-slide'));
  const dots = Array.from(document.querySelectorAll('.hero-dot'));
  const previous = document.querySelector('.hero-arrow.prev');
  const next = document.querySelector('.hero-arrow.next');
  let activeSlide = 0;
  let timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, current) {
      slide.classList.toggle('active', current === activeSlide);
    });
    dots.forEach(function (dot, current) {
      dot.classList.toggle('active', current === activeSlide);
    });
  }

  function scheduleSlides() {
    if (!slides.length) {
      return;
    }
    window.clearInterval(timer);
    timer = window.setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5600);
  }

  if (slides.length) {
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-slide')) || 0);
        scheduleSlides();
      });
    });
    if (previous) {
      previous.addEventListener('click', function () {
        showSlide(activeSlide - 1);
        scheduleSlides();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        showSlide(activeSlide + 1);
        scheduleSlides();
      });
    }
    scheduleSlides();
  }

  const filterForms = Array.from(document.querySelectorAll('[data-filter-form]'));

  filterForms.forEach(function (form) {
    const section = form.closest('section') || document;
    const input = form.querySelector('[data-search-input]');
    const select = form.querySelector('[data-category-filter]');
    const cards = Array.from(section.querySelectorAll('.movie-card'));

    function applyFilter() {
      const keyword = input ? input.value.trim().toLowerCase() : '';
      const category = select ? select.value : '';
      cards.forEach(function (card) {
        const text = card.getAttribute('data-text') || '';
        const cardCategory = card.getAttribute('data-category') || '';
        const matchText = !keyword || text.indexOf(keyword) !== -1;
        const matchCategory = !category || cardCategory === category;
        card.classList.toggle('is-filtered-out', !(matchText && matchCategory));
      });
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilter();
    });
    if (input) {
      input.addEventListener('input', applyFilter);
    }
    if (select) {
      select.addEventListener('change', applyFilter);
    }
  });

  const video = document.querySelector('[data-player]');
  const cover = document.querySelector('.player-cover');
  let streamLoaded = false;
  let hlsInstance = null;

  function startVideo() {
    if (!video) {
      return;
    }

    const stream = video.getAttribute('data-stream');
    if (!stream) {
      return;
    }

    if (!streamLoaded) {
      streamLoaded = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
      } else {
        video.src = stream;
      }
    }

    if (cover) {
      cover.classList.add('is-hidden');
    }

    video.controls = true;
    const promise = video.play();
    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {});
    }
  }

  if (video) {
    if (cover) {
      cover.addEventListener('click', startVideo);
    }
    video.addEventListener('click', function () {
      if (!streamLoaded || video.paused) {
        startVideo();
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
