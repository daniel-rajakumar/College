package com.example.oplcanoga.view;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

import com.example.oplcanoga.R;

/**
 * Activity for displaying the results of a single round.
 * Shows the round winner, win type, points awarded, and current total scores.
 * Offers options to play the next round or quit the tournament.
 */
public class RoundResultActivity extends AppCompatActivity {

    private TextView tvRoundWinner;
    private TextView tvRoundWinType;
    private TextView tvRoundPoints;
    private TextView tvTotalScores;
    private Button btnPlayAgain;
    private Button btnQuitTournament;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_round_result);

        tvRoundWinner = findViewById(R.id.tvRoundWinner);
        tvRoundWinType = findViewById(R.id.tvRoundWinType);
        tvRoundPoints = findViewById(R.id.tvRoundPoints);
        tvTotalScores = findViewById(R.id.tvTotalScores);
        btnPlayAgain = findViewById(R.id.btnPlayAgain);
        btnQuitTournament = findViewById(R.id.btnQuitTournament);

        Intent intent = getIntent();
        String winner = intent.getStringExtra("ROUND_WINNER");
        String winType = intent.getStringExtra("ROUND_WIN_TYPE");
        int roundPoints = intent.getIntExtra("ROUND_POINTS", 0);
        int humanTotal = intent.getIntExtra("HUMAN_TOTAL", 0);
        int computerTotal = intent.getIntExtra("COMPUTER_TOTAL", 0);
        int boardSize = intent.getIntExtra("BOARD_SIZE", 9);

        if (winner == null) winner = "Draw";
        if (winType == null) winType = "-";

        tvRoundWinner.setText("Winner: " + winner);
        tvRoundWinType.setText("Win Type: " + winType);
        tvRoundPoints.setText("Points this round: " + roundPoints);
        tvTotalScores.setText("Total — Human: " + humanTotal + " | Computer: " + computerTotal);

        btnPlayAgain.setOnClickListener(v -> {
            Intent result = new Intent();
            result.putExtra("ROUND_ACTION", "PLAY_AGAIN");
            setResult(RESULT_OK, result);
            finish();
        });

        btnQuitTournament.setOnClickListener(v -> {
            Intent result = new Intent();
            result.putExtra("ROUND_ACTION", "QUIT_TOURNAMENT");
            setResult(RESULT_OK, result);
            finish();
        });
    }
}
