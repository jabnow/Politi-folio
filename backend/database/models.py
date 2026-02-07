"""Schema and helpers for SQLite - no SQLAlchemy."""
# Tables: users, risk_scores, sanctions, transactions (see database.init_db)


def row_to_dict(row):
    """Convert sqlite3.Row to dict."""
    return dict(row) if row else None


def insert_transaction(conn, tx_hash, sender, receiver, amount, currency, status,
                      compliance_check_passed=True, risk_score_at_time=None):
    conn.execute(
        """INSERT INTO transactions (tx_hash, sender, receiver, amount, currency, status, compliance_check_passed, risk_score_at_time)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        (tx_hash, sender, receiver, amount, currency, status, 1 if compliance_check_passed else 0, risk_score_at_time),
    )
    tid = conn.execute("SELECT last_insert_rowid()").fetchone()[0]
    row = conn.execute("SELECT * FROM transactions WHERE id = ?", (tid,)).fetchone()
    return dict(row) if row else None
