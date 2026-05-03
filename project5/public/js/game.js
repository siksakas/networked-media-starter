const TILE = 24; // determine the size of each tile in pixels
const COLS = 40; // columns of tiles
const ROWS = 40; //rows of tiles
let day = 0; // number of days
const SPRITES = {
  g1: 'sprites/nature/grass1.png',
  g2: 'sprites/nature/grass2.png',
  w: 'sprites/nature/water1.png',
  t1: 'sprites/nature/tree1.png',
  t2: 'sprites/nature/tree2.png',
  t3: 'sprites/nature/tree3.png',
  t4: 'sprites/nature/tree4.png',
  m: 'sprites/nature/mountains.png',
  b1: 'sprites/nature/bush1.png',
  b2: 'sprites/nature/bush2.png',
  h1: 'sprites/buildings/lv1hut.png',
  h2: 'sprites/buildings/lv2hut.png',
  h3: 'sprites/buildings/lv3hut.png',
  h4: 'sprites/buildings/lv4hut.png',
  tp1: 'sprites/buildings/lv1temple.png',
  tp2: 'sprites/buildings/lv2temple.png',
  cf: 'sprites/buildings/campfire.png',
  f1: 'sprites/buildings/farm1.png',
  f2: 'sprites/buildings/farm2.png',
  wm: 'sprites/buildings/windmill.png',
  n1: 'sprites/npc/npc1.png',
  n2: 'sprites/npc/npc2.png',
  n3: 'sprites/npc/npc3.png',
  n4: 'sprites/npc/npc4.png',
  n5: 'sprites/npc/npc5.png',
  n6: 'sprites/npc/npc6.png',
  dv1: 'sprites/npc/devout1.png',
  dv2: 'sprites/npc/devout2.png',
  pr: 'sprites/npc/prophet.png',
  zl: 'sprites/npc/zealot1.png',
  nd: 'sprites/npc/npc_dead.png',
  dm: 'sprites/enemies/demon1.png',
  food1: 'sprites/food/food1.png',
  food2: 'sprites/food/food2.png',
  food3: 'sprites/food/food3.png',
};

const imgs = {};
let loadedCount = 0;
const totalSprites = Object.keys(SPRITES).length;

function loadSprites(cb) {
  for (const key in SPRITES) {
    const src = SPRITES[key];

    const img = new Image();

    img.onload = function () {
      loadedCount++;

      if (loadedCount === totalSprites) {
        cb();
      }
    };

    img.onerror = function () {
      loadedCount++;

      if (loadedCount === totalSprites) {
        cb();
      }
    };

    img.src = src;

    imgs[key] = img;
  }
}

function createMap() {
  const map = [];

  // makes all tiles bg loops thru rows and cols
  for (let r = 0; r < ROWS; r++) {
    map[r] = [];

    for (let c = 0; c < COLS; c++) {
      map[r][c] = 'bg';
    }
  }

  // checks if the position is valid (within the map)
  function place(row, col, key) {
    if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
      map[row][col] = key;
    }
  }

  // takes a center point and randomly clusters like tiles around it
  function makeCluster(centerRow, centerCol, size, tileTypes) {
    for (let i = 0; i < size; i++) {
      const rowOffset = Math.floor(Math.random() * 7) - 3;
      const colOffset = Math.floor(Math.random() * 7) - 3;
      const randomTile = tileTypes[Math.floor(Math.random() * tileTypes.length)];

      place(centerRow + rowOffset, centerCol + colOffset, randomTile);
    }
  }

  // grass
  for (let i = 0; i < 120; i++) {
    place(
      Math.floor(Math.random() * ROWS),
      Math.floor(Math.random() * COLS),
      Math.random() < 0.5 ? 'g1' : 'g2'
    );
  }

  // trees
  for (let i = 0; i < 10; i++) {
    makeCluster(
      Math.floor(Math.random() * ROWS),
      Math.floor(Math.random() * COLS),
      4 + Math.floor(Math.random() * 5),
      ['t1', 't2', 't3', 't4'],
      0.75
    );
  }

  return map;
}

const MAP = createMap();
let campfireSpawned = false; // its false bc the first click of the player will spawn it 
let people = []; //arr for NPCs
let leaderAssignedAt = null; //sets when the current leader is assigned
let activeWishPersonIndex = null; // this tracks which persons wish /prayer is showed in popup
let campfirePosition = null; // pos of campfire
let faith = 100;
const MAX_FAITH = 100; //limit
const WISH_FAITH_COST = 15; 

