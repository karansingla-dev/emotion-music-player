import os
import requests
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from app.emotion import detect_emotion
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Spotify Auth
CLIENT_ID = os.getenv("SPOTIFY_CLIENT_ID")
CLIENT_SECRET = os.getenv("SPOTIFY_CLIENT_SECRET")

def get_spotify_token():
    auth_response = requests.post(
        "https://accounts.spotify.com/api/token",
        {
            "grant_type": "client_credentials",
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
        },
    )
    return auth_response.json()["access_token"]

@app.post("/detect-emotion/")
async def detect(file: UploadFile = File(...)):
    with open("temp.jpg", "wb") as buffer:
        buffer.write(await file.read())
    emotion = detect_emotion("temp.jpg")
    return {"emotion": emotion}

@app.get("/recommend/{emotion}")
async def recommend(emotion: str, language: str = "english", genre: str = "pop"):
    token = get_spotify_token()
    headers = {"Authorization": f"Bearer {token}"}

    query = f"{emotion} {language} {genre}"
    url = f"https://api.spotify.com/v1/search?q={query}&type=track&limit=5"

    res = requests.get(url, headers=headers).json()
    tracks = []

    if "tracks" in res and "items" in res["tracks"]:
        for item in res["tracks"]["items"]:
            tracks.append({
                "name": item["name"],
                "artist": item["artists"][0]["name"],
                "url": item["external_urls"]["spotify"],
                "preview_url": item.get("preview_url"),   # ✅ add this line
                "image": item["album"]["images"][0]["url"] if item["album"]["images"] else None  # ✅ optional cover art
            })

    return {
        "emotion": emotion,
        "language": language,
        "genre": genre,
        "tracks": tracks
    }
