p5.disableFriendlyErrors = true;
var cnv, backgroundImg;
let x = 325;
let y = 300;
let diameter = 80;
let dragging = false;

function preload() {
  img1 = loadImage("assets/congrat.jpg");
}

function setup() {
  cnv = createCanvas(650, 600);
  colorMode(HSB, 360, 100, 100, 100);
  strokeJoin(ROUND);
  setState(STATE.MENU);
  
}

function draw() {
  background(backgroundImg);

  switch (state) {
    case STATE.MENU:
      drawMenu();
      break;
    case STATE.COLOR:
      drawColor();
      break;
    case STATE.DIRECTION:
      drawDirection();
      break;
    case STATE.TYPING:
      drawTyping();
      break;
    default:
      background(0, 100, 100);
      throw new Error(`unhandled state "${state}"`);
  }
}

// #region state management
var state;

const STATE = {
  MENU: "Menu",
  DIRECTION: "Direction",
  COLOR: "Color",
  TYPING: "Typing",
};

function setState(newState) {
  background(0);

  if (state === STATE.MENU) menuChildren().map((el) => el.remove());

  cnv.mousePressed(false);

  switch (newState) {
    case STATE.MENU:
      initMenu();
      break;
    case STATE.COLOR:
      initColor();
      break;
    case STATE.DIRECTION:
      backgroundImg = loadImage("assets/dir_bg.jpg");

      const DIRS = {
        NORTH: "North",
        SOUTH: "South",
        EAST: "East",
        WEST: "West",
        UP: "Up",
        DOWN: "Down",
        LEFT: "Left",
        RIGHT: "Right",
      };

      opts.direction = Object.values(DIRS)[Math.floor(Math.random() * 8)];

      break;
    case STATE.TYPING:
      initTyping();
      break;
  }

  state = newState;
}
// #endregion

// #region menu
var opts, settingsImg;

function initMenu() {
  opts = {
    settings: false,
  };
  state = STATE.MENU;
  backgroundImg = loadImage("assets/menu_bg.jpg");
  settingsImg = loadImage("assets/settings.png");

  const labels = ["Mode", "Difficulty", "# Rounds"];
  const modes = Object.values(STATE).filter((v) => v !== STATE.MENU);
  opts.dropdowns = [
    createDropdown(labels[0], [110, 300], modes),
    createDropdown(labels[1], [250, 300], ["Easy", "Medium", "Hard"]),
    createDropdown(labels[2], [400, 300], ["2", "4", "6"]),
  ];

  const start = createButton("Start");
  start.position(255, 370);
  start.size(100, 50);
  start.style("background", color(25, 23, 100));
  start.mousePressed(function () {
    const [mode, diff, rounds] = labels.map((k) => opts[k]);
    if (mode && diff && rounds) setState(mode);
  });

  // settings button
  const settings = createImg("assets/settings.png");
  settings.position(610, 0);
  settings.size(40, 40);
  settings.mousePressed(function () {
    // when the gear is clicked
    opts.settings = true; // open the settings menu
    menuChildren().map((el) => el.hide()); // hide the dropdowns & btns
    cnv.mousePressed(function () {
      // register a click handler
      const [outX, outY] = [
        mouseX < 50 || mouseX > 600,
        mouseY < 50 || mouseY > 550,
      ];
      if (outX || outY) {
        // when the click is outside the settings menu
        opts.settings = false; // close the settings menu
        menuChildren().map((el) => el.show()); // show the underlying elements
        cnv.mousePressed(false); // unregister the click handler
      }
    });
  });

  opts.btns = [start, settings];
}

function drawMenu() {
  if (opts.settings) {
    drawSettings();
    return;
  }

  fill("pink");
  stroke("black");
  strokeWeight(8);

  textSize(60);
  textFont("Georgia");
  textStyle(BOLD);
  textAlign(CENTER);
  text("Wonder Kids", 325, 180);
}

function drawSettings() {
  noStroke();
  fill(0, 0, 0, 40);
  rect(0, 0, 650, 600);

  fill(210, 23, 40, 96);
  rect(50, 50, 550, 500);

  textSize(40);
  textStyle(NORMAL);
  fill("pink");
  stroke("black");
  strokeWeight(8);
  text("Settings", 325, 120);
}

const menuChildren = () => [...opts.btns, ...opts.dropdowns];

function createDropdown(id, pos, entries) {
  const text = `Select ${id}`;

  sel = createSelect();
  sel.position(pos[0], pos[1]);
  sel.style("background", color(25, 23, 100));
  sel.changed(function () {
    const val = this.value();
    opts[id] = val === text ? undefined : val;
    console.log(`dropdown '${id}' set to '${val}'`);
  });

  for (const entry of [text, ...entries]) {
    sel.option(entry);
  }

  return sel;
}
// #endregion

