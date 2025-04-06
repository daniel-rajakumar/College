package com.example.canoga;

import static android.app.Activity.RESULT_OK;

import androidx.lifecycle.ViewModelProvider;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.OutputStream;
import java.util.Objects;

public class Game extends Fragment {

    private static final int CREATE_FILE_REQUEST_CODE = 1;
    private GameViewModel mViewModel;

    public static Game newInstance() {
        return new Game();
    }

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_game, container, false);
    }

    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        // Here you can initialize your UI components or set up listeners if needed
        // For example: setupGameUI(view);
        // Find the input button in the fragment's view hierarchy.
        Button buttonInput = view.findViewById(R.id.btnInput);

        buttonInput.setOnClickListener(v -> {
            // Inflate the custom layout for the dialog
            LayoutInflater inflater = LayoutInflater.from(getActivity());
            View dialogView = inflater.inflate(R.layout.dialog_input, null);

            // Get references to the EditText fields
            final EditText editTextDice1 = dialogView.findViewById(R.id.editTextDice1);
            final EditText editTextDice2 = dialogView.findViewById(R.id.editTextDice2);

            // Build the AlertDialog
            AlertDialog.Builder builder = new AlertDialog.Builder(getActivity());
            builder.setTitle("Input Move")
                    .setView(dialogView)
                    .setPositiveButton("Submit", new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialog, int which) {
                            // Retrieve input values
                            String dice1Str = editTextDice1.getText().toString().trim();
                            String dice2Str = editTextDice2.getText().toString().trim();

                            // Convert input to integers (with basic validation)
                            int dice1 = dice1Str.isEmpty() ? 0 : Integer.parseInt(dice1Str);
                            int dice2 = dice2Str.isEmpty() ? 0 : Integer.parseInt(dice2Str);

                            // TODO: Use the dice values in your game logic. For now, just show a Toast.
                            Toast.makeText(getActivity(),
                                    "Dice 1: " + dice1 + ", Dice 2: " + dice2,
                                    Toast.LENGTH_SHORT).show();
                        }
                    })
                    .setNegativeButton("Cancel", null)
                    .show();
        });

        Button btnSave = view.findViewById(R.id.btnSave);
        btnSave.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                // Create an intent to let the user create a new document (text file)
                Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("text/plain");
                intent.putExtra(Intent.EXTRA_TITLE, "game_save.txt"); // default file name
                startActivityForResult(intent, CREATE_FILE_REQUEST_CODE);
            }
        });
    }

    @Override
    public void onActivityCreated(@Nullable Bundle savedInstanceState) {
        super.onActivityCreated(savedInstanceState);
        mViewModel = new ViewModelProvider(this).get(GameViewModel.class);
        // TODO: Use the ViewModel
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == CREATE_FILE_REQUEST_CODE && resultCode == RESULT_OK) {
            if (data != null) {
                Uri fileUri = data.getData();
                // Write game save data to the file
                writeGameSaveToFile(fileUri);
            }
        }
    }

    private void writeGameSaveToFile(Uri uri) {
        try {
            OutputStream outputStream = requireActivity().getContentResolver().openOutputStream(uri);
            // Replace this string with your actual game save data
            String gameData = "Your game save data here...";
            assert outputStream != null;
            outputStream.write(gameData.getBytes());
            outputStream.close();
            Toast.makeText(getActivity(), "Game saved successfully.", Toast.LENGTH_SHORT).show();
        } catch (IOException e) {
            e.printStackTrace();
            Toast.makeText(getActivity(), "Error saving game.", Toast.LENGTH_SHORT).show();
        }
    }
}