const PEOPLE_NAMES = [
  'Siksaka', 'Nicholas', 'Jacob', 'Alex', 'Joseph', 'Jonah',
  'Gia', 'Hale', 'Adam', 'Jason', 'Katie', 'Eve', 'Abraham', 'Isaac'
];
const PEOPLE_SPRITES = ['n1', 'n2', 'n3', 'n4', 'n5', 'n6'];
const PRIORITY_TRAITS = ['worship', 'community', 'self'];

// the game uses this alot so i made it a function to be shorter
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// adds stuff to the history log on the right
function addLogEntry(text, type = "") {
  const log = document.getElementById("event-log");

  const entry = document.createElement("div");
  entry.classList.add("log-entry");

  if (type) {
    entry.classList.add(type); //can be divine, bad or leader whichc changes colour
  }

  entry.textContent = text;

  log.appendChild(entry);
}

function getWalkableSpawnTile() {
  for (let i = 0; i < 8; i++) {
    let row = campfirePosition.row;
    let col = campfirePosition.col;

    const randomNumber = Math.floor(Math.random() * 8);

    if (randomNumber === 0) {
      row = campfirePosition.row - 1; // up
      col = campfirePosition.col;
    } else if (randomNumber === 1) {
      row = campfirePosition.row + 1; // down
      col = campfirePosition.col;
    } else if (randomNumber === 2) {
      row = campfirePosition.row;
      col = campfirePosition.col - 1; // left
    } else if (randomNumber === 3) {
      row = campfirePosition.row;
      col = campfirePosition.col + 1; // right
    } else if (randomNumber === 4) {
      row = campfirePosition.row - 1; // up-left
      col = campfirePosition.col - 1;
    } else if (randomNumber === 5) {
      row = campfirePosition.row - 1; // up-right
      col = campfirePosition.col + 1;
    } else if (randomNumber === 6) {
      row = campfirePosition.row + 1; // down-left
      col = campfirePosition.col - 1;
    } else if (randomNumber === 7) {
      row = campfirePosition.row + 1; // down-right
      col = campfirePosition.col + 1;
    }
    // check if in map
    if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
      if (MAP[row][col] === 'bg') {
        return { row: row, col: col };
      }
    }
  }
  return {
    row: campfirePosition.row,
    col: campfirePosition.col
  };
}


function createPerson() {
  // we r checking which names r alr used
  const usedNames = [];
  for (let i = 0; i < people.length; i++) {
    usedNames.push(people[i].name);
  }
  const availableNames = [];
  for (let i = 0; i < PEOPLE_NAMES.length; i++) {
    const name = PEOPLE_NAMES[i];
    let nameIsUsed = false;
    for (let j = 0; j < usedNames.length; j++) {
      if (usedNames[j] === name) {
        nameIsUsed = true;
      }
    }
    if (nameIsUsed === false) {
      availableNames.push(name);
    }
  }

  let chosenName;

  if (availableNames.length > 0) {
    chosenName = pickRandom(availableNames);
  } else {
    chosenName = "Follower " + (people.length + 1);
  }

  const person = {
    sprite: pickRandom(PEOPLE_SPRITES),
    name: chosenName,
    devoutness: 0,
    icon: '',
    wishes: [],
    isLeader: false,
    row: 0,
    col: 0,
    wishGrantedToday: false,
    priority: pickRandom(PRIORITY_TRAITS),
    templeOrdered: false,
    nextLeaderOrderAt: null
  };

  const spawnTile = getWalkableSpawnTile();

  if (spawnTile !== null) {
    person.row = spawnTile.row;
    person.col = spawnTile.col;
  }

  return person;
}

