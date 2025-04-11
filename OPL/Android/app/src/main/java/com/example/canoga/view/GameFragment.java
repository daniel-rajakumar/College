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
import com.example.canoga.model.Computer;
import com.example.canoga.model.GameRound;
import com.example.canoga.model.Human;
import com.example.canoga.R;
import com.example.canoga.util.GameLogger;

import java.io.IOException;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

public class GameFragment extends Fragment {

    private static final int CREATE_FILE_REQUEST_CODE = 1;
    private static final int LOAD_FILE_REQUEST_CODE = 2;
    private GameRound gameRound;
    private TextView tvHumanScore, tvComputerScore, tvTurnIndicator, tvDiceSum, tvHelpAnswer;
    private BoardView boardView;
    private LinearLayout layoutOne;
    private LinearLayout layoutMoveOptions;
    private GameController gameController;
    private int lastDiceSum = 0;
    TextView tvGameLog;

    String bestMove, explanation;

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
        GameLogger.getInstance().ClearLog();

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
        // Otherwise, initialize a new GameRound if needed.
        if (gameRound == null) {
            gameRound = new GameRound(9);
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
        tvHelpAnswer = view.findViewById(R.id.tvHelpAnswer);
        return view;
    }

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
            ToggleButton toggle1 = requireView().findViewById(R.id.toggleCoverUncover);
            toggle1.setChecked(true);
            boolean isCovering = !toggle1.isChecked();
            String mode = isCovering ? "Cover" : "Uncover";
            if (lastDiceSum == 0) {
                Toast.makeText(getActivity(), "Please roll the dice first.", Toast.LENGTH_SHORT).show();
                return;
            }

