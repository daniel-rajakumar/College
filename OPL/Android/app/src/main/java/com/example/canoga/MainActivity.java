package com.example.canoga;

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;

import com.example.canoga.view.StartFragment;

public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        if (savedInstanceState == null) {
            // Start with the main menu (StartFragment)
            getSupportFragmentManager().beginTransaction()
                    .replace(R.id.fragmentContainerView, StartFragment.newInstance())
                    .commit();
        }
    }
}
