package com.example.oplcanoga.view;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

import com.example.oplcanoga.R;

public class FinalResultActivity extends AppCompatActivity {

    private TextView tvFinalWinner;
    private TextView tvFinalScores;
    private TextView tvFinalSummary;
    private Button btnBackToHome;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_final_result);

        tvFinalWinner = findViewById(R.id.tvFinalWinner);
        tvFinalScores = findViewById(R.id.tvFinalScores);
        tvFinalSummary = findViewById(R.id.tvFinalSummary);
        btnBackToHome = findViewById(R.id.btnBackToHome);

        Intent intent = getIntent();
        int humanTotal = intent.getIntExtra("HUMAN_TOTAL", 0);
        int computerTotal = intent.getIntExtra("COMPUTER_TOTAL", 0);
        String winnerStr = intent.getStringExtra("WINNER");

        String winnerText;
        String summary;

        if ("DRAW".equals(winnerStr) || winnerStr == null) {
            winnerText = "Tournament Result: Draw";
            summary = "Both players ended with the same score.";
        } else {
            winnerText = "Tournament Winner: " + winnerStr;
            if ("HUMAN".equals(winnerStr)) {
                summary = "You outplayed the computer. Nice job!";
            } else if ("COMPUTER".equals(winnerStr)) {
                summary = "The computer won this time. Try again!";
            } else {
                summary = "Tournament completed.";
            }
        }

        tvFinalWinner.setText(winnerText);
        tvFinalScores.setText("Human: " + humanTotal + "  |  Computer: " + computerTotal);
        tvFinalSummary.setText(summary);

        btnBackToHome.setOnClickListener(v -> {
            Intent homeIntent = new Intent(this, MainActivity.class);
            homeIntent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(homeIntent);
            finish();
        });
    }
}
