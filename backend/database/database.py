"""SQLite database - no SQLAlchemy."""
import sqlite3
from contextlib import contextmanager
from config.config import settings

# Parse sqlite:///./path.db -> ./path.db
_db_path = settings.DATABASE_URL.replace("sqlite:///", "").strip("/") or "politifolio.db"


def get_connection():
    return sqlite3.connect(_db_path)


@contextmanager
def db_connection():
    """Context manager for scripts (demo, tasks)."""
    conn = get_connection()
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def get_db():
    """FastAPI dependency - yields sqlite3 connection."""
    conn = get_connection()
    conn.row_factory = sqlite3.Row
    try:
        yield conn
        conn.commit()
    finally:
        conn.close()


def init_db():
    """Create tables if they don't exist."""
    with db_connection() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                hashed_password TEXT NOT NULL,
                is_active INTEGER DEFAULT 1
            );
            CREATE TABLE IF NOT EXISTS risk_scores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                country_code TEXT UNIQUE NOT NULL,
                score REAL NOT NULL,
                last_updated TEXT DEFAULT CURRENT_TIMESTAMP,
                details TEXT
            );
            CREATE TABLE IF NOT EXISTS sanctions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                entity_name TEXT NOT NULL,
                country TEXT NOT NULL,
                list_source TEXT,
                added_date TEXT DEFAULT CURRENT_TIMESTAMP,
                active INTEGER DEFAULT 1
            );
            CREATE TABLE IF NOT EXISTS transactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                tx_hash TEXT UNIQUE NOT NULL,
                sender TEXT NOT NULL,
                receiver TEXT NOT NULL,
                amount TEXT NOT NULL,
                currency TEXT NOT NULL,
                status TEXT NOT NULL,
                compliance_check_passed INTEGER DEFAULT 0,
                risk_score_at_time REAL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS geo_events (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                type TEXT NOT NULL,
                severity TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                country TEXT NOT NULL,
                affected_transactions INTEGER DEFAULT 0,
                source TEXT
            );
            CREATE TABLE IF NOT EXISTS reconciliation_tasks (
                id TEXT PRIMARY KEY,
                event_type TEXT NOT NULL,
                triggered_by TEXT NOT NULL,
                status TEXT NOT NULL,
                transactions_scanned INTEGER DEFAULT 0,
                transactions_flagged INTEGER DEFAULT 0,
                transactions_reconciled INTEGER DEFAULT 0,
                start_time TEXT NOT NULL,
                completion_time TEXT,
                estimated_savings REAL DEFAULT 0,
                assigned_to TEXT,
                priority TEXT
            );
            CREATE TABLE IF NOT EXISTS key_events (
                id TEXT PRIMARY KEY,
                timestamp TEXT NOT NULL,
                news TEXT,
                dedalus TEXT,
                reasoning TEXT,
                estimates TEXT,
                rebalance TEXT
            );
        """)
