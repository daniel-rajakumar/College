/* *********************************************
  Canoga Game in Prolog
  Author: [Your Full Name]
  Email: [Your Email Address]
  Date: [Today's Date]
  Description: Implementation of the Canoga dice game for human vs computer.
********************************************* */


/* *********************************************
  Game Setup Predicates
********************************************* */

start_game/0.
choose_board_size/1.
initialize_board/3.
determine_first_player/1.
throw_dice/2.
random_between/3. % (Prolog's random number generation)

/* *********************************************
  Display Board and Messages
********************************************* */

display_board/2.
display_scores/2.
display_turn_info/2.


/* *********************************************
  Turn Management Predicates
********************************************* */

play_round/1.
take_turn/4.

human_turn/4.
computer_turn/4.



/* *********************************************
  Covering and Uncovering Squares
********************************************* */

valid_moves/4.
cover_squares/3.
uncover_squares/3.
can_cover/3.
can_uncover/3.



/* *********************************************
  Computer Strategy Predicates
********************************************* */

computer_decide_cover_or_uncover/4.
computer_choose_squares/5.
computer_strategy_explanation/3.


/* *********************************************
  Help Mode (Computer Assistance to Human)
********************************************* */

help_player/4.
recommend_best_option/5.



/* *********************************************
  Saving and Loading Game State
********************************************* */

save_game/2.
load_game/2.
write_game_state/2.
read_game_state/2.



/* *********************************************
  Managing Rounds and Tournament
********************************************* */

check_round_end/2.
calculate_round_score/3.
apply_handicap/3.
play_again/1.
declare_tournament_winner/2.


/* *********************************************
  Utility Predicates
********************************************* */

sum_list/2.
subset_sum/3. % to find combinations of numbers that add up to a sum
list_replace/4. % to update a square as covered/uncovered
validate_input/2. % for human choices





start_game :-
    choose_board_size(Size),
    initialize_board(Size, HumanBoard, ComputerBoard),
    determine_first_player(First),
    Next = First,
    HumanScore = 0,
    ComputerScore = 0,
    GameState = [
        [ComputerBoard, ComputerScore],
        [HumanBoard, HumanScore],
        First,
        Next
    ],
    play_tournament(GameState).



choose_board_size(Size) :-
    write('Enter board size (9, 10, or 11): '), read(Size),
    member(Size, [9,10,11]), !.
choose_board_size(Size) :-
    write('Invalid size. Try again.'), nl,
    choose_board_size(Size).


initialize_board(Size, HumanBoard, ComputerBoard) :-
    numlist(1, Size, HumanBoard),
    numlist(1, Size, ComputerBoard).


determine_first_player(Player) :-
    throw_dice(2, HumanSum),
    throw_dice(2, ComputerSum),
    format('Human rolled ~w. Computer rolled ~w.~n', [HumanSum, ComputerSum]),
    (
        HumanSum > ComputerSum -> Player = human;
        ComputerSum > HumanSum -> Player = computer;
        write('Tie! Rolling again...'), nl, determine_first_player(Player)
    ).



throw_dice(1, Sum) :-
    random_between(1, 6, D1),
    Sum is D1.
throw_dice(2, Sum) :-
    random_between(1, 6, D1),
    random_between(1, 6, D2),
    Sum is D1 + D2.


play_tournament(GameState) :-
    play_round(GameState).

play_round([ [CompBoard, CompScore], [HumanBoard, HumanScore], First, Next ]) :-
    display_board(HumanBoard, CompBoard),
    display_scores(HumanScore, CompScore),
    display_turn_info(Next),

    format("Next turn: ~w~n", [Next]),
    (
        Next = human ->
            human_turn(HumanBoard, CompBoard, NewHumanBoard, _),
            NewNext = computer,
            NewState = [ [CompBoard, CompScore], [NewHumanBoard, HumanScore], First, NewNext ];
        Next = computer ->
            write('Computer plays...'), nl,
            NewNext = human,
            NewState = [ [CompBoard, CompScore], [HumanBoard, HumanScore], First, NewNext ]
    ),
    continue_round(NewState).

    

continue_round(GameState) :-
    write('Continue playing? (yes/no): '), read(Response),
    (
        Response = yes -> play_round(GameState);
        Response = no -> write('Game ended.')
    ).



human_turn(HumanBoard, ComputerBoard, NewHumanBoard, DiceSum) :-
    format("Your board: ~w~n", [HumanBoard]),
    ask_dice_choice(HumanBoard, DiceCount),
    throw_dice(DiceCount, DiceSum),
    format("🎲 You rolled: ~w~n", [DiceSum]),

    NewHumanBoard = HumanBoard.


ask_dice_choice(Board, DiceCount) :-
    can_throw_one_die(Board) ->
        write("Squares 7 and up are covered. Throw 1 or 2 dice? "), read(DiceCount),
        (member(DiceCount, [1,2]) -> true ; write("Invalid choice, using 2."), DiceCount = 2);
    DiceCount = 2.


can_throw_one_die(Board) :-
    length(Board, Length),
    Start is 7,
    check_range_covered(Board, Start, Length).

check_range_covered(Board, Start, End) :-
    forall(between(Start, End, I),
           (nth1(I, Board, Val), Val =\= 0)).



/* *********************************************
   Display the Game Board
********************************************* */

display_board(Human, Computer) :-
    nl,
    write("📍 Current Game Board"), nl,
    write("┌────────────────────────────────────────────┐"), nl,
    write("│  Human:   "), print_squares(Human), nl,
    write("│  Computer:"), print_squares(Computer), nl,
    write("└────────────────────────────────────────────┘"), nl.

display_scores(HumanScore, ComputerScore) :-
    nl,
    format("⭐ Human Score: ~w~n", [HumanScore]),
    format("🤖 Computer Score: ~w~n", [ComputerScore]), nl.


display_turn_info(Player) :-
    format("🔁 It is ~w turn.~n", [Player]).

print_squares(Squares) :-
    maplist(print_square, Squares), nl.

print_square(0) :- write(" --").
print_square(N) :- format(" ~|~`0t~d~2+", [N]).


