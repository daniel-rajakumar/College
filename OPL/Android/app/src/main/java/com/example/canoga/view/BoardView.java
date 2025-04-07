package com.example.canoga.view;

import android.content.Context;
import android.graphics.Canvas;
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
import com.example.canoga.model.Board;

public class BoardView extends View {
    private Board board;
    private Paint paint;

    public BoardView(Context context, AttributeSet attrs) {
        super(context, attrs);
        paint = new Paint();
        paint.setTextSize(36);
    }

    /**
     * Sets the board to be displayed.
     * @param board The game board.
     */
    public void setBoard(Board board) {
        this.board = board;
        invalidate();
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        if (board == null) return;
        int size = board.getSize();
        StringBuilder humanRow = new StringBuilder("Human: ");
        int i = 0;
        for (boolean covered : board.getHumanSquares()) {
            i++;
            humanRow.append(covered ? "_ " : i + " ");
        }
        i = 0;
        StringBuilder computerRow = new StringBuilder("Computer: ");
        for (boolean covered : board.getComputerSquares()) {
            i++;
            computerRow.append(covered ? "_ " : i + " ");
        }
        canvas.drawText(humanRow.toString(), 20, 60, paint);
        canvas.drawText(computerRow.toString(), 20, 120, paint);
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
                // Update GameModel via controller
                controller.setBoardSize(boardSize);
                // Navigate to the Game screen (GameFragment)
                requireActivity().getSupportFragmentManager().beginTransaction()
                        .replace(R.id.fragmentContainerView, GameFragment.newInstance(controller.getNewGameRound()))
                        .addToBackStack(null)
                        .commit();
            });
        }
    }
}
