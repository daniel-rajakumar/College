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
        % ComputerSum > HumanSum -> Player = computer;
        ComputerSum > HumanSum -> Player = human;
        
        Next = human,
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

/* *********************************************
   Play a Single Round (two‐move cycle, then win‐check)
********************************************* */
play_round([[CompBoard, CompScore], [HumanBoard, HumanScore], First, _]) :-
    % 1) Display the current state
    display_board(HumanBoard, CompBoard),
    display_scores(HumanScore, CompScore),
    display_turn_info(First),

    % 2) Execute both turns in order of First
    ( First = human ->
        human_turn(   HumanBoard, CompBoard, TempHuman, _Dice1),
        computer_turn(CompBoard, HumanBoard, NewCompBoard, NewHumanBoard, _Dice1),

        LastPlayer = computer,
        NewHuman = TempHuman
    ;
        computer_turn(CompBoard, HumanBoard, NewCompBoard, NewHumanBoard, _Dice2),
        human_turn(   HumanBoard, TempComp,   NewHuman, _Dice2),
        LastPlayer = human,
        NewComp = TempComp
    ),

    % 3) After both have moved, check for a win
    ( check_round_end(LastPlayer, NewComp, NewHuman, Winner, Method) ->
        % If someone won, handle end‐of‐round
        format("🎉 ~w wins this round by ~w!~n", [Winner, Method]),
        calculate_score(Winner, Method, NewHuman, NewComp, RoundScore),
        format("🏅 Round score: ~w~n", [RoundScore]),
        update_tournament_state(Winner, RoundScore,
                                [NewComp,   CompScore],
                                [NewHuman, HumanScore],
                                UpdatedComp, UpdatedHuman),
        UpdatedComp = [_, FinalCompScore],
        UpdatedHuman = [_, FinalHumanScore],
        display_scores(FinalHumanScore, FinalCompScore),
        ask_play_again([UpdatedComp, UpdatedHuman, Winner, Winner])
    ;
        % No win yet: swap first‐player for next cycle and continue
        NextFirst = First,  % keep same alternation: if human started, human starts next cycle
        play_round([[NewComp, CompScore], [NewHuman, HumanScore], NextFirst, _])
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

/* *********************************************
   Human Turn
********************************************* */
% Replace the stub declaration with arity 4

/* *********************************************
   Human Turn Integration
********************************************* */

% human_turn(+CurH, +CurC, -FinalH, -LastDice)
human_turn(CurH, CurC, FinalH, LastDice) :-
    human_turn_loop(CurH, CurC, FinalH, _, LastDice).

% human_turn_loop(+BoardH, +BoardC, -FinalH, -FinalC, -LastDice)
human_turn_loop(CurH, CurC, FinalH, FinalC, LastDice) :-
    % 1) Decide dice count (you can customize this prompt)
    ( can_throw_one_die(CurH) ->
        % write("Squares 7+ are covered. Throw 1 or 2 dice? "), read(DiceCount),
        ( member(DiceCount, [1,2]) -> true ; write("Invalid; using 2."), DiceCount = 2 )
    ; DiceCount = 2
    ),

    % 2) Ask for manual or auto roll
    write(""), nl, nl,
    write("🎲 (Human) Enter dice manually? (yes/no): "), read(Man),
    ( Man = yes ->
        manual_dice_input(DiceCount, Sum)
    ; throw_dice(DiceCount, Sum)
    ),
    format("🎲 You rolled ~w.~n", [Sum]),

    % 3) Ask cover vs uncover
    write("Would you like to cover or uncover? "), read(Action0),
    ( Action0 = cover -> Action = cover
    ; Action0 = uncover -> Action = uncover
    ; write("⚠️ Invalid; turn ends."), FinalH = CurH, FinalC = CurC, LastDice = Sum, !
    ),

    % 4) Generate appropriate combos
    ( Action = cover ->
        valid_cover_combinations(CurH, Sum, Combos),
        OwnIn = CurH, OppIn = CurC
    ; % uncover
        valid_uncover_combinations(CurC, Sum, Combos),
        OwnIn = CurC, OppIn = CurH
    ),

    % 5) No valid moves?
    ( Combos = [] ->
        format("🚫 No valid ~w moves; turn ends.~n", [Action]),
        FinalH = CurH, FinalC = CurC, LastDice = Sum
    ;
        % 6) Show options and let human pick
        write("Available moves:"), nl,
        show_numbered_options(Combos, 1, Action),
        write("Select move #: "), read(I),
        choose_combo(Combos, I, Choice),

        % 7) Apply the move
        ( Action = cover ->
            apply_cover(CurH, Choice, NewH), NewC = CurC
        ;
            apply_uncover(CurC, Choice, NewC), NewH = CurH
        ),
        format("✅ You ~w: ~w.~n", [Action, Choice]),

        % 8) Display updated board
        display_board(NewH, NewC), nl,

        % 9) Recurse for any further moves
        human_turn_loop(NewH, NewC, FinalH, FinalC, LastDice)
    ).






