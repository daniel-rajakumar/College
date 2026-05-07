# Open-Notes Computer Vision Final Exam Blueprint

Assume this setup for most examples:

```python
import cv2  # Import OpenCV for image loading, conversion, filtering, and drawing.
import numpy as np  # Import NumPy for array math and mask creation.
import matplotlib.pyplot as plt  # Import Matplotlib so examples can display images and histograms.

img = cv2.imread("image.jpg")  # BGR by default
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)  # Convert BGR color pixels into one grayscale intensity channel.

def show(title, image):  # Define a helper that displays grayscale and color images correctly.
    plt.figure(figsize=(6, 4))  # Create a new figure with a readable display size.
    if len(image.shape) == 2:  # Check whether the image has only one channel.
        plt.imshow(image, cmap="gray")  # Display single-channel images using a grayscale colormap.
    else:  # Handle the color-image display path.
        plt.imshow(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))  # Convert BGR to RGB before displaying a color image.
    plt.title(title)  # Perform this step in the image-processing pipeline.
    plt.axis("off")  # Hide axes so only the image is visible.
    plt.show()  # Render the current figure to the screen.
```

## 1. RGB Channels

### Concept

An RGB image has **3 channels**:

```text
Red, Green, Blue
```

In OpenCV, images are loaded as:

```text
BGR, not RGB
```

So:

```python
img = cv2.imread("image.jpg")  # Read the source image from disk in BGR format.
b, g, r = cv2.split(img)  # Split the OpenCV image into blue, green, and red channels.
```

Each channel is a grayscale image showing the intensity of that color.

### Split Channels

```python
img = cv2.imread("image.jpg")  # Read the source image from disk in BGR format.

b, g, r = cv2.split(img)  # Split the OpenCV image into blue, green, and red channels.

show("Blue Channel", b)  # Display this intermediate or final result.
show("Green Channel", g)  # Display this intermediate or final result.
show("Red Channel", r)  # Display this intermediate or final result.
```

### Merge Channels

```python
merged = cv2.merge([b, g, r])  # Recombine separate BGR channels into one color image.
show("Merged Image", merged)  # Display this intermediate or final result.
```

### Convert BGR to RGB

```python
rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)  # Reorder OpenCV BGR channels into RGB for Matplotlib display.
plt.imshow(rgb)  # Show the RGB image with correct color ordering.
plt.axis("off")  # Hide axes so only the image is visible.
plt.show()  # Render the current figure to the screen.
```

### Zero Out Channels

```python
zeros = np.zeros_like(b)  # Create an all-black channel with the same size as one color plane.

blue_only = cv2.merge([b, zeros, zeros])  # Keep only blue values while zeroing green and red.
green_only = cv2.merge([zeros, g, zeros])  # Keep only green values while zeroing blue and red.
red_only = cv2.merge([zeros, zeros, r])  # Keep only red values while zeroing blue and green.

show("Blue Only", blue_only)  # Display this intermediate or final result.
show("Green Only", green_only)  # Display this intermediate or final result.
show("Red Only", red_only)  # Display this intermediate or final result.
```

## 2. HSV

### Concept

HSV stands for:

```text
Hue, Saturation, Value
```

It is useful for **color detection** because it separates color from brightness.

```text
H = color type
S = color intensity
V = brightness
```

OpenCV HSV range:

```text
Hue: 0 to 179
Saturation: 0 to 255
Value: 0 to 255
```

### Convert BGR to HSV

```python
img = cv2.imread("image.jpg")  # Read the source image from disk in BGR format.
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)  # Convert BGR color into HSV for easier color masking.

h, s, v = cv2.split(hsv)  # Split HSV into hue, saturation, and value channels.

show("Hue", h)  # Display hue values as a grayscale image.
show("Saturation", s)  # Display saturation values as a grayscale image.
show("Value", v)  # Display brightness values as a grayscale image.
```

### Color Masking with HSV

Example: detect red objects.

```python
img = cv2.imread("image.jpg")  # Read the source image from disk in BGR format.
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)  # Convert BGR color into HSV for easier color masking.

lower_red1 = np.array([0, 100, 100])  # Set the lower HSV bound for red near hue 0.
upper_red1 = np.array([10, 255, 255])  # Set the upper HSV bound for red near hue 0.

lower_red2 = np.array([160, 100, 100])  # Set the lower HSV bound for red near hue 179.
upper_red2 = np.array([179, 255, 255])  # Set the upper HSV bound for red near hue 179.

mask1 = cv2.inRange(hsv, lower_red1, upper_red1)  # Create a binary mask for the first red hue interval.
mask2 = cv2.inRange(hsv, lower_red2, upper_red2)  # Create a binary mask for the second red hue interval.

red_mask = mask1 + mask2  # Combine both red hue ranges into one binary mask.

result = cv2.bitwise_and(img, img, mask=red_mask)  # Keep only pixels selected by the mask.

show("Red Mask", red_mask)  # Display this intermediate or final result.
show("Detected Red", result)  # Display this intermediate or final result.
```

