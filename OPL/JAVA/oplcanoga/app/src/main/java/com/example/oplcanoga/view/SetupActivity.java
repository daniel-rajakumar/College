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

        btnRollOff.setOnClickListener(v -> {
            java.util.Random rng = new java.util.Random();

            int h1 = rng.nextInt(6) + 1;
            int h2 = rng.nextInt(6) + 1;
            int c1 = rng.nextInt(6) + 1;
            int c2 = rng.nextInt(6) + 1;

            int humanTotal = h1 + h2;
            int computerTotal = c1 + c2;

            tvHumanDice.setText("Human: " + h1 + " + " + h2 + " = " + humanTotal);
            tvComputerDice.setText("Computer: " + c1 + " + " + c2 + " = " + computerTotal);

            if (humanTotal > computerTotal) {
                tvRollOffResult.setText("Human goes first!");
                firstPlayerString = "HUMAN";
            } else if (computerTotal > humanTotal) {
                tvRollOffResult.setText("Computer goes first!");
                firstPlayerString = "COMPUTER";
            } else {
                tvRollOffResult.setText("Tie — roll again!");
                // keep firstPlayerString unchanged until a non-tie
            }
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
