package com.example.canoga.view;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.Toast;

import com.example.canoga.controller.GameStateParser;
import com.example.canoga.controller.SaveLoadController;
import com.example.canoga.controller.TournamentController;
import com.example.canoga.model.GameRound;
import com.example.canoga.R;
import com.example.canoga.model.Tournament;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

/**
 * Fragment that represents the start screen of the game.
 * It provides options to start a new game or load a saved game.
 */
public class StartFragment extends Fragment {

    static final int LOAD_FILE_REQUEST_CODE = 2;

    /**
     * Factory method to create a new instance of StartFragment.
     *
     * @return A new instance of StartFragment.
     */
    public static StartFragment newInstance() {
        return new StartFragment();
    }

    /**
     * Inflates the start screen layout.
     *
     * @param inflater LayoutInflater used to inflate the view.
     * @param container Parent container.
     * @param savedInstanceState Saved instance state.
     * @return The inflated view.
     */
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_start, container, false);
    }

    /**
     * Called when the activity's onCreate() method has returned.
     * Currently, no additional initialization is required.
     *
     * @param savedInstanceState Saved instance state.
     */
    @Override
    public void onActivityCreated(@Nullable Bundle savedInstanceState) {
        super.onActivityCreated(savedInstanceState);
        // Future enhancement: Load any required data from a ViewModel.
    }

    /**
     * Sets up the UI components and event listeners.
     *
     * @param view The root view for the fragment's layout.
     * @param savedInstanceState Saved instance state.
     */
    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        // "Play" button navigates to the game configuration screen.
        Button playButton = view.findViewById(R.id.button2);
        playButton.setOnClickListener(v -> {
            requireActivity().getSupportFragmentManager().beginTransaction()
                    .replace(R.id.fragmentContainerView, new BoardView.ConfigureFragment())
                    .addToBackStack(null)
                    .commit();
        });

        // "Load" button opens a file manager to select a saved game file.
        Button loadButton = view.findViewById(R.id.button3);
        loadButton.setOnClickListener(v -> {
            Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
            intent.addCategory(Intent.CATEGORY_OPENABLE);
            intent.setType("text/plain");
            startActivityForResult(intent, LOAD_FILE_REQUEST_CODE);
        });
    }

    /**
     * Handles results from file selection activities to load a saved game.
     *
     * @param requestCode The request code passed in startActivityForResult.
     * @param resultCode The result code returned by the activity.
     * @param data The Intent data returned.
     */
    @Override
    public void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == LOAD_FILE_REQUEST_CODE && resultCode == Activity.RESULT_OK) {
            if (data != null) {
                Uri fileUri = data.getData();
                // Use SaveLoadController to load the game state from the file.
                SaveLoadController saveLoadController = new SaveLoadController(requireActivity().getContentResolver());
                String fileContent = saveLoadController.loadGameState(fileUri);
                if (fileContent != null) {
                    try {
                        // Set the current game mode as LOADED.
                        TournamentController.getInstance().setCurrentGameMode("LOADED");
                        // Parse the game state from the file content.
                        GameRound loadedRound = GameStateParser.parse(fileContent);
                        // Transition to the GameFragment with the loaded game state.
                        GameFragment gameFragment = GameFragment.newInstance(loadedRound);
                        requireActivity().getSupportFragmentManager().beginTransaction()
                                .replace(R.id.fragmentContainerView, gameFragment)
                                .commit();
                    } catch (Exception e) {
                        e.printStackTrace();
                        Toast.makeText(getActivity(), "Error parsing game state.", Toast.LENGTH_SHORT).show();
                    }
                }
            }
        }
    }

    /**
     * Utility method to load file content from a URI.
     * Reads the file line-by-line and displays the content as a Toast.
     *
     * @param uri The URI of the file to load.
     */
    private void loadFileContent(Uri uri) {
        try {
            InputStream inputStream = requireActivity().getContentResolver().openInputStream(uri);
            if (inputStream != null) {
                BufferedReader reader = new BufferedReader(new InputStreamReader(inputStream));
                StringBuilder stringBuilder = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    stringBuilder.append(line).append("\n");
                }
                inputStream.close();
                String fileContent = stringBuilder.toString();
                Toast.makeText(getActivity(), "Loaded file:\n" + fileContent, Toast.LENGTH_LONG).show();
            }
        } catch (IOException e) {
            e.printStackTrace();
            Toast.makeText(getActivity(), "Error loading file.", Toast.LENGTH_SHORT).show();
        }
    }
}