## 3. Contrast

### Concept

Contrast is the difference between light and dark pixels.

Higher contrast means:

```text
dark pixels become darker
bright pixels become brighter
```

Basic formula:

```text
new_pixel = alpha * old_pixel + beta
```

Where:

```text
alpha = contrast
beta = brightness
```

### Increase Contrast

```python
img = cv2.imread("image.jpg")  # Read the source image from disk in BGR format.

alpha = 1.8  # contrast
beta = 20  # brightness

contrast_img = cv2.convertScaleAbs(img, alpha=alpha, beta=beta)  # Scale contrast, shift brightness, and clamp values to uint8.

show("Original", img)  # Display this intermediate or final result.
show("High Contrast", contrast_img)  # Display this intermediate or final result.
```

### Manual Contrast Stretching

```python
gray = cv2.imread("image.jpg", 0)  # Read the image directly as grayscale.

min_val = np.min(gray)  # Find the darkest intensity in the grayscale image.
max_val = np.max(gray)  # Find the brightest intensity in the grayscale image.

stretched = ((gray - min_val) / (max_val - min_val) * 255).astype(np.uint8)  # Stretch the original intensity range across the full 0 to 255 range.

show("Contrast Stretched", stretched)  # Display this intermediate or final result.
```

## 4. Non-Linear Transformations

### Concept

Non-linear transformations change pixel values using a non-linear formula.

Common examples:

```text
Log transformation
Gamma transformation
Power-law transformation
```

They are useful for enhancing dark or bright areas.

### Log Transformation

Good for brightening dark details.

```python
gray = cv2.imread("image.jpg", 0)  # Read the image directly as grayscale.

c = 255 / np.log(1 + np.max(gray))  # Compute the scale factor that maps log output back to 255.
log_img = c * np.log(1 + gray)  # Apply the log transform to brighten darker details.

log_img = np.array(log_img, dtype=np.uint8)  # Convert transformed values back to displayable 8-bit pixels.

show("Log Transformation", log_img)  # Display this intermediate or final result.
```

### Gamma Correction

Formula:

```text
output = input ^ gamma
```

If:

```text
gamma < 1 -> image becomes brighter
gamma > 1 -> image becomes darker
```

```python
gray = cv2.imread("image.jpg", 0)  # Read the image directly as grayscale.

gamma = 0.5  # Pick a gamma below 1 to brighten the image.

normalized = gray / 255.0  # Scale pixel values from 0-255 into the 0-1 range.
gamma_corrected = np.power(normalized, gamma)  # Apply the gamma power-law curve to normalized intensities.
gamma_corrected = np.uint8(gamma_corrected * 255)  # Scale corrected values back to 0-255 unsigned bytes.

show("Gamma Corrected", gamma_corrected)  # Display this intermediate or final result.
```

### Gamma Function

```python
def gamma_correction(image, gamma):  # Perform this step in the image-processing pipeline.
    normalized = image / 255.0  # Scale pixel values from 0-255 into the 0-1 range.
    corrected = np.power(normalized, gamma)  # Apply gamma to the normalized image values.
    return np.uint8(corrected * 255)  # Return the corrected image as displayable 8-bit pixels.

bright = gamma_correction(gray, 0.5)  # Create a brighter version using gamma below 1.
dark = gamma_correction(gray, 2.0)  # Create a darker version using gamma above 1.

show("Brighter Gamma", bright)  # Display this intermediate or final result.
show("Darker Gamma", dark)  # Display this intermediate or final result.
```

## 5. Histogram Enhancement

### Concept

A histogram shows how many pixels have each intensity value.

For grayscale:

```text
x-axis = intensity 0 to 255
y-axis = number of pixels
```

Histogram enhancement improves image contrast.

### Plot Histogram

```python
gray = cv2.imread("image.jpg", 0)  # Read the image directly as grayscale.

plt.hist(gray.ravel(), bins=256, range=[0, 256])  # Flatten the grayscale image and count intensities from 0 to 255.
plt.title("Histogram")  # Label the histogram plot.
plt.xlabel("Pixel Intensity")  # Label the x-axis with intensity values.
plt.ylabel("Frequency")  # Label the y-axis with pixel counts.
plt.show()  # Render the current figure to the screen.
```

### Histogram Equalization

```python
gray = cv2.imread("image.jpg", 0)  # Read the image directly as grayscale.

equalized = cv2.equalizeHist(gray)  # Redistribute grayscale intensities to improve global contrast.

show("Original", gray)  # Display this intermediate or final result.
show("Histogram Equalized", equalized)  # Display this intermediate or final result.
```

