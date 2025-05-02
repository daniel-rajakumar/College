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
    write("🟨 Do you want to load a saved game or start a new one? (load/new): "),
    read(Choice),
    (
        Choice = load ->
            write("📂 Enter the file name to load from (with quotes): "), read(File),
            load_game(File, GameState),
            play_tournament(GameState)
        ;
        Choice = new ->
            new_game_setup(GameState),
            play_tournament(GameState)
        ;
        write("⚠️ Invalid choice. Try again."), nl,
        start_game  % Recurse on invalid input
    ).


new_game_setup(GameState) :-
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
    ].




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



human_turn(HumanBoard, CompBoard, NewHumanBoard, DiceSum) :-
    write("🎲 Would you like to enter the dice manually? (yes/no): "),
    read(Manual),
    ask_dice_choice(HumanBoard, DiceCount),
    (
        Manual = yes ->
            manual_dice_input(DiceCount, DiceSum)
        ;
        throw_dice(DiceCount, DiceSum)
    ),
    format("🎲 You rolled a ~w~n", [DiceSum]),

    % Get valid cover and uncover moves
    valid_combinations(HumanBoard, DiceSum, CoverCombos),
    valid_combinations(CompBoard, DiceSum, UncoverCombos),

    % Show both options
    write("✅ Available options:"), nl,

    write("👉 Cover your own squares:"), nl,
    ( CoverCombos = [] -> write("   (no valid cover moves)"), nl ; show_numbered_options(CoverCombos, 1, cover)),
    nl,
    write("👉 Or uncover opponents squares:"), nl,
    ( UncoverCombos = [] -> write("   (no valid uncover moves)"), nl ; show_numbered_options(UncoverCombos, 1, uncover)).




    % Ask user to choose
    write("Would you like to (cover/uncover)? "), read(Action),
    (
        Action = cover, CoverCombos \= [] ->
            write("Which combo to use? "), read(Chosen),
            apply_cover(HumanBoard, Chosen, NewHumanBoard)
        ;
        Action = uncover, UncoverCombos \= [] ->
            write("Which combo to use? "), read(Chosen),
            apply_uncover(CompBoard, Chosen, UpdatedCompBoard),
            NewHumanBoard = HumanBoard,  % no change to human
            % TODO: You'll return UpdatedCompBoard from turn logic
            format("Applied uncover: ~w~n", [UpdatedCompBoard])
        ;
        write("⚠️ No valid moves or invalid choice. Turn ends."), nl,
        NewHumanBoard = HumanBoard
    ).



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





/* *********************************************
   Generate Valid Moves (Sum Combinations)
********************************************* */

% Find all subsets of 1-4 squares that sum to the given total
valid_combinations(Squares, Sum, Combos) :-
    include(\=(0), Squares, Available),     % only uncovered squares
    findall(Combo,
        (subset_of_max4(Available, Combo), sum_list(Combo, Sum)),
        Combos).

% Generate subset of up to 4 elements
subset_of_max4(List, Subset) :-
    subset(List, Subset),
    length(Subset, L), L >= 1, L =< 4.

% Built-in helper (Prolog doesn't have it by default in SWI)
subset([], []).
subset([E|Tail], [E|NTail]) :- subset(Tail, NTail).
subset([_|Tail], NTail)     :- subset(Tail, NTail).








apply_cover(Board, Combo, NewBoard) :-
    maplist({Board}/[X]>>replace_first(Board, X, 0, BoardTmp), Combo, [NewBoard]).

apply_uncover(Board, Combo, NewBoard) :-
    maplist({Board}/[X]>>replace_first(Board, X, X, BoardTmp), Combo, [NewBoard]).

% Replace element at index matching Value with NewVal
replace_first([H|T], Val, NewVal, [NewVal|T]) :- H =:= Val, !.
replace_first([H|T], Val, NewVal, [H|R]) :-
    replace_first(T, Val, NewVal, R).




/* *********************************************
   Display Numbered Move Options
********************************************* */

show_numbered_options([], _, _) :- true.

show_numbered_options([Option|Rest], Index, Type) :-
    format("  ~w. ~w~n", [Index, Option]),
    NextIndex is Index + 1,
    show_numbered_options(Rest, NextIndex, Type).





/* *********************************************
   Save Game State to File
********************************************* */

save_game(FileName, GameState) :-
    open(FileName, write, Stream),
    writeq(Stream, GameState),     % write in a safe format
    write(Stream, '.'),            % terminate with a period
    nl(Stream),
    close(Stream),
    format("💾 Game saved to '~w'.~n", [FileName]).



load_game(FileName, GameState) :-
    open(FileName, read, Stream),
    read(Stream, GameState),       % read the game state
    close(Stream),
    format("📂 Game loaded from '~w'.~n", [FileName]),
    play_tournament(GameState).


start_from_file :-
    write("Enter file name to load: "), read(File),
    load_game(File, GameState),
    play_tournament(GameState).


/* *********************************************
   Manual Dice Input
********************************************* */

manual_dice_input(1, Sum) :-
    write("Enter result for 1 die (1-6): "),
    read(D1),
    (between(1, 6, D1) -> Sum = D1 ; write("Invalid. Using 1."), Sum = 1).

manual_dice_input(2, Sum) :-
    write("Enter result for die 1 (1-6): "),
    read(D1),
    write("Enter result for die 2 (1-6): "),
    read(D2),
    (
        between(1, 6, D1), between(1, 6, D2) ->
            Sum is D1 + D2
        ;
            write("Invalid input. Using [1,1]."), Sum = 2
    ).
