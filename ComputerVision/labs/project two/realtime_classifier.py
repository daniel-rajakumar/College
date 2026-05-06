# realtime_classifier.py - runs trained CNN on live webcam feed

import cv2
import numpy as np
from tensorflow import keras
from pathlib import Path

IMG_SIZE = 128
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "face_model.keras"


def run_realtime():
    if not MODEL_PATH.exists():
        print("no model found! run train_model.py first")
        return

    model = keras.models.load_model(str(MODEL_PATH))

    names_file = BASE_DIR / "models" / "class_names.txt"
    class_names = open(names_file).read().strip().split("\n") if names_file.exists() else ["me", "others"]
    print(f"classes: {class_names} | press 'q' to quit")

    face_cascade = cv2.CascadeClassifier(
        cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    )
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("cant open webcam!!")
        return

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        frame = cv2.flip(frame, 1)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = face_cascade.detectMultiScale(gray, 1.3, 5, minSize=(80, 80))

        for (x, y, w, h) in faces:
            pad = int(0.2 * w)
            x1, y1 = max(0, x - pad), max(0, y - pad)
            x2, y2 = min(frame.shape[1], x + w + pad), min(frame.shape[0], y + h + pad)

            # crop, preprocess, predict
            face_rgb = cv2.cvtColor(frame[y1:y2, x1:x2], cv2.COLOR_BGR2RGB)
            face_input = cv2.resize(face_rgb, (IMG_SIZE, IMG_SIZE)).astype(np.float32) / 255.0
            prediction = model.predict(np.expand_dims(face_input, 0), verbose=0)[0][0]

            if prediction < 0.5:
                label, confidence, color = class_names[0], (1 - prediction) * 100, (0, 255, 0)
            else:
                label, confidence, color = class_names[1], prediction * 100, (0, 0, 255)

            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 3)
            cv2.putText(frame, f"{label}: {confidence:.1f}%", (x1, max(30, y1 - 15)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.9, color, 2)

        cv2.imshow("Face Classification", frame)
        if cv2.waitKey(1) & 0xFF in (27, ord("q")):
            break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    run_realtime()
