from .celery_app import celery_app
from database.database import db_connection
from xrp_integration.xrp_utils import get_client
from xrpl.models.requests import Tx

@celery_app.task
def reconcile_transactions():
    client = get_client()
    with db_connection() as conn:
        pending = conn.execute(
            "SELECT * FROM transactions WHERE status = ?", ("submitted",)
        ).fetchall()
        for row in pending:
            tx_hash = row["tx_hash"]
            if not tx_hash or tx_hash == "unknown_hash":
                continue
            try:
                tx_response = client.request(Tx(transaction=tx_hash))
                if tx_response.is_successful():
                    meta = tx_response.result.get("meta", {})
                    if meta.get("TransactionResult") == "tesSUCCESS":
                        conn.execute(
                            "UPDATE transactions SET status = ? WHERE id = ?",
                            ("success", row["id"]),
                        )
                    else:
                        conn.execute(
                            "UPDATE transactions SET status = ? WHERE id = ?",
                            ("failed", row["id"]),
                        )
            except Exception as e:
                print(f"Error reconciling tx {tx_hash}: {e}")
    return "Reconciliation complete"
