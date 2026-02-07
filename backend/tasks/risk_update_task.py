from .celery_app import celery_app
from ai.risk_assessment import calculate_risk_score
from database.database import db_connection

@celery_app.task
def update_risk_scores():
    countries = ["US", "CN", "RU", "IR", "NK", "GB", "FR", "DE", "JP", "IN"]
    with db_connection() as conn:
        for country in countries:
            new_score = calculate_risk_score(country)
            row = conn.execute(
                "SELECT id FROM risk_scores WHERE country_code = ?", (country,)
            ).fetchone()
            if not row:
                conn.execute(
                    "INSERT INTO risk_scores (country_code, score) VALUES (?, ?)",
                    (country, new_score),
                )
            else:
                conn.execute(
                    "UPDATE risk_scores SET score = ?, last_updated = CURRENT_TIMESTAMP WHERE id = ?",
                    (new_score, row["id"]),
                )
    return "Risk scores updated"
