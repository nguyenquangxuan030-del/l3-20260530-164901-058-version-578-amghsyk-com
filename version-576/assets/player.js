(function () {
  function setupPlayer(options) {
    var root = document.getElementById(options.rootId);
    if (!root) {
      return;
    }

    var video = root.querySelector("video");
    var cover = root.querySelector(".player-cover");
    var button = root.querySelector(".player-play");
    var started = false;
    var instance = null;

    if (!video || !options.streamUrl) {
      return;
    }

    function attachStream() {
      if (window.Hls && window.Hls.isSupported()) {
        instance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        instance.loadSource(options.streamUrl);
        instance.attachMedia(video);
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = options.streamUrl;
      } else {
        video.src = options.streamUrl;
      }
    }

    function play() {
      if (!started) {
        started = true;
        attachStream();
      }
      if (cover) {
        cover.classList.add("is-hidden");
      }
      video.controls = true;
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener("click", play);
    }

    if (button) {
      button.addEventListener("click", play);
    }

    video.addEventListener("click", function () {
      if (!started) {
        play();
      }
    });

    video.addEventListener("play", function () {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (instance && typeof instance.destroy === "function") {
        instance.destroy();
      }
    });
  }

  window.setupPlayer = setupPlayer;
})();
