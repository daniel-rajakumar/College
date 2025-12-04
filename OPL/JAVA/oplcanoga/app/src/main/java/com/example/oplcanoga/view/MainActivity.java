package com.example.oplcanoga.view;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.widget.Button;

import androidx.activity.EdgeToEdge;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.example.oplcanoga.R;

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
                    if (result.getResultCode() == RESULT_OK && result.getData() != null) {
                        Uri uri = result.getData().getData();
                        // TODO: pass this Uri to your Serializer.load(uri, contentResolver)
                        // For now, you can just log or toast it.
                        // Toast.makeText(this, "Selected: " + uri, Toast.LENGTH_SHORT).show();

                        // Later you’d pass this into GameActivity / controller to restore state.
                    }
                }
        );

        btnImportGame.setOnClickListener(v -> openFilePicker());

        btnPlayNewGame.setOnClickListener(v -> {
            startActivity(new Intent(this, SetupActivity.class));
        });
    }

    private void openFilePicker() {
        // Use ACTION_OPEN_DOCUMENT to show the system file picker
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        // If your save files are plain text, you can use "text/*".
        // Otherwise "*/*" to allow any file type.
        intent.setType("*/*");

        importFileLauncher.launch(intent);
    }
}
