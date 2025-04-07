package com.example.canoga.view;

import static android.app.Activity.RESULT_OK;

import android.app.AlertDialog;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;
import android.widget.ToggleButton;

import com.example.canoga.controller.GameController;
import com.example.canoga.controller.GameStateParser;
import com.example.canoga.controller.SaveLoadController;
import com.example.canoga.model.Computer;
import com.example.canoga.model.GameRound;
import com.example.canoga.model.Human;
import com.example.canoga.R;

import java.io.IOException;
import java.io.OutputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class GameFragment extends Fragment {

    private static final int CREATE_FILE_REQUEST_CODE = 1;
    private static final int LOAD_FILE_REQUEST_CODE = 2;
    private GameRound gameRound;
    private TextView tvHumanScore, tvComputerScore, tvTurnIndicator;
    private BoardView boardView;

    private LinearLayout layoutOne;
    private LinearLayout layoutMoveOptions;

    private GameController gameController;

    // Overloaded factory method that accepts a GameRound
    public static GameFragment newInstance(GameRound loadedRound) {
        GameFragment fragment = new GameFragment();
        Bundle args = new Bundle();
        args.putSerializable("gameRound", loadedRound);
        fragment.setArguments(args);
        return fragment;
    }


    @Override
    public void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Retrieve the GameRound from the Bundle if provided.
        if (getArguments() != null) {
            gameRound = (GameRound) getArguments().getSerializable("gameRound");
        }
        // Otherwise, you can initialize a new GameRound if needed.
        if (gameRound == null) {
            gameRound = new GameRound(9); // Initialize a new GameRound if none was passed
        }
    }

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_game, container, false);
        // Find UI components
        tvHumanScore = view.findViewById(R.id.tvHumanScore);
        tvComputerScore = view.findViewById(R.id.tvComputerScore);
        tvTurnIndicator = view.findViewById(R.id.tvTurnIndicator);
        boardView = view.findViewById(R.id.boardView); // Assuming you have a BoardView in fragment_game.xml
        layoutOne = view.findViewById(R.id.linearLayout_one);
        layoutMoveOptions = view.findViewById(R.id.linearLayout_moveOptions);
        return view;
    }

    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        // Here you can initialize your UI components or set up listeners if needed
        // For example: setupGameUI(view);
        // Find the input button in the fragment's view hierarchy.

        // Retrieve the layouts from the fragment's view
        Button btnSave = view.findViewById(R.id.btnSave);
        btnSave.setOnClickListener(v -> {
            // Create an intent to let the user create a new document (text file)
            Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
            intent.addCategory(Intent.CATEGORY_OPENABLE);
            intent.setType("text/plain");
            intent.putExtra(Intent.EXTRA_TITLE, "game_save.txt"); // default file name
            startActivityForResult(intent, CREATE_FILE_REQUEST_CODE);
        });

        // Assume you add a new button for finishing the game.
        Button finishButton = view.findViewById(R.id.btnFinishGame);
        if (finishButton != null) {
            finishButton.setOnClickListener(v -> {
                // Navigate to the End fragment.
                requireActivity().getSupportFragmentManager().beginTransaction()
                        .replace(R.id.fragmentContainerView, new end())
                        .addToBackStack(null)
                        .commit();
            });
        }

        gameController = new GameController(gameRound, boardView);
        Button buttonInput = view.findViewById(R.id.btnInput);
        buttonInput.setOnClickListener(this::onClickButtonInput);

        Button btnConfirm = view.findViewById(R.id.btnConfirm);
        btnConfirm.setOnClickListener(this::onClickButtonConfirm);


        updateUI();
    }

    @Override
    public void onActivityCreated(@Nullable Bundle savedInstanceState) {
        super.onActivityCreated(savedInstanceState);
        // TODO: Use the ViewModel
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == LOAD_FILE_REQUEST_CODE && resultCode == RESULT_OK) {
            if (data != null) {
                Uri fileUri = data.getData();
                SaveLoadController saveLoadController = new SaveLoadController(requireActivity().getContentResolver());
                String fileContent = saveLoadController.loadGameState(fileUri);
                if (fileContent != null) {
                    try {
                        GameRound loadedRound = GameStateParser.parse(fileContent);
                        GameFragment gameFragment = GameFragment.newInstance(loadedRound);
                        getActivity().getSupportFragmentManager().beginTransaction()
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

    private void updateUI() {
        Human human = gameRound.getHuman();
        Computer computer = gameRound.getComputer();
        // Update scores
        tvHumanScore.setText("Your Score: " + human.getScore());
        tvComputerScore.setText("Computer Score: " + computer.getScore());
        // Update turn indicator
        tvTurnIndicator.setText(gameRound.isHumanTurn() ? "Your Turn" : "Computer Turn");
        // Update board text representations
        // Update custom board view if available
        if (boardView != null) {
            boardView.setBoard(gameRound.getBoard());
        }
    }

    private void onClickButtonInput(View v) {
        LayoutInflater inflater = LayoutInflater.from(getActivity());
        View dialogView = inflater.inflate(R.layout.dialog_input, null);

        final EditText editTextDice1 = dialogView.findViewById(R.id.editTextDice1);
        final EditText editTextDice2 = dialogView.findViewById(R.id.editTextDice2);

        AlertDialog.Builder builder = new AlertDialog.Builder(getActivity());
        builder.setTitle("Input Move")
                .setView(dialogView)
                .setPositiveButton("Submit", (dialog, which) -> {
                    String dice1Str = editTextDice1.getText().toString().trim();
                    String dice2Str = editTextDice2.getText().toString().trim();

                    if (!dice1Str.isEmpty() && !dice2Str.isEmpty()) {
                        int dice1 = Integer.parseInt(dice1Str);
                        int dice2 = Integer.parseInt(dice2Str);

                        if (dice1 >= 1 && dice1 <= 6 && dice2 >= 1 && dice2 <= 6) {
                            int diceSum = dice1 + dice2;
                            // Assume for this example that we're calculating moves for covering own squares.
                            // Set to 'false' if you want to calculate for uncovering opponent's squares.
                            boolean isCovering = true;

                            // Use the controller to calculate the valid moves.
                            List<String> validMoves = gameController.calculateValidMoves(diceSum, isCovering);

                            // Update the spinner in the view with these valid moves.
                            Spinner spinnerOptions = getView().findViewById(R.id.spinnerOptions);
                            ArrayAdapter<String> adapter = new ArrayAdapter<>(getActivity(),
                                    android.R.layout.simple_spinner_item, validMoves);
                            adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
                            spinnerOptions.setAdapter(adapter);

                            // Optionally hide the current move layout and show the move options layout.
                            layoutOne.setVisibility(View.GONE);
                            layoutMoveOptions.setVisibility(View.VISIBLE);
                        } else {
                            Toast.makeText(getActivity(), "Please enter dice values between 1 and 6.", Toast.LENGTH_SHORT).show();
                        }
                    } else {
                        Toast.makeText(getActivity(), "Please enter both dice values.", Toast.LENGTH_SHORT).show();
                    }
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void onClickButtonConfirm(View v) {
        // Retrieve the selected move from the spinner.
        Spinner spinnerOptions = requireView().findViewById(R.id.spinnerOptions);
        String selectedMove = (String) spinnerOptions.getSelectedItem();

        if (selectedMove == null || selectedMove.equals("No valid moves")) {
            // Since no valid move is made, switch turn.
            Toast.makeText(getActivity(), "No valid move selected", Toast.LENGTH_SHORT).show();

            gameRound.setHumanTurn(!gameRound.isHumanTurn());
            updateUI();  // Refresh UI after turn switch.

            layoutMoveOptions.setVisibility(View.GONE);
            layoutOne.setVisibility(View.VISIBLE);

            return;
        }

        // Parse the move string.
        // Our formatted string is like: "_ 2 _ 4 _ _ _ _ _"
        // We split by spaces and extract the numbers.
        String[] tokens = selectedMove.split(", ");
        List<Integer> moveSquares = new ArrayList<>();
        for (String token : tokens) {
            if (!token.equals("_")) {
                try {
                    moveSquares.add(Integer.parseInt(token));
                } catch (NumberFormatException e) {
                    // Log or handle the parsing error as needed.
                }
            }
        }

        // Determine the move type using the toggle button.
        // Assume the toggle button shows "Cover" when off and "Uncover" when on.
        ToggleButton toggle = requireView().findViewById(R.id.toggleCoverUncover);
        // If the toggle is not checked, we're in Cover mode.
        boolean isCovering = !toggle.isChecked();

//        if (!gameRound.isHumanTurn()) isCovering = !isCovering;

        // Apply the move to the board.
        boolean validMove = true;

        for (Integer square : moveSquares) {
            boolean isHumanTurn = gameRound.isHumanTurn();
            boolean success;

            if (isCovering) {
                success = isHumanTurn ? gameRound.getBoard().coverHumanSquare(square)
                                      : gameRound.getBoard().coverComputerSquare(square);
            } else {
                success = isHumanTurn ? gameRound.getBoard().uncoverComputerSquare(square)
                                      : gameRound.getBoard().uncoverHumanSquare(square);
            }

            if (!success) {
                validMove = false;
                break;
            }
        }

        if (validMove) {
            Toast.makeText(getActivity(), "Move confirmed", Toast.LENGTH_SHORT).show();
            // Update the UI (for example, refresh board display, update scores, etc.)
        } else {
            gameRound.setHumanTurn(!gameRound.isHumanTurn()); // Switch turn if the move was invalid
            Toast.makeText(getActivity(), "Invalid move. Please try again.", Toast.LENGTH_SHORT).show();
        }

        updateUI();  // Assuming you have an updateUI() method in your fragment.
        // Hide the move options layout and show the input layout again.
        layoutMoveOptions.setVisibility(View.GONE);
        layoutOne.setVisibility(View.VISIBLE);
    }
}