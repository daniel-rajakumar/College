#ifndef TOURNAMENT_H
#define TOURNAMENT_H

#include <string>
class Board;

/**
 * @class Tournament
 * @brief Manages the overall tournament, including scores and game state.
 */
class Tournament {
public:
    enum class Side { None, Human, Computer };

    /**
     * @brief Constructs a Tournament object.
     * @param humanBoard Reference to the human's board.
     * @param computerBoard Reference to the computer's board.
     */
    Tournament(Board &humanBoard, Board &computerBoard);

    /**
     * @brief Calculates the advantage square based on the winning score.
     */
    static int calculateAdvantageSquare(int winningScore);

    bool getIsANewGame() const;
    bool getIsHumanTurn() const;
    void start();
    void updateScores(bool humanWonByCover, bool humanWonByUncover, bool computerWonByCover, bool computerWonByUncover, int humanScore, int computerScore);
    void declareTournamentWinner() const;
    void saveGame(const std::string& filename) const;
    bool loadGame(const std::string& filename);
    void resetGame();

    static bool getAdvantageApplied();
    static int getAdvantageSquare();

    void applyHandicap(bool winnerWasFirstPlayer, bool winnerIsHuman, int winningScore) const;
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