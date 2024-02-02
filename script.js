// Board constructor returns object with empty board if no argument is provided.
function Board(board) {
    this.board = board || (new Array(9)).fill(" ");
    this.winnerLine = new Array(3);
}

// Makes a move on the board if the provided move is valid.
Board.prototype.makeMove = function(symbol, index) {
    if (this.board[index] === " ") {
        this.board[index] = symbol;
        return 1;
    }

    return 0;
}

// Returns an array of indexes of the available spaces.
Board.prototype.getFreeSpaces = function() {
    let freeSpaces = [];

    for (let i = 0; i < 9; i++) {
        if (this.board[i] === " ") {
            freeSpaces.push(i);
        }
    }

    return freeSpaces;
}

// Returns the winner
Board.prototype.getWinner = function() {
    let rows = 0, columns = 0;

    for (let i = 0; i < 3; i++) {
        // Checks for winner in rows.
        if (this.board[rows] === this.board[rows + 1] && this.board[rows + 1] === this.board[rows + 2]) {
            if (this.board[rows] === "X" || this.board[rows] === "O") {
                // Saves the winning line. 
                this.winnerLine[0] = rows;
                this.winnerLine[1] = rows + 1;
                this.winnerLine[2] = rows + 2;

                // Returns winners symbol.
                return this.board[rows];
            }
        }
        // Moves to next row.
        rows += 3;

        // Checks for winner in columns.
        if (this.board[columns] === this.board[columns + 3] && this.board[columns + 3] === this.board[columns + 6]) {
            if (this.board[columns] === "X" || this.board[columns] === "O") {
                this.winnerLine[0] = columns;
                this.winnerLine[1] = columns + 3;
                this.winnerLine[2] = columns + 6;
                
                return this.board[columns];
            }
        }
        // Moves to next column.
        columns++;
    }

    // Checks for winner diagonally \.
    if (this.board[0] === this.board[4] && this.board[4] === this.board[8]) {
        if (this.board[0] === "X" || this.board[0] === "O") {
            this.winnerLine[0] = 0;
            this.winnerLine[1] = 4;
            this.winnerLine[2] = 8;

            return this.board[0];
        }
    }

     // Checks for winner diagonally /.
    if (this.board[2] === this.board[4] && this.board[4] === this.board[6]) {
        if (this.board[2] === "X" || this.board[2] === "O") {
            this.winnerLine[0] = 2;
            this.winnerLine[1] = 4;
            this.winnerLine[2] = 6;

            return this.board[2];
        }
    }
}

// Checks if the game has reached a terminal state (ended).
Board.prototype.terminal = function() {
    if (this.getWinner(this.board) || this.getFreeSpaces(this.board).length === 0) return true;

    return false;
}

// Returns a board copy that resulted from a move.
Board.prototype.moveResult = function(symbol, index) {
    let boardCopy = new Board([...this.board]);

    boardCopy.makeMove(symbol, index);

    return boardCopy; 
}

// Main game board module which also extends on the board object with more functions.
const gameBoard = (function(mainBoard) {
    // Highlights the winning line.
    function highlightLine() {
        for (let index of mainBoard.winnerLine) {
            document.querySelector(`button[data-index="${index}"]`).style.backgroundColor = "#F7E987";
        }
    }

    // Fills the board with empty spaces.
    function resetBoard() {
        mainBoard.board.fill(" ");
    }

    // Displays the boards content on the screen. 
    function renderBoard() {
        document.querySelectorAll(".board>button").forEach((element, index) => {
            element.innerText = mainBoard.board[index];
            element.style.color = mainBoard.board[index] === "X"? "#CD1818":"#116D6E";
        });
    }

    return {
        terminal: mainBoard.terminal.bind(mainBoard),
        getFreeSpaces: mainBoard.getFreeSpaces.bind(mainBoard),
        getWinner: mainBoard.getWinner.bind(mainBoard),
        makeMove: mainBoard.makeMove.bind(mainBoard),
        moveResult: mainBoard.moveResult.bind(mainBoard),
        resetBoard,
        renderBoard,
        highlightLine
    };
})(new Board());

