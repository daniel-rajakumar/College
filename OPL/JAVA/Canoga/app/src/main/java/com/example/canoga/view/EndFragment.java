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
import com.example.canoga.controller.TournamentController;
import com.example.canoga.model.GameRound;

/**
 * Fragment that displays the end of a game round, showing the final scores and winner.
 */
public class EndFragment extends Fragment {

    private GameRound finishedRound;

    /**
     * Factory method to create a new instance of EndFragment.
     *
     * @param gameRound The finished game round to display.
     * @return A new instance of EndFragment.
     */
    public static EndFragment newInstance(GameRound gameRound) {
        EndFragment fragment = new EndFragment();
        Bundle args = new Bundle();
        args.putSerializable("gameRound", gameRound);
        fragment.setArguments(args);
        return fragment;
    }

    /**
     * Retrieves the game round data from the fragment arguments.
     *
     * @param savedInstanceState Saved instance state.
     */
    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getArguments() != null) {
            finishedRound = (GameRound) getArguments().getSerializable("gameRound");
        } else {
            Toast.makeText(getActivity(), "No game data provided", Toast.LENGTH_SHORT).show();
        }
    }

    /**
     * Inflates the layout for this fragment.
     *
     * @param inflater LayoutInflater used to inflate views.
     * @param container Parent container.
     * @param savedInstanceState Saved instance state.
     * @return The inflated view.
     */
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_end, container, false);
    }

    /**
     * Initializes the UI elements with final score data and sets up button actions.
     *
     * @param savedInstanceState Saved instance state.
     */
    @Override
    public void onActivityCreated(@Nullable Bundle savedInstanceState) {
        super.onActivityCreated(savedInstanceState);

        // Default messages if no data available.
        String finalScoreText = "Final Score: Human N/A, Computer N/A";
        String winnerText = "Winner: N/A";

        if (finishedRound != null) {
            // Retrieve and display scores from finished round.
            int humanScore = finishedRound.getHuman().getScore();
            int computerScore = finishedRound.getComputer().getScore();
            finalScoreText = "Final Score: Human " + humanScore + ", Computer " + computerScore;
            
            // Retrieve and display winner details.
            String winner = finishedRound.getWinnerName();
            int winnerScore = finishedRound.getWinnerScore();
            winnerText = "Winner: " + winner + " (+" + winnerScore + ")";
        }

        View view = getView();
        if (view != null) {
            // Set final score and winner texts.
            TextView tvFinalScore = view.findViewById(R.id.tvFinalScore);
            TextView tvWinner = view.findViewById(R.id.tvWinner);
            tvFinalScore.setText(finalScoreText);
            tvWinner.setText(winnerText);

            // Setup the restart button to retry the game with previous scores.
            Button btnRestart = view.findViewById(R.id.btnRestart);
            btnRestart.setOnClickListener(v -> {
                TournamentController.getInstance().setCurrentGameMode("RESTART");

                // Prepare the configuration fragment with previous scores.
                BoardView.ConfigureFragment configFragment = BoardView.ConfigureFragment.newInstance();
                Bundle args = new Bundle();
                args.putInt("prevHumanScore", finishedRound.getHuman().getScore());
                args.putInt("prevComputerScore", finishedRound.getComputer().getScore());
                args.putString("nextAdvOwner", finishedRound.getNextAdvantageOwner().name());
                args.putInt("nextAdvSquare", finishedRound.getNextAdvantageSquare());
                configFragment.setArguments(args);

                // Replace current fragment with configuration fragment.
                requireActivity().getSupportFragmentManager().beginTransaction()
                        .replace(R.id.fragmentContainerView, configFragment)
                        .commit();
            });

            // Setup the main menu/exit button.
            Button btnMainMenu = view.findViewById(R.id.btnExit);
            btnMainMenu.setOnClickListener(v -> {
                // Navigate to the main menu (exit) fragment.
                ExitFragment exitFragment = ExitFragment.newInstance(finishedRound);
                requireActivity().getSupportFragmentManager().beginTransaction()
                        .replace(R.id.fragmentContainerView, exitFragment)
                        .addToBackStack(null)
                        .commit();
            });
        } else {
            Toast.makeText(getActivity(), "Error loading end screen", Toast.LENGTH_SHORT).show();
        }
    }
}
