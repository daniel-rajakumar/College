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
import com.example.canoga.util.GameLogger;

import java.io.IOException;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class GameFragment extends Fragment {

    private static final int CREATE_FILE_REQUEST_CODE = 1;
    private static final int LOAD_FILE_REQUEST_CODE = 2;
    private GameRound gameRound;
    private TextView tvHumanScore, tvComputerScore, tvTurnIndicator, tvDiceSum;
    private BoardView boardView;
    private LinearLayout layoutOne;
    private LinearLayout layoutMoveOptions;
    private GameController gameController;
    private int lastDiceSum = 0;
    TextView tvGameLog;

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
        // Initialize the logger using the activity's context.
        if(getActivity() != null) {
            GameLogger.init(getActivity());
        }
        GameLogger.getInstance().log("GameFragment: onCreate() called.");

        // Retrieve the GameRound from the Bundle if provided.
        if (getArguments() != null) {
            gameRound = (GameRound) getArguments().getSerializable("gameRound");
            GameLogger.getInstance().log("GameFragment: Loaded game round from arguments.");
            assert gameRound != null;
            boolean isValid = TournamentController.getInstance().getCurrentGameMode().equals("LOADED");
            if (isValid) {
                gameRound.getComputer().setHasPlayed(true);
                gameRound.getHuman().setHasPlayed(true);
                GameLogger.getInstance().log("GameFragment: Loaded game round marked as LOADED mode.");
            }
        }
        // Otherwise, initialize a new GameRound if needed.
        if (gameRound == null) {
            gameRound = new GameRound(9);
            GameLogger.getInstance().log("GameFragment: Created new game round with board size 9.");
        }
    }

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_game, container, false);
        // Find UI components.
        tvHumanScore = view.findViewById(R.id.tvHumanScore);
        tvComputerScore = view.findViewById(R.id.tvComputerScore);
        tvTurnIndicator = view.findViewById(R.id.tvTurnIndicator);
        boardView = view.findViewById(R.id.boardView);
        layoutOne = view.findViewById(R.id.linearLayout_one);
        layoutMoveOptions = view.findViewById(R.id.linearLayout_moveOptions);
        tvDiceSum = view.findViewById(R.id.tvDiceSum);
        tvGameLog = view.findViewById(R.id.tvGameLog);
        return view;
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        GameLogger.getInstance().log("GameFragment: onViewCreated() called.");

        Button btnSave = view.findViewById(R.id.btnSave);
        btnSave.setOnClickListener(v -> {
            Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
            intent.addCategory(Intent.CATEGORY_OPENABLE);
            intent.setType("text/plain");
            intent.putExtra(Intent.EXTRA_TITLE, "game_save.txt");
            startActivityForResult(intent, CREATE_FILE_REQUEST_CODE);
            GameLogger.getInstance().log("GameFragment: Save button clicked; launching document creation.");
        });

        Button finishButton = view.findViewById(R.id.btnFinishGame);
        if (finishButton != null) {
            finishButton.setOnClickListener(v -> {
                GameLogger.getInstance().log("GameFragment: Finish Game button clicked.");
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
                GameLogger.getInstance().log("GameFragment: Toggle changed, updated move options.");
            }
        });

        Button btnHelp = requireView().findViewById(R.id.btnHelpMove);
        btnHelp.setOnClickListener(v -> {
            if (!gameRound.isHumanTurn()) {
                Toast.makeText(getActivity(), "Help is available only on your turn.", Toast.LENGTH_SHORT).show();
                return;
            }
            ToggleButton toggle1 = requireView().findViewById(R.id.toggleCoverUncover);
            boolean isCovering = !toggle1.isChecked();
            String mode = isCovering ? "Cover" : "Uncover";
            if (lastDiceSum == 0) {
                Toast.makeText(getActivity(), "Please roll the dice first.", Toast.LENGTH_SHORT).show();
                return;
            }
            TextView tvHelpAnswer = requireView().findViewById(R.id.tvHelpAnswer);
            String helpMsg = getHelpMessage(mode, lastDiceSum);
            tvHelpAnswer.setText(helpMsg);
            GameLogger.getInstance().log("GameFragment: Help requested - " + helpMsg);
        });

        Button rollDiceButton = requireView().findViewById(R.id.btnRollDice);
        rollDiceButton.setOnClickListener(v -> {
            int dice1 = (int) (Math.random() * 6) + 1;
            int dice2 = (int) (Math.random() * 6) + 1;
            int diceSum = dice1 + dice2;
            lastDiceSum = diceSum;
            tvDiceSum.setText("Dice rolled: " + dice1 + " and " + dice2 + " (Sum: " + diceSum + ")");
            GameLogger.getInstance().log("GameFragment: Dice rolled - " + dice1 + " and " + dice2 + " (Sum: " + diceSum + ")");

            boolean isCovering = gameController.shouldCover(diceSum);
            GameLogger.getInstance().log("GameFragment: Move type decided - " + (isCovering ? "Cover" : "Uncover"));
            List<String> validMoves = gameController.calculateValidMoves(diceSum, isCovering);
            String bestMove = gameController.getBestMove(validMoves, isCovering);
            String explanation = gameController.getExplanation(bestMove, isCovering);
            GameLogger.getInstance().log("GameFragment: Best move selected - " + bestMove + ". Explanation: " + explanation);

            if (gameRound.isHumanTurn()) {
                Spinner spinnerOptions = requireView().findViewById(R.id.spinnerOptions);
                ArrayAdapter<String> adapter = new ArrayAdapter<>(getActivity(),
                        android.R.layout.simple_spinner_item, validMoves);
                adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
                spinnerOptions.setAdapter(adapter);
                TextView tvHelpMoveExplanation = requireView().findViewById(R.id.tvHelpAnswer);
                tvHelpMoveExplanation.setText("Recommended move: " + bestMove + "\n" + explanation);
                View layoutDiceInput = requireView().findViewById(R.id.linearLayout_one);
                View layoutMoveOptions = requireView().findViewById(R.id.linearLayout_moveOptions);
                layoutDiceInput.setVisibility(View.GONE);
                layoutMoveOptions.setVisibility(View.VISIBLE);
                GameLogger.getInstance().log("GameFragment: Human turn - showing move options.");
            } else {
                boolean computerMoved = gameController.playComputerTurnWithStrategy(diceSum);
                if (!computerMoved) {
                    Toast.makeText(getActivity(), "Computer couldn't move. Switching turn...", Toast.LENGTH_SHORT).show();
                    GameLogger.getInstance().log("GameFragment: Computer move invalid, switching turn.");
                    gameRound.setHumanTurn(!gameRound.isHumanTurn());
                } else {
                    gameRound.getCurrentPlayer().setHasPlayed(true);
                    Toast.makeText(getActivity(), "Computer moved automatically.", Toast.LENGTH_SHORT).show();
                    GameLogger.getInstance().log("GameFragment: Computer move executed successfully.");
                }
                updateUI();
                if (checkWin()) {
                    GameLogger.getInstance().log("GameFragment: Game finished after computer's turn.");
                    return;
                } else {
                    GameLogger.getInstance().log("GameFragment: Game continues after computer's turn.");
                }
            }
            updateUI();
        });

        updateUI();
    }

    public String getHelpMessage(String mode, int diceSum) {
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
        GameLogger.getInstance().log("GameFragment: onActivityCreated() called.");
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        // Optionally log file save/load events.
    }

    private void writeGameSaveToFile(Uri uri) {
        try {
            OutputStream outputStream = requireActivity().getContentResolver().openOutputStream(uri);
            String gameData = "Your game save data here...";
            if (outputStream != null) {
                outputStream.write(gameData.getBytes());
                outputStream.close();
                Toast.makeText(getActivity(), "Game saved successfully.", Toast.LENGTH_SHORT).show();
                GameLogger.getInstance().log("GameFragment: Game state saved to file.");
            }
        } catch (IOException e) {
            e.printStackTrace();
            Toast.makeText(getActivity(), "Error saving game.", Toast.LENGTH_SHORT).show();
            GameLogger.getInstance().log("GameFragment: Error saving game state - " + e.getMessage());
        }
    }

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

        // Update the log display using the persistent log.
        String logContent = GameLogger.getInstance().getLogContent();
        tvGameLog.setText(logContent);
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
                            lastDiceSum = diceSum;
                            tvDiceSum.setText("Dice rolled: " + dice1 + " and " + dice2 + " (Sum: " + diceSum + ")");
                            GameLogger.getInstance().log("GameFragment: Manual dice input - " + dice1 + ", " + dice2 + " (Sum: " + diceSum + ")");
                            boolean isCovering = true;
                            if (gameRound.isHumanTurn()) {
                                List<String> validMoves = gameController.calculateValidMoves(diceSum, isCovering);
                                Spinner spinnerOptions = requireView().findViewById(R.id.spinnerOptions);
                                ArrayAdapter<String> adapter = new ArrayAdapter<>(requireActivity(),
                                        android.R.layout.simple_spinner_item, validMoves);
                                adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
                                spinnerOptions.setAdapter(adapter);
                                layoutOne.setVisibility(View.GONE);
                                layoutMoveOptions.setVisibility(View.VISIBLE);
                                GameLogger.getInstance().log("GameFragment: Human manual input - move options displayed.");
                            } else {
                                boolean computerMoved = gameController.playComputerTurnWithStrategy(diceSum);
                                if (!computerMoved) {
                                    Toast.makeText(getActivity(), "Computer couldn't move. Turn switched.", Toast.LENGTH_SHORT).show();
                                    GameLogger.getInstance().log("GameFragment: Computer manual input - invalid move; switching turn.");
                                } else {
                                    gameRound.getCurrentPlayer().setHasPlayed(true);
                                    Toast.makeText(getActivity(), "Computer moved automatically.", Toast.LENGTH_SHORT).show();
                                    GameLogger.getInstance().log("GameFragment: Computer manual input - move executed.");
                                }
                                updateUI();
                                if (checkWin()) {
                                    GameLogger.getInstance().log("GameFragment: Game over after manual input move.");
                                    return;
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
        Spinner spinnerOptions = requireView().findViewById(R.id.spinnerOptions);
        String selectedMove = (String) spinnerOptions.getSelectedItem();
        if (selectedMove == null || selectedMove.equals("No valid moves")) {
            Toast.makeText(getActivity(), "No valid move selected", Toast.LENGTH_SHORT).show();
            gameRound.setHumanTurn(!gameRound.isHumanTurn());
            GameLogger.getInstance().log("GameFragment: No valid move; turn switched.");
            updateUI();
            layoutMoveOptions.setVisibility(View.GONE);
            layoutOne.setVisibility(View.VISIBLE);
            return;
        }

        String[] tokens = selectedMove.split(", ");
        List<Integer> moveSquares = new ArrayList<>();
        for (String token : tokens) {
            if (!token.equals("_")) {
                try {
                    moveSquares.add(Integer.parseInt(token));
                } catch (NumberFormatException e) {
                    GameLogger.getInstance().log("GameFragment: Error parsing move token: " + token);
                }
            }
        }

        ToggleButton toggle = requireView().findViewById(R.id.toggleCoverUncover);
        boolean isCovering = !toggle.isChecked();
        boolean validMove = true;
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
                GameLogger.getInstance().log("GameFragment: Invalid move detected for square: " + square);
                break;
            }
        }

        if (validMove) {
            Toast.makeText(getActivity(), "Move confirmed", Toast.LENGTH_SHORT).show();
            GameLogger.getInstance().log("GameFragment: Move confirmed: " + selectedMove);
            gameRound.getCurrentPlayer().setHasPlayed(true);
        } else {
            Toast.makeText(getActivity(), "Invalid move. Turn switched.", Toast.LENGTH_SHORT).show();
            GameLogger.getInstance().log("GameFragment: Move invalid; switching turn.");
            gameRound.setHumanTurn(!gameRound.isHumanTurn());
        }

        updateUI();
        if (checkWin()) return;
        updateUI();
        layoutMoveOptions.setVisibility(View.GONE);
        layoutOne.setVisibility(View.VISIBLE);
        TextView tvHelpAnswer = requireView().findViewById(R.id.tvHelpAnswer);
        tvHelpAnswer.setText("");
    }

    private boolean checkWin() {
        boolean hasPlayed_human = gameRound.getHuman().hasPlayed();
        boolean hasPlayed_computer = gameRound.getComputer().hasPlayed();
        GameLogger.getInstance().log("GameFragment: Checking win conditions (Human played: " + hasPlayed_human + ", Computer played: " + hasPlayed_computer + ")");
        if (hasPlayed_human && hasPlayed_computer) {
            if (gameRound.getBoard().isHumanComplete() || gameRound.getBoard().isComputerComplete()) {
                String winner = gameRound.isHumanTurn() ? "Human" : "Computer";
                int winnerScore = gameController.finishGame(winner);
                GameLogger.getInstance().log("GameFragment: " + winner + " wins the round with score: " + winnerScore);
                Toast.makeText(getActivity(), winner + " wins!", Toast.LENGTH_LONG).show();
                gameRound.setWinnerScore(winnerScore);
                gameRound.setWinner(gameRound.isHumanTurn() ? gameRound.getHuman() : gameRound.getComputer());
                EndFragment endFragment = EndFragment.newInstance(gameRound);
                requireActivity().getSupportFragmentManager().beginTransaction()
                        .replace(R.id.fragmentContainerView, endFragment)
                        .commit();
                return true;
            }
        }
        return false;
    }

    private void refreshLogDisplay() {
        if (getView() != null) {
            TextView tvGameLog = getView().findViewById(R.id.tvGameLog);
            String logContent = GameLogger.getInstance().getLogContent();
            tvGameLog.setText(logContent);
        }
    }
}
