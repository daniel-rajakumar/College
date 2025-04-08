package com.example.canoga.view;

import android.app.AlertDialog;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;
import android.widget.ToggleButton;

import com.example.canoga.controller.GameController;
import com.example.canoga.controller.TournamentController;
import com.example.canoga.model.Computer;
import com.example.canoga.model.GameRound;
import com.example.canoga.model.Human;
import com.example.canoga.R;

import java.io.IOException;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;

public class GameFragment extends Fragment {

    private static final int CREATE_FILE_REQUEST_CODE = 1;
    private static final int LOAD_FILE_REQUEST_CODE = 2;
    private GameRound gameRound;
    private TextView tvHumanScore, tvComputerScore, tvTurnIndicator;
    private BoardView boardView;

    private LinearLayout layoutOne;
    private LinearLayout layoutMoveOptions;

    private GameController gameController;

    private int lastDiceSum = 0;

    // Overloaded factory method that accepts a GameRound
    public static GameFragment newInstance(GameRound loadedRound) {
        GameFragment fragment = new GameFragment();
        Bundle args = new Bundle();
        args.putSerializable("gameRound", loadedRound);
        fragment.setArguments(args);
        return fragment;
    }


    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Retrieve the GameRound from the Bundle if provided.
        if (getArguments() != null) {
            gameRound = (GameRound) getArguments().getSerializable("gameRound");
            assert gameRound != null;

            boolean isValid = TournamentController.getInstance().getCurrentGameMode().equals("LOADED");

            if (isValid) {
                gameRound.getComputer().setHasPlayed(true);
                gameRound.getHuman().setHasPlayed(true);
            }



        }
        // Otherwise, you can initialize a new GameRound if needed.
        if (gameRound == null) {
            gameRound = new GameRound(9); // Initialize a new GameRound if none was passed
        }
    }

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_game, container, false);
        // Find UI components
        tvHumanScore = view.findViewById(R.id.tvHumanScore);
        tvComputerScore = view.findViewById(R.id.tvComputerScore);
        tvTurnIndicator = view.findViewById(R.id.tvTurnIndicator);
        boardView = view.findViewById(R.id.boardView); // Assuming you have a BoardView in fragment_game.xml
        layoutOne = view.findViewById(R.id.linearLayout_one);
        layoutMoveOptions = view.findViewById(R.id.linearLayout_moveOptions);
        return view;
    }

    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        // Here you can initialize your UI components or set up listeners if needed
        // For example: setupGameUI(view);
        // Find the input button in the fragment's view hierarchy.

        // Retrieve the layouts from the fragment's view
        Button btnSave = view.findViewById(R.id.btnSave);
        btnSave.setOnClickListener(v -> {
            // Create an intent to let the user create a new document (text file)
            Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
            intent.addCategory(Intent.CATEGORY_OPENABLE);
            intent.setType("text/plain");
            intent.putExtra(Intent.EXTRA_TITLE, "game_save.txt"); // default file name
            startActivityForResult(intent, CREATE_FILE_REQUEST_CODE);
        });

        // Assume you add a new button for finishing the game.
        Button finishButton = view.findViewById(R.id.btnFinishGame);
        if (finishButton != null) {
            finishButton.setOnClickListener(v -> {
                // Navigate to the End fragment.
                requireActivity().getSupportFragmentManager().beginTransaction()
                        .replace(R.id.fragmentContainerView, new EndFragment())
                        .addToBackStack(null)
                        .commit();
            });
        }

        gameController = new GameController(gameRound, boardView);
        Button buttonInput = view.findViewById(R.id.btnInput);
        buttonInput.setOnClickListener(this::onClickButtonInput);

        Button btnConfirm = view.findViewById(R.id.btnConfirm);
        btnConfirm.setOnClickListener(this::onClickButtonConfirm);


        ToggleButton toggle = requireView().findViewById(R.id.toggleCoverUncover);
        toggle.setOnCheckedChangeListener((buttonView, isChecked) -> {
            // Here, if the toggle is checked, assume it means "Uncover" is active.
            // In your previous code, you were using: boolean isCovering = !toggle.isChecked();
            boolean isCovering = !isChecked;
            if (lastDiceSum > 0) {
                List<String> validMoves = gameController.calculateValidMoves(lastDiceSum, isCovering);
                Spinner spinnerOptions = requireView().findViewById(R.id.spinnerOptions);
                ArrayAdapter<String> adapter = new ArrayAdapter<>(requireActivity(),
                        android.R.layout.simple_spinner_item, validMoves);
                adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
                spinnerOptions.setAdapter(adapter);
            }
        });

        Button btnHelp = requireView().findViewById(R.id.btnHelpMove);
        btnHelp.setOnClickListener(v -> {
            // Check if it's the human's turn
            if (!gameRound.isHumanTurn()) {
                Toast.makeText(getActivity(), "Help is available only on your turn.", Toast.LENGTH_SHORT).show();
                return;
            }
            // Determine the move mode based on the toggle.
            ToggleButton toggle1 = requireView().findViewById(R.id.toggleCoverUncover);
            // In our convention, if toggle is checked, then it's "Uncover"; otherwise, it's "Cover."
            boolean isCovering = !toggle1.isChecked();
            String mode = isCovering ? "Cover" : "Uncover";

            // Make sure the dice have been rolled.
            if (lastDiceSum == 0) {
                Toast.makeText(getActivity(), "Please roll the dice first.", Toast.LENGTH_SHORT).show();
                return;
            }

            // Calculate valid moves using the lastDiceSum and current mode.
            TextView tvHelpAnswer = requireView().findViewById(R.id.tvHelpAnswer);
            tvHelpAnswer.setText(getHelpMessage(mode, lastDiceSum));
        });

        // In your GameFragment.java, inside onViewCreated() method:
        Button rollDiceButton = requireView().findViewById(R.id.btnRollDice);
        rollDiceButton.setOnClickListener(v -> {
            // Roll two dice using Random.
            int dice1 = (int) (Math.random() * 6) + 1;
            int dice2 = (int) (Math.random() * 6) + 1;
            int diceSum = dice1 + dice2;

            // Update UI with the dice results.
            TextView tvDiceResult = requireView().findViewById(R.id.tvDiceSum);
            tvDiceResult.setText("Dice rolled: " + dice1 + " and " + dice2 + " (Sum: " + diceSum + ")");

            // Decide whether the move should be covering or uncovering using our revised heuristic.
            boolean isCovering = gameController.shouldCover(diceSum);

            // Calculate valid moves available based on the dice sum and move type.
            List<String> validMoves = gameController.calculateValidMoves(diceSum, isCovering);

            // Determine the best move using our improved evaluation criteria.
            String bestMove = gameController.getBestMove(validMoves, isCovering);

            // Provide an explanation for the recommendation.
            String explanation = gameController.getExplanation(bestMove, isCovering);

            // Check whose turn it is.
            if (gameRound.isHumanTurn()) {
                // For human turn, update UI: show valid moves in a spinner and display recommendation.
                Spinner spinnerOptions = requireView().findViewById(R.id.spinnerOptions);
                ArrayAdapter<String> adapter = new ArrayAdapter<>(getActivity(),
                        android.R.layout.simple_spinner_item, validMoves);
                adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
                spinnerOptions.setAdapter(adapter);

                // Display the recommended move and its explanation (assumes you have a TextView for this).
                TextView tvHelpMoveExplanation = requireView().findViewById(R.id.tvHelpAnswer);
                tvHelpMoveExplanation.setText("Recommended move: " + bestMove + "\n" + explanation);

                // Optionally, switch to the move options layout if needed:
                View layoutDiceInput = requireView().findViewById(R.id.linearLayout_one);
                View layoutMoveOptions = requireView().findViewById(R.id.linearLayout_moveOptions);
                layoutDiceInput.setVisibility(View.GONE);
                layoutMoveOptions.setVisibility(View.VISIBLE);
            } else {
                // For computer turn, execute the move automatically.
                boolean computerMoved = gameController.playComputerTurnWithStrategy(diceSum);
                if (!computerMoved) {
                    // If the computer could not make a move, you might want to switch turns.
                    Toast.makeText(getActivity(), "Computer couldn't move. Switching turn...", Toast.LENGTH_SHORT).show();
                    gameRound.setHumanTurn(!gameRound.isHumanTurn());
                }

                // Update the UI to reflect the new board and scores.
                updateUI();
            }
        });


        updateUI();
    }

    public String getHelpMessage(String mode, int diceSum) {
        // Calculate valid moves using the existing method.
        // Convert mode to a boolean: Cover if mode equals "Cover"
        boolean isCovering = gameController.shouldCover(diceSum);
        List<String> validMoves = gameController.calculateValidMoves(diceSum, isCovering);
        String bestMove = gameController.getBestMove(validMoves, isCovering);
        String explanation = gameController.getExplanation(bestMove, isCovering);

        return "Recommended move type: " + mode +
                "\nBest move: " + bestMove +
                "\nWhy: " + explanation;
    }

    @Override
    public void onActivityCreated(@Nullable Bundle savedInstanceState) {
        super.onActivityCreated(savedInstanceState);
        // TODO: Use the ViewModel
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
//        if (requestCode == LOAD_FILE_REQUEST_CODE && resultCode == RESULT_OK) {
//            if (data != null) {
//                Uri fileUri = data.getData();
//                SaveLoadController saveLoadController = new SaveLoadController(requireActivity().getContentResolver());
//                String fileContent = saveLoadController.loadGameState(fileUri);
//                if (fileContent != null) {
//                    try {
//                        GameRound loadedRound = GameStateParser.parse(fileContent);
//                        GameFragment gameFragment = GameFragment.newInstance(loadedRound);
//                        getActivity().getSupportFragmentManager().beginTransaction()
//                                .replace(R.id.fragmentContainerView, gameFragment)
//                                .commit();
//                    } catch (Exception e) {
//                        e.printStackTrace();
//                        Toast.makeText(getActivity(), "Error parsing game state.", Toast.LENGTH_SHORT).show();
//                    }
//                }
//            }
//        }
    }

    private void writeGameSaveToFile(Uri uri) {
        try {
            OutputStream outputStream = requireActivity().getContentResolver().openOutputStream(uri);
            // Replace this string with your actual game save data
            String gameData = "Your game save data here...";
            assert outputStream != null;
            outputStream.write(gameData.getBytes());
            outputStream.close();
            Toast.makeText(getActivity(), "Game saved successfully.", Toast.LENGTH_SHORT).show();
        } catch (IOException e) {
            e.printStackTrace();
            Toast.makeText(getActivity(), "Error saving game.", Toast.LENGTH_SHORT).show();
        }
    }

    private void updateUI() {
        Human human = gameRound.getHuman();
        Computer computer = gameRound.getComputer();
        // Update scores
        tvHumanScore.setText("Your Score: " + human.getScore());
        tvComputerScore.setText("Computer Score: " + computer.getScore());
        // Update turn indicator
        tvTurnIndicator.setText(gameRound.isHumanTurn() ? "Your Turn" : "Computer Turn");
        // Update board text representations
        // Update custom board view if available
        if (boardView != null) {
            boardView.setBoard(gameRound.getBoard());
        }

        Button btnHelpMove = requireView().findViewById(R.id.btnHelpMove);

        if (gameRound.isHumanTurn()) {
            btnHelpMove.setVisibility(View.VISIBLE);
        } else {
            btnHelpMove.setVisibility(View.GONE);
        }
    }

    private void onClickButtonInput(View v) {
        LayoutInflater inflater = LayoutInflater.from(getActivity());
        View dialogView = inflater.inflate(R.layout.dialog_input, null);

        final EditText editTextDice1 = dialogView.findViewById(R.id.editTextDice1);
        final EditText editTextDice2 = dialogView.findViewById(R.id.editTextDice2);

        AlertDialog.Builder builder = new AlertDialog.Builder(getActivity());
        builder.setTitle("Input Move")
                .setView(dialogView)
                .setPositiveButton("Submit", (dialog, which) -> {
                    String dice1Str = editTextDice1.getText().toString().trim();
                    String dice2Str = editTextDice2.getText().toString().trim();

                    if (!dice1Str.isEmpty() && !dice2Str.isEmpty()) {
                        int dice1 = Integer.parseInt(dice1Str);
                        int dice2 = Integer.parseInt(dice2Str);

                        if (dice1 >= 1 && dice1 <= 6 && dice2 >= 1 && dice2 <= 6) {
                            int diceSum = dice1 + dice2;
                            lastDiceSum = diceSum; // Save the dice sum for future updates

                            // For this example, we assume a move for covering own squares.
                            boolean isCovering = true;

                            if (gameRound.isHumanTurn()) {
                                // Calculate the valid moves when it's the human's turn.
                                List<String> validMoves = gameController.calculateValidMoves(diceSum, isCovering);

                                // Update the spinner with these valid moves.
                                Spinner spinnerOptions = requireView().findViewById(R.id.spinnerOptions);
                                ArrayAdapter<String> adapter = new ArrayAdapter<>(requireActivity(),
                                        android.R.layout.simple_spinner_item, validMoves);
                                adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
                                spinnerOptions.setAdapter(adapter);

                                // Hide the input layout and show move options layout.
                                layoutOne.setVisibility(View.GONE);
                                layoutMoveOptions.setVisibility(View.VISIBLE);
                            } else {
                                // It's the computer's turn.
                                boolean computerMoved = gameController.playComputerTurnWithStrategy(diceSum);
                                if (!computerMoved) {
                                    // If no valid move was possible (for both cover and uncover),
                                    // switch the turn.
//                                    gameRound.setHumanTurn(!gameRound.isHumanTurn());
                                    Toast.makeText(getActivity(), "Computer couldn't move. Turn switched.", Toast.LENGTH_SHORT).show();
                                } else {
                                    gameRound.getCurrentPlayer().setHasPlayed(true);
                                    Toast.makeText(getActivity(), "Computer moved automatically.", Toast.LENGTH_SHORT).show();
                                }
                                updateUI();
                                if (checkWin()) {
                                    Log.d("GameFragment", "Game over after computer's turn.");
                                    return;
                                } else {
                                    Log.d("GameFragment", "Game continues after computer's turn.");
                                }
                            }

                        } else {
                            Toast.makeText(getActivity(), "Please enter dice values between 1 and 6.", Toast.LENGTH_SHORT).show();
                        }
                    } else {
                        Toast.makeText(getActivity(), "Please enter both dice values.", Toast.LENGTH_SHORT).show();
                    }
                })
                .setNegativeButton("Cancel", null)
                .show();
    }



    private void onClickButtonConfirm(View v) {
        // Retrieve the selected move from the spinner.
        Spinner spinnerOptions = requireView().findViewById(R.id.spinnerOptions);
        String selectedMove = (String) spinnerOptions.getSelectedItem();

        if (selectedMove == null || selectedMove.equals("No valid moves")) {
            // Since no valid move is made, switch turn.
            Toast.makeText(getActivity(), "No valid move selected", Toast.LENGTH_SHORT).show();
            gameRound.setHumanTurn(!gameRound.isHumanTurn());
            updateUI();  // Refresh UI after turn switch.
            layoutMoveOptions.setVisibility(View.GONE);
            layoutOne.setVisibility(View.VISIBLE);
            return;
        }

        // Parse the move string.
        // Our formatted string is like: "_, 2, _, 4, _, _, _, _, _"
        // We split by ", " and extract numbers.
        String[] tokens = selectedMove.split(", ");
        List<Integer> moveSquares = new ArrayList<>();
        for (String token : tokens) {
            if (!token.equals("_")) {
                try {
                    moveSquares.add(Integer.parseInt(token));
                } catch (NumberFormatException e) {
                    // Handle or log parsing error if needed.
                }
            }
        }

        // Determine the move type using the toggle button.
        // Assume the toggle shows "Cover" when off and "Uncover" when on.
        ToggleButton toggle = requireView().findViewById(R.id.toggleCoverUncover);
        boolean isCovering = !toggle.isChecked();

        // Apply the move to the board.
        boolean validMove = true;
        for (Integer square : moveSquares) {
            boolean currentTurn = gameRound.isHumanTurn();
            boolean success;
            if (isCovering) {
                // For a covering move:
                // If it's the human's turn, cover the human square;
                // if it's the computer's turn, cover the computer square.
                success = currentTurn ? gameRound.getBoard().coverHumanSquare(square)
                        : gameRound.getBoard().coverComputerSquare(square);
            } else {
                // For an uncovering move:
                // If it's the human's turn, uncover the computer square;
                // if it's the computer's turn, uncover the human square.
                success = currentTurn ? gameRound.getBoard().uncoverComputerSquare(square)
                        : gameRound.getBoard().uncoverHumanSquare(square);
            }
            if (!success) {
                validMove = false;
                break;
            }
        }

        if (validMove) {
            Toast.makeText(getActivity(), "Move confirmed", Toast.LENGTH_SHORT).show();
            gameRound.getCurrentPlayer().setHasPlayed(true);
        } else {
            Toast.makeText(getActivity(), "Invalid move. Turn switched.", Toast.LENGTH_SHORT).show();
            // Switch turn if the move was invalid.
            gameRound.setHumanTurn(!gameRound.isHumanTurn());
        }

        updateUI();  // Refresh the board display, scores, etc.

        // Check win conditions.
        // For this game, a win occurs if:
        // - The active player's own row is fully covered, OR
        // - The opponent's row is fully uncovered.

        if (checkWin()) return; // Exit early since the game is finished.


        updateUI();  // Assuming you have an updateUI() method in your fragment.

        // Reset the move layouts.
        layoutMoveOptions.setVisibility(View.GONE);
        layoutOne.setVisibility(View.VISIBLE);

        TextView tvHelpAnswer = requireView().findViewById(R.id.tvHelpAnswer);
        tvHelpAnswer.setText("");
    }

    private boolean checkWin() {
        boolean hasPlayed_human = gameRound.getHuman().hasPlayed();
        boolean hasPlayed_computer = gameRound.getComputer().hasPlayed();

        Log.d("GameFragment", "Checking win conditions: (Human played: " + hasPlayed_human + ", Computer Played: " + hasPlayed_computer + ")");
        if (hasPlayed_human && hasPlayed_computer) {
            if (gameRound.getBoard().isHumanComplete() || gameRound.getBoard().isComputerComplete()) {
                // Determine the winner based on whose turn it was when the move was applied.
                String winner = gameRound.isHumanTurn() ? "Human" : "Computer";

                // Delegate finishing the game to the controller (business logic).
                gameController.finishGame(winner);  // e.g., update tournament scores, etc.

                // Inform the user.
                Toast.makeText(getActivity(), winner + " wins!", Toast.LENGTH_LONG).show();

                // Assume 'finishedRound' is your GameRound instance representing the completed game round.
                EndFragment endFragment = EndFragment.newInstance( gameRound ); // Call the newInstance() factory
                getActivity().getSupportFragmentManager().beginTransaction()
                        .replace(R.id.fragmentContainerView, endFragment)
                        .commit();

                // Navigate to the End screen.
                requireActivity().getSupportFragmentManager().beginTransaction()
                        .replace(R.id.fragmentContainerView, endFragment)
                        .commit();
                return true;
            } else {
                // If the game isn't finished, switch the turn for the next move.
//                gameRound.setHumanTurn(!gameRound.isHumanTurn());
            }
        }
        return false;
    }
}