p5.disableFriendlyErrors = true;
var cnv, opts = {}, state, backgroundImg, settingsImg;
let img3;
function preload() {
  img3 = loadImage('assets/good.png');
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
const STATE = {
    MENU: "Menu",
    DIRECTION: "Direction",
    COLOR: "Color",
    TYPING: "Typing",
};

function setState(newState) {
    background(0);

    cnv.mousePressed(false);
    cnv.mouseReleased(false);

    if (opts.elements)
        opts.elements.map((el) => el.remove());

    if (newState !== STATE.MENU) {
        let btn = createButton("Menu");
        btn.position(0, 0);
        btn.size(60, 30);
        btn.mousePressed(() => setState(STATE.MENU));
        opts.elements = [btn];
    } else opts.elements = [];

    switch (newState) {
        case STATE.MENU:
            initMenu();
            break;
        case STATE.COLOR:
            initColor();
            break;
        case STATE.DIRECTION:
            initDirection();
            break;
        case STATE.TYPING:
            initTyping();
            break;
    }

    state = newState;
}
// #endregion

// #region menu
function initMenu() {
    opts = ({});
    state = STATE.MENU;
    backgroundImg = loadImage("assets/menu_bg.jpg");

    const labels = ["Mode", "Difficulty", "# Rounds"];
    const modes = Object.values(STATE).filter((v) => v !== STATE.MENU);
    const dropdowns = [
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

    opts.elements = [start, ...dropdowns];
}

function drawMenu() {
    fill("pink");
    stroke("black");
    strokeWeight(8);

    textSize(60);
    textFont("Georgia");
    textStyle(BOLD);
    textAlign(CENTER);
    text("Wonder Kids", 325, 180);
}

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

    opts.bank = colorBank[opts["Difficulty"]]
        .sort(() => 0.5 - Math.random())
        .slice(0, 4);

    const index = Math.floor(Math.random() * 4);
    opts.color = opts.bank[index];

    cnv.mousePressed(function () {
        if (opts.showResults)
            if (--opts["# Rounds"]) {
                // dismiss results screen
                opts.showResults = false;
                opts.bank = colorBank[opts["Difficulty"]]
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 4);

                const index = Math.floor(Math.random() * 4);
                opts.color = opts.bank[index];
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
                    const correct = opts.color === opts.bank[i];
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
        textFont("Segoe UI");
        fill(correct ? "white" : "red");
        fill("pink");
        stroke("black");
        strokeWeight(8);
        text(splash, 300, 100);
      if(correct){
        
        image(img3, 130, 150, 300, 300);
      }

        if (!correct) {
            textSize(24);
            text(`You picked ${opts.bank[index]}, not ${opts.color}`, 300, 220);

            for (let i = 0; i < 2; i++) {
                const [width, height, pad] = [200, 200, 10];
                const x = i % 2 ? 325 + pad : 325 - width - pad;
                fill(i ? opts.color : opts.bank[index]);
                stroke(i ? "green" : "red");
                rect(x, 300, width, height);
            }
        }

        stroke("black");
        strokeWeight(4);
        fill("white");
        textSize(25);
        fill("pink");
        stroke("black");
        strokeWeight(8);
        text("Click Anywhere to Continue", 300, 550);

        return;
    }

    for (let i = 0; i < 4; i++) {
        const [width, height, pad] = [200, 200, 10];
        const x = i % 2 ? 325 + pad : 325 - width - pad;
        const y = 40 + (Math.floor(i / 2) ? 300 + pad : 300 - height - pad);
        const mouseOut =
            mouseX < x || mouseX > x + width || mouseY < y || mouseY > y + height;

        fill(opts.bank[i]);
        stroke(mouseOut ? opts.bank[i] : "white");
        rect(x, y, width, height);
    }

    stroke("black");
    strokeWeight(8);
    fill("white");
    textSize(52);
    textFont("Segoe UI");
    fill("pink");
    stroke("black");
    strokeWeight(8);
    text(`Select the color ${opts.color}`, 325, 80);
}
// #endregion

// #region direction page
function initDirection() {
    backgroundImg = loadImage("assets/dir_bg.jpg");

    const dirBank = {
        "Easy": ["Right", "Up", "Left", "Down"],
        "Medium": ["East", "North", "West", "South"],
        "Hard": ["East", "North", "West", "South"],
    };

    opts.direction = dirBank[opts["Difficulty"]][Math.floor(Math.random() * 4)];
    cnv.mousePressed(function () {
        if (opts.showResults) {
            if (--opts["# Rounds"]) {
                opts.showResults = false;
                opts.direction = dirBank[opts["Difficulty"]][Math.floor(Math.random() * 4)];
            } else setState(STATE.MENU);
        } else {
            const mouse = createVector(mouseX, mouseY);
            if (createVector(350, 300).sub(mouse).mag() <= 100)
                opts.mouseStart = mouse;
        }
    });
    cnv.mouseReleased(function () {
        if (!opts.mouseStart) return;
        let mouse = opts.mouseStart.sub(mouseX, mouseY);
        if (mouse.mag() > 100) {
            switch (Math.floor(4 * mouse.heading() / PI)) {
                case 3:
                case -4:
                    opts.dir = 0; // right
                    break;
                case -3:
                case -2:
                    opts.dir = 3; // down
                    break;
                case 0:
                case -1:
                    opts.dir = 2; // left
                    break;
                case 1:
                case 2:
                    opts.dir = 1; // up
                    break;
            }
            opts.results = opts.dir === dirBank[opts["Difficulty"]].indexOf(opts.direction);
            opts.showResults = true;
        }
        opts.mouseStart = undefined;
    });
}

function drawDirection() {

    stroke("black");
    strokeWeight(8);
    fill("white");
    textSize(52);
    textFont("Segoe UI");
    fill("pink");
    stroke("black");

    if (opts.showResults) {
        if(opts.results==true){
  image(img3, 130, 150, 300, 300);
}
        text(opts.results ? "Great job!" : "Wrong!", 325, 90);
        text("Click to continue...", 325, 550);
        return;
    }
    text(`Move the circle ${opts.direction}`, 325, 80);

    noStroke();
    if (opts.mouseStart) {
        fill("red");
        circle(mouseX, mouseY, 100);
    } else {
        fill("yellow");
        circle(320, 300, 100);
    }
}
// #endregion

// #region typing page
function initTyping() {
    backgroundImg = loadImage("assets/kbd_bg.jpg");

    const wordBank = {
        "Easy": "abcdefghijklmnopqrstuvwxyz".split(""),
        "Medium": ["ace", "act", "add", "age", "ago", "aid", "aim", "air", "ale", "all", "and", "ant", "any", "ape", "app", "apt", "arc", "are", "arm", "art", "ash", "ask", "ate", "awe", "axe", "bar", "bat", "cab", "can", "cap", "car", "cat", "cel", "cob", "cod", "cog", "cop", "cot"],
        "Hard": ["lamp", "dark", "pace", "here", "this", "that", "what", "come", "came", "down", "post", "burn", "hate", "crib", "milk", "numb", "grid", "game", "goat", "beat", "brat", "lion", "plan", "plum", "peer", "pear"],
    };
    const bank = wordBank[opts["Difficulty"]];
    opts.word = bank[Math.floor(Math.random() * bank.length)];
    opts.showResults = false;
    opts.buffer = "";

    cnv.mousePressed(function () {
        if (!opts.showResults) return;

        if (--opts["# Rounds"]) initTyping();
        else setState(STATE.MENU);
    });
}

function drawTyping() {
    if (opts.showResults) {
        textFont("Georgia");
        textAlign(CENTER);
        textSize(40);
        fill("pink");
        stroke("black");
        strokeWeight(8);
        text("Great Work!", 325, 90);
        text("Click to Continue", 325, 550);
       image(img3, 130, 150, 300, 300);
        return;
    }
    textFont("Georgia");
    textSize(52);
    textAlign(LEFT);
    const longer = opts.word.length > opts.buffer.length ? opts.word : opts.buffer;
   textFont("Georgia");
        textAlign(CENTER);
        textSize(35);
        fill("pink");
        stroke("black");
        strokeWeight(8);
  text("Type The Following Word : ", 280, 90);
  for (let i = 0; i < longer.length; i++) {
        const char = opts.word.charAt(i);
        const offset = textWidth(longer.substr(0, i));

        const other = opts.buffer.charAt(i);
textAlign(LEFT);
        if (other && other !== char) {
            fill("red");
            text(other, 100 + offset, 280);
            fill("red");
        } else fill(other ? "green" : "white");

        if (char) text(char, 100 + offset, 180);
    }
}

function keyPressed() {
    if (state !== STATE.TYPING)
        return;

    if (opts.showResults)
        if (keyCode === ENTER || keyCode === RETURN)
            if (--opts["# Rounds"])
                initTyping();
            else
                setState(STATE.MENU);
        else { }
    else
        if ("abcdefghijklmnopqrstuvwxyz".indexOf(key) !== -1) {
            opts.buffer += key;
            if (opts.buffer === opts.word)
                opts.showResults = true;
        } else if (keyCode === BACKSPACE)
            opts.buffer = opts.buffer.substr(0, opts.buffer.length - 1);
}
