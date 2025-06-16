import requests


res = requests.post("http://localhost:11434/api/generate", json={
    "model": "mistral",
    "prompt": "Rate how unlikely this is from 1 to 100:\n the 1975 drops a single this month\nScore:",
    "stream": False
})

print(res.json()["response"])
