const gameBoard = (function () {
    const gameBoard = [['', '', ''], ['', '', ''], ['', '', '']];
    /*
    *  @param {string} symbol
    *  @param {number} col
    *  @param {number} row
    *  @return {boolean}
    */
    const setCell = (symbol, col, row) => {
        let colInBounds = -1 < col && col < 3;
        let rowInBounds = -1 < row && row < 3;
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
    *  @param {string} symbol
    *  @return {void}
    */
    const checkForWinner = (symbol) => {
        let rows = new Map();
        let columns = new Map();
        let diagonals = new Map();
        for (let i = 0; i < gameBoard.length; i++) {
            for (let j = 0; j < gameBoard.length; j++) {
                let s = gameBoard[i][j]
                if (s == symbol) {
                    rows.set(i, (rows.get(i) || 0) + 1);
                    columns.set(j, (columns.get(j) || 0) + 1);
                    if (i === j) {
                        diagonals.set('rl', (diagonals.get('rl') || 0) + 1);
                        if (i + j === gameBoard.length-1) {
                            diagonals.set('lr', (diagonals.get('lr') || 0) + 1)
                        }
                    } else if (i + j === gameBoard.length-1) {
                        diagonals.set('lr', (diagonals.get('lr') || 0) + 1)
                    }
                    if (rows.get(i) == 3 ||
                        columns.get(j) == 3 ||
                        diagonals.get('rl') == 3 ||
                        diagonals.get('lr') == 3) return true;
                }
            }
        }
        return false;
    }

    return { setCell, getCell, checkForWinner };
})();

function createPlayer(symbol) {
    let score = 0;
    const playerSymbol = symbol;

    const addPoint = () => score++;
    const resetScore = () => score = 0;
    const getPlayerSymbol = () => playerSymbol;

    return { addPoint, resetScore, getPlayerSymbol }
}

const gameController = (function () {
    const gridCells = document.querySelectorAll('.cell')
    const turnMessage = document.querySelector('.turn')

    const player1 = createPlayer('X');
    const player2 = createPlayer('O');
    let currRound = 0;
    let gameOn = true;
    let boardInit = false // tells if the board was instanciated before

    const buildBoard = () => {
        let row = 0;
        let col = 0;
        for (const cell of gridCells) {
            if (!boardInit) {
                cell.addEventListener('click', () => {
                    let [row, col] = cell.id.split('-');
                    playRound(col, row)
                });
                cell.setAttribute('id', `${row}-${col}`);
            }
            cell.textContent = gameBoard.getCell(col, row);
            col++;
            if (col == 3) {
                row++;
                col = col % 3;
            }
        }
        boardInit = true;
    }

    const playRound = (col, row) => {
        if (!gameOn) return
        console.log(row, col)
        if (gameBoard.getCell(col, row) != '')
            return;
        let pSymbol;
        if (currRound % 2 == 0) {
            pSymbol = player1.getPlayerSymbol()
            turnMessage.textContent = 'Player O Turn';
        } else {
            pSymbol = player2.getPlayerSymbol()
            turnMessage.textContent = 'Player X Turn';
        }
        gameBoard.setCell(pSymbol, col, row);
        currRound++;
        buildBoard()
        if (currRound > 4 && gameBoard.checkForWinner(pSymbol)) {
            turnMessage.textContent = `Player ${pSymbol} wins`;
            gameOn = false;
        }
    }

    return { buildBoard }
})();

gameController.buildBoard()