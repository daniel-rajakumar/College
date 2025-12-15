package com.example.oplcanoga.view;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.widget.Button;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.example.oplcanoga.R;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

/**
 * The entry point of the application.
 * Provides options to start a new game or import an existing game from a file.
 */
public class MainActivity extends AppCompatActivity {

    private Button btnImportGame;
    private Button btnPlayNewGame;

    // Launcher for the system file picker
    private ActivityResultLauncher<Intent> importFileLauncher;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main);

        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top,
                    systemBars.right, systemBars.bottom);
            return insets;
        });

        btnImportGame = findViewById(R.id.btnImportGame);
        btnPlayNewGame = findViewById(R.id.btnPlayNewGame);

        // Register launcher once
        importFileLauncher = registerForActivityResult(
                new ActivityResultContracts.StartActivityForResult(),
                result -> {
                    if (result.getResultCode() == Activity.RESULT_OK && result.getData() != null) {
                        Uri uri = result.getData().getData();
                        if (uri != null) {
                            try (InputStream in = getContentResolver().openInputStream(uri)) {
                                if (in != null) {
                                    ByteArrayOutputStream baos = new ByteArrayOutputStream();
                                    byte[] buffer = new byte[4096];
                                    int n;
                                    while ((n = in.read(buffer)) != -1) {
                                        baos.write(buffer, 0, n);
                                    }
                                    String data = baos.toString(StandardCharsets.UTF_8.name());

                                    // Launch GameActivity with imported state
                                    Intent gameIntent = new Intent(this, GameActivity.class);
                                    gameIntent.putExtra("IMPORTED_STATE", data);
                                    startActivity(gameIntent);
                                }
                            } catch (IOException e) {
                                Toast.makeText(this,
                                        "Failed to import game: " + e.getMessage(),
                                        Toast.LENGTH_LONG).show();
                            }
                        }
                    }
                }
        );

        btnImportGame.setOnClickListener(v -> openFilePicker());

        btnPlayNewGame.setOnClickListener(v -> {
            startActivity(new Intent(this, SetupActivity.class));
        });
    }

    /**
     * Opens the system file picker to allow the user to select a game save file.
     * The result is handled by the `importFileLauncher`.
     */
    private void openFilePicker() {
        // Use ACTION_OPEN_DOCUMENT to show the system file picker
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        // your saves are text
        intent.setType("text/*");

        importFileLauncher.launch(intent);
    }
}
