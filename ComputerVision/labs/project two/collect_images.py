# collect_images.py - captures face images from webcam using haar cascade

import cv2, os
from pathlib import Path

IMG_SIZE = 128
NUM_IMAGES = 500
BASE_DIR = Path(__file__).resolve().parent
DATASET_DIR = BASE_DIR / "dataset"


def collect_faces(label, num_images=NUM_IMAGES):
    save_path = DATASET_DIR / label
    save_path.mkdir(parents=True, exist_ok=True)
    existing = len([f for f in os.listdir(save_path) if f.endswith(".jpg")])
    print(f"found {existing} existing images in '{label}' folder")

    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    )
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("cant open webcam!!")
        return 0

    count = 0
    collecting = False
    print(f"\ncollecting '{label}' faces... press 's' to start, 'q' to quit")

    while cap.isOpened() and count < num_images:
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.flip(frame, 1)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.3, 5, minSize=(80, 80))
        display = frame.copy()

        for (x, y, w, h) in faces:
            pad = int(0.2 * w)
            x1, y1 = max(0, x - pad), max(0, y - pad)
            x2, y2 = min(frame.shape[1], x + w + pad), min(frame.shape[0], y + h + pad)
            color = (0, 255, 0) if collecting else (0, 255, 255)
            cv2.rectangle(display, (x1, y1), (x2, y2), color, 2)

            if collecting:
                face_resized = cv2.resize(frame[y1:y2, x1:x2], (IMG_SIZE, IMG_SIZE))
                cv2.imwrite(str(save_path / f"{label}_{existing + count:04d}.jpg"), face_resized)
                count += 1

        status = "RECORDING" if collecting else "press 's' to start"
        cv2.putText(display, f"{label} | {status}", (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 0), 2)
        cv2.putText(display, f"{count}/{num_images}", (10, 65), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 0), 2)
        cv2.imshow("Face Collection", display)

        key = cv2.waitKey(1) & 0xFF
        if key == ord("s"):
            collecting = True
        elif key == ord("q") or key == 27:
            break

    cap.release()
    cv2.destroyAllWindows()
    print(f"collected {count} images for '{label}'")
    return count


if __name__ == "__main__":
    print("1. Collect YOUR face (me)\n2. Collect OTHER face (others)\n3. Both")
    choice = input("pick: ").strip()

    if choice == "1":
        collect_faces("me")
    elif choice == "2":
        collect_faces("others")
    elif choice == "3":
        collect_faces("me")
        input("\nswitch person, press enter...")
        collect_faces("others")
