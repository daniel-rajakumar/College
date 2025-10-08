//
// Created by Daniel Rajakumar on 2/10/25.
//

#ifndef TOURNAMENT_H
#define TOURNAMENT_H

#include <string>
class Board;
using namespace std;

/**
 * @class Tournament
 * @brief Manages the overall tournament, including scores and game state.
 */
class Tournament {
private:
    int tournamentScoreHuman = 0; ///< The human player's tournament score.
    int tournamentScoreComputer = 0; ///< The computer player's tournament score.
    bool advantage = false; ///< Flag indicating if an advantage is applied.
    bool isHumanTurn; ///< Flag indicating if it is the human player's turn.
    Board& humanBoard; ///< Reference to the human's board.
    Board& computerBoard; ///< Reference to the computer's board.
    bool isANewGame; ///< Flag indicating if it is a new game.
    static bool advantageApplied; ///< Static variable to track if the advantage has been applied.
    static int advantageSquare; ///< Static variable for the advantage square.

    int promptBoardSize();



public:
    /**
     * @brief Constructs a Tournament object.
     * 
     * @param humanBoard Reference to the human's board.
     * @param computerBoard Reference to the computer's board.
     */
    Tournament(Board &humanBoard, Board &computerBoard);

    /**
     * @brief Calculates the advantage square based on the winning score.
     * 
     * @param winningScore The winning score.
     * @return The calculated advantage square.
     */
    static int calculateAdvantageSquare(int winningScore);

    /**
     * @brief Gets whether it is a new game.
     * 
     * @return True if it is a new game, false otherwise.
     */
    bool getIsANewGame() const;

    /**
     * @brief Gets whether it is the human player's turn.
     * 
     * @return True if it is the human player's turn, false otherwise.
     */
    bool getIsHumanTurn() const;

    /**
     * @brief Starts the tournament.
     */
     void start();

    /**
     * @brief Updates the scores based on the outcome of the round.
     * 
     * @param humanWonByCover True if the human won by covering squares.
     * @param humanWonByUncover True if the human won by uncovering squares.
     * @param computerWonByCover True if the computer won by covering squares.
     * @param computerWonByUncover True if the computer won by uncovering squares.
     * @param humanScore The human player's score.
     * @param computerScore The computer player's score.
     */
    void updateScores(bool humanWonByCover, bool humanWonByUncover, bool computerWonByCover, bool computerWonByUncover, int humanScore, int computerScore);

    /**
     * @brief Declares the winner of the tournament.
     */
    void declareTournamentWinner() const;

    /**
     * @brief Saves the game state to a file.
     * 
     * @param filename The name of the file to save the game state to.
     */
    void saveGame(const string& filename) const;

    /**
     * @brief Loads the game state from a file.
     * 
     * @param filename The name of the file to load the game state from.
     * @return True if the game state was successfully loaded, false otherwise.
     */
    bool loadGame(const string& filename);

    /**
     * @brief Resets the game state.
     */
    void resetGame();

    /**
     * @brief Gets whether the advantage has been applied.
     * 
     * @return True if the advantage has been applied, false otherwise.
     */
    static bool getAdvantageApplied();

    /**
     * @brief Gets the advantage square.
     * 
     * @return The advantage square.
     */
    static int getAdvantageSquare();

    /**
     * @brief Applies a handicap based on the winner and winning score.
     * 
     * @param winnerWasFirstPlayer True if the winner was the first player.
     * @param winningScore The winning score.
     */
    void applyHandicap(bool winnerWasFirstPlayer, int winningScore) const;

    // Who should get the advantage NEXT round (queued at round end)
    enum class Side { None, Human, Computer };
    void applyAdvantageToNewRound();                    // call right after rebuilding boards for a new round
    static bool isHumanAdvantageProtected();            // for Human/Computer filtering
    static bool isComputerAdvantageProtected();
    static Side getAdvantageOwner();
    static void clearAdvantageProtectionForHuman();     // called after advantaged Human's first turn
    static void clearAdvantageProtectionForComputer();  // called after advantaged Computer's first turn



    int  pendingAdvantageSquare = 0;
    Side pendingAdvantageFor    = Side::None;

    // Current-round protection flags (block opponent from uncovering for ONE turn)
    static bool protectHumanAdvantage;     // protects Human's advantage square
    static bool protectComputerAdvantage;  // protects Computer's advantage square
    static Side advantageOwner;            // who currently owns the advantage (this round)

};

#endif //TOURNAMENT_H
