# GeoPulse Coin - Demo Script for Judges

## 1. Resilience & Architecture
**Pitch:** "Our system is designed for high availability. It automatically falls back to a deterministic Mock Ledger if the main XRPL network is unreachable, ensuring business continuity."

*   **Show:** The `python demo.py` output. Point out the `Warning: Running in MOCK MODE` and the graceful handling of transactions.
*   **Show:** The `scripts/setup_dev.py` script handling network timeouts.

## 2. Compliance & AI Engine
**Pitch:** "We don't just use random numbers. We implemented a multi-factor risk engine and a local NLP sentiment analyzer."

*   **Show:** The `demo.py` output section **"6. Technical Demo: NLP Sentiment Engine"**.
    *   Point out that it analyzed text and extracted keywords like "sanction" and calculated a negative sentiment score.

## 3. End-to-End Workflow (The "Wow" Factor)
**Action:** Open `frontend/index.html` and split your screen with the `uvicorn` terminal.

1.  **Submit a Clean Transaction**:
    *   Sender: `Alice Corp` (US)
    *   Receiver: `Bob Ltd` (FR - France)
    *   **Result:** `Transaction Submitted!`
    *   **Terminal Log:** You will see `[Mock Ledger] Issuing ...`

2.  **Submit a Blocked Transaction**:
    *   Receiver: `Evil Corp`
    *   Receiver Country: `NK` (North Korea)
    *   **Result:** `Transaction Failed: Transaction blocked: High Risk Country` (or similar)

3.  **Analyze Live News**:
    *   Paste: *"The government has seized assets of Bank X due to money laundering charges."*
    *   Click **Analyze Risk**.
    *   **Result:** Risk Level `HIGH`, Keywords `laundering`.

## 4. Technical Stack
*   **FastAPI** (High performance Python API)
*   **XRPL-Py** (Blockchain Integration)
*   **TextBlob** (Natural Language Processing)
*   **SQLAlchemy & SQLite** (Database)
*   **Celery** (Background Tasks - ready for production)