/* *********************************************
   Computer Turn
********************************************* */
% Replace the stub declaration with arity 5
% computer_turn(+CurC, +CurH, -NewC, -NewH, -LastDiceSum).

/* *********************************************
   Computer Turn Integration
********************************************* */

% main entry
computer_turn(CurC, CurH, FinalC, FinalH, LastDice) :-
    computer_turn_loop(CurC, CurH, FinalC, FinalH, LastDice).

% updated loop
computer_turn_loop(CurC, CurH, FinalC, FinalH, LastDice) :-
    % 1) Decide dice count
    ( can_throw_one_die(CurC) -> DiceCount = 2 ; DiceCount = 2 ),

    % 2) Optional manual dice input
    write(""), nl, nl,
    write("🎲 (Computer) Enter dice manually? (yes/no): "), read(Man),
    ( Man = yes ->
        manual_dice_input(DiceCount, Sum)
    ; throw_dice(DiceCount, Sum)
    ),
    format("🎲 Computer rolled ~w.~n", [Sum]),

    % 3) Smarter decision
    computer_decide_cover_or_uncover(CurC, CurH, Sum, Action),
    ( Action = none ->
        write("⏹️ No valid moves; computer turn ends.~n"),
        FinalC = CurC, FinalH = CurH, LastDice = Sum
    ;
      format("🤖 Computer chooses to ~w.~n", [Action]),
      % 4) Generate the right combos
      ( Action = cover ->
          valid_cover_combinations(CurC, Sum, Combos),
          OwnIn = CurC, OppIn = CurH
      ; /* uncover */
          valid_uncover_combinations(CurH, Sum, Combos),
          OwnIn = CurH, OppIn = CurC
      ),

      % 5) Pick best subset
      computer_choose_squares(Combos, OwnIn, OppIn, Sum, Choice),
      format("✅ Computer ~w squares: ~w.~n", [Action, Choice]),

      % 6) Apply move
      ( Action = cover ->
          apply_cover(CurC, Choice, NewC), NewH = CurH
      ;
          apply_uncover(CurH, Choice, NewH), NewC = CurC
      ),

      % 7) Show and recurse
      display_board(NewH, NewC), nl,
      computer_turn_loop(NewC, NewH, FinalC, FinalH, LastDice)
    ).


/* *********************************************
   Filtered Move Generators
********************************************* */

% only use non-zeros when we’re covering
valid_cover_combinations(Squares, Sum, Combos) :-
    include(\=(0), Squares, Available),
    findall(C, ( subset_of_max4(Available, C),
                 sum_list(C, Sum)
               ),
            Combos).

% only use zeros when we’re uncovering
valid_uncover_combinations(Squares, Sum, Combos) :-
    include(=(0), Squares, Covered),
    findall(C, ( subset_of_max4(Covered, C),
                 sum_list(C, Sum)
               ),
            Combos).

computer_decide_cover_or_uncover(CurC, CurH, Sum, Action) :-
    valid_cover_combinations(CurC, Sum, CoverOpts),
    valid_uncover_combinations(CurH, Sum, UncoverOpts),
    ( CoverOpts == [], UncoverOpts == [] ->
        Action = none
    ; CoverOpts == [] ->
        Action = uncover
    ; UncoverOpts == [] ->
        Action = cover
    ; % both non-empty: pick whichever has more options
      length(CoverOpts, NC), length(UncoverOpts, NU),
      ( NC >= NU -> Action = cover ; Action = uncover )
    ).


% Choose the “best” combination based on the decided action:
%  - cover: pick the combo with the most squares (maximizes coverage)
%  - uncover: pick the combo with the fewest squares (minimizes opponent’s gain)
computer_choose_squares(Combos, CurC, CurH, Sum, Choice) :-
    computer_decide_cover_or_uncover(CurC, CurH, Sum, Action),
    ( Action = cover ->
        best_combo_max_length(Combos, Choice)
    ; Action = uncover ->
        best_combo_min_length(Combos, Choice)
    ; Action = none ->
        format("⏹️ No valid moves; turn ends.~n"),
        FinalC = CurC, FinalH = CurH, LastDice = Sum
    ).