// This module contains the game logic.
const game = (function() {
    const winnerDisplay = document.querySelector(".winner");

    let gameRunning = false;

    let asyncStuff = false;

    function isDoingAsyncStuff() {
        return asyncStuff;
    }

    // Stops the game and displays the game result.
    function stop(player1, player2) {
        let winner = gameBoard.getWinner();

        // Display game result.
        if (winner === player1.getTeam()) {
            winnerDisplay.innerText = `${player1.getName()} Wins! 🎉`;
            gameBoard.highlightLine();
        } else if (winner === player2.getTeam()) {
            winnerDisplay.innerText = `${player2.getName()} Wins! 🎉`;
            gameBoard.highlightLine();
        } else {
            winnerDisplay.innerText = "Tie!";
        }

        // UnHighlight the player displays.
        document.querySelector(".player1-info").style.borderBottom = document.querySelector(".player2-info").style.borderBottom = "none";

        // Stop game.
        gameRunning = false;
    }

    const boardContainer = document.querySelector(".board");

    function start(player1, player2) {
        gameRunning = true;

        player1.resetPlayerTurn();
        player2.resetPlayerTurn();
        gameBoard.resetBoard();
        // Clear winner display.
        winnerDisplay.innerText = "";
        // Clear board.
        boardContainer.innerHTML = "";

        // Adds buttons to the board.
        for (let i = 0; i < 9; i++) {
            let button = document.createElement("button");
            button.dataset.index = i;
            boardContainer.appendChild(button);
        }

        let player1Type = player1.getType(), player2Type = player2.getType();

        // Human vs human.
        if (player1Type === "h" && player2Type === "h") {
            document.querySelectorAll(".board>button").forEach(element => {
                element.addEventListener("click", function() {
                    // Only do something if the game is running.
                    if (!gameRunning) return;

                    // Player1 makes a move.
                    if (player1.isPlayerTurn()) {
                        // If player made a valid move change turn to other player.
                        if (player1.play(element.dataset.index)) {
                            player2.changeTurn();
                        }
                    // Player2 makes move.
                    } else {
                        if (player2.play(element.dataset.index)) {
                            player1.changeTurn();
                        }
                    }

                    gameBoard.renderBoard();

                    // Stop the game if it has ended.
                    if (gameBoard.terminal()) stop(player1, player2);
                });
            });
        // Computer vs Computer.
        } else if (player1Type === "c" && player2Type === "c") {
            if (!gameRunning) return;

            asyncStuff = true;
            (async function() {
                // Keep looping until the game is over.
                do {
                    await new Promise(function (resolve) {
                        setTimeout(resolve, 500);
                    });
                    
                    // Computer makes move.
                    if (player1.isPlayerTurn()) {
                        player1.play();
                        player2.changeTurn();
                    } else {
                        player2.play();
                        player1.changeTurn();
                    }

                    gameBoard.renderBoard();
                } while (!gameBoard.terminal());

                asyncStuff = false;
                stop(player1, player2);
            })();
        // Human vs computer.
        } else {
            // If its the computers turn it will make the first move.
            if (player1Type === "c") {
                if (player1.isPlayerTurn()) {
                    asyncStuff = true;

                    setTimeout(function() {
                        asyncStuff = false;

                        player1.play();
                        player2.changeTurn();

                        gameBoard.renderBoard();
                    }, 500);
                }
            } else {
                if (player2.isPlayerTurn()) {
                    asyncStuff = true;

                    setTimeout(function () {
                        asyncStuff = false;

                        player2.play();
                        player1.changeTurn();

                        gameBoard.renderBoard();
                    }, 500);
                }
            }

            document.querySelectorAll(".board>button").forEach(element => {
                element.addEventListener("click", function() {
                    if (!gameRunning) return;

                    if (player1Type === "h") {
                        // Human makes a move.
                        if (player1.isPlayerTurn() && player1.play(element.dataset.index)) {
                            player2.changeTurn();

                            // Computer makes a move.
                            asyncStuff = true;
                            setTimeout(function () {
                                asyncStuff = false;

                                player2.play();
                                player1.changeTurn();

                                gameBoard.renderBoard();
                                if (gameBoard.terminal()) stop(player1, player2);
                            }, 500);
                        }
                    } else {
                        if (player2.isPlayerTurn() && player2.play(element.dataset.index)) {
                            player1.changeTurn();

                            asyncStuff = true;
                            setTimeout(function () {
                                asyncStuff = false;
                                
                                player1.play();
                                player2.changeTurn();

                                gameBoard.renderBoard();
                                if (gameBoard.terminal()) stop(player1, player2);
                            }, 500);
                        }
                    }

                    gameBoard.renderBoard();

                    if (gameBoard.terminal()) stop(player1, player2);
                });
            });
        }
    }

    return {start, isDoingAsyncStuff};
})();

