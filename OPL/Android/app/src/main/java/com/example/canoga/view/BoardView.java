package com.example.canoga.view;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.util.AttributeSet;
import android.view.View;
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
        for (boolean covered : board.getHumanSquares()) {
            humanRow.append(covered ? "[X] " : "[ ] ");
        }
        StringBuilder computerRow = new StringBuilder("Computer: ");
        for (boolean covered : board.getComputerSquares()) {
            computerRow.append(covered ? "[X] " : "[ ] ");
        }
        canvas.drawText(humanRow.toString(), 20, 60, paint);
        canvas.drawText(computerRow.toString(), 20, 120, paint);
    }
}
