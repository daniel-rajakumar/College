package com.example.oplcanoga.view;

import android.os.Bundle;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.ScrollView;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;
import android.widget.ToggleButton;

import androidx.appcompat.app.AppCompatActivity;

import com.example.oplcanoga.R;
import com.example.oplcanoga.controller.BoardState;
import com.example.oplcanoga.controller.GameController;
import com.example.oplcanoga.controller.GameView;
import com.example.oplcanoga.model.Move;
import com.example.oplcanoga.model.MoveType;
import com.example.oplcanoga.model.PlayerId;
import com.example.oplcanoga.model.WinType;
import com.example.oplcanoga.view.BoardView;

import java.util.ArrayList;
import java.util.List;

public class GameActivity extends AppCompatActivity implements GameView {

    private BoardView boardView;
    private TextView tvGameStatus;
    private TextView tvScores;
    private TextView tvDice;
    private TextView tvLog;
    private ScrollView scrollLog;
    private Button btnRollOneDie;
    private Button btnRollTwoDice;
    private ToggleButton toggleCoverUncover;
    private Button btnHelp;
    private Button btnSaveQuit;
    private Spinner spinnerMoves;
    private Button btnConfirmMove;
    private Button btnClearSelection;

    private GameController controller;

    // Spinner backing data
    private ArrayAdapter<String> movesAdapter;
    private final List<String> moveOptionLabels = new ArrayList<>();
    private final List<Move> moveOptionObjects = new ArrayList<>(); // matches labels by index

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

        btnRollOneDie = findViewById(R.id.btnRollOneDie);
        btnRollTwoDice = findViewById(R.id.btnRollTwoDice);
        toggleCoverUncover = findViewById(R.id.toggleCoverUncover);
        btnHelp = findViewById(R.id.btnHelp);
        btnSaveQuit = findViewById(R.id.btnSaveQuit);
        spinnerMoves = findViewById(R.id.spinnerMoves);
        btnConfirmMove = findViewById(R.id.btnConfirmMove);
        btnClearSelection = findViewById(R.id.btnClearSelection);

        // Set up spinner adapter
        movesAdapter = new ArrayAdapter<>(
                this,
                android.R.layout.simple_spinner_item,
                moveOptionLabels
        );
        movesAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerMoves.setAdapter(movesAdapter);

        // Create controller (this Activity is the GameView)
        controller = new GameController(this);

        // Read setup data from Intent
        int boardSize = getIntent().getIntExtra("BOARD_SIZE", 9);
        String firstPlayerStr = getIntent().getStringExtra("FIRST_PLAYER");
        if (firstPlayerStr == null) firstPlayerStr = "HUMAN";
        PlayerId firstPlayer = PlayerId.valueOf(firstPlayerStr);

        controller.startNewTournament(boardSize, firstPlayer);

        // Button listeners → call controller methods
        btnRollOneDie.setOnClickListener(v -> controller.onHumanRollDice(1));
        btnRollTwoDice.setOnClickListener(v -> controller.onHumanRollDice(2));

        btnHelp.setOnClickListener(v -> controller.onHelpRequested());

        btnSaveQuit.setOnClickListener(v -> {
            appendLog("Clicked: Save & Quit (logic not implemented yet)");
            Toast.makeText(this, "Save & Quit not implemented yet", Toast.LENGTH_SHORT).show();
        });

        btnConfirmMove.setOnClickListener(v -> onConfirmMoveClicked());
        btnClearSelection.setOnClickListener(v -> onClearSelectionClicked());

        // Initially, no moves to choose
        setMoveSelectionEnabled(false);
    }

    // ---------------- GameView implementation ----------------

    @Override
    public void updateBoard(BoardState state) {
        // Update board
        boardView.setBoardState(state);

        // Update scores
        String scoresText = "Human: " + state.humanScore + "  |  Computer: " + state.computerScore;
        tvScores.setText(scoresText);

        // Update status / current player
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
            text = player + " rolled: " + dice[0];
        } else {
            text = player + " rolled: " + dice[0] + " + " + dice[1] + " = " +
                    (dice[0] + dice[1]);
        }
        tvDice.setText(text);
        appendLog(text);
    }

    @Override
    public void showMessage(String message) {
        tvGameStatus.setText(message);
        appendLog(message);
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
    }

    @Override
    public void promptHumanForMove(int diceTotal,
                                   List<Move> coverMoves,
                                   List<Move> uncoverMoves) {
        // Build spinner options from legal moves
        moveOptionLabels.clear();
        moveOptionObjects.clear();

        for (Move m : coverMoves) {
            moveOptionLabels.add(formatMoveLabel(m));
            moveOptionObjects.add(m);
        }
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

        // TODO later: navigate to RoundResultActivity with these values
        // For now, we can auto-start next round:
        controller.startNextRound(PlayerId.HUMAN);
    }

    // ----------------- helpers -----------------

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

    private void onConfirmMoveClicked() {
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
        appendLog("Confirm Move: " + formatMoveLabel(chosen));

        // Ask controller to apply this move
        controller.onHumanMoveChosen(chosen.getType(), chosen.getSquares());
        // After confirming, disable selection until next dice roll
        setMoveSelectionEnabled(false);
    }

    private void onClearSelectionClicked() {
        if (!moveOptionObjects.isEmpty()) {
            spinnerMoves.setSelection(0);
        }
        appendLog("Clicked: Clear Selection");
    }

    private void setMoveSelectionEnabled(boolean enabled) {
        spinnerMoves.setEnabled(enabled);
        btnConfirmMove.setEnabled(enabled);
        btnClearSelection.setEnabled(enabled);
    }

    private void appendLog(String message) {
        String current = tvLog.getText().toString();
        tvLog.setText(current + (current.isEmpty() ? "" : "\n") + message);
        if (scrollLog != null) {
            scrollLog.post(() -> scrollLog.fullScroll(ScrollView.FOCUS_DOWN));
        }
    }
}