function createStartingPeople() {
  addLogEntry("A campfire has been created! Three people have come!", "divine");

  // this array will hv available names
  const availableNames = [];
  // add names to arr
  for (let i = 0; i < PEOPLE_NAMES.length; i++) {
    availableNames.push(PEOPLE_NAMES[i]);
  }
  const createdPeople = [];

  for (let i = 0; i < 3; i++) {
    const nameIndex = Math.floor(Math.random() * availableNames.length);
    const name = availableNames[nameIndex];
    //now removes used name n creates person obj
    availableNames.splice(nameIndex, 1);
    const person = {
      sprite: pickRandom(PEOPLE_SPRITES),
      name: name,
      devoutness: 0,
      icon: '',
      wishes: [],
      isLeader: false,
      row: 0,
      col: 0,
      wishGrantedToday: false,
      priority: pickRandom(PRIORITY_TRAITS),
      templeOrdered: false,
      nextLeaderOrderAt: null
    };
    createdPeople.push(person);
  }

  //spawn
  for (let i = 0; i < createdPeople.length; i++) {
    const person = createdPeople[i];
    const spawnTile = getWalkableSpawnTile();

    if (spawnTile !== null) {
      person.row = spawnTile.row;
      person.col = spawnTile.col;
    }
  }
  const leaderIndex = Math.floor(Math.random() * createdPeople.length);
  createdPeople[leaderIndex].isLeader = true;
  leaderAssignedAt = Date.now();
  addLogEntry(createdPeople[leaderIndex].name + " has been chosen as leader.", "leader");

  return createdPeople;
}

function renderPeopleList() {
  const peopleListEl = document.getElementById('action-list');
  if (!peopleListEl) return;

  peopleListEl.innerHTML = '';
  if (people.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'people-empty';
    empty.textContent = 'Build a campfire to gather your first followers!';
    peopleListEl.appendChild(empty);
    return;
  }

  // how long current leader has been leader for
  const leaderDurationSeconds = leaderAssignedAt ? Math.floor((Date.now() - leaderAssignedAt) / 1000) : 0;

  // forEach loop that creates a row for each person
  people.forEach((person, personIndex) => {
    const row = document.createElement('div');
    row.className = 'person-row';
    row.dataset.personIndex = personIndex;

    const icon = document.createElement('span');
    icon.className = 'person-icon';
    icon.textContent = person.icon === '!' ? '!' : '';

    const sprite = document.createElement('img');
    sprite.className = 'person-sprite';
    sprite.src = SPRITES[person.sprite];
    sprite.alt = `${person.name} sprite`;

    const details = document.createElement('div');
    details.className = 'person-details';
    const leaderBadge = person.isLeader ? `<span class="person-leader">Leader (${leaderDurationSeconds}s)</span>` : '';
    details.innerHTML = `<span class="person-name">${person.name}</span>${leaderBadge}<span class="person-devout">Devoutness: ${person.devoutness}</span>`;

    row.append(icon, sprite, details);
    peopleListEl.appendChild(row);
  });
}

function showWishPopup(person) {
  const popup = document.getElementById('wish-popup');
  const sprite = document.getElementById('wish-popup-sprite');
  const text = document.getElementById('wish-popup-text');

  sprite.src = SPRITES[person.sprite];
  sprite.alt = person.name + " sprite";

  let wishText = "";

  if (person.wishes && person.wishes.length > 0) {
    wishText = person.wishes[0];
  } else {
    wishText = person.name + " is thinking of a wish...";
  }

  text.textContent = wishText;

  popup.classList.remove('hidden');
}

function hideWishPopup() {
  //hides the pop up
  const popup = document.getElementById('wish-popup');
  if (!popup) return;//returns if there is no popup for some reason
  popup.classList.add('hidden');
}

function showTraitPopup(person) {
  //shows the trait pop up
  const popup = document.getElementById('trait-popup');
  const sprite = document.getElementById('trait-popup-sprite');
  const text = document.getElementById('trait-popup-text');
  if (!popup || !sprite || !text) return;

  sprite.src = SPRITES[person.sprite];
  sprite.alt = `${person.name} sprite`;
  text.textContent = `${person.name}'s priority trait is: ${person.priority}`;
  popup.classList.remove('hidden');
  
}

function hideTraitPopup() {
  //hides it
  const popup = document.getElementById('trait-popup');
  if (!popup) return;
  popup.classList.add('hidden');
}

function getRandomLivingPerson(excludeName = null) {
  // gets a list of ppl except for 'nd' which indicates dead npcs
  const living = people.filter((p) => p.sprite !== 'nd' && p.name !== excludeName);
  if (living.length === 0) return null;
  return pickRandom(living);
}


