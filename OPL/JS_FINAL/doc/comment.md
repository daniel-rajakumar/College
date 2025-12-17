## 1) Round loop

- There is no single loop for turns. The “loop” is the user repeatedly clicking buttons (roll → maybe choose move → apply → update UI).

## 2) When you ask for help

When you click Help, the game looks at the current dice sum and the current boards and figures out the best move you can make right now. It then shows you that recommendation (cover or uncover, plus which squares) and auto-selects the matching option in the modal so you can confirm it quickly. For more into the technical side of how this works, there is a full function call of that button action. 

## 2.1) An example of how data flow in an MCV model (Example is when user clicks the help button)

Full function call order:
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

The View never reads the model directly. The controller always pulls data from `GameSession/GameRound` and then calls `View` methods.

An example (this order happens inside `refreshBoardsAndScores()` (**main.js**)):

1. `getCurrentRound()` (**GameSession.js**)
2. `getLockedAdvantageSquare("HUMAN")` (**GameRound.js**)
3. `getLockedAdvantageSquare("COMPUTER")` (**GameRound.js**)
4. `renderBoards(round, { ... })` (**View.js**)
5. `getScores()` (**GameSession.js**)
6. `setScores(humanScore, computerScore)` (**View.js**)
