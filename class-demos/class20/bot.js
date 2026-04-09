// imports the .env library and allows us to access the variables in the .env file by using process.env.VARIABLE_NAME
require('dotenv').config();
const jsdom = require('jsdom');

const m = require('masto');

const WORDS = [
  "APPLE", "BANANA", "CANDLE", "DRAGON", "ELEPHANT", "FOREST",
  "GARDEN", "HARBOR", "ISLAND", "JACKET", "KANSAS", "LANTERN",
  "MARKET", "NEEDLE", "OCEAN", "POCKET", "QUARTZ", "ROCKET",
  "SUNSET", "TUNNEL", "UMBRELLA", "VALLEY", "WINDOW", "YELLOW",
  "ZEBRA", "ANCHOR", "BUTTON", "CIRCLE", "DESERT", "ENGINE",
  "FLOWER", "GRAVITY", "HUNTER", "INSECT", "JOURNEY", "KERNEL",
  "LIBRARY", "MIRROR", "NATURE", "OBJECT", "PILLOW", "QUIVER",
  "RANDOM", "SHADOW", "TEMPLE", "UNIVERSE", "VISION", "WONDER"
];

let currentWord = "";
let previousWord = "GRAVITY";
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

    let randomSelection = Math.floor(Math.random() * WORDS.length);
    let word = WORDS[randomSelection];
    let clue = "";

    for(let i = 0; i < word.length; i++){
        if(Math.random() < 0.5){
            clue += word[i];
        } else {
            clue += "_";
        }
    }

    previousWord = currentWord;
    currentWord = word;
    
    const s = await masto.v1.statuses.create({
        status: "Guess the word!\n" + clue+"\n the previous word was "+previousWord+".\n#wordgame",
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

        if(type=="mention"){
            let response = "incorrect!"
            const input = new jsdom.JSDOM(notif.payload.status.content);
            const text = input.window.document.querySelector("p").textContent;
            console.log(notif.payload.status.content)
            console.log("parse:" + text)

            if (text.includes(currentWord)){
                response = "the word was guessed correctly! the word was " + currentWord + "\n #wordgame";
            }

                        const w = await masto.v1.statuses.create({
                status: response,
                visibility: "public" //private for testing posts
            });
            console.log(w.url);

            // make a request to store info to my server
            await fetch('http://localhost:6001/api/add',{
                method: 'POST',
                body: JSON.stringify({
                    content: text
                }),
                headers: {
                    "Content-Type": 'application/json'
                }
            })
        }
    }
}
makeStatus();
//post a status every 30 min 0 seconds
setInterval(makeStatus,1800000);
reply();