function getFaithRegenRate() {
  //returns function if there is no ppl
  if (people.length === 0) return 0.1;
  // takes all the ppl in the game and gets the avg devoutness
  const totalDevoutness = people.reduce((sum, person) => sum + Math.max(0, person.devoutness), 0);
  const avgDevoutness = totalDevoutness / people.length;
  return 0.1 + Math.min(0.9, avgDevoutness / 100);
}

function updateFaithUI() {
  //updates the faith number and bar in the UI
  const faithValEl = document.getElementById('faith-val');
  const faithBarEl = document.getElementById('faith-bar');

  const roundedFaith = Math.round(faith);
  faithValEl.textContent = String(roundedFaith);
  faithBarEl.style.width = `${(roundedFaith / MAX_FAITH) * 100}%`;
}

function regenerateFaith() {
  // depends on avg devoutness of ppl
  faith = Math.min(MAX_FAITH, faith + getFaithRegenRate());
  updateFaithUI();
}

function generateWishForPerson(person) {
  const rival = getRandomLivingPerson(person.name);
  //randomly picks from this list of wishes and if another person is involved it uses the "rival"
  return pickRandom([
    {
      id: 'more_food',
      text: 'please give us more food!'
    },
    {
      id: 'new_leader',
      text: `Let me be the leader! I will lead better than ${rival ? rival.name : 'the current leader'}`
    },
    {
      id: 'smite_neighbor',
      targetName: rival ? rival.name : null,
      text: `please smite my neighbor ${rival ? rival.name : 'nobody'}. I am mad at him!`
    },
    {
      id: 'grow_village',
      text: 'Please bring more people to our village!'
    },
    {
      id: 'fear_of_spiders',
      text: 'Please help me overcome my fear of spiders.'
    }
  ]);
}

function spawnFoodAroundMap(count) {
  const foodKeys = ['food1', 'food2', 'food3'];

  let placed = 0;
  let safety = 0;

  while (placed < count && safety < 3000) {
    safety = safety + 1;

    const row = Math.floor(Math.random() * ROWS);
    const col = Math.floor(Math.random() * COLS);
    if (MAP[row][col] === 'bg') {
      const randomFoodIndex = Math.floor(Math.random() * foodKeys.length);
      const foodTile = foodKeys[randomFoodIndex];

      MAP[row][col] = foodTile;
      placed = placed + 1;
    }
  }

  return placed;
}

function applyWish(personIndex, accepted) {
  const person = people[personIndex];
  if (!person || !person.pendingWish) return;

  const wish = person.pendingWish;
  if (!accepted) {
    addLogEntry(`${person.name}'s wish was rejected.`);
    person.icon = '';
    person.pendingWish = null;
    renderPeopleList();
    hideWishPopup();
    return;
  }

  //checks if player has enough faith to grant wish
  if (faith < WISH_FAITH_COST) {
    addLogEntry(`Not enough faith to grant ${person.name}'s wish.`);
    return;
  }
  //subtracts amt and updates ui and other variables
  faith = Math.max(0, faith - WISH_FAITH_COST);
  updateFaithUI();
  person.wishGrantedToday = true;
  person.devoutness += 10;

  // now depending on the wish id different code runs
  if (wish.id === 'more_food') {
    const spawned = spawnFoodAroundMap(5);
    addLogEntry(`${person.name}'s wish was granted. ${spawned} pieces of food appeared!`, 'divine');
  } else if (wish.id === 'new_leader') {
    people.forEach((p) => { p.isLeader = false; });
    person.isLeader = true;
    person.devoutness += 5;
    leaderAssignedAt = Date.now();
    addLogEntry(`${person.name} has been crowned the new leader!`, 'leader');
  } else if (wish.id === 'smite_neighbor') {
    const target = people.find((p) => p.name === wish.targetName);
    person.devoutness += 5;
    if (target) {
      target.sprite = 'nd';
      target.isLeader = false;
      addLogEntry(`${target.name} has been smitten.`, 'bad');
      if (people.every((p) => !p.isLeader && p.sprite === 'nd')) {
        person.isLeader = true;
      }
    } else {
      addLogEntry(`${person.name}'s smite request fizzled: no target found.`);
    }
  } else if (wish.id === 'grow_village') {
    people.push(createPerson());
    addLogEntry(`A new person has joined the village after ${person.name}'s prayer!`, 'divine');
  } else if (wish.id === 'fear_of_spiders') {
    addLogEntry(`${person.name} feels calmer and braver after divine help.`, 'divine');
  }

  person.icon = '';
  person.pendingWish = null;
  renderPeopleList();
  hideWishPopup();
}


