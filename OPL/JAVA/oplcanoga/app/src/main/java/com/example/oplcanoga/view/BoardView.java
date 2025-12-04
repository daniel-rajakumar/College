package com.example.oplcanoga.view;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.RectF;
import android.util.AttributeSet;
import android.view.View;

import androidx.annotation.Nullable;

import com.example.oplcanoga.controller.BoardState;

public class BoardView extends View {

    private int[] humanSquares;      // 1..boardSize
    private int[] computerSquares;   // 1..boardSize
    private int boardSize = 0;

    private final Paint uncoveredPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint coveredPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint textPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint borderPaint = new Paint(Paint.ANTI_ALIAS_FLAG);

    public BoardView(Context context) {
        super(context);
        init();
    }

    public BoardView(Context context, @Nullable AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    public BoardView(Context context, @Nullable AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init();
    }

    private void init() {
        uncoveredPaint.setStyle(Paint.Style.FILL);
        uncoveredPaint.setColor(0xFFE0F7FA); // light teal

        coveredPaint.setStyle(Paint.Style.FILL);
        coveredPaint.setColor(0xFF00796B); // darker teal

        borderPaint.setStyle(Paint.Style.STROKE);
        borderPaint.setStrokeWidth(3f);
        borderPaint.setColor(0xFF004D40);

        textPaint.setColor(0xFF000000);
        textPaint.setTextAlign(Paint.Align.CENTER);
        textPaint.setTextSize(32f);
    }

    /**
     * Called by your Fragment/Activity when BoardState changes.
     */
    public void setBoardState(BoardState state) {
        if (state == null) return;

        this.boardSize = state.boardSize;

        // Copy arrays (index 1..boardSize)
        this.humanSquares = copyArray(state.humanSquares);
        this.computerSquares = copyArray(state.computerSquares);

        invalidate(); // request redraw
    }

    private int[] copyArray(int[] src) {
        if (src == null) return null;
        int[] dst = new int[src.length];
        System.arraycopy(src, 0, dst, 0, src.length);
        return dst;
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);

        if (boardSize <= 0 || humanSquares == null || computerSquares == null) {
            return;
        }

        float width = getWidth();
        float height = getHeight();

        float padding = 32f;
        float availableWidth = width - 2 * padding;
        float cellWidth = availableWidth / boardSize;

        float rowHeight = (height - 2 * padding) / 2f; // top row = computer, bottom = human
        float radius = (cellWidth * 0.45f);

        // Vertical centers for rows
        float computerCenterY = padding + rowHeight / 2f;
        float humanCenterY = padding + rowHeight + rowHeight / 2f;

        // Draw computer row (top)
        for (int i = 1; i <= boardSize; i++) {
            float cx = padding + (i - 0.5f) * cellWidth;

            boolean covered = computerSquares[i] == 0;
            Paint fillPaint = covered ? coveredPaint : uncoveredPaint;

            RectF oval = new RectF(cx - radius, computerCenterY - radius,
                    cx + radius, computerCenterY + radius);
            canvas.drawOval(oval, fillPaint);
            canvas.drawOval(oval, borderPaint);

            // draw square number
            canvas.drawText(String.valueOf(i), cx, computerCenterY + (textPaint.getTextSize() / 3f), textPaint);
        }

        // Draw human row (bottom)
        for (int i = 1; i <= boardSize; i++) {
            float cx = padding + (i - 0.5f) * cellWidth;

            boolean covered = humanSquares[i] == 0;
            Paint fillPaint = covered ? coveredPaint : uncoveredPaint;

            RectF oval = new RectF(cx - radius, humanCenterY - radius,
                    cx + radius, humanCenterY + radius);
            canvas.drawOval(oval, fillPaint);
            canvas.drawOval(oval, borderPaint);

            canvas.drawText(String.valueOf(i), cx, humanCenterY + (textPaint.getTextSize() / 3f), textPaint);
        }
    }
}
