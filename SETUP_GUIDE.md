# Politifolio Setup & Integration Guide

## Prerequisites

- **Node.js**: v18+ (LTS recommended)
- **npm**: v9+
- **Git**: Latest version
- **XRPL Account** (Testnet): Get funded at https://testnet.xrpl.org

## Initial Setup (First Time)

### 1. Configure Environment

```bash
# Backend configuration
cd backend
cp .env.example .env

# Edit .env with your values:
nano .env
```

**Required `.env` values:**
- `GEO_PULSE_ISSUER_SEED`: Your XRPL issuer wallet seed
- `DESTINATION_SEED`: Your destination wallet seed  
- `ANTHROPIC_API_KEY`: From https://console.anthropic.com
- `DEDALUS_API_KEY`: From https://dedaluslabs.ai
- `WORLD_NEWS_API_KEY`: From https://worldnewsapi.com

### 2. Install Dependencies

```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma db push  # Creates SQLite database & tables

# Frontend
cd frontend
npm install
```

### 3. Verify Setup

```bash
# Check backend
cd backend
npm run dev  # Should start on http://localhost:3001
# In another terminal:
curl http://localhost:3001/api/health

# Check frontend
cd frontend
npm run dev  # Should start on http://localhost:5173
```

---

## Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Watch mode: automatically reloads on file changes
# Starts: http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Live reload with Vite
# Starts: http://localhost:5173
```

**Terminal 3 (Optional) - Watch Database:**
```bash
cd backend
npx prisma studio
# Opens Prisma Studio for database inspection
# Starts: http://localhost:5555
```

---

## Key Endpoints

### Intelligence Reports (NEW - Phase 3)
- `POST /api/reports/submit` - Submit new geopolitical report
- `GET /api/reports` - List all reports
- `GET /api/reports/:id` - Get report details
- `POST /api/reports/:id/vote` - Vote on report
- `POST /api/reports/:id/rewards/claim` - Claim rewards

### POL Token
- `GET /api/xrpl/pol/issuer` - Get POL issuer address
- `GET /api/xrpl/pol/balance?address=...` - Check POL balance
- `GET /api/xrpl/pol/risk-sentiment` - Get POL risk sentiment

### XRPL
- `GET /api/xrpl/balance?address=...` - Check XRP balance
- `GET /api/xrpl/transactions?address=...` - Get transactions
- `POST /api/xrpl/escrow/create` - Create escrow
- `POST /api/xrpl/escrow/finish` - Finish escrow

---

## Common Tasks

### Submit Intelligence Report (Programmatic)

```bash
curl -X POST http://localhost:3001/api/reports/submit \
  -H "Content-Type: application/json" \
  -d '{
    "title": "EU Sanctions Expansion",
    "description": "New sanctions announced targeting financial sector...",
    "eventDate": "2026-02-07T10:30:00Z",
    "countries": ["Russia", "Iran"],
    "impactType": "economic",
    "stakeAmount": 100,
    "userWallet": "rMAsbhhnkswS8woL46wViDd8BdkK9MMzdK",
    "walletSeed": "sEd72fuEanXU4pyt9cidUnh3SqdALWT"
  }'
```

### List Intelligence Reports

```bash
# All reports
curl http://localhost:3001/api/reports

# Verified only
curl "http://localhost:3001/api/reports?status=verified&limit=10"

# Pending
curl "http://localhost:3001/api/reports?status=pending"
```

### Get POL Risk Sentiment

```bash
curl http://localhost:3001/api/xrpl/pol/risk-sentiment
```

---

## Database Management

### View Database (Prisma Studio)

```bash
cd backend
npx prisma studio
# Opens: http://localhost:5555
```

### Reset Database (CAUTION - deletes data)

```bash
cd backend
npx prisma migrate reset
# Confirms before deleting
```

### Generate Prisma Client

```bash
cd backend
npx prisma generate
```

### View Schema

```bash
cat backend/prisma/schema.prisma
```

---

## Frontend Tabs

1. **Global Risk Map** - Geopolitical risk visualization
2. **Live Events** - Event feed
3. **AI Decision Support** - AI-powered recommendations
4. **POL Risk & Sentiment** (Phase 3) - POL token sentiment & escrow
5. **Reconciliation** - Transaction reconciliation
6. **Compliance Monitor** - Sanctions & compliance checks
7. **Risk Analytics** - Detailed risk scoring
8. **Intelligence Reports** (NEW Phase 3) - Crowdsourced intelligence submissions, voting, rewards

---

## Expected Behavior

### Intelligence Tab Features

✅ **Submit Report**
- Form validation (5+ char title, 20+ char description)
- Compliance check (no sanctioned countries)
- POL stake requirement
- Risk assessment triggered automatically
- Confirmation with report ID

✅ **View Reports**
- Real-time list from backend
- Filter by status (all, pending, verified, disputed)
- Risk score visualization (color-coded)
- Country & impact type tags
- Staking info & vote buttons

✅ **Vote on Reports**
- Support/Challenge buttons
- Weighted by reputation
- Auto-status update (66% support → verified)

✅ **Claim Rewards**
- 10% of staked POL for verified reports
- Auto-distributed after consensus

---

## Troubleshooting

### Backend Won't Start
```bash
# Check if port 3001 is in use
lsof -i :3001
# Kill if needed
kill -9 <PID>

