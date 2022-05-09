const alert = require('alert');
const express = require('express');
const mysql = require('mysql');
const session = require('express-session');
const ejs = require('ejs');

const app = express();
const port = process.env.PORT || 3000;

// Parsing middleware
// Parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// Parse application/json
app.use(express.json());

app.engine('html', ejs.renderFile);

// MySQL code goes here
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'wsid'
})

app.use(session({
    secret: 'WSIDSecret',
    resave: true,
    saveUninitialized: true
}));

const path = require('path');
const res = require('express/lib/response');
const { redirect } = require('express/lib/response');

// Display Homepage
app.get('/', function(req, res) {
    res.render(__dirname + '/views/index.html');
})

// Create recommendation page
app.get('/recommendation', function(req, res) {
    if (req.session.loggedin) {
        const username = req.session.username;
        res.render(__dirname + '/views/recommendation.html', { username: username });
    } else {
        alert("You must be logged in to view this page");
        res.redirect('/login');
    }
})

app.get('/signup', function(req, res) {
    res.render(__dirname + '/views/signup.html');
})

app.get('/login', function(req, res) {
    res.render(__dirname + '/views/login.html');
})

// Create page with all content in JSON
app.get('/content', function(req, res) {
    connection.query('SELECT * FROM content', (err, results) => {
        if (!err) {
            res.json(results);
        } else {
            console.log(err);
        }
    })
})

// Create page with all content titles in JSON
app.get('/titles', function(req, res) {
    connection.query('SELECT Series_Title FROM content', (err, results) => {
        if (!err) {
            res.json(results);
        } else {
            console.log(err);
        }
    })
})

app.get('/favouritesData', function(req, res) {
    connection.query('SELECT * FROM favourites', (err, results) => {
        if (!err) {
            res.json(results);
        } else {
            console.log(err);
        }
    })
})

app.get('/favourites', function(req, res) {
    res.render(__dirname + '/views/favourites.html');
})

// Adds users details to user database
app.post('/completeSignup', function(req, res) {
    const username = req.body.username;
    const password = req.body.password;

    connection.query(`SELECT Username FROM users WHERE Username = '${username}'`, (err, results) => {
        if (!err) {
            if (results.length != 0) {
                alert("Username already in use");
                res.redirect('/signup');
            } else {
                connection.query(`INSERT INTO users VALUES('${username}', '${password}')`, (err, results) => {
                    if (!err) {
                        alert("Successfully Registered");
                        res.redirect('/login');
                    } else {
                        console.log(err);
                    }
                })
            }
        } else {
            console.log(err);
        }
    })
})

app.post('/auth', function(request, response) {
    // Capture the input fields
    let username = request.body.username;
    let password = request.body.password;
    // Ensure the input fields exists and are not empty
    if (username && password) {
        // Execute SQL query that'll select the account from the database based on the specified username and password
        connection.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
            // If there is an issue with the query, output the error
            if (error) throw error;
            // If the account exists
            if (results.length > 0) {
                // Authenticate the user
                request.session.loggedin = true;
                request.session.username = username;
                // Redirect to home page
                alert(`Successfully signed in as ${username}`);
                response.redirect('/favourites');
            } else {
                alert('Incorrect Username and/or Password!');
                response.redirect('/login');
            }
            response.end();
        });
    } else {
        response.send('Please enter Username and Password!');
        response.end();
    }
});

app.post('/favouritesAuth', function(request, response) {
    let movieTitle = request.body.title;

    if (request.session.loggedin) {
        if (movieTitle) {
            response.redirect(`/favourites?title=${movieTitle}`)
        } else {
            alert('You have not input a title')
            response.redirect('/favourites');
        }
    } else {
        alert('You are not logged in');
        response.redirect('/login');
    }
})

app.post('/addFavourite', function(request, response) {
    // Get movie title
    let movieTitle = request.body.movie;
    let username = request.session.username;
    let movieAlreadyFavourited = false;

    if (movieTitle) {
        connection.query(`SELECT Series_Title FROM favourites WHERE Username = '${username}'`, (err, results) => {
            if (!err) {
                for (let i = 0; i < results.length; i++) {
                    if (results[i].Series_Title == movieTitle) {
                        movieAlreadyFavourited = true;
                    }
                }
                if (movieAlreadyFavourited) {
                    alert(`${movieTitle} is already in your favourites`);
                    response.redirect('/favourites');
                } else {
                    connection.query(`INSERT INTO favourites VALUES(NULL, '${username}', '${movieTitle}')`, (err, results) => {
                        if (!err) {
                            response.redirect(`/favourites?movie=${movieTitle}`);
                        } else {
                            console.log(err);
                        }
                    })
                }
            } else {
                console.log(err);
            }
        })
    }
})

// Provides all static content for the webservice to use
app.use('/static', express.static('./static/'));

// Listen on environment port or 3000
app.listen(port, () => console.log(`Listening on port ${port}`));