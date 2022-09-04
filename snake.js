const nRows = 18;
const nCols = 18;
const cellWidth = 32;
const cellHeight = 32;
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
canvas.width = cellWidth * nCols;
canvas.height = cellHeight * nRows;
const ctx = canvas.getContext('2d');
let pressedKey = null;
const directionPerKey = {'ArrowUp': 'up', 'ArrowLeft': 'left', 'ArrowDown': 'down', 'ArrowRight': 'right'};
const oppositePerDirection = {'up': 'down', 'left': 'right', 'down': 'up', 'right': 'left'};
const grid = []
const grassCells = [];
const waterCellSet = new Set();
for (let row = 0; row < nRows; row++) {
    const rowCells = [];
    for (let col = 0; col < nCols; col++) {
        const cell = [row, col];
        rowCells.push(cell);
        if (row % (nRows - 1) && col % (nCols - 1)) {
            grassCells.push(cell);
        } else {
            waterCellSet.add(cell);
        }
    }
    grid.push(rowCells);
}
const snake = {
    cells: grassCells.slice(0, 3).reverse(),
    direction: 'right',
};
const getRandomFreeCell = () => {
    const freeCells = grassCells.filter(cell => !snake.cells.includes(cell));
    return freeCells[Math.floor(Math.random() * freeCells.length)];
}
const foodCellSet = new Set([getRandomFreeCell()]);
const render = () => {
    [
        {color: 'green', cells: grassCells},
        {color: 'blue', cells: waterCellSet},
        {color: 'yellow', cells: snake.cells},
        {color: 'red', cells: foodCellSet},
    ].forEach(({color, cells}) => {
        ctx.beginPath();
        ctx.fillStyle = color;
        ctx.strokeStyle = 'white';
        cells.forEach(([row, col]) => {
            ctx.rect(col * cellWidth, row * cellHeight, cellWidth, cellHeight);
        })
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    });
}
let targetFrameRate = 3;
let nextFrameTimeStamp;
const step = timeStamp => {
    let continueAnimation = true;
    if (timeStamp >= nextFrameTimeStamp) {
        const newDirection = directionPerKey[pressedKey];
        if (newDirection && oppositePerDirection[newDirection] !== snake.direction){
            snake.direction = newDirection;
        }
        let [newRow, newCol] = snake.cells[0];
        if (snake.direction === 'up') {
            newRow--;
        } else if (snake.direction === 'left') {
            newCol--;
        } else if (snake.direction === 'down') {
            newRow++
        } else if (snake.direction === 'right') {
            newCol++;
        }
        const cell = grid[newRow][newCol];
        if (waterCellSet.has(cell) || snake.cells.includes(cell)) {
            continueAnimation = false;
        } else {
            snake.cells.unshift(cell)
            if (foodCellSet.has(cell)) {
                foodCellSet.delete(cell);
                foodCellSet.add(getRandomFreeCell());
                targetFrameRate += 0.25;
            } else {
                snake.cells.pop();
            }
        }
        render();
        pressedKey = null;
        nextFrameTimeStamp += 1000 / targetFrameRate;
    }
    if (continueAnimation) {
        requestAnimationFrame(step);
    }
}
document.body.addEventListener('keydown', e => pressedKey = e.key);
render();
nextFrameTimeStamp = performance.now() + (1000 / targetFrameRate);
requestAnimationFrame(step);