package com.example.oplcanoga;

import android.content.Intent;
import android.os.Bundle;
import android.widget.Button;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

public class FinalResultActivity extends AppCompatActivity {

    private TextView tvFinalWinner;
    private TextView tvFinalScores;
    private Button btnBackToHome;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_final_result);

        tvFinalWinner = findViewById(R.id.tvFinalWinner);
        tvFinalScores = findViewById(R.id.tvFinalScores);
        btnBackToHome = findViewById(R.id.btnBackToHome);

        // TODO: fill these from Intent extras with real tournament scores

        btnBackToHome.setOnClickListener(v -> {
            Intent intent = new Intent(this, MainActivity.class);
            intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(intent);
            finish();
        });
    }
}
