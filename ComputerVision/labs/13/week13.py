import cv2
import numpy as np
import os

dir = os.path.dirname(os.path.abspath(__file__))

img = cv2.imread(os.path.join(dir, "input.png"))
template = cv2.imread(os.path.join(dir, "template.png"))

gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
gray_templ = cv2.cvtColor(template, cv2.COLOR_BGR2GRAY)

h, w = gray_templ.shape

# template matching
result = cv2.matchTemplate(gray, gray_templ, cv2.TM_CCOEFF_NORMED)

threshold = 0.8
loc = np.where(result >= threshold)

points = list(zip(*loc[::-1]))

# remove duplicates
matches = []
for pt in points:
    keep = True
    for m in matches:
        if abs(pt[0] - m[0]) < w//2 and abs(pt[1] - m[1]) < h//2:
            keep = False
            break
    if keep:
        matches.append(pt)

print("Total matches:", len(matches))

output = img.copy()
for pt in matches:
    cv2.rectangle(output, pt, (pt[0] + w, pt[1] + h), (0, 255, 0), 3)

# add title on top
pad = 60
canvas = np.ones((output.shape[0] + pad, output.shape[1], 3), dtype=np.uint8) * 255
canvas[pad:] = output

title = "All Matches Found: " + str(len(matches))
textsize = cv2.getTextSize(title, cv2.FONT_HERSHEY_SIMPLEX, 1, 2)[0]
tx = (canvas.shape[1] - textsize[0]) // 2
cv2.putText(canvas, title, (tx, 40), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 0), 2)

cv2.imwrite(os.path.join(dir, "output.png"), canvas)
print("saved output.png")