function updatePeopleWishes() {
  //for each person who doesnt hv a wish it generates one for them and logs to history if there is a new wish
  let wishesAdded = false;

  for (const person of people) {
    if (person.icon === '!') continue;
    person.pendingWish = generateWishForPerson(person);
    person.wishes = [person.pendingWish.text];
    person.icon = '!';
    wishesAdded = true;
  }

  if (wishesAdded) {
    addLogEntry('There are new wishes to look at!', 'divine');
    renderPeopleList();
  }
}

function isWalkableTile(row, col) {
  //is in map?
  if (row < 0) {
    return false;
  }
  if (row >= ROWS) {
    return false;
  }
  if (col < 0) {
    return false;
  }
  if (col >= COLS) {
    return false;
  }
  //tile type
  const tile = MAP[row][col];
  if (tile === 'bg') {
    return true;
  }
  if (tile.startsWith('food')) {
    return true;
  }
  return false;
}

function isTileOccupied(row, col, ignoreIndex) {
  // If ignoreIndex was not given, use -1
  if (ignoreIndex === undefined) {
    ignoreIndex = -1;
  }

  for (let i = 0; i < people.length; i++) {
    const person = people[i];
    if (i === ignoreIndex) {
      continue;
    }
    if (person.sprite === 'nd') {
      continue;
    }
    if (person.row === row && person.col === col) {
      return true;
    }
  }
  return false;
}


function chopRandomTrees(count = 5) {
  const treeTiles = [];

  // First, find every tree tile on the map
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const tileType = MAP[row][col];

      if (
        tileType === 't1' ||
        tileType === 't2' ||
        tileType === 't3' ||
        tileType === 't4'
      ) {
        const treePosition = {
          row: row,
          col: col
        };

        treeTiles.push(treePosition);
      }
    }
  }

  if (treeTiles.length === 0) {
    return 0;
  }
  let chopped = 0;
  while (treeTiles.length > 0 && chopped < count) {
    const randomIndex = Math.floor(Math.random() * treeTiles.length);

    const tile = treeTiles[randomIndex];

    MAP[tile.row][tile.col] = 'bg';

    // Remove this tree from the list so we do not pick it again
    treeTiles.splice(randomIndex, 1);

    chopped++;
  }

  return chopped;
}

function findTempleBuildTile() {
  //checks in increasing distance from campfire
  for (let radius = 1; radius <= 5; radius++) {
    for (let dr = -radius; dr <= radius; dr++) {
      for (let dc = -radius; dc <= radius; dc++) {

        const row = campfirePosition.row + dr;
        const col = campfirePosition.col + dc;

        const insideMap =
          row >= 0 &&
          row < ROWS &&
          col >= 0 &&
          col < COLS;

        if (insideMap) {
          const onOuterEdge =
            Math.abs(dr) === radius ||
            Math.abs(dc) === radius;

          if (onOuterEdge) {
            const tileIsEmpty = MAP[row][col] === "bg";

            if (tileIsEmpty) {
              return {
                row: row,
                col: col
              };
            }
          }
        }
      }
    }
  }
  //if no suitable tile
  addLogEntry('Could not build temple...', 'bad');
  return null;
}

function getNextLeaderOrderDelayMs() {
  return (10 + Math.floor(Math.random() * 21)) * 1000;
}

function tryLeaderFirstConstruction() {
  if (!leaderAssignedAt) return false;

  const leader = people.find((person) => person.isLeader && person.sprite !== 'nd');
  if (!leader) return false;

  const now = Date.now();
  if (!leader.nextLeaderOrderAt) {
    leader.nextLeaderOrderAt = now + getNextLeaderOrderDelayMs();
    return false;
  }

  if (now < leader.nextLeaderOrderAt) return false;

  const orderType = pickRandom(['chop', 'hut', 'farm', 'windmill']);
  let ordered = false;

  if (orderType === 'chop') {
    const choppedTrees = chopRandomTrees(5);
    if (choppedTrees > 0) {
      addLogEntry(`${leader.name} has ordered the chopping of ${choppedTrees} trees!`, 'leader');
      ordered = true;
    }
  } else {
    const buildTile = findTempleBuildTile();
    if (buildTile) {
      if (orderType === 'hut') {
        MAP[buildTile.row][buildTile.col] = 'h1';
        addLogEntry(`${leader.name} has ordered the construction of a hut!`, 'leader');
      } else if (orderType === 'farm') {
        MAP[buildTile.row][buildTile.col] = 'f1';
        addLogEntry(`${leader.name} has ordered the construction of a farm!`, 'leader');
      } else {
        MAP[buildTile.row][buildTile.col] = 'wm';
        addLogEntry(`${leader.name} has ordered the construction of a windmill!`, 'leader');
      }
      ordered = true;
    }
  }

  if (ordered) {
    leader.nextLeaderOrderAt = now + getNextLeaderOrderDelayMs();
  }

  return ordered;
}

