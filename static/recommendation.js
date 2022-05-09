let feedDisplay = document.querySelector('#movie');
const urlParams = new URLSearchParams(window.location.search);

let titleInput;

let userFavourite;
let contentToCompare;
let suggestedContent1 = null;
let suggestedContent2 = null;
let suggestedContent3 = null;

let userFavouriteStars;
let contentToCompareStars;
let userFavouriteGenres;
let contentToCompareGenres;

let mood;

const userFavourites = [];
// Contains all users who share a favourited movie with the main user
const otherUsers = [];
// Contains all favourited movies of other users
const otherUserFavourites = [];

const contentArray = [];

fetch('http://localhost:3000/content')
    .then(response => response.json())
    .then(data => {
        data.forEach(content => {
            contentArray.push(content);
        })
    })

const username = document.getElementById("username").innerHTML.split(",")[1].trim();

fetch('http://localhost:3000/favouritesData')
    .then(response => response.json())
    .then(data => {
        data.forEach(favourite => {
            if (favourite.Username === username) {
                userFavourites.push(favourite.Series_Title);
            }
        })

        data.forEach(favourite => {
            if (userFavourites.includes(favourite.Series_Title) && !otherUsers.includes(favourite.Username) && favourite.Username != username) {
                otherUsers.push(favourite.Username);
            }
        })

        data.forEach(favourite => {
            if (otherUsers.includes(favourite.Username) && favourite.Username != username && !otherUserFavourites.includes(favourite.Series_Title) && !userFavourites.includes(favourite.Series_Title)) {
                otherUserFavourites.push(favourite.Series_Title);
            }
        })
    })


let wsidStart = document.getElementById("wsid");
if (wsidStart.style.display === "none") {
    document.getElementById("wsid").style.display = "block"
}

function whatShouldIDo() {
    document.getElementById("wsid").style.display = "none";
    mood = document.getElementById("mood").value;
    contentArray.forEach(content => {
        contentToCompare = new Content(content.Poster_Link, content.Series_Title, content.Overview, content.Released_Year, content.Certificate, content.Runtime, content.Genre, content.IMDB, content.Metascore, content.Director, content.Star1, content.Star2, content.Star3, content.Star4);
        contentToCompareStars = [contentToCompare.star1, contentToCompare.star2, contentToCompare.star3, contentToCompare.star4];
        contentToCompareGenres = contentToCompare.genre.split(",");

        if (suggestedContent1 == null) {
            suggestedContent1 = contentToCompare;
        } else if (suggestedContent2 == null) {
            suggestedContent2 = contentToCompare;
        } else if (suggestedContent3 == null) {
            suggestedContent3 = contentToCompare;
        } else {
            otherUserFavourites.forEach(favourite => {
                if (contentToCompare.title == favourite) {
                    comparison();
                }
            })
        }
    })

    createFeed();
}

