package com.example.oplcanoga.view;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Paint;
import android.graphics.RectF;
import android.util.AttributeSet;
import android.view.View;

import androidx.core.content.ContextCompat;

import com.example.oplcanoga.controller.BoardState;
import com.example.oplcanoga.model.PlayerId;
import com.example.oplcanoga.R;

/**
 * Custom View responsible for rendering the Canoga game board.
 * Displays the state of the board for both the human and computer players,
 * including covered, uncovered, and locked squares.
 */
public class BoardView extends View {

    private static final int DEFAULT_BOARD_SIZE = 9;
    private static final float H_PADDING_DP = 10f;
    private static final float V_PADDING_DP = 4f;
    private static final float LABEL_SPACING_DP = 2f;
    private static final float MIN_ROW_GAP_DP = 8f;
    private static final float RADIUS_RATIO = 0.42f;
    private static final float LABEL_SIZE_RATIO = 0.7f;
    private static final float TEXT_SIZE_RATIO = 0.9f;

    private BoardState state;
    private int lastBoardSize = DEFAULT_BOARD_SIZE;

    private final Paint uncoveredPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint coveredPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint borderPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint textPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint labelPaint = new Paint(Paint.ANTI_ALIAS_FLAG);
    private final Paint lockedPaint = new Paint(Paint.ANTI_ALIAS_FLAG);

    /**
     * Constructs a BoardView programmatically.
     *
     * @param context The Context the view is running in.
     */
    public BoardView(Context context) {
        super(context);
        init();
    }

    /**
     * Constructs a BoardView from XML attributes.
     *
     * @param context The Context the view is running in.
     * @param attrs   The attributes of the XML tag that is inflating the view.
     */
    public BoardView(Context context, AttributeSet attrs) {
        super(context, attrs);
        init();
    }

