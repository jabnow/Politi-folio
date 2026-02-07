from .celery_app import celery_app
from ai.risk_assessment import calculate_risk_score
from database.database import SessionLocal
from database.models import RiskScore

@celery_app.task
def update_risk_scores():
    # Fetch all countries (or a list)
    countries = ["US", "CN", "RU", "IR", "NK", "GB", "FR", "DE", "JP", "IN"]
    db = SessionLocal()
    try:
        for country in countries:
            new_score = calculate_risk_score(country)
            # Update or create
            risk_entry = db.query(RiskScore).filter(RiskScore.country_code == country).first()
            if not risk_entry:
                risk_entry = RiskScore(country_code=country, score=new_score)
                db.add(risk_entry)
            else:
                risk_entry.score = new_score
        db.commit()
    finally:
        db.close()
    return "Risk scores updated"
