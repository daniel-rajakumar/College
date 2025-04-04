## Classes

<dl>
<dt><a href="#Board">Board</a></dt>
<dd><p>Represents a game board with a set of numbered squares.</p>
</dd>
<dt><a href="#Computer">Computer</a></dt>
<dd><p>Represents a computer-controlled player.
Extends the Player class with AI logic for deciding dice throws and moves.</p>
</dd>
<dt><a href="#Game">Game</a></dt>
<dd><p>Represents a single game round within a tournament.</p>
</dd>
<dt><a href="#Human">Human</a></dt>
<dd><p>The Human class represents a human-controlled player.
Extends the base Player class by providing the ability to request help from a temporary Computer instance.</p>
</dd>
<dt><a href="#Player">Player</a></dt>
<dd><p>Represents a single player within the game.
Maintains the player&#39;s board, score, and methods to determine the best move.</p>
</dd>
<dt><a href="#Tournament">Tournament</a></dt>
<dd><p>Represents a multi-round tournament for the board game.
Manages applied advantages, move history, and transitions between game states.</p>
</dd>
</dl>

## Constants

<dl>
<dt><a href="#express">express</a></dt>
<dd><p>Server-side implementation for the board game application.</p>
<p>This file handles:</p>
<ul>
<li>Game state management</li>
<li>API endpoints for frontend interactions</li>
<li>Game logic and rules enforcement</li>
<li>Tournament management</li>
</ul>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#showRegularUI">showRegularUI()</a></dt>
<dd><p>Shows the regular game UI by hiding the initial UI
Used when transitioning from start screen to main game</p>
</dd>
<dt><a href="#renderSquares">renderSquares(container, squares, advantage)</a></dt>
<dd><p>Renders squares for a player&#39;s board with visual indicators</p>
<p>Handles:</p>
<ul>
<li>Displaying covered/uncovered squares</li>
<li>Highlighting the advantage square</li>
<li>Showing protection on opponent&#39;s advantage square when applicable</li>
</ul>
</dd>
<dt><a href="#fetchGameState">fetchGameState()</a> ⇒ <code>Promise.&lt;Object&gt;</code></dt>
<dd><p>Fetches the current game state from the backend</p>
</dd>
<dt><a href="#updateUI">updateUI()</a></dt>
<dd><p>Updates all UI elements with current game state</p>
<p>This is the main function that keeps the interface in sync
with the backend game state</p>
</dd>
<dt><a href="#handleLoadGame">handleLoadGame()</a></dt>
<dd><p>Handles loading a saved game from server storage</p>
</dd>
<dt><a href="#handleNewGame">handleNewGame()</a></dt>
<dd><p>Handles starting a new game by showing configuration UI</p>
</dd>
<dt><a href="#handleRollDice">handleRollDice()</a></dt>
<dd><p>Handles the dice roll action</p>
<p>This initiates a new turn by:</p>
<ol>
<li>Sending roll request to backend</li>
<li>Processing the result</li>
<li>Updating UI based on who rolled (human/computer)</li>
</ol>
</dd>
<dt><a href="#handleHelp">handleHelp()</a></dt>
<dd><p>Handles requesting help from the computer
Shows suggested moves for human players</p>
</dd>
<dt><a href="#handleSaveGame">handleSaveGame()</a></dt>
<dd><p>Handles saving the current game state to server storage</p>
</dd>
<dt><a href="#handleApplyConfig">handleApplyConfig()</a></dt>
<dd><p>Handles applying game configuration settings</p>
<p>Sends board size and player types to backend
to initialize a new game</p>
</dd>
<dt><a href="#handleFirstTurnRoll">handleFirstTurnRoll()</a></dt>
<dd><p>Handles rolling for first turn determination</p>
<p>Both players roll a die, higher roll goes first
Handles tie cases by prompting to roll again</p>
</dd>
<dt><a href="#handleStartGame">handleStartGame()</a></dt>
<dd><p>Handles starting the game after first turn is determined</p>
<p>Transitions from first roll screen to main game interface</p>
</dd>
<dt><a href="#handleInputDice">handleInputDice()</a></dt>
<dd><p>Handles opening the manual dice input modal</p>
<p>Checks if single die mode is allowed before showing options</p>
</dd>
<dt><a href="#closeDiceModal">closeDiceModal()</a></dt>
<dd><p>Closes the dice input modal</p>
</dd>
<dt><a href="#handleSubmitDice">handleSubmitDice()</a></dt>
<dd><p>Handles submitting manually entered dice values</p>
<p>Validates input before sending to backend</p>
</dd>
<dt><a href="#handleConfirmValidRolls">handleConfirmValidRolls()</a></dt>
<dd><p>Handles confirming selected valid moves</p>
<p>Sends the player&#39;s move choice to backend</p>
</dd>
<dt><a href="#handleFileUpload">handleFileUpload(event)</a></dt>
<dd><p>Handles uploading a saved game file</p>
<p>Parses the file and sends to backend to load game state</p>
</dd>
<dt><a href="#handleToggleSwitch">handleToggleSwitch()</a></dt>
<dd><p>Handles toggle switch changes between cover/uncover modes</p>
</dd>
<dt><a href="#handleExitGame">handleExitGame()</a></dt>
<dd><p>Handles exiting the game and showing winner</p>
</dd>
<dt><a href="#handlePlayAgain">handlePlayAgain()</a></dt>
<dd><p>Handles playing the game again with same settings</p>
<p>Preserves previous game configuration</p>
</dd>
<dt><a href="#handleConfirmRewind">handleConfirmRewind()</a></dt>
<dd><p>Handles confirming rewind to selected move</p>
</dd>
<dt><a href="#closeRewindModal">closeRewindModal()</a></dt>
<dd><p>Closes the rewind history modal</p>
</dd>
<dt><a href="#handleUseOneDieChange">handleUseOneDieChange()</a></dt>
<dd><p>Handles changes to the &quot;use one die&quot; checkbox</p>
<p>Disables/enables the second die input accordingly</p>
</dd>
<dt><a href="#validRolls">validRolls(validMove, toCover)</a></dt>
<dd><p>Processes valid rolls selection</p>
<p>Sends the selected move to backend for validation and processing</p>
</dd>
<dt><a href="#afterValidRoll">afterValidRoll(data)</a></dt>
<dd><p>Updates UI after valid rolls are processed</p>
<p>Handles transition between move phases and game over state</p>
</dd>
<dt><a href="#showStartUI">showStartUI()</a></dt>
<dd><p>Shows the start UI screen with game title and options</p>
</dd>
<dt><a href="#showConfigUI">showConfigUI(screen)</a></dt>
<dd><p>Shows the configuration UI screen</p>
</dd>
<dt><a href="#showLiveGameUI">showLiveGameUI()</a></dt>
<dd><p>Shows the live game UI screen with all game controls</p>
</dd>
<dt><a href="#afterDieRoll">afterDieRoll(data)</a></dt>
<dd><p>Processes the game state after dice are rolled</p>
<p>Handles:</p>
<ul>
<li>Computer moves automatically</li>
<li>Shows valid moves for human players</li>
<li>Updates UI elements accordingly</li>
</ul>
</dd>
<dt><a href="#populateStringSelect">populateStringSelect(strings)</a></dt>
<dd><p>Populates the valid moves dropdown with available options</p>
<p>Filters out invalid moves based on advantage square rules</p>
</dd>
<dt><a href="#saveGame">saveGame()</a></dt>
<dd><p>Saves the current game state to a local file</p>
<p>Creates a text file containing all game state information</p>
</dd>
<dt><a href="#parseGameState">parseGameState(content)</a> ⇒ <code>Object</code></dt>
<dd><p>Parses game state from file content</p>
<p>Extracts:</p>
<ul>
<li>Player board states</li>
<li>Scores</li>
<li>Turn information</li>
</ul>
</dd>
<dt><a href="#canThrowOneDie">canThrowOneDie()</a> ⇒ <code>Promise.&lt;boolean&gt;</code></dt>
<dd><p>Checks if one die can be thrown according to game rules</p>
</dd>
<dt><a href="#showRewindModal">showRewindModal()</a></dt>
<dd><p>Shows the rewind modal with move history</p>
</dd>
<dt><a href="#populateMoveHistory">populateMoveHistory(history)</a></dt>
<dd><p>Populates the move history list in the rewind modal</p>
</dd>
<dt><a href="#getMoveSummary">getMoveSummary(move)</a> ⇒ <code>string</code></dt>
<dd><p>Generates a summary string for a move</p>
</dd>
<dt><a href="#updateMoveDetails">updateMoveDetails(move)</a></dt>
<dd><p>Updates move details in the rewind modal</p>
</dd>
<dt><a href="#renderMoveSquares">renderMoveSquares(elementId, squares, advantageSquare)</a></dt>
<dd><p>Renders squares for a move detail view</p>
</dd>
<dt><a href="#canUncoverAdvantageSquare">canUncoverAdvantageSquare()</a> ⇒ <code>Promise.&lt;boolean&gt;</code></dt>
<dd><p>Checks if the advantage square can be uncovered</p>
<p>Determines if the current player is allowed to uncover
the opponent&#39;s advantage square</p>
</dd>
</dl>

