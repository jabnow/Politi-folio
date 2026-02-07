from config.config import settings
import json
try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

def process_text_for_events(text: str):
    # Check if OpenAI Key is available
    if settings.OPENAI_API_KEY and OpenAI:
        try:
            client = OpenAI(api_key=settings.OPENAI_API_KEY)
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a geopolitical risk analyst. Analyze the text for risks (sanctions, war, fraud). Return JSON with keys: risk_level (LOW/MEDIUM/HIGH), keywords (list), summary."},
                    {"role": "user", "content": text}
                ],
                response_format={ "type": "json_object" }
            )
            content = response.choices[0].message.content
            return json.loads(content)
        except Exception as e:
            print(f"OpenAI Error: {e}. Falling back to mock.")
            
    # Mock NLP processing (Fallback - But Strong/Technical)
    # Using TextBlob for Sentiment Analysis & Keyword Density
    try:
        from textblob import TextBlob
        blob = TextBlob(text)
        sentiment = blob.sentiment.polarity # -1.0 (Negative) to 1.0 (Positive)
        subjectivity = blob.sentiment.subjectivity # 0.0 (Objective) to 1.0 (Subjective)
    except ImportError:
        sentiment = 0.0
        subjectivity = 0.0

    risk_keywords = ["sanction", "war", "embargo", "laundering", "fraud", "corruption", "violation", "ban"]
    detected_keywords = [word for word in risk_keywords if word in text.lower()]
    
    # Heuristic Logic:
    # 1. Base risk on keyword count
    risk_score = len(detected_keywords) * 20 
    
    # 2. Adjust for Sentiment (Negative sentiment increases risk)
    if sentiment < -0.1:
        risk_score += 20  # Negative news is risky
    elif sentiment > 0.5:
        risk_score -= 10  # Positive news might mitigate (e.g., "Sanctions lifted")

    risk_level = "LOW"
    if risk_score > 60:
        risk_level = "HIGH"
    elif risk_score > 30:
        risk_level = "MEDIUM"

    return {
        "risk_level": risk_level,
        "keywords": detected_keywords,
        "sentiment_score": round(sentiment, 2), # Technical Metric
        "risk_score": min(risk_score, 100), # Technical Metric
        "summary": text[:100] + "..." if len(text) > 100 else text
    }
