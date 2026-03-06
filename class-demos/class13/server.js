// how do we know this is a npm project?
// A: package.json

// what command do we run to start an npm project?
// A: npm init

// how do we create the node_modules folder if it doesn't exist?
// A: npm install
// there is a dependencies objeect so we do not need to list all the libraries that are required

// what does the below chunk of code do?
// A: importing the libraries
const express = require('express');
const multer = require('multer');

// what is app?
// A: creates an instance of express we can use it to access all of the functions of express, such as app.get, app.post, etc.
const app = express();

// what is this configuring?
// A: the destination for the uploaded files for multer
const upload = multer({
	dest: 'public/uploads',
});

// what do each of these statements do?
// write the answer next to the line of code
app.use(express.static('public')); // A: exposes and allows us to use the static files
app.use(express.urlencoded({ extended: true })); // A: allows us to use request.body to access the form data allows us to use request.body
app.set('view engine', 'ejs'); // A: allows us to do response.render and use ejs files

// what type of variable is this?
// A: global array
let posts = [];

// what type of request is this? what does it do?
// A: get request -- when the client makes the request at the / route, handle the request
app.get('/', (request, response) => {
	// how many different responses can we write? list them.
	// A: each request can only send one response we can write response.send, response.json, response.render, response.redirect, response.sendFile, etc.
	// how many parameters does response.render use? list them.
	// A: two the first is the file name and second is the variable we want to pass to the ejs file
	// write out the render for index.ejs using the global variable
	//allPosts is going to the client, posts is the global variable on the server
	//in the ejs file it goes into for post of allPosts
	response.render('index.ejs', { allPosts: posts });
});

// what are the three parameters in this function?
// A: the first one is the route, the second one is the middleware for multer to handle the file upload, and the third one is the callback function that handles the request and response
app.post('/upload', upload.single('theimage'), (req, res) => {
	let currentDate = new Date();

	// what type of data structure is this?
	// A: object
	let data = {
		text: req.body.text,
		date: currentDate.toLocaleString(),
		timestamp: currentDate.getTime(),
	};

	// why do we write this if statement?
	// A: to see if there is an image to upload in the first place
	if (req.file) {
		data.image = '/uploads/' + req.file.filename;
	}

	// what does the push function do?
	// A: it adds the post to the array of posts
	posts.push(data);

	res.redirect('/');
});

// what does the number signify?
// A: what port the server is running on
// how do we access this on the web?
// A: localhost:6001
app.listen(6001, () => {
	console.log('server started on port 6001');
});

// continue answering the questions in the index.ejs
