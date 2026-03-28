import firebase_admin
from firebase_admin import credentials, firestore, auth
import os
from dotenv import load_dotenv

load_dotenv()

# Firebase credentials can be passed as JSON or individual fields
# For security, we expect individual fields in .env
firebase_creds = {
  "type": "service_account",
  "project_id": os.getenv("FIREBASE_PROJECT_ID"),
  "private_key": os.getenv("FIREBASE_PRIVATE_KEY", "").replace('\\n', '\n'),
  "client_email": os.getenv("FIREBASE_CLIENT_EMAIL"),
  "token_uri": "https://oauth2.googleapis.com/token",
}

if not firebase_admin._apps:
  cred = credentials.Certificate(firebase_creds)
  firebase_admin.initialize_app(cred)

db = firestore.client()

def get_user_profile(user_id: str):
  doc = db.collection('users').document(user_id).get()
  return doc.to_dict() if doc.exists else None

def save_user_profile(user_id: str, data: dict):
  db.collection('users').document(user_id).set(data, merge=True)

def save_alert(user_id: str, alert: dict):
  db.collection('users').document(user_id)\
    .collection('alerts').add({
      **alert,
      "created_at": firestore.SERVER_TIMESTAMP,
      "is_read": False
    })

def get_portfolio(user_id: str):
  docs = db.collection('users').document(user_id)\
    .collection('portfolio').stream()
  return [{"id": d.id, **d.to_dict()} for d in docs]

def update_portfolio(user_id: str, holding_id: str, data: dict):
  db.collection('users').document(user_id)\
    .collection('portfolio').document(holding_id).update(data)
