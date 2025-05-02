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

    % format("Next turn: ~w~n", [Next]),
    (
        Next = human ->
            human_turn(HumanBoard, CompBoard, NewHumanBoard, _),
            NewNext = computer,
            NewState = [ [CompBoard, CompScore], [NewHumanBoard, HumanScore], First, NewNext ];

        Next = computer ->
            computer_turn(CompBoard, HumanBoard, NewCompBoard, _),
            NewNext = human,
            NewState = [[NewCompBoard, CompScore], [HumanBoard, HumanScore], First, NewNext]
    ),


    NewState = [[NewCompBoard, CompScore], [NewHumanBoard, HumanScore], First, NewNext],
    
    % write("🔁 Checking for round end..."), nl,
    % write("New state: "), write(NewState), nl,

    (
    check_round_end(NewCompBoard, NewHumanBoard, Winner, Method) ->
        format("🎉 ~w wins this round by ~w!~n", [Winner, Method]),
        calculate_score(Winner, Method, NewHumanBoard, NewCompBoard, RoundScore),
        format("🏅 Round score: ~w~n", [RoundScore]),
        update_tournament_state(Winner, RoundScore,
                                [NewCompBoard, CompScore],
                                [NewHumanBoard, HumanScore],
                                UpdatedComp, UpdatedHuman),
                                
        UpdatedHuman = [_, HumanScore],
        UpdatedComp = [_, CompScore],
        display_scores(HumanScore, CompScore),
        ask_play_again([UpdatedComp, UpdatedHuman, Winner, Winner])
    ;
    continue_round([[NewCompBoard, CompScore], [NewHumanBoard, HumanScore], First, NewNext])
).
    

% continue_round(GameState) :-
continue_round([[NewCompBoard, CompScore], [NewHumanBoard, HumanScore], First, NewNext]) :-
    display_board(NewCompBoard, NewHumanBoard),
    write('Continue playing? (yes/no): '), read(Response),
    % clear the screen
    (
        Response = yes ->
            clear_screen,
            play_round([[NewCompBoard, CompScore], [NewHumanBoard, HumanScore], First, NewNext])

        ;
        Response = no ->
            write('Game ended.')
    ).

clear_screen :-
    forall(between(1, 50, _), nl),
    put_code(27), write('[2J'),    % clear screen
    put_code(27), write('[H').     % move cursor to top-left



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
    format("🎲 You rolled a ~w~n", [DiceSum]), nl,

    % Get valid move sets
    valid_combinations(HumanBoard, DiceSum, CoverCombos),
    valid_combinations(CompBoard, DiceSum, UncoverCombos),

    % Ask action
    write("Would you like to (cover/uncover)? "), read(Action),

    (
        Action = cover, CoverCombos \= [] ->
            write("👉 Available cover options:"), nl,
            show_numbered_options(CoverCombos, 1, cover),
            write("Select option number: "), read(Index),
            choose_combo(CoverCombos, Index, Chosen),
            apply_cover(HumanBoard, Chosen, NewHumanBoard),
            format("✅ You covered: ~w~n", [Chosen])

        ;
        Action = uncover, UncoverCombos \= [] ->
            write("👉 Available uncover options:"), nl,
            show_numbered_options(UncoverCombos, 1, uncover),
            write("Select option number: "), read(Index),
            choose_combo(UncoverCombos, Index, Chosen),
            apply_uncover(CompBoard, Chosen, _NewCompBoard),  % ← save if needed
            NewHumanBoard = HumanBoard,
            format("✅ You uncovered: ~w~n", [Chosen])

        ;
        write("⚠️ No valid moves for selected action or invalid input. Turn ends."), nl,
        NewHumanBoard = HumanBoard
    ).