<a name="Board"></a>

## Board
Represents a game board with a set of numbered squares.

**Kind**: global class  

* [Board](#Board)
    * [new Board(size)](#new_Board_new)
    * [.coverSquare(index)](#Board+coverSquare)
    * [.uncoverSquare(index)](#Board+uncoverSquare)
    * [.getSquares()](#Board+getSquares) ⇒ <code>Array.&lt;number&gt;</code>
    * [.setSquareValues(values)](#Board+setSquareValues)
    * [.isSquareCovered(index)](#Board+isSquareCovered) ⇒ <code>boolean</code>
    * [.allCovered()](#Board+allCovered) ⇒ <code>boolean</code>
    * [.allUncovered()](#Board+allUncovered) ⇒ <code>boolean</code>
    * [.getCoveredSum()](#Board+getCoveredSum) ⇒ <code>number</code>
    * [.getUncoveredSum()](#Board+getUncoveredSum) ⇒ <code>number</code>
    * [.findValidCombinations(sum, forCovering)](#Board+findValidCombinations) ⇒ <code>Array.&lt;Array.&lt;number&gt;&gt;</code>
    * [.isValidCombination(combination, forCovering)](#Board+isValidCombination) ⇒ <code>boolean</code>

<a name="new_Board_new"></a>

### new Board(size)
Creates a new Board instance.


| Param | Type | Description |
| --- | --- | --- |
| size | <code>number</code> | The number of squares on the board. |

<a name="Board+coverSquare"></a>

### board.coverSquare(index)
Covers the specified square, marking it as 0.

**Kind**: instance method of [<code>Board</code>](#Board)  

| Param | Type | Description |
| --- | --- | --- |
| index | <code>number</code> | The square number to cover (1-indexed). |

<a name="Board+uncoverSquare"></a>

### board.uncoverSquare(index)
Uncovers the specified square, restoring its original number.

**Kind**: instance method of [<code>Board</code>](#Board)  

| Param | Type | Description |
| --- | --- | --- |
| index | <code>number</code> | The square number to uncover (1-indexed). |

<a name="Board+getSquares"></a>

### board.getSquares() ⇒ <code>Array.&lt;number&gt;</code>
Retrieves the current values of the board squares.

**Kind**: instance method of [<code>Board</code>](#Board)  
**Returns**: <code>Array.&lt;number&gt;</code> - An array representing the board squares.  
<a name="Board+setSquareValues"></a>

### board.setSquareValues(values)
Sets the board squares to the provided values.

**Kind**: instance method of [<code>Board</code>](#Board)  
**Throws**:

- <code>Error</code> If the length of values does not match the board size.


| Param | Type | Description |
| --- | --- | --- |
| values | <code>Array.&lt;number&gt;</code> | An array of values; its length must equal the board size. |

<a name="Board+isSquareCovered"></a>

### board.isSquareCovered(index) ⇒ <code>boolean</code>
Determines if a specific square is covered.

**Kind**: instance method of [<code>Board</code>](#Board)  
**Returns**: <code>boolean</code> - True if the square is covered (i.e. value is 0), false otherwise.  

| Param | Type | Description |
| --- | --- | --- |
| index | <code>number</code> | The square number to check (1-indexed). |

<a name="Board+allCovered"></a>

### board.allCovered() ⇒ <code>boolean</code>
Checks if all squares on the board are covered.

**Kind**: instance method of [<code>Board</code>](#Board)  
**Returns**: <code>boolean</code> - True if every square is 0, false otherwise.  
<a name="Board+allUncovered"></a>

### board.allUncovered() ⇒ <code>boolean</code>
Checks if all squares on the board are uncovered.

**Kind**: instance method of [<code>Board</code>](#Board)  
**Returns**: <code>boolean</code> - True if every square is not 0, false otherwise.  
<a name="Board+getCoveredSum"></a>

### board.getCoveredSum() ⇒ <code>number</code>
Calculates the sum of indices for all covered squares.

**Kind**: instance method of [<code>Board</code>](#Board)  
**Returns**: <code>number</code> - The total sum of the positions of covered squares.  
<a name="Board+getUncoveredSum"></a>

### board.getUncoveredSum() ⇒ <code>number</code>
Calculates the sum of indices for all uncovered squares.

**Kind**: instance method of [<code>Board</code>](#Board)  
**Returns**: <code>number</code> - The total sum of the positions of uncovered squares.  
<a name="Board+findValidCombinations"></a>

### board.findValidCombinations(sum, forCovering) ⇒ <code>Array.&lt;Array.&lt;number&gt;&gt;</code>
Finds all valid combinations of square numbers that sum to a given target.
Takes into account board state and advantage restrictions.

**Kind**: instance method of [<code>Board</code>](#Board)  
**Returns**: <code>Array.&lt;Array.&lt;number&gt;&gt;</code> - An array of valid square combinations.  

| Param | Type | Description |
| --- | --- | --- |
| sum | <code>number</code> | The target sum for the combination. |
| forCovering | <code>boolean</code> | True if finding combinations for covering squares,                                false if for uncovering squares. |

<a name="Board+isValidCombination"></a>

### board.isValidCombination(combination, forCovering) ⇒ <code>boolean</code>
Validates whether a given combination of squares is allowed.
Checks both covering logic and advantage rules.

**Kind**: instance method of [<code>Board</code>](#Board)  
**Returns**: <code>boolean</code> - True if the combination is valid, false otherwise.  

| Param | Type | Description |
| --- | --- | --- |
| combination | <code>Array.&lt;number&gt;</code> | The combination of square numbers. |
| forCovering | <code>boolean</code> | True if the combination is for covering squares,                                false if for uncovering squares. |

<a name="Computer"></a>

## Computer
Represents a computer-controlled player.
Extends the Player class with AI logic for deciding dice throws and moves.

**Kind**: global class  

* [Computer](#Computer)
    * [new Computer(board)](#new_Computer_new)
    * [.decideDiceThrow()](#Computer+decideDiceThrow) ⇒ <code>number</code>
    * [.chooseMove(diceSum, opponentBoard)](#Computer+chooseMove) ⇒ <code>Object</code>
    * [.suggestMove(diceSum, opponentBoard)](#Computer+suggestMove) ⇒ <code>Object</code>
    * [.findBestCombination(board, sum, forCovering)](#Computer+findBestCombination) ⇒ <code>Array.&lt;Array.&lt;number&gt;&gt;</code>
    * [.selectBestCombination(combinations)](#Computer+selectBestCombination) ⇒ <code>Array.&lt;number&gt;</code>
    * [.takeTurn(diceSum, opponentBoard)](#Computer+takeTurn) ⇒ <code>Object</code>
    * [.selectWinningCombination(combinations, opponentBoard)](#Computer+selectWinningCombination) ⇒ <code>Array.&lt;number&gt;</code>

<a name="new_Computer_new"></a>

### new Computer(board)
Initializes a new instance of the Computer class.


| Param | Type | Description |
| --- | --- | --- |
| board | [<code>Board</code>](#Board) | The board assigned to this computer player. |

<a name="Computer+decideDiceThrow"></a>

### computer.decideDiceThrow() ⇒ <code>number</code>
Decides whether to throw one die or two dice.
Examines squares 7 to N on the board; if all are covered, returns 1, otherwise 2.

**Kind**: instance method of [<code>Computer</code>](#Computer)  
**Returns**: <code>number</code> - 1 if using one die, 2 otherwise.  
<a name="Computer+chooseMove"></a>

### computer.chooseMove(diceSum, opponentBoard) ⇒ <code>Object</code>
Chooses a move based on the dice sum and the current state of the opponent's board.
Prioritizes winning by uncovering, then covering own squares, then uncovering opponent's squares.

**Kind**: instance method of [<code>Computer</code>](#Computer)  
**Returns**: <code>Object</code> - An object describing the chosen move.
                  { action: string, combination: number[], reason: string }.  

| Param | Type | Description |
| --- | --- | --- |
| diceSum | <code>number</code> | The sum of the dice. |
| opponentBoard | [<code>Board</code>](#Board) | The opponent's board object. |

<a name="Computer+suggestMove"></a>

### computer.suggestMove(diceSum, opponentBoard) ⇒ <code>Object</code>
Suggests a move for help by delegating to chooseMove.
This is useful for a hint feature.

**Kind**: instance method of [<code>Computer</code>](#Computer)  
**Returns**: <code>Object</code> - A suggested move object.  

| Param | Type | Description |
| --- | --- | --- |
| diceSum | <code>number</code> | The sum of the dice. |
| opponentBoard | [<code>Board</code>](#Board) | The opponent's board. |

<a name="Computer+findBestCombination"></a>

### computer.findBestCombination(board, sum, forCovering) ⇒ <code>Array.&lt;Array.&lt;number&gt;&gt;</code>
Finds all valid combinations of squares on the given board that sum to the given value.
Uses a backtracking approach and considers advantage constraints if applicable.

**Kind**: instance method of [<code>Computer</code>](#Computer)  
**Returns**: <code>Array.&lt;Array.&lt;number&gt;&gt;</code> - An array of square combinations.  

| Param | Type | Description |
| --- | --- | --- |
| board | [<code>Board</code>](#Board) | The board on which to find combinations. |
| sum | <code>number</code> | The target sum for the combination. |
| forCovering | <code>boolean</code> | True if finding combinations for covering squares, false for uncovering. |

<a name="Computer+selectBestCombination"></a>

### computer.selectBestCombination(combinations) ⇒ <code>Array.&lt;number&gt;</code>
Selects the best combination from an array of valid combinations.
Criteria: the combination with the highest length,
and if equal, the one with the highest total sum.

**Kind**: instance method of [<code>Computer</code>](#Computer)  
**Returns**: <code>Array.&lt;number&gt;</code> - The selected best combination.  

| Param | Type | Description |
| --- | --- | --- |
| combinations | <code>Array.&lt;Array.&lt;number&gt;&gt;</code> | An array of valid square combinations. |

<a name="Computer+takeTurn"></a>

### computer.takeTurn(diceSum, opponentBoard) ⇒ <code>Object</code>
Executes this computer player's turn.
Decides on a move and applies it to the board accordingly.

**Kind**: instance method of [<code>Computer</code>](#Computer)  
**Returns**: <code>Object</code> - The move object that was executed.  

| Param | Type | Description |
| --- | --- | --- |
| diceSum | <code>number</code> | The sum of the dice. |
| opponentBoard | [<code>Board</code>](#Board) | The opponent's board. |

<a name="Computer+selectWinningCombination"></a>

### computer.selectWinningCombination(combinations, opponentBoard) ⇒ <code>Array.&lt;number&gt;</code>
From a list of combinations, selects a winning combination if it exists.
A winning combination is one which, when applied, results in the opponent's board being fully uncovered.

**Kind**: instance method of [<code>Computer</code>](#Computer)  
**Returns**: <code>Array.&lt;number&gt;</code> - The winning combination if available, otherwise the best combination.  

| Param | Type | Description |
| --- | --- | --- |
| combinations | <code>Array.&lt;Array.&lt;number&gt;&gt;</code> | The array of possible combinations. |
| opponentBoard | [<code>Board</code>](#Board) | The opponent's board object. |

<a name="Game"></a>

## Game
Represents a single game round within a tournament.

**Kind**: global class  

* [Game](#Game)
    * [new Game(tournament, [boardSize], [player1Type], [player2Type])](#new_Game_new)
    * [.rollDice()](#Game+rollDice)
    * [.switchTurn()](#Game+switchTurn)
    * [.setScreen(screen)](#Game+setScreen)
    * [.getDice()](#Game+getDice) ⇒ <code>Object</code>
    * [.setDice([dice1], [dice2])](#Game+setDice)
    * [.isGameOver()](#Game+isGameOver) ⇒ <code>string</code> \| <code>null</code>
    * [.declareTournamentWinner()](#Game+declareTournamentWinner) ⇒ <code>string</code>
    * [.declareWinner()](#Game+declareWinner) ⇒ <code>string</code> \| <code>null</code>
    * [.resetGame()](#Game+resetGame)
    * [.getState()](#Game+getState) ⇒ <code>Object</code>

<a name="new_Game_new"></a>

### new Game(tournament, [boardSize], [player1Type], [player2Type])
Initializes a new Game instance.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| tournament | [<code>Tournament</code>](#Tournament) |  | The tournament context. |
| [boardSize] | <code>number</code> | <code>11</code> | The number of squares on the board. |
| [player1Type] | <code>string</code> | <code>&quot;\&quot;human\&quot;&quot;</code> | The type for player1 ("human" or "computer"). |
| [player2Type] | <code>string</code> | <code>&quot;\&quot;computer\&quot;&quot;</code> | The type for player2 ("human" or "computer"). |

<a name="Game+rollDice"></a>

### game.rollDice()
Rolls two dice and updates the dice property.

**Kind**: instance method of [<code>Game</code>](#Game)  
<a name="Game+switchTurn"></a>

### game.switchTurn()
Switches the current player after a turn.
Also records that the player has taken their first turn.

**Kind**: instance method of [<code>Game</code>](#Game)  
<a name="Game+setScreen"></a>

### game.setScreen(screen)
Sets the current screen of the game.

**Kind**: instance method of [<code>Game</code>](#Game)  

| Param | Type | Description |
| --- | --- | --- |
| screen | <code>string</code> | The screen value ("START", "PLAY", etc.). |

<a name="Game+getDice"></a>

### game.getDice() ⇒ <code>Object</code>
Retrieves the current dice object.

**Kind**: instance method of [<code>Game</code>](#Game)  
**Returns**: <code>Object</code> - The dice values.  
<a name="Game+setDice"></a>

### game.setDice([dice1], [dice2])
Sets the dice values with given numbers.

**Kind**: instance method of [<code>Game</code>](#Game)  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| [dice1] | <code>number</code> | <code>0</code> | The value for dice1. |
| [dice2] | <code>number</code> | <code>0</code> | The value for dice2. |

<a name="Game+isGameOver"></a>

### game.isGameOver() ⇒ <code>string</code> \| <code>null</code>
Checks if the game is over by examining both player's boards.
The game is not considered over if either player has not taken a turn.

**Kind**: instance method of [<code>Game</code>](#Game)  
**Returns**: <code>string</code> \| <code>null</code> - Returns "player1" or "player2" if that player wins; otherwise, returns null.  
<a name="Game+declareTournamentWinner"></a>

### game.declareTournamentWinner() ⇒ <code>string</code>
Declares the tournament winner based on player scores.

**Kind**: instance method of [<code>Game</code>](#Game)  
**Returns**: <code>string</code> - Returns "player1", "player2", or "draw".  
<a name="Game+declareWinner"></a>

### game.declareWinner() ⇒ <code>string</code> \| <code>null</code>
Declares the winner of the current game round, updates scores, and resets the game.
Also records advantage data if part of a tournament.

**Kind**: instance method of [<code>Game</code>](#Game)  
**Returns**: <code>string</code> \| <code>null</code> - Returns the winner ("player1" or "player2") or null if the game continues.  
<a name="Game+resetGame"></a>

### game.resetGame()
Resets the game state for a new round.
Creates new boards for both players, resets turn and game over status.

**Kind**: instance method of [<code>Game</code>](#Game)  
<a name="Game+getState"></a>

### game.getState() ⇒ <code>Object</code>
Retrieves the current state of the game.

**Kind**: instance method of [<code>Game</code>](#Game)  
**Returns**: <code>Object</code> - An object containing player details, current turn, dice, screen, advantage, and board size.  
<a name="Human"></a>

## Human
The Human class represents a human-controlled player.
Extends the base Player class by providing the ability to request help from a temporary Computer instance.

**Kind**: global class  

* [Human](#Human)
    * [new Human(board)](#new_Human_new)
    * [.type](#Human+type) : <code>string</code>
    * [.requestHelp(diceSum, opponentBoard)](#Human+requestHelp) ⇒ <code>Object</code>

<a name="new_Human_new"></a>

### new Human(board)
Initializes a new instance of the Human class.


| Param | Type | Description |
| --- | --- | --- |
| board | [<code>Board</code>](#Board) | The board assigned to this human player. |

<a name="Human+type"></a>

### human.type : <code>string</code>
Identifies the type of this player as "human".

**Kind**: instance property of [<code>Human</code>](#Human)  
<a name="Human+requestHelp"></a>

### human.requestHelp(diceSum, opponentBoard) ⇒ <code>Object</code>
Requests a suggested move from a Computer instance.
Useful as a "hint" or "help" feature for the human player.

**Kind**: instance method of [<code>Human</code>](#Human)  
**Returns**: <code>Object</code> - A suggested action object (cover/uncover, squares, and reason).  

| Param | Type | Description |
| --- | --- | --- |
| diceSum | <code>number</code> | The sum of dice values rolled. |
| opponentBoard | [<code>Board</code>](#Board) | The opponent’s board object. |

<a name="Player"></a>

## Player
Represents a single player within the game.
Maintains the player's board, score, and methods to determine the best move.

**Kind**: global class  

* [Player](#Player)
    * [new Player(board, tournament)](#new_Player_new)
    * [.tournament](#Player+tournament) : [<code>Tournament</code>](#Tournament)
    * [.board](#Player+board) : [<code>Board</code>](#Board)
    * [.score](#Player+score) : <code>number</code>
    * [.hasFirstTurnBeenPlayed](#Player+hasFirstTurnBeenPlayed) : <code>boolean</code>
    * [.getScore()](#Player+getScore) ⇒ <code>number</code>
    * [.updateScore(points)](#Player+updateScore)
    * [.chooseMove(diceSum, opponentBoard)](#Player+chooseMove) ⇒ <code>Object</code>

<a name="new_Player_new"></a>

### new Player(board, tournament)
Initializes a new Player instance.


| Param | Type | Description |
| --- | --- | --- |
| board | [<code>Board</code>](#Board) | The board belonging to this player. |
| tournament | [<code>Tournament</code>](#Tournament) | The tournament context or controller. |

<a name="Player+tournament"></a>

### player.tournament : [<code>Tournament</code>](#Tournament)
Reference to the tournament controlling this game.

**Kind**: instance property of [<code>Player</code>](#Player)  
<a name="Player+board"></a>

### player.board : [<code>Board</code>](#Board)
The board owned by this player.

**Kind**: instance property of [<code>Player</code>](#Player)  
<a name="Player+score"></a>

### player.score : <code>number</code>
The player's current score.

**Kind**: instance property of [<code>Player</code>](#Player)  
<a name="Player+hasFirstTurnBeenPlayed"></a>

### player.hasFirstTurnBeenPlayed : <code>boolean</code>
Flag indicating whether the player has taken at least one turn.

**Kind**: instance property of [<code>Player</code>](#Player)  
<a name="Player+getScore"></a>

### player.getScore() ⇒ <code>number</code>
Retrieves the current score of this player.

**Kind**: instance method of [<code>Player</code>](#Player)  
**Returns**: <code>number</code> - The player's current score.  
<a name="Player+updateScore"></a>

### player.updateScore(points)
Increment the player's score by a specified number of points.

**Kind**: instance method of [<code>Player</code>](#Player)  

| Param | Type | Description |
| --- | --- | --- |
| points | <code>number</code> | Number of points to add to the current score. |

<a name="Player+chooseMove"></a>

### player.chooseMove(diceSum, opponentBoard) ⇒ <code>Object</code>
Chooses the best move based on the dice sum and the opponent's board state.
Attempts to cover the player's own squares first if beneficial; otherwise,
tries to uncover the opponent's squares. If no moves are available, returns "none."

**Kind**: instance method of [<code>Player</code>](#Player)  
**Returns**: <code>Object</code> - An object describing the chosen action, the squares combination, and the reason.  

| Param | Type | Description |
| --- | --- | --- |
| diceSum | <code>number</code> | The sum of the dice rolled. |
| opponentBoard | [<code>Board</code>](#Board) | The board object belonging to the opponent. |

<a name="Tournament"></a>

## Tournament
Represents a multi-round tournament for the board game.
Manages applied advantages, move history, and transitions between game states.

**Kind**: global class  

* [Tournament](#Tournament)
    * [new Tournament()](#new_Tournament_new)
    * [.setFirstPlayer(player)](#Tournament+setFirstPlayer)
    * [.loadGame(tournament, state)](#Tournament+loadGame)
    * [.getAdvantageSquare()](#Tournament+getAdvantageSquare) ⇒ <code>number</code> \| <code>null</code>
    * [.getAdvantageApplied()](#Tournament+getAdvantageApplied) ⇒ <code>boolean</code>
    * [.getAdvantagePlayer()](#Tournament+getAdvantagePlayer) ⇒ <code>string</code> \| <code>null</code>
    * [.calculateAdvantageSquare(score)](#Tournament+calculateAdvantageSquare) ⇒ <code>number</code>
    * [.applyAdvantage(winner, winnerScore)](#Tournament+applyAdvantage)
    * [.canUncoverAdvantage(currentPlayer)](#Tournament+canUncoverAdvantage) ⇒ <code>boolean</code>
    * [.recordTurn(player)](#Tournament+recordTurn)
    * [.clearAdvantage()](#Tournament+clearAdvantage)
    * [.getState()](#Tournament+getState) ⇒ <code>Object</code>
    * [.rewindToMove(index)](#Tournament+rewindToMove) ⇒ <code>boolean</code>
    * [.saveMoveSnapshot()](#Tournament+saveMoveSnapshot)

<a name="new_Tournament_new"></a>

### new Tournament()
Initializes the Tournament with a new Game instance
and default advantage properties.

<a name="Tournament+setFirstPlayer"></a>

### tournament.setFirstPlayer(player)
Sets which player started first in this tournament.

**Kind**: instance method of [<code>Tournament</code>](#Tournament)  

| Param | Type | Description |
| --- | --- | --- |
| player | <code>string</code> | "player1" or "player2" indicating the first player. |

<a name="Tournament+loadGame"></a>

### tournament.loadGame(tournament, state)
Loads a previously saved or newly created game into the tournament.

**Kind**: instance method of [<code>Tournament</code>](#Tournament)  

| Param | Type | Description |
| --- | --- | --- |
| tournament | [<code>Tournament</code>](#Tournament) | The current tournament context. |
| state | <code>Object</code> | The saved state for loading. |

<a name="Tournament+getAdvantageSquare"></a>

### tournament.getAdvantageSquare() ⇒ <code>number</code> \| <code>null</code>
Retrieves the currently assigned advantage square number.

**Kind**: instance method of [<code>Tournament</code>](#Tournament)  
**Returns**: <code>number</code> \| <code>null</code> - The advantage square number or null if not set.  
<a name="Tournament+getAdvantageApplied"></a>

### tournament.getAdvantageApplied() ⇒ <code>boolean</code>
Determines whether advantage is currently applied.

**Kind**: instance method of [<code>Tournament</code>](#Tournament)  
**Returns**: <code>boolean</code> - True if advantage is applied, false otherwise.  
<a name="Tournament+getAdvantagePlayer"></a>

### tournament.getAdvantagePlayer() ⇒ <code>string</code> \| <code>null</code>
Retrieves the player who has the advantage.

**Kind**: instance method of [<code>Tournament</code>](#Tournament)  
**Returns**: <code>string</code> \| <code>null</code> - "player1" or "player2" if advantage is active, null otherwise.  
<a name="Tournament+calculateAdvantageSquare"></a>

### tournament.calculateAdvantageSquare(score) ⇒ <code>number</code>
Calculates which square should be advantaged based on a score.
Sums the digits of the player's score; if 0, returns 1.

**Kind**: instance method of [<code>Tournament</code>](#Tournament)  
**Returns**: <code>number</code> - The calculated square number.  

| Param | Type | Description |
| --- | --- | --- |
| score | <code>number</code> | The player's current score. |

<a name="Tournament+applyAdvantage"></a>

### tournament.applyAdvantage(winner, winnerScore)
Applies advantage to the opponent if the winner is the same as the first player,
otherwise applies advantage to the winner itself.
Covers the advantage square on the opponent's board.

**Kind**: instance method of [<code>Tournament</code>](#Tournament)  

| Param | Type | Description |
| --- | --- | --- |
| winner | <code>string</code> | "player1" or "player2" who won the round. |
| winnerScore | <code>number</code> | Score of the round winner. |

<a name="Tournament+canUncoverAdvantage"></a>

### tournament.canUncoverAdvantage(currentPlayer) ⇒ <code>boolean</code>
Determines if the advantage square can be uncovered based on the current player
and whether they have already taken a turn since advantage was applied.

**Kind**: instance method of [<code>Tournament</code>](#Tournament)  
**Returns**: <code>boolean</code> - True if uncovered is allowed, false otherwise.  

| Param | Type | Description |
| --- | --- | --- |
| currentPlayer | <code>string</code> | The active player ("player1" or "player2"). |

<a name="Tournament+recordTurn"></a>

### tournament.recordTurn(player)
Records that the advantage-holding player has taken a turn.

**Kind**: instance method of [<code>Tournament</code>](#Tournament)  

| Param | Type | Description |
| --- | --- | --- |
| player | <code>string</code> | "player1" or "player2" who took the turn. |

<a name="Tournament+clearAdvantage"></a>

### tournament.clearAdvantage()
Completely clears the advantage state.

**Kind**: instance method of [<code>Tournament</code>](#Tournament)  
<a name="Tournament+getState"></a>

### tournament.getState() ⇒ <code>Object</code>
Returns the full state of the current game along with advantage info.

**Kind**: instance method of [<code>Tournament</code>](#Tournament)  
**Returns**: <code>Object</code> - Combined state of game and advantage.  
<a name="Tournament+rewindToMove"></a>

### tournament.rewindToMove(index) ⇒ <code>boolean</code>
Rewinds the game to a specific move index in the history, if valid.

**Kind**: instance method of [<code>Tournament</code>](#Tournament)  
**Returns**: <code>boolean</code> - True if successfully rewound, else false.  

| Param | Type | Description |
| --- | --- | --- |
| index | <code>number</code> | Index of the move to rewind to. |

<a name="Tournament+saveMoveSnapshot"></a>

### tournament.saveMoveSnapshot()
Records the current game state into the move history stack.

**Kind**: instance method of [<code>Tournament</code>](#Tournament)  
<a name="express"></a>

## express
Server-side implementation for the board game application.

This file handles:
- Game state management
- API endpoints for frontend interactions
- Game logic and rules enforcement
- Tournament management

**Kind**: global constant  
<a name="showRegularUI"></a>

## showRegularUI()
Shows the regular game UI by hiding the initial UI
Used when transitioning from start screen to main game

**Kind**: global function  
<a name="renderSquares"></a>

## renderSquares(container, squares, advantage)
Renders squares for a player's board with visual indicators

Handles:
- Displaying covered/uncovered squares
- Highlighting the advantage square
- Showing protection on opponent's advantage square when applicable

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| container | <code>HTMLElement</code> | DOM element to render into |
| squares | <code>Array.&lt;number&gt;</code> | Current square states (0 = covered) |
| advantage | <code>number</code> | Position of advantage square (1-based) or -1 if none |

<a name="fetchGameState"></a>

## fetchGameState() ⇒ <code>Promise.&lt;Object&gt;</code>
Fetches the current game state from the backend

**Kind**: global function  
**Returns**: <code>Promise.&lt;Object&gt;</code> - The game state object containing:
- Player boards
- Scores
- Current turn
- Advantage status  
<a name="updateUI"></a>

## updateUI()
Updates all UI elements with current game state

This is the main function that keeps the interface in sync
with the backend game state

**Kind**: global function  
<a name="handleLoadGame"></a>

## handleLoadGame()
Handles loading a saved game from server storage

**Kind**: global function  
<a name="handleNewGame"></a>

## handleNewGame()
Handles starting a new game by showing configuration UI

**Kind**: global function  
<a name="handleRollDice"></a>

## handleRollDice()
Handles the dice roll action

This initiates a new turn by:
1. Sending roll request to backend
2. Processing the result
3. Updating UI based on who rolled (human/computer)

**Kind**: global function  
<a name="handleHelp"></a>

## handleHelp()
Handles requesting help from the computer
Shows suggested moves for human players

**Kind**: global function  
<a name="handleSaveGame"></a>

## handleSaveGame()
Handles saving the current game state to server storage

**Kind**: global function  
<a name="handleApplyConfig"></a>

## handleApplyConfig()
Handles applying game configuration settings

Sends board size and player types to backend
to initialize a new game

**Kind**: global function  
<a name="handleFirstTurnRoll"></a>

## handleFirstTurnRoll()
Handles rolling for first turn determination

Both players roll a die, higher roll goes first
Handles tie cases by prompting to roll again

**Kind**: global function  
<a name="handleStartGame"></a>

## handleStartGame()
Handles starting the game after first turn is determined

Transitions from first roll screen to main game interface

**Kind**: global function  
<a name="handleInputDice"></a>

## handleInputDice()
Handles opening the manual dice input modal

Checks if single die mode is allowed before showing options

**Kind**: global function  
<a name="closeDiceModal"></a>

## closeDiceModal()
Closes the dice input modal

**Kind**: global function  
<a name="handleSubmitDice"></a>

## handleSubmitDice()
Handles submitting manually entered dice values

Validates input before sending to backend

**Kind**: global function  
<a name="handleConfirmValidRolls"></a>

## handleConfirmValidRolls()
Handles confirming selected valid moves

Sends the player's move choice to backend

**Kind**: global function  
<a name="handleFileUpload"></a>

## handleFileUpload(event)
Handles uploading a saved game file

Parses the file and sends to backend to load game state

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| event | <code>Event</code> | The file input change event |

<a name="handleToggleSwitch"></a>

## handleToggleSwitch()
Handles toggle switch changes between cover/uncover modes

**Kind**: global function  
<a name="handleExitGame"></a>

## handleExitGame()
Handles exiting the game and showing winner

**Kind**: global function  
<a name="handlePlayAgain"></a>

## handlePlayAgain()
Handles playing the game again with same settings

Preserves previous game configuration

**Kind**: global function  
<a name="handleConfirmRewind"></a>

## handleConfirmRewind()
Handles confirming rewind to selected move

**Kind**: global function  
<a name="closeRewindModal"></a>

## closeRewindModal()
Closes the rewind history modal

**Kind**: global function  
<a name="handleUseOneDieChange"></a>

## handleUseOneDieChange()
Handles changes to the "use one die" checkbox

Disables/enables the second die input accordingly

**Kind**: global function  
<a name="validRolls"></a>

## validRolls(validMove, toCover)
Processes valid rolls selection

Sends the selected move to backend for validation and processing

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| validMove | <code>string</code> | The selected valid move |
| toCover | <code>boolean</code> | Whether to cover or uncover squares |

<a name="afterValidRoll"></a>

## afterValidRoll(data)
Updates UI after valid rolls are processed

Handles transition between move phases and game over state

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> | Game state data after processing valid rolls |

<a name="showStartUI"></a>

## showStartUI()
Shows the start UI screen with game title and options

**Kind**: global function  
<a name="showConfigUI"></a>

## showConfigUI(screen)
Shows the configuration UI screen

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| screen | <code>string</code> | The screen to show ("CONFIG" or "LOAD") |

<a name="showLiveGameUI"></a>

## showLiveGameUI()
Shows the live game UI screen with all game controls

**Kind**: global function  
<a name="afterDieRoll"></a>

## afterDieRoll(data)
Processes the game state after dice are rolled

Handles:
- Computer moves automatically
- Shows valid moves for human players
- Updates UI elements accordingly

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| data | <code>Object</code> | Game state from backend after rolling |

<a name="populateStringSelect"></a>

## populateStringSelect(strings)
Populates the valid moves dropdown with available options

Filters out invalid moves based on advantage square rules

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| strings | <code>Array.&lt;string&gt;</code> | Array of valid move strings |

<a name="saveGame"></a>

## saveGame()
Saves the current game state to a local file

Creates a text file containing all game state information

**Kind**: global function  
<a name="parseGameState"></a>

## parseGameState(content) ⇒ <code>Object</code>
Parses game state from file content

Extracts:
- Player board states
- Scores
- Turn information

**Kind**: global function  
**Returns**: <code>Object</code> - The parsed game state object  

| Param | Type | Description |
| --- | --- | --- |
| content | <code>string</code> | The file content to parse |

<a name="canThrowOneDie"></a>

## canThrowOneDie() ⇒ <code>Promise.&lt;boolean&gt;</code>
Checks if one die can be thrown according to game rules

**Kind**: global function  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - Whether one die can be thrown  
<a name="showRewindModal"></a>

## showRewindModal()
Shows the rewind modal with move history

**Kind**: global function  
<a name="populateMoveHistory"></a>

## populateMoveHistory(history)
Populates the move history list in the rewind modal

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| history | <code>Array.&lt;Object&gt;</code> | Array of move history objects |

<a name="getMoveSummary"></a>

## getMoveSummary(move) ⇒ <code>string</code>
Generates a summary string for a move

**Kind**: global function  
**Returns**: <code>string</code> - The move summary string  

| Param | Type | Description |
| --- | --- | --- |
| move | <code>Object</code> | The move object |

<a name="updateMoveDetails"></a>

## updateMoveDetails(move)
Updates move details in the rewind modal

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| move | <code>Object</code> | The move object to display details for |

<a name="renderMoveSquares"></a>

## renderMoveSquares(elementId, squares, advantageSquare)
Renders squares for a move detail view

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| elementId | <code>string</code> | The ID of the element to render squares in |
| squares | <code>Array.&lt;number&gt;</code> | Array of square values |
| advantageSquare | <code>number</code> | The advantage square position (1-based index) |

<a name="canUncoverAdvantageSquare"></a>

## canUncoverAdvantageSquare() ⇒ <code>Promise.&lt;boolean&gt;</code>
Checks if the advantage square can be uncovered

Determines if the current player is allowed to uncover
the opponent's advantage square

**Kind**: global function  
**Returns**: <code>Promise.&lt;boolean&gt;</code> - Whether the advantage square can be uncovered  
