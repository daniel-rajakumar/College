package com.example.oplcanoga.view;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.RadioGroup;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

import com.example.oplcanoga.R;

public class SetupActivity extends AppCompatActivity {

    private RadioGroup rgBoardSize;
    private TextView tvHumanDice;
    private TextView tvComputerDice;
    private TextView tvRollOffResult;
    private Button btnRollOff;
    private Button btnStartGame;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_setup);

        rgBoardSize = findViewById(R.id.rgBoardSize);
        tvHumanDice = findViewById(R.id.tvHumanDice);
        tvComputerDice = findViewById(R.id.tvComputerDice);
        tvRollOffResult = findViewById(R.id.tvRollOffResult);
        btnRollOff = findViewById(R.id.btnRollOff);
        btnStartGame = findViewById(R.id.btnStartGame);

        // TODO: later, roll dice & decide first player
        btnRollOff.setOnClickListener(v -> {
            // For now just pretend result:
            tvHumanDice.setText("Human: 8");
            tvComputerDice.setText("Computer: 6");
            tvRollOffResult.setText("Human goes first!");
        });

        btnStartGame.setOnClickListener(v -> {
            // Read board size choice (default 9 if nothing chosen)
            int boardSize = 9;
            int checkedId = rgBoardSize.getCheckedRadioButtonId();
            if (checkedId == R.id.rbSize10) {
                boardSize = 10;
            } else if (checkedId == R.id.rbSize11) {
                boardSize = 11;
            }

            // In the future, pass boardSize & first-player info to GameActivity via Intent extras
            Intent intent = new Intent(this, GameActivity.class);
            // intent.putExtra("BOARD_SIZE", boardSize);
            // intent.putExtra("FIRST_PLAYER", "HUMAN");
            startActivity(intent);
        });
    }
}
