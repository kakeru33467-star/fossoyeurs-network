const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");

context.scale(20, 20);

let grid = Array.from({length: 20}, () => Array(12).fill(0));
let linesCleared = 0;

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = "#7a0000";
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
               (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function playerDrop() {
    player.pos.y++;
    if (collide(grid, player)) {
        player.pos.y--;
        merge(grid, player);
        playerReset();
        arenaSweep();
    }
}

function arenaSweep() {
    outer: for (let y = grid.length - 1; y >= 0; --y) {
        for (let x = 0; x < grid[y].length; ++x) {
            if (grid[y][x] === 0) continue outer;
        }
        grid.splice(y, 1);
        grid.unshift(Array(12).fill(0));
        ++linesCleared;
        if (linesCleared >= 3) {
            window.location.href = "dashboard.html";
        }
    }
}

function createPiece() {
    return [
        [1,1],
        [1,1]
    ];
}

const player = {
    pos: {x: 5, y: 0},
    matrix: createPiece()
};

function playerReset() {
    player.pos.y = 0;
    player.pos.x = 5;
}

function update() {
    context.fillStyle = "#0b0b0b";
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(grid, {x:0, y:0});
    drawMatrix(player.matrix, player.pos);
    requestAnimationFrame(update);
}

document.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") player.pos.x--;
    if (e.key === "ArrowRight") player.pos.x++;
    if (e.key === "ArrowDown") playerDrop();
});

update();