function movePeopleRandomly() {
  // there is prob better way of coding this
  for (let i = 0; i < people.length; i++) {
    const person = people[i];

    if (person.sprite === 'nd') {
      continue;
    }

    const randomNumber = Math.floor(Math.random() * 4);

    let rowChange = 0;
    let colChange = 0;

    if (randomNumber === 0) {
      rowChange = -1; // up
      colChange = 0;
    } else if (randomNumber === 1) {
      rowChange = 1; // down
      colChange = 0;
    } else if (randomNumber === 2) {
      rowChange = 0;
      colChange = -1; // left
    } else if (randomNumber === 3) {
      rowChange = 0;
      colChange = 1; // right
    }

    const nextRow = person.row + rowChange;
    const nextCol = person.col + colChange;

    //only moves if tile is walkable and not occupied
    if (isWalkableTile(nextRow, nextCol)) {
      if (!isTileOccupied(nextRow, nextCol, i)) {
        person.row = nextRow;
        person.col = nextCol;
      }
    }
  }
}

function drawPeople(ctx) {
  for (const person of people) {
    const img = imgs[person.sprite];
    if (!img || !img.complete || img.naturalWidth === 0) continue;
    ctx.drawImage(img, person.col * TILE, person.row * TILE, TILE, TILE);
  }
}

function drawMap(ctx) {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const key = MAP[row][col];

      if (key === 'bg') {
        ctx.fillStyle = '#050505';
        ctx.fillRect(col * TILE, row * TILE, TILE, TILE);
        continue;
      }

      const img = imgs[key];
      if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, col * TILE, row * TILE, TILE, TILE);
      } else {
        ctx.fillStyle = '#050505';
        ctx.fillRect(col * TILE, row * TILE, TILE, TILE);
      }
    }
  }
}

function wishGrantedToday() {
  for (const person of people) {
    if (!(person.wishGrantedToday)) {
      person.devoutness = Math.max(0, person.devoutness - 5);
    }
    person.wishGrantedToday = false;
  }
}

function buildGameState() {
  return {
    day,
    campfireSpawned,
    campfirePosition,
    faith,
    leaderAssignedAt,
    people,
    map: MAP
  };
}

function applyGameState(savedState) {
  // does some basic checks to make sure the saved state is valid before applying it
  if (!savedState || typeof savedState !== 'object') return false;
  if (!Array.isArray(savedState.map) || !Array.isArray(savedState.people)) return false;
  day = Number.isFinite(savedState.day) ? savedState.day : day;
  campfireSpawned = Boolean(savedState.campfireSpawned);
  campfirePosition = savedState.campfirePosition || null;
  faith = Number.isFinite(savedState.faith) ? savedState.faith : faith;
  leaderAssignedAt = savedState.leaderAssignedAt || null;
  people = savedState.people;

  // makes the map filled w valid values first
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      MAP[row][col] = savedState.map[row] && savedState.map[row][col] ? savedState.map[row][col] : 'bg';
    }
  }

  return true;
}

