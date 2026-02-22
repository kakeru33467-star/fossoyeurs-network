const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const tile = 40;
const rows = 10;
const cols = 10;

let level = 1;

let player = { x: 1, y: 1 };
let documentItem = { x: 8, y: 1 };
let exitDoor = { x: 8, y: 8 };

let enemies = [];

const baseMap = [
"##########",
"#........#",
"#.######.#",
"#........#",
"#.######.#",
"#........#",
"#.######.#",
"#........#",
"#........#",
"##########"
];

function initLevel() {
    player = { x: 1, y: 1 };
    documentItem = { x: 8, y: 1 };
    exitDoor = { x: 8, y: 8 };

    enemies = [];

    for (let i = 0; i < level; i++) {
        enemies.push({
            x: 8 - i,
            y: 5,
            dx: -1,
            dy: 0,
            speed: 600 - level * 100
        });
    }
}

function drawMap() {
    baseMap.forEach((row, y) => {
        row.split("").forEach((cell, x) => {
            if (cell === "#") {
                ctx.fillStyle = "#001155";
                ctx.fillRect(x * tile, y * tile, tile, tile);
            }
        });
    });
}

function drawPlayer() {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(player.x * tile + 10, player.y * tile + 10, 20, 20);
}

function drawDocument() {
    ctx.fillStyle = "#7a0000";
    ctx.fillRect(documentItem.x * tile + 12, documentItem.y * tile + 12, 16, 16);
}

function drawExit() {
    ctx.fillStyle = "#00aa55";
    ctx.fillRect(exitDoor.x * tile + 10, exitDoor.y * tile + 10, 20, 20);
}

function drawEnemies() {
    enemies.forEach(e => {
        ctx.fillStyle = "#888";
        ctx.fillRect(e.x * tile + 8, e.y * tile + 8, 24, 24);
    });
}

function isWall(x, y) {
    return baseMap[y][x] === "#";
}

function moveEnemies() {
    enemies.forEach(e => {
        let nx = e.x + e.dx;
        if (isWall(nx, e.y)) {
            e.dx *= -1;
        } else {
            e.x += e.dx;
        }

        if (e.x === player.x && e.y === player.y) {
            initLevel();
        }
    });
}

let hasDocument = false;

function update() {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawMap();
    drawDocument();
    drawExit();
    drawPlayer();
    drawEnemies();

    if (player.x === documentItem.x && player.y === documentItem.y) {
        hasDocument = true;
        documentItem = { x: -1, y: -1 };
    }

    if (player.x === exitDoor.x && player.y === exitDoor.y && hasDocument) {
        level++;
        if (level > 3) {
            window.location.href = "dashboard.html";
        } else {
            hasDocument = false;
            initLevel();
        }
    }

    moveEnemies();
}

document.addEventListener("keydown", e => {
    let nx = player.x;
    let ny = player.y;

    switch (e.key.toLowerCase()) {
        case "arrowup":
        case "z": ny--; break;
        case "arrowdown":
        case "s": ny++; break;
        case "arrowleft":
        case "q": nx--; break;
        case "arrowright":
        case "d": nx++; break;
    }

    if (!isWall(nx, ny)) {
        player.x = nx;
        player.y = ny;
    }
});

initLevel();
setInterval(update, 200);
