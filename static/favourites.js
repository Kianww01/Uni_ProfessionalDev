let feedDisplay = document.querySelector('#movie');
const urlParams = new URLSearchParams(window.location.search);

let titleInput;

// Checks for any movies that contain the users input in the title
// Populates a drop down box with found movies
if (urlParams.get('title') != null) {
    titleInput = urlParams.get('title').toLowerCase();
    fetch('http://localhost:3000/titles')
        .then(response => response.json())
        .then(data => {
            data.forEach(title => {
                seriesTitle = (title.Series_Title);

                if (seriesTitle.toLowerCase().includes(titleInput)) {
                    const title = `<option value='${seriesTitle}'>${seriesTitle}</option>`;
                    feedDisplay.insertAdjacentHTML("beforeend", title);
                }
            })
        })
}

if (urlParams.get('movie') != null) {
    // Gets Selected Movies details
    fetch('http://localhost:3000/content')
        .then(response => response.json())
        .then(data => {
            data.forEach(content => {
                if (content.Series_Title == urlParams.get('movie')) {
                    let selectedMovieTitle = content.Series_Title;
                    alert(`${selectedMovieTitle} has been added to your favourites`);
                }
            })
        })
}