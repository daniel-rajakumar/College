package com.example.oplcanoga.view;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.ScrollView;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;
import android.view.View;  // add this at the top with other imports


import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;

import com.example.oplcanoga.controller.BoardState;
import com.example.oplcanoga.controller.GameController;
import com.example.oplcanoga.controller.GameView;
import com.example.oplcanoga.model.Move;
import com.example.oplcanoga.model.PlayerId;
import com.example.oplcanoga.model.WinType;
import com.example.oplcanoga.R;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

public class GameActivity extends AppCompatActivity implements GameView {

    private BoardView boardView;
    private TextView tvGameStatus;
    private TextView tvScores;
    private TextView tvDice;
    private TextView tvLog;
    private TextView tvMoveLabel;
    private ScrollView scrollLog;

    private Button btnRollDie;
    private Button btnInputDie;
    private Button btnSaveGame;
    private Spinner spinnerMoves;
    private Button btnConfirmMove;
    private Button btnHelp;

    // Controller (middleman between UI and model)
    private GameController controller;

    // Spinner data: labels + backing Move objects (same index)
    private ArrayAdapter<String> movesAdapter;
    private final List<String> moveOptionLabels = new ArrayList<>();
    private final List<Move> moveOptionObjects = new ArrayList<>();

    private ActivityResultLauncher<Intent> saveGameLauncher;
    private ActivityResultLauncher<Intent> importGameLauncher;
    private ActivityResultLauncher<Intent> roundResultLauncher;
    private ActivityResultLauncher<Intent> setupNextRoundLauncher;

    private Button btnRollOneDie; // NEW







    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_game);

        boardView = findViewById(R.id.boardView);
        tvGameStatus = findViewById(R.id.tvGameStatus);
        tvScores = findViewById(R.id.tvScores);
        tvDice = findViewById(R.id.tvDice);
        tvLog = findViewById(R.id.tvLog);
        scrollLog = findViewById(R.id.scrollLog);

        btnRollDie = findViewById(R.id.btnRollDie);
        btnInputDie = findViewById(R.id.btnInputDie);
        btnSaveGame = findViewById(R.id.btnSaveGame);
        btnRollOneDie = findViewById(R.id.btnRollOneDie);

        spinnerMoves = findViewById(R.id.spinnerMoves);
        btnConfirmMove = findViewById(R.id.btnConfirmMove);
        btnHelp = findViewById(R.id.btnHelp);
        tvMoveLabel = findViewById(R.id.tvMoveLabel);


        saveGameLauncher = registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                result -> {
                    if (result.getResultCode() == Activity.RESULT_OK && result.getData() != null) {
                        Uri uri = result.getData().getData();
                        if (uri != null) {
                            try (OutputStream out = getContentResolver().openOutputStream(uri)) {
                                if (out != null) {
                                    String data = controller.exportState();
                                    out.write(data.getBytes(StandardCharsets.UTF_8));
                                    out.flush();
                                    Toast.makeText(this, "Game saved.", Toast.LENGTH_SHORT).show();
                                }
                            } catch (IOException e) {
                                Toast.makeText(this, "Failed to save game: " + e.getMessage(),
                                        Toast.LENGTH_LONG).show();
                            }
                        }
                    }
                }
        );

        roundResultLauncher = registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                result -> {
                    if (result.getResultCode() == Activity.RESULT_OK && result.getData() != null) {
                        String action = result.getData().getStringExtra("ROUND_ACTION");
                        if ("PLAY_AGAIN".equals(action)) {
                            // Same Tournament, next round with advantage + alternating first player
//                            controller.startNextRoundAuto();
                            Intent setupIntent = new Intent(this, SetupActivity.class);
                            setupIntent.putExtra("MODE", "NEXT_ROUND");
                            setupNextRoundLauncher.launch(setupIntent);
                        } else if ("QUIT_TOURNAMENT".equals(action)) {
                            int humanTotal = controller.getHumanTotalScore();
                            int computerTotal = controller.getComputerTotalScore();
                            PlayerId tournamentWinner = controller.getTournamentWinner();

                            Intent finalIntent = new Intent(this, FinalResultActivity.class);
                            finalIntent.putExtra("HUMAN_TOTAL", humanTotal);
                            finalIntent.putExtra("COMPUTER_TOTAL", computerTotal);
                            finalIntent.putExtra(
                                    "WINNER",
                                    (tournamentWinner != null) ? tournamentWinner.name() : "DRAW"
                            );
                            startActivity(finalIntent);
                            finish();
                        }
                    }
                }
        );

        setupNextRoundLauncher = registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                result -> {
                    if (result.getResultCode() == Activity.RESULT_OK && result.getData() != null) {
                        int boardSize = result.getData().getIntExtra("BOARD_SIZE", controller.getBoardSize());
                        String firstPlayerStr = result.getData().getStringExtra("FIRST_PLAYER");
                        if (firstPlayerStr == null) firstPlayerStr = "HUMAN";

                        controller.startNextRoundFromSetup(
                                boardSize,
                                PlayerId.valueOf(firstPlayerStr)
                        );
                    }
                }
        );




