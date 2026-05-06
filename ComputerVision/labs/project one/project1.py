# project 1 - object deteciton stuff...
# detectign coins, parking lot cars, and cars on snowy road

from pathlib import Path
from urllib.request import urlretrieve
import cv2
import matplotlib.pyplot as plt
import numpy as np


SHOW_IMAGES = False


# funciton to show image...
def show_image(title, image, cmap=None, size=(10, 7)):
    if SHOW_IMAGES == False:
        return
    plt.figure(figsize=size)
    plt.imshow(image, cmap=cmap)
    plt.title(title)
    plt.axis("off")
    plt.show()


# loadign the image
def load_image(path):
    image = cv2.imread(str(path))
    if image is None:
        raise FileNotFoundError(f"Could not load image: {path}")
    return image


# trys to find the file...
def resolve_input_path(base, filename):
    candidates = [
        base / filename,
        base.parent / filename,
    ]
    for path in candidates:
        if path.exists():
            return path
    return base / filename


# this finds segments that are above the treshold...
def connected_segments(signal, threshold, max_gap=25):
    xs = np.where(signal > threshold)[0]
    if xs.size == 0:
        return []

    segments = []
    start    = int(xs[0])
    prev     = int(xs[0])
    for value in xs[1:]:
        value = int(value)
        if value - prev > max_gap:
            segments.append((start, prev))
            start = value
        prev = value
    segments.append((start, prev))
    return segments


# mergeing boxes together if they overalp...
def merge_boxes(boxes, x_gap=25, y_gap=25):
    merged = [list(box) for box in boxes]
    changed = True

    while changed:
        changed = False
        next_boxes = []
        for box in merged:
            x1, y1, x2, y2 = box
            merged_here = False
            for other in next_boxes:
                ox1, oy1, ox2, oy2 = other

                horizontal_gap = max(0, max(ox1, x1) - min(ox2, x2))
                vertical_gap   = max(0, max(oy1, y1) - min(oy2, y2))
                overlap_x      = max(0, min(ox2, x2) - max(ox1, x1))
                overlap_y      = max(0, min(oy2, y2) - max(oy1, y1))

                if (horizontal_gap <= x_gap and vertical_gap <= y_gap
                    and (overlap_x > 0 or overlap_y > 0 or horizontal_gap + vertical_gap < 30)):
                    other[0] = min(ox1, x1)
                    other[1] = min(oy1, y1)
                    other[2] = max(ox2, x2)
                    other[3] = max(oy2, y2)
                    merged_here = True
                    changed = True
                    break

            if not merged_here:
                next_boxes.append([x1, y1, x2, y2])

        merged = next_boxes

    return [tuple(box) for box in merged]


# scaleing the polygon points to match image size...
def scaled_polygon(points, width, height, base_width=1600, base_height=1067):
    scaled = []
    for x, y in points:
        new_x  = int(round(x * width / base_width))
        new_y  = int(round(y * height / base_height))
        scaled.append([new_x, new_y])
    return np.array(scaled, dtype=np.int32)


# same thing but for rectagles
def scaled_rect(x, y, w, h, width, height, base_width=1600, base_height=1067):
    return (
        int(round(x * width / base_width)),
        int(round(y * height / base_height)),
        int(round(w * width / base_width)),
        int(round(h * height / base_height)),
    )


# trys to split a big box into 2 smaller ones...
def split_large_box(mask, box):
    x1, y1, x2, y2 = box
    region = mask[y1:y2, x1:x2]
    if region.size == 0:
        return [box]

    pieces = [box]

    if (y2 - y1) > 170:
        row_density  = region.mean(axis=1) / 255.0
        middle       = row_density[(len(row_density) // 4):(3 * len(row_density) // 4)]
        if middle.size > 0:
            valley_index  = int(np.argmin(middle)) + len(row_density) // 4
            peak          = float(row_density.max())
            if peak > 0 and row_density[valley_index] < 0.45 * peak:
                split_y    = y1 + valley_index
                top_box    = (x1, y1, x2, split_y)
                bottom_box = (x1, split_y, x2, y2)
                pieces     = [top_box, bottom_box]

    return pieces


##############################
# COIN DETECTION
##############################

def detect_coins(coins_image):
    scale   = 0.4
    small   = cv2.resize(coins_image, None, fx=scale, fy=scale)
    gray    = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)
    blurred = cv2.GaussianBlur(gray, (9, 9), 0)
    edges   = cv2.Canny(blurred, 50, 150)

    # closeing the edges to fill in gaps...
    mask = cv2.morphologyEx(edges, cv2.MORPH_CLOSE,
        cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)), iterations=2)

    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    detections = []
    for contour in contours:
        area      = cv2.contourArea(contour)
        perimeter = cv2.arcLength(contour, True)
        if perimeter == 0:
            continue

        # check if its ciruclar enough...
        circularity    = 4 * np.pi * area / (perimeter * perimeter)
        (x, y), radius = cv2.minEnclosingCircle(contour)
        fill_ratio     = area / (np.pi * radius * radius)

        if 6000 < area < 70000 and circularity > 0.55 and fill_ratio > 0.55:
            detections.append((x / scale, y / scale, radius / scale))

    # sort by size bigest first
    detections.sort(key=lambda item: item[2], reverse=True)

    result = cv2.cvtColor(coins_image, cv2.COLOR_BGR2RGB)
    for index, (x, y, radius) in enumerate(detections, start=1):
        center = (int(round(x)), int(round(y)))
        cv2.circle(result, center, int(round(radius)), (0, 255, 0), 5)
        cv2.circle(result, center, 6, (255, 0, 0), -1)
        cv2.putText(result, str(index), (center[0] + 12, center[1] - 12),
            cv2.FONT_HERSHEY_SIMPLEX, 1.0, (255, 0, 0), 3)

    mask_large = cv2.resize(mask, (coins_image.shape[1], coins_image.shape[0]))
    return len(detections), result, mask_large