// Returns a player object, the play function will be different for the human and the computer.
function createPlayer(name, type, team, difficulty) {
    function getName() {
        return name;
    }

    function getType() {
        return type;
    }

    // If player team is X its the player turn.
    let playerTurn = team === "X"? true:false;

    // Selects the player display, X will get player1 info display and O will get player2 info display.
    const playerDisplay = team === "X"? document.querySelector(".player1-info"):document.querySelector(".player2-info");

    // Highlights the border under the player display if it is the player's turn.
    playerDisplay.style.borderBottom = playerTurn? "4px solid #F7E987":"none";

    // Displays the player's name and team.
    playerDisplay.innerText = `${name}: ${team}`;

    // Changes the turn of the player and the player display highlighting.
    function changeTurn() {
        playerTurn = playerTurn? false:true;
        playerDisplay.style.borderBottom = playerTurn? "4px solid #F7E987":"none";
    }

    function isPlayerTurn() {
        return playerTurn;
    }

    function resetPlayerTurn() {
        playerTurn = team === "X"? true:false;
        playerDisplay.style.borderBottom = playerTurn? "4px solid #F7E987":"none";
    }

    function getTeam() {
        return team;
    }

    let play;

    // Computer.
    if (type === "c") {
        function minimax(boardCopy, team) {
            // Stops recursion when the game is over and returns the value of the board.
            if (boardCopy.terminal()) {
                let winner = boardCopy.getWinner();
                if (winner === "X") {
                    return 1;
                } else if (winner === "O") {
                    return -1
                } else {
                    return 0;
                }
            }

            let freeSpaces = boardCopy.getFreeSpaces();

            // Max player.
            if (team === "X") {
                let value = -1;

                // Looping over all available moves.
                for (let i = 0; i < freeSpaces.length; i++) {
                    // Board result of made move.
                    let result = boardCopy.moveResult("X", freeSpaces[i]);

                    // Moves value.
                    let moveValue = minimax(result, "O");

                    // If best value is found then return immediately, no need to explore other moves.
                    if (moveValue === 1) return 1;
                    // Keep looking.
                    if (moveValue > value) value = moveValue;
                }

                // Returns best value found.
                return value;
            // Min player.
            } else {
                let value = 1;

                for (let i = 0; i < freeSpaces.length; i++) {
                    let result = boardCopy.moveResult("O", freeSpaces[i]);

                    let moveValue = minimax(result, "X");

                    if (moveValue === -1) return -1;
                    if (moveValue < value) value = moveValue;
                }

                return value;
            }
        }

        // Sets the probability of making a smart move.
        switch (difficulty) {
            case "impossible":
                difficulty = 1
                break;
            
            case "hard":
                difficulty = 0.75;
                break;

            case "normal":
                difficulty = 0.5;
                break;

            case "easy":
                difficulty = 0.25;
                break;
                
            default:
                break;
        }

        play = function() {
            if (gameBoard.terminal()) return;

            let probability = Math.random();

            // Make smart move.
            if (difficulty >= probability) {
                let bestMove = null;
                let freeSpaces = gameBoard.getFreeSpaces();
                let value = team === "X"? -1:1;

                for (let i = 0; i < freeSpaces.length; i++) {
                    let result = gameBoard.moveResult(team, freeSpaces[i]);

                    let moveValue = minimax(result, team === "X"? "O":"X");

                    if (team === "X") {
                        if (moveValue > value) {
                            value = moveValue;
                            bestMove = freeSpaces[i];
                        }
                    } else {
                        if (moveValue < value) {
                            value = moveValue;
                            bestMove = freeSpaces[i];
                        }
                    }
                }

                // If there is no bestMove found make a random move.
                gameBoard.makeMove(team, bestMove === null? freeSpaces[Math.floor(Math.random() * freeSpaces.length)]:bestMove);

                changeTurn();
            // Make random move.
            } else {
                let freeSpaces = gameBoard.getFreeSpaces();

                gameBoard.makeMove(team, freeSpaces[Math.floor(Math.random() * freeSpaces.length)]);

                changeTurn();
            }
        }
    // Human.
    } else {
        play = function(move) {
            // Returns true if player made a valid move.
            if (gameBoard.makeMove(team, move)) {
                changeTurn();
                return true;
            } else {
                return false;
            }
        }
    }

    return {play, getName, getType, changeTurn, resetPlayerTurn, isPlayerTurn, getTeam};
}

