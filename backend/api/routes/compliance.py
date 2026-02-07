from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from compliance.sanctions_check import check_sanction_list
from compliance.country_risk import get_country_risk
from ai.event_processing import process_text_for_events

router = APIRouter()

class ComplianceCheckRequest(BaseModel):
    name: str
    country: str

class TextAnalysisRequest(BaseModel):
    text: str

@router.post("/check")
def check_compliance(req: ComplianceCheckRequest):
    is_sanctioned, reason = check_sanction_list(req.name, req.country)
    risk_score = get_country_risk(req.country)
    
    return {
        "sanctioned": is_sanctioned,
        "reason": reason,
        "country_risk_score": risk_score,
        "status": "BLOCKED" if is_sanctioned or risk_score > 80 else "CLEARED"
    }

@router.post("/analyze-text")
def analyze_text(req: TextAnalysisRequest):
    result = process_text_for_events(req.text)
    return result
