package com.example.canoga.view;

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
import com.example.canoga.controller.GameController;
import com.example.canoga.controller.TournamentController;
import com.example.canoga.model.GameRound;

public class EndFragment extends Fragment {

    private GameRound finishedRound;

    public static EndFragment newInstance(GameRound gameRound) {
        EndFragment fragment = new EndFragment();
        Bundle args = new Bundle();
        args.putSerializable("gameRound", gameRound);
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getArguments() != null) {
            finishedRound = (GameRound) getArguments().getSerializable("gameRound");
        } else {
            Toast.makeText(getActivity(), "No game data provided", Toast.LENGTH_SHORT).show();
        }
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
                TournamentController.getInstance().setCurrentGameMode("RESTART");

                // Restart the game with the same settings
                BoardView.ConfigureFragment configFragment = BoardView.ConfigureFragment.newInstance();
                // Pass the previous round’s scores via the fragment arguments.
                Bundle args = new Bundle();
                args.putInt("prevHumanScore", finishedRound.getHuman().getScore());
                args.putInt("prevComputerScore", finishedRound.getComputer().getScore());
                configFragment.setArguments(args);

                // Navigate to the configuration fragment.
                requireActivity().getSupportFragmentManager().beginTransaction()
                        .replace(R.id.fragmentContainerView, configFragment)
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
