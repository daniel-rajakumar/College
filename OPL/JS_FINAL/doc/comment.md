## 1) Round loop

There isn’t one big loop running turns. The round keeps going because the player keeps clicking buttons (roll -> maybe pick a move -> apply it -> the screen updates).

## 2) When you ask for help

When you click Help, the game looks at the dice sum and both boards, then uses the same “computer strategy” to pick the best move right now. It shows you the recommendation (cover or uncover + which squares) and auto-selects the matching option in the modal so you can just hit Confirm.

#### Help strategy: 
> it checks if any move wins right away (cover all your remaining squares, or uncover all of the opponent’s covered squares). If there’s no instant win, it prefers COVER over UNCOVER, and picks the “best” combo by choosing more squares first (and if tied, the combo with the bigger total).

### If you want the more technical side, the full function call order is right below.

Full function call order (An example: Help button):

1. `wireGame()` (**main.js**) registers the `#modal-btn-help` click handler.
2. Click handler calls `getHelpSuggestion()` (**GameSession.js**).
3. `getHelpSuggestion()` (**GameSession.js**) calls `getHelpSuggestion(round, currentPlayerId, diceSum)` (**ComputerPlayer.js**).
4. `getHelpSuggestion(...)` (**ComputerPlayer.js**) calls `decideMove(...)` (**ComputerPlayer.js**).
5. `decideMove(...)` (**ComputerPlayer.js**) builds legal options by calling:
   - `getCoverOptions(...)` (**GameRound.js**) → `getCoverCombos(...)` (**Board.js**) → `_getCombosForSum(...)` (**Board.js**)
   - `getUncoverOptions(...)` (**GameRound.js**) → `getUncoverCombos(...)` (**Board.js**) → `_getCombosForSum(...)` (**Board.js**)
6. `decideMove(...)` (**ComputerPlayer.js**) returns `{ action, squares, reason, ... }` to the click handler.
7. controller updates the modal (View calls from **main.js**):
   - `setMoveHelpText(...)` (**View.js**)
   - `setMoveSelection(...)` (**View.js**) → `_fillOptionsSelect(...)` (**View.js**)

## 3) How the View is updated from the Model

The View doesn’t “figure out” the game on its own. The controller grabs info from the model (`GameSession/GameRound`) and then tells the View what to show by calling `View` methods.

Example (this order happens inside `refreshBoardsAndScores()` (**main.js**)):

1. `getCurrentRound()` (**GameSession.js**)
2. `getLockedAdvantageSquare("HUMAN")` (**GameRound.js**)
3. `getLockedAdvantageSquare("COMPUTER")` (**GameRound.js**)
4. `renderBoards(round, { ... })` (**View.js**)
5. `getScores()` (**GameSession.js**)
6. `setScores(humanScore, computerScore)` (**View.js**)
