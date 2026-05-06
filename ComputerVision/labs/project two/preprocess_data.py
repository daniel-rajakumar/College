# preprocess_data.py - loads face images, normalizes, and splits train/val

import cv2, os
import numpy as np
from pathlib import Path

IMG_SIZE = 128
BASE_DIR = Path(__file__).resolve().parent
DATASET_DIR = BASE_DIR / "dataset"


def load_dataset():
    images, labels = [], []
    class_names = sorted([d for d in os.listdir(DATASET_DIR) if os.path.isdir(DATASET_DIR / d)])

    if len(class_names) < 2:
        print(f"need 2 classes, found: {class_names}")
        return None, None, None

    for idx, cls in enumerate(class_names):
        cls_path = DATASET_DIR / cls
        img_files = [f for f in os.listdir(cls_path) if f.lower().endswith((".jpg", ".png", ".jpeg"))]
        print(f"  loading {len(img_files)} images for '{cls}'")

        for img_file in img_files:
            img = cv2.imread(str(cls_path / img_file))
            if img is None:
                continue
            img = cv2.resize(img, (IMG_SIZE, IMG_SIZE))
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            images.append(img)
            labels.append(idx)

    images = np.array(images, dtype=np.float32) / 255.0
    labels = np.array(labels, dtype=np.float32)

    # shuffle
    idx = np.arange(len(images))
    np.random.shuffle(idx)
    images, labels = images[idx], labels[idx]

    print(f"total: {len(images)} images")
    return images, labels, class_names


def split_data(images, labels, ratio=0.8):
    s = int(len(images) * ratio)
    print(f"train: {s}, val: {len(images) - s}")
    return images[:s], labels[:s], images[s:], labels[s:]


if __name__ == "__main__":
    images, labels, class_names = load_dataset()
    if images is None:
        exit(1)

    x_train, y_train, x_val, y_val = split_data(images, labels)
    data_file = BASE_DIR / "dataset" / "preprocessed.npz"
    np.savez(str(data_file), x_train=x_train, y_train=y_train,
             x_val=x_val, y_val=y_val, class_names=class_names)
    print(f"saved to {data_file}")