### CLAHE

CLAHE means:

```text
Contrast Limited Adaptive Histogram Equalization
```

It improves local contrast and avoids over-enhancing noise.

```python
gray = cv2.imread("image.jpg", 0)  # Read the image directly as grayscale.

clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))  # Create a CLAHE enhancer with contrast limiting and local tiles.
clahe_img = clahe.apply(gray)  # Apply local histogram equalization to the grayscale image.

show("CLAHE", clahe_img)  # Display the locally contrast-enhanced result.
```

## 6. Masking

### Concept

A mask is a binary image used to select part of an image.

```text
white pixels = keep
black pixels = remove
```

### Create Simple Rectangle Mask

```python
img = cv2.imread("image.jpg")  # Read the source image from disk in BGR format.

mask = np.zeros(img.shape[:2], dtype=np.uint8)  # Start with a black mask matching the image height and width.

cv2.rectangle(mask, (100, 100), (300, 300), 255, -1)  # Draw a filled white rectangle into the mask.

masked = cv2.bitwise_and(img, img, mask=mask)  # Apply the mask so unselected pixels become black.

show("Mask", mask)  # Display this intermediate or final result.
show("Masked Image", masked)  # Display this intermediate or final result.
```

### Circle Mask

```python
mask = np.zeros(img.shape[:2], dtype=np.uint8)  # Start with a black mask matching the image height and width.

cv2.circle(mask, (250, 250), 100, 255, -1)  # Draw a filled white circle into the mask.

masked = cv2.bitwise_and(img, img, mask=mask)  # Apply the mask so unselected pixels become black.

show("Circle Mask", mask)  # Display the circular binary mask.
show("Masked Result", masked)  # Display the image after applying the circular mask.
```

### Threshold Mask

```python
gray = cv2.imread("image.jpg", 0)  # Read the image directly as grayscale.

_, mask = cv2.threshold(gray, 120, 255, cv2.THRESH_BINARY)  # Create a binary mask by thresholding grayscale intensities.

result = cv2.bitwise_and(gray, gray, mask=mask)  # Keep only pixels selected by the mask.

show("Threshold Mask", mask)  # Display this intermediate or final result.
show("Result", result)  # Display this intermediate or final result.
```

## 7. Noise Reduction

### Concept

Noise is random unwanted pixels.

Common noise types:

```text
Gaussian noise
Salt-and-pepper noise
Speckle noise
```

Filters:

```text
Average blur
Gaussian blur
Median blur
Bilateral filter
```

### Average Blur

```python
img = cv2.imread("image.jpg")  # Read the source image from disk in BGR format.

blur = cv2.blur(img, (5, 5))  # Average each pixel with its 5x5 neighborhood.

show("Average Blur", blur)  # Display the average-blurred image.
```

### Gaussian Blur

Good for general smoothing.

```python
blur = cv2.GaussianBlur(img, (5, 5), 0)  # Smooth the image with a Gaussian-weighted 5x5 neighborhood.

show("Gaussian Blur", blur)  # Display the Gaussian-smoothed image.
```

### Median Blur

Best for salt-and-pepper noise.

```python
median = cv2.medianBlur(img, 5)  # Replace each pixel with the median value in its neighborhood.

show("Median Blur", median)  # Display the median-filtered image.
```

### Bilateral Filter

Smooths image but keeps edges.

```python
bilateral = cv2.bilateralFilter(img, 9, 75, 75)  # Smooth similar nearby colors while preserving strong edges.

show("Bilateral Filter", bilateral)  # Display the edge-preserving smoothed image.
```

### Quick Comparison

```text
Average Blur: simple smoothing
Gaussian Blur: natural smoothing
Median Blur: removes salt-and-pepper noise
Bilateral Filter: smooths while preserving edges
```

## 8. Edge Detection

### Concept

Edges are areas where pixel intensity changes sharply.

Used for:

```text
object boundaries
shape detection
contours
segmentation
```

## 8.1 Sobel Edge Detection

### Concept

Sobel finds edges by calculating gradients in x and y directions.

```text
Sobel X = vertical edges
Sobel Y = horizontal edges
```

### Sobel Code

