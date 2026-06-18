(function () {
  function bindHls(video, src) {
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (video.getAttribute('src') !== src) {
        video.setAttribute('src', src);
      }
      return null;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var instance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      instance.loadSource(src);
      instance.attachMedia(video);
      return instance;
    }
    video.setAttribute('src', src);
    return null;
  }

  window.initPlayer = function (src) {
    var video = document.querySelector('.player-video');
    var button = document.querySelector('.player-start');
    if (!video || !src) {
      return;
    }

    var hls = bindHls(video, src);
    var started = false;

    function begin() {
      if (started) {
        return;
      }
      started = true;
      if (button) {
        button.classList.add('is-hidden');
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          started = false;
          if (button) {
            button.classList.remove('is-hidden');
          }
        });
      }
    }

    if (button) {
      button.addEventListener('click', begin);
    }

    video.addEventListener('play', function () {
      started = true;
      if (button) {
        button.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (video.currentTime === 0 && button) {
        button.classList.remove('is-hidden');
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  };
})();
