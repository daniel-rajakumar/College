package com.example.oplcanoga.view;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

import com.example.oplcanoga.R;

/**
 * Activity for displaying the final results of a tournament.
 * Shows the overall winner, total scores, and a summary message.
 * Provides an option to return to the main menu.
 */
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
        
        String winnerText = intent.getStringExtra("WINNER_TEXT");
        String summary = intent.getStringExtra("SUMMARY_TEXT");

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
