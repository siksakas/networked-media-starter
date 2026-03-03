//these are two of the three libraries we have installed that we need to make adjustments for
const express = require('express');
const multer = require('multer');

//set up our applications that use our libraries
const app = express(); //using express library to create our application
const uploadProcessor = multer({dest: 'public/uploads/'}); //uses the multer library to upload files

//middleware settings for server
app.use(express.static('public')); //tells our application to use the public folder for static files
app.use(express.urlencoded({extended: true})); //tells our application to use urlencoded for parsing form data
app.set('view engine', 'ejs'); //tells our application to use ejs as the view engine

//global var to store all the posts
let posts = [];

//routes
app.get('/', (req, response) => {
    response.render('index.ejs',{allPosts: posts});
})
// adding second param to post handler to process the file uploaded
app.post('/makePost',uploadProcessor.single('myImage'),(request,response)=>{
    let individualPost = {caption:request.body.caption};
    if (request.file) {
        individualPost.file = request.file.filename;
    }
    console.log(individualPost);
    response.redirect('/');
    posts.push(individualPost);
})
//LAST STEP: we need to set up our server to listen for requests on a specific port, in this case:
app.listen(5001, () => {
    console.log('Server is running on port 5001');
})

