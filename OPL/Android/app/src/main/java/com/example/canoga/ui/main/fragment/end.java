package com.example.canoga.ui.main.fragment;

import androidx.lifecycle.ViewModelProvider;
import android.os.Bundle;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import com.example.canoga.R;

public class end extends Fragment {

    public static end newInstance() {
        return new end();
    }

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_end, container, false);
    }

    @Override
    public void onActivityCreated(@Nullable Bundle savedInstanceState) {
        super.onActivityCreated(savedInstanceState);
        // TODO: Retrieve final scores and winner from ViewModel or arguments

        // For demonstration, we'll set some sample values
        String finalScoreText = "Final Score: Human 45, Computer 38";
        String winnerText = "Winner: Human";

        // Set texts on the UI elements
        View view = getView();
        if (view != null) {
            TextView tvFinalScore = view.findViewById(R.id.tvFinalScore);
            TextView tvWinner = view.findViewById(R.id.tvWinner);
            tvFinalScore.setText(finalScoreText);
            tvWinner.setText(winnerText);

            // Setup button listeners
            Button btnRestart = view.findViewById(R.id.btnRestart);
            Button btnMainMenu = view.findViewById(R.id.btnMainMenu);

            btnRestart.setOnClickListener(v -> {
                // Restart the game; for example, navigate back to the Game fragment.
                getActivity().getSupportFragmentManager().beginTransaction()
                        .replace(R.id.fragmentContainerView, new GameFragment())
                        .addToBackStack(null)
                        .commit();
            });

            btnMainMenu.setOnClickListener(new View.OnClickListener() {
                @Override
                public void onClick(View v) {
                    // Navigate to the Main Menu fragment (e.g., EndingFragment that uses fragment_main.xml)
                    getActivity().getSupportFragmentManager().beginTransaction()
                            .replace(R.id.fragmentContainerView, new StartFragment())
                            .addToBackStack(null)
                            .commit();
                }
            });
        } else {
            Toast.makeText(getActivity(), "Error loading end screen", Toast.LENGTH_SHORT).show();
        }
    }
}
