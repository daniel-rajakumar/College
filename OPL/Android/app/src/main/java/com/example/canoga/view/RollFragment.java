package com.example.canoga.view;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.RadioGroup;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import com.example.canoga.R;
import com.example.canoga.model.GameRound;

import java.util.concurrent.atomic.AtomicInteger;

/**
 * Fragment that handles dice rolling and selecting the starting player for the game.
 */
public class RollFragment extends Fragment {

    private Button buttonRoll;
    private GameRound gameRound;

    /**
     * Default factory method to create a new instance of RollFragment.
     *
     * @return A new instance of RollFragment.
     */
    public static RollFragment newInstance() {
        return new RollFragment();
    }

    /**
     * Factory method to create a new instance of RollFragment with an initialized GameRound.
     *
     * @param gameRound The GameRound instance to be used.
     * @return A new instance of RollFragment.
     */
    public static RollFragment newInstance(GameRound gameRound) {
        RollFragment fragment = new RollFragment();
        Bundle args = new Bundle();
        args.putSerializable("gameRound", gameRound);
        fragment.setArguments(args);
        return fragment;
    }

    /**
     * Retrieves the GameRound from the fragment arguments.
     *
     * @param savedInstanceState Saved instance state.
     */
    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        if (getArguments() != null) {
            gameRound = (GameRound) getArguments().getSerializable("gameRound");
        } else {
            Toast.makeText(getActivity(), "No game data provided", Toast.LENGTH_SHORT).show();
        }
    }

    /**
     * Inflates the layout for this fragment.
     *
     * @param inflater LayoutInflater to use for inflating the view.
     * @param container Parent container.
     * @param savedInstanceState Saved instance state.
     * @return The inflated view for the fragment.
     */
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_roll, container, false);
    }

    /**
     * Initializes UI components and sets up event listeners for the dice roll.
     *
     * @param savedInstanceState Saved instance state.
     */
    @Override
    public void onActivityCreated(@Nullable Bundle savedInstanceState) {
        super.onActivityCreated(savedInstanceState);

        // Initialize the roll button.
        buttonRoll = requireView().findViewById(R.id.button_roll);
        // AtomicInteger is used here if there's a need to track the selected button mode.
        AtomicInteger buttonId = new AtomicInteger(buttonRoll.getId());

        buttonRoll.setOnClickListener(v -> {
            // Retrieve the selected mode from the RadioGroup.
            RadioGroup radioGroup = requireView().findViewById(R.id.radioGroupDiceMode);
            int selectedId = radioGroup.getCheckedRadioButtonId();

            if (selectedId == R.id.radioRandom) {
                // Random mode: roll dice randomly.
                buttonId.set(R.id.radioRandom);
                int dice1 = (int) (Math.random() * 6) + 1;
                int dice2 = (int) (Math.random() * 6) + 1;

                // Determine starting player based on dice outcome.
                if (dice1 > dice2) {
                    gameRound.setCurrentPlayer("Human");
                } else if (dice2 > dice1) {
                    gameRound.setCurrentPlayer("Computer");
                }
                Toast.makeText(getActivity(), "Random roll: " + dice1 + " and " + dice2, Toast.LENGTH_SHORT).show();
            } else if (selectedId == R.id.radioHuman) {
                gameRound.setCurrentPlayer("Human");
            } else if (selectedId == R.id.radioComputer) {
                gameRound.setCurrentPlayer("Computer");
            } else {
                Toast.makeText(getActivity(), "Please select a mode", Toast.LENGTH_SHORT).show();
                return;
            }

            // Transition to the GameFragment with the updated game round.
            GameFragment gameFragment = GameFragment.newInstance(gameRound);
            requireActivity().getSupportFragmentManager().beginTransaction()
                    .replace(R.id.fragmentContainerView, gameFragment)
                    .addToBackStack(null)
                    .commit();
        });
    }
}