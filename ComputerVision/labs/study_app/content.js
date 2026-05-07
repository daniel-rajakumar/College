export const topics = [
  {
    id: "lab1", badge: "Lab 1", title: "Image Basics! (How Computers See)",
    concepts: ["Pixels (Little tiny dots)", "Resolution (How wide and tall it is)", "Colors! (RGB has 3 layers, Gray has 1)"],
    operations: ["cv2.imread() (Opens a pic)", "cv2.cvtColor() (Changes colors)", "img.shape (Tells you the size)"],
    realWorld: "Like taking a photo on your phone—it's just saving millions of tiny colored dots!",
    gotcha: "OpenCV loads colors backwards! It uses BGR instead of RGB. If your image looks like a Smurf, this is why!",
    code: `import cv2\nimport numpy as np\n\n# Load image\nimg = cv2.imread('input.jpg')\n\n# Convert BGR to Grayscale\ngray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)\n\n# Get dimensions\nh, w, c = img.shape  # height, width, channels\n\n# Grayscale is 2D: values 0 (black) to 255 (white)\nprint(gray.shape)  # (h, w)`,
    notes: "Computers just see a giant grid of numbers! 0 is super dark black, and 255 is super bright white. Every single project starts with these lines of code."
  },
  {
    id: "lab2", badge: "Lab 2", title: "Making Pics Brighter & Darker!",
    concepts: ["Changing one pixel at a time", "Normalization (Stretching colors out)", "Gamma Correction (Magic brightness trick)"],
    operations: ["cv2.normalize()", "Gamma Math: S = C·R^γ"],
    realWorld: "When you use the brightness slider on Instagram or edit a dark photo to make the shadows pop.",
    gotcha: "If you just add +50 to every pixel, a bright pixel (like 230) will go over 255 and break! Always use cv2.normalize or np.clip.",
    code: `# Normalization - stretch histogram to full range\nnorm = cv2.normalize(img, None, 0, 255, cv2.NORM_MINMAX)\n\n# Gamma Correction\n# γ < 1 = brighter, γ > 1 = darker\ngamma = 0.5\nlookup = np.array([((i/255.0)**gamma)*255 for i in range(256)]).astype('uint8')\ngamma_img = cv2.LUT(img, lookup)`,
    notes: "If your picture is too dark, make Gamma less than 1! If it's too bright, make it bigger than 1. Easy peasy!"
  },
  {
    id: "lab3", badge: "Lab 3", title: "Zooming In & Fixing Shadows (ROI & CLAHE)",
    concepts: ["ROI (Picking a specific spot)", "YUV Colors (Brightness is separated!)", "CLAHE (Fixing shadows like a pro)"],
    operations: ["cv2.createCLAHE()", "cv2.cvtColor(COLOR_BGR2YUV)"],
    realWorld: "HDR mode on your iPhone camera! It makes sure the sky isn't too white and the shadows aren't too black.",
    gotcha: "Don't run CLAHE on a normal BGR image! It will mess up your colors. Convert to YUV first, run CLAHE on the 'Y' channel (brightness), then convert back.",
    code: `# ROI = slice of array\nroi = img[y1:y2, x1:x2]\n\n# YUV: change brightness (Y) without messing up colors (UV)\nyuv = cv2.cvtColor(img, cv2.COLOR_BGR2YUV)\n\n# CLAHE on Y channel only\nclahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))\nyuv[:,:,0] = clahe.apply(yuv[:,:,0])\nresult = cv2.cvtColor(yuv, cv2.COLOR_YUV2BGR)`,
    notes: "ROI is just cutting out a piece of the picture (like cropping). CLAHE makes the dark parts visible without blinding you!"
  },
  {
    id: "lab4", badge: "Lab 4", title: "Cool Filters & Sliding Windows",
    concepts: ["Kernels (A tiny grid of math)", "Convolution (Sliding the grid over the pic)", "Sobel (Finding lines!)"],
    operations: ["cv2.filter2D() (Apply a filter)", "cv2.Sobel() (Find edges)"],
    realWorld: "Snapchat filters! A 'blur' kernel smooths your skin, and a 'sharpen' kernel makes details pop.",
    gotcha: "A kernel MUST have an odd size (like 3x3 or 5x5) so it has a perfect middle pixel. A 4x4 kernel won't work!",
    code: `# Blur kernel (average)\nkernel = np.ones((5,5), np.float32) / 25\nblurred = cv2.filter2D(img, -1, kernel)\n\n# Sobel Edge Detection\nsobel_x = cv2.Sobel(gray, cv2.CV_64F, 1, 0, ksize=3)  # horizontal\nsobel_y = cv2.Sobel(gray, cv2.CV_64F, 0, 1, ksize=3)  # vertical\nmagnitude = np.sqrt(sobel_x**2 + sobel_y**2)\n\n# Manual Sobel kernels\nSOBEL_X = np.array([[-1,0,1],[-2,0,2],[-1,0,1]], dtype=np.float32)\nSOBEL_Y = np.array([[-1,-2,-1],[0,0,0],[1,2,1]], dtype=np.float32)`,
    notes: "A kernel is just a little stamp that slides over the image. A 'blur' stamp averages the colors, and a 'Sobel' stamp finds the hard edges!"
  },
  {
    id: "lab5", badge: "Lab 5", title: "Finding the Edges! (Canny)",
    concepts: ["Blurring out the junk", "Median Filter (Fixing salt & pepper dots)", "NMS (Making edges super thin)"],
    operations: ["cv2.Canny() (The magic edge finder)", "cv2.GaussianBlur()", "cv2.medianBlur()"],
    realWorld: "Those cool 'pencil sketch' filters on TikTok, or how a self-driving car finds the outline of a stop sign.",
    gotcha: "If Canny is picking up too much garbage (like the texture of the road), you forgot to use GaussianBlur first!",
    code: `# Step 1: Remove noise\nmedian = cv2.medianBlur(img, 5)       # salt & pepper noise\ngauss = cv2.GaussianBlur(img, (5,5), 0) # general smoothing\n\n# Step 2: Canny Edge Detection\nedges = cv2.Canny(gauss, 100, 200)  # low_thresh, high_thresh\n\n# NMS thins edges to 1 pixel wide (done internally by Canny)`,
    notes: "Canny is the absolute best way to find outlines. It uses 'hysteresis' (the two thresholds) to connect broken lines together."
  },
  {
    id: "lab6", badge: "Lab 6", title: "Black & White Magic! (Binarization)",
    concepts: ["Thresholding (Drawing a line in the sand)", "Otsu's Method (Letting the computer guess)", "Flipping colors around"],
    operations: ["cv2.threshold()", "cv2.bitwise_not() (Invert it!)", "cv2.bitwise_and()"],
    realWorld: "Scanning a document! It turns the gray, messy paper into perfectly clean black text on a white background.",
    gotcha: "cv2.threshold ALWAYS returns two things: the threshold value used, and the image. If you forget the `_, ` at the start, your code will crash!",
    code: `# Manual threshold\n_, binary = cv2.threshold(gray, 127, 255, cv2.THRESH_BINARY)\n\n# Otsu's auto threshold\n_, otsu = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)\n\n# Invert\ninverted = cv2.bitwise_not(otsu)\n\n# White ratio\nwhite_ratio = np.sum(binary == 255) / binary.size`,
    notes: "Thresholding is super simple: if a pixel is brighter than a number, make it white. If it's darker, make it black. Otsu's method mathematically picks the perfect number for you!"
  },
  {
    id: "lab7", badge: "Lab 7", title: "Finding Road Lanes for Self-Driving Cars!",
    concepts: ["Blurring it out", "Finding the lines (Sobel)", "Making a custom shape to look at"],
    operations: ["sliding_window_view()", "np.percentile()", "np.pad()"],
    realWorld: "Tesla Autopilot! Literally how a car knows not to drift into the next lane on the highway.",
    gotcha: "A lane line is a diagonal edge. You need to combine both Sobel X (vertical edges) and Sobel Y (horizontal edges) to find the diagonals correctly.",
    code: `GAUSSIAN = np.array(\n    [[1,4,6,4,1],[4,16,24,16,4],[6,24,36,24,6],[4,16,24,16,4],[1,4,6,4,1]],\n    dtype=np.float32) / 256.0\nSOBEL_X = np.array([[-1,0,1],[-2,0,2],[-1,0,1]], dtype=np.float32)\nSOBEL_Y = np.array([[-1,-2,-1],[0,0,0],[1,2,1]], dtype=np.float32)\n\n# Manual convolution\ndef do_filter(pic, kernel):\n    a, b = kernel.shape\n    padded = np.pad(pic, ((a//2, a//2), (b//2, b//2)), mode="edge")\n    return np.sum(sliding_window_view(padded, (a,b)) * kernel, axis=(-2,-1))\n\n# Contrast enhancement with percentile stretch\ndef make_better(pic):\n    low = np.percentile(pic, 5)\n    high = np.percentile(pic, 95)\n    return np.clip((pic - low) * 255.0 / (high - low), 0, 255)\n\n# Pipeline: blur -> enhance -> edges -> threshold -> mask -> dilate\nbetter = make_better(do_filter(img, GAUSSIAN))\nedges = np.sqrt(do_filter(better, SOBEL_X)**2 + do_filter(better, SOBEL_Y)**2)\nbinary = (edges / edges.max() > 0.26).astype(np.uint8)`,
    notes: "We built a self-driving car vision system from scratch! We blurred it, found the edges, and masked out everything that wasn't the road (the sky, trees, etc)."
  },
  {
    id: "lab8", badge: "Lab 8", title: "Doing the Math Ourselves! (No OpenCV)",
    concepts: ["Math for Grayscale", "Making our own Otsu!", "Eroding and Dilating (Shrinking and growing)"],
    operations: ["np.median()", "np.cumsum()", "np.bincount()"],
    realWorld: "This is what happens deep inside the silicon chips of your graphics card! Someone had to write the math.",
    gotcha: "When writing your own loops over pixels, don't forget the edges of the image! You have to 'pad' the image with zeros so the sliding window doesn't fall off the edge.",
    code: `# Manual grayscale (Luma formula)\ndef gray(img):\n    return (0.299*img[:,:,0] + 0.587*img[:,:,1] + 0.114*img[:,:,2]).astype(np.uint8)\n\n# Manual median blur\ndef blur(img):\n    padded = np.pad(img, 1, mode="edge")\n    out = np.zeros_like(img)\n    for i in range(img.shape[0]):\n        for j in range(img.shape[1]):\n            out[i,j] = np.median(padded[i:i+3, j:j+3])\n    return out\n\n# Manual histogram equalization\ndef contrast(img):\n    hist = np.zeros(256)\n    for p in img.flatten(): hist[p] += 1\n    cdf = np.cumsum(hist)\n    cdf = (cdf - cdf.min()) * 255 / (cdf.max() - cdf.min())\n    return cdf.astype(np.uint8)[img]\n\n# Manual Otsu threshold\ndef get_thresh(img):\n    hist = np.bincount(img.flatten(), minlength=256)\n    total = img.size\n    sum_all = np.dot(np.arange(256), hist)\n    sum_bg, w_bg, best, max_var = 0, 0, 0, 0\n    for t in range(256):\n        w_bg += hist[t]\n        if w_bg == 0: continue\n        w_fg = total - w_bg\n        if w_fg == 0: break\n        sum_bg += t * hist[t]\n        var = w_bg * w_fg * (sum_bg/w_bg - (sum_all-sum_bg)/w_fg)**2\n        if var > max_var: max_var = var; best = t\n    return best\n\n# Erode / Dilate\ndef erode(img):\n    padded = np.pad(img, 1, constant_values=255)\n    out = np.zeros_like(img)\n    for i in range(img.shape[0]):\n        for j in range(img.shape[1]):\n            out[i,j] = np.min(padded[i:i+3, j:j+3])\n    return out\n\ndef dilate(img):\n    padded = np.pad(img, 1, constant_values=0)\n    out = np.zeros_like(img)\n    for i in range(img.shape[0]):\n        for j in range(img.shape[1]):\n            out[i,j] = np.max(padded[i:i+3, j:j+3])\n    return out`,
    notes: "We built the OpenCV functions ourselves using Numpy! Grayscale uses the magic Luma numbers: 0.299, 0.587, and 0.114. Eroding shrinks white stuff, Dilating grows it!"
  },
  {
    id: "lab9", badge: "Lab 9", title: "Counting Things! (Watershed)",
    concepts: ["Cleaning up the mess", "Finding the middle of things", "Watershed (Filling it with water!)"],
    operations: ["cv2.watershed()", "cv2.distanceTransform()", "cv2.connectedComponents()"],
    realWorld: "Medical software counting red blood cells under a microscope, or a factory counting M&Ms on a conveyor belt.",
    gotcha: "If objects are touching each other, normal counting fails and counts them as 1 big blob! That's why you MUST use Watershed to split them.",
    code: `gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)\nblur = cv2.GaussianBlur(gray, (5,5), 0)\nret, thresh = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)\n\n# Invert if needed\nif np.sum(thresh==255)/thresh.size < 0.2:\n    thresh = cv2.bitwise_not(thresh)\n\n# Morphological opening (remove noise)\nkernel = np.ones((3,3), np.uint8)\nopening = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=2)\n\n# Sure background (dilate)\nsure_bg = cv2.dilate(opening, kernel, iterations=3)\n\n# Sure foreground (distance transform + threshold)\ndist = cv2.distanceTransform(opening, cv2.DIST_L2, 5)\n_, sure_fg = cv2.threshold(dist, 0.3*dist.max(), 255, 0)\nsure_fg = np.uint8(sure_fg)\n\n# Unknown region\nunknown = cv2.subtract(sure_bg, sure_fg)\n\n# Markers for watershed\n_, markers = cv2.connectedComponents(sure_fg)\nmarkers += 1\nmarkers[unknown==255] = 0\nmarkers = cv2.watershed(image, markers)\n\n# Count objects (labels > 1)\ncount = len([l for l in np.unique(markers) if l > 1])`,
    notes: "Watershed is super cool! Imagine the picture is a map with mountains and valleys. You fill it with water to separate the different objects!"
  },
  {
    id: "lab10", badge: "Lab 10", title: "Tracking Faces in Real-Time!",
    concepts: ["Haar Cascades (Face finders)", "Using the Webcam", "Drawing boxes and trails"],
    operations: ["cv2.CascadeClassifier()", "detectMultiScale()", "cv2.VideoCapture(0)"],
    realWorld: "The little yellow squares that pop up around faces when you take a picture with a digital camera.",
    gotcha: "Haar cascades are super fast but kinda dumb. If you turn your head to the side, it completely loses you! It only works well looking straight forward.",
    code: `cascade = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"\ndetector = cv2.CascadeClassifier(cascade)\n\ncap = cv2.VideoCapture(0)\ntrail = []\n\nwhile True:\n    ok, frame = cap.read()\n    if not ok: break\n\n    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)\n    faces = detector.detectMultiScale(gray, 1.1, 5, minSize=(60,60))\n\n    if len(faces) > 0:\n        x, y, w, h = faces[0]\n        center = (x + w//2, y + h//2)\n        trail.append(center)\n        cv2.rectangle(frame, (x,y), (x+w,y+h), (255,255,255), 2)\n\n    # Draw trail\n    for i in range(1, len(trail)):\n        cv2.line(frame, trail[i-1], trail[i], (255,255,255), 2)\n\n    cv2.imshow("Face Tracker", frame)\n    if cv2.waitKey(1) & 0xFF == ord('q'): break\n\ncap.release()\ncv2.destroyAllWindows()`,
    notes: "We used an old-school but super fast method called Haar Cascades to find faces instantly and draw a cool snake trail behind them!"
  },
  {
    id: "lab11", badge: "Lab 11", title: "Teaching AI to Read Numbers!",
    concepts: ["Brain Networks (CNNs)", "Making things smaller (MaxPool)", "Squishing it flat (Flatten)"],
    operations: ["models.Sequential()", "layers.Conv2D()", "layers.MaxPooling2D()"],
    realWorld: "How the post office automatically reads the zip code handwriting on your mail to sort it instantly!",
    gotcha: "If you don't scale the images from 0-255 down to 0-1 (by dividing by 255.0), the neural network's math will explode and it won't learn anything!",
    code: `from tensorflow.keras import layers, models\nfrom tensorflow.keras.datasets import mnist\nfrom tensorflow.keras.utils import to_categorical\n\n(x_train, y_train), (x_test, y_test) = mnist.load_data()\nx_train = x_train.reshape(-1, 28, 28, 1) / 255.0\nx_test  = x_test.reshape(-1, 28, 28, 1) / 255.0\ny_train = to_categorical(y_train, 10)\ny_test  = to_categorical(y_test, 10)\n\nmodel = models.Sequential([\n    layers.Input(shape=(28,28,1)),\n    layers.Conv2D(32, (3,3), activation='relu'),\n    layers.MaxPooling2D(2,2),\n    layers.Conv2D(64, (3,3), activation='relu'),\n    layers.MaxPooling2D(2,2),\n    layers.Flatten(),\n    layers.Dense(128, activation='relu'),\n    layers.Dense(10, activation='softmax')\n])\n\nmodel.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])\nmodel.fit(x_train, y_train, epochs=3, validation_data=(x_test, y_test))`,
    notes: "MNIST is like the 'Hello World' of AI! We taught the computer to look at tiny 28x28 scribbles and guess what number it is using Convolutional filters."
  },
  {
    id: "lab12", badge: "Lab 12", title: "AI Smile Detector! 😁",
    concepts: ["Yes or No guessing (Binary Classification)", "Flipping images for practice (Augmentation)", "Dropout (Making the brain work harder)"],
    operations: ["tfds.load()", "tf.keras.layers.RandomFlip()", "model.fit()"],
    realWorld: "Smart cameras that automatically snap a picture only when everyone in the group is smiling!",
    gotcha: "For Yes/No (Binary) questions, the final layer must use 'sigmoid' and the loss must be 'binary_crossentropy'. If you use 'softmax', it will break!",
    code: `import tensorflow as tf\nimport tensorflow_datasets as tfds\n\n# Data pipeline\ndef prep_data(ds, img_sz=64, batch=64, is_train=False):\n    ds = ds.map(lambda x: (\n        tf.cast(tf.image.resize(x["image"], (img_sz, img_sz)), tf.float32) / 255.0,\n        tf.cast(x["attributes"]["Smiling"], tf.float32),\n    ), num_parallel_calls=tf.data.AUTOTUNE)\n    if is_train: ds = ds.shuffle(5000)\n    return ds.batch(batch).prefetch(tf.data.AUTOTUNE)\n\n# CNN Model\nmodel = tf.keras.Sequential([\n    tf.keras.Input(shape=(64, 64, 3)),\n    tf.keras.layers.RandomFlip("horizontal"),\n    tf.keras.layers.Conv2D(32, 3, activation="relu", padding="same"),\n    tf.keras.layers.MaxPooling2D(2),\n    tf.keras.layers.Conv2D(64, 3, activation="relu", padding="same"),\n    tf.keras.layers.MaxPooling2D(2),\n    tf.keras.layers.Conv2D(128, 3, activation="relu", padding="same"),\n    tf.keras.layers.MaxPooling2D(2),\n    tf.keras.layers.Flatten(),\n    tf.keras.layers.Dense(128, activation="relu"),\n    tf.keras.layers.Dropout(0.5),\n    tf.keras.layers.Dense(1, activation="sigmoid"),  # binary!\n])\nmodel.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])`,
    notes: "We trained a massive brain on the CelebA dataset to see if people were smiling! The 'Dropout' layer forces the AI to not memorize the data by turning off random neurons."
  },
  {
    id: "lab13", badge: "Lab 13", title: "Where's Waldo? (Template Matching)",
    concepts: ["Sliding a picture over a picture", "Finding the perfect match score", "Getting rid of duplicates"],
    operations: ["cv2.matchTemplate()", "np.where()", "cv2.rectangle()"],
    realWorld: "Robots in factories making sure a tiny screw or circuit board is exactly in the right spot.",
    gotcha: "Template matching is super picky! If the Waldo you are looking for is scaled 10% bigger or rotated, matchTemplate will completely fail.",
    code: `gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)\ngray_templ = cv2.cvtColor(template, cv2.COLOR_BGR2GRAY)\nh, w = gray_templ.shape\n\n# Template matching\nresult = cv2.matchTemplate(gray, gray_templ, cv2.TM_CCOEFF_NORMED)\n\n# Find all matches above threshold\nthreshold = 0.8\nloc = np.where(result >= threshold)\npoints = list(zip(*loc[::-1]))  # (x, y) format\n\n# Remove duplicate overlapping detections\nmatches = []\nfor pt in points:\n    keep = True\n    for m in matches:\n        if abs(pt[0]-m[0]) < w//2 and abs(pt[1]-m[1]) < h//2:\n            keep = False; break\n    if keep: matches.append(pt)\n\n# Draw boxes\nfor pt in matches:\n    cv2.rectangle(output, pt, (pt[0]+w, pt[1]+h), (0,255,0), 3)`,
    notes: "Template matching is literally just playing Where's Waldo! You take a tiny cut-out and slide it everywhere until you find a spot that gives a high math score."
  },
  {
    id: "lab14", badge: "Lab 14", title: "Finding Corners! (Shi-Tomasi)",
    concepts: ["Shi-Tomasi vs Harris (Shi-Tomasi wins!)", "Crazy math (Eigenvalues)", "Finding skin colors"],
    operations: ["cv2.goodFeaturesToTrack()", "cv2.filter2D()", "cv2.morphologyEx()"],
    realWorld: "Panorama stitching! Your phone finds strong corners in two photos to perfectly glue them together into one wide shot.",
    gotcha: "An edge is not a corner! An edge only has a change in ONE direction. A true corner has massive changes in BOTH X and Y directions.",
    code: `def shi_tomasi(gray):\n    gray = np.float64(gray)\n    sobel_x = np.array([[-1,0,1],[-2,0,2],[-1,0,1]], dtype=np.float64)\n    sobel_y = np.array([[-1,-2,-1],[0,0,0],[1,2,1]], dtype=np.float64)\n\n    ix = cv2.filter2D(gray, -1, sobel_x)\n    iy = cv2.filter2D(gray, -1, sobel_y)\n\n    xx = cv2.blur(ix * ix, (5,5))\n    yy = cv2.blur(iy * iy, (5,5))\n    xy = cv2.blur(ix * iy, (5,5))\n\n    # Shi-Tomasi: use SMALLER eigenvalue as corner score\n    trace = xx + yy\n    det = xx * yy - xy * xy\n    score = trace/2 - np.sqrt(np.maximum((trace/2)**2 - det, 0))\n    return score\n\n# Skin mask (YCrCb + HSV + RGB)\ndef make_skin_mask(img):\n    ycrcb = cv2.cvtColor(img, cv2.COLOR_BGR2YCrCb)\n    ycrcb_mask = cv2.inRange(ycrcb, np.array([35,140,75]), np.array([255,178,132]))\n    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)\n    hsv_mask = cv2.inRange(hsv, np.array([0,35,70]), np.array([24,210,255]))\n    mask = ycrcb_mask & hsv_mask\n    return cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((5,5), np.uint8), iterations=3)\n\n# OpenCV shortcut\ncorners = cv2.goodFeaturesToTrack(gray, 25, 0.01, 10)`,
    notes: "Corners are awesome because they don't change no matter how you look at them! Shi-Tomasi uses some smart math (the smaller eigenvalue) to find the best corners."
  },
  {
    id: "proj1", badge: "Project 1", title: "Project 1: The Awesome Detector!", isProject: true,
    concepts: ["Finding Coins (Are they round?)", "Checking Parking Spots (Are there lines of cars?)", "Spotting Cars in Snow (Using a pre-trained brain)"],
    operations: ["cv2.HoughCircles()", "cv2.findContours()", "cv2.dnn.readNetFromCaffe()"],
    realWorld: "Security camera systems that automatically alert you if a car drives into your driveway.",
    gotcha: "If you have a dozen boxes drawn over the exact same car, you forgot to run NMS (Non-Maximum Suppression) to delete the duplicates!",
    code: `# === COIN DETECTION ===\nedges = cv2.Canny(blurred, 50, 150)\nmask = cv2.morphologyEx(edges, cv2.MORPH_CLOSE,\n    cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9,9)), iterations=2)\ncontours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)\nfor c in contours:\n    area = cv2.contourArea(c)\n    perim = cv2.arcLength(c, True)\n    circularity = 4 * np.pi * area / (perim**2)  # 1.0 = perfect circle\n    (x,y), radius = cv2.minEnclosingCircle(c)\n\n# === PARKING LOT ===\ndark_mask = (roi < 90).astype(np.uint8)\ncolumn_density = dark_mask.mean(axis=0)  # density per column\n\n# === SNOW VEHICLES (DNN) ===\nblob = cv2.dnn.blobFromImage(cv2.resize(crop, (300,300)), 0.007843, (300,300), 127.5)\nnet.setInput(blob)\ndetections = net.forward()\n# NMS to remove duplicates\nindices = cv2.dnn.NMSBoxes(boxes, scores, 0.2, 0.3)`,
    notes: "We built an ultimate toolkit! We checked if shapes were perfectly round (for coins), looked for dark spots in a line (for parking lots), and used a massive deep-learning brain (MobileNet) to find cars in a blizzard!"
  },
  {
    id: "proj2", badge: "Project 2", title: "Project 2: Is That Me? (Face AI)", isProject: true,
    concepts: ["Getting tons of pictures", "Squishing them down (Resize & Normalize)", "Training the brain (CNN)", "Testing it live! (Real-time Inference)"],
    operations: ["keras.Sequential()", "BatchNormalization()", "model.predict()"],
    realWorld: "FaceID on your phone! It looks at you, runs a deep neural network, and decides if it should unlock the door.",
    gotcha: "If you train on a bunch of big high-res images, but the webcam gives you tiny blurry boxes, the AI will fail. You MUST resize and normalize the webcam data EXACTLY how you trained it!",
    code: `# === CNN ARCHITECTURE ===\nmodel = keras.Sequential([\n    keras.Input(shape=(128, 128, 3)),\n    # Block 1\n    keras.layers.Conv2D(32, (3,3), activation="relu", padding="same"),\n    keras.layers.BatchNormalization(),\n    keras.layers.MaxPooling2D((2,2)),\n    # Block 2\n    keras.layers.Conv2D(64, (3,3), activation="relu", padding="same"),\n    keras.layers.BatchNormalization(),\n    keras.layers.MaxPooling2D((2,2)),\n    # Block 3\n    keras.layers.Conv2D(128, (3,3), activation="relu", padding="same"),\n    keras.layers.BatchNormalization(),\n    keras.layers.MaxPooling2D((2,2)),\n    # Block 4\n    keras.layers.Conv2D(256, (3,3), activation="relu", padding="same"),\n    keras.layers.BatchNormalization(),\n    keras.layers.MaxPooling2D((2,2)),\n    # Classifier\n    keras.layers.GlobalAveragePooling2D(),\n    keras.layers.Dense(128, activation="relu"),\n    keras.layers.Dropout(0.3),\n    keras.layers.Dense(1, activation="sigmoid"),  # binary\n])\nmodel.compile(optimizer=keras.optimizers.Adam(lr=0.0005),\n              loss="binary_crossentropy", metrics=["accuracy"])\n\n# === REAL-TIME INFERENCE ===\nface_cascade = cv2.CascadeClassifier(\n    cv2.data.haarcascades + "haarcascade_frontalface_default.xml")\nfaces = face_cascade.detectMultiScale(gray, 1.3, 5, minSize=(80,80))\nfor (x,y,w,h) in faces:\n    face_rgb = cv2.cvtColor(frame[y1:y2, x1:x2], cv2.COLOR_BGR2RGB)\n    face_input = cv2.resize(face_rgb, (128,128)).astype(np.float32) / 255.0\n    pred = model.predict(np.expand_dims(face_input, 0), verbose=0)[0][0]\n    label = "me" if pred < 0.5 else "others"`,
    notes: "We made an AI bouncer! It takes a webcam feed, grabs the face, and uses a giant neural network to decide if it's you or a total stranger. Super fast and super smart!"
  }
];