//        importGameLauncher = registerForActivityResult(
//                new ActivityResultContracts.StartActivityForResult(),
//                result -> {
//                    if (result.getResultCode() == Activity.RESULT_OK && result.getData() != null) {
//                        Uri uri = result.getData().getData();
//                        if (uri != null) {
//                            try (InputStream in = getContentResolver().openInputStream(uri)) {
//                                if (in != null) {
//                                    ByteArrayOutputStream baos = new ByteArrayOutputStream();
//                                    byte[] buffer = new byte[4096];
//                                    int n;
//                                    while ((n = in.read(buffer)) != -1) {
//                                        baos.write(buffer, 0, n);
//                                    }
//                                    String data = baos.toString(StandardCharsets.UTF_8.name());
//
//                                    // Launch GameActivity with imported state
//                                    Intent gameIntent = new Intent(this, GameActivity.class);
//                                    gameIntent.putExtra("IMPORTED_STATE", data);
//                                    startActivity(gameIntent);
//                                }
//                            } catch (IOException e) {
//                                Toast.makeText(this, "Failed to import game: " + e.getMessage(),
//                                        Toast.LENGTH_LONG).show();
//                            }
//                        }
//                    }
//                }
//        );






        // Setup spinner adapter
        movesAdapter = new ArrayAdapter<>(
                this,
                android.R.layout.simple_spinner_item,
                moveOptionLabels
        );
        movesAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerMoves.setAdapter(movesAdapter);

        // Initially, disable move selection until dice are rolled
        setMoveSelectionEnabled(false);
        setDiceButtonsVisible(true);   // visible at start of the round



        controller = new GameController(this);

        String importedState = getIntent().getStringExtra("IMPORTED_STATE");
        if (importedState != null) {
            // Start from a saved game
            controller.importState(importedState);
        } else {
            // Start a fresh game
            int boardSize = getIntent().getIntExtra("BOARD_SIZE", 9);
            String firstPlayerStr = getIntent().getStringExtra("FIRST_PLAYER");
            if (firstPlayerStr == null) firstPlayerStr = "HUMAN";
            PlayerId firstPlayer = PlayerId.valueOf(firstPlayerStr);
            controller.startNewTournament(boardSize, firstPlayer);
        }


        // Roll 1 die (when rules allow it)
        btnRollOneDie.setOnClickListener(v ->
                controller.onRollDiceButtonPressed(1));

