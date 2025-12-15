package com.example.oplcanoga.view;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.RadioGroup;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

import com.example.oplcanoga.R;

import java.util.Random;

/**
 * Activity for setting up a new game or a new round.
 * Handles the selection of board size and the determination of who goes first via a dice roll-off.
 */
public class SetupActivity extends AppCompatActivity {

    private RadioGroup rgBoardSize;
    private TextView tvHumanDice;
    private TextView tvComputerDice;
    private TextView tvRollOffResult;
    private Button btnRollOff;
    private Button btnStartGame;

    // "HUMAN" or "COMPUTER" based on dice
    private String firstPlayerString = "HUMAN";
    private boolean isNextRoundMode = false;

    private final Random rng = new Random();

    // Track conditions for enabling Start button
    private boolean boardSizeChosen = false;
    private boolean rollOffDone = false;   // true only after non-tie roll-off

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

        // Start button disabled until:
        // 1) board size chosen  2) non-tie roll-off done
        btnStartGame.setEnabled(false);

        // When the user picks any board size, mark that as chosen
        rgBoardSize.setOnCheckedChangeListener((group, checkedId) -> {
            boardSizeChosen = (checkedId != -1);
            updateStartButtonState();
        });

        // Check if we are setting up a NEW GAME or a NEXT ROUND
        String mode = getIntent().getStringExtra("MODE");
        isNextRoundMode = "NEXT_ROUND".equals(mode);
        if (isNextRoundMode) {
            btnStartGame.setText("Start Next Round");
        }

        // Roll-off button -> do real dice roll-off
        btnRollOff.setOnClickListener(v -> doRollOff());

        btnStartGame.setOnClickListener(v -> {
            int boardSize = 9;
            int checkedId = rgBoardSize.getCheckedRadioButtonId();
            if (checkedId == R.id.rbSize10) {
                boardSize = 10;
            } else if (checkedId == R.id.rbSize11) {
                boardSize = 11;
            }

            if (isNextRoundMode) {
                // NEXT ROUND: send result back to GameActivity
                Intent result = new Intent();
                result.putExtra("BOARD_SIZE", boardSize);
                result.putExtra("FIRST_PLAYER", firstPlayerString);
                setResult(RESULT_OK, result);
                finish();
            } else {
                // NEW GAME: start GameActivity
                Intent intent = new Intent(this, GameActivity.class);
                intent.putExtra("BOARD_SIZE", boardSize);
                intent.putExtra("FIRST_PLAYER", firstPlayerString);
                startActivity(intent);
            }
        });
    }

    /**
     * Perform a 2d6 roll-off for Human vs Computer.
     * Updates the UI with the results and determines who goes first.
     * If there's a tie, the user must roll again.
     */
    private void doRollOff() {
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
            rollOffDone = true;
        } else if (computerTotal > humanTotal) {
            tvRollOffResult.setText("Computer goes first!");
            firstPlayerString = "COMPUTER";
            rollOffDone = true;
        } else {
            tvRollOffResult.setText("Tie — roll again!");
            rollOffDone = false;   // still no valid first player
        }

        updateStartButtonState();
    }

    /**
     * Enable Start button only when:
     * - a board size is chosen, and
     * - a non-tie roll-off has completed.
     */
    private void updateStartButtonState() {
        btnStartGame.setEnabled(boardSizeChosen && rollOffDone);
    }
}