            tvHelpAnswer.setText(getHelpMessage(mode, lastDiceSum));
        });

        Button rollDiceButton = requireView().findViewById(R.id.btnRollDice);
        rollDiceButton.setOnClickListener(v -> {
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
            } else {
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
                } else {
                }
            }
            tvHelpAnswer.setText("");
            updateUI();
        });

        updateUI();
    }

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

    @Override
    public void onActivityCreated(@Nullable Bundle savedInstanceState) {
        super.onActivityCreated(savedInstanceState);
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
            }
        } catch (IOException e) {
            e.printStackTrace();
            Toast.makeText(getActivity(), "Error saving game.", Toast.LENGTH_SHORT).show();
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
        ToggleButton dice1Btn1 = dialogView.findViewById(R.id.dice1_btn1);
        ToggleButton dice1Btn2 = dialogView.findViewById(R.id.dice1_btn2);
        ToggleButton dice1Btn3 = dialogView.findViewById(R.id.dice1_btn3);
        ToggleButton dice1Btn4 = dialogView.findViewById(R.id.dice1_btn4);
        ToggleButton dice1Btn5 = dialogView.findViewById(R.id.dice1_btn5);
        ToggleButton dice1Btn6 = dialogView.findViewById(R.id.dice1_btn6);
        ToggleButton dice2Btn1 = dialogView.findViewById(R.id.dice2_btn1);
        ToggleButton dice2Btn2 = dialogView.findViewById(R.id.dice2_btn2);
        ToggleButton dice2Btn3 = dialogView.findViewById(R.id.dice2_btn3);
        ToggleButton dice2Btn4 = dialogView.findViewById(R.id.dice2_btn4);
        ToggleButton dice2Btn5 = dialogView.findViewById(R.id.dice2_btn5);
        ToggleButton dice2Btn6 = dialogView.findViewById(R.id.dice2_btn6);

        final int[] selectedDice1 = {0};
        final int[] selectedDice2 = {0};

        // Store them in an array for ease of iteration:
        ToggleButton[] dice1Buttons = { dice1Btn1, dice1Btn2, dice1Btn3, dice1Btn4, dice1Btn5, dice1Btn6 };
        ToggleButton[] dice2Buttons = { dice2Btn1, dice2Btn2, dice2Btn3, dice2Btn4, dice2Btn5, dice2Btn6 };

        for (int i = 0; i < dice1Buttons.length; i++) {
            final int value = i + 1;
            dice1Buttons[i].setOnClickListener(v2 -> {
                // Clear the selected state for all buttons in this group
                for (ToggleButton btn : dice1Buttons) {
                    btn.setChecked(false);
                }
                // Mark the clicked button as selected
                ((ToggleButton) v2).setChecked(true);
                v2.refreshDrawableState();
                // Store the selected value (1 to 6)
                selectedDice1[0] = value;
            });
        }

        for (int i = 0; i < dice2Buttons.length; i++) {
            final int value = i + 1;
            dice2Buttons[i].setOnClickListener(v1 -> {
                // Clear the selected state for all buttons in this group
                for (ToggleButton btn : dice2Buttons) {
                    btn.setChecked(false);
                }
                // Mark the clicked button as selected
                ((ToggleButton) v1).setChecked(true);
                v1.refreshDrawableState();
                // Store the selected value (1 to 6)
                selectedDice2[0] = value;
            });
        }

        String dice1Str_ = selectedDice1[0] + "";
        String dice2Str_ = selectedDice2[0] + "";
        int dice1_ = Integer.parseInt(dice1Str_);
        int dice2_ = Integer.parseInt(dice2Str_);

        if (dice1_ > 0 && dice2_ > 0)
            GameLogger.getInstance().log(gameRound.getCurrentPlayerName(), "Input dice: " + dice1_ + " and " + dice2_);

        AlertDialog.Builder builder = new AlertDialog.Builder(getActivity());
        builder.setTitle("Input Move")
                .setView(dialogView)
                .setPositiveButton("Submit", (dialog, which) -> {
                    String dice1Str = selectedDice1[0] + "";
                    String dice2Str = selectedDice2[0] + "";

                    if (!dice1Str.isEmpty() && !dice2Str.isEmpty()) {
                        int dice1 = Integer.parseInt(dice1Str);
                        int dice2 = Integer.parseInt(dice2Str);
                        if (dice1 >= 1 && dice1 <= 6 && dice2 >= 1 && dice2 <= 6) {
                            int d = dice1 + dice2;
                            lastDiceSum = d;
                            tvDiceSum.setText("Dice rolled: " + dice1 + " and " + dice2 + " (Sum: " + lastDiceSum + ")");
                            GameLogger.getInstance().log(gameRound.getCurrentPlayerName(), "Input dice: " + dice1 + " and " + dice2);
                            boolean isCovering = true;
                            if (gameRound.isHumanTurn()) {
                                List<String> validMoves = gameController.calculateValidMoves(lastDiceSum, isCovering);
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
                                    Toast.makeText(getActivity(), "Computer moved: " + bestMove, Toast.LENGTH_SHORT).show();

                                    if (bestMove != null)
                                        GameLogger.getInstance().log("Computer", "Moved: " + bestMove);
////                                    tvHelpAnswer.setText("Computer moved: " + bestMove + " and " + explanation);
                                }
                                updateUI();
                                if (checkWin()) {
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

        String[] tokens = selectedMove.split(", ");
        List<Integer> moveSquares = new ArrayList<>();
        for (String token : tokens) {
            if (!token.equals("_")) {
                try {
                    moveSquares.add(Integer.parseInt(token));
                } catch (NumberFormatException e) {
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
                break;
            }
        }


        if (validMove) {
            GameLogger.getInstance().log(gameRound.getCurrentPlayerName(), "Moved: " + selectedMove);
            Toast.makeText(getActivity(), "Move confirmed", Toast.LENGTH_SHORT).show();
            gameRound.getCurrentPlayer().setHasPlayed(true);
        } else {
            GameLogger.getInstance().log(gameRound.getCurrentPlayerName(), "Tired to move: " + selectedMove);
            Toast.makeText(getActivity(), "Invalid move. Turn switched.", Toast.LENGTH_SHORT).show();
            gameRound.setHumanTurn(!gameRound.isHumanTurn());
        }

        updateUI();
        if (checkWin()) return;
        updateUI();
        layoutMoveOptions.setVisibility(View.GONE);
        layoutOne.setVisibility(View.VISIBLE);
    }

    private boolean checkWin() {
        boolean hasPlayed_human = gameRound.getHuman().hasPlayed();
        boolean hasPlayed_computer = gameRound.getComputer().hasPlayed();
        if (hasPlayed_human && hasPlayed_computer) {
            if (gameRound.getBoard().isHumanComplete() || gameRound.getBoard().isComputerComplete()) {
                String winner = gameRound.isHumanTurn() ? "Human" : "Computer";
                int winnerScore = gameController.finishGame(winner);
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