// Roll 2 dice
        btnRollDie.setOnClickListener(v ->
                controller.onRollDiceButtonPressed(2));



        // "Input Die" => show dialog, then pass chosen dice to controller
        btnInputDie.setOnClickListener(v -> showInputDiceDialog());

        btnSaveGame.setOnClickListener(v -> {
            Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
            intent.addCategory(Intent.CATEGORY_OPENABLE);
            intent.setType("text/plain");
            intent.putExtra(Intent.EXTRA_TITLE, "canoga-save.txt");
            saveGameLauncher.launch(intent);
        });



        // Confirm selected move from spinner
        btnConfirmMove.setOnClickListener(v -> onConfirmMove());

        // Ask controller for help (uses computer strategy under the hood)
        btnHelp.setOnClickListener(v -> controller.onHelpRequested());
    }

    // ---------------- GameView implementation ----------------

    @Override
    public void updateBoard(BoardState state) {
        // Update the board drawing
        boardView.setBoardState(state);

        // Update scores
        String scoresText = "Human: " + state.humanScore +
                "  |  Computer: " + state.computerScore;
        tvScores.setText(scoresText);

        // Update status message
        String statusText;
        if (state.roundOver) {
            if (state.roundWinner != null) {
                statusText = "Round over. Winner: " + state.roundWinner;
            } else {
                statusText = "Round over. Draw.";
            }
        } else {
            statusText = "Current turn: " + state.currentPlayer;
        }
        tvGameStatus.setText(statusText);
    }

    @Override
    public void showDiceRoll(PlayerId player, int[] dice) {
        String text;
        if (dice.length == 1) {
            text = player + " rolled: " + dice[0] + " (" + toRoman(dice[0]) + ")";
        } else {
            int total = dice[0] + dice[1];
            text = player + " rolled: " +
                    dice[0] + " (" + toRoman(dice[0]) + "), " +
                    dice[1] + " (" + toRoman(dice[1]) + ") = " + total;
        }
        tvDice.setText(text);
        appendLog(text);

        // 🔽 hide dice controls once HUMAN has rolled
        if (player == PlayerId.HUMAN) {
            setDiceButtonsVisible(false);
        }
    }

    @Override
    public void showMessage(String message) {
        tvGameStatus.setText(message);
        appendLog(message);
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show();

        // If the human rolled and had no legal moves, we want the dice buttons back.
        // Also safe if it's the computer's "no legal moves" message – buttons are already visible.
        if (message.startsWith("No legal moves")) {
            // hide any move UI just in case and show dice buttons for the next player
            setMoveSelectionEnabled(false);
            setDiceButtonsVisible(true);
        }
    }


    @Override
    public void promptHumanForMove(int diceTotal,
                                   List<Move> coverMoves,
                                   List<Move> uncoverMoves) {
        moveOptionLabels.clear();
        moveOptionObjects.clear();

        // Add cover moves
        for (Move m : coverMoves) {
            moveOptionLabels.add(formatMoveLabel(m));
            moveOptionObjects.add(m);
        }
        // Add uncover moves
        for (Move m : uncoverMoves) {
            moveOptionLabels.add(formatMoveLabel(m));
            moveOptionObjects.add(m);
        }

        movesAdapter.notifyDataSetChanged();

        if (moveOptionObjects.isEmpty()) {
            showMessage("No legal moves available.");
            setMoveSelectionEnabled(false);
        } else {
            showMessage("Choose a move for total " + diceTotal + ".");
            spinnerMoves.setSelection(0);
            setMoveSelectionEnabled(true);
        }
    }


//    @Override
//    public void onRoundEnded(PlayerId winner,
//                             WinType winType,
//                             int winningScore,
//                             int humanTotalScore,
//                             int computerTotalScore) {
//
//        // Log + status text (you can keep what you already had if you like)
//        String winnerText;
//        if (winner == null) {
//            winnerText = "Round ended in a draw.";
//        } else {
//            winnerText = "Round winner: " + winner +
//                    " by " + winType +
//                    " (+" + winningScore + " points)";
//        }
//        appendLog(winnerText);
//        appendLog("Totals: Human " + humanTotalScore + " | Computer " + computerTotalScore);
//        tvGameStatus.setText(winnerText);
//
//        // Go to RoundResultActivity, but expect a result back
//        Intent intent = new Intent(this, RoundResultActivity.class);
//        intent.putExtra("WINNER", winner != null ? winner.name() : "DRAW");
//        intent.putExtra("WIN_TYPE", winType != null ? winType.name() : "NONE");
//        intent.putExtra("ROUND_POINTS", winningScore);
//        intent.putExtra("HUMAN_TOTAL", humanTotalScore);
//        intent.putExtra("COMPUTER_TOTAL", computerTotalScore);
//
//        roundResultLauncher.launch(intent);
//    }