##############################
# PARKING LOT DETECTION
##############################

def detect_parking_cars(parking_image):
    gray          = cv2.cvtColor(parking_image, cv2.COLOR_BGR2GRAY)
    hsv           = cv2.cvtColor(parking_image, cv2.COLOR_BGR2HSV)
    height, width = gray.shape

    # findign the green hedge thing in the middle...
    hedge_mask = ((hsv[:, :, 0] > 20) & (hsv[:, :, 0] < 95)
        & (hsv[:, :, 1] > 60) & (hsv[:, :, 2] > 40)).astype(np.uint8)

    hedge_density  = hedge_mask.mean(axis=1)
    hedge_rows     = np.where(hedge_density > 0.12)[0]

    if hedge_rows.size == 0:
        hedge_top    = height // 2 - 40
        hedge_bottom = height // 2 + 40
    else:
        hedge_top    = int(hedge_rows.min())
        hedge_bottom = int(hedge_rows.max())

    # top row and botom row configs
    row_configs = [
        (0, max(0, hedge_top - 20), 0.08, 80),
        (min(height, hedge_bottom + 20), height, 0.05, 120),
    ]

    boxes      = []
    debug_mask = np.zeros_like(gray)

    for y0, y1, density_threshold, min_width in row_configs:
        if y1 <= y0:
            continue

        roi              = gray[y0:y1]
        dark_mask         = (roi < 90).astype(np.uint8)
        debug_mask[y0:y1] = dark_mask * 255

        column_density  = dark_mask.mean(axis=0)
        segments        = connected_segments(column_density, density_threshold, max_gap=25)

        # if a segment is to wide we try to split it...
        refined_segments = []
        for start, end in segments:
            if end - start + 1 > 320:
                middle = column_density[start + 60:end - 60]
                if middle.size > 0:
                    split = int(np.argmin(middle)) + start + 60
                    refined_segments.append((start, split - 1))
                    refined_segments.append((split + 1, end))
                else:
                    refined_segments.append((start, end))
            else:
                refined_segments.append((start, end))

        for start, end in refined_segments:
            if end - start + 1 < min_width:
                continue

            left       = max(0, start - 20)
            right      = min(width, end + 21)
            local_mask = dark_mask[:, left:right]
            ys, xs     = np.where(local_mask > 0)
            if ys.size == 0:
                continue

            x1     = max(0, start - 35)
            x2     = min(width - 1, end + 35)
            y1_box = max(0, y0 + int(ys.min()) - 45)
            y2_box = min(height - 1, y0 + int(ys.max()) + 45)
            boxes.append((x1, y1_box, x2, y2_box))

    boxes = sorted(boxes, key=lambda item: (item[1], item[0]))

    result = cv2.cvtColor(parking_image, cv2.COLOR_BGR2RGB)
    for index, (x1, y1, x2, y2) in enumerate(boxes, start=1):
        cv2.rectangle(result, (x1, y1), (x2, y2), (0, 255, 0), 4)
        cv2.putText(result, str(index), (x1 + 5, min(y2 - 10, y1 + 35)),
            cv2.FONT_HERSHEY_SIMPLEX, 1.0, (255, 0, 0), 3)

    return len(boxes), result, debug_mask


##############################
# SNOW ROAD VEHICLE DETECTION
##############################

