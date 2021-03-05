const autocompleteConfig = {
  renderOption(movie) {
    const imgSrc = movie.Poster === 'N/A' ? '' : movie.Poster;
    return `
      <img src="${imgSrc}" />
      ${movie.Title} (${movie.Year})
    `;
  },
  inputValue(movie) {
    return movie.Title;
  },
  async fetchData(searchTerm) {
    const response = await axios.get('http://www.omdbapi.com/', {
      params: {
        apikey: 'd9835cc5',
        s: searchTerm,
      },
    });
    console.log(response.data.Search);
    if (response.data.Error) {
      return [];
    }
    return response.data.Search;
  },
};

createAutoComplete({
  ...autocompleteConfig,
  root: document.querySelector('#left-autocomplete'),
  onOptionSelect(movie) {
    document.querySelector('.tutorial').classList.add('is-hidden');
    onMovieSelect(movie, document.querySelector('#left-summary'));
  },
});
createAutoComplete({
  ...autocompleteConfig,
  root: document.querySelector('#right-autocomplete'),
  onOptionSelect(movie) {
    document.querySelector('.tutorial').classList.add('is-hidden');
    onMovieSelect(movie, document.querySelector('#right-summary'));
  },
});

const onMovieSelect = async (movie, summary) => {
  const response = await axios.get('http://www.omdbapi.com/', {
    params: {
      apikey: 'd9835cc5',
      i: movie.imdbID,
    },
  });
  console.log(response.data);
  summary.innerHTML = movieTemplate(response.data);
  if (
    document.querySelector('#left-summary').lastChild &&
    document.querySelector('#right-summary').lastChild
  ) {
    compare();
  }
};

const compare = () => {
  const left = document.querySelectorAll('#left-summary .notification');
  const right = document.querySelectorAll('#right-summary .notification');
  left.forEach((leftItem, i) => {
    const rightItem = right[i];
    const leftNum = parseFloat(leftItem.dataset.value);
    const rightNum = parseFloat(rightItem.dataset.value);
    if (leftNum > rightNum || isNaN(rightNum)) {
      console.log(rightItem);
      rightItem.className = 'notification is-warning';
      leftItem.className = 'notification is-primary';
    } else if (leftNum < rightNum || isNaN(leftNum)) {
      console.log(rightItem);

      rightItem.className = 'notification is-primary';
      leftItem.className = 'notification is-warning';
    }
  });
};

const movieTemplate = movieDetail => {
  const dollars = movieDetail.BoxOffice
    ? parseInt(movieDetail.BoxOffice.replace(/\$/g, '').replace(/,/g, ''))
    : 'N/A';
  const metascore = parseInt(movieDetail.Metascore) || 'N/A';
  const imdbRating = parseFloat(movieDetail.imdbRating) || 'N/A';
  const imdbVotes = parseInt(movieDetail.imdbVotes.replace(/,/g, '')) || 'N/A';
  const minutes = parseInt(movieDetail.Runtime.split(' ')[0]);
  const awards = movieDetail.Awards.split(' ').reduce((prev, curr) => {
    const num = parseInt(curr);
    if (isNaN(num)) return prev;
    else return prev + num;
  }, 0);

  return `
    <article class="media">
      <figure class="media-left">
        <p class="image">
          <img src="${movieDetail.Poster}" />
        </p>
      </figure>
      <div class="media-content">
        <div class="content">
          <h1>${movieDetail.Title}</h1>
          <h4>${movieDetail.Genre}</h4>
          <p>${movieDetail.Plot}</p>
        </div>
      </div>
    </article>
    <article data-value=${awards} class="notification is-primary">
      <p class="title">${movieDetail.Awards}</p>
      <p class="subtitle">Awards</p>
    </article>
    <article data-value=${dollars} class="notification is-primary">
      <p class="title">${movieDetail.BoxOffice}</p>
      <p class="subtitle">Box Office</p>
    </article>
    <article data-value=${metascore} class="notification is-primary">
      <p class="title">${movieDetail.Metascore}</p>
      <p class="subtitle">Metascore</p>
    </article>
    <article data-value=${imdbRating} class="notification is-primary">
      <p class="title">${movieDetail.imdbRating}</p>
      <p class="subtitle">IMDB Rating</p>
    </article>
    <article data-value=${imdbVotes} class="notification is-primary">
      <p class="title">${movieDetail.imdbVotes}</p>
      <p class="subtitle">IMDB Votes</p>
    </article>
    <article data-value=${minutes} class="notification is-primary">
      <p class="title">${movieDetail.Runtime}</p>
      <p class="subtitle">Length of the movie in minutes</p>
    </article>
  `;
};
