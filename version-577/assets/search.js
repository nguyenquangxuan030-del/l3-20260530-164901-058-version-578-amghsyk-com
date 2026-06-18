(function () {
  var form = document.querySelector('[data-search-form]');
  var input = document.querySelector('[data-search-input]');
  var status = document.querySelector('[data-search-status]');
  var grid = document.querySelector('[data-search-results]');
  var movies = window.SearchMovies || [];

  function params() {
    return new URLSearchParams(window.location.search);
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function match(movie, keyword) {
    var text = [
      movie.title,
      movie.year,
      movie.region,
      movie.category,
      movie.genre,
      movie.oneLine,
      (movie.tags || []).join(' ')
    ].join(' ').toLowerCase();
    return text.indexOf(keyword) !== -1;
  }

  function card(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '<article class="movie-card">' +
      '<a class="movie-poster" href="' + movie.url + '">' +
      '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
      '<span class="movie-label">' + escapeHtml(movie.category) + '</span>' +
      '</a>' +
      '<div class="movie-body">' +
      '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>' +
      '<p>' + escapeHtml(movie.oneLine) + '</p>' +
      '<div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span></div>' +
      '<div class="tag-strip">' + tags + '</div>' +
      '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  function render(keyword) {
    var key = normalize(keyword);
    if (input) {
      input.value = keyword || '';
    }
    var results = key ? movies.filter(function (movie) {
      return match(movie, key);
    }).slice(0, 96) : movies.slice(0, 48);
    if (status) {
      status.textContent = key ? '搜索结果：' + keyword : '热门推荐';
    }
    if (grid) {
      grid.innerHTML = results.map(card).join('');
    }
  }

  if (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var keyword = input ? input.value.trim() : '';
      var nextUrl = keyword ? './search.html?q=' + encodeURIComponent(keyword) : './search.html';
      window.history.replaceState(null, '', nextUrl);
      render(keyword);
    });
  }

  render(params().get('q') || '');
})();
