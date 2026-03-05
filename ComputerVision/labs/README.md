# 🎓 Computer Vision Labs: Exam Study Guide

This guide is designed to help you ace your exam. It breaks down the core concepts and operations from **Labs 1 to 6** into simple parts.

---

## 🖼️ Lab 1: Image Basics & Digital Vision
> [!NOTE]
> This lab covers how computers "see" images as grids of numbers.

*   **Concepts:**
    *   **Pixels:** The tiny dots that make up an image.
    *   **Resolution:** The width × height of the pixel grid.
*   **Key Operations:**
    *   `cv2.imread()`: Loads your image file.
    *   **Color Channels:** RGB has 3 layers (Red, Green, Blue). Grayscale has only 1 layer.
*   **Study Tip:** Remember that a Grayscale image is just a 2D matrix of numbers from 0 (Black) to 255 (White).

---

## 💡 Lab 2: Brightness, Contrast & Normalization
> [!TIP]
> Use these steps when an image is too dark or too "flat" to see details.

*   **Concepts:**
    *   **Point Operations:** Changing one pixel at a time.
*   **Key Operations:**
    *   **Normalization:** Stretching the colors so they use the full range from 0 to 255.
    *   **Gamma Correction:** A math trick ($S = C \cdot R^\gamma$) to brighten dark shadows without ruining the bright spots.
*   **Math:** If $\gamma < 1$, the image gets brighter. If $\gamma > 1$, it gets darker.

---

## 🔍 Lab 3: Region of Interest (ROI) & CLAHE
> [!IMPORTANT]
> This lab focused on "revealing" objects hidden in the dark.

*   **Concepts:**
    *   **ROI:** Selecting a specific box/area to focus on.
*   **Key Operations:**
    *   **YUV Space:** We convert to YUV so we can change the **Brightness (Y)** without messing up the **Colors (UV)**.
    *   **CLAHE:** "Contrast Limited Adaptive Histogram Equalization". It brightens local areas carefully so the image doesn't look "blown out."
    *   **Bounding Boxes:** Drawing rectangles around things we find.

---

## 🌫️ Lab 4: Custom Filters & Convolution
> [!NOTE]
> This is about "sliding windows" (Kernels) to change how an image looks.

*   **Concepts:**
    *   **Kernel:** A small 3x3 or 5x5 grid of numbers used for math.
    *   **Convolution:** The process of sliding that kernel over every pixel.
*   **Key Operations:**
    *   **Blurring:** An "average" kernel that smooths things out.
    *   **Sobel Edge Detection:** Kernels that find horizontal ($S_x$) and vertical ($S_y$) changes.

---

## ⚔️ Lab 5: Canny Edge Detection (High Quality)
> [!TIP]
> This is the "Gold Standard" for finding clean, sharp edges.

*   **Concepts:**
    *   **Noise Removal:** Cleaning the "graininess" so the computer doesn't mistake it for an edge.
*   **Key Operations:**
    *   **Median Filter:** Replaces a pixel with the middle value of its neighbors (great for "pepper" noise).
    *   **Gaussian Blur:** Smooths the image with a weighted average.
    *   **NMS (Non-Maximum Suppression):** A fancy way to "thin" edges so they are only 1 pixel wide.

---

## 🔳 Lab 6: Binarization & Logic
> [!IMPORTANT]
> This lab is about turning photos into simple Black & White "masks."

*   **Concepts:**
    *   **Thresholding:** Picking a cutoff point (like 127) where everything below is Black and above is White.
*   **Key Operations:**
    *   **Otsu’s Method:** The computer automatically finds the "perfect" cutoff point.
    *   **Bitwise Inversion:** Flipping colors (`cv2.bitwise_not`).
    *   **White Ratio:** Calculating how much of the image is "foreground" (White) vs "background" (Black).

---

🚀 **Exam Preparation Tip:** Go through each notebook and try to explain what the graphs/images show to a friend. If you can explain the "Before" and "After," you know the concept!
