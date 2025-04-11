package com.example.canoga.view;

import android.app.AlertDialog;
import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.RadioGroup;
import android.widget.Toast;

import com.example.canoga.R;
import com.example.canoga.model.GameRound;

import java.util.concurrent.atomic.AtomicInteger;

public class RollFragment extends Fragment {

    private Button buttonRoll;

    private GameRound gameRound;

    public static RollFragment newInstance() {
        return new RollFragment();
    }

    public static RollFragment newInstance(GameRound gameRound) {
        RollFragment fragment = new RollFragment();
        Bundle args = new Bundle();
        args.putSerializable("gameRound", gameRound);
        fragment.setArguments(args);
        return fragment;
    }

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (getArguments() != null) {
            gameRound  = (GameRound) getArguments().getSerializable("gameRound");
            // Handle the message if needed
        } else {
            Toast.makeText(getActivity(), "No game data provided", Toast.LENGTH_SHORT).show();
        }
    }

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_roll, container, false);
    }

    @Override
    public void onActivityCreated(@Nullable Bundle savedInstanceState) {
        super.onActivityCreated(savedInstanceState);
//        mViewModel = new ViewModelProvider(this).get(RollViewModel.class);
        // TODO: Use the ViewModel

        buttonRoll = requireView().findViewById(R.id.button_roll);
        AtomicInteger buttonId = new AtomicInteger(buttonRoll.getId());


        buttonRoll.setOnClickListener(v -> {
            // Get the selected mode from the RadioGroup:
            RadioGroup radioGroup = requireView().findViewById(R.id.radioGroupDiceMode);
            int selectedId = radioGroup.getCheckedRadioButtonId();

            if (selectedId == R.id.radioRandom) {
                buttonId.set(R.id.radioRandom);
                // Random mode: roll dice randomly.
                int dice1 = (int) (Math.random() * 6) + 1;
                int dice2 = (int) (Math.random() * 6) + 1;

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

            GameFragment gameFragment = GameFragment.newInstance(gameRound);
            // Optionally, store diceSum in gameRound or process it as needed.
            requireActivity().getSupportFragmentManager().beginTransaction()
                    .replace(R.id.fragmentContainerView, gameFragment)
                    .addToBackStack(null)
                    .commit();
        });


    }



}