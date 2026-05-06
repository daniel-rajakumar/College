import cv2
import numpy as np

cyan = (255, 255, 0)
green = (0, 255, 0)


def shi_tomasi(gray):
    gray = np.float64(gray)

    # sobel filters find the x and y edges.
    sobel_x = np.array([[-1, 0, 1],
                        [-2, 0, 2],
                        [-1, 0, 1]], dtype=np.float64)
    sobel_y = np.array([[-1, -2, -1],
                        [0, 0, 0],
                        [1, 2, 1]], dtype=np.float64)

    ix = cv2.filter2D(gray, -1, sobel_x)
    iy = cv2.filter2D(gray, -1, sobel_y)

    xx = cv2.blur(ix * ix, (5, 5))
    yy = cv2.blur(iy * iy, (5, 5))
    xy = cv2.blur(ix * iy, (5, 5))

    # shi-tomasi uses the smaller eigenvalue as the corner score.
    trace = xx + yy
    det = xx * yy - xy * xy
    score = trace / 2 - np.sqrt(np.maximum((trace / 2) ** 2 - det, 0))
    return score


def find_points(scores, mask):
    # only keep corner scores inside the hand mask.
    scores = scores * (mask.astype(np.float64) / 255)
    max_score = scores.max()

    if max_score <= 0:
        return []

    y_list, x_list = np.where(scores > max_score * 0.006)
    points = list(zip(x_list, y_list, scores[y_list, x_list]))
    points.sort(key=lambda p: p[2], reverse=True)

    picked = []
    for x, y, score in points:
        keep_point = True
        for old_x, old_y, _ in picked:
            if abs(x - old_x) < 9 and abs(y - old_y) < 9:
                keep_point = False
                break

        if keep_point:
            picked.append((x, y, score))

        if len(picked) == 140:
            break

    return picked


def make_skin_mask(img):
    # these color ranges help separate ur hand hand from the bg.
    ycrcb = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)
    ycrcb_mask = cv2.inRange(ycrcb,
                             np.array([35, 140, 75]),
                             np.array([255, 178, 132]))

    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    hsv_mask = cv2.inRange(hsv,
                           np.array([0, 35, 70]),
                           np.array([24, 210, 255]))

    b, g, r = cv2.split(img)
    high = np.maximum.reduce([r, g, b])
    low = np.minimum.reduce([r, g, b])

    rgb_mask = (
        (r > 85) &
        (g > 55) &
        (b > 35) &
        (high - low > 20) &
        (np.abs(r.astype(np.int16) - g.astype(np.int16)) > 8) &
        (r > g) &
        (r > b)
    ).astype(np.uint8) * 255

    mask = ycrcb_mask & hsv_mask & rgb_mask
    kernel = np.ones((5, 5), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=3)
    mask = cv2.GaussianBlur(mask, (5, 5), 0)
    mask = cv2.threshold(mask, 90, 255, cv2.THRESH_BINARY)[1]

    contours = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)[0]
    h, w = mask.shape
    middle = np.array([w * 0.5, h * 0.52])

    best_contour = None
    best_score = -999999

    # pick the contour that looks most like a hand in the middle of the box...
    for contour in contours:
        area = cv2.contourArea(contour)
        if area < h * w * 0.01 or area > h * w * 0.45:
            continue

        x, y, bw, bh = cv2.boundingRect(contour)
        if bw * bh > h * w * 0.38:
            continue

        ratio = bw / float(bh)
        if ratio < 0.30 or ratio > 1.25:
            continue

        m = cv2.moments(contour)
        if m["m00"] == 0:
            continue

        cx = m["m10"] / m["m00"]
        cy = m["m01"] / m["m00"]
        score = area - np.linalg.norm(np.array([cx, cy]) - middle) * 120

        if score > best_score:
            best_score = score
            best_contour = contour

    hand = np.zeros_like(mask)
    if best_contour is not None:
        cv2.drawContours(hand, [best_contour], -1, 255, -1)
        hand = cv2.morphologyEx(hand, cv2.MORPH_CLOSE, kernel, iterations=2)
        hand = cv2.dilate(hand, kernel)

    return hand


def draw_box(img, x1, y1, x2, y2):
    cv2.rectangle(img, (x1, y1), (x2, y2), cyan, 4)
    cv2.putText(img, "Place palm here", (x1, max(42, y1 - 18)),
                cv2.FONT_HERSHEY_SIMPLEX, 1.25, cyan, 3, cv2.LINE_AA)

    for x, y in [(x1, y1), (x2, y1), (x1, y2), (x2, y2)]:
        cv2.rectangle(img, (x - 6, y - 6), (x + 6, y + 6), green, -1)


cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("can't own web cam")
else:
    print("place ur palm in the box")
    print("press esc or q to QUIT!!")

while cap.isOpened():
    worked, frame = cap.read()
    if not worked:
        break

    # mirror the camera so it feels like looking in a mirror.
    frame = cv2.flip(frame, 1)
    height, width = frame.shape[:2]

    margin = max(20, int(width * 0.035))
    x1 = margin
    y1 = max(60, int(height * 0.10))
    x2 = width - margin
    y2 = height - margin

    roi = frame[y1:y2, x1:x2]
    gray = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
    gray = cv2.GaussianBlur(gray, (5, 5), 1)

    mask = make_skin_mask(roi)
    small_kernel = np.ones((3, 3), np.uint8)
    edges = cv2.morphologyEx(mask, cv2.MORPH_GRADIENT, small_kernel)
    inside = cv2.erode(mask, small_kernel, iterations=2)
    point_mask = cv2.bitwise_or(inside, edges)

    points = find_points(shi_tomasi(gray), point_mask)

    draw_box(frame, x1, y1, x2, y2)

    for x, y, score in points:
        cv2.drawMarker(frame, (x + x1, y + y1), green, cv2.MARKER_STAR, 13, 3, cv2.LINE_AA)
        cv2.circle(frame, (x + x1, y + y1), 4, green, -1, cv2.LINE_AA)

    cv2.imshow("Shi-Tomasi Palm Feature Detection", frame)

    key = cv2.waitKey(1) & 0xFF
    if key == 27 or key == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()
