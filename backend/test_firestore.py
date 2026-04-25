from firebase_config import db

print("Testing Firestore connection...")

doc = db.collection("settings").document("test_user").get()

print("EXISTS:", doc.exists)
print("DATA:", doc.to_dict())