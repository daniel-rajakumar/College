package com.example.oplcanoga.view;

import android.os.Bundle;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.ScrollView;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.ToggleButton;

import androidx.appcompat.app.AppCompatActivity;

//import com.example.oplcanoga.R;
import com.example.oplcanoga.R;
import com.example.oplcanoga.view.BoardView;

import java.util.ArrayList;
import java.util.List;

public class GameActivity extends AppCompatActivity {

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

    private ArrayAdapter<String> movesAdapter;
    private final List<String> moveOptions = new ArrayList<>(); // placeholder list for now

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
                moveOptions
        );
        movesAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerMoves.setAdapter(movesAdapter);

        // Dummy options just so the UI looks alive
        moveOptions.add("COVER: [7]");
        moveOptions.add("COVER: [1, 6]");
        moveOptions.add("UNCOVER: [3, 4]");
        movesAdapter.notifyDataSetChanged();

        btnRollOneDie.setOnClickListener(v -> appendLog("Clicked: Roll 1 Die"));
        btnRollTwoDice.setOnClickListener(v -> appendLog("Clicked: Roll 2 Dice"));
        btnHelp.setOnClickListener(v -> appendLog("Clicked: Help"));
        btnSaveQuit.setOnClickListener(v -> appendLog("Clicked: Save & Quit"));

        btnConfirmMove.setOnClickListener(v -> {
            String selected = (String) spinnerMoves.getSelectedItem();
            appendLog("Confirm Move: " + selected);
        });

        btnClearSelection.setOnClickListener(v -> {
            // In future, you might clear selected move or reset selection.
            spinnerMoves.setSelection(0);
            appendLog("Clicked: Clear Selection");
        });
    }

    private void appendLog(String message) {
        String current = tvLog.getText().toString();
        tvLog.setText(current + (current.isEmpty() ? "" : "\n") + message);
        if (scrollLog != null) {
            scrollLog.post(() -> scrollLog.fullScroll(ScrollView.FOCUS_DOWN));
        }
    }
}
