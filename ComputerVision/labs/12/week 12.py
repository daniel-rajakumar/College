import argparse
from pathlib import Path

import matplotlib.pyplot as plt
import tensorflow as tf
import tensorflow_datasets as tfds

IMG_SIZE = 64
BATCH = 64
EPOCHS = 8

def get_args():
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-dir", default=None)
    parser.add_argument("--epochs", type=int, default=EPOCHS)
    parser.add_argument("--batch", type=int, default=BATCH)
    parser.add_argument("--img-size", type=int, default=IMG_SIZE)
    return parser.parse_args()

def prep_data(ds, img_sz, batch_sz, is_train=False):
    ds = ds.map(
        lambda x: (
            tf.cast(tf.image.resize(x["image"], (img_sz, img_sz)), tf.float32) / 255.0,
            tf.cast(x["attributes"]["Smiling"], tf.float32), 
        ),
        num_parallel_calls=tf.data.AUTOTUNE,
    )
    if is_train:
        ds = ds.shuffle(5000)
    return ds.batch(batch_sz).prefetch(tf.data.AUTOTUNE)

# build standard cnn
def make_model(img_sz):
    model = tf.keras.Sequential([
        tf.keras.Input(shape=(img_sz, img_sz, 3)),
        tf.keras.layers.RandomFlip("horizontal"), 
        
        tf.keras.layers.Conv2D(32, 3, activation="relu", padding="same"),
        tf.keras.layers.MaxPooling2D(2),
        tf.keras.layers.Conv2D(64, 3, activation="relu", padding="same"),
        tf.keras.layers.MaxPooling2D(2),
        tf.keras.layers.Conv2D(128, 3, activation="relu", padding="same"),
        tf.keras.layers.MaxPooling2D(2),
        
        tf.keras.layers.Flatten(),
        tf.keras.layers.Dense(128, activation="relu"),
        tf.keras.layers.Dropout(0.5),
        tf.keras.layers.Dense(1, activation="sigmoid"),
    ])
    model.compile(optimizer="adam", loss="binary_crossentropy", metrics=["accuracy"])
    return model

# load up celeb_a
def get_celeba(data_dir=None):
    try:
        return tfds.load("celeb_a", split=["train", "validation", "test"], data_dir=data_dir)
    except Exception as e:
        msg = str(e)
        if "GDrive" in msg or "confirmation" in msg:
            print("\nRIP Google Drive quota exceeded... download it manually and use --data-dir!")
        raise

if __name__ == "__main__":
    args = get_args()
    out_dir = Path(__file__).resolve().parent

    my_model = make_model(args.img_size)
    my_model.summary()

    t_raw, v_raw, test_raw = get_celeba(args.data_dir)

    train_ds = prep_data(t_raw, args.img_size, args.batch, True)
    val_ds = prep_data(v_raw, args.img_size, args.batch)
    test_ds = prep_data(test_raw, args.img_size, args.batch)

    hist = my_model.fit(train_ds, validation_data=val_ds, epochs=args.epochs)

    loss, acc = my_model.evaluate(test_ds)
    print(f"loss: {loss:.4f}, acc: {acc * 100:.2f}%")

    plt.plot(hist.history["accuracy"], label="train acc")
    plt.plot(hist.history["val_accuracy"], label="val acc")
    plt.legend()
    p_path = out_dir / "training_plot.png"
    plt.savefig(p_path)
    print(f"saved plot to {p_path}")
