p5.disableFriendlyErrors = true;
var cnv;

function setup() {
    cnv = createCanvas(650, 600);
    colorMode(HSB, 360, 100, 100, 100);

    initMenu();
}

function draw() {
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
    if (state === STATE.MENU)
        menuChildren().map(el => el.remove());

    cnv.mousePressed(false);

    switch (newState) {
        case STATE.MENU:
            initMenu();
            break;
        case STATE.COLOR:
            const colorBank = {
                "Easy": ["red", "yellow", "blue", "green"],
                "Medium": ["red", "yellow", "blue", "green", "orange", "purple"],
                "Hard": ["red", "yellow", "blue", "green", "orange", "purple", "pink"],
            };

            opts.colors = colorBank[opts["Difficulty"]]
                .sort(() => 0.5 - Math.random())
                .slice(0, 4);

            const index = Math.floor(Math.random() * 4);
            opts.color = opts.colors[index];
            break;
    };

    state = newState;
}
// #endregion

// #region menu
var opts, backgroundImg, settingsImg;

function initMenu() {
    opts = ({
        settings: false
    });
    state = STATE.MENU;
    backgroundImg = loadImage("assets/background.jpg");
    settingsImg = loadImage("assets/settings.png");

    const labels = ["Mode", "Difficulty", "# Rounds"];
    const modes = Object.values(STATE).filter(v => v !== STATE.MENU);
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
        const [mode, diff, rounds] = labels.map(k => opts[k]);
        if (mode && diff && rounds)
            setState(mode);
    });

    // settings button
    const settings = createImg("assets/settings.png");
    settings.position(610, 0);
    settings.size(40, 40);
    settings.mousePressed(function () { // when the gear is clicked
        opts.settings = true; // open the settings menu
        menuChildren().map(el => el.hide()); // hide the dropdowns & btns
        cnv.mousePressed(function () { // register a click handler
            const [outX, outY] = [mouseX < 50 || mouseX > 600, mouseY < 50 || mouseY > 550];
            if (outX || outY) { // when the click is outside the settings menu
                opts.settings = false; // close the settings menu
                menuChildren().map(el => el.show()); // show the underlying elements
                cnv.mousePressed(false); // unregister the click handler
            }
        })
    })

    opts.btns = [start, settings];
}

function drawMenu() {
    background(backgroundImg);

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
function drawColor() {
    background(0, 0, 40);

    for (let i = 0; i < 4; i++) {
        const [width, height] = [200, 200];
        const pad = 10;

        const x = i % 2 ? 325 - width - pad : 325 + pad;
        const y = Math.floor(i / 2) ? 300 - height - pad : 300 + pad;

        fill(opts.colors[i]);
        rect(x, y + 25, width, height);
    }

    fill(0, 0, 100);
    textSize(25);
    text(`Select the color ${opts.color}`, 325, 80);
    
     function drawDirection(){
        background(240,100,100);
        text('Move the cirle to ${direction}');
    }
}
// #endregion
