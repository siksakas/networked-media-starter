const express = require('express');
const multer = require('multer');
const nedb = require('@seald-io/nedb');
const cookieParser = require('cookie-parser');

// variables / initialize using library

const app = express();
const upload = multer({dest: 'public/uploads'})
const databse = new nedb({
    filename: 'database.txt',
    autoload: true
})

// middleware

app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));
//this means that we can access the form data using req.body
// it does this by parsing the incoming request body and making it available as a JavaScript object
// the extended: true option allows for parsing of nested objects, which can be useful for handling more complex form data
app.use(cookieParser());
// allows for requests.cookies to be accessed using req.cookies

app.set('view engine', 'ejs');

// routes

app.get('/', (req, res) => {
    let totalVisits = 1;
    if (req.cookies.visits) {
        totalVisits = parseInt(req.cookies.visits) +1;
    }
    let hundredYears = Date.now() + 100 * 365 * 24 * 60 * 60 * 1000;
    //creates a cookie
    // has two params first is key name 
    // second is an object with attributes of the cookie
    res.cookie('visits', totalVisits ,{expires: new Date(hundredYears)});
    res.render('index.ejs', {serverVisitCount: totalVisits});
})

// server data using 
app.listen(8080, () =>{
    console.log('server running on port 8080');
})