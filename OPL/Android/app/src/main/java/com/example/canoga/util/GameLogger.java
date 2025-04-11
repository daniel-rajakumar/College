package com.example.canoga.util;

import android.content.Context;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class GameLogger {
    private static GameLogger instance;
    private File logFile;
    private static final String LOG_FILENAME = "game_log.txt";

    // Private constructor; requires a Context to get internal storage directory.
    private GameLogger(Context context) {
        // Create (or reference) the file in the app's internal files directory.
        logFile = new File(context.getFilesDir(), LOG_FILENAME);
        if (!logFile.exists()) {
            try {
                logFile.createNewFile();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    /**
     * Initialize the logger once with a valid Context.
     */
    public static synchronized void init(Context context) {
        if (instance == null) {
            instance = new GameLogger(context);
        }
    }

    /**
     * Retrieve the singleton instance. Must call init() first.
     */
    public static GameLogger getInstance() {
        if (instance == null) {
            throw new IllegalStateException("GameLogger not initialized. Call GameLogger.init(context) in your Application or Activity.");
        }
        return instance;
    }


    public synchronized void log(String TAG, String message){
        String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault())
                .format(new Date());
        String logMessage = timestamp + " [ " + TAG.toUpperCase() + " ] " + message + "\n";
        try (FileOutputStream fos = new FileOutputStream(logFile, true)) { // true for append mode
            fos.write(logMessage.getBytes());
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
    /**
     * Log a message (appended with timestamp) to the file.
     * This method is synchronized to ensure thread safety.
     *
     * @param message the log message
     */
    public synchronized void log(String message) {
        log("INFO", message);
    }

    /**
     * Reads the entire log file and returns the content as a String.
     */
    public String getLogContent() {
        try {
            int length = (int) logFile.length();
            byte[] data = new byte[length];
            java.io.FileInputStream fis = new java.io.FileInputStream(logFile);
            fis.read(data);
            fis.close();
            return new String(data);
        } catch (IOException e) {
            e.printStackTrace();
            return "";
        }
    }

    public String ClearLog() {
        try {
            FileOutputStream fos = new FileOutputStream(logFile);
            fos.write("".getBytes());
            fos.close();
            return "Log cleared successfully.";
        } catch (IOException e) {
            e.printStackTrace();
            return "Error clearing log.";
        }
    }
}
