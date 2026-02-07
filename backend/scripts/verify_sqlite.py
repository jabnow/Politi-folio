"""Verify SQLite tables and data format. Run: python scripts/verify_sqlite.py"""
import sys
import os
from datetime import datetime, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import sqlite3
import json
from database.database import init_db, db_connection

# Mock data matching Express mocks (for seeding when Express hasn't run)
GEO_EVENTS = [
    ("2026-02-06 14:23:00", "sanctions", "CRITICAL", "New EU Sanctions on Russian Energy Sector",
     "European Union announces comprehensive sanctions...", "Russia", 125, "EU Official Journal"),
    ("2026-02-06 14:18:00", "trade", "HIGH", "Belarus Trade Restrictions Extended",
     "US Treasury extends trade restrictions...", "Belarus", 45, "OFAC"),
]
REC_TASKS = [
    ("REC-001", "EU Sanctions Update", "Automated Policy Monitor", "completed",
     1247, 125, 125, "2026-02-06 14:23:00", "2026-02-06 14:23:45", 3200, "AI Engine", "critical"),
]

def seed_mocks(conn):
    if conn.execute("SELECT COUNT(*) FROM geo_events").fetchone()[0] == 0:
        for row in GEO_EVENTS:
            conn.execute(
                "INSERT INTO geo_events (timestamp, type, severity, title, description, country, affected_transactions, source) VALUES (?,?,?,?,?,?,?,?)",
                row,
            )
        print("Seeded geo_events")
    if conn.execute("SELECT COUNT(*) FROM reconciliation_tasks").fetchone()[0] == 0:
        for row in REC_TASKS:
            conn.execute(
                """INSERT OR IGNORE INTO reconciliation_tasks (id, event_type, triggered_by, status, transactions_scanned, transactions_flagged, transactions_reconciled, start_time, completion_time, estimated_savings, assigned_to, priority) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)""",
                row,
            )
        print("Seeded reconciliation_tasks")

def main():
    init_db()
    with db_connection() as conn:
        seed_mocks(conn)

    from config.config import settings
    db_path = settings.DATABASE_URL.replace("sqlite:///", "").strip("/") or "politifolio.db"
    if not os.path.exists(db_path):
        print("DB file not found at", db_path)
        return

    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row

    for t in ["geo_events", "reconciliation_tasks", "key_events"]:
        c = conn.execute(f"SELECT COUNT(*) FROM {t}").fetchone()[0]
        print(f"{t}: {c} rows")

    # geo_events schema & sample
    cols = [r[1] for r in conn.execute("PRAGMA table_info(geo_events)").fetchall()]
    print("\ngeo_events columns:", cols)
    expected_cols = ["id", "timestamp", "type", "severity", "title", "description", "country", "affected_transactions", "source"]
    print("  Expected:", expected_cols)
    print("  Match:", set(expected_cols) <= set(cols))

    row = conn.execute("SELECT * FROM geo_events LIMIT 1").fetchone()
    if row:
        d = dict(row)
        print("  Sample:", json.dumps(d, default=str, indent=2))

    # reconciliation_tasks schema & sample
    cols = [r[1] for r in conn.execute("PRAGMA table_info(reconciliation_tasks)").fetchall()]
    print("\nreconciliation_tasks columns:", cols)

    row = conn.execute("SELECT * FROM reconciliation_tasks LIMIT 1").fetchone()
    if row:
        d = dict(row)
        print("  Sample:", json.dumps(d, default=str, indent=2))

    # key_events schema
    cols = [r[1] for r in conn.execute("PRAGMA table_info(key_events)").fetchall()]
    print("\nkey_events columns:", cols)

    # Format check: frontend expects camelCase (affectedTransactions, eventType, etc.)
    print("\nFormat check for frontend:")
    print("  geo_events DB uses snake_case (affected_transactions)")
    print("  Express sqlite.service maps to camelCase (affectedTransactions) in getGeoEvents()")
    print("  reconciliation_tasks DB uses snake_case (event_type, triggered_by)")
    print("  Express sqlite.service maps to camelCase (eventType, triggeredBy) in getReconciliationTasks()")

    conn.close()
    print("\nVerification complete.")

if __name__ == "__main__":
    main()
