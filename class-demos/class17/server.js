const express = require('express');

const nedb = require('@seald-io/nedb')

const app = express();

// init db
//filename is what stores our data externally
const db = new nedb({ filename: 'mydatabase.txt', autoload: true });

app.use(express.static('public'));

app.use(express.urlencoded({ extended: true })); //middleware to parse urlencoded data from the body of the request

app.post('/makePost', (req, res) => {
    //retrieve client data
    // getting info from request, then the body, then name = content in post.html
    // if it was a get would be req.query.customName
    //req.body is undefined without app.use(express.urlencoded({extended: true}));
    let dataToBeAdded = {
        text: req.body.content
    }
    //replacing prev global arr
    db.insert(dataToBeAdded);
    console.log(req.body.content);
    res.redirect('/post.html'); //redirects to homepage after post is made
});

app.get('/', (req, res) => {

    //insert has two parameters
    //1. obj to add
    // 2. callback function once has been added
    let dataToBeAdded = {
        text: 'Hello World'
    };
    db.insert(dataToBeAdded)
    res.send('<h1>Hello World</h1>');
});
app.get('/api/entireDB', (req, res) => {
    //find takes two parameters
    //1. obj we want
    // if we pass an empty obj, it will return everything
    //2. callback function once has been found
    let query = {};

    db.find(query, (err, foundData) => {
        if (err) {
            console.log(err);
        }
        else {
            res.json(foundData);
        }
    });
});

app.get('/api/notes', (req, res) => {
    let query = {
        text: {$exists: true} //finds all objects that have a text property
    };

    db.find(query, (err, foundData) => {
        if (err) {
            console.log(err);
        }
        else {
            res.json(foundData);
        }
    });
});

app.listen(4005, () => {
    console.log('Server is running on port 4005');
});

