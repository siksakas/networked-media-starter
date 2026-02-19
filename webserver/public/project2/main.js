let x = 0;
let remainingSeconds = 60 * 60;
let dialogueIntervalId = null;
//TODO: Create a log of time transactions and display it in the UI
//TODO: Certain dialogue options only appear if you have certain items in your inventory or have made certain choices in the past
let inventory = ["Watch", "Work ID"];
const formatCountdown = (seconds) => {
  const hours = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${secs}`;
};

const getCountdownEndTime = (secondsFromNow) => {
  // current time
  const now = Date.now();

  // add countdown
  const endTime = new Date(now + secondsFromNow * 1000);

  let hours = endTime.getHours();
  const minutes = String(endTime.getMinutes()).padStart(2, "0");
  const seconds = String(endTime.getSeconds()).padStart(2, "0");

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // Convert to 12-hour format (0 becomes 12)
  const hoursStr = String(hours).padStart(2, "0");

  return `${hoursStr}:${minutes}:${seconds} ${ampm}`;
};

//ascii art
const character1 = [
  "friend:",
  "          .---.",
  "         / __ /\\",
  "        | /  `\\ |",
  "        \\| . . |/",
  "        (   _\\  )",
  "         |  -  |",
  "         \\  .  /",
  "         |'---'|",
  "        /'. _ .'\\",
  "     .-`-._|_|_.-`-.",
].join("\n")
const character2 = [
  "you:",
  "           .---.",
  "         /` ___|`\\",
  "         |_/    \\|",
  "         (  -/-  )",
  "          \\_ - _/",
  "         .-'|_|'-.",
  "        /         \\",
  "       /     O     \\",
  "      / _____!_____ \\",
  "     /.-------------.\\"
].join("\n")
const door = [
  "______________",
  "|\\ ___________ /|",
  "| |  _ _ _ _  | |",
  "| | | | | | | | |",
  "| | |-+-+-+-| | |",
  "| | |-+-+=+%| | |",
  "| | |_|_|_|_| | |",
  "| |    ___    | |",
  "| |   [___] ()| |",
  "| |         ||| |",
  "| |         ()| |",
  "| |           | |",
  "| |           | |",
  "| |           | |",
  "|_|___________|_| ejm"
].join("\n");
const merchant = [
  "            ,-----.",
  "           #,-. ,-.#",
  "          () a   e ()",
  "          (   (_)   )",
  "          #\\_  -  _/#",
  "        ,'   `\"\"\"`    `.",
  "      ,'      \\X/      `.",
  "     /         X     ____\\",
  "    /          v   ,`  v  `,",
  "   /    /         ( <==+==> )"
].join("\n");
const officer = [
  "officer:",
  "                ,",
  "       __  _.-\"` `\'-.",
  "      /||\\'._ __{}_(",
  "      ||||  |'--.__\\",
  "      |  L.(   ^_\\^",
  "      \\ .-' |   _ |",
  "      | |   )\\___/",
  "      |  \\-'`:._]",
  "  jgs \\__/;      '-.",
].join("\n");
const worker = [
  "                  _A",
  "                .'`\"'`,",
  "               /   , , \\",
  "              |   <\\^/> |",
  "              |  < (_) >|",
  "              /====\\",
  "             (.--._ _.--.)",
  "              |\\  -`\\- /|",
  "              |(_.- >-.)|",
  "              \\__.-'^'._/",
  "               |\\   .  /",
  "            _.'\\ '----'|'-.",
  "        _.-'  O ;-.__.' \\O `o.",
  "       /o \\      \\/-.-\\/|     \\",
  "   jgs|    ;,     '.|\\| /"
].join("\n");
const cat = [
  "/)",
  "                  ((",
  "                   ))",
  "              ,   //,",
  "             /,\\=\"=/,\\",
  "            /` d   b `\\",
  "           =\\:.  Y  .:/=",
  "            /'***o***'\\",
  "           ( (       ) )",
  "     jgs   (,,)'-=-'(,,)"
].join("\n");
const train = [
  "         (",
  "     '( '",
  "    '  //}",
  "   ( ''\"",
  "   _||__ ____ ____ ____",
  "  (o)___)}___}}___}}___}",
  "  'U'0 0  0 0  0 0  0 0  :dg:"
].join("\n");


