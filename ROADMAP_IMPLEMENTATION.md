# Politifolio: Geopolitical Intelligence Platform - 10/10 MVP Roadmap Implementation

**Status**: Phases 1-3 COMPLETE ✅ | Phase 4-5 IN PROGRESS

## Project Overview

Transforming Politi-folio from a basic geopolitical risk application into a comprehensive **Geopolitical Intelligence Platform** powered by XRPL (XRP Ledger) and the POL token for incentivized crowdsourced intelligence, risk assessment, and compliance.

### Core Innovation
- **POL Token**: Geopolitical intelligence token for staking (stake-to-analyze), earning (rewards), and governance
- **XRPL Integration**: Escrow for conditional payments, trustlines for token distribution, clawback for compliance
- **AI Analysis**: Anthropic Claude + Dedalus + World News API for multi-source risk scoring
- **True Purpose**: Enable analysts, NGOs, traders to crowdsource and monetize geopolitical intelligence

---

## Phase 1: Foundation ✅ COMPLETE

### Objective
Solidify repo as MVP base with XRPL & database connectivity.

### Completed Work

#### Backend Infrastructure
- **Updated `package.json`**
  - Added: `xrpl`, `@prisma/client`, `prisma`, `@anthropic-ai/sdk`, `socket.io`, `express-rate-limit`, `zod`
  - Enables: Full XRPL integration, type-safe DB, validation, real-time updates

- **Created `prisma/schema.prisma`**
  - Models: `User`, `IntelligenceReport`, `RiskAssessment`, `Stake`, `Vote`, `PolTransaction`, `EscrowRecord`, `AuditLog`, `ApiKey`
  - Enables: Full data persistence for intelligence, staking, voting, compliance

- **Enhanced `XrplService` (`src/services/xrpl.service.ts`)**
  - New methods:
    - `hasTrustLine()`: Check if account can receive tokens
    - `createTrustLine()`: Establish token trust
    - `getAccountInfo()`: Fetch account details
    - `getTrustLines()`: List all trustlines
  - Env config: `XRPL_NODE_URL`, `GEO_PULSE_ISSUER_SEED`, `DESTINATION_SEED`

- **Created `PolTokenService` (`src/services/polTokenService.ts`)**
  - Refactored from `issueToken.js` into production service
  - Methods:
    - `mint()`: Create and distribute POL tokens
    - `transfer()`: Move POL between wallets
    - `clawback()`: Reclaim tokens (fraud/sanctions)
    - `createTrustLine()`: Setup accounts for POL
    - `getBalance()`: Check POL holdings
    - `enableClawback()`: One-time setup for regulatory compliance
  - Database integration: Logs all transactions to `PolTransaction` table

- **Comprehensive `.env.example`**
  - XRPL config (node, wallet seeds, currency code)
  - External APIs (Dedalus, World News, Anthropic, Alpha Vantage, etc.)
  - Security reminders for production

### Files Created/Modified
- ✅ `backend/package.json` - Dependencies updated
- ✅ `backend/.env.example` - Comprehensive config template
- ✅ `backend/prisma/schema.prisma` - Full database schema
- ✅ `backend/src/services/xrpl.service.ts` - Enhanced XRPL service
- ✅ `backend/src/services/polTokenService.ts` - New POL token service

---

## Phase 2: Core Backend Integration ✅ COMPLETE

### Objective
Tie POL tokens to geopolitical intelligence workflows with risk assessment, compliance, and escrow.

### Completed Work

#### Risk & Compliance Services
- **Created `RiskAssessmentService` (`src/services/riskAssessment.service.ts`)**
  - Integrates: Anthropic Claude, World News API, sanctions checking
  - Methods:
    - `assessReport()`: Multi-source risk scoring
    - `fetchNewsData()`: Screen news for sentiment
    - `checkSanctions()`: Identify sanctioned entities
    - `runAiAnalysis()`: Claude LLM analysis
    - `synthesizeScores()`: Weighted risk synthesis
  - Outputs: Geopolitical, economic, military risk scores (0-100 scale)
  - Confidence levels based on data quality

