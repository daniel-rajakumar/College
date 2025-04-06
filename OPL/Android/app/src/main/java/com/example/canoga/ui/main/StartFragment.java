package com.example.canoga.ui.main;

import androidx.lifecycle.ViewModelProvider;

import android.os.Bundle;
import android.widget.Button;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import com.example.canoga.R;
import com.example.canoga.configure;

import java.util.Objects;

public class StartFragment extends Fragment {

    private MainViewModel mViewModel;

    public static StartFragment newInstance() {
        return new StartFragment();
    }

    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        mViewModel = new ViewModelProvider(this).get(MainViewModel.class);
        // TODO: Use the ViewModel
    }

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_start, container, false);
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        // Find the "Play" button (assume its ID is button2)
        Button playButton = view.findViewById(R.id.button2);
        playButton.setOnClickListener(v -> {
            // Navigate to the configuration fragment.
            requireActivity().getSupportFragmentManager().beginTransaction()
                    .replace(R.id.fragmentContainerView, new configure()) // new instance of your configuration fragment
                    .addToBackStack(null) // so user can navigate back if needed
                    .commit();
        });
    }


}