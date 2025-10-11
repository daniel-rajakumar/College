package com.example.canoga.controller;

import android.content.ContentResolver;
import android.net.Uri;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;

/**
 * Controller for saving and loading the game state.
 * <p>
 * This class uses the Android Storage Access Framework to write and read game state data
 * as text files.
 */
public class SaveLoadController {
    private ContentResolver contentResolver;

    /**
     * Constructs the SaveLoadController with a ContentResolver.
     *
     * @param contentResolver The ContentResolver obtained from the activity.
     */
    public SaveLoadController(ContentResolver contentResolver) {
        this.contentResolver = contentResolver;
    }

    /**
     * Saves the game state data to the specified URI.
     *
     * @param uri      The file URI chosen by the user.
     * @param gameData The game state data to save as a String.
     * @return true if the data was saved successfully; false otherwise.
     */
    public boolean saveGameState(Uri uri, String gameData) {
        try {
            OutputStream os = contentResolver.openOutputStream(uri);
            if (os != null) {
                // Write the game data bytes to the output stream.
                os.write(gameData.getBytes());
                os.flush();
                os.close();
                return true;
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return false;
    }

    /**
     * Loads game state data from the specified URI.
     *
     * @param uri The file URI chosen by the user.
     * @return The loaded game state as a String, or null if an error occurs.
     */
    public String loadGameState(Uri uri) {
        StringBuilder builder = new StringBuilder();
        try {
            InputStream is = contentResolver.openInputStream(uri);
            if (is != null) {
                // Read the data line by line.
                BufferedReader reader = new BufferedReader(new InputStreamReader(is));
                String line;
                while ((line = reader.readLine()) != null) {
                    builder.append(line).append("\n");
                }
                is.close();
                return builder.toString();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }
}