//dialogue tree
const dialogueTree = {
  start: {
    "id": "start",
    "text": "What's up?",
    "options": [
      { "response": "I'm running out of time.", "next": "node2" },
      { "response": "Nevermind", "next": "end" }
    ]
  },
  node2: {
    "id": "node2",
    "text": "How much do you need?",
    "options": [
      { "response": "A couple hours.", "next": "node4" },
      { "response": "Nevermind.", "next": "end" }
    ]
  },
  node3: {
    "id": "node3",
    "text": `I'll run out of time at ${getCountdownEndTime(remainingSeconds)}`,
    "options": [
      { "response": "Back", "next": "node6" }
    ]
  },
  node4: {
    "id": "node4",
    "text": "Give me ten minutes now and I'll see what I can do.",
    "options": [
      { "response": "Here you go.", "next": "node5", "time": -10 * 60 },
      { "response": "I'm not paying you!.", "next": "end" }
    ]
  },
  node5: {
    "id": "node5",
    "text": "Thanks! Maybe try going to work.",
    "options": [
      { "response": "Thanks.", "next": "end" },
      { "response": "Give me back my time!", "next": "end" }
    ]
  },
  end: {
    "id": "end",
    "text": "Ok bye.",
    "options": [
      { "response": "(leave)", "next": "node6", "sprite": character2 }
    ]
  },
  node6: {
    "id": "node6",
    "text": "Where should I go?",
    "options": [
      { "response": "Shop.", "next": "store1", "sprite": merchant },
      { "response": "Work.", "next": "work1", "sprite": officer, "requiresItem": "Work ID", "removeItem": "Work ID" },
      { "response": "City.", "next": "CITY" },
      { "response": "Check watch.", "next": "node3", requiresItem: "Watch" }
    ]
  },
  work1: {
    "id": "work1",
    "text": "You're running late. Do you have a good excuse?",
    "options": [
      { "response": "Missed the bus this morning.", "next": "work2" },
      { "response": "Can I get an advance on my pay?", "next": "work3", "time": 2 * 60 }
    ]
  },
  work2: {
    "id": "work2",
    "text": "I don't believe you. You're fired!",
    "options": [
      { "response": "But I have a good excuse!", "next": "advice2" },
      { "response": "What should I do next?", "next": "advice2" }
    ]
  },
  work3: {
    "id": "work3",
    "text": "I'll give you some time, but we're letting you go.",
    "options": [
      { "response": "Can I have a little more?", "next": "advice2" },
      { "response": "What should I do next?", "next": "advice2" }
    ]
  },
  advice2: {
    "id": "advice2",
    "text": "More jobs at the edge of the city, take the train.",
    "options": [
      { "response": "Thanks!", "next": "end", "sprite": character2 }
    ]
  },
  store1: {
    "id": "store1",
    "text": "What are you looking for?",
    "options": [
      { "response": "I need to borrow some time.", "next": "storeLoan1", "forbiddenItem": "Loan Reminder" },
      { "response": "I have a package to deliver.", "next": "storePackage1", "requiresItem": "Package", "removeItem": "Package" },
      { "response": "What do you have for sale?", "next": "storeGoods1" },
      { "response": "Why is everyone paying with time?", "next": "storeLore1" },
      { "response": "Nevermind", "next": "node6", "sprite": character2 }
    ]
  },
  storePackage1: {
    "id": "storePackage1",
    "text": "Thank you. Heres 25 minutes for the delivery.",
    "options": [
      { "response": "Thanks!", "next": "node6", "time": 25 * 60, "sprite": character2 }
    ]
  },
  storeLore1: {
    "id": "storeLore1",
    "text": "No idea!",
    "options": [
      { "response": "So the poor literally die younger?", "next": "storeLore2" },
      { "response": "I'm running out of time.", "next": "storeLoan1", "forbiddenItem": "Loan Reminder" }
    ]
  },
  storeLore2: {
    "id": "storeLore2",
    "text": "Yeah not me though!",
    "options": [
      { "response": "I just need enough time to survive today.", "next": "storeLoan1", "forbiddenItem": "Loan Reminder" },
      { "response": "What can I buy instead?", "next": "storeGoods1" }
    ]
  },
  storeLoan1: {
    "id": "storeLoan1",
    "text": "I can give you 30 minutes now. Interest is 45 minutes.",
    "options": [
      { "response": "Deal.", "next": "storeLoanDeal", "time": 30 * 60, "addItem": "Loan Reminder" },
      { "response": "Any safer option?", "next": "storeLoan2" },
      { "response": "No thanks.", "next": "store1" }
    ]
  },
  storeLoan2: {
    "id": "storeLoan2",
    "text": "If you've got something valuable to trade, I can give you time for it.",
    "options": [
      { "response": "Take my watch. (20 minutes)", "next": "storeMemoryDeal", "time": 20 * 60, "removeItem": "Watch", "requiresItem": "Watch" },
      { "response": "I like the previous deal better.", "next": "storeLoan1", "forbiddenItem": "Loan Reminder" },
      { "response": "Let me see what's for sale.", "next": "storeGoods1" }
    ]
  },
  storeLoanDeal: {
    "id": "storeLoanDeal",
    "text": "Don't be late repaying me.",
    "options": [
      { "response": "I'll try.", "next": "node6", "sprite": character2 },
      { "response": "What else can I do here?", "next": "store1" }
    ]
  },
  storeMemoryDeal: {
    "id": "storeMemoryDeal",
    "text": "Done.",
    "options": [
      { "response": "I can live with that.", "next": "node6", "sprite": character2 },
      { "response": "Tell me what else you sell.", "next": "storeGoods1" }
    ]
  },
  storeGoods1: {
    "id": "storeGoods1",
    "text": "Here's what I have for sale.",
    "options": [
      { "response": "Train ticket. (10 minutes)", "next": "storeGoodsTransit", "time": -10 * 60, "addItem": "Ticket" },
      { "response": "Tea. (1 minute)", "next": "storeGoodsTea", "time": -1 * 60, "addItem": "Tea" },
      { "response": "Frozen food. (5 minutes)", "next": "storeGoodsFood", "time": -5 * 60, "addItem": "Frozen Food" },
      { "response": "Back.", "next": "store1" }
    ]
  },
  storeGoodsTransit: {
    "id": "storeGoodsTransit",
    "text": "You can take this two-way train ticket to leave the city and come back.",
    "options": [
      { "response": "Perfect.", "next": "storeGoods1" },
      { "response": "I'm heading out.", "next": "node6", "sprite": character2 }
    ]
  },
  storeGoodsTea: {
    "id": "storeGoodsTea",
    "text": "Green tea is pretty good",
    "options": [
      { "response": "Let me see what else you have.", "next": "storeGoods1" },
      { "response": "Thanks, I'm leaving.", "next": "node6", "sprite": character2 }
    ]
  },
  storeGoodsFood: {
    "id": "storeGoodsFood",
    "text": "This ones my favorite.",
    "options": [
      { "response": "Thanks!", "next": "node6", "sprite": character2 },
      { "response": "Maybe I should buy something else.", "next": "storeGoods1" }
    ]
  },
  CITY: {
    "id": "CITY",
    "text": "Where should I go now?",
    "options": [
      { "response": "Train station", "next": "train", "sprite": worker },
      { "response": "Town.", "next": "node6" }
    ]
  },
  train: {
    "id": "train",
    "text": "You need a ticket to board.",
    "options": [
      { "response": "Board", "next": "train2", "requiresItem": "Ticket", "sprite": train },
      { "response": "I haven't got one.", "next": "advice" }
    ]
  },
  advice: {
    "id": "advice",
    "text": "You can buy one at the store.",
    "options": [
      { "response": "Thanks!", "next": "CITY", "sprite": character2 }
    ]
  },
  train2: {
    "id": "train",
    "text": "This trip will take you out of the city, it'll last 30 minutes.",
    "options": [
      { "response": "Continue", "next": "train3", "removeItem": "Ticket", "time": -30 * 60 },
      { "response": "Nevermind.", "next": "CITY", "sprite": character2 }
    ]
  },
  train3: {
    "id": "train3",
    "text": "You've arrived at the edge of the city.",
    "options": [
      { "response": "Get off", "next": "town2", "sprite": cat },
    ]
  },
  town2: {
    "id": "town2",
    "text": "A cat approaches you.",
    "options": [
      { "response": "Pet the cat for 15 minutes.", "next": "worth", "time": -15 * 60, "addItem": "Cat" },
      { "response": "Ignore the cat.", "next": "town3", "sprite": character2 }
    ]
  },
  worth: {
    "id": "worth",
    "text": "The cat is now your friend. Was it worth the 15 minutes?",
    "options": [
      { "response": "Yes", "next": "town3", "sprite": character2 },
      { "response": "No", "next": "town3", "sprite": character2 }
    ]
  },
  town3: {
    "id": "town3",
    "text": "You are at the edge of the city. What to do now?",
    "options": [
      { "response": "Look for work camp.", "next": "edgeCamp1", "sprite": officer },
      { "response": "Search the scrapyard.", "next": "scrapyard1", "sprite": character2 },
      { "response": "Take the train back. (30 minutes)", "next": "CITY", "time": -30 * 60, "sprite": character2 }
    ]
  },
  edgeCamp1: {
    "id": "edgeCamp1",
    "text": "At this factory you give 20 minutes of work for 45 minutes paid.",
    "options": [
      { "response": "Take the shift.", "next": "edgeCamp2", "time": -20 * 60 },
      { "response": "Decline.", "next": "town3", "sprite": character2 }
    ]
  },
  edgeCamp2: {
    "id": "edgeCamp2",
    "text": "You are exhausted. The foreman offers your pay.",
    "options": [
      { "response": "Collect 45 minutes.", "next": "edgeCamp3", "time": 45 * 60 },
      { "response": "Leave quietly.", "next": "town3", "sprite": character2 }
    ]
  },
  edgeCamp3: {
    "id": "edgeCamp3",
    "text": "Another worker warns that guards raid this camp at dusk. You do not have a proper work permit.",
    "options": [
      { "response": "Buy forged papers for 30 minutes.", "next": "edgeCamp4", "time": -30 * 60, "addItem": "Forged Papers" },
      { "response": "Risk it without papers.", "next": "guardStop1" }
    ]
  },
  edgeCamp4: {
    "id": "edgeCamp4",
    "text": "The papers look cheaply made.",
    "options": [
      { "response": "Approach checkpoint.", "next": "guardStop1", "sprite": worker}
    ]
  },
  guardStop1: {
    "id": "guardStop1",
    "text": "Show me papers and identification.",
    "options": [
      { "response": "Show forged papers.", "next": "guardStop2", "requiresItem": "Forged Papers" },
      { "response": "Try to talk your way through.", "next": "guardStop3" }
    ]
  },
  guardStop2: {
    "id": "guardStop2",
    "text": "Looks fine to me. You can pass.",
    "options": [
      { "response": "Take one more job before leaving.", "next": "courier1", "removeItem": "Forged Papers", "sprite": worker },
      { "response": "Go back before anyone notices.", "next": "town3", "sprite": character2 }
    ]
  },
  guardStop3: {
    "id": "guardStop3",
    "text": "The officer doesn't buy your story and fines you 15 minutes.",
    "options": [
      { "response": "Pay the fine. (15 minutes)", "next": "town3", "time": -15 * 60, "sprite": character2 },
      { "response": "Run for it.", "next": "scrapyard1", "time": -5 * 60, "sprite": character2 }
    ]
  },
  scrapyard1: {
    "id": "scrapyard1",
    "text": "You end up in a scrapyard. It looks dangerous.",
    "options": [
      { "response": "Scavenge for valuables (10 minutes).", "next": "scrapyard2", "time": -10 * 60 },
      { "response": "Leave it alone.", "next": "town3", "sprite": character2 }
    ]
  },
  scrapyard2: {
    "id": "scrapyard2",
    "text": "You salvage a radio. A courier nearby offers to trade for papers to travel easier.",
    "options": [
      { "response": "Trade the radio for a courier pass.", "next": "courier1", "addItem": "Courier Pass" },
      { "response": "Keep the radio and head back.", "next": "town3", "addItem": "Radio", "sprite": character2 }
    ]
  },
  courier1: {
    "id": "courier1",
    "text": "Deliver a package for 25 minutes earned.",
    "options": [
      { "response": "Accept the courier job.", "next": "courier2", "time": 25 * 60, "addItem": "Package" },
      { "response": "Decline and rest.", "next": "town3", "sprite": character2 }
    ]
  },
  courier2: {
    "id": "courier2",
    "text": "Return to your town and deliver the package to the store.",
    "options": [
      { "response": "Return to the outskirts.", "next": "town3", "sprite": character2 },
      { "response": "Take the train back into the city. (30 minutes)", "next": "CITY", "time": 30 * 60, "sprite": character2 }
    ]
  },
}

