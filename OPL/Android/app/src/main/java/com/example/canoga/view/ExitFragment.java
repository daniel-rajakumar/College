package com.example.canoga.view;

import android.annotation.SuppressLint;
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

public class ExitFragment extends Fragment {

    private GameRound gameRound;


    public static ExitFragment newInstance() {
        return new ExitFragment();
    }

    public static ExitFragment newInstance(GameRound message) {
        ExitFragment fragment = new ExitFragment();
        Bundle args = new Bundle();
        args.putSerializable("gameRound", message);
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
        return inflater.inflate(R.layout.fragment_exit, container, false);
    }

    @SuppressLint("SetTextI18n")
    @Override
    public void onActivityCreated(@Nullable Bundle savedInstanceState) {
        super.onActivityCreated(savedInstanceState);
        // TODO: Use the ViewModel

        TextView textView_winner = requireView().findViewById(R.id.textView_winner);

        TournamentController.getInstance().addRound(gameRound);

        textView_winner.setText("Winner: " + TournamentController.getInstance().getTournamentWinner());
    }

}