```python
gray = cv2.imread("image.jpg", 0)  # Read the image directly as grayscale.

sobel_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)  # Compute horizontal intensity gradients that reveal vertical edges.
sobel_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)  # Compute vertical intensity gradients that reveal horizontal edges.

sobel_x = cv2.convertScaleAbs(sobel_x)  # Convert signed x-gradient values into visible 8-bit magnitudes.
sobel_y = cv2.convertScaleAbs(sobel_y)  # Convert signed y-gradient values into visible 8-bit magnitudes.

sobel_combined = cv2.bitwise_or(sobel_x, sobel_y)  # Merge x and y edge responses into one edge image.

show("Sobel X", sobel_x)  # Display vertical-edge strength from the x-gradient.
show("Sobel Y", sobel_y)  # Display horizontal-edge strength from the y-gradient.
show("Sobel Combined", sobel_combined)  # Display the combined Sobel edge map.
```

## 8.2 Canny Edge Detection

### Concept

Canny is a multi-step edge detector.

Steps:

```text
1. Noise reduction with Gaussian blur
2. Gradient calculation
3. Non-Maximum Suppression
4. Double Threshold
5. Edge tracking by hysteresis
```

### Canny Code

```python
gray = cv2.imread("image.jpg", 0)  # Read the image directly as grayscale.

blur = cv2.GaussianBlur(gray, (5, 5), 0)  # Smooth the image with a Gaussian-weighted 5x5 neighborhood.

edges = cv2.Canny(blur, 100, 200)  # Run Canny edge detection with the chosen low and high thresholds.

show("Canny Edges", edges)  # Display the final thin Canny edge map.
```

### Threshold Meaning

```python
edges = cv2.Canny(gray, threshold1=50, threshold2=150)  # Run Canny edge detection with the chosen low and high thresholds.
```

```text
threshold1 = lower threshold
threshold2 = upper threshold
```

Higher thresholds detect fewer edges.

Lower thresholds detect more edges but may include noise.

## 8.3 Non-Maximum Suppression

### Concept

Non-Maximum Suppression, or NMS, makes edges thinner.

It keeps only pixels that are local maximums in the gradient direction.

Purpose:

```text
turn thick edges into thin one-pixel edges
```

Simple explanation:

```text
If a pixel is not the strongest edge pixel compared to neighbors,
remove it.
```

### NMS in Canny

OpenCV Canny already includes NMS.

```python
edges = cv2.Canny(gray, 100, 200)  # Run Canny edge detection with the chosen low and high thresholds.
```

You usually do not code NMS manually unless asked.

## 8.4 Double Threshold

### Concept

Canny uses two thresholds:

```text
Strong edge: pixel value above high threshold
Weak edge: pixel value between low and high threshold
Non-edge: pixel value below low threshold
```

Then hysteresis keeps weak edges only if they connect to strong edges.

```python
low = 50  # Set the lower Canny threshold for weak edges.
high = 150  # Set the upper Canny threshold for strong edges.

edges = cv2.Canny(gray, low, high)  # Run Canny edge detection with the chosen low and high thresholds.

show("Double Threshold Canny", edges)  # Display Canny output using the chosen low and high thresholds.
```

## 9. Morphology

### Concept

Morphology works mostly on binary images.

It uses a small matrix called a kernel.

Common operations:

```text
Erosion
Dilation
Opening
Closing
```

### Kernel

```python
kernel = np.ones((5, 5), np.uint8)  # Create a square structuring element for morphology.
```

## 9.1 Erosion

### Concept

Erosion removes pixels from object boundaries.

It makes white objects smaller.

Useful for:

```text
removing small white noise
separating connected objects
```

```python
binary = cv2.imread("binary.jpg", 0)  # Read an already-thresholded binary image as grayscale.

kernel = np.ones((5, 5), np.uint8)  # Create a square structuring element for morphology.

eroded = cv2.erode(binary, kernel, iterations=1)  # Shrink white regions by one erosion pass.

show("Eroded", eroded)  # Display the eroded binary image.
```

## 9.2 Dilation

### Concept

Dilation adds pixels to object boundaries.

It makes white objects larger.

Useful for:

```text
filling small gaps
joining broken parts
```

```python
dilated = cv2.dilate(binary, kernel, iterations=1)  # Grow white regions by one dilation pass.

show("Dilated", dilated)  # Display the dilated binary image.
```

## 9.3 Opening

### Concept

Opening is:

```text
Erosion followed by dilation
```

Used to remove small white noise.

```python
opened = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)  # Run erosion then dilation to remove small white noise.

show("Opening", opened)  # Display the noise-reduced opening result.
```

## 9.4 Closing

### Concept

Closing is:

```text
Dilation followed by erosion
```

Used to fill small black holes or gaps.

```python
closed = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)  # Run dilation then erosion to close small dark gaps.

show("Closing", closed)  # Display the gap-filled closing result.
```

### Quick Morphology Table

| Operation | Effect                | Best Use           |
| --------- | --------------------- | ------------------ |
| Erosion   | Shrinks white regions | Remove white noise |
| Dilation  | Expands white regions | Fill gaps          |
| Opening   | Erode then dilate     | Remove small noise |
| Closing   | Dilate then erosion   | Fill holes         |