//code to run the dialogue
function startTalk() {
  document.getElementById("character").innerHTML = character1;
  nextOption("start");
}

function textAppear(str) {
  const dialogue = document.getElementById("dialogue-box");

  if (dialogueIntervalId) {
    clearInterval(dialogueIntervalId);
  }

  let i = 1;
  dialogue.innerHTML = "";

  dialogueIntervalId = setInterval(() => {
    dialogue.innerHTML = str.substring(0, i);
    i++;
    if (i > str.length) {
      clearInterval(dialogueIntervalId);
      dialogueIntervalId = null;
    }
  }, 30);
}

function renderOptions(boxId) {
  dialogueTree[boxId].options.forEach(option => {
    if ((!option.requiresItem || hasItem(option.requiresItem))&&!(option.forbiddenItem && hasItem(option.forbiddenItem))) {
      newBox = document.createElement('button');
      newBox.innerHTML = option.response;
      newBox.className = "option-btn";
      newBox.onclick = () => {
        //if theres a "cost" property on the option subtracts that
        if (option.time) {
          remainingSeconds += option.time;
          document.getElementById("clock").innerHTML = formatCountdown(remainingSeconds);
        }
        if (option.sprite) {
          document.getElementById("character").innerHTML = option.sprite;
        }
        if (option.removeItem) {
          removeInventory(option.removeItem);
          createInventoryUI();
        }
        if (option.addItem) {
          addInventory(option.addItem);
          createInventoryUI();
        }
        nextOption(option.next);

        if(remainingSeconds <= 0) {
          outOfTime();
        }
      };
      document.body.appendChild(newBox);
    }
  });

  // newBox = document.createElement('button');
  // newBox.innerHTML = dialogueTree[boxId].options[0].response;
  // document.body.appendChild(newBox);
}

