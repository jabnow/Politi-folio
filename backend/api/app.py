from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import transactions, compliance, users
from database.database import init_db

# Create tables
init_db()

app = FastAPI(title="Politifolio Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transactions.router, prefix="/api/v1/transactions", tags=["transactions"])
app.include_router(compliance.router, prefix="/api/v1/compliance", tags=["compliance"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])

@app.get("/")
def read_root():
    return {"message": "Welcome to Politifolio Backend"}
