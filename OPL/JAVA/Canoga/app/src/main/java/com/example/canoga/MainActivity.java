package com.example.canoga;

import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;

import androidx.appcompat.app.AppCompatActivity;

import com.example.canoga.view.StartFragment;
import com.example.canoga.view.BoardView;
import com.google.android.material.dialog.MaterialAlertDialogBuilder;

import java.util.ArrayList;
import java.util.List;

public class MainActivity extends AppCompatActivity {

    private static final String TAG = "CanogaSelfTests";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        if (savedInstanceState == null) {
            getSupportFragmentManager().beginTransaction()
                    .replace(R.id.fragmentContainerView, StartFragment.newInstance())
                    .commit();
        }

        // Run lightweight self-tests on launch
    }

    // ---------- Self-test runner ----------

    private void runAppSelfTests() {
        List<String> results = new ArrayList<>();

        // 1) Resources: arrays
        results.add(checkResourceExists("Arrays: board_size_options",
                getResources().getIdentifier("board_size_options", "array", getPackageName())));

        results.add(checkResourceExists("Arrays: dropdown_options",
                getResources().getIdentifier("dropdown_options", "array", getPackageName())));

        // 2) Resources: dice drawables 1-6
        for (int i = 1; i <= 6; i++) {
            int id = getResources().getIdentifier("dice_" + i, "drawable", getPackageName());
            results.add(checkResourceExists("Drawable: dice_" + i, id));
        }

        // 3) Resources: circle button selectors
        results.add(checkResourceExists("Drawable: circle_creator",
                getResources().getIdentifier("circle_creator", "drawable", getPackageName())));
        results.add(checkResourceExists("Drawable: circle_button",
                getResources().getIdentifier("circle_button", "drawable", getPackageName())));
        results.add(checkResourceExists("Drawable: circle_button_selected",
                getResources().getIdentifier("circle_button_selected", "drawable", getPackageName())));
        results.add(checkResourceExists("Drawable: board_background",
                getResources().getIdentifier("board_background", "drawable", getPackageName())));

        // 4) Inflate key layouts (sanity check)
        results.add(tryInflateLayout("Layout: fragment_game", R.layout.fragment_game));
        results.add(tryInflateLayout("Layout: fragment_start", R.layout.fragment_start));
        results.add(tryInflateLayout("Layout: fragment_roll", R.layout.fragment_roll));
        results.add(tryInflateLayout("Layout: fragment_end", R.layout.fragment_end));

        // 5) Instantiate BoardView
        results.add(tryInstantiateBoardView());

        // 6) Classes: Fragments present
        results.add(tryFindClass("Fragment: StartFragment", "com.example.canoga.view.StartFragment"));
        results.add(tryFindClass("Fragment: GameFragment", "com.example.canoga.view.GameFragment"));
        results.add(tryFindClass("Fragment: RollFragment", "com.example.canoga.view.RollFragment"));
        results.add(tryFindClass("Fragment: EndFragment", "com.example.canoga.view.EndFragment"));
        results.add(tryFindClass("Fragment: ExitFragment", "com.example.canoga.view.ExitFragment"));

        // 7) Classes: Controllers present (adjust packages if yours differ)
        results.add(tryFindClass("Controller: GameController", "com.example.canoga.controller.GameController"));
        results.add(tryFindClass("Controller: ConfigureController", "com.example.canoga.controller.ConfigureController"));
        results.add(tryFindClass("Controller: SaveLoadController", "com.example.canoga.controller.SaveLoadController"));
        results.add(tryFindClass("Controller: HelpController", "com.example.canoga.controller.HelpController"));
        results.add(tryFindClass("Controller: TournamentController", "com.example.canoga.controller.TournamentController"));
        results.add(tryFindClass("Controller: GameStateParser", "com.example.canoga.controller.GameStateParser"));

        // 8) Classes: Models present
        results.add(tryFindClass("Model: Board", "com.example.canoga.model.Board"));
        results.add(tryFindClass("Model: Player", "com.example.canoga.model.Player"));
        results.add(tryFindClass("Model: Human", "com.example.canoga.model.Human"));
        results.add(tryFindClass("Model: Computer", "com.example.canoga.model.Computer"));
        results.add(tryFindClass("Model: GameRound", "com.example.canoga.model.GameRound"));
        results.add(tryFindClass("Model: GameModel", "com.example.canoga.model.GameModel"));
        results.add(tryFindClass("Model: Tournament", "com.example.canoga.model.Tournament"));

        // (Optional) Example logic check: advantage digit sum helper
        results.add(testDigitSum("Logic: digitSum(27) == 9", 27, 9));
        results.add(testDigitSum("Logic: digitSum(123) == 6", 123, 6));
        results.add(testDigitSum("Logic: digitSum(0) == 0", 0, 0));

        // Show dialog + log
        showResultsDialog(results);
        for (String line : results) Log.d(TAG, line.replace("✅ ", "[PASS] ").replace("❌ ", "[FAIL] "));
    }

    // ---------- Helpers ----------

    private String checkResourceExists(String label, int resId) {
        boolean ok = (resId != 0);
        return (ok ? "✅ " : "❌ ") + label + (ok ? " found" : " missing");
    }

    private String tryInflateLayout(String label, int layoutId) {
        try {
            LayoutInflater inflater = getLayoutInflater();
            View v = inflater.inflate(layoutId, null);
            return (v != null ? "✅ " : "❌ ") + label + (v != null ? " inflated" : " failed to inflate");
        } catch (Exception e) {
            return "❌ " + label + " failed to inflate (" + e.getClass().getSimpleName() + ")";
        }
    }

    private String tryInstantiateBoardView() {
        try {
            BoardView bv = new BoardView(this, null);
            return (bv != null ? "✅ " : "❌ ") + "View: BoardView instantiation";
        } catch (Throwable t) {
            return "❌ View: BoardView instantiation failed (" + t.getClass().getSimpleName() + ")";
        }
    }

    private String tryFindClass(String label, String fqcn) {
        try {
            Class.forName(fqcn);
            return "✅ " + label + " present (" + fqcn + ")";
        } catch (ClassNotFoundException e) {
            return "❌ " + label + " missing (" + fqcn + ")";
        }
    }

    private String testDigitSum(String label, int input, int expected) {
        int got = digitSum(input);
        return (got == expected ? "✅ " : "❌ ") + label + " (got " + got + ")";
    }

    // Simple helper to mirror advantage digit-sum rule (0..9)
    private int digitSum(int n) {
        n = Math.abs(n);
        int sum = 0;
        while (n > 0) { sum += (n % 10); n /= 10; }
        return sum % 10; // ensures 0..9 range if you prefer mod-10
    }

    private void showResultsDialog(List<String> lines) {
        StringBuilder sb = new StringBuilder();
        for (String s : lines) sb.append(s).append("\n");

        new MaterialAlertDialogBuilder(this)
                .setTitle("Startup Self-Tests")
                .setMessage(sb.toString())
                .setPositiveButton("Close", null)
                .show();
    }
}
