package com.example.canoga.ui.main.fragment;

import android.os.Bundle;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.Spinner;

import com.example.canoga.R;
import com.example.canoga.controller.ConfigureController;

public class ConfigureFragment extends Fragment {
    private Spinner spinnerBoardSize;
    private Button btnNextConfig;
    private ConfigureController controller;

    public static ConfigureFragment newInstance() {
        return new ConfigureFragment();
    }

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_configure, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        spinnerBoardSize = view.findViewById(R.id.spinnerBoardSize);
        btnNextConfig = view.findViewById(R.id.btnNextConfig);
        controller = new ConfigureController();

        btnNextConfig.setOnClickListener(v -> {
            String selected = spinnerBoardSize.getSelectedItem().toString();
            int boardSize = Integer.parseInt(selected);
            // Update GameModel via controller
            controller.setBoardSize(boardSize);
            // Navigate to the Game screen (GameFragment)
            requireActivity().getSupportFragmentManager().beginTransaction()
                    .replace(R.id.fragmentContainerView, GameFragment.newInstance(controller.getNewGameRound()))
                    .addToBackStack(null)
                    .commit();
        });
    }
}