## 10. Binary Image

### Concept

A binary image has only two values:

```text
0 = black
255 = white
```

Used for:

```text
segmentation
morphology
contour detection
object counting
```

### Simple Thresholding

```python
gray = cv2.imread("image.jpg", 0)  # Read the image directly as grayscale.

_, binary = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)  # Convert grayscale pixels into black or white values.

show("Binary Image", binary)  # Display the thresholded black-and-white image.
```

### Inverse Threshold

```python
_, binary_inv = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY_INV)  # Create an inverted black-and-white threshold result.

show("Inverse Binary", binary_inv)  # Display the inverted binary image.
```

### Otsu Thresholding

Automatically chooses threshold.

```python
_, otsu = cv2.threshold(  # Ask Otsu thresholding to choose the cutoff automatically.
    gray,  # Pass this argument into the multi-line call.
    0,  # Pass this argument into the multi-line call.
    255,  # Pass this argument into the multi-line call.
    cv2.THRESH_BINARY + cv2.THRESH_OTSU  # Perform this step in the image-processing pipeline.
)  # Close the multi-line call or data structure.

show("Otsu Binary", otsu)  # Display the automatically thresholded Otsu result.
```

### Adaptive Thresholding

Good for uneven lighting.

```python
adaptive = cv2.adaptiveThreshold(  # Compute local thresholds for uneven lighting conditions.
    gray,  # Pass this argument into the multi-line call.
    255,  # Pass this argument into the multi-line call.
    cv2.ADAPTIVE_THRESH_GAUSSIAN_C,  # Pass this argument into the multi-line call.
    cv2.THRESH_BINARY,  # Pass this argument into the multi-line call.
    11,  # Pass this argument into the multi-line call.
    2  # Use a line thickness of 2 pixels.
)  # Close the multi-line call or data structure.

show("Adaptive Threshold", adaptive)  # Display the locally thresholded result.
```

## 11. Contour Analysis

### Concept

Contours are curves around connected white regions in a binary image.

Used for:

```text
object detection
object counting
shape analysis
area measurement
bounding boxes
```

### Find Contours

```python
gray = cv2.imread("image.jpg", 0)  # Read the image directly as grayscale.

_, binary = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)  # Convert grayscale pixels into black or white values.

contours, hierarchy = cv2.findContours(  # Extract contours from connected white regions in the binary image.
    binary,  # Pass this argument into the multi-line call.
    cv2.RETR_EXTERNAL,  # Pass this argument into the multi-line call.
    cv2.CHAIN_APPROX_SIMPLE  # Perform this step in the image-processing pipeline.
)  # Close the multi-line call or data structure.

print("Number of contours:", len(contours))  # Print how many connected white-region boundaries were found.
```

### Draw Contours

```python
img = cv2.imread("image.jpg")  # Read the source image from disk in BGR format.

cv2.drawContours(img, contours, -1, (0, 255, 0), 2)  # Draw every contour outline in green on the image.

show("Contours", img)  # Display the image with contour outlines drawn.
```

### Contour Area

```python
for cnt in contours:  # Loop through each detected contour.
    area = cv2.contourArea(cnt)  # Measure the area enclosed by the current contour.
    print("Area:", area)  # Print this value so you can inspect the result.
```

### Bounding Rectangle

```python
img = cv2.imread("image.jpg")  # Read the source image from disk in BGR format.

for cnt in contours:  # Loop through each detected contour.
    x, y, w, h = cv2.boundingRect(cnt)  # Compute the smallest upright rectangle around the contour.
    cv2.rectangle(img, (x, y), (x+w, y+h), (0, 255, 0), 2)  # Draw the bounding box on the image.

show("Bounding Boxes", img)  # Display rectangles around each contour.
```

### Filter Small Contours

```python
img = cv2.imread("image.jpg")  # Read the source image from disk in BGR format.

for cnt in contours:  # Loop through each detected contour.
    area = cv2.contourArea(cnt)  # Measure the area enclosed by the current contour.

    if area > 500:  # Ignore tiny contours that are probably noise.
        x, y, w, h = cv2.boundingRect(cnt)  # Compute the smallest upright rectangle around the contour.
        cv2.rectangle(img, (x, y), (x+w, y+h), (0, 255, 0), 2)  # Draw the bounding box on the image.

show("Filtered Contours", img)  # Display only contours larger than the area cutoff.
```

### Shape Approximation

```python
for cnt in contours:  # Loop through each detected contour.
    perimeter = cv2.arcLength(cnt, True)  # Measure the closed contour perimeter.

    approx = cv2.approxPolyDP(cnt, 0.04 * perimeter, True)  # Approximate the contour with fewer corner points.

    print("Number of corners:", len(approx))  # Print how many vertices the approximated contour has.
```