function comparison() {
    let score = 0;

    contentArray.forEach(content => {
        userFavourites.forEach(favourite => {
            if (content.Series_Title == favourite) {
                userFavourite = new Content(content.Poster_Link, content.Series_Title, content.Overview, content.Released_Year, content.Certificate, content.Runtime, content.Genre, content.IMDB, content.Metascore, content.Director, content.Star1, content.Star2, content.Star3, content.Star4);
                userFavouriteStars = [userFavourite.star1, userFavourite.star2, userFavourite.star3, userFavourite.star4];
                userFavouriteGenres = userFavourite.genre.split(",");
                score = score + scoreGenerator();
            }
        })
    })

    // Finds the Suggested Content with the lowest score
    // If the Generated Score is greater than the Suggested Contents score, the score is replaced
    if (suggestedContent1.score <= suggestedContent2.score && suggestedContent1.score <= suggestedContent3.score && score > suggestedContent1.score) {
        suggestedContent1 = contentToCompare;
        suggestedContent1.score = score
    } else if (suggestedContent2.score <= suggestedContent1.score && suggestedContent2.score <= suggestedContent3.score && score > suggestedContent2.score) {
        suggestedContent2 = contentToCompare;
        suggestedContent2.score = score
    } else if (score > suggestedContent3.score) {
        suggestedContent3 = contentToCompare;
        suggestedContent3.score = score;
    }

}
// Generates a score by comparing the selected movie and the movie being compared to it
function scoreGenerator() {
    let score = 0;
    if (userFavourite.releaseYear - 3 <= contentToCompare.releaseYear || userFavourite.releaseYear + 3 >= contentToCompare.releaseYear) {
        score = score + 2;
    } else if (userFavourite.releaseYear - 5 <= contentToCompare.releaseYear || userFavourite.releaseYear + 5 >= contentToCompare.releaseYear) {
        score = score + 1;
    }

    if (userFavourite.certificate == contentToCompare.certificate) {
        score = score + 1;
    }

    if (userFavourite.runtime - 15 <= contentToCompare.runtime || userFavourite.runtime + 15 >= contentToCompare.runtime) {
        score = score + 1;
    }

    if (userFavourite.imdb - 0.5 <= contentToCompare.imdb || userFavourite.imdb + 0.5 >= contentToCompare.imdb) {
        score = score + 2;
    } else if (userFavourite.imdb - 1 <= contentToCompare.imdb || userFavourite.imdb + 1 >= contentToCompare.imdb) {
        score = score + 1;
    }

    if (userFavourite.metascore - 5 <= contentToCompare.metascore || userFavourite.metascore + 5 >= contentToCompare.metascore) {
        score = score + 2;
    } else if (userFavourite.metascore - 10 <= contentToCompare.metascore || userFavourite.metascore + 10 >= contentToCompare.metascore) {
        score = score + 1;
    }

    if (userFavourite.director == contentToCompare.director) {
        score = score + 3;
    }

    for (let i = 0; i < userFavouriteStars.length; i++) {
        for (let j = 0; j < contentToCompareStars.length; j++) {
            if (userFavouriteStars[i] == contentToCompareStars[j]) {
                score = score + 1;
            }
        }
    }

    for (let i = 0; i < userFavouriteGenres.length; i++) {
        for (let j = 0; j < contentToCompareGenres.length; j++) {
            if (userFavouriteGenres[i] == contentToCompareGenres[j]) {
                if (mood === 'horror' && contentToCompareGenres[j] === 'Horror') {
                    score = score + 10;
                } else if (mood === 'comedy' && contentToCompareGenres[j] === 'Comedy') {
                    score = score + 10;
                } else if (mood === 'drama' && contentToCompareGenres[j] === 'Drama') {
                    score = score + 10;
                } else if (mood === 'mystery' && contentToCompareGenres[j] === 'Mystery') {
                    score = score + 10;
                } else if (mood === 'romance' && contentToCompareGenres[j] === 'Romance') {
                    score = score + 10;
                } else if (mood === 'war' && contentToCompareGenres[j] === 'War') {
                    score = score + 10;
                } else if (mood === 'thriller' && contentToCompareGenres[j] === 'Thriller') {
                    score = score + 10;
                } else if (mood === 'action' && contentToCompareGenres[j] === 'Action') {
                    score = score + 10;
                } else if (mood === 'adventure' && contentToCompareGenres[j] === 'Adventure') {
                    score = score + 10;
                } else if (mood === 'animationFantasy' && contentToCompareGenres[j] === 'Animation' || contentToCompareGenres[j] === 'Fantasy') {
                    score = score + 10;
                } else {
                    score = score + 1;
                }
            }
        }
    }

    return score;
}

// Adds all necessary details to webpage
function createFeed() {
    // feedDisplay = document.querySelector('#suggestedMovie1Image');
    // feedDisplay.insertAdjacentHTML("beforeend", '<img src="' + suggestedContent1.image + '" alt="Movie Poster" width="60" height="180"")></img>');
    feedDisplay = document.querySelector('#suggestedMovie1Title');
    feedDisplay.insertAdjacentHTML("beforeend", "<h1>Suggestion 1: " + suggestedContent1.title + "</h1>");
    feedDisplay = document.querySelector('#suggestedMovie1Desc')
    feedDisplay.insertAdjacentHTML("beforeend", "<p>" + suggestedContent1.description + "</p>");

    // feedDisplay = document.querySelector('#suggestedMovie2Image');
    // feedDisplay.insertAdjacentHTML("beforeend", '<img src="' + suggestedContent2.image + '" alt="Movie Poster" width="60" height="180"")></img>');
    feedDisplay = document.querySelector('#suggestedMovie2Title');
    feedDisplay.insertAdjacentHTML("beforeend", "<h1>Suggestion 2: " + suggestedContent2.title + "</h1>");
    feedDisplay = document.querySelector('#suggestedMovie2Desc')
    feedDisplay.insertAdjacentHTML("beforeend", "<p>" + suggestedContent2.description + "</p>");

    // feedDisplay = document.querySelector('#suggestedMovie3Image');
    // feedDisplay.insertAdjacentHTML("beforeend", '<img src="' + suggestedContent3.image + '" alt="Movie Poster" width="60" height="180"")></img>');
    feedDisplay = document.querySelector('#suggestedMovie3Title');
    feedDisplay.insertAdjacentHTML("beforeend", "<h1>Suggestion 3: " + suggestedContent3.title + "</h1>");
    feedDisplay = document.querySelector('#suggestedMovie3Desc')
    feedDisplay.insertAdjacentHTML("beforeend", "<p>" + suggestedContent3.description + "</p>");
}

// Content constructor
function Content(Image, Title, Description, ReleaseYear, Certificate, Runtime, Genre, IMDB, Metascore, Director, Star1, Star2, Star3, Star4) {
    this.image = Image;
    this.title = Title;
    this.description = Description;
    this.releaseYear = ReleaseYear;
    this.certificate = Certificate;
    this.runtime = Runtime;
    this.genre = Genre;
    this.imdb = IMDB;
    this.metascore = Metascore;
    this.director = Director;
    this.star1 = Star1;
    this.star2 = Star2;
    this.star3 = Star3;
    this.star4 = Star4;
    this.score = 0;
}