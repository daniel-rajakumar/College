package com.example.canoga.view;

import android.os.Bundle;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import android.widget.Toast;
import com.example.canoga.R;
import com.example.canoga.controller.TournamentController;
import com.example.canoga.model.GameRound;
import java.util.Objects;

/**
 * Fragment that displays the tournament exit screen showing the overall winner.
 */
public class ExitFragment extends Fragment {

    private GameRound gameRound;

    /**
     * Default factory method to create a new instance of ExitFragment.
     *
     * @return A new instance of ExitFragment.
     */
    public static ExitFragment newInstance() {
        return new ExitFragment();
    }

    /**
     * Factory method to create a new instance of ExitFragment with game round data.
     *
     * @param gameRound The game round to add to the tournament record.
     * @return A new instance of ExitFragment with initialized data.
     */
    public static ExitFragment newInstance(GameRound gameRound) {
        ExitFragment fragment = new ExitFragment();
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
            // Retrieve game round from arguments if provided.
            gameRound = (GameRound) getArguments().getSerializable("gameRound");
        } else {
            Toast.makeText(getActivity(), "No game data provided", Toast.LENGTH_SHORT).show();
        }
    }

    /**
     * Inflates the layout for this fragment.
     *
     * @param inflater LayoutInflater to inflate views.
     * @param container Parent container.
     * @param savedInstanceState Saved instance state.
     * @return The inflated view.
     */
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_exit, container, false);
    }

    /**
     * Initializes UI elements and displays the tournament winner.
     *
     * @param savedInstanceState Saved instance state.
     */
    @Override
    public void onActivityCreated(@Nullable Bundle savedInstanceState) {
        super.onActivityCreated(savedInstanceState);
        // Locate the TextView that will display the tournament winner.
        TextView textViewWinner = requireView().findViewById(R.id.textView_winner);

        // Add the current round to the tournament record.
        TournamentController.getInstance().addRound(gameRound);

        // Display the overall tournament winner.
        textViewWinner.setText("Winner: " + TournamentController.getInstance().getTournamentWinner());
    }
}