Shape guesses:

```text
3 corners = triangle
4 corners = rectangle/square
>4 corners = circle-like
```

## 12. Watershed

### Concept

Watershed is used for image segmentation.

It separates touching objects.

Example use:

```text
separating coins touching each other
```

Idea:

```text
Treat image like a landscape.
Bright/dark areas become hills/valleys.
Watershed lines separate regions.
```

### Watershed Steps

```text
1. Convert to grayscale
2. Threshold to binary
3. Remove noise using opening
4. Find sure background
5. Find sure foreground
6. Find unknown region
7. Create markers
8. Apply watershed
```

### Watershed Code

```python
img = cv2.imread("coins.jpg")  # Read the coins image for watershed segmentation.
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)  # Convert BGR color pixels into one grayscale intensity channel.

# Step 1: Threshold
_, thresh = cv2.threshold(  # Create a binary image with Otsu thresholding for watershed.
    gray,  # Pass this argument into the multi-line call.
    0,  # Pass this argument into the multi-line call.
    255,  # Pass this argument into the multi-line call.
    cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU  # Perform this step in the image-processing pipeline.
)  # Close the multi-line call or data structure.

# Step 2: Remove noise
kernel = np.ones((3, 3), np.uint8)  # Create a square structuring element for morphology.
opening = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=2)  # Remove small noise before finding foreground and background.

# Step 3: Sure background
sure_bg = cv2.dilate(opening, kernel, iterations=3)  # Dilate objects to get pixels that are definitely background.

# Step 4: Sure foreground using distance transform
dist_transform = cv2.distanceTransform(opening, cv2.DIST_L2, 5)  # Compute distance from each foreground pixel to the nearest background.

_, sure_fg = cv2.threshold(  # Keep only central object pixels as sure foreground.
    dist_transform,  # Pass this argument into the multi-line call.
    0.7 * dist_transform.max(),  # Pass this argument into the multi-line call.
    255,  # Pass this argument into the multi-line call.
    0  # Perform this step in the image-processing pipeline.
)  # Close the multi-line call or data structure.

sure_fg = np.uint8(sure_fg)  # Convert sure foreground back into an 8-bit mask.

# Step 5: Unknown region
unknown = cv2.subtract(sure_bg, sure_fg)  # Find uncertain pixels between sure background and sure foreground.

# Step 6: Markers
_, markers = cv2.connectedComponents(sure_fg)  # Label each sure foreground object with a unique marker id.

# Add 1 so background is not 0
markers = markers + 1  # Shift marker labels so sure background is not zero.

# Mark unknown as 0
markers[unknown == 255] = 0  # Mark uncertain pixels as unknown for watershed.

# Step 7: Apply watershed
markers = cv2.watershed(img, markers)  # Run watershed segmentation using the prepared markers.

# Boundaries are marked as -1
img[markers == -1] = [0, 0, 255]  # Color watershed boundaries red in the BGR image.

show("Watershed Result", img)  # Display the segmented image with red boundaries.
```

### Important Watershed Notes

```text
markers == -1 means boundary
markers == 0 means unknown
positive values are regions
```

## 13. CNN, Not From Scratch

### Concept

CNN stands for:

```text
Convolutional Neural Network
```

CNNs are used for image tasks such as:

```text
classification
object detection
face recognition
segmentation
```

CNN layers usually include:

```text
Convolution
Activation function
Pooling
Fully connected layers
Softmax
```

### CNN Basic Flow

```text
Image -> Convolution -> ReLU -> Pooling -> Flatten -> Dense -> Output
```

### Use Pretrained CNN

This is "not from scratch" because we use a model already trained on a large dataset.

Example with TensorFlow/Keras using MobileNetV2:

```python
import tensorflow as tf  # Import TensorFlow for loading and building neural network models.
from tensorflow.keras.applications import MobileNetV2  # Import the pretrained MobileNetV2 CNN architecture.
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input, decode_predictions  # Import MobileNetV2 preprocessing and label-decoding helpers.
from tensorflow.keras.preprocessing import image  # Import Keras image utilities for loading and resizing files.
import numpy as np  # Import NumPy for array math and mask creation.

model = MobileNetV2(weights="imagenet")  # Load MobileNetV2 with pretrained ImageNet weights.

img_path = "image.jpg"  # Store the image filename to classify.

img = image.load_img(img_path, target_size=(224, 224))  # Load and resize the image to MobileNetV2 input size.
x = image.img_to_array(img)  # Convert the PIL image into a NumPy array.
x = np.expand_dims(x, axis=0)  # Add a batch dimension because models expect batches.
x = preprocess_input(x)  # Normalize pixels in the way MobileNetV2 expects.

preds = model.predict(x)  # Run the pretrained CNN on the prepared image batch.

print(decode_predictions(preds, top=3)[0])  # Print the top three ImageNet class predictions.
```