// This module handles form and user input logic.
const form = (function() {
    const form = document.querySelector("form");
    const pageContainer = document.querySelector("body>div");

    const player1Difficulty = document.querySelector("#player1-difficulty");
    const player2Difficulty = document.querySelector("#player2-difficulty");

    // Hides form.
    function unfocusForm() {
        form.style.display = "none";
        pageContainer.style.filter = "blur(0)";
        player1Difficulty.disabled = true;
        player2Difficulty.disabled = true;
        form.reset();
    }

    // Shows form.
    function focusForm() {
        form.style.display = "grid";
        pageContainer.style.filter = "blur(2px)";
    }

    // Hides the form when user clicks outside the form.
    pageContainer.addEventListener("click", function() {
        unfocusForm();
    });

    // Shows the form when user clicks on the start/restart button.
    document.querySelector(".start").addEventListener("click", function(event) {
        if (!game.isDoingAsyncStuff()) {
            event.stopPropagation();
            focusForm();
        }
    });

    // Enables or disables the difficulty field based on wether the user checked human or computer. 
    document.querySelector("#player1-computer").addEventListener("click", function() {
        player1Difficulty.disabled = false;
    });
    document.querySelector("#player1-human").addEventListener("click", function() {
        player1Difficulty.disabled = true;
    });
    document.querySelector("#player2-computer").addEventListener("click", function() {
        player2Difficulty.disabled = false;
    });
    document.querySelector("#player2-human").addEventListener("click", function() {
        player2Difficulty.disabled = true;
    });

    const player1SymbolO = document.querySelector("#player1-symbol-o");
    const player2SymbolO = document.querySelector("#player2-symbol-o");
    const player1SymbolX = document.querySelector("#player1-symbol-x");
    const player2SymbolX = document.querySelector("#player2-symbol-x");

    // If a player checked a symbol it will check the opposite symbol for the other player. 
    player1SymbolO.addEventListener("click", function() {
        player2SymbolX.checked = true;
    });
    player1SymbolX.addEventListener("click", function() {
        player2SymbolO.checked = true;
    });
    player2SymbolO.addEventListener("click", function() {
        player1SymbolX.checked = true;
    });
    player2SymbolX.addEventListener("click", function() {
        player1SymbolO.checked = true;
    });

    let player1;
    let player2;

    const restartButton = document.querySelector(".restart");
    restartButton.addEventListener("click", function (event) {
       if (!game.isDoingAsyncStuff()) {
             event.stopPropagation();
             game.start(player1, player2);
       }
    });
    
    // Starts the game if the form is valid.
    document.querySelector("form>button").addEventListener("mousedown", function() {
        if (form.checkValidity()) {
            // Gets user input.
            let player1Name = document.querySelector("#player1-name").value, player2Name = document.querySelector("#player2-name").value;
            let player1Type = document.querySelector("#player1-human").checked? "h":"c", player2Type = document.querySelector("#player2-human").checked? "h":"c";
            let player1Team = document.querySelector("#player1-symbol-x").checked? "X":"O", player2Team = document.querySelector("#player2-symbol-x").checked? "X":"O";
            let player1Difficulty = document.querySelector("#player1-difficulty").value, player2Difficulty = document.querySelector("#player2-difficulty").value;

            // Creates 2 players.
            player1 = createPlayer(player1Name, player1Type, player1Team, player1Difficulty);
            player2 = createPlayer(player2Name, player2Type, player2Team, player2Difficulty);

            restartButton.style.display = "block";

            unfocusForm();

            game.start(player1, player2);
        }
    });
})();
