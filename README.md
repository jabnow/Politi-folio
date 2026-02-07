# Politifolio

Geopolitical intelligence platform for XRP Ledger reconciliation and risk monitoring.

## Project Structure

```
politifolio/
├── backend/                    # Node.js + Express
│   ├── src/
│   │   ├── services/           # Dedalus, XRPL, sanctions, Anthropic, risk-scoring
│   │   ├── controllers/
│   │   ├── types/
│   │   ├── mocks/
│   │   └── server.ts
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # React + TypeScript (Vite)
│   ├── src/
│   │   ├── components/         # Dashboard, Transactions, Decisions
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── shared/                     # Shared types between FE/BE
│   └── types.ts
│
└── README.md
```

## Getting Started

### Backend

```bash
cd backend
npm install
npm run dev
```

Backend runs at http://localhost:3001

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at http://localhost:5173 with API proxy to the backend.