# donwloads the model if we dont have it yet...
def ensure_mobilenet_model(model_dir):
    model_dir.mkdir(parents=True, exist_ok=True)

    prototxt   = model_dir / "MobileNetSSD_deploy.prototxt"
    caffemodel = model_dir / "MobileNetSSD_deploy.caffemodel"

    downloads = [
        (prototxt, "https://cdn.jsdelivr.net/gh/chuanqi305/MobileNet-SSD@master/voc/MobileNetSSD_deploy.prototxt"),
        (caffemodel, "https://raw.githubusercontent.com/Qengineering/MobileNetV1_SSD_OpenCV_Caffe/master/MobileNetSSD_deploy.caffemodel"),
    ]

    for path, url in downloads:
        if not path.exists():
            urlretrieve(url, path)

    return prototxt, caffemodel


# backup method if the nueral network doesnt work...
def detect_snow_vehicles_heuristic(snow_image):
    height, width  = snow_image.shape[:2]
    gray           = cv2.cvtColor(snow_image, cv2.COLOR_BGR2GRAY)

    road_polygon = scaled_polygon(
        [(760, 0), (1600, 0), (1600, 1067), (470, 1067), (560, 780), (660, 520), (730, 280)],
        width, height)

    road_mask  = np.zeros((height, width), dtype=np.uint8)
    cv2.fillPoly(road_mask,  [road_polygon], 255)

    enhanced  = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8)).apply(gray)
    blurred   = cv2.GaussianBlur(enhanced, (13, 13), 0)
    blackhat = cv2.morphologyEx(blurred, cv2.MORPH_BLACKHAT,
        cv2.getStructuringElement(cv2.MORPH_RECT, (31, 31)))

    _, binary = cv2.threshold(blackhat, 20, 255, cv2.THRESH_BINARY)
    binary = cv2.bitwise_and(binary, road_mask)
    binary = cv2.morphologyEx(binary, cv2.MORPH_CLOSE,
        cv2.getStructuringElement(cv2.MORPH_RECT, (11, 11)), iterations=2)
    binary = cv2.morphologyEx(binary, cv2.MORPH_OPEN,
        cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5)), iterations=1)

    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(binary, connectivity=8)

    boxes = []
    for label in range(1, num_labels):
        x, y, w, h, area = stats[label]
        if not (700 <= area <= 45000):
            continue

        aspect_ratio  = w / max(h, 1)
        fill_ratio    = area / (w * h)
        center        = tuple(centroids[label])

        if (0.5 < aspect_ratio < 2.5 and fill_ratio > 0.18
            and y + h < int(0.95 * height)
            and cv2.pointPolygonTest(road_polygon, center, False) >= 0):
            boxes.append((x, y, x + w, y + h))

    boxes = merge_boxes(boxes, x_gap=30, y_gap=40)

    refined_boxes = []
    for box in boxes:
        refined_boxes.extend(split_large_box(binary, box))

    refined_boxes = merge_boxes(refined_boxes, x_gap=20, y_gap=25)
    refined_boxes = sorted(refined_boxes, key=lambda item: (item[1], item[0]))

    result = cv2.cvtColor(snow_image, cv2.COLOR_BGR2RGB)
    cv2.polylines(result, [road_polygon], True, (255, 0, 0), 2)

    for index, (x1, y1, x2, y2) in enumerate(refined_boxes, start=1):
        cv2.rectangle(result, (x1, y1), (x2, y2), (0, 255, 0), 3)
        cv2.putText(result, str(index), (x1, max(30, y1 - 8)),
            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 0, 0), 2)

    return len(refined_boxes), result, binary


