package com.example.canoga.view;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.os.Bundle;
import android.util.AttributeSet;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.Spinner;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import com.example.canoga.R;
import com.example.canoga.controller.ConfigureController;
import com.example.canoga.controller.TournamentController;
import com.example.canoga.model.Board;
import com.example.canoga.model.GameRound;

public class BoardView extends View {
    private Board board;
    private Paint paint;

    private Paint squarePaint;
    private Paint textPaint;
    private Paint borderPaint;

    // Layout settings: spacing and circle size.
    private int squareRadius = 35;
    private int squareSpacing = 20;

    public BoardView(Context context, AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    /**
     * Sets the board to be displayed.
     * @param board The game board.
     */
    public void setBoard(Board board) {
        this.board = board;
        invalidate();
    }

    private void init() {
        squarePaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        textPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
        borderPaint = new Paint(Paint.ANTI_ALIAS_FLAG);

        // Configure text paint.
        textPaint.setColor(Color.BLACK);
        textPaint.setTextSize(30);
        textPaint.setTextAlign(Paint.Align.CENTER);

        // Configure border paint.
        borderPaint.setColor(Color.DKGRAY);
        borderPaint.setStyle(Paint.Style.STROKE);
        borderPaint.setStrokeWidth(3);
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        if (board == null) return;

        int boardSize = board.getSize();

        // Calculate starting positions.
        float startX = squareSpacing;
        float startY = squareSpacing;

        // Draw Human Row.
        // Display row label.
        canvas.drawText("Human:", startX + squareRadius, startY + squareRadius + 10, textPaint);
        float rowY = startY + squareRadius * 2 + squareSpacing; // Leave space for label

        boolean[] humanSquares = board.getHumanSquares();
        for (int i = 0; i < boardSize; i++) {
            float cx = startX + i * (2 * squareRadius + squareSpacing) + squareRadius;
            float cy = rowY;
            // Determine color for uncovered (light green) or covered (gray).
            if (humanSquares[i]) {
                squarePaint.setColor(Color.GRAY);
            } else {
                squarePaint.setColor(Color.parseColor("#A5D6A7")); // light green
            }
            // Draw circle for square.
            canvas.drawCircle(cx, cy, squareRadius, squarePaint);
            // Draw border.
            canvas.drawCircle(cx, cy, squareRadius, borderPaint);
            // If uncovered, draw the square number.
            if (!humanSquares[i]) {
                canvas.drawText(String.valueOf(i + 1), cx, cy + (textPaint.getTextSize()/3), textPaint);
            }
        }

        // Draw Computer Row.
        // Move further down.
        rowY += 2 * squareRadius + 2 * squareSpacing;
        canvas.drawText("Computer:", startX + squareRadius + 15, rowY - squareRadius - 10, textPaint);
        boolean[] computerSquares = board.getComputerSquares();
        for (int i = 0; i < boardSize; i++) {
            float cx = startX + i * (2 * squareRadius + squareSpacing) + squareRadius;
            float cy = rowY;
            // For computer row, use different colors.
            if (computerSquares[i]) {
                squarePaint.setColor(Color.GRAY);
            } else {
                squarePaint.setColor(Color.parseColor("#90CAF9")); // light blue
            }
            canvas.drawCircle(cx, cy, squareRadius, squarePaint);
            canvas.drawCircle(cx, cy, squareRadius, borderPaint);
            if (!computerSquares[i]) {
                canvas.drawText(String.valueOf(i + 1), cx, cy + (textPaint.getTextSize()/3), textPaint);
            }
        }
    }

    public static class ConfigureFragment extends Fragment {
        private Spinner spinnerBoardSize;
        private Button btnNextConfig;
        private ConfigureController controller;

        public static ConfigureFragment newInstance() {
            return new ConfigureFragment();
        }

        @Override
        public View onCreateView(@NonNull LayoutInflater inflater,
                                 @Nullable ViewGroup container,
                                 @Nullable Bundle savedInstanceState) {
            return inflater.inflate(R.layout.fragment_configure, container, false);
        }

        @Override
        public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
            spinnerBoardSize = view.findViewById(R.id.spinnerBoardSize);
            btnNextConfig = view.findViewById(R.id.btnNextConfig);
            controller = new ConfigureController();

            btnNextConfig.setOnClickListener(v -> {
                String selected = spinnerBoardSize.getSelectedItem().toString();
                int boardSize = Integer.parseInt(selected);
                // Update GameModel via controller.
                controller.setBoardSize(boardSize);


                String gameMode = TournamentController.getInstance().getCurrentGameMode();

                // Create a new GameRound based on the chosen board size.
                GameRound newRound = controller.getNewGameRound();

//                newRound.getHuman().setHasPlayed(true);
//                newRound.getComputer().setHasPlayed(true);
                // Check if previous scores were passed via arguments.
                Bundle args = getArguments();
                if (args != null) {
                    if (gameMode.equals("RESTART")) {
                        // It is a restarted game; carry over previous scores.
                        int prevHumanScore = args.getInt("prevHumanScore", 0);
                        int prevComputerScore = args.getInt("prevComputerScore", 0);
                        newRound.getHuman().updateScore(prevHumanScore);
                        newRound.getComputer().updateScore(prevComputerScore);
                    }
                    // You can also check a flag "isLoaded" here if necessary
                    if (args.getBoolean("isLoaded", false)) {
                        newRound.getHuman().setHasPlayed(true);
                        newRound.getComputer().setHasPlayed(true);
                        // Handle loaded game state if needed
                    }
                }

                RollFragment rollFragment = RollFragment.newInstance(newRound);
                // Navigate to the Game screen with the newly created round.
                requireActivity().getSupportFragmentManager().beginTransaction()
//                        .replace(R.id.fragmentContainerView, GameFragment.newInstance(newRound))
                        .replace(R.id.fragmentContainerView, rollFragment)
                        .addToBackStack(null)
                        .commit();
            });
        }

    }
}
