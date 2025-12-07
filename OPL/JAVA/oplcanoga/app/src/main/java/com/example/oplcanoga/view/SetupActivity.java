package com.example.oplcanoga.view;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.RadioGroup;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

//import com.example.oplcanoga.GameActivity;
import com.example.oplcanoga.R;

public class SetupActivity extends AppCompatActivity {

    private RadioGroup rgBoardSize;
    private TextView tvHumanDice;
    private TextView tvComputerDice;
    private TextView tvRollOffResult;
    private Button btnRollOff;
    private Button btnStartGame;

    // For now just store first player as a string ("HUMAN" / "COMPUTER")
    private String firstPlayerString = "HUMAN";
    private boolean isNextRoundMode = false;   // <--- add this

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

        // Check if we are setting up a NEW GAME or a NEXT ROUND
        String mode = getIntent().getStringExtra("MODE");
        isNextRoundMode = "NEXT_ROUND".equals(mode);

        if (isNextRoundMode) {
            btnStartGame.setText("Start Next Round");
        }

        // TODO: later make this a real roll-off with Dice
        btnRollOff.setOnClickListener(v -> {
            // Dummy roll-off for now:
            tvHumanDice.setText("Human: 8");
            tvComputerDice.setText("Computer: 6");
            tvRollOffResult.setText("Human goes first!");

            firstPlayerString = "HUMAN"; // or "COMPUTER" if computer wins
        });


        btnStartGame.setOnClickListener(v -> {
            int boardSize = 9;
            int checkedId = rgBoardSize.getCheckedRadioButtonId();
            if (checkedId == R.id.rbSize10) {
                boardSize = 10;
            } else if (checkedId == R.id.rbSize11) {
                boardSize = 11;
            }

            if (isNextRoundMode) {
                // 🔹 We are in "next round" mode: send result BACK to GameActivity
                Intent result = new Intent();
                result.putExtra("BOARD_SIZE", boardSize);
                result.putExtra("FIRST_PLAYER", firstPlayerString);
                setResult(RESULT_OK, result);
                finish();
            } else {
                // 🔹 Normal behavior: starting a brand new game
                Intent intent = new Intent(this, GameActivity.class);
                intent.putExtra("BOARD_SIZE", boardSize);
                intent.putExtra("FIRST_PLAYER", firstPlayerString);
                startActivity(intent);
            }
        });

    }
}