- **Created `ComplianceService` (`src/services/complianceService.ts`)**
  - Methods:
    - `isSanctioned()`: Check address against sanctions lists
    - `isCountrySanctioned()`: Check country sanctions status
    - `clawbackForSanctions()`: Execute compliance clawback
    - `verifyStakeCompliance()`: Pre-submission checks
    - `validateTransaction()`: AML/transaction validation
    - `flagForReview()`: Manual review marking
  - Audit logging for all compliance actions

#### Intelligence Reporting System
- **Created `IntelligenceController` (`src/controllers/intelligence.controller.ts`)**
  - Endpoints:
    - `POST /api/reports/submit` - Submit new report with POL stake
    - `GET /api/reports` - List reports with filtering
    - `GET /api/reports/:id` - Get detailed report + assessment
    - `POST /api/reports/:id/vote` - Vote to support/challenge
    - `POST /api/reports/:id/rewards/claim` - Claim POL rewards
  
  - Features:
    - Validation: Title, description, event date, countries, impact type, stake amount
    - Compliance check before submission
    - Risk assessment triggered asynchronously
    - Automatic status update on vote consensus (66% threshold for verification)
    - Reward calculation (10% of staked POL)

- **Updated `server.ts`**
  - Integrated intelligence routes into Express app
  - All XRPL + intelligence endpoints available

### Data Flows
1. **Submit Report→ Stake POL**
   - User submits report with countries/impact type
   - Compliance verified (no sanctions)
   - POL transferred to issuer (stake recorded in DB)
   - Risk assessment triggered

2. **Risk Assessment**
   - Anthropic Claude analyzes event
   - World News API checks sentiment
   - Sanctions database queried
   - Scores combined: geopolitical, economic, military
   - Results stored in `RiskAssessment`

3. **Voting & Consensus**
   - Analysts vote: support, challenge, abstain
   - Votes weighted by reputation
   - Auto-status: verified (66% support), disputed (>50% challenge)
   - Matched stakes released as rewards

### Files Created/Modified
- ✅ `backend/src/services/riskAssessment.service.ts` - Multi-source risk scoring
- ✅ `backend/src/services/complianceService.ts` - Sanctions & compliance checks
- ✅ `backend/src/controllers/intelligence.controller.ts` - Report submission/voting
- ✅ `backend/src/server.ts` - Intelligence routes added

---

## Phase 3: Frontend Integration ✅ COMPLETE

### Objective
Build user-centric interface with XRPL wallet sync and real-time intelligence reporting.

### Completed Work

#### API Integration Layer
- **Enhanced `xrplApi.service.ts`**
  - New Intelligence Report functions:
    - `submitIntelligenceReport()` - POST new report
    - `listIntelligenceReports()` - Fetch with filtering
    - `getIntelligenceReport()` - Detailed view
    - `voteOnReport()` - Submit vote
    - `claimReportRewards()` - Claim POL rewards
    - `getPolRiskSentimentWithReports()` - Integrated POL + reports
  - Type-safe interfaces for all responses

#### UI Components
- **Created `IntelligenceReportsPanel.tsx` (`src/components/IntelligenceReportsPanel.tsx`)**
  - Features:
    - Real-time report list with filtering (all/pending/verified/disputed)
    - Risk score visualization (color-coded)
    - Country & impact type tags
    - Risk component breakdown (Geopolitical/Economic/Military)
    - Staking info + voting buttons
    - Sanctions alerts if present
    - Confidence indicators
  - Real data from backend API
  - Graceful fallbacks if backend unavailable
  - Loading, error, and empty states
  - Vote buttons (support/challenge) with styling

- **Updated `App.tsx`** 
  - Added "Intelligence Reports" tab to main navigation
  - Lightbulb icon for intelligence tab
  - IntelligenceReportsPanel component integrated
  - Tab switching with animations preserved
  - Maintains all existing tabs/functionality

#### Frontend Dependencies
- All required: React, Framer Motion, Recharts, Radix UI, Tailwind CSS
- Ready for xrpl.js wallet integration in next phase

### User Flows (Phase 3+)
1. **Submit Intelligence**
   - Form: Title, description, date, countries, impact type, POL stake
   - Sign with wallet (optional for testnet)
   - Report created, POL transferred, assessment begins

