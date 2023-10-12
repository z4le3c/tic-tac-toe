const gameBoard = (function () {
    const size = 3

    const gameBoard = [['', '', ''], ['', '', ''], ['', '', '']];
    /**
     *  @param {string} symbol
     *  @param {number} col
     *  @param {number} row
     *  @return {boolean}
     */
    const setCell = (symbol, col, row) => {
        let colInBounds = -1 < col && col < size;
        let rowInBounds = -1 < row && row < size;
        if (colInBounds && rowInBounds) {
            gameBoard[row][col] = symbol;
            return true;
        }
        return false;
    };

    /**
     *  @param {number} col
     *  @param {number} row
     *  @return {string}
     */
    const getCell = (col, row) => {
        let colInBounds = -1 < col && col < size;
        let rowInBounds = -1 < row && row < size;
        if (colInBounds && rowInBounds)
            return gameBoard[row][col];
        else
            return '';
    }

    /**
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
                    if (rows.get(i) == size ||
                        columns.get(j) == size ||
                        diagonals.get('rl') == size ||
                        diagonals.get('lr') == size) return true;
                }
            }
        }
        return false;
    }

    return { setCell, getCell, checkForWinner, size};
})();

function createPlayer(symbol) {
    const playerSymbol = symbol;
    let playerName = symbol;

    const getPlayerSymbol = () => playerSymbol;
    const getPlayerName = () => playerName;
    const setPlayerName = (name) => playerName = name;

    return {getPlayerSymbol, getPlayerName, setPlayerName}
}

const gameController = (function () {
    const gridCells = document.querySelectorAll('.cell');
    const turnMessage = document.querySelector('.turn');
    const reStartButton = document.querySelector('.re-start');
    const toggleAI = document.querySelector('.toggle-ai');
    const p1Name = document.querySelector('#x-name');
    const p2Name = document.querySelector('#o-name');
    const p2Wrapper = document.querySelector('.p2-wrapper');

    const player1 = createPlayer('X');
    const player2 = createPlayer('O');
    let currRound = 0;
    let gameOn = false;
    let boardInit = false; // tells if the board was instanciated before
    let aiActive = false;
    let aiTurn = false;
    /**
     * @return {void}
     */
    const buildBoard = () => {
        let row = 0;
        let col = 0;
        turnMessage.textContent = ''
        if (gameOn) 
            reStartButton.textContent = 'Restart'
        else 
            reStartButton.textContent = 'Start new game'

        if (!boardInit) {
            reStartButton.addEventListener('click', () => reStart());

            toggleAI.addEventListener('click', () => {
                aiActive = !aiActive;
                if (aiActive) 
                    p2Wrapper.style.visibility = 'hidden';
                else
                    p2Wrapper.style.visibility = 'visible'
                reStart();
            });
        } // activates buttons, once

        for (const cell of gridCells) {
            if (!boardInit) {
                cell.addEventListener('click', () => {
                    let [row, col] = cell.id.split('-');
                    playRound(col, row)
                });
                cell.setAttribute('id', `${row}-${col}`);
            } // activates grid cells, once
            cell.textContent = gameBoard.getCell(col, row);
            col++;
            if (col == gameBoard.size) {
                row++;
                col = col % gameBoard.size;
            }
        } 
        boardInit = true;
    }

    /**
     * 
     * @param {number} col 
     * @param {number} row 
     * @returns {void}
     */
    const playRound = (col, row) => {
        if (!gameOn) return
        if (gameBoard.getCell(col, row) != '')
            return;
        
        let pSymbol;
        if (currRound % 2 == 0) 
            pSymbol = player1.getPlayerSymbol()
        else 
            pSymbol = player2.getPlayerSymbol()
        
        gameBoard.setCell(pSymbol, col, row);

        buildBoard();

        if (gameBoard.checkForWinner(pSymbol)) {
            let playerName = currRound % 2 == 0 ? player1.getPlayerName() : player2.getPlayerName();
            turnMessage.textContent = `${playerName} wins`;
            gameOn = false;
        } else if (currRound == 8) {
            turnMessage.textContent = `It's a tie`;
            gameOn = false;
        } 
        currRound++;
        if (aiActive && !aiTurn) {
            aiTurn = true;
            move = aI.makeMove();
            if (gameOn)
                playRound(move.col, move.row);
        } else if (aiActive) {
            aiTurn = false;
        }
    }

    /**
     * @return {void}
     */
    const reStart = () => {
        gameOn = true;
        aiTurn = false;
        currRound = 0;
        
        for (let i = 0; i < gameBoard.size; i++) {
            for (let j = 0; j < gameBoard.size; j++) {
                gameBoard.setCell('', j, i);
            }
        }

        buildBoard();

        if (aiActive) {
            if (Math.random() < .5) { // AI starts
                player1.setPlayerName('AI');
                aiTurn = true;
                move = aI.makeMove();
                playRound(move.col, move.row)
                player2.setPlayerName(p1Name.value || player2.getPlayerSymbol());
                turnMessage.textContent = ''
            } else { // player starts
                player1.setPlayerName(p1Name.value || player1.getPlayerSymbol());
                player2.setPlayerName('AI');
                turnMessage.textContent = `You start`;
            }
            
        } else {
            player1.setPlayerName(p1Name.value || player1.getPlayerSymbol());
            player2.setPlayerName(p2Name.value || player2.getPlayerSymbol());
            turnMessage.textContent = `${player1.getPlayerName()} Starts`;
        }
    }
    return { buildBoard }
})();

const aI = (function () {
    /**
     * @returns {object}
     */
    const makeMove = () => {
        vCells = getValidCells();
        cell = vCells[Math.floor(Math.random() * vCells.length)];
        return cell;
    }

    /**
     * @returns {Array}
     */
    const getValidCells = () => {
        let cells = [];
        for (let row = 0; row < gameBoard.size; row++) {
            for (let col = 0; col < gameBoard.size; col++) {
                if (gameBoard.getCell(col, row) == '') {
                    cells.push({col:col, row:row})
                }
            }
        }
        return cells
    }

    return {makeMove};
})();

gameController.buildBoard()