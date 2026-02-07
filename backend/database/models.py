from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from .database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)

class RiskScore(Base):
    __tablename__ = "risk_scores"
    id = Column(Integer, primary_key=True, index=True)
    country_code = Column(String, unique=True, index=True) # ISO 3166-1 alpha-2
    score = Column(Float) # 0.0 to 100.0, higher is riskier
    last_updated = Column(DateTime, default=datetime.utcnow)
    details = Column(String) # JSON or text summary

class Sanction(Base):
    __tablename__ = "sanctions"
    id = Column(Integer, primary_key=True, index=True)
    entity_name = Column(String, index=True)
    country = Column(String, index=True)
    list_source = Column(String) # OFAC, EU, etc.
    added_date = Column(DateTime, default=datetime.utcnow)
    active = Column(Boolean, default=True)

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    tx_hash = Column(String, unique=True, index=True)
    sender = Column(String, index=True)
    receiver = Column(String, index=True)
    amount = Column(String)
    currency = Column(String)
    status = Column(String) # pending, validated, submitted, failed, frozen
    compliance_check_passed = Column(Boolean, default=False)
    risk_score_at_time = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