/* *********************************************
   Computer Turn Logic
********************************************* */
computer_turn(CompBoard, HumanBoard, NewCompBoard, DiceSum) :-

    (can_throw_one_die(CompBoard) -> DiceCount = 1 ; DiceCount = 2),

    % Ask for manual dice input
    write("🧪 Would you like to manually enter dice for the computer? (yes/no): "),
    read(Manual),
    (
        Manual = yes ->
            manual_dice_input(DiceCount, DiceSum)
        ;
            throw_dice(DiceCount, DiceSum)
    ),

    format("🤖 Computer rolled a ~w (~w die)~n", [DiceSum, DiceCount]),

    % Find possible actions
    valid_combinations(CompBoard, DiceSum, CoverCombos),
    valid_combinations(HumanBoard, DiceSum, UncoverCombos),

    (
        CoverCombos \= [] ->
            Action = cover,
            ChosenCombo = CoverCombos
        ;
        UncoverCombos \= [] ->
            Action = uncover,
            ChosenCombo = UncoverCombos
        ;
        write("🤖 No valid moves. Turn ends."), nl,
        NewCompBoard = CompBoard,
        !
    ),

    ChosenCombo = [BestMove|_],

    (
        Action = cover ->
            apply_cover(CompBoard, BestMove, NewCompBoard),
            format("🤖 Computer chose to COVER: ~w~n", [BestMove]),
            display_board(HumanBoard, NewCompBoard)
        ;
        Action = uncover ->
            apply_uncover(HumanBoard, BestMove, _UpdatedHumanBoard),
            NewCompBoard = CompBoard,
            format("🤖 Computer chose to UNCOVER your squares: ~w~n", [BestMove]),
            display_board(_UpdatedHumanBoard, NewCompBoard)
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
    format("🔁 It is ~w turn.~n", [Player]), nl.

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







apply_cover(Board, SquaresToCover, NewBoard) :-
    replace_many(Board, SquaresToCover, 0, NewBoard).

apply_uncover(Board, SquaresToUncover, NewBoard) :-
    replace_many(Board, SquaresToUncover, _, NewBoard).


% Replace the first occurrence of Value in a list with Replacement
replace_first([Value|T], Value, Replacement, [Replacement|T]) :- !.
replace_first([H|T], Value, Replacement, [H|NewT]) :-
    replace_first(T, Value, Replacement, NewT).


% Replace a list of values (Targets) with a given Replacement
replace_many(Board, [], _, Board).

replace_many(Board, [X|Xs], Replacement, ResultBoard) :-
    replace_first(Board, X, Replacement, TempBoard),
    replace_many(TempBoard, Xs, Replacement, ResultBoard).




/* *********************************************
   Display Numbered Move Options
********************************************* */

show_numbered_options([], _, _) :-
    write("   (no valid options)"), nl.

show_numbered_options([Option|Rest], Index, _) :-
    format("  ~w. ~w~n", [Index, Option]),
    NextIndex is Index + 1,
    show_numbered_options(Rest, NextIndex, _).


choose_combo(Combos, Index, Combo) :-
    nth1(Index, Combos, Combo), !.
choose_combo(_, _, []) :-
    write("⚠️ Invalid selection. Move skipped."), nl.




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




/* *********************************************
   Check if Round Has Ended
********************************************* */
check_round_end(CompBoard, HumanBoard, Winner, Method) :-
    (
        all_zeros(HumanBoard) ->
            Winner = computer,
            Method = uncover
        ;
        all_zeros(CompBoard) ->
            Winner = human,
            Method = uncover
        ;
        all_nonzeros(HumanBoard) ->
            Winner = human,
            Method = cover
        ;
        all_nonzeros(CompBoard) ->
            Winner = computer,
            Method = cover
        ;
        fail  % Round not over
    ).

% helper to check if all squares are 0
all_zeros([]).
all_zeros([0|T]) :- all_zeros(T).

% helper to check if all squares are covered (non-zero)
all_nonzeros([]).
all_nonzeros([H|T]) :- H =\= 0, all_nonzeros(T).


/* *********************************************
   Calculate Score for Winner of the Round
********************************************* */
calculate_score(Winner, Method, HumanBoard, CompBoard, Score) :-
    (
        Winner = human, Method = cover ->
            sum_uncovered(CompBoard, Score)
        ;
        Winner = human, Method = uncover ->
            sum_covered(HumanBoard, Score)
        ;
        Winner = computer, Method = cover ->
            sum_uncovered(HumanBoard, Score)
        ;
        Winner = computer, Method = uncover ->
            sum_covered(CompBoard, Score)
    ).

sum_uncovered([], 0).
sum_uncovered([0|T], Total) :- sum_uncovered(T, Total).
sum_uncovered([H|T], Total) :- H =\= 0, sum_uncovered(T, Rest), Total is Rest + H.

sum_covered([], 0).
sum_covered([0|T], Total) :- sum_covered(T, Total).
sum_covered([H|T], Total) :- H =\= 0, sum_covered(T, Rest), Total is Rest + H.


/* *********************************************
   Update Scores After Round
********************************************* */
update_tournament_state(
    Winner, Score, 
    [CompBoard, CompScore], [HumanBoard, HumanScore], 
    NewComp, NewHuman
) :-
    (
        Winner = human ->
            NewHuman = [HumanBoard, NewScore],
            NewScore is HumanScore + Score,
            NewComp = [CompBoard, CompScore]
        ;
        Winner = computer ->
            NewComp = [CompBoard, NewScore],
            NewScore is CompScore + Score,
            NewHuman = [HumanBoard, HumanScore]
    ).


ask_play_again(GameState) :-
    write("🔁 Play another round? (yes/no): "), read(Resp),
    (
        Resp = yes ->
            play_round(GameState)
        ;
        GameState = [[_, CScore], [_, HScore], _, _],
        write("🏁 Tournament Over! Final Scores:"), nl,
        format("🤖 Computer: ~w~n", [CScore]),
        format("⭐ Human: ~w~n", [HScore]),
        (
            CScore > HScore -> write("🤖 Computer wins the tournament!");
            HScore > CScore -> write("⭐ Human wins the tournament!");
            HScore =:= CScore -> write("🤝 It is a draw!")
        ),
        nl
    ).


