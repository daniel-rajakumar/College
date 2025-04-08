package com.example.canoga.view;

import androidx.lifecycle.ViewModelProvider;

import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.Toast;

import com.example.canoga.R;
import com.example.canoga.model.GameRound;

import java.util.Objects;

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


        buttonRoll.setOnClickListener(v -> {
            requireActivity().getSupportFragmentManager().beginTransaction()
//                        .replace(R.id.fragmentContainerView, GameFragment.newInstance(newRound))
                    .replace(R.id.fragmentContainerView, GameFragment.newInstance(gameRound))
                    .addToBackStack(null)
                    .commit();
        });






    }

}