# 🟣 BidRush — Decentralized Anonymous Freelance Marketplace

> **Flash auctions. Anonymous identity. On-chain reputation. Powered by Monad.**

BidRush is a fully decentralized freelance marketplace where identity is your wallet address, reputation is calculated on-chain, and jobs are filled through **2-minute flash auctions** — leveraging Monad's parallel execution to process hundreds of competing bids in a single block.

No emails. No passwords. No KYC. Just wallets, scores, and code.

---

## 🧠 The Problem

Traditional freelance platforms like Upwork, Fiverr, and Freelancer suffer from:

- **Centralized identity & trust** — Platform owns your data, reputation, and payment flow
- **Slow hiring cycles** — Days or weeks of back-and-forth proposals and interviews
- **High fees** — Platforms extract 10-20% of every transaction
- **Opaque dispute resolution** — A single company decides who's right
- **Geographic & banking barriers** — Freelancers in developing countries face payment friction
- **Reputation lock-in** — Years of built reputation can't be ported to another platform

## 💡 The Solution

BidRush reimagines freelancing as a **fully on-chain, anonymous, and instant** experience:

| Problem | BidRush Solution |
|---|---|
| Centralized identity | Wallet address = identity |
| Slow hiring | 2-minute flash auctions |
| High fees | Near-zero gas on Monad |
| Opaque disputes | Decentralized anonymous tribunal |
| Banking barriers | Crypto-native payments via escrow |
| Reputation lock-in | On-chain Quality Score, portable forever |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND (SPA)                    │
│  React + Wagmi + Viem + AI Processing (Client-side) │
└──────────────────────┬──────────────────────────────┘
                       │
                       │  RPC / Events
                       │
┌──────────────────────▼──────────────────────────────┐
│                 MONAD BLOCKCHAIN                     │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │            BidRushPlatform.sol                  │  │
│  │  (monolithic contract — profiles, auctions,    │  │
│  │   escrow, disputes, quality scores)            │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│         ⚡ Parallel Execution Engine ⚡               │
└─────────────────────────────────────────────────────┘
```

### Why Monad?

BidRush specifically exploits Monad's **parallel transaction execution**:

- **Flash Auctions** generate hundreds of bid transactions within a 2-minute window. On Ethereum, these would be processed sequentially across multiple blocks. On Monad, they execute **in parallel within the same block**, making real-time competitive bidding viable.
- **Near-zero gas costs** make micro-interactions (bidding, voting, score updates) economically feasible.
- **EVM compatibility** means we use standard Solidity tooling while gaining 10,000+ TPS.

---

## 📄 Application Flow

### Page 1 — Web3 Authentication & State Extraction

The entry point is a single **"Connect Wallet"** button. No forms, no emails, no passwords.

1. User connects wallet → Frontend reads on-chain profile
2. System displays the wallet's **Quality Score** (0-100)
3. User chooses to enter as **Client** or **Freelancer**

### Page 2 — Service Menu & Flash Auction Trigger (Client)

1. Client describes what they need using a **conversational AI interface**
2. AI suggests technical parameters, budget, and minimum score threshold
3. Client configures max budget + minimum Quality Score
4. Client clicks **"🔴 Trigger Flash Auction"** → funds locked in escrow on-chain

### Page 3 — Mass Application Terminal (Freelancer)

1. Freelancer sees pulsing alert with **2-minute countdown**
2. Submits bid (amount + delivery time)
3. Smart contract **verifies Quality Score on-chain** — reverts instantly if below minimum
4. Monad processes **hundreds of concurrent bids in parallel**

### Page 4 — AI Resolution Dashboard (Client)

1. Timer expires → auction closes on-chain
2. AI ranks bids by composite score (price × quality × speed)
3. **Top 3 proposals** displayed to client
4. Client selects winner → job starts, escrow locked

### Page 5 — Shared Workspace & Settlement

- **Freelancer** submits delivery proof
- **Client** reviews and clicks **"✅ Approve & Pay"** → escrow released atomically
- Or clicks **"⚠️ Open Dispute"** → enters tribunal

### Page 6 — Decentralized Audit Tribunal

1. Smart contract selects **random high-score auditors**
2. Auditors review evidence and vote
3. Majority wins → funds released, loser's Quality Score burned

---

## 🔧 Smart Contract

**Deployed on Monad Testnet:** [`0x8C326731903F2bD3CfE48fE2E81a1079783f66E5`](https://testnet.monadvision.com/address/0x8C326731903F2bD3CfE48fE2E81a1079783f66E5)

Single monolithic contract `BidRushPlatform.sol` containing:

| Module | Functions |
|---|---|
| **User Registration** | `registerUser()` — auto-register with score 50 |
| **Flash Auctions** | `createAuction()` — lock MON, 2-min timer |
| **Bidding** | `placeBid()` — reverts if score < minimum |
| **Selection** | `closeAuction()` + `selectFreelancer()` → creates Job |
| **Delivery** | `submitDelivery()` — freelancer posts proof |
| **Payment** | `approveAndPay()` — releases escrow, boosts score, refunds excess |
| **Disputes** | `openDispute()` → `castVote()` → auto-resolves at majority |
| **Views** | `getTopBids()`, `getActiveAuctions()`, `getProfile()` |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Blockchain** | Monad (EVM-compatible, parallel execution) |
| **Smart Contracts** | Solidity 0.8.24 + Foundry |
| **Frontend** | React + Vite |
| **Wallet Integration** | Wagmi + Viem |
| **AI Processing** | Client-side LLM integration for bid curation & scope analysis |

---

## 🚀 Getting Started

### Smart Contracts

```bash
cd contracts

# Install dependencies
forge install

# Compile
forge build

# Run tests (18 tests)
forge test -vvv

# Deploy to Monad Testnet
PRIVATE_KEY=0x<your-key> forge script script/Deploy.s.sol \
  --rpc-url https://testnet-rpc.monad.xyz --broadcast

# Run on-chain integration tests
PRIVATE_KEY=0x<your-key> bash script/test_onchain.sh
```

### Prerequisites

- [Foundry](https://getfoundry.sh) (forge, cast)
- A Web3 wallet with Monad Testnet MON ([faucet](https://faucet.monad.xyz))

---

## 🗺️ Roadmap

- [x] Project definition and architecture
- [x] Smart Contract — BidRushPlatform (all modules)
- [x] Foundry tests — 18/18 passing
- [x] Deploy to Monad Testnet
- [x] On-chain integration tests
- [ ] Frontend — Web3 authentication flow
- [ ] Frontend — Flash auction creation (Client)
- [ ] Frontend — Bid submission terminal (Freelancer)
- [ ] Frontend — AI-powered top 3 dashboard
- [ ] Frontend — Workspace & delivery flow
- [ ] Frontend — Dispute tribunal interface

---

## 📜 License

MIT

---

<p align="center">
  <strong>Built for Monad Blitz Hackathon 🟣⚡</strong><br/>
  <em>Decentralizing work, one flash auction at a time.</em>
</p>
