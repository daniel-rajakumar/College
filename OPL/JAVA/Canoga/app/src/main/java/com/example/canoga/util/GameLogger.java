package com.example.canoga.util;

import android.content.Context;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.FileInputStream;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

/**
 * Singleton class for logging game events.
 * <p>
 * This logger writes log messages with timestamps to a file in the app's internal storage.
 * It supports thread-safe logging, reading the log content, and clearing the log.
 */
public class GameLogger {
    private static GameLogger instance;
    private File logFile;
    private static final String LOG_FILENAME = "game_log.txt";

    /**
     * Private constructor to initialize the logger.
     * Creates the log file in the app's internal storage if it does not exist.
     *
     * @param context the application context used to access internal storage.
     */
    private GameLogger(Context context) {
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
     * Initializes the GameLogger singleton instance with a valid Context.
     * This method must be called before using getInstance().
     *
     * @param context the application context.
     */
    public static synchronized void init(Context context) {
        if (instance == null) {
            instance = new GameLogger(context);
        }
    }

    /**
     * Retrieves the singleton instance of the GameLogger.
     *
     * @return the GameLogger instance.
     * @throws IllegalStateException if the logger has not been initialized.
     */
    public static GameLogger getInstance() {
        if (instance == null) {
            throw new IllegalStateException("GameLogger not initialized. Call GameLogger.init(context) in your Application or Activity.");
        }
        return instance;
    }

    /**
     * Logs a message with a specified tag.
     * The message is prefixed with a timestamp and the tag in uppercase.
     * This method is synchronized to ensure thread safety.
     *
     * @param TAG     the tag associated with the log message.
     * @param message the message to log.
     */
    public synchronized void log(String TAG, String message) {
        String timestamp = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault())
                .format(new Date());
        String logMessage = timestamp + " [ " + TAG.toUpperCase() + " ] " + message + "\n";
        try (FileOutputStream fos = new FileOutputStream(logFile, true)) { // Append mode
            fos.write(logMessage.getBytes());
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * Logs a message with the default tag "INFO".
     *
     * @param message the message to log.
     */
    public synchronized void log(String message) {
        log("INFO", message);
    }

    /**
     * Reads the entire log file and returns its content as a String.
     *
     * @return the content of the log file, or an empty string if an error occurs.
     */
    public String getLogContent() {
        try {
            int length = (int) logFile.length();
            byte[] data = new byte[length];
            try (FileInputStream fis = new FileInputStream(logFile)) {
                fis.read(data);
            }
            return new String(data);
        } catch (IOException e) {
            e.printStackTrace();
            return "";
        }
    }

    /**
     * Clears the log file by writing an empty string to it.
     *
     * @return a message indicating whether the log was cleared successfully.
     */
    public String clearLog() {
        try (FileOutputStream fos = new FileOutputStream(logFile)) {
            fos.write("".getBytes());
            return "Log cleared successfully.";
        } catch (IOException e) {
            e.printStackTrace();
            return "Error clearing log.";
        }
    }
}
