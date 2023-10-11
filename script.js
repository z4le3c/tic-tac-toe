const gridCells = document.querySelectorAll('.cell')

const gameBoard = (function () {
    const gameBoard = [['','',''],['','',''],['','','']];
    /*
    *  @param {string} symbol
    *  @param {number} col
    *  @param {number} row
    *  @return {boolean}
    */
    const setCell = (symbol, col, row) => {
        let colInBounds = -1 < col && col < 3;
        let rowInBounds = -1 < row && row < 3;
        val = val.toLowerCase();
        if (colInBounds && rowInBounds) {
            gameBoard[row][col] = symbol;
            return true;
        }
        return false;
    };

    /*
    *  @param {number} col
    *  @param {number} row
    *  @return {string}
    */
    const getCell = (col, row) => {
        let colInBounds = -1 < col && col < 3;
        let rowInBounds = -1 < row && row < 3;
        if (colInBounds && rowInBounds)
            return gameBoard[row][col];
        else
            return '';
    }

    /*
    *  @return {string}
    */
    const checkForWinner = () => {
        
    }

    return {setCell, getCell, checkForWinner};
})();

function createPlayer (symbol) {
    let score = 0;
    const playerSymbol = symbol;

    const addPoint = () => score++;
    const resetScore = () => score = 0;
    const getPlayerSymbol = () => playerSymbol;

    return {addPoint, resetScore, getPlayerSymbol}
}

const gameController = (function (gridCells) {
    const player1 = createPlayer('X');
    const player2 = createPlayer('O');
    let rounds = 0;
    let currRound = 0;
    let boardInit = false // tells if the board was instanciated before

    const buildBoard = () => {
        let row = 0;
        let col = 0;
        for (const cell of gridCells) {
            cell.setAttribute('id', `${row}-${col}`);
            cell.textContent = gameBoard.getCell(col, row);
            col++;
            if (col == 3) {
                row++;
                col = col%3;
            }
            if (!boardInit) {
                cell.addEventListener('click', () => console.log(cell.id));
            }
        }
        boardInit = true;
    }

    const playRound = () => {
        
    }

    return {buildBoard}
})(gridCells);

gameController.buildBoard()
gameController.buildBoard()
gameController.buildBoard()