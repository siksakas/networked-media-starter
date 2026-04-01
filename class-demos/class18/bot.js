// imports the .env library and allows us to access the variables in the .env file by using process.env.VARIABLE_NAME
require('dotenv').config();

const m = require('masto');

// set up ability to use masto library
// similar to making app

const masto = m.createRestAPIClient({
    url: 'https://networked-media.itp.io',
    accessToken: process.env.TOKEN
})

const makeStatus = async () => {
    // customize bla bla bla bla bla bla bla bla 
    let emojis = ['😀', '😂', '😍', '🤔', '🙄', '😎', '😭', '😡', '👍', '👎'];

    let randomSelection = Math.floor(Math.random() * emojis.length);
    
    const s = await masto.v1.statuses.create({
        status: emojis[randomSelection],
        visibility: "public" //private for testing posts
    });
    console.log(s.url);
}

//makeStatus();
//post a status every 10 seconds
setInterval(makeStatus,10000);