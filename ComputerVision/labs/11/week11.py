import cv2
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.datasets import mnist
from tensorflow.keras.utils import to_categorical
from tensorflow.keras import layers, models

def train_model_now():
    (x_train, y_train), (x_test, y_test) = mnist.load_data()

    x_train = x_train.reshape(-1, 28, 28, 1) / 255.0
    x_test = x_test.reshape(-1, 28, 28, 1) / 255.0

    y_train = to_categorical(y_train, 10)
    y_test = to_categorical(y_test, 10)

    my_model = models.Sequential([
        layers.Input(shape=(28,28,1)),
        layers.Conv2D(32, (3,3), activation='relu'),
        layers.MaxPooling2D(2,2),
        layers.Conv2D(64, (3,3), activation='relu'),
        layers.MaxPooling2D(2,2),
        layers.Flatten(),
        layers.Dense(128, activation='relu'),
        layers.Dense(10, activation='softmax')
    ])

    my_model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
    my_model.fit(x_train, y_train, epochs=3, validation_data=(x_test, y_test))
    my_model.save("mnist_cnn.h5")
    return my_model

try:
    model = load_model("mnist_cnn.h5")
    print("Model loaded ok.")
except:
    print("No model found... training now...")
    model = train_model_now()

cap = cv2.VideoCapture(0)

while True:
    ret, frame = cap.read()
    if not ret: break

    frame = cv2.flip(frame, 1)

    x1, y1, x2, y2 = 100, 100, 300, 300
    sub_img = frame[y1:y2, x1:x2]

    gray = cv2.cvtColor(sub_img, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (5,5), 0)

    _, mask = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    points = cv2.findNonZero(mask)

    if points is not None:
        x, y, w, h = cv2.boundingRect(points)
        final_crop = mask[y:y+h, x:x+w]
    else:
        final_crop = mask

    final_crop = cv2.copyMakeBorder(final_crop, 10, 10, 10, 10, cv2.BORDER_CONSTANT, value=0)

    final_crop = cv2.resize(final_crop, (28,28))
    final_crop = final_crop / 255.0
    final_crop = final_crop.reshape(1,28,28,1)

    res = model.predict(final_crop, verbose=0)
    num = np.argmax(res)
    conf = np.max(res) * 100

    cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 165, 255), 3)
    cv2.putText(frame, f"Digit: {num} ({conf:.1f}%)", (100, 80), 
                cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 165, 255), 2)

    cv2.imshow("Main Feed", frame)
    cv2.imshow("What the AI sees", mask)

    if cv2.waitKey(1) & 0xFF == 27:
        break

cap.release()
cv2.destroyAllWindows()

cap.release()
cv2.destroyAllWindows()
