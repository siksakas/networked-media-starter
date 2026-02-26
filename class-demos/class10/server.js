//imports express moduke
const express = require('express');
//initializes express application
const app = express();

let guestNames = [];

//route handlers
//when server gets request at location, do this

//get request, first param is location / route second is the action to happen when client makes request
// two params in callback are request and response objects, req and res
app.get('/helloworld',(request,response)=>{
    response.send("<h1>wow my first server is working!</h1>");
});
app.get('/hi',(request,response)=>{
    //redirects to the location specified in the parameter
    response.redirect('/helloworld');
});

app.get('/sign',(request,response)=>{
    let name = request.query.guestName;
    guestNames.push(name);
    console.log(guestNames);
    //response.send("<h1>thanksssssss " + name + "!</h1>");
    response.redirect('/guestbook');
});

//set up middlewear
//public is the name of the server
//public is the folder that will have all of my frontend files
//all html, css, and frontend js will live there
app.use(express.static('public'));

//set up templating software
app.set('view engine', 'ejs');


app.get('/guestbook',(request,response)=>{
    //allows our server to send and render our ejs as html to the client
    let dataToBeSent = {
        serverData: "hello"
    }
    //first param is name of ejs file, second is object to be sent to client
    response.render('guestbook.ejs', dataToBeSent);
})
//1st param is port number and second is callback function
app.listen(8080, () => {
    //will NOT show in browser console
    console.log('Server is running on port 8080!');
});