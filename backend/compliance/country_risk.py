from ai.risk_assessment import calculate_risk_score

def get_country_risk(country_code: str):
    # This might fetch from DB, but fall back to AI mock
    score = calculate_risk_score(country_code)
    return score
