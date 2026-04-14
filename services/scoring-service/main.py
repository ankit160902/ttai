from fastapi import FastAPI

app = FastAPI(title="TTAI Scoring Service")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/score/addon")
def score_addon(booking_type: str = "general_puja"):
    """[RULE-BASED PLACEHOLDER -- ML model to be trained in Phase 4]"""
    return {
        "addons": [
            {"name": "Flower garland", "score": 0.85, "price": 150},
            {"name": "Prasad box", "score": 0.72, "price": 200},
            {"name": "Special aarti", "score": 0.65, "price": 500},
        ],
        "model": "rule-based-v1",
    }


@app.post("/score/conversion")
def score_conversion(devotee_id: str = "", offering_id: str = ""):
    """[RULE-BASED PLACEHOLDER -- ML model to be trained in Phase 4]"""
    return {
        "conversion_probability": 0.45,
        "confidence": "LOW",
        "model": "rule-based-v1",
    }
