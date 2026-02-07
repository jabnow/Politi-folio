import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database.database import init_db, db_connection
from compliance.sanctions_check import check_sanction_list
from compliance.country_risk import get_country_risk
from xrp_integration.token_controller import TokenController
import uuid


def run_demo():
    print("--- Politifolio Backend Demo ---")

    from config.config import settings
    if not settings.GEO_PULSE_ISSUER_SEED or settings.GEO_PULSE_ISSUER_SEED == "MOCK_SEED":
        print("Warning: Running in MOCK MODE for Blockchain Layer.")

    # 1. Initialize DB
    print("\n1. Initializing Database...")
    init_db()

    # 2. Create User
    print("\n2. Creating Demo User...")
    with db_connection() as conn:
        try:
            conn.execute(
                "INSERT INTO users (username, email, hashed_password, is_active) VALUES (?, ?, ?, ?)",
                ("demo_user", "demo@politifolio.io", "hashed_secret", 1),
            )
            print("User created successfully.")
        except Exception:
            print("User already exists.")

    # 3. Compliance Check
    print("\n3. Running Compliance Check...")
    sender = "Alice"
    receiver = "Bob"
    receiver_country = "FR"  # France - Low Risk

    is_sanctioned, reason = check_sanction_list(receiver, receiver_country)
    risk_score = get_country_risk(receiver_country)

    print(f"Sanctioned: {is_sanctioned} ({reason})")
    print(f"Country Risk Score: {risk_score}")

    if is_sanctioned or risk_score > 80:
        print("Transaction Blocked due to Compliance.")
        return

    # 4. Simulate Transaction
    print("\n4. Simulating XRPL Transaction...")
    try:
        controller = TokenController()
        if not controller.wallet:
            print("Skipping XRPL submission (No Wallet configured).")
            tx_hash = "mock_skipped_" + str(uuid.uuid4())
        else:
            print(f"Submitting using wallet: {controller.wallet.classic_address}")
            res = controller.issue_token("rPT1Sjq2eGrBTHTFdyuJpvQq8m5sF8TVJ", "100")
            print(f"XRPL Response: {res.result['engine_result']}")
            tx_hash = res.result["tx_json"]["hash"]

        print(f"Transaction Submitted to XRPL (Hash: {tx_hash})")

        with db_connection() as conn:
            from database.models import insert_transaction
            insert_transaction(
                conn, tx_hash, sender, receiver, "100", "GEO",
                "submitted", compliance_check_passed=True, risk_score_at_time=risk_score
            )
            print("Transaction logged to Database.")

    except Exception as e:
        print(f"Transaction Failed: {e}")

    # 5. Run Reconciliation Logic
    print("\n5. Running Reconciliation Logic...")
    with db_connection() as conn:
        pending = conn.execute(
            "SELECT * FROM transactions WHERE status = ?", ("submitted",)
        ).fetchall()
        print(f"Found {len(pending)} pending transactions.")
        for row in pending:
            conn.execute(
                "UPDATE transactions SET status = ? WHERE id = ?",
                ("success", row["id"]),
            )
            print(f"Transaction {row['tx_hash']} reconciled: SUCCESS")

    # 6. Technical Demo: NLP Analysis
    print("\n6. Technical Demo: NLP Sentiment Engine...")
    from ai.event_processing import process_text_for_events

    sample_news = "The UN has imposed severe sanctions on Country X due to escalating conflict and human rights violations."
    print(f"Analyzing Text: '{sample_news}'")

    analysis = process_text_for_events(sample_news)
    print(f"Result: {analysis}")

    print("\n--- Demo Complete ---")


if __name__ == "__main__":
    run_demo()
