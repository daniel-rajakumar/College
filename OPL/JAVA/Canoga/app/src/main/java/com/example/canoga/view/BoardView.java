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

/**
 * Custom view for displaying a game board.
 */
public class BoardView extends View {
    private Board board;
    private Paint squarePaint;
    private Paint textPaint;
    private Paint borderPaint;

    private Paint lockRing;
    private static final int PINK = 0xFFD41A69;


    // Layout settings: circle radius and spacing between circles.
    private int squareRadius = 35;
    private int squareSpacing = 20;

    /**
     * Constructor for inflating via XML.
     *
     * @param context the context.
     * @param attrs the attribute set.
     */
    public BoardView(Context context, AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    /**
     * Sets the board to be displayed and invalidates the view.
     *
     * @param board the game board.
     */
    public void setBoard(Board board) {
        this.board = board;
        invalidate();
    }

    /**
     * Initializes paints for drawing board elements.
     */
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

        // ★ ADD: lock ring style
        lockRing = new Paint(Paint.ANTI_ALIAS_FLAG);
        lockRing.setStyle(Paint.Style.STROKE);
        lockRing.setStrokeWidth(4);
        lockRing.setColor(PINK);
    }

    // ★ ADD
    private float dp(float v) {
        return v * getResources().getDisplayMetrics().density;
    }

    /**
     * Draws the board with human and computer rows.
     *
     * @param canvas the canvas on which the board is drawn.
     */
    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        if (board == null) return;

        // ★ ADD: read advantage info
        Board.AdvantageOwner owner = board.getAdvantageOwner(); // NONE / HUMAN / COMPUTER
        int advSq = board.getAdvantageSquare();                 // 1..size, 0 = none
        boolean lockActive = board.isAdvantageLockActive();

        int boardSize = board.getSize();

        // Set starting positions for the board drawing.
        float startX = squareSpacing;
        float startY = squareSpacing;

        // Draw Human row label.
        canvas.drawText("Human:", startX + squareRadius, startY + squareRadius + 10, textPaint);
        float rowY = startY + squareRadius * 2 + squareSpacing; // Adjust for label height

        // Draw human squares.
        boolean[] humanSquares = board.getHumanSquares();
        for (int i = 0; i < boardSize; i++) {
            float cx = startX + i * (2 * squareRadius + squareSpacing) + squareRadius;
            float cy = rowY;
            // Set color based on square state: covered or uncovered.
            squarePaint.setColor(humanSquares[i] ? Color.GRAY : Color.parseColor("#A5D6A7"));
            canvas.drawCircle(cx, cy, squareRadius, squarePaint);
            canvas.drawCircle(cx, cy, squareRadius, borderPaint);
            if (!humanSquares[i]) {
                canvas.drawText(String.valueOf(i + 1), cx, cy + (textPaint.getTextSize() / 3), textPaint);
            }

            // ★ ADD: lock-only spotlight (Human row)
            boolean isAdvCell = (owner == Board.AdvantageOwner.HUMAN) && (advSq == i + 1);
            if (lockActive && isAdvCell) {
                canvas.drawCircle(cx, cy, squareRadius - dp(2), lockRing);
            }
        }

        // Prepare to draw the computer row.
        rowY += 2 * squareRadius + 2 * squareSpacing;
        canvas.drawText("Computer:", startX + squareRadius + 15, rowY - squareRadius - 10, textPaint);

        // Draw computer squares.
        boolean[] computerSquares = board.getComputerSquares();
        for (int i = 0; i < boardSize; i++) {
            float cx = startX + i * (2 * squareRadius + squareSpacing) + squareRadius;
            float cy = rowY;
            // Set color based on square state: covered or uncovered.
            squarePaint.setColor(computerSquares[i] ? Color.GRAY : Color.parseColor("#90CAF9"));
            canvas.drawCircle(cx, cy, squareRadius, squarePaint);
            canvas.drawCircle(cx, cy, squareRadius, borderPaint);
            if (!computerSquares[i]) {
                canvas.drawText(String.valueOf(i + 1), cx, cy + (textPaint.getTextSize() / 3), textPaint);
            }

            // ★ ADD: lock-only spotlight (Computer row)
            boolean isAdvCell = (owner == Board.AdvantageOwner.COMPUTER) && (advSq == i + 1);
            if (lockActive && isAdvCell) {
                canvas.drawCircle(cx, cy, squareRadius - dp(2), lockRing);
            }
        }

    }

    /**
     * Fragment for board configuration.
     */
    public static class ConfigureFragment extends Fragment {
        private Spinner spinnerBoardSize;
        private Button btnNextConfig;
        private ConfigureController controller;

        /**
         * Factory method to create a new instance of ConfigureFragment.
         *
         * @return a new instance of fragment ConfigureFragment.
         */
        public static ConfigureFragment newInstance() {
            return new ConfigureFragment();
        }

        /**
         * Inflates the configuration layout.
         *
         * @param inflater LayoutInflater.
         * @param container parent container.
         * @param savedInstanceState saved instance state.
         * @return the inflated view.
         */
        @Override
        public View onCreateView(@NonNull LayoutInflater inflater,
                                 @Nullable ViewGroup container,
                                 @Nullable Bundle savedInstanceState) {
            return inflater.inflate(R.layout.fragment_configure, container, false);
        }

        /**
         * Initializes UI components and sets up controller actions.
         *
         * @param view inflated view.
         * @param savedInstanceState saved instance state.
         */
        @Override
        public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
            spinnerBoardSize = view.findViewById(R.id.spinnerBoardSize);
            btnNextConfig = view.findViewById(R.id.btnNextConfig);
            controller = new ConfigureController();

            btnNextConfig.setOnClickListener(v -> {
                String selected = spinnerBoardSize.getSelectedItem().toString();
                int boardSize = Integer.parseInt(selected);

                // Update board size in the controller and create a new game round.
                controller.setBoardSize(boardSize);
                String gameMode = TournamentController.getInstance().getCurrentGameMode();
                GameRound newRound = controller.getNewGameRound();

//                GameRound newRound = controller.getNewGameRound( gameMode, board.getAdvantageSquare(), board.getAdvantageOwner() );

                // Update scores if this is a restarted game or loaded game.
                Bundle args = getArguments();
                if (args != null) {
                    if ("RESTART".equals(gameMode)) {
                        int prevHumanScore = args.getInt("prevHumanScore", 0);
                        int prevComputerScore = args.getInt("prevComputerScore", 0);
                        newRound.getHuman().updateScore(prevHumanScore);
                        newRound.getComputer().updateScore(prevComputerScore);
                    }
                    if (args.getBoolean("isLoaded", false)) {
                        newRound.getHuman().setHasPlayed(true);
                        newRound.getComputer().setHasPlayed(true);
                    }
                }

                RollFragment rollFragment = RollFragment.newInstance(newRound);
                // Navigate to the RollFragment.
                requireActivity().getSupportFragmentManager().beginTransaction()
                        .replace(R.id.fragmentContainerView, rollFragment)
                        .addToBackStack(null)
                        .commit();
            });
        }
    }
}