### Transfer Learning

Transfer learning means:

```text
Use a pretrained model and train only the last layers on your dataset.
```

```python
import tensorflow as tf  # Import TensorFlow for loading and building neural network models.
from tensorflow.keras import layers, models  # Import Keras layer and model builders for transfer learning.
from tensorflow.keras.applications import MobileNetV2  # Import the pretrained MobileNetV2 CNN architecture.

base_model = MobileNetV2(  # Create a MobileNetV2 feature extractor for transfer learning.
    weights="imagenet",  # Pass this argument into the multi-line call.
    include_top=False,  # Pass this argument into the multi-line call.
    input_shape=(224, 224, 3)  # Perform this step in the image-processing pipeline.
)  # Close the multi-line call or data structure.

base_model.trainable = False  # Freeze pretrained layers so only new classifier layers train.

model = models.Sequential([  # Build a sequential classifier on top of the pretrained base.
    base_model,  # Pass this argument into the multi-line call.
    layers.GlobalAveragePooling2D(),  # Collapse spatial feature maps into one feature vector.
    layers.Dense(128, activation="relu"),  # Add a trainable hidden layer for the new task.
    layers.Dense(2, activation="softmax")  # Output probabilities for two classes.
])  # Perform this step in the image-processing pipeline.

model.compile(  # Configure optimizer, loss, and metrics before training.
    optimizer="adam",  # Use Adam as the optimizer. 
    loss="sparse_categorical_crossentropy",  # Use sparse categorical cross-entropy for integer class labels.
    metrics=["accuracy"]  # Track accuracy while training and evaluating.
)  # Close the multi-line call or data structure.

model.summary()  # Print the model architecture and parameter counts.
```

### CNN Terms

```text
Convolution: extracts features using filters
Kernel/filter: small matrix that slides over image
Stride: how many pixels the filter moves
Padding: adding border pixels
ReLU: removes negative values
Pooling: reduces image size
Flatten: converts 2D features to 1D
Dense layer: normal neural network layer
Softmax: gives class probabilities
```

## 14. Face Classification

### Concept

Face classification means classifying faces into categories.

Examples:

```text
person A vs person B
happy vs sad
male vs female
masked vs unmasked
```

A common pipeline:

```text
1. Detect face
2. Crop face
3. Resize face
4. Preprocess
5. Classify using CNN/model
```

### Face Detection with Haar Cascade

```python
img = cv2.imread("face.jpg")  # Read the face image from disk in BGR format.
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)  # Convert BGR color pixels into one grayscale intensity channel.

face_cascade = cv2.CascadeClassifier(  # Create a Haar cascade face detector.
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"  # Use OpenCV's built-in frontal-face cascade file.
)  # Close the multi-line call or data structure.

faces = face_cascade.detectMultiScale(  # Detect face bounding boxes in the grayscale image.
    gray,  # Pass this argument into the multi-line call.
    scaleFactor=1.1,  # Search smaller image scales gradually for faces.
    minNeighbors=5  # Require enough neighboring detections to reduce false positives.
)  # Close the multi-line call or data structure.

for (x, y, w, h) in faces:  # Loop through each detected face rectangle.
    cv2.rectangle(img, (x, y), (x+w, y+h), (0, 255, 0), 2)  # Draw the bounding box on the image.

show("Detected Faces", img)  # Display this intermediate or final result.
```

### Crop Face

```python
for (x, y, w, h) in faces:  # Loop through each detected face rectangle.
    face = img[y:y+h, x:x+w]  # Crop the face region from the image using the bounding box.
    face_resized = cv2.resize(face, (224, 224))  # Resize the face crop to the model input size.
    show("Cropped Face", face_resized)  # Display this intermediate or final result.
```

### Face Classification with Saved Model

