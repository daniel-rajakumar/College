1. Round loop: the round advances in event driven (button clicks) steps instead of a loop when taking turns. The UI buttons call handleRandomRoll/handleManualRoll to set dice and get valid moves, then applyHumanMove (or auto AI move) applies a cover/uncover and checks roundOver. If a player has no moves, endTurn switches to the other player; otherwise the same player rolls again.

2. The View just draws stuff to the screen... it never decides the game or has any game logic. The controller (main.js) listens to user clicks, talks to the Model, then tells the View what to show. Example: you click “Roll 2 Dice,” controller gets a roll from the Model, then calls view.setDiceText(...) and view.openMoveModal(...) if you need to pick a move.

3. When the user clicks on help, it uses the logic that computer uses to suggest a move. It has the same logic and reasoning, therefore user can always ask help, which would result in a best possible move to make.