window.onload = function () {
  const canvas = document.getElementById('map-canvas');
  const dpr = window.devicePixelRatio || 1;
  const width = COLS * TILE;
  const height = ROWS * TILE;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  const ctx = canvas.getContext('2d');
  const peopleListEl = document.getElementById('action-list');
  const popupCloseBtn = document.getElementById('wish-popup-close');
  const traitPopupCloseBtn = document.getElementById('trait-popup-close');
  const popupAcceptBtn = document.getElementById('wish-accept');
  const popupRejectBtn = document.getElementById('wish-reject');
  const loadGameBtn = document.getElementById('load-game-btn');
  const saveGameBtn = document.getElementById('save-game-btn');
  const saveGameStatus = document.getElementById('save-game-status');
  ctx.imageSmoothingEnabled = false;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  ctx.fillStyle = '#050505';
  ctx.fillRect(0, 0, width, height);

  canvas.addEventListener('click', (event) => {
    hideWishPopup();
    hideTraitPopup();
    if (campfireSpawned) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const col = Math.floor(x / TILE);
    const row = Math.floor(y / TILE);

    if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return;

    MAP[row][col] = 'cf';
    campfirePosition = { row, col };
    campfireSpawned = true;
    people = createStartingPeople();
    renderPeopleList();
    drawMap(ctx);
    drawPeople(ctx);
  });

  if (peopleListEl) {
    peopleListEl.addEventListener('click', (event) => {
      const row = event.target.closest('.person-row');
      if (!row) return;
      const idx = Number(row.dataset.personIndex);
      const person = people[idx];
      if (!person) return;

      if (event.target.closest('.person-sprite')) {
        hideWishPopup();
        showTraitPopup(person);
        return;
      }

      hideTraitPopup();
      if (person.icon !== '!') return;
      activeWishPersonIndex = idx;
      showWishPopup(person);
    });
  }

  if (popupCloseBtn) {
    popupCloseBtn.addEventListener('click', hideWishPopup);
  }
  if (traitPopupCloseBtn) {
    traitPopupCloseBtn.addEventListener('click', hideTraitPopup);
  }
  if (popupAcceptBtn) {
    popupAcceptBtn.addEventListener('click', () => {
      if (activeWishPersonIndex == null) return;
      applyWish(activeWishPersonIndex, true);
      activeWishPersonIndex = null;
      drawMap(ctx);
      drawPeople(ctx);
    });
  }
  if (popupRejectBtn) {
    popupRejectBtn.addEventListener('click', () => {
      if (activeWishPersonIndex == null) return;
      applyWish(activeWishPersonIndex, false);
      activeWishPersonIndex = null;
    });
  }

  if (saveGameBtn) {
    saveGameBtn.addEventListener('click', async () => {
      saveGameBtn.disabled = true;
      if (saveGameStatus) saveGameStatus.textContent = 'Saving...';

      try {
        const response = await fetch('/save-game', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ gameState: JSON.stringify(buildGameState()) })
        });
        const data = await response.json();

        if (!response.ok || !data.ok) {
          throw new Error(data.error || 'Unable to save game.');
        }

        if (saveGameStatus) saveGameStatus.textContent = 'Saved!';
      } catch (err) {
        if (saveGameStatus) saveGameStatus.textContent = `Save failed: ${err.message}`;
      } finally {
        saveGameBtn.disabled = false;
      }
    });
  }

  async function loadGame() {
    if (saveGameStatus) saveGameStatus.textContent = 'Loading...';
    if (loadGameBtn) loadGameBtn.disabled = true;
    try {
      const response = await fetch('/load-game');
      const data = await response.json();
      if (data.ok && data.gameState) {
        applyGameState(data.gameState);
      }
      renderPeopleList();
      updateFaithUI();
      drawMap(ctx);
      drawPeople(ctx);
      if (saveGameStatus) saveGameStatus.textContent = 'Loaded!';
    } catch (err) {
      if (saveGameStatus) saveGameStatus.textContent = `Load skipped: ${err.message}`;
    } finally {
      if (loadGameBtn) loadGameBtn.disabled = false;
    }
  }

  if (loadGameBtn) {
    loadGameBtn.addEventListener('click', loadGame);
    loadGame();
  }

  renderPeopleList();
  updateFaithUI();
  loadSprites(() => {
    drawMap(ctx);
    drawPeople(ctx);
  });
  setInterval(updatePeopleWishes, 20000);
  setInterval(regenerateFaith, 1000);
  setInterval(() => {
    addLogEntry('A new day has come!');
    day++;
    wishGrantedToday();
  }, 100000)
  setInterval(() => {
    if (!campfireSpawned) return;
    movePeopleRandomly();
    tryLeaderFirstConstruction();
    drawMap(ctx);
    drawPeople(ctx);
    renderPeopleList();
  }, 700);
};