```python
import tensorflow as tf  # Import TensorFlow for loading and building neural network models.
import cv2  # Import OpenCV for image loading, conversion, filtering, and drawing.
import numpy as np  # Import NumPy for array math and mask creation.

model = tf.keras.models.load_model("face_classifier.h5")  # Load the saved face-classification model from disk.

img = cv2.imread("face.jpg")  # Read the face image from disk in BGR format.
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)  # Convert BGR color pixels into one grayscale intensity channel.

faces = face_cascade.detectMultiScale(gray, 1.1, 5)  # Detect face bounding boxes in the grayscale image.

class_names = ["Person A", "Person B"]  # Define labels that match the model output order.

for (x, y, w, h) in faces:  # Loop through each detected face rectangle.
    face = img[y:y+h, x:x+w]  # Crop the face region from the image using the bounding box.
    face = cv2.resize(face, (224, 224))  # Resize the face crop before classification.

    face_array = face.astype("float32") / 255.0  # Convert pixels to floats and normalize them to 0-1.
    face_array = np.expand_dims(face_array, axis=0)  # Add a batch dimension for model prediction.

    prediction = model.predict(face_array)  # Run the classifier on the prepared face crop.

    class_id = np.argmax(prediction)  # Pick the class with the highest predicted probability.
    confidence = np.max(prediction)  # Store the highest probability as the confidence score.

    label = f"{class_names[class_id]}: {confidence:.2f}"  # Build the label text shown above the face box.

    cv2.rectangle(img, (x, y), (x+w, y+h), (0, 255, 0), 2)  # Draw the bounding box on the image.
    cv2.putText(  # Draw the predicted class label on the image.
        img,  # Pass this argument into the multi-line call.
        label,  # Pass this argument into the multi-line call.
        (x, y-10),  # Pass this argument into the multi-line call.
        cv2.FONT_HERSHEY_SIMPLEX,  # Use OpenCV's built-in simple font.
        0.8,  # Set the label text scale.
        (0, 255, 0),  # Use green text or boxes in BGR format.
        2  # Use a line thickness of 2 pixels.
    )  # Close the multi-line call or data structure.

show("Face Classification", img)  # Display this intermediate or final result.
```

## Quick Exam Cheat Sheet

### Image Reading

```python
img = cv2.imread("image.jpg")  # Read the source image from disk in BGR format.
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)  # Convert BGR color pixels into one grayscale intensity channel.
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)  # Convert BGR color into HSV for easier color masking.
```

### Threshold

```python
_, binary = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)  # Convert grayscale pixels into black or white values.
```

### Otsu

```python
_, otsu = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)  # Ask Otsu thresholding to choose the cutoff automatically.
```

### Blur

```python
blur = cv2.GaussianBlur(img, (5, 5), 0)  # Smooth the image with a Gaussian-weighted 5x5 neighborhood.
```

### Canny

```python
edges = cv2.Canny(gray, 100, 200)  # Run Canny edge detection with the chosen low and high thresholds.
```

### Sobel

```python
sobel_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)  # Compute horizontal intensity gradients that reveal vertical edges.
sobel_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)  # Compute vertical intensity gradients that reveal horizontal edges.
```

### Morphology

```python
kernel = np.ones((5, 5), np.uint8)  # Create a square structuring element for morphology.

eroded = cv2.erode(binary, kernel, iterations=1)  # Shrink white regions by one erosion pass.
dilated = cv2.dilate(binary, kernel, iterations=1)  # Grow white regions by one dilation pass.
opened = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel)  # Run erosion then dilation to remove small white noise.
closed = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)  # Run dilation then erosion to close small dark gaps.
```

### Contours

```python
contours, hierarchy = cv2.findContours(  # Extract contours from connected white regions in the binary image.
    binary,  # Pass this argument into the multi-line call.
    cv2.RETR_EXTERNAL,  # Pass this argument into the multi-line call.
    cv2.CHAIN_APPROX_SIMPLE  # Perform this step in the image-processing pipeline.
)  # Close the multi-line call or data structure.

for cnt in contours:  # Loop through each detected contour.
    area = cv2.contourArea(cnt)  # Measure the area enclosed by the current contour.
    x, y, w, h = cv2.boundingRect(cnt)  # Compute the smallest upright rectangle around the contour.
```

### Masking

```python
mask = np.zeros(img.shape[:2], dtype=np.uint8)  # Start with a black mask matching the image height and width.
cv2.rectangle(mask, (100, 100), (300, 300), 255, -1)  # Draw a filled white rectangle into the mask.
result = cv2.bitwise_and(img, img, mask=mask)  # Keep only pixels selected by the mask.
```

## Most Important Exam Words

```text
RGB: color image with red, green, blue channels
HSV: color space based on hue, saturation, value
Contrast: difference between dark and bright pixels
Histogram: distribution of pixel intensities
Mask: binary image used to select regions
Noise reduction: smoothing unwanted random pixels
Edge detection: finding sharp intensity changes
Sobel: gradient-based edge detector
Canny: advanced edge detector with NMS and double threshold
NMS: keeps strongest edge pixels only
Morphology: shape-based operations on binary images
Erosion: shrinks white regions
Dilation: expands white regions
Opening: erosion then dilation
Closing: dilation then erosion
Binary image: image with only black and white pixels
Contour: boundary around connected white region
Watershed: segmentation method for separating touching objects
CNN: neural network for image processing
Transfer learning: using pretrained CNN
Face classification: detecting and classifying face images
```
