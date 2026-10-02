# train_model.py

import os
import pickle
from pymongo import MongoClient
from datetime import datetime
from sklearn.linear_model import LogisticRegression
import numpy as np

# --- Load environment variables ---
from dotenv import load_dotenv
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
mongo_client = MongoClient(MONGO_URI)
db = mongo_client["meditracker"]
med_collection = db["medicines"]

MODEL_DIR = "models"
os.makedirs(MODEL_DIR, exist_ok=True)

def train_medicine_models():
    medicines = list(med_collection.find())

    for med in medicines:
        name = med.get("name")
        logs = med.get("logs", [])
        if not logs or len(logs) < 5:
            print(f"Skipping {name} (not enough logs)")
            continue

        # --- Prepare features and labels ---
        X = []
        y = []

        for log in logs:
            date_str = log.get("date")  # e.g., "3/10/2026"
            taken = log.get("taken", True)

            try:
                date_obj = datetime.strptime(date_str, "%m/%d/%Y")
                weekday = date_obj.weekday()  # 0 = Monday ... 6 = Sunday
                X.append([weekday])
                y.append(0 if taken else 1)  # 1 = missed, 0 = taken
            except:
                continue

        if len(set(y)) < 2:
            print(f"Skipping {name} (all doses same)")
            continue

        # --- Train Logistic Regression ---
        model = LogisticRegression()
        model.fit(X, y)

        # --- Save model ---
        model_file = os.path.join(MODEL_DIR, f"{name.replace(' ', '_')}.pkl")
        with open(model_file, "wb") as f:
            pickle.dump(model, f)

        print(f"Trained and saved model for {name}")

if __name__ == "__main__":
    train_medicine_models()