package com.example.canoga.ui.main.fragment;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.Toast;

import com.example.canoga.ui.main.views.MainViewModel;
//import com.example.canogaConfigure;
import com.example.canoga.R;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.Objects;

public class StartFragment extends Fragment {

    private static final int LOAD_FILE_REQUEST_CODE = 2;
    private MainViewModel mViewModel;

    public static StartFragment newInstance() {
        return new StartFragment();
    }

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater,
                             @Nullable ViewGroup container,
                             @Nullable Bundle savedInstanceState) {
        // Inflate the main menu layout (fragment_main.xml)
        return inflater.inflate(R.layout.fragment_start, container, false);
    }

    @Override
    public void onActivityCreated(@Nullable Bundle savedInstanceState) {
        super.onActivityCreated(savedInstanceState);
        mViewModel = new ViewModelProvider(this).get(MainViewModel.class);
        // TODO: Load any data from ViewModel if needed.
    }

    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        // "Play" button navigates to the configuration screen.
        Button playButton = view.findViewById(R.id.button2);
        playButton.setOnClickListener(v -> {
            // Navigate to the configuration fragment.
            requireActivity().getSupportFragmentManager().beginTransaction()
                    .replace(R.id.fragmentContainerView, new ConfigureFragment())
                    .addToBackStack(null)
                    .commit();
        });

        // "Load" button opens a file manager to load a saved game file.
        Button loadButton = view.findViewById(R.id.button3);
        loadButton.setOnClickListener(v -> {
            Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
            intent.addCategory(Intent.CATEGORY_OPENABLE);
            intent.setType("text/plain");
            startActivityForResult(intent, LOAD_FILE_REQUEST_CODE);
        });
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        if (requestCode == LOAD_FILE_REQUEST_CODE && resultCode == Activity.RESULT_OK) {
            if (data != null) {
                Uri fileUri = data.getData();
                loadFileContent(fileUri);
            }
        }
        super.onActivityResult(requestCode, resultCode, data);
    }

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
                // Process the file content as needed; here we display it in a Toast.
                Toast.makeText(getActivity(), "Loaded file:\n" + fileContent, Toast.LENGTH_LONG).show();
            }
        } catch (IOException e) {
            e.printStackTrace();
            Toast.makeText(getActivity(), "Error loading file.", Toast.LENGTH_SHORT).show();
        }
    }
}
