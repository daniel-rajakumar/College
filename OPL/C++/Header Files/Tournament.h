#ifndef TOURNAMENT_H
#define TOURNAMENT_H

#include <string>
class Board;

/**
 * @file Tournament.h
 * @brief Manages the overall tournament, scores, and advantage/handicap logic.
 */

/**
 * @class Tournament
 * @brief Manages the overall tournament, including scores and game state.
 */
class Tournament {
public:
    /**
     * @brief Represents which side holds/should receive advantages.
     */
    enum class Side { None, Human, Computer };

    /**
     * @brief Constructs a Tournament object.
     * @param humanBoard Reference to the human's board.
     * @param computerBoard Reference to the computer's board.
     */
    Tournament(Board &humanBoard, Board &computerBoard);

    /**
     * @brief Calculates the advantage square based on the winning score.
     * @param winningScore The score that achieved victory
     * @return Index of the advantage square to apply for the next game
     */
    static int calculateAdvantageSquare(int winningScore);

    /** @return True when this is flagged as a new game. */
    bool getIsANewGame() const;
    /** @return True when the human is scheduled to take the next turn. */
    bool getIsHumanTurn() const;
    /** @brief Start the tournament/game loop (blocks until completion). */
    void start();

    /**
     * @brief Update tournament scores based on how the round finished.
     * @param humanWonByCover true when human won by covering all squares
     * @param humanWonByUncover true when human won by uncovering all squares
     * @param computerWonByCover analogous for computer
     * @param computerWonByUncover analogous for computer
     * @param humanScore Final human round score
     * @param computerScore Final computer round score
     */
    void updateScores(bool humanWonByCover, bool humanWonByUncover, bool computerWonByCover, bool computerWonByUncover, int humanScore, int computerScore);

    /** @brief Announce the overall tournament winner when conditions are met. */
    void declareTournamentWinner() const;

    /** @brief Persist current game state to a file. */
    void saveGame(const std::string& filename) const;
    /** @brief Load persisted game state from a file. @return true on success. */
    bool loadGame(const std::string& filename);
    /** @brief Reset tournament state to initial defaults. */
    void resetGame();

    /** @brief Returns whether an advantage has already been applied. */
    static bool getAdvantageApplied();
    /** @brief Returns the currently configured advantage square index. */
    static int getAdvantageSquare();

    /**
     * @brief Apply a handicap/advantage based on the last round result.
     * @param winnerWasFirstPlayer True when the winner had been the first player
     * @param winnerIsHuman True when the winner was the human
     * @param winningScore The winning score used to compute advantage
     */
    void applyHandicap(bool winnerWasFirstPlayer, bool winnerIsHuman, int winningScore) const;

    /** @brief Apply any pending advantage when starting a new round. */
    void applyAdvantageToNewRound();
    static bool isHumanAdvantageProtected();            
    static bool isComputerAdvantageProtected();
    static Side getAdvantageOwner();
    static void clearAdvantageProtectionForHuman();     
    static void clearAdvantageProtectionForComputer();  

    void setIsHumanTurn(bool humanTurn);
    bool getFirstPlayerIsHuman() const;
    void setFirstPlayerIsHuman(bool isHuman);

private:
    int tournamentScoreHuman = 0; 
    int tournamentScoreComputer = 0; 
    bool advantage = false; 
    bool isHumanTurn; 
    Board& humanBoard; 
    Board& computerBoard; 
    bool isANewGame; 
    static bool advantageApplied; 
    static int advantageSquare; 

    // Advantage state
    int  pendingAdvantageSquare = 0;
    Side pendingAdvantageFor    = Side::None;
    static bool protectHumanAdvantage;     
    static bool protectComputerAdvantage;  
    static Side advantageOwner;            
    bool firstPlayerIsHuman = true;

    int promptBoardSize();
};

#endif //TOURNAMENT_H