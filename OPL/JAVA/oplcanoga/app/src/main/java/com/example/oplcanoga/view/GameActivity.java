package com.example.oplcanoga.view;

import android.app.AlertDialog;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.ScrollView;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.oplcanoga.R;
import com.example.oplcanoga.view.BoardView;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class GameActivity extends AppCompatActivity {

    private BoardView boardView;
    private TextView tvGameStatus;
    private TextView tvScores;
    private TextView tvDice;
    private TextView tvLog;
    private ScrollView scrollLog;

    private Button btnRollDie;
    private Button btnInputDie;
    private Button btnSaveGame;
    private Spinner spinnerMoves;
    private Button btnConfirmMove;
    private Button btnHelp;

    private final Random random = new Random();

    // Spinner data (for now: dummy options)
    private ArrayAdapter<String> movesAdapter;
    private final List<String> moveOptionLabels = new ArrayList<>();

    // Track last dice roll
    private int lastDie1 = 0;
    private int lastDie2 = 0;

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

        btnRollDie.setOnClickListener(v -> rollDiceRandom());

        btnInputDie.setOnClickListener(v -> showInputDiceDialog());

        btnSaveGame.setOnClickListener(v -> {
            appendLog("Clicked: Save Game (not implemented yet)");
            Toast.makeText(this, "Save Game not implemented yet", Toast.LENGTH_SHORT).show();
        });

        btnConfirmMove.setOnClickListener(v -> {
            String selected = (String) spinnerMoves.getSelectedItem();
            appendLog("Confirm move: " + selected);
            Toast.makeText(this, "Confirm: " + selected, Toast.LENGTH_SHORT).show();
            // Later: send this to GameController.onHumanMoveChosen(...)
            setMoveSelectionEnabled(false); // wait for next dice roll
        });

        btnHelp.setOnClickListener(v -> {
            appendLog("Clicked: Help");
            Toast.makeText(this, "Help (suggested move) not implemented yet", Toast.LENGTH_SHORT).show();
        });
    }

    // ---------- Dice handling ----------

    private void rollDiceRandom() {
        lastDie1 = random.nextInt(6) + 1; // 1..6
        lastDie2 = random.nextInt(6) + 1;

        onDiceRolled(lastDie1, lastDie2, "Random roll");
    }

    private void showInputDiceDialog() {
        LayoutInflater inflater = LayoutInflater.from(this);
        android.view.View dialogView = inflater.inflate(R.layout.dialog_input_dice, null, false);

        AlertDialog dialog = new AlertDialog.Builder(this)
                .setView(dialogView)
                .create();

        // Selected values (0 = not selected yet)
        final int[] selectedDie1 = {0};
        final int[] selectedDie2 = {0};

        // Helper to bind a group of 6 buttons to an int[0] holder
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
            lastDie1 = selectedDie1[0];
            lastDie2 = selectedDie2[0];
            onDiceRolled(lastDie1, lastDie2, "Manual input");
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

    private void onDiceRolled(int die1, int die2, String source) {
        String roman1 = toRoman(die1);
        String roman2 = toRoman(die2);
        String text = "Dice: " + die1 + " (" + roman1 + "), " + die2 + " (" + roman2 + ")";
        tvDice.setText(text);
        appendLog(source + " → " + text);

        // After any roll, populate spinner with some (fake for now) move options
        populateMovesForDice(die1 + die2);
        setMoveSelectionEnabled(true);
    }

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

    private void populateMovesForDice(int total) {
        moveOptionLabels.clear();
        // For now, just make some dummy labels so the UI looks alive
        moveOptionLabels.add("COVER: [" + total + "]");
        if (total > 1 && total < 7) {
            moveOptionLabels.add("COVER: [1, " + (total - 1) + "]");
        }
        moveOptionLabels.add("UNCOVER: [example]");
        movesAdapter.notifyDataSetChanged();
        if (!moveOptionLabels.isEmpty()) {
            spinnerMoves.setSelection(0);
        }
    }

    private void setMoveSelectionEnabled(boolean enabled) {
        spinnerMoves.setEnabled(enabled);
        btnConfirmMove.setEnabled(enabled);
        btnHelp.setEnabled(enabled);
    }

    // ---------- Log helper ----------

    private void appendLog(String message) {
        String current = tvLog.getText().toString();
        tvLog.setText(current + (current.isEmpty() ? "" : "\n") + message);
        if (scrollLog != null) {
            scrollLog.post(() -> scrollLog.fullScroll(ScrollView.FOCUS_DOWN));
        }
    }
}
