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
