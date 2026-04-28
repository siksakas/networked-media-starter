//session storage - multiple windows of same site keep same session

const express = require('express');
const multer = require('multer');
const nedb = require('@seald-io/nedb');
const cookieParser = require('cookie-parser');

const expressSession = require('express-session');
const nedbSession = require('nedb-promises-session-store');
const bcrypt = require('bcrypt');

const app = express();

const upload = multer({ dest: 'public/uploads/' });
let database = new nedb({ filename: 'database.txt', autoload: true });

const nedbSessionInit = nedbSession({
    connect: expressSession,
    filename: 'sessions.txt'
});

const userdb = new nedb({
    filename: 'usersdb.txt',
    autoload: true
})

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set('view engine', 'ejs');

app.use(expressSession({
    store: nedbSessionInit,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365
    },
    secret: 'supersecret'
}))

//both login and register are posts requests

app.get('/login', (req, res) => {
    res.render('login.ejs');
})

app.get('/register', (req, res) => {
    res.render('register.ejs');
})

app.get('/make-post', (req, res) => {
    res.render('make-post.ejs');
})

app.get('/', (req, res) => {
    res.render('index.ejs');
})

// routes to handle whether we have logged in or create acc

app.post('/new-post', upload.single('myupload'), (req, res) => {
    console.log(req.body);
    console.log(req.file); 
    res.redirect('/'); //redirect to home page after we make a post, we can also redirect to a page with all the posts
})

app.post('/register', async (req, res) => {
    // encrypt the password before we store it in the database
    let encryptedPassword = await bcrypt.hash(req.body.pass, 10);
    let userToAdd = {
        username: req.body.username,
        password: encryptedPassword
    }
    userdb.insert(userToAdd, (err, insertedUser) => {
        res.redirect('/login');
    });

    console.log(userToAdd)
})

app.post('/authenticate', (req, res) => {
    //create our search query
    let searchedUser = {
        username: req.body.username,
    }
    userdb.findOne(searchedUser, (err, foundUser) => {
        if (foundUser == null || err) {
            console.log('user not found');
            res.redirect('/login?user=null');
        } else {
            let encryptedPassword = req.body.pass;
            //compare the password we have with the encrypted password in the database
            if (bcrypt.compareSync(req.body.pass,foundUser.password)){
                let session = req.session;
                session.loggedInUser = foundUser.username;
                res.redirect('/');
            } else {
                response.redirect('/login?password=invalid')
            }
        }
    })
})

app.listen(4000, () => {
    console.log('Server is running on port 4000');
})