(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var boxes = Array.prototype.slice.call(document.querySelectorAll('[data-player-box]'));

    boxes.forEach(function (box) {
      var video = box.querySelector('video[data-src]');
      var button = box.querySelector('[data-player-trigger]');
      var status = box.querySelector('[data-player-status]');
      var hlsInstance = null;
      var initialized = false;

      function setStatus(text, hidden) {
        if (!status) {
          return;
        }
        status.textContent = text;
        status.classList.toggle('hidden', Boolean(hidden));
      }

      function attachSource() {
        if (!video || initialized) {
          return;
        }

        var source = video.getAttribute('data-src');
        if (!source) {
          setStatus('播放源暂不可用。');
          return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          initialized = true;
          setStatus('正在使用浏览器原生 HLS 播放。');
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          initialized = true;
          setStatus('HLS 播放源已加载。');
          return;
        }

        video.src = source;
        initialized = true;
        setStatus('已尝试直接加载播放源。');
      }

      function playVideo() {
        attachSource();
        if (!video) {
          return;
        }
        if (button) {
          button.classList.add('hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise
            .then(function () {
              setStatus('正在播放。', true);
            })
            .catch(function () {
              setStatus('请再次点击视频或播放按钮开始播放。');
              if (button) {
                button.classList.remove('hidden');
              }
            });
        } else {
          setStatus('正在播放。', true);
        }
      }

      if (button) {
        button.addEventListener('click', playVideo);
      }

      if (video) {
        video.addEventListener('play', function () {
          if (button) {
            button.classList.add('hidden');
          }
          setStatus('正在播放。', true);
        });
        video.addEventListener('pause', function () {
          if (video.currentTime === 0 && button) {
            button.classList.remove('hidden');
          }
        });
        video.addEventListener('error', function () {
          setStatus('播放加载异常，请刷新后重试。');
          if (button) {
            button.classList.remove('hidden');
          }
        });
      }
    });
  });
})();