//    @Override
//    public void onRoundEnded(PlayerId winner,
//                             WinType winType,
//                             int winningScore,
//                             int humanTotalScore,
//                             int computerTotalScore) {
//
//        Intent intent = new Intent(this, RoundResultActivity.class);
//        intent.putExtra("WINNER", winner != null ? winner.name() : "DRAW");
//        intent.putExtra("WIN_TYPE", winType != null ? winType.name() : "NONE");
//        intent.putExtra("ROUND_POINTS", winningScore);
//        intent.putExtra("HUMAN_TOTAL", humanTotalScore);
//        intent.putExtra("COMPUTER_TOTAL", computerTotalScore);
//
//        roundResultLauncher.launch(intent);
//    }


    @Override
    public void onRoundEnded(PlayerId winner,
                             WinType winType,
                             int winningScore,
                             int humanTotalScore,
                             int computerTotalScore) {
        String winnerText;
        if (winner == null) {
            winnerText = "Round ended in a draw.";
        } else {
            winnerText = "Round winner: " + winner +
                    " by " + winType +
                    " (+" + winningScore + " points)";
        }
        String totals = "Total scores — Human: " + humanTotalScore +
                " | Computer: " + computerTotalScore;

        appendLog(winnerText);
        appendLog(totals);
        tvGameStatus.setText(winnerText + "\n" + totals);

        // Launch RoundResultActivity
        Intent intent = new Intent(this, RoundResultActivity.class);
        intent.putExtra("ROUND_WINNER", winner == null ? "Draw" : winner.name());
        intent.putExtra("ROUND_WIN_TYPE", winType == null ? "-" : winType.name());
        intent.putExtra("ROUND_POINTS", winningScore);
        intent.putExtra("HUMAN_TOTAL", humanTotalScore);
        intent.putExtra("COMPUTER_TOTAL", computerTotalScore);

        // also pass board size so "Play Again" can reuse it
        intent.putExtra("BOARD_SIZE", controller.getBoardSize()); // you may need to add getBoardSize() in GameController


        roundResultLauncher.launch(intent);
    }

    // ---------------- Dice dialog for "Input Die" ----------------

    private void showInputDiceDialog() {
        LayoutInflater inflater = LayoutInflater.from(this);
        android.view.View dialogView = inflater.inflate(R.layout.dialog_input_dice, null, false);

        AlertDialog dialog = new AlertDialog.Builder(this)
                .setView(dialogView)
                .create();

        final int[] selectedDie1 = {0};
        final int[] selectedDie2 = {0};



        bindDieRow(dialogView, R.id.btnDie1_1, R.id.btnDie1_2, R.id.btnDie1_3,
                R.id.btnDie1_4, R.id.btnDie1_5, R.id.btnDie1_6, selectedDie1);

        bindDieRow(dialogView, R.id.btnDie2_1, R.id.btnDie2_2, R.id.btnDie2_3,
                R.id.btnDie2_4, R.id.btnDie2_5, R.id.btnDie2_6, selectedDie2);

        Button btnDone = dialogView.findViewById(R.id.btnDialogDone);

        btnDone.setOnClickListener(v -> {
            if (selectedDie1[0] == 0 && selectedDie2[0] == 0) {
                Toast.makeText(this, "Please select at least one die.", Toast.LENGTH_SHORT).show();
                return;
            }

            if (selectedDie2[0] == 0) {
                // Only first die selected -> treat as 1-die roll
                controller.onManualDiceButtonPressed(selectedDie1[0], 0);
            } else {
                // Both dice selected -> treat as 2-dice roll
                controller.onManualDiceButtonPressed(selectedDie1[0], selectedDie2[0]);
            }

            dialog.dismiss();
        });

        dialog.show();
    }

    private void bindDieRow(android.view.View root,
                            int b1Id, int b2Id, int b3Id,
                            int b4Id, int b5Id, int b6Id,
                            int[] selectedHolder) {

        Button b1 = root.findViewById(b1Id);
        Button b2 = root.findViewById(b2Id);
        Button b3 = root.findViewById(b3Id);
        Button b4 = root.findViewById(b4Id);
        Button b5 = root.findViewById(b5Id);
        Button b6 = root.findViewById(b6Id);

        Button[] buttons = {b1, b2, b3, b4, b5, b6};

        for (int i = 0; i < buttons.length; i++) {
            final int value = i + 1; // die value 1..6
            Button btn = buttons[i];
            btn.setOnClickListener(v -> {
                selectedHolder[0] = value;
                // simple feedback: highlight selected button by changing alpha
                for (Button other : buttons) {
                    other.setAlpha(other == btn ? 1.0f : 0.5f);
                }
            });
        }
    }

    // ---------------- Move selection helpers ----------------

    private void onConfirmMove() {
        if (moveOptionObjects.isEmpty()) {
            appendLog("No move to confirm.");
            return;
        }
        int pos = spinnerMoves.getSelectedItemPosition();
        if (pos < 0 || pos >= moveOptionObjects.size()) {
            appendLog("No move selected.");
            return;
        }

        Move chosen = moveOptionObjects.get(pos);
        appendLog("Confirm move: " + formatMoveLabel(chosen));

        // Tell controller to apply the selected move
        controller.onHumanMoveChosen(chosen.getType(), chosen.getSquares());

        // Disable until next dice roll
        setMoveSelectionEnabled(false);
        setDiceButtonsVisible(true);   // 🔹 show Roll / Input / Save again
    }

    private String formatMoveLabel(Move m) {
        StringBuilder sb = new StringBuilder();
        sb.append(m.getType().name()).append(": [");
        List<Integer> squares = m.getSquares();
        for (int i = 0; i < squares.size(); i++) {
            sb.append(squares.get(i));
            if (i < squares.size() - 1) sb.append(", ");
        }
        sb.append("]");
        return sb.toString();
    }

    private void setMoveSelectionEnabled(boolean enabled) {
        int visibility = enabled ? View.VISIBLE : View.GONE;
        tvMoveLabel.setVisibility(visibility);
        spinnerMoves.setVisibility(visibility);
        btnConfirmMove.setVisibility(visibility);
        btnHelp.setVisibility(visibility);
    }

    private void setDiceButtonsVisible(boolean visible) {
        int visibility = visible ? View.VISIBLE : View.GONE;

        // These are always shown/hidden together
        btnRollDie.setVisibility(visibility);
        btnInputDie.setVisibility(visibility);
        btnSaveGame.setVisibility(visibility);

        // "Roll 1 Die" is special: only show when it's allowed
        if (!visible) {
            // If dice controls are hidden, always hide the 1-die button too
            btnRollOneDie.setVisibility(View.GONE);
            return;
        }

        // At this point, dice controls are visible.
        // Show 1-die button only if:
        //  - game has a controller & round
        //  - it's the human's turn
        //  - the round is not over
        //  - canHumanRollOneDie() says yes
        boolean canShowOneDie =
                controller != null
                        && !controller.isRoundOver()
                        && controller.getCurrentPlayer() == PlayerId.HUMAN
                        && controller.canHumanRollOneDie();

        btnRollOneDie.setVisibility(canShowOneDie ? View.VISIBLE : View.GONE);
    }


    // ---------------- Helpers ----------------

    private String toRoman(int n) {
        switch (n) {
            case 1: return "I";
            case 2: return "II";
            case 3: return "III";
            case 4: return "IV";
            case 5: return "V";
            case 6: return "VI";
            default: return "?";
        }
    }

    private void appendLog(String message) {
        String current = tvLog.getText().toString();
        tvLog.setText(current + (current.isEmpty() ? "" : "\n") + message);
        if (scrollLog != null) {
            scrollLog.post(() -> scrollLog.fullScroll(ScrollView.FOCUS_DOWN));
        }
    }

    /**
     * Ask the user what board size they want for the next round,
     * then tell the controller to start that round with the chosen size.
     */
    private void showNewRoundSetupDialog() {
        final String[] labels = {"9 squares", "10 squares", "11 squares"};
        final int[] sizes = {9, 10, 11};

        // Preselect current board size if possible
        int currentSize = controller.getBoardSize(); // you already have this in GameController
        int checkedIndex = 0;
        for (int i = 0; i < sizes.length; i++) {
            if (sizes[i] == currentSize) {
                checkedIndex = i;
                break;
            }
        }

        final int[] selectedIndex = {checkedIndex};

        new AlertDialog.Builder(this)
                .setTitle("Board size for next round")
                .setSingleChoiceItems(labels, checkedIndex, (dialog, which) -> {
                    selectedIndex[0] = which;
                })
                .setPositiveButton("OK", (dialog, which) -> {
                    int chosenSize = sizes[selectedIndex[0]];
                    controller.startNextRoundWithBoardSize(chosenSize);
                })
                .setNegativeButton("Cancel", null)
                .show();
    }




}
