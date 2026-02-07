import sys
import os

# Add the current directory to the python path
sys.path.append(os.getcwd())

from database.database import engine, Base, SessionLocal
from database.models import User, Transaction, RiskScore
from compliance.sanctions_check import check_sanction_list
from compliance.country_risk import get_country_risk
from xrp_integration.token_controller import TokenController
import uuid

def run_demo():
    print("--- GeoPulse Backend Demo ---")
    
    from config.config import settings
    if not settings.GEO_PULSE_ISSUER_SEED or settings.GEO_PULSE_ISSUER_SEED == "MOCK_SEED":
        print("Warning: Running in MOCK MODE for Blockchain Layer.")
    
    # 1. Initialize DB
    print("\n1. Initializing Database...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # 2. Create User
    print("\n2. Creating Demo User...")
    user = User(username="demo_user", email="demo@geopulse.io", hashed_password="hashed_secret")
    db.add(user)
    try:
        db.commit()
        print("User created successfully.")
    except Exception:
        db.rollback()
        print("User already exists.")
    
    # 3. Compliance Check
    print("\n3. Running Compliance Check...")
    sender = "Alice"
    receiver = "Bob"
    receiver_country = "FR" # France - Low Risk
    
    is_sanctioned, reason = check_sanction_list(receiver, receiver_country)
    risk_score = get_country_risk(receiver_country)
    
    print(f"Sanctioned: {is_sanctioned} ({reason})")
    print(f"Country Risk Score: {risk_score}")
    
    if is_sanctioned or risk_score > 80:
        print("Transaction Blocked due to Compliance.")
        return

    # 4. Simulate Transaction
    print("\n4. Simulating XRPL Transaction...")
    # Mock TokenController
    try:
        # In a real run, this would connect to XRPL Testnet
        controller = TokenController()
        if not controller.wallet:
             print("Skipping XRPL submission (No Wallet configured).")
             tx_hash = "mock_skipped_" + str(uuid.uuid4())
        else:
             print(f"Submitting using wallet: {controller.wallet.classic_address}")
             res = controller.issue_token("rPT1Sjq2eGrBTHTFdyuJpvQq8m5sF8TVJ", "100")
             print(f"XRPL Response: {res.result['engine_result']}")
             tx_hash = res.result['tx_json']['hash']
        
        print(f"Transaction Submitted to XRPL (Hash: {tx_hash})")
        
        db_tx = Transaction(
            tx_hash=tx_hash,
            sender=sender,
            receiver=receiver,
            amount="100",
            currency="GEO",
            status="submitted",
            compliance_check_passed=True,
            risk_score_at_time=risk_score
        )
        db.add(db_tx)
        db.commit()
        print("Transaction logged to Database.")
        
    except Exception as e:
        print(f"Transaction Failed: {e}")

    # 5. Run Reconciliation Logic
    print("\n5. Running Reconciliation Logic...")
    # This would normally run in Celery
    pending_txs = db.query(Transaction).filter(Transaction.status == "submitted").all()
    print(f"Found {len(pending_txs)} pending transactions.")
    for tx in pending_txs:
        # Mock check
        tx.status = "success"
        print(f"Transaction {tx.tx_hash} reconciled: SUCCESS")
    db.commit()
    
    # 6. Technical Demo: NLP Analysis
    print("\n6. Technical Demo: NLP Sentiment Engine...")
    from ai.event_processing import process_text_for_events
    
    sample_news = "The UN has imposed severe sanctions on Country X due to escalating conflict and human rights violations."
    print(f"Analyzing Text: '{sample_news}'")
    
    analysis = process_text_for_events(sample_news)
    print(f"Result: {analysis}")
    
    db.close()
    print("\n--- Demo Complete ---")

if __name__ == "__main__":
    run_demo()
