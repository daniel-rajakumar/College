package com.example.oplcanoga.view;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.RectF;
import android.util.AttributeSet;
import android.view.View;

import com.example.oplcanoga.controller.BoardState;
import com.example.oplcanoga.model.PlayerId;


public class BoardView extends View {

    private BoardState state;

    private final Paint uncoveredPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint coveredPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint borderPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint textPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint labelPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint lockedPaint = new Paint(Paint.ANTI_ALIAS_FLAG);


    public BoardView(Context context) {
        super(context);
        init();
    }

    public BoardView(Context context, AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    public BoardView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init();
    }

    private void init() {
        uncoveredPaint.setStyle(Paint.Style.FILL);
        uncoveredPaint.setColor(0xFFE0F7FA);

        coveredPaint.setStyle(Paint.Style.FILL);
        coveredPaint.setColor(0xFF00796B);

        lockedPaint.setStyle(Paint.Style.FILL);
        lockedPaint.setColor(0xFFFFFF00);

        borderPaint.setStyle(Paint.Style.STROKE);
        borderPaint.setStrokeWidth(3f);
        borderPaint.setColor(0xFF004D40);

        textPaint.setColor(0xFF000000);
        textPaint.setTextAlign(Paint.Align.CENTER);
        textPaint.setTextSize(32f);

        labelPaint.setColor(0xFF555555);
        labelPaint.setTextAlign(Paint.Align.LEFT);
        labelPaint.setTextSize(28f);
    }

    public void setBoardState(BoardState state) {
        this.state = state;
        invalidate();
    }

    @Override
    protected void onDraw(Canvas canvas) {
        super.onDraw(canvas);
        if (state == null || state.boardSize <= 0) return;

        int boardSize = state.boardSize;
        int[] humanSquares = state.humanSquares;
        int[] computerSquares = state.computerSquares;

        if (humanSquares == null || computerSquares == null ||
                humanSquares.length <= boardSize || computerSquares.length <= boardSize) {
            return;
        }

        float w = getWidth();
        float h = getHeight();

        float padding = 24f;

        float availableWidth = w - 2 * padding;
        float cellWidth = availableWidth / boardSize;
        float radius = cellWidth * 0.4f;

        float topRowY = padding + radius + 8f;
        float bottomRowY = h - padding - radius - 8f;

        for (int i = 1; i <= boardSize; i++) {
            float cx = padding + (i - 0.5f) * cellWidth;
            boolean covered = computerSquares[i] == 0;

            boolean isLockedSquare =
                    state.advantageLockActive &&
                            state.advantagedPlayer == PlayerId.COMPUTER &&
                            state.advantageSquare == i;

            Paint fill;
            if (isLockedSquare) {
                fill = lockedPaint;
            } else {
                fill = covered ? coveredPaint : uncoveredPaint;
            }

            RectF oval = new RectF(cx - radius, topRowY - radius,
                    cx + radius, topRowY + radius);
            canvas.drawOval(oval, fill);
            canvas.drawOval(oval, borderPaint);

            canvas.drawText(String.valueOf(i),
                    cx,
                    topRowY + textPaint.getTextSize() / 3f,
                    textPaint);
        }

        canvas.drawText("COMPUTER",
                padding,
                topRowY - radius - 12f,
                labelPaint);

        for (int i = 1; i <= boardSize; i++) {
            float cx = padding + (i - 0.5f) * cellWidth;
            boolean covered = humanSquares[i] == 0;

            boolean isLockedSquare =
                    state.advantageLockActive &&
                            state.advantagedPlayer == PlayerId.HUMAN &&
                            state.advantageSquare == i;

            Paint fill;
            if (isLockedSquare) {
                fill = lockedPaint;
            } else {
                fill = covered ? coveredPaint : uncoveredPaint;
            }

            RectF oval = new RectF(cx - radius, bottomRowY - radius,
                    cx + radius, bottomRowY + radius);
            canvas.drawOval(oval, fill);
            canvas.drawOval(oval, borderPaint);

            canvas.drawText(String.valueOf(i),
                    cx,
                    bottomRowY + textPaint.getTextSize() / 3f,
                    textPaint);
        }

        canvas.drawText("HUMAN",
                padding,
                bottomRowY + radius + labelPaint.getTextSize(),
                labelPaint);
    }
}
