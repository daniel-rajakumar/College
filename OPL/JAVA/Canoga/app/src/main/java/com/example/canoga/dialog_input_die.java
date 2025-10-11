package com.example.canoga;

import androidx.lifecycle.ViewModelProvider;
import android.os.Bundle;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

/**
 * Fragment for inputting die values.
 * This fragment uses a ViewModel to manage its UI-related data.
 */
public class dialog_input_die extends Fragment {

//    private DialogInputDieViewModel mViewModel;

    /**
     * Factory method to create a new instance of dialog_input_die.
     *
     * @return A new instance of dialog_input_die.
     */
    public static dialog_input_die newInstance() {
        return new dialog_input_die();
    }

    /**
     * Inflates the dialog input layout.
     *
     * @param inflater The LayoutInflater object that can be used to inflate any views.
     * @param container The parent view that the fragment's UI should be attached to.
     * @param savedInstanceState Saved state for reconstruction.
     * @return The root View for the fragment's UI, or null.
     */
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.dialog_input, container, false);
    }

    /**
     * Called when the activity's onCreate() method has returned.
     * Initializes the ViewModel for this fragment.
     *
     * @param savedInstanceState Saved state for reconstruction.
     */
    @Override
    public void onActivityCreated(@Nullable Bundle savedInstanceState) {
        super.onActivityCreated(savedInstanceState);
        // Initialize the ViewModel for managing UI-related data.
//        mViewModel = new ViewModelProvider(this).get(DialogInputDieViewModel.class);
        // TODO: Add code to observe ViewModel data and update UI if needed.
    }
}