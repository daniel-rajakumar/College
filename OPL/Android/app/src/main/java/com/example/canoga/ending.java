package com.example.canoga;

import androidx.appcompat.app.AppCompatActivity;

import android.os.Bundle;

import com.example.canoga.ui.main.EndingFragment;

public class ending extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_ending);
        if (savedInstanceState == null) {
            getSupportFragmentManager().beginTransaction()
                    .replace(R.id.container, EndingFragment.newInstance())
                    .commitNow();
        }
    }
}