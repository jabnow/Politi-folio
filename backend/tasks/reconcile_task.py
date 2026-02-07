from .celery_app import celery_app
from database.database import SessionLocal
from database.models import Transaction
from xrp_integration.xrp_utils import get_client
from xrpl.models.requests import Tx
import time

@celery_app.task
def reconcile_transactions():
    # Check pending or submitted transactions against XRPL
    db = SessionLocal()
    client = get_client()
    try:
        pending_txs = db.query(Transaction).filter(Transaction.status == "submitted").all()
        for tx in pending_txs:
            try:
                if not tx.tx_hash or tx.tx_hash == "unknown_hash":
                    continue
                
                # Query XRPL for status
                # Note: In a real app, we handle pagination and history properly
                tx_response = client.request(Tx(transaction=tx.tx_hash))
                if tx_response.is_successful():
                    meta = tx_response.result.get("meta", {})
                    if meta.get("TransactionResult") == "tesSUCCESS":
                        tx.status = "success"
                    else:
                        tx.status = "failed"
                    db.commit()
            except Exception as e:
                print(f"Error reconciling tx {tx.tx_hash}: {e}")
    finally:
        db.close()
    return "Reconciliation complete"
