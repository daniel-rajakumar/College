package com.example.canoga;

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import com.example.canoga.view.StartFragment;

/**
 * MainActivity serves as the entry point of the application.
 * It sets the initial layout and loads the StartFragment.
 */
public class MainActivity extends AppCompatActivity {

    /**
     * Called when the activity is starting.
     *
     * @param savedInstanceState If the activity is being re-initialized after previously
     *                           being shut down then this Bundle contains the data it most
     *                           recently supplied. Otherwise, it is null.
     */
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Only add the StartFragment if this is a fresh launch (not a configuration change)
        if (savedInstanceState == null) {
            getSupportFragmentManager().beginTransaction()
                    .replace(R.id.fragmentContainerView, StartFragment.newInstance())
                    .commit();
        }
    }
}
