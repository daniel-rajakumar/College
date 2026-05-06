import numpy as np
from PIL import Image
from numpy.lib.stride_tricks import sliding_window_view

# const varaibles 

INPUT_PATH = "curved-lane.jpg"
OUTPUT_PATH = "curved-lane-output.png"
LOW_PERCENT = 5
HIGH_PERCENT = 95
THRESHOLD = 0.26
ROI_TOP = 0.60
LEFT_TOP = 0.40
LEFT_BOTTOM = 0.22
RIGHT_TOP = 0.60
RIGHT_BOTTOM = 0.70


## code 

GAUSSIAN = np.array(
    [[1, 4, 6, 4, 1], [4, 16, 24, 16, 4], [6, 24, 36, 24, 6], [4, 16, 24, 16, 4], [1, 4, 6, 4, 1]],
    dtype=np.float32,
) / 256.0
SOBEL_X = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], dtype=np.float32)
SOBEL_Y = np.array([[-1, -2, -1], [0, 0, 0], [1, 2, 1]], dtype=np.float32)

img = np.array(Image.open(INPUT_PATH).convert("L"), dtype=np.float32)

# convolution
def do_filter(pic, kernel):
    a, b = kernel.shape
    padded = np.pad(pic, ((a // 2, a // 2), (b // 2, b // 2)), mode="edge")
    return np.sum(sliding_window_view(padded, (a, b)) * kernel, axis=(-2, -1))


# contrast enhancement
def make_better(pic):
    low = np.percentile(pic, LOW_PERCENT)
    high = np.percentile(pic, HIGH_PERCENT)
    if high <= low:
        return pic.copy()
    return np.clip((pic - low) * 255.0 / (high - low), 0, 255)


# dilation
def grow(pic):
    return np.any(
        sliding_window_view(np.pad(pic, ((1, 1), (1, 1)), mode="constant"), (3, 3)) == 1,
        axis=(-2, -1),
    ).astype(np.uint8)


# main pipeline
better = make_better(do_filter(img, GAUSSIAN))
edges = np.sqrt(do_filter(better, SOBEL_X) ** 2 + do_filter(better, SOBEL_Y) ** 2)
edges = edges / edges.max()
binary = (edges > THRESHOLD).astype(np.uint8)

h, w = binary.shape
mask = np.zeros((h, w), dtype=np.uint8)
top = int(h * ROI_TOP)

# region of interest
for i in range(top, h):
    part = (i - top) / max(h - 1 - top, 1)
    left = int((LEFT_TOP + (LEFT_BOTTOM - LEFT_TOP) * part) * w)
    right = int((RIGHT_TOP + (RIGHT_BOTTOM - RIGHT_TOP) * part) * w)
    mask[i, left:right] = 1

final = grow(binary * mask)
final[[0, -1], :] = 0
final[:, [0, -1]] = 0

Image.fromarray((final * 255).astype(np.uint8)).save(OUTPUT_PATH)
