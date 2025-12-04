package com.example.oplcanoga.view;

import android.app.AlertDialog;
import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.ScrollView;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;
import android.view.View;  // add this at the top with other imports


import androidx.appcompat.app.AppCompatActivity;

import com.example.oplcanoga.controller.BoardState;
import com.example.oplcanoga.controller.GameController;
import com.example.oplcanoga.controller.GameView;
import com.example.oplcanoga.model.Move;
import com.example.oplcanoga.model.PlayerId;
import com.example.oplcanoga.model.WinType;
import com.example.oplcanoga.R;

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
        spinnerMoves = findViewById(R.id.spinnerMoves);
        btnConfirmMove = findViewById(R.id.btnConfirmMove);
        btnHelp = findViewById(R.id.btnHelp);
        tvMoveLabel = findViewById(R.id.tvMoveLabel);


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



        // --- Controller setup ---
        controller = new GameController(this);

        // You can later pass BOARD_SIZE and FIRST_PLAYER via Intent extras.
        // For now: default 9, HUMAN goes first.
        int boardSize = getIntent().getIntExtra("BOARD_SIZE", 9);
        String firstPlayerStr = getIntent().getStringExtra("FIRST_PLAYER");
        if (firstPlayerStr == null) firstPlayerStr = "HUMAN";
        PlayerId firstPlayer = PlayerId.valueOf(firstPlayerStr);
        controller.startNewTournament(boardSize, firstPlayer);

        // --- Button listeners ---

        // "Roll Die" => let controller roll 2 dice randomly for human
        btnRollDie.setOnClickListener(v -> controller.onRollDiceButtonPressed(2));


        // "Input Die" => show dialog, then pass chosen dice to controller
        btnInputDie.setOnClickListener(v -> showInputDiceDialog());

        // "Save Game" placeholder (wire to serializer later)
        btnSaveGame.setOnClickListener(v -> {
            appendLog("Clicked: Save Game (not implemented yet)");
            Toast.makeText(this, "Save Game not implemented yet", Toast.LENGTH_SHORT).show();
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

        startActivity(intent);
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
            if (selectedDie1[0] == 0 || selectedDie2[0] == 0) {
                Toast.makeText(this, "Please select both dice.", Toast.LENGTH_SHORT).show();
                return;
            }
            // Use controller to process a manual roll
            controller.onManualDiceButtonPressed(selectedDie1[0], selectedDie2[0]);
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
        btnRollDie.setVisibility(visibility);
        btnInputDie.setVisibility(visibility);
        btnSaveGame.setVisibility(visibility);
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
}