    /**
     * Constructs a BoardView from XML attributes with a default style.
     *
     * @param context      The Context the view is running in.
     * @param attrs        The attributes of the XML tag that is inflating the view.
     * @param defStyleAttr An attribute in the current theme that contains a reference to a style resource.
     */
    public BoardView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        init();
    }

    /**
     * Initializes the Paint objects used for drawing.
     */
    private void init() {
        uncoveredPaint.setStyle(Paint.Style.FILL);
        uncoveredPaint.setColor(ContextCompat.getColor(getContext(), R.color.canoga_board_uncovered));

        coveredPaint.setStyle(Paint.Style.FILL);
        coveredPaint.setColor(ContextCompat.getColor(getContext(), R.color.canoga_board_covered));

        lockedPaint.setStyle(Paint.Style.FILL);
        lockedPaint.setColor(ContextCompat.getColor(getContext(), R.color.canoga_board_locked));

        borderPaint.setStyle(Paint.Style.STROKE);
        borderPaint.setStrokeWidth(3f);
        borderPaint.setColor(ContextCompat.getColor(getContext(), R.color.canoga_board_border));

        textPaint.setColor(ContextCompat.getColor(getContext(), R.color.canoga_board_text));
        textPaint.setTextAlign(Paint.Align.CENTER);
        textPaint.setTextSize(32f);

        labelPaint.setColor(ContextCompat.getColor(getContext(), R.color.canoga_board_label));
        labelPaint.setTextAlign(Paint.Align.CENTER);
        labelPaint.setTextSize(28f);
    }

    /**
     * Updates the board state and requests a redraw.
     *
     * @param state The new BoardState object containing the game status.
     */
    public void setBoardState(BoardState state) {
        this.state = state;
        if (state != null && state.boardSize > 0 && state.boardSize != lastBoardSize) {
            lastBoardSize = state.boardSize;
            requestLayout();
        }
        invalidate();
    }

    @Override
    protected void onMeasure(int widthMeasureSpec, int heightMeasureSpec) {
        int widthMode = MeasureSpec.getMode(widthMeasureSpec);
        int widthSize = MeasureSpec.getSize(widthMeasureSpec);

        if (widthMode == MeasureSpec.UNSPECIFIED) {
            widthSize = (int) dp(280f);
        }

        float horizontalPadding = dp(H_PADDING_DP);
        float availableWidth = Math.max(0f, widthSize - 2f * horizontalPadding);
        float radius = getRadius(availableWidth, lastBoardSize);

        float desiredHeight;
        if (radius <= 0f) {
            desiredHeight = dp(120f);
        } else {
            updatePaintSizes(radius);
            Paint.FontMetrics labelMetrics = labelPaint.getFontMetrics();
            float labelHeight = labelMetrics.bottom - labelMetrics.top;
            float labelSpacing = dp(LABEL_SPACING_DP);
            float rowDiameter = radius * 2f;
            float minRowGap = Math.max(dp(MIN_ROW_GAP_DP), rowDiameter * 0.35f);
            float verticalPadding = dp(V_PADDING_DP);

            desiredHeight = (verticalPadding * 2f) + (labelHeight * 2f)
                    + (labelSpacing * 2f) + (rowDiameter * 2f) + minRowGap;
        }

        int measuredWidth = resolveSize(widthSize, widthMeasureSpec);
        int measuredHeight = resolveSize((int) Math.ceil(desiredHeight), heightMeasureSpec);
        setMeasuredDimension(measuredWidth, measuredHeight);
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

        float horizontalPadding = dp(H_PADDING_DP);
        float verticalPadding = dp(V_PADDING_DP);

        float availableWidth = w - 2f * horizontalPadding;
        if (availableWidth <= 0f) {
            return;
        }

        float cellWidth = availableWidth / boardSize;
        float radius = cellWidth * RADIUS_RATIO;
        if (radius <= 0f) {
            return;
        }

        updatePaintSizes(radius);

        Paint.FontMetrics labelMetrics = labelPaint.getFontMetrics();
        float labelHeight = labelMetrics.bottom - labelMetrics.top;
        float labelSpacing = dp(LABEL_SPACING_DP);
        float rowDiameter = radius * 2f;
        float minRowGap = Math.max(dp(MIN_ROW_GAP_DP), rowDiameter * 0.35f);

        float topLabelBaseline = verticalPadding - labelMetrics.top;
        float bottomLabelBaseline = h - verticalPadding - labelMetrics.bottom;

        float topRowY = topLabelBaseline + labelMetrics.bottom + labelSpacing + radius;
        float bottomRowY = bottomLabelBaseline + labelMetrics.top - labelSpacing - radius;

        if (bottomRowY - topRowY < rowDiameter + minRowGap) {
            float minContentHeight = (labelHeight * 2f) + (labelSpacing * 2f)
                    + (rowDiameter * 2f) + minRowGap;
            float contentTop = Math.max(verticalPadding, (h - minContentHeight) / 2f);

            topLabelBaseline = contentTop - labelMetrics.top;
            topRowY = topLabelBaseline + labelMetrics.bottom + labelSpacing + radius;
            bottomRowY = topRowY + rowDiameter + minRowGap;
            bottomLabelBaseline = bottomRowY + radius + labelSpacing - labelMetrics.top;
        }

        Paint.FontMetrics textMetrics = textPaint.getFontMetrics();
        float textBaselineOffset = (textMetrics.ascent + textMetrics.descent) / 2f;

        float labelX = horizontalPadding + (availableWidth / 2f);

        for (int i = 1; i <= boardSize; i++) {
            float cx = horizontalPadding + (i - 0.5f) * cellWidth;
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
                    topRowY - textBaselineOffset,
                    textPaint);
        }

        canvas.drawText("COMPUTER",
                labelX,
                topLabelBaseline,
                labelPaint);

        for (int i = 1; i <= boardSize; i++) {
            float cx = horizontalPadding + (i - 0.5f) * cellWidth;
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
                    bottomRowY - textBaselineOffset,
                    textPaint);
        }

        canvas.drawText("HUMAN",
                labelX,
                bottomLabelBaseline,
                labelPaint);
    }

    private float dp(float value) {
        return value * getResources().getDisplayMetrics().density;
    }

    private float getRadius(float availableWidth, int boardSize) {
        if (boardSize <= 0 || availableWidth <= 0f) {
            return 0f;
        }
        return (availableWidth / boardSize) * RADIUS_RATIO;
    }

    private void updatePaintSizes(float radius) {
        textPaint.setTextSize(radius * TEXT_SIZE_RATIO);
        labelPaint.setTextSize(Math.max(dp(12f), radius * LABEL_SIZE_RATIO));
    }
}
