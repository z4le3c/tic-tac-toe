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
     *  @param {Array[Array]} board (optional)
     *  @return {void}
     */
    const checkForWinner = (symbol, board) => {
        let rows = new Map();
        let columns = new Map();
        let diagonals = new Map();
        for (let i = 0; i < gameBoard.length; i++) {
            for (let j = 0; j < gameBoard.length; j++) {
                let s
                if (board) {
                    s = board[i][j];
                } else {
                    s  = gameBoard[i][j]
                }
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
                aI.setSymbols(player1.getPlayerSymbol(), player2.getPlayerSymbol())
                move = aI.makeMove();
                playRound(move.col, move.row)
                player2.setPlayerName(p1Name.value || player2.getPlayerSymbol());
                turnMessage.textContent = 'AI started, your turn'
            } else { // player starts
                player1.setPlayerName(p1Name.value || player1.getPlayerSymbol());
                player2.setPlayerName('AI');
                aI.setSymbols(player2.getPlayerSymbol(), player1.getPlayerSymbol())
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

    let aiSymbol;
    let playerSymbol;

    const setSymbols = (aiS, pS) => {
        aiSymbol = aiS;
        playerSymbol = pS;
    };

    /**
     * @returns {object}
     */
    const makeMove = () => {
        let emptyCells = getEmptyCells();
        if (emptyCells.length == 9) {
            return emptyCells[Math.floor(Math.random() * 9)]
        }
        let boardState = saveBoardState();
        let bestCell = {cell:null, score:-Infinity}
        for (const c of emptyCells) {
            // play nextSymbol in cell c
            boardState[c.row][c.col] = aiSymbol;
            // get the empty cells
            let score = minimax(aiSymbol, boardState);
            console.log(c,score)
            if (bestCell.score < score) {
                bestCell.cell = c;
                bestCell.score = score;
            }

            // restore emptyCellsCopy and boardState
            boardState[c.row][c.col] = '';
        }

        return bestCell.cell;
    }

    const minimax = (symbol, boardState) => {
        let emptyCells = getEmptyCells(boardState);
        // check for winner in boardState
        if (!emptyCells.length)
            return 0; // if there is a draw

        if (gameBoard.checkForWinner(symbol, boardState)) {
            if (symbol != aiSymbol)
                return -1; // human player wins
            else 
                return 1; // ai wins
        }

        // recursively invoke minimax on each empty cell
        let nextSymbol = symbol == aiSymbol ? playerSymbol : aiSymbol;
        let bestScore
        if (aiSymbol == nextSymbol)
            bestScore = -Infinity;
        else 
            bestScore = Infinity;
        for (const c of emptyCells) {
            // play nextSymbol in cell c
            boardState[c.row][c.col] = nextSymbol;
            // get the empty cells

            let score = minimax(nextSymbol, boardState);
            if (aiSymbol == nextSymbol) {
                bestScore = Math.max(bestScore, score)

            } else {
                bestScore = Math.min(bestScore, score)
            }

            // restore boardState
            boardState[c.row][c.col] = '';
        }

        return bestScore;
    }

    /**
     * @returns {Array[Array]}
     */
    const saveBoardState = () => {
        let bState = [];
        for (let row = 0; row < gameBoard.size; row++) {
            bState.push([])
            for (let col = 0; col < gameBoard.size; col++) {
                bState[row].push(gameBoard.getCell(col, row))
            }
        }

        return bState;
    }

    /**
     * @returns {Array}
     */
    const getEmptyCells = (board) => {
        let cells = [];
        for (let row = 0; row < gameBoard.size; row++) {
            for (let col = 0; col < gameBoard.size; col++) {
                if (board) {
                    if (board[row][col] == '') {
                        cells.push({col:col, row:row})
                    }
                } else {
                    if (gameBoard.getCell(col, row) == '') {
                        cells.push({col:col, row:row})
                    }
                }
            }
        }
        return cells
    }

    return {makeMove, setSymbols};
})();

gameController.buildBoard()