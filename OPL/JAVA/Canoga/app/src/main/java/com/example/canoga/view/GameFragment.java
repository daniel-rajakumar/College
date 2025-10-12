package com.example.canoga.view;

import android.app.AlertDialog;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;
import android.widget.ToggleButton;

import com.example.canoga.controller.GameController;
import com.example.canoga.controller.TournamentController;
import com.example.canoga.model.Board;
import com.example.canoga.model.Computer;
import com.example.canoga.model.GameRound;
import com.example.canoga.model.Human;
import com.example.canoga.R;
import com.example.canoga.util.GameLogger;

import java.io.IOException;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Fragment that manages the game play. It handles dice rolling, move selection, and updating the UI accordingly.
 */
public class GameFragment extends Fragment {

    private static final int CREATE_FILE_REQUEST_CODE = 1;
    private static final int LOAD_FILE_REQUEST_CODE = 2;
    
    private GameRound gameRound;
    private TextView tvHumanScore, tvComputerScore, tvTurnIndicator, tvDiceSum, tvHelpAnswer, tvGameLog;
    private BoardView boardView;
    private LinearLayout layoutOne, layoutMoveOptions;
    private GameController gameController;
    private int lastDiceSum = 0;
    private String bestMove, explanation;

    /**
     * Factory method to create a new instance of GameFragment with a provided GameRound.
     * 
     * @param loadedRound The game round instance.
     * @return A new instance of GameFragment.
     */
    public static GameFragment newInstance(GameRound loadedRound) {
        GameFragment fragment = new GameFragment();
        Bundle args = new Bundle();
        args.putSerializable("gameRound", loadedRound);
        fragment.setArguments(args);
        return fragment;
    }

    /**
     * Initializes the fragment. Retrieves the game round from arguments or creates a new one.
     */
    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Initialize logger with activity context.
        if(getActivity() != null) {
            GameLogger.init(getActivity());
        }
        GameLogger.getInstance().clearLog();

        // Retrieve GameRound from arguments if available.
        if (getArguments() != null) {
            gameRound = (GameRound) getArguments().getSerializable("gameRound");
            if (gameRound != null && TournamentController.getInstance().getCurrentGameMode().equals("LOADED")) {
                gameRound.getComputer().setHasPlayed(true);
                gameRound.getHuman().setHasPlayed(true);
            }
        }
        // Create a new GameRound if none was provided.
        if (gameRound == null) {
            gameRound = new GameRound(9);
        }
    }

    /**
     * Inflates the layout for the fragment and initializes UI components.
     */
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_game, container, false);
        tvHumanScore = view.findViewById(R.id.tvHumanScore);
        tvComputerScore = view.findViewById(R.id.tvComputerScore);
        tvTurnIndicator = view.findViewById(R.id.tvTurnIndicator);
        boardView = view.findViewById(R.id.boardView);
        layoutOne = view.findViewById(R.id.linearLayout_one);
        layoutMoveOptions = view.findViewById(R.id.linearLayout_moveOptions);
        tvDiceSum = view.findViewById(R.id.tvDiceSum);
        tvGameLog = view.findViewById(R.id.tvGameLog);
        tvHelpAnswer = view.findViewById(R.id.tvHelpAnswer);
        return view;
    }

    /**
     * Sets up event listeners, initializes the game controller, and updates the UI.
     */
    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);

        Button btnSave = view.findViewById(R.id.btnSave);
        btnSave.setOnClickListener(v -> {
            Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
            intent.addCategory(Intent.CATEGORY_OPENABLE);
            intent.setType("text/plain");
            intent.putExtra(Intent.EXTRA_TITLE, "game_save.txt");
            startActivityForResult(intent, CREATE_FILE_REQUEST_CODE);
        });

        Button finishButton = view.findViewById(R.id.btnFinishGame);
        if (finishButton != null) {
            finishButton.setOnClickListener(v -> {
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
            if (!gameRound.isHumanTurn()) {
                Toast.makeText(getActivity(), "Help is available only on your turn.", Toast.LENGTH_SHORT).show();
                return;
            }
            // Set toggle to indicate uncover mode.
            ToggleButton toggle1 = requireView().findViewById(R.id.toggleCoverUncover);
            toggle1.setChecked(true);
            if (lastDiceSum == 0) {
                Toast.makeText(getActivity(), "Please roll the dice first.", Toast.LENGTH_SHORT).show();
                return;
            }
            tvHelpAnswer.setText(getHelpMessage("Cover", lastDiceSum));
        });

        Button rollDiceButton = requireView().findViewById(R.id.btnRollDice);
        rollDiceButton.setOnClickListener(v -> {
            // Roll two dice and update the UI.
            int dice1 = (int) (Math.random() * 6) + 1;
            int dice2 = (int) (Math.random() * 6) + 1;
            int diceSum = dice1 + dice2;
            lastDiceSum = diceSum;
            tvDiceSum.setText("Dice rolled: " + dice1 + " and " + dice2 + " (Sum: " + diceSum + ")");
            GameLogger.getInstance().log(gameRound.getCurrentPlayerName(), "Rolled: " + dice1 + " and " + dice2);
            
            boolean isCovering = gameController.shouldCover(diceSum);
            List<String> validMoves = gameController.calculateValidMoves(diceSum, isCovering);
            bestMove = gameController.getBestMove(validMoves, isCovering);
            explanation = gameController.getExplanation(bestMove, isCovering);
            
            if (gameRound.isHumanTurn()) {
                // Update move options for the human player.
                Spinner spinnerOptions = requireView().findViewById(R.id.spinnerOptions);
                ArrayAdapter<String> adapter = new ArrayAdapter<>(getActivity(),
                        android.R.layout.simple_spinner_item, validMoves);
                adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
                spinnerOptions.setAdapter(adapter);
                TextView tvHelpMoveExplanation = requireView().findViewById(R.id.tvHelpAnswer);
                tvHelpMoveExplanation.setText("Recommended move: " + bestMove + "\n" + explanation);
                layoutOne.setVisibility(View.GONE);
                layoutMoveOptions.setVisibility(View.VISIBLE);
            } else {
                // Let the computer play its turn.
                boolean computerMoved = gameController.playComputerTurnWithStrategy(diceSum);
                if (!computerMoved) {
                    Toast.makeText(getActivity(), "Computer couldn't move. Switching turn...", Toast.LENGTH_SHORT).show();
                    gameRound.setHumanTurn(!gameRound.isHumanTurn());
                } else {
                    gameRound.getCurrentPlayer().setHasPlayed(true);
                    Toast.makeText(getActivity(), "Computer moved automatically.", Toast.LENGTH_SHORT).show();
                }
                updateUI();
                if (checkWin()) {
                    return;
                }
            }
            tvHelpAnswer.setText("");
            updateUI();
        });

        updateUI();
    }

    /**
     * Constructs and returns a help message based on the dice sum and move mode.
     *
     * @param mode The move mode ("Cover" or "Uncover").
     * @param diceSum The sum of the dice.
     * @return A formatted help message string.
     */
    public String getHelpMessage(String mode, int diceSum) {
        boolean isCovering = gameController.shouldCover(diceSum);
        List<String> validMoves = gameController.calculateValidMoves(diceSum, isCovering);
        String bestMove = gameController.getBestMove(validMoves, isCovering);
        String explanation = gameController.getExplanation(bestMove, isCovering);
        mode = (isCovering ? "Cover" : "Uncover");
        return "(Un)cover: " + mode +
                "\nMove: " + bestMove +
                "\nWhy: " + explanation;
    }

    /**
     * Callback for results from activities (e.g., file creation).
     */
    @Override
    public void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        // Optional: handle file save/load events if needed.
    }

    /**
     * Writes game save data to the provided URI.
     *
     * @param uri Destination URI where game data will be written.
     */
    private void writeGameSaveToFile(Uri uri) {
        try {
            OutputStream outputStream = requireActivity().getContentResolver().openOutputStream(uri);
            String gameData = "Your game save data here...";
            if (outputStream != null) {
                outputStream.write(gameData.getBytes());
                outputStream.close();
                Toast.makeText(getActivity(), "Game saved successfully.", Toast.LENGTH_SHORT).show();
            }
        } catch (IOException e) {
            e.printStackTrace();
            Toast.makeText(getActivity(), "Error saving game.", Toast.LENGTH_SHORT).show();
        }
    }

    /**
     * Updates the UI elements based on the current game state.
     */
    private void updateUI() {
        Human human = gameRound.getHuman();
        Computer computer = gameRound.getComputer();
        tvHumanScore.setText("Your Score: " + human.getScore());
        tvComputerScore.setText("Computer Score: " + computer.getScore());
        tvTurnIndicator.setText(gameRound.isHumanTurn() ? "Your Turn" : "Computer Turn");
        if (boardView != null) {
            boardView.setBoard(gameRound.getBoard());
        }
        Button btnHelpMove = requireView().findViewById(R.id.btnHelpMove);
        btnHelpMove.setVisibility(gameRound.isHumanTurn() ? View.VISIBLE : View.GONE);
        // Update game log display.
        tvGameLog.setText(GameLogger.getInstance().getLogContent());
    }

    /**
     * Handles dice input through a custom dialog.
     *
     * @param v The view that is clicked.
     */
    private void onClickButtonInput(View v) {
        LayoutInflater inflater = LayoutInflater.from(getActivity());
        View dialogView = inflater.inflate(R.layout.dialog_input, null);

        // Initialize toggle buttons for dice inputs.
        ToggleButton[] dice1Buttons = {
            dialogView.findViewById(R.id.dice1_btn1),
            dialogView.findViewById(R.id.dice1_btn2),
            dialogView.findViewById(R.id.dice1_btn3),
            dialogView.findViewById(R.id.dice1_btn4),
            dialogView.findViewById(R.id.dice1_btn5),
            dialogView.findViewById(R.id.dice1_btn6)
        };
        ToggleButton[] dice2Buttons = {
            dialogView.findViewById(R.id.dice2_btn1),
            dialogView.findViewById(R.id.dice2_btn2),
            dialogView.findViewById(R.id.dice2_btn3),
            dialogView.findViewById(R.id.dice2_btn4),
            dialogView.findViewById(R.id.dice2_btn5),
            dialogView.findViewById(R.id.dice2_btn6)
        };

        final int[] selectedDice1 = {0};
        final int[] selectedDice2 = {0};

        // Set click listeners for dice1 buttons.
        for (int i = 0; i < dice1Buttons.length; i++) {
            final int value = i + 1;
            dice1Buttons[i].setOnClickListener(v2 -> {
                for (ToggleButton btn : dice1Buttons) {
                    btn.setChecked(false);
                }
                ((ToggleButton) v2).setChecked(true);
                selectedDice1[0] = value;
            });
        }
        // Set click listeners for dice2 buttons.
        for (int i = 0; i < dice2Buttons.length; i++) {
            final int value = i + 1;
            dice2Buttons[i].setOnClickListener(v1 -> {
                for (ToggleButton btn : dice2Buttons) {
                    btn.setChecked(false);
                }
                ((ToggleButton) v1).setChecked(true);
                selectedDice2[0] = value;
            });
        }

        AlertDialog.Builder builder = new AlertDialog.Builder(getActivity());
        builder.setTitle("Input Move")
                .setView(dialogView)
                .setPositiveButton("Submit", (dialog, which) -> {
                    // Verify input and update dice values.
                    int dice1 = selectedDice1[0];
                    int dice2 = selectedDice2[0];
                    if (dice1 > 0 && dice2 > 0) {
                        lastDiceSum = dice1 + dice2;
                        tvDiceSum.setText("Dice rolled: " + dice1 + " and " + dice2 + " (Sum: " + lastDiceSum + ")");
                        GameLogger.getInstance().log(gameRound.getCurrentPlayerName(), "Input dice: " + dice1 + " and " + dice2);
                        
                        if (gameRound.isHumanTurn()) {
                            List<String> validMoves = gameController.calculateValidMoves(lastDiceSum, true);
                            Spinner spinnerOptions = requireView().findViewById(R.id.spinnerOptions);
                            ArrayAdapter<String> adapter = new ArrayAdapter<>(requireActivity(),
                                    android.R.layout.simple_spinner_item, validMoves);
                            adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
                            spinnerOptions.setAdapter(adapter);
                            layoutOne.setVisibility(View.GONE);
                            layoutMoveOptions.setVisibility(View.VISIBLE);
                        } else {
                            boolean computerMoved = gameController.playComputerTurnWithStrategy(lastDiceSum);
                            if (!computerMoved) {
                                Toast.makeText(getActivity(), "Computer couldn't move. Turn switched.", Toast.LENGTH_SHORT).show();
                            } else {
                                gameRound.getCurrentPlayer().setHasPlayed(true);
                                Toast.makeText(getActivity(), "Computer moved automatically.", Toast.LENGTH_SHORT).show();
                                GameLogger.getInstance().log("Computer", "Moved: " + bestMove);
                            }
                            updateUI();
                            if (checkWin()) {
                                return;
                            }
                        }
                    } else {
                        Toast.makeText(getActivity(), "Please enter both dice values.", Toast.LENGTH_SHORT).show();
                    }
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    /**
     * Handles confirming the selected move.
     *
     * @param v The clicked view.
     */
    private void onClickButtonConfirm(View v) {
        tvHelpAnswer.setText("");
        Spinner spinnerOptions = requireView().findViewById(R.id.spinnerOptions);
        String selectedMove = (String) spinnerOptions.getSelectedItem();
        if (selectedMove == null || selectedMove.equals("No valid moves")) {
            Toast.makeText(getActivity(), "No valid move selected", Toast.LENGTH_SHORT).show();
            gameRound.setHumanTurn(!gameRound.isHumanTurn());
            updateUI();
            layoutMoveOptions.setVisibility(View.GONE);
            layoutOne.setVisibility(View.VISIBLE);
            return;
        }

        // Parse selected move tokens.
        String[] tokens = selectedMove.split(", ");
        List<Integer> moveSquares = new ArrayList<>();
        for (String token : tokens) {
            if (!token.equals("_")) {
                try {
                    moveSquares.add(Integer.parseInt(token));
                } catch (NumberFormatException e) {
                    // Ignore invalid tokens.
                }
            }
        }

        ToggleButton toggle = requireView().findViewById(R.id.toggleCoverUncover);
        boolean isCovering = !toggle.isChecked();
        boolean validMove = true;
        // Execute move on board squares.
        for (Integer square : moveSquares) {
            boolean currentTurn = gameRound.isHumanTurn();
            boolean success;
            if (isCovering) {
                success = currentTurn ? gameRound.getBoard().coverHumanSquare(square)
                        : gameRound.getBoard().coverComputerSquare(square);
            } else {
                success = currentTurn ? gameRound.getBoard().uncoverComputerSquare(square)
                        : gameRound.getBoard().uncoverHumanSquare(square);
            }
            if (!success) {
                validMove = false;
                break;
            }
        }

        if (validMove) {
            GameLogger.getInstance().log(gameRound.getCurrentPlayerName(), "Moved: " + selectedMove);
            Toast.makeText(getActivity(), "Move confirmed", Toast.LENGTH_SHORT).show();
            gameRound.getCurrentPlayer().setHasPlayed(true);
        } else {
            GameLogger.getInstance().log(gameRound.getCurrentPlayerName(), "Tried to move: " + selectedMove);
            Toast.makeText(getActivity(), "Invalid move. Turn switched.", Toast.LENGTH_SHORT).show();
            gameRound.setHumanTurn(!gameRound.isHumanTurn());
        }

        updateUI();
        if (checkWin()) return;
        layoutMoveOptions.setVisibility(View.GONE);
        layoutOne.setVisibility(View.VISIBLE);
    }

    /**
     * Checks if the game has been won and transitions to the end fragment if so.
     *
     * @return true if the game is won; false otherwise.
     */
    private boolean checkWin() {
        Board b = gameRound.getBoard();

        String winner = null;
        if (b.isHumanComplete()) {
            winner = "Human";
        } else if (b.isComputerComplete()) {
            winner = "Computer";
        }

        if (winner == null) return false;

        int winnerScore = gameController.finishGame(winner);

        Toast.makeText(requireContext(), winner + " wins! +" + winnerScore + " pts", Toast.LENGTH_LONG).show();
        gameRound.setWinnerScore(winnerScore);
        gameRound.setWinner("Human".equals(winner) ? gameRound.getHuman() : gameRound.getComputer());

        if (isAdded()) {
            EndFragment endFragment = EndFragment.newInstance(gameRound);
            requireActivity().getSupportFragmentManager()
                    .beginTransaction()
                    .replace(R.id.fragmentContainerView, endFragment)
                    .addToBackStack(null)
                    .commit();
        }
        return true;
    }


    /**
     * Optionally refreshes the game log display.
     */
    private void refreshLogDisplay() {
        if (getView() != null) {
            TextView tvGameLog = getView().findViewById(R.id.tvGameLog);
            tvGameLog.setText(GameLogger.getInstance().getLogContent());
        }
    }


    private void maybeEndRound() {
        String winner = gameController.getWinner();
        if (!"None".equals(winner)) {
            int roundScore = gameController.finishGame(winner);

            // (Optional) stash winner/score in GameRound or a Bundle for EndFragment
            // gameRound.setWinnerName(winner); gameRound.setWinnerScore(roundScore);

            requireActivity().getSupportFragmentManager().beginTransaction()
                    .replace(R.id.fragmentContainerView, new EndFragment())
                    .addToBackStack(null)
                    .commit();
        }
    }

}