// #region color page
function initColor() {
  backgroundImg = loadImage("assets/color_bg.jpg");

  const colorBank = {
    Easy: ["red", "yellow", "blue", "green"],
    Medium: ["red", "yellow", "blue", "green", "orange", "purple"],
    Hard: ["red", "yellow", "blue", "green", "orange", "purple", "pink"],
  };

  opts.colors = colorBank[opts["Difficulty"]]
    .sort(() => 0.5 - Math.random())
    .slice(0, 4);

  const index = Math.floor(Math.random() * 4);
  opts.color = opts.colors[index];

  cnv.mousePressed(function () {
    if (opts.showResults)
      if (--opts["# Rounds"]) {
        // dismiss results screen
        opts.showResults = false;
        opts.colors = colorBank[opts["Difficulty"]]
          .sort(() => 0.5 - Math.random())
          .slice(0, 4);

        const index = Math.floor(Math.random() * 4);
        opts.color = opts.colors[index];
      } // no rounds left
      else setState(STATE.MENU);
    else {
      // user maybe clicked a square
      for (let i = 0; i < 4; i++) {
        const [width, height, pad] = [200, 200, 10];
        const x = i % 2 ? 325 + pad : 325 - width - pad;
        const y = 40 + (Math.floor(i / 2) ? 300 + pad : 300 - height - pad);
        const mouseOut =
          mouseX < x || mouseX > x + width || mouseY < y || mouseY > y + height;

        if (!mouseOut) {
          // they clicked this square
          const correct = opts.color === opts.colors[i];
          const score = opts.results ? opts.results.score + correct : correct;
          const splashes = [
            "Nice one!",
            "Great job!",
            "Good work!",
            "That's right!",
            "Correct!",
            "Spot on!",
          ];
          const splash = correct
            ? splashes[Math.floor(Math.random() * splashes.length)]
            : "Wrong!";

          opts.results = {
            correct,
            score,
            splash,
            index: i,
            
          };
          opts.showResults = true;
        }
      }
    }
  });
}

function drawColor() {
  if (opts.showResults) {
    const { correct, score, index, splash } = opts.results;
    stroke("black");
    strokeWeight(8);
    textSize(52);
    textFont("Georgia");
    fill(correct ? "white" : "red");
    text(splash, 325, 80);
    if (!correct) {
      textSize(24);
      text(`You picked ${opts.colors[index]}, not ${opts.color}`, 325, 220);

      for (let i = 0; i < 2; i++) {
        const [width, height, pad] = [200, 200, 10];
        const x = i % 2 ? 325 + pad : 325 - width - pad;
        fill(i ? opts.color : opts.colors[index]);
        stroke(i ? "green" : "red");
        rect(x, 300, width, height);
      }
    }
    stroke("black");
    strokeWeight(4);
    fill("white");
    textSize(18);
    text("click anywhere to continue...", 325, 550);

    return;
  }

  for (let i = 0; i < 4; i++) {
    const [width, height, pad] = [200, 200, 10];
    const x = i % 2 ? 325 + pad : 325 - width - pad;
    const y = 40 + (Math.floor(i / 2) ? 300 + pad : 300 - height - pad);
    const mouseOut =
      mouseX < x || mouseX > x + width || mouseY < y || mouseY > y + height;

    fill(opts.colors[i]);
    stroke(mouseOut ? opts.colors[i] : "white");
    rect(x, y, width, height);
  }

  stroke("black");
  strokeWeight(8);
  fill("pink");
  textSize(52);
  textFont("Georgia");
  text(`Select the color ${opts.color}`, 325, 80);
}
// #endregion

// #region direction page
function drawDirection() {
  stroke("black");
  strokeWeight(8);
  fill("pink");
  textSize(52);
  textFont("Georgia");
  text(`Move the circle ${opts.direction} `, 325, 80);
  fill("red");
  if (dragging) {
    x = mouseX;
    y = mouseY;
  }

  noStroke();
  ellipse(x, y, diameter, diameter);
}
function initTyping() {
  const TYPE = {
    A: "A",
    B: "B",
    C: "C",
    D: "D",
    E: "E",
    F: "F",
    G: "G",
    H: "H",
    I: "I",
    J: "J",
    K: "K",
    L: "L",
    M: "M",
    N: "N",
    O: "O",
    P: "P",
    Q: "Q",
    R: "R",
    S: "S",
    T: "T",
    U: "U",
    V: "V",
    W: "W",
    X: "X",
    Y: "Y",
    Z: "Z",
  };

  opts.typing = Object.values(TYPE)[Math.floor(Math.random() * 27)];
  function myInputEvent(inp) {
    if (inp == opts.typing) text("You are correct");
  }
}
function drawTyping() {
  stroke("black");
  strokeWeight(8);
  fill("pink");
  textSize(52);
  textFont("Georgia");
  text(`Type the letter: ${opts.typing} `, 335, 80);

  let inp = createInput("");
  inp.position(220, 150);
  inp.size(200, 200);
  inp.style("background", color(25, 23, 100));

  inp.input(myInputEvent);
}
function mousePressed() {
  //check if mouse is over the ellipse
  if (dist(x, y, mouseX, mouseY) < diameter / 2) {
    dragging = true;
  }
}

function mouseReleased() {
  dragging = false;
}