% Helper: select the combo with the maximum length
best_combo_max_length([C], C).
best_combo_max_length([C1,C2|Rest], Best) :-
    length(C1, L1), length(C2, L2),
    ( L1 >= L2 -> Temp = C1 ; Temp = C2 ),
    best_combo_max_length([Temp|Rest], Best).

% Helper: select the combo with the minimum length
best_combo_min_length([C], C).
best_combo_min_length([C1,C2|Rest], Best) :-
    length(C1, L1), length(C2, L2),
    ( L1 =< L2 -> Temp = C1 ; Temp = C2 ),
    best_combo_min_length([Temp|Rest], Best).

% Optional: explain in prose why the computer chose cover or uncover
computer_strategy_explanation(CurC, CurH, Sum) :-
    valid_combinations(CurC, Sum, CoverOpts),
    valid_combinations(CurH, Sum, UncoverOpts),
    ( CoverOpts \= [], UncoverOpts \= [] ->
        format("Strategy: both cover (~w options) and uncover (~w options) are available; defaulting to cover.~n",
               [CoverOpts, UncoverOpts])
    ; CoverOpts \= [] ->
        format("Strategy: only cover (~w options) is available.~n", [CoverOpts])
    ; UncoverOpts \= [] ->
        format("Strategy: only uncover (~w options) is available.~n", [UncoverOpts])
    ; write("Strategy: no valid moves available."), nl
    ).




ask_dice_choice(Board, DiceCount) :-
    % can_throw_one_die(Board) ->
    %     write("Squares 7 and up are covered. Throw 1 or 2 dice? "), read(DiceCount),
    %     (member(DiceCount, [1,2]) -> true ; write("Invalid choice, using 2."), DiceCount = 2);
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
check_round_end(LastPlayer, CompBoard, HumanBoard, Winner, Method) :-
    write("🔁 Checking for round end..."), nl,
    write("Last player: "), write(LastPlayer), nl,
    write("Computer board: "), write(CompBoard), nl,
    write("Human board: "), write(HumanBoard), nl,

  LastPlayer = human ->
    (
        all_zeros(HumanBoard) ->
            Winner = human,
            Method = cover,
            write("Human board all zeros"), nl
        ;
        all_nonzeros(HumanBoard) ->
            Winner = computer,
            Method = uncover,
            write("Human board all non-zeros"), nl
        ;
        all_zeros(CompBoard) ->
            Winner = computer,
            Method = cover,
            write("Computer board all zeros"), nl
        ;
        all_nonzeros(CompBoard) ->
            Winner = human,
            Method = uncover,
            write("Computer board all non-zeros"), nl

        ;
        Winner = none,
        Method = none
    )
    ;
    (
        all_zeros(CompBoard) ->
            Winner = computer,
            Method = cover,
            write("Computer board all zeros"), nl
        ;
        all_nonzeros(CompBoard) ->
            Winner = human,
            Method = uncover,
            write("Computer board all non-zeros"), nl
        ;
        all_zeros(HumanBoard) ->
            Winner = human,
            Method = cover,
            write("Human board all zeros"), nl
        ;
        all_nonzeros(HumanBoard) ->
            Winner = computer,
            Method = uncover,
            write("Human board all non-zeros"), nl
        ;
        Winner = none,
        Method = none
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


ask_play_again([[CompBoard, CompScore], [HumanBoard, HumanScore], _, _]) :-
    write("🔁 Play another round? (yes/no): "), read(Resp),
    (
        Resp = yes ->
            choose_board_size(Size),   % reuses your existing prompt for 9, 10, or 11

            % 2. Reinitialize both boards (full covered)
            numlist(1, Size, NewHumanBoard),
            numlist(1, Size, NewCompBoard),

            % 3. Decide who goes first this round
            determine_first_player(First),
            Next = First,

            % 4. Clear screen and show fresh UI
            clear_screen,
            display_board(NewHumanBoard, NewCompBoard),
            display_scores(HumanScore, CompScore),
            display_turn_info(Next),

            % 5. Kick off the next round with reset boards
            play_round([[NewCompBoard, CompScore],
                        [NewHumanBoard, HumanScore],
                        First,
                        Next])
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


