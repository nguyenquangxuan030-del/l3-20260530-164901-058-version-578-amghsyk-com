(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
      return;
    }
    callback();
  }

  function attachStream(video, url) {
    if (video.dataset.loaded === '1') {
      return;
    }
    video.dataset.loaded = '1';
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(url);
      hls.attachMedia(video);
      video._hls = hls;
      return;
    }
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      return;
    }
    video.src = url;
  }

  function start(video, mask) {
    var url = video.getAttribute('data-stream');
    if (!url) {
      return;
    }
    attachStream(video, url);
    if (mask) {
      mask.classList.add('hidden');
    }
    var result = video.play();
    if (result && typeof result.catch === 'function') {
      result.catch(function () {});
    }
  }

  ready(function () {
    Array.prototype.slice.call(document.querySelectorAll('.movie-player')).forEach(function (video) {
      var mask = document.querySelector('[data-player-target="' + video.id + '"]');
      if (mask) {
        mask.addEventListener('click', function () {
          start(video, mask);
        });
      }
      video.addEventListener('play', function () {
        attachStream(video, video.getAttribute('data-stream'));
        if (mask) {
          mask.classList.add('hidden');
        }
      }, { once: true });
    });
  });
})();