2. **View & Analyze**
   - Intelligence tab shows all submissions
   - Filter by status
   - Click to view full details
   - See risk scores, analyst info, votes

3. **Vote & Earn**
   - Support/challenge buttons
   - Consensus reached at 66% threshold
   - Rewards auto-distributed to supporters of verified reports

### Files Created/Modified
- ✅ `frontend/src/services/xrplApi.service.ts` - Intelligence endpoints added
- ✅ `frontend/src/components/IntelligenceReportsPanel.tsx` - New component
- ✅ `frontend/src/App.tsx` - Intelligence tab integrated

---

## Phase 4: Advanced XRPL Features 🚧 IN PROGRESS

### Planned Features

#### RLUSD Integration (Stablecoin)
- Trustline to RLUSD issuer (ripple official)
- Deposit RLUSD for escrow
- Premium feature: Pay RLUSD for advanced analytics
- Pathfinding: POL ↔ RLUSD swaps via AMM

#### DID & Trust
- DID:XRPL spec for verified analysts
- Credential system for trust scoring
- NFToken badges for verified analysts

#### Lending Protocol
- XLS-66 integration (when available)
- Borrow POL against XRP collateral
- Repayment on report delivery

#### MPT & Hooks
- Multiple Purpose Token option for POL
- Conditional logic via hooks

### Next Steps
```typescript
// Example Phase 4 code structure (to implement)
class RLUSDService {
  async createTrustline(wallet: Wallet) { }
  async deposit(wallet: Wallet, amount: string) { }
  async swapPolToRlusd(fromWallet: Wallet, amount: string) { }
}

class DIService {
  async issueDID(wallet: Wallet, fields: any) { }
  async verifyAnalyst(did: string) { }
}

class LendingService {
  async borrow(wallet: Wallet, amount: string) { }
  async repay(wallet: Wallet, reportId: string) { }
}
```

---

## Phase 5: Polish, Security, SDK 📋 PLANNED

### Planned Features

#### Security Hardening
- [ ] Rate limiting: `express-rate-limit` configured
- [ ] Input validation: Zod schemas in all controllers
- [ ] Audit logging: All operations tracked
- [ ] Key rotation: AWS Secrets Manager integration
- [ ] Multi-sig treasury: For large transactions

#### Tokenomics
- [ ] Emission schedule: Deflationary (burn on fees)
- [ ] Governance voting: Multi-sig proposals
- [ ] Fee structure: 1-2% on reward distributions

#### SDK & Devtools
- [ ] `/sdk` folder: `@politifolio/xrpl-sdk` npm package
- [ ] Exports: `PolTokenClient`, `RiskAssessmentClient`, `IntelligenceClient`
- [ ] Example integrations for devs

#### Documentation
- [ ] API docs: Swagger/OpenAPI
- [ ] Component Storybook: React components
- [ ] Deployment guide: Mainnet setup
- [ ] User guide: Submitting reports, voting, rewards

#### Launch
- [ ] Bug bounty: Security review
- [ ] Testnet stress test: Load testing
- [ ] Mainnet migration: Switch `XRPL_NODE_URL` to production
- [ ] XRPL Grants submission: Full demo video

---

## Current Architecture

### Backend Stack
```
Express.js (TypeScript)
├── Controllers (intelligence, xrpl, compliance)
├── Services
│   ├── XrplService (ledger queries, transactions)
│   ├── PolTokenService (token operations)
│   ├── RiskAssessmentService (AI + multi-source analysis)
│   ├── ComplianceService (sanctions, AML, clawback)
│   └── Others (news, dedalus, anthropic)
├── Database (Prisma + SQLite)
└── Routes (REST API, /api/*)
```

### Frontend Stack
```
React + Vite (TypeScript)
├── Components
│   ├── IntelligenceReportsPanel (NEW - Phase 3)
│   ├── RiskAnalyticsDashboard
│   ├── XRPDashboard
│   ├── PolitifolioMapSimple
│   └── Others
├── Services
│   ├── xrplApi.service (XRPL/Intelligence endpoints)
│   └── api.service (other endpoints)
└── Styles (Tailwind CSS + Radix UI)
```