window.onload = () => {
  document.getElementById("clock").innerHTML = formatCountdown(remainingSeconds);

  clock = setInterval(() => {
    x++;
    console.log(x);

    if (remainingSeconds > 0) {
      remainingSeconds--;
    }
    document.getElementById("clock").innerHTML = formatCountdown(remainingSeconds);

    if (x == 3) {
      textAppear("I've only got an hour left... I need to borrow some time.");
    }
    if (x == 6) {
      console.log("triggered at x = " + x);
      document.getElementById("character").innerHTML = door;
      enterButton = document.createElement("button");
      enterButton.innerHTML = "Enter";
      enterButton.className = "option-btn";
      enterButton.onclick = startTalk;
      document.body.appendChild(enterButton);
      createInventoryUI();
    }
  }, 1000)

}

function nextOption(boxId) {
  Array.from(document.getElementsByClassName("option-btn")).forEach(btn => btn.remove());
  textAppear(dialogueTree[boxId].text);
  renderOptions(boxId);
}

function addInventory(item) {
  inventory.push(item);
}

function hasItem(item) {
  return inventory.includes(item);
}

function removeInventory(item) {
  inventory = inventory.filter(i => i !== item);
}

function createInventoryUI() {
  const inventoryDiv = document.getElementById("inventory");
  inventoryDiv.innerHTML = "Inventory: " + inventory.join(", ");
}

function outOfTime() {
  clearInterval(clock);
  document.getElementById("inventory").innerHTML = "You ran out of time. Game over.";
   document.getElementById("clock").innerHTML = "0:00:00";
  Array.from(document.getElementsByClassName("option-btn")).forEach(btn => btn.remove());
}