# main snow deteciton using nueral network...
def detect_snow_vehicles(snow_image):
    height, width = snow_image.shape[:2]
    road_polygon = scaled_polygon(
        [(760, 0), (1600, 0), (1600, 1067), (470, 1067), (560, 780), (660, 520), (730, 280)],
        width, height)

    # all the classes the model knows about... (we only care about car though)
    classes = ["background", "aeroplane", "bicycle", "bird", "boat", "bottle",
        "bus", "car", "cat", "chair", "cow", "diningtable", "dog",
        "horse", "motorbike", "person", "pottedplant", "sheep", "sofa",
        "train", "tvmonitor"]

    try:
        model_dir = Path(__file__).resolve().parent / "models"
        prototxt, caffemodel = ensure_mobilenet_model(model_dir)
        net = cv2.dnn.readNetFromCaffe(str(prototxt), str(caffemodel))
    except Exception:
        return detect_snow_vehicles_heuristic(snow_image)

    # trying diffrent crops of the image to find more cars...
    regions = [
        (0, 0, width, height),
        scaled_rect(520, 0, 1080, 620, width, height),
        scaled_rect(650, 120, 700, 520, width, height),
        scaled_rect(900, 0, 700, 520, width, height),
        scaled_rect(650, 250, 900, 500, width, height),
        scaled_rect(950, 250, 500, 500, width, height),
    ]

    candidates = []
    for rx, ry, rw, rh in regions:
        crop = snow_image[ry:ry + rh, rx:rx + rw]
        if crop.size == 0:
            continue

        blob = cv2.dnn.blobFromImage(cv2.resize(crop, (300, 300)),
            0.007843, (300, 300), 127.5)
        net.setInput(blob)
        detections = net.forward()

        for index in range(detections.shape[2]):
            confidence  = float(detections[0, 0, index, 2])
            class_id    = int(detections[0, 0, index, 1])

            if confidence < 0.2 or classes[class_id] != "car":
                continue

            x1, y1, x2, y2 = (detections[0, 0, index, 3:7] * [rw, rh, rw, rh]).astype(int)
            x1 += rx
            x2 += rx
            y1 += ry
            y2 += ry

            # makeing sure its inside the image...
            x1 = max(0, min(width - 1, x1))
            y1 = max(0, min(height - 1, y1))
            x2 = max(0, min(width - 1, x2))
            y2 = max(0, min(height - 1, y2))

            if x2 <= x1 or y2 <= y1:
                continue

            area   = (x2 - x1) * (y2 - y1)
            center = ((x1 + x2) / 2.0, (y1 + y2) / 2.0)
            if area > 0.12 * width * height:
                continue
            if cv2.pointPolygonTest(road_polygon, center, False) < 0:
                continue

            candidates.append((x1, y1, x2, y2, confidence))

    if not candidates:
        return detect_snow_vehicles_heuristic(snow_image)

    # remove dupilcate detections...
    boxes   = [[x1, y1, x2 - x1, y2 - y1] for x1, y1, x2, y2, _ in candidates]
    scores  = [float(confidence) for *_, confidence in candidates]
    indices = cv2.dnn.NMSBoxes(boxes, scores, 0.2, 0.3)

    if len(indices) == 0:
        return detect_snow_vehicles_heuristic(snow_image)

    kept = [candidates[int(index)] for index in np.array(indices).reshape(-1)]
    kept.sort(key=lambda item: (item[1], item[0]))

    result  = cv2.cvtColor(snow_image, cv2.COLOR_BGR2RGB)
    mask    = np.zeros((height, width), dtype=np.uint8)
    cv2.polylines(result, [road_polygon], True, (255, 0, 0), 2)

    for index, (x1, y1, x2, y2, confidence) in enumerate(kept, start=1):
        cv2.rectangle(result, (x1, y1), (x2, y2), (0, 255, 0), 3)
        cv2.putText(result, f"{index}", (x1, max(30, y1 - 8)),
            cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 0, 0), 2)
        cv2.rectangle(mask, (x1, y1), (x2, y2), 255, -1)

    return len(kept), result, mask


##############################
# MAIN PART
##############################

def main():
    base = Path(__file__).resolve().parent

    parking_image = load_image(resolve_input_path(base, "cars_parking.png"))
    snow_image    = load_image(resolve_input_path(base, "cars.png"))
    coins_image   = load_image(resolve_input_path(base, "Coins-scaled.jpg"))

    parking_rgb = cv2.cvtColor(parking_image, cv2.COLOR_BGR2RGB)
    snow_rgb    = cv2.cvtColor(snow_image, cv2.COLOR_BGR2RGB)
    coins_rgb   = cv2.cvtColor(coins_image, cv2.COLOR_BGR2RGB)

    show_image("Parking Lot Image", parking_rgb, size=(12, 8))
    show_image("Snow Road Image", snow_rgb, size=(10, 7))
    show_image("Coins Image", coins_rgb, size=(10, 7))

    coin_count,    coins_result,   coins_mask   = detect_coins(coins_image)
    parking_count, parking_result, parking_mask = detect_parking_cars(parking_image)
    snow_count,    snow_result,    snow_mask    = detect_snow_vehicles(snow_image)

    show_image("Coins Detection Mask", coins_mask, cmap="gray", size=(10, 7))
    show_image(f"Final Coins Detection: {coin_count} coins", coins_result, size=(10, 7))

    show_image("Parking Detection Mask", parking_mask, cmap="gray", size=(12, 8))
    show_image(f"Final Parking Detection: {parking_count} cars", parking_result, size=(12, 8))

    show_image("Snow Detection Mask", snow_mask, cmap="gray", size=(10, 7))
    show_image(f"Final Snow Vehicle Candidates: {snow_count}", snow_result, size=(10, 7))

    print("Final Reuslts...")
    print("<><><><><><><><><><>")
    print("> Coins:", coin_count)
    print("> Parking lot:", parking_count)
    print("> Snow road:", snow_count)


if __name__ == "__main__":
    main()