# Check Node version
node --version  # Should be v18+

# Clear cache
rm -rf backend/node_modules package-lock.json
npm install
```

### Frontend Won't Start
```bash
# Check if port 5173 is in use
lsof -i :5173

# Clear cache
rm -rf frontend/node_modules package-lock.json
npm install
npm run dev
```

### Database Issues
```bash
# Check database exists
ls backend/dev.db

# Reset if corrupted
npx prisma migrate reset

# Re-push schema
npx prisma db push
```

### API Returns 404
```bash
# Verify backend is running
curl http://localhost:3001/api/health
# Should return: {"ok":true,"port":3001,...}

# Check route in server.ts
cat backend/src/server.ts | grep "/api/reports"
```

### POL Balance Shows 0
- Issuer wallet may not have minted POL yet
- Destination wallet may not have trustline
- Check: `GET /api/xrpl/pol/issuer`

### Can't Submit Report
1. Check compliance: `POST /api/reports/submit` returns error?
2. Check wallet balance: `GET /api/xrpl/pol/balance?address=...`
3. Check if wallet is in `.env`

---

## Testing Workflows

### End-to-End Test (Testnet)

```bash
# 1. Check POL issuer
curl http://localhost:3001/api/xrpl/pol/issuer

# 2. Submit report
curl -X POST http://localhost:3001/api/reports/submit \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Event",
    "description": "This is a test report for validation",
    "eventDate": "2026-02-07T12:00:00Z",
    "countries": ["USA"],
    "impactType": "political",
    "stakeAmount": 10,
    "userWallet": "rMAsbhhnkswS8woL46wViDd8BdkK9MMzdK"
  }'

# 3. List reports
curl http://localhost:3001/api/reports

# 4. Vote on report
curl -X POST http://localhost:3001/api/reports/{ID}/vote \
  -H "Content-Type: application/json" \
  -d '{
    "reportId": "{ID}",
    "vote": "support",
    "userWallet": "rMAsbhhnkswS8woL46wViDd8BdkK9MMzdK"
  }'

# 5. Check report status
curl http://localhost:3001/api/reports/{ID}
```

---

## Development Best Practices

### Code Style
- TypeScript for all backend code
- Consistent with existing patterns
- Use interfaces/types
- Comments for complex logic

### Database Queries
```typescript
// Use Prisma client
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Always include relations
const report = await prisma.intelligenceReport.findUnique({
  where: { id: reportId },
  include: { riskAssessment: true, stakes: true }
});
```

### Error Handling
```typescript
try {
  // operation
} catch (err) {
  console.error('Detailed error:', err);
  return res.status(500).json({ 
    error: err instanceof Error ? err.message : 'Unknown error'
  });
}
```

### API Responses
```typescript
// Success
{ success: true, data: {...} }

// List
{ success: true, count: 10, reports: [...] }

// Error
{ error: "Validation failed", issues: [...] }
```

---

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/intelligence-voting

# Make changes
git add .
git commit -m "feat: Add voting on intelligence reports"

# Push
git push origin feature/intelligence-voting

# Create PR
# (GitHub UI)
```

---

## Next Steps (Phase 4+)

- [ ] Add wallet connector (Xaman/GemWallet)
- [ ] Implement RLUSD trustline
- [ ] Build report submission form component
- [ ] Add WebSocket for real-time updates
- [ ] Deploy to testnet public server
- [ ] Setup mainnet wallet
- [ ] Security audit
- [ ] Bug bounty launch

---

## Support & References

- **XRPL Docs**: https://xrpl.org/
- **Prisma Docs**: https://www.prisma.io/docs/
- **React Docs**: https://react.dev/
- **Tailwind CSS**: https://tailwindcss.com/
- **Discord**: [Add link when available]
- **Issues**: GitHub Issues on this repo

---

**Last Updated**: February 7, 2026
**Maintained by**: Politifolio Team
