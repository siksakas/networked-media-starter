// imports the .env library and allows us to access the variables in the .env file by using process.env.VARIABLE_NAME
require('dotenv').config();
const jsdom = require('jsdom');

const m = require('masto');

// set up ability to use masto library
// similar to making app

const masto = m.createRestAPIClient({
    url: 'https://networked-media.itp.io',
    accessToken: process.env.TOKEN
})

const stream = m.createStreamingAPIClient({
    accessToken: process.env.TOKEN,
    streamingApiUrl: 'wss://networked-media.itp.io'
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


const reply = async () => {
    //waiting for acc to receieve notifs
    const notifications = await stream.user.notification.subscribe();
    
    for await (let notif of notifications) {
        console.log(notif.payload)
        let type = notif.payload.type

        if(type=="mentiom"){
            const input = new jsdom.JSDOM(notif.payload.status.content);
            const text = input.window.document.querySelector("p").textContent;
            console.log(notif.payload.status.content)
            console.log("parse:" + text)

            // make a request to store info to my server

            await fetch('http://localhost:6001/api/add',{
                method: 'POST',
                body: JSON.stringify({
                    content: text
                }),
                header: {
                    "Content-Type": 'application/json'
                }
            })
        }
    }
}
//makeStatus();
//post a status every 10 seconds
//setInterval(makeStatus,10000);
reply();