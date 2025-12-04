package com.example.oplcanoga.view;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

import com.example.oplcanoga.R;

public class RoundResultActivity extends AppCompatActivity {

    private TextView tvRoundWinner;
    private TextView tvRoundPoints;
    private TextView tvRoundTotals;
    private Button btnPlayAgain;
    private Button btnQuitTournament;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_round_result);

        tvRoundWinner = findViewById(R.id.tvRoundWinner);
        tvRoundPoints = findViewById(R.id.tvRoundPoints);
        tvRoundTotals = findViewById(R.id.tvRoundTotals);
        btnPlayAgain = findViewById(R.id.btnPlayAgain);
        btnQuitTournament = findViewById(R.id.btnQuitTournament);

        // TODO: later, fill these with real data from Intent extras

        btnPlayAgain.setOnClickListener(v -> {
            // In the future: start next round with advantage rules
            Intent intent = new Intent(this, GameActivity.class);
            startActivity(intent);
        });

        btnQuitTournament.setOnClickListener(v -> {
            Intent intent = new Intent(this, FinalResultActivity.class);
            // TODO: pass final scores
            startActivity(intent);
        });
    }
}