export const examSamples = {
  lab1: {
    question: "Midterm style: convert a tiny RGB image to grayscale from scratch. Do not use OpenCV.",
    code: `import numpy as np  # Bring in NumPy so we can store images as number grids.

img = np.array([  # Make a tiny 2x2 color image by hand.
    [[10, 20, 30], [40, 50, 60]],  # First row: two RGB pixels.
    [[70, 80, 90], [100, 110, 120]]  # Second row: two RGB pixels.
], dtype=np.uint8)  # Store pixel values as 0-255 integers.

r = img[:, :, 0]  # Take the red channel from every pixel.
g = img[:, :, 1]  # Take the green channel from every pixel.
b = img[:, :, 2]  # Take the blue channel from every pixel.
gray = (0.299*r + 0.587*g + 0.114*b).astype(np.uint8)  # Combine RGB into brightness.

print(gray.tolist())  # Print the grayscale image as a normal Python list.
print(gray.shape)  # Print the grayscale image size: rows, columns.`,
    output: `[[18, 48], [78, 108]]
(2, 2)`
  },
  lab2: {
    question: "Midterm style: apply gamma correction from scratch to brighten the pixel values.",
    code: `import numpy as np  # Bring in NumPy for arrays.

pixels = np.array([0, 64, 128, 255], dtype=np.uint8)  # Make four example grayscale pixels.
gamma = 0.5  # Use gamma less than 1 to brighten the image.
corrected = np.array([  # Build a new array of corrected pixels.
    ((p / 255.0) ** gamma) * 255 for p in pixels  # Scale to 0-1, apply gamma, scale back.
]).astype(np.uint8)  # Convert the answer back to 0-255 integer pixels.

print(corrected.tolist())  # Print the corrected pixel values.`,
    output: `[0, 127, 180, 255]`
  },
  lab3: {
    question: "Midterm style: crop the ROI rows 1-2 and columns 2-4 using only NumPy slicing.",
    code: `import numpy as np  # Bring in NumPy for image-like arrays.

img = np.arange(20).reshape(4, 5)  # Make a 4-row by 5-column test image.
roi = img[1:3, 2:5]  # Crop rows 1 and 2, and columns 2, 3, and 4.

print(roi.tolist())  # Print the cropped region.
print(roi.shape)  # Print the crop size: rows, columns.`,
    output: `[[7, 8, 9], [12, 13, 14]]
(2, 3)`
  },
  lab4: {
    question: "Midterm style: apply one 3x3 average filter calculation by multiplying a patch and kernel.",
    code: `import numpy as np  # Bring in NumPy for matrix math.

patch = np.array([  # Make the 3x3 pixels under the filter.
    [10, 20, 30],  # Top row of the patch.
    [40, 50, 60],  # Middle row of the patch.
    [70, 80, 90]  # Bottom row of the patch.
], dtype=np.float32)  # Use floats because filtering uses division.
kernel = np.ones((3, 3), dtype=np.float32) / 9  # Average kernel: every value is 1/9.

center_value = np.sum(patch * kernel)  # Multiply matching cells, then add everything.
print(int(center_value))  # Print the filtered center pixel as an integer.`,
    output: `50`
  },
  lab5: {
    question: "Midterm style: compute one Sobel edge response and threshold it into a binary 0/1 value.",
    code: `import numpy as np  # Bring in NumPy for array math.

patch = np.array([  # Make a 3x3 patch with a bright right side.
    [0, 0, 255],  # Top row.
    [0, 0, 255],  # Middle row.
    [0, 0, 255]  # Bottom row.
], dtype=np.float32)  # Use floats for edge calculations.
sobel_x = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]])  # Finds left-to-right changes.
sobel_y = np.array([[-1, -2, -1], [0, 0, 0], [1, 2, 1]])  # Finds top-to-bottom changes.

gx = np.sum(patch * sobel_x)  # Calculate the horizontal edge strength.
gy = np.sum(patch * sobel_y)  # Calculate the vertical edge strength.
mag = np.sqrt(gx**2 + gy**2)  # Combine both directions into one edge strength.
binary = int(mag > 500)  # Turn the edge into 1 if strong, otherwise 0.

print(int(gx), int(gy), binary)  # Print x strength, y strength, and final binary value.`,
    output: `1020 0 1`
  },
  lab6: {
    question: "Midterm style: threshold grayscale pixels into a binary image whose pixels are 0s and 1s.",
    code: `import numpy as np  # Bring in NumPy for arrays.

gray = np.array([[0, 120, 127, 128, 255]], dtype=np.uint8)  # Make one row of grayscale pixels.
binary = (gray > 127).astype(np.uint8)  # Pixels above 127 become 1; the rest become 0.

print(binary.tolist())  # Print the binary image.`,
    output: `[[0, 0, 0, 1, 1]]`
  },
  lab7: {
    question: "Midterm style: stretch contrast with percentiles and clamp values to 0-255.",
    code: `import numpy as np  # Bring in NumPy for math helpers.

pic = np.array([10, 20, 30, 40, 50], dtype=np.float32)  # Make sample brightness values.
low = np.percentile(pic, 20)  # Choose a low cutoff so very dark values can become 0.
high = np.percentile(pic, 80)  # Choose a high cutoff so very bright values can become 255.
better = np.clip((pic - low) * 255.0 / (high - low), 0, 255)  # Stretch and clamp the contrast.

print(better.astype(np.uint8).tolist())  # Convert to image pixels and print.`,
    output: `[0, 21, 127, 233, 255]`
  },
  lab8: {
    question: "Midterm style: use the allowed median filter idea to remove one salt-noise center pixel.",
    code: `import numpy as np  # Bring in NumPy for the median function.

patch = np.array([  # Make a 3x3 patch around one noisy pixel.
    [10, 10, 10],  # Normal dark pixels.
    [10, 255, 10],  # The center 255 is salt noise.
    [10, 10, 10]  # Normal dark pixels.
], dtype=np.uint8)  # Store values as image pixels.

filtered_center = int(np.median(patch))  # Median chooses the middle value, ignoring the outlier.
print(filtered_center)  # Print the cleaned center value.`,
    output: `10`
  },
  lab9: {
    question: "Midterm style: count connected foreground objects in a 0/1 binary image from scratch.",
    code: `import numpy as np  # Bring in NumPy for the binary image.

binary = np.array([  # Make a small binary image.
    [1, 0, 0],  # First object starts at the left.
    [1, 0, 1],  # Second object starts at the right.
    [0, 0, 1]  # Second object continues downward.
], dtype=np.uint8)  # Store pixels as 0s and 1s.

seen = np.zeros_like(binary, dtype=bool)  # Track which pixels we already visited.
count = 0  # Store how many objects we find.
for r in range(binary.shape[0]):  # Visit every row.
    for c in range(binary.shape[1]):  # Visit every column.
        if binary[r, c] == 1 and not seen[r, c]:  # A new unvisited white pixel means a new object.
            count += 1  # Count this object.
            stack = [(r, c)]  # Start searching from this pixel.
            seen[r, c] = True  # Mark the starting pixel as visited.
            while stack:  # Keep going until the whole object is visited.
                y, x = stack.pop()  # Take one pixel to check its neighbors.
                for dy, dx in [(1,0), (-1,0), (0,1), (0,-1)]:  # Check down, up, right, left.
                    ny, nx = y + dy, x + dx  # Compute the neighbor location.
                    inside = 0 <= ny < 3 and 0 <= nx < 3  # Make sure the neighbor is inside the image.
                    if inside and binary[ny, nx] == 1 and not seen[ny, nx]:  # If neighbor is part of object.
                        seen[ny, nx] = True  # Mark neighbor as visited.
                        stack.append((ny, nx))  # Search outward from that neighbor too.

print(count)  # Print the number of connected objects.`,
    output: `2`
  },
  lab10: {
    question: "Midterm style: compute a tracking center from a detected face bounding box.",
    code: `import numpy as np  # Bring in NumPy for the box array.

face = np.array([10, 20, 40, 60])  # Store x, y, width, and height of the face box.
x, y, w, h = face  # Split the box into named variables.
center = (x + w // 2, y + h // 2)  # Move from top-left corner to the center.

print(center)  # Print the center point.`,
    output: `(30, 50)`
  },
  lab11: {
    question: "Midterm style: normalize image data and reshape it into CNN input format.",
    code: `import numpy as np  # Bring in NumPy for image arrays.

x_train = np.zeros((100, 28, 28), dtype=np.float32)  # Make 100 fake 28x28 grayscale images.
x_train[0, 0, 0] = 255  # Set one pixel to full brightness.
x_train = x_train.reshape(-1, 28, 28, 1) / 255.0  # Add channel dimension and scale 0-255 to 0-1.

print(x_train.shape)  # Print the CNN input shape.
print(x_train[0, 0, 0, 0])  # Print the normalized bright pixel.`,
    output: `(100, 28, 28, 1)
1.0`
  },
  lab12: {
    question: "Midterm style: compute sigmoid probabilities and convert them to binary predictions.",
    code: `import numpy as np  # Bring in NumPy for exponentials.

logits = np.array([-2.0, 0.0, 2.0])  # These are raw model scores before sigmoid.
probs = 1 / (1 + np.exp(-logits))  # Sigmoid turns raw scores into 0-1 probabilities.
classes = (probs >= 0.5).astype(int)  # Probability 0.5 or higher becomes class 1.

print(np.round(probs, 3).tolist())  # Print rounded probabilities.
print(classes.tolist())  # Print final binary predictions.`,
    output: `[0.119, 0.5, 0.881]
[0, 1, 1]`
  },
  lab13: {
    question: "Midterm style: perform template matching from scratch using sum of squared differences.",
    code: `import numpy as np  # Bring in NumPy for array math.

img = np.zeros((5, 5), dtype=np.int16)  # Make a blank 5x5 image.
img[2:4, 1:3] = 255  # Place a bright 2x2 square at x=1, y=2.
template = np.ones((2, 2), dtype=np.int16) * 255  # Make the 2x2 bright template to find.

best_score = None  # Store the lowest difference score found so far.
best_loc = None  # Store the best x,y location found so far.
for y in range(img.shape[0] - template.shape[0] + 1):  # Slide template over every possible row.
    for x in range(img.shape[1] - template.shape[1] + 1):  # Slide template over every possible column.
        patch = img[y:y+2, x:x+2]  # Cut out the image area under the template.
        score = np.sum((patch - template) ** 2)  # Smaller score means a better match.
        if best_score is None or score < best_score:  # If this is the best match so far.
            best_score = score  # Save its score.
            best_loc = (x, y)  # Save its top-left location.

print(best_loc)  # Print the best match location.
print(int(best_score))  # Print the best match score.`,
    output: `(1, 2)
0`
  },
  lab14: {
    question: "Midterm style: compute one Shi-Tomasi corner score from trace and determinant values.",
    code: `import numpy as np  # Bring in NumPy for the square root.

trace = 10.0  # Sum of the two eigenvalues.
det = 16.0  # Product of the two eigenvalues.
score = trace / 2 - np.sqrt((trace / 2) ** 2 - det)  # Shi-Tomasi uses the smaller eigenvalue.

print(score)  # Print the corner score.`,
    output: `2.0`
  },
  proj1: {
    question: "Midterm style: compute circularity from area and perimeter to decide if a shape is coin-like.",
    code: `import numpy as np  # Bring in NumPy for pi.

radius = 10  # Use a circle with radius 10.
area = np.pi * radius ** 2  # Area formula for a circle.
perimeter = 2 * np.pi * radius  # Perimeter formula for a circle.
circularity = 4 * np.pi * area / (perimeter ** 2)  # 1.0 means perfectly circular.

print(round(circularity, 2))  # Print circularity rounded to 2 decimals.
print(circularity > 0.85)  # Print True if it is circular enough to be coin-like.`,
    output: `1.0
True`
  },
  proj2: {
    question: "Midterm style: resize a tiny face crop with nearest-neighbor NumPy logic and normalize it.",
    code: `import numpy as np  # Bring in NumPy for image arrays.

face = np.ones((2, 2, 3), dtype=np.uint8) * 128  # Make a tiny 2x2 RGB face crop.
resized = np.repeat(np.repeat(face, 2, axis=0), 2, axis=1)  # Double rows and columns.
batch = np.expand_dims(resized.astype(np.float32) / 255.0, axis=0)  # Normalize and add batch dimension.

print(batch.shape)  # Print the model input shape.
print(round(float(batch.mean()), 3))  # Print the average normalized pixel value.`,
    output: `(1, 4, 4, 3)
0.502`
  }
};