### Database Schema
```
User
├── walletAddress (unique)
├── reputation (0-100)
├── polBalance
└── verifiedAnalyst

IntelligenceReport (crowdsourced)
├── description, countries, impactType
├── status (pending→verified/disputed)
├── stakedPol
└── createdBy → User

RiskAssessment (AI-generated)
├── geopoliticalScore, economicImpact, militaryRisk
├── sanctionsHit
└── confidence

Stake (voting power)
├── userId, reportId
├── amount (POL)
├── direction (support/challenge)

PolTransaction (blockchain log)
├── type (mint, transfer, clawback)
├── fromWallet, toWallet
├── txHash (XRPL)
└── reason (stake, reward, compliance)
```

---

## Environment Variables Required

```bash
# XRPL
XRPL_NODE_URL=wss://testnet.xrpl-labs.com/
GEO_PULSE_ISSUER_SEED=sEd7sNZXajyE1MxMJuqcpB3FM1PLNZX
DESTINATION_SEED=sEd72fuEanXU4pyt9cidUnh3SqdALWT

# External APIs
ANTHROPIC_API_KEY=your_key
DEDALUS_API_KEY=your_key
WORLD_NEWS_API_KEY=your_key

# Database
DATABASE_URL=file:./dev.db
```

---

## Success Metrics (Target 10/10)

- ✅ XRPL native integration (payments, escrow, tokenization)
- ✅ POL token economics (stake, earn, distribute)
- ✅ Multi-source risk scoring (AI + news + sanctions)
- ✅ Crowdsourced intelligence (submit, vote, verify)
- ✅ Compliance-first (sanctions checks, clawback, AML)
- ✅ User-friendly interface (real-time, responsive, intuitive)
- 🚧 Advanced features (RLUSD, DID, lending)
- 🚧 Production security (audit, bug bounty, mainnet)
- 🚧 Developer SDK (npm package, examples)

---

## Quick Start

### Install Dependencies
```bash
cd backend && npm install && npx prisma db push
cd ../frontend && npm install
```

### Configure Environment
```bash
cp backend/.env.example backend/.env
# Edit .env with your XRPL seeds and API keys
```

### Run Development
```bash
# Terminal 1: Backend
cd backend && npm run dev

# Terminal 2: Frontend  
cd frontend && npm run dev
```

### Access Application
```
Frontend: http://localhost:5173
Backend: http://localhost:3001
Intelligence Tab: http://localhost:5173 → Intelligence Reports
```

---

## Deployed Wallets (Testnet)

**Issuer**: `rpRnHQ2j8xkr4RKbZ6LfzPCFDMLySNEtwm`
- Seeds: `sEd7sNZXajyE1MxMJuqcpB3FM1PLNZX`
- Mints & controls POL token

**Destination**: `rMAsbhhnkswS8woL46wViDd8BdkK9MMzdK`
- Seed: `sEd72fuEanXU4pyt9cidUnh3SqdALWT`
- Receives initial POL distribution

---

## Next Actions (Phases 4-5)

1. **RLUSD Integration** (Phase 4)
   - Add trustline creation
   - Implement premium features

2. **Wallet Integration** (Phase 3→4)
   - Xaman/Gem Wallet connect
   - Auto-sign for transactions

3. **Enhanced UI** (Phase 3→4)
   - Report submission form component
   - Advanced filters & sorting
   - Real-time WebSocket updates

4. **Production Hardening** (Phase 5)
   - Security audit
   - Rate limiting
   - Error handling & logging

5. **SDK Release** (Phase 5)
   - NPM package export
   - Developer documentation
   - Example projects

---

## References

- [XRPL Ledger Docs](https://xrpl.org)
- [POL Token Spec](./backend/src/services/polTokenService.ts)
- [Prisma Schema](./backend/prisma/schema.prisma)
- [API Endpoints](./backend/src/controllers/)

---

**Last Updated**: February 7, 2026
**Status**: MVP Foundation Complete, Advanced Features Beginning
**Target**: Production-ready 10/10 platform by Q2 2026
