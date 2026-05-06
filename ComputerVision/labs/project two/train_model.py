# train_model.py - builds and trains CNN for face classification (me vs others)

import numpy as np
import matplotlib.pyplot as plt
from tensorflow import keras
from pathlib import Path

IMG_SIZE = 128
BATCH = 32
EPOCHS = 30
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "face_model.keras"


def build_cnn():
    model = keras.Sequential([
        keras.Input(shape=(IMG_SIZE, IMG_SIZE, 3)),
        # conv block 1
        keras.layers.Conv2D(32, (3, 3), activation="relu", padding="same"),
        keras.layers.BatchNormalization(),
        keras.layers.MaxPooling2D((2, 2)),
        # conv block 2
        keras.layers.Conv2D(64, (3, 3), activation="relu", padding="same"),
        keras.layers.BatchNormalization(),
        keras.layers.MaxPooling2D((2, 2)),
        # conv block 3
        keras.layers.Conv2D(128, (3, 3), activation="relu", padding="same"),
        keras.layers.BatchNormalization(),
        keras.layers.MaxPooling2D((2, 2)),
        # conv block 4
        keras.layers.Conv2D(256, (3, 3), activation="relu", padding="same"),
        keras.layers.BatchNormalization(),
        keras.layers.MaxPooling2D((2, 2)),
        # classifier
        keras.layers.GlobalAveragePooling2D(),
        keras.layers.Dense(128, activation="relu"),
        keras.layers.Dropout(0.3),
        keras.layers.Dense(1, activation="sigmoid"),
    ])
    model.compile(optimizer=keras.optimizers.Adam(learning_rate=0.0005),
                  loss="binary_crossentropy", metrics=["accuracy"])
    return model


def plot_training(history):
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 4))
    ax1.plot(history.history["accuracy"], label="train")
    ax1.plot(history.history["val_accuracy"], label="val")
    ax1.set_title("Accuracy"); ax1.legend()
    ax2.plot(history.history["loss"], label="train")
    ax2.plot(history.history["val_loss"], label="val")
    ax2.set_title("Loss"); ax2.legend()
    plt.tight_layout()
    plt.savefig(str(BASE_DIR / "screenshots" / "training_plot.png"))
    plt.show()


def train():
    data_file = BASE_DIR / "dataset" / "preprocessed.npz"
    if not data_file.exists():
        print("run preprocess_data.py first!")
        return None, None

    data = np.load(str(data_file), allow_pickle=True)
    x_train, y_train = data["x_train"], data["y_train"]
    x_val, y_val = data["x_val"], data["y_val"]
    class_names = list(data["class_names"])
    print(f"classes: {class_names} | train: {len(x_train)}, val: {len(x_val)}")

    model = build_cnn()
    model.summary()

    callbacks = [keras.callbacks.EarlyStopping(
        monitor="val_accuracy", patience=8, restore_best_weights=True)]

    history = model.fit(x_train, y_train, validation_data=(x_val, y_val),
                        epochs=EPOCHS, batch_size=BATCH, callbacks=callbacks)

    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    model.save(str(MODEL_PATH))
    print(f"\nmodel saved to {MODEL_PATH}")

    with open(BASE_DIR / "models" / "class_names.txt", "w") as f:
        f.write("\n".join(class_names))

    val_loss, val_acc = model.evaluate(x_val, y_val, verbose=0)
    print(f"final val accuracy: {val_acc * 100:.2f}%")
    return model, history


if __name__ == "__main__":
    model, history = train()
    if model:
        try: plot_training(history)
        except Exception as e: print(f"couldnt plot: {e}")
