# Coastal Cleanup Reward

**One-line description:** An app that rewards volunteers with USDC micropayments per kilogram of waste collected from coastal and river cleanups, using Stellar for instant, low-cost settlement.

## Problem

Coastal and river cleanups in the Philippines are almost entirely volunteer-driven. Participants spend hours collecting trash with no economic incentive, leading to low sustained participation. Even when NGOs want to reward cleaners, they face high transaction fees and slow bank transfers that make per‑kilo micropayments impractical. Volunteers also lack a transparent way to prove their contribution and receive fair compensation.

## How It Works

1. A volunteer connects their Freighter wallet (testnet).
2. The volunteer submits a cleanup claim:
   - Weight of collected waste (in kilograms)
   - GPS coordinates of the cleanup location (auto‑fetched or manually entered)
   - A photo of the collected waste (stored locally as preview)
3. The app immediately sends a USDC reward from a pre‑funded NGO wallet to the volunteer’s wallet.
   - Reward rate: **1 USDC per kilogram** (e.g., 2.5 kg → 2.5 USDC)
4. The volunteer sees a success screen with the transaction hash and a link to Stellar Expert for verification.
5. The claim is saved locally in the browser history (no database needed for demo).

The whole process happens in seconds, at near‑zero cost, and is fully transparent on the Stellar testnet.

## How It Uses Stellar

- **USDC (classic asset)** – The reward is paid in USDC, a stable digital dollar, using the standard testnet USDC issuer.
- **Stellar payments** – Each reward is a simple USDC payment transaction from the NGO wallet to the volunteer's wallet.
- **Transaction finality polling** – After submission, the app polls the Stellar testnet for final confirmation.
- **Trustline requirement** – Volunteers must establish a USDC trustline with the issuer before they can receive rewards (the app provides instructions).

Stellar's sub‑cent fees and 5‑second settlement make per‑kilogram micropayments economically viable — something impossible with traditional banking or credit cards.

## Track

**Track 5 – Social Impact (Health, Education, Agriculture)**  
*Specifically addresses environmental action and community incentive alignment, with strong Philippines relevance (coastal communities, river pollution).*

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Stellar SDK:** `@stellar/stellar-sdk` v14
- **Wallet connection:** Freighter browser extension
- **Network:** Stellar testnet

## Setup & Run

> **Prerequisites:** Node.js 18+, npm, Freighter extension installed in your browser.

```bash
# Clone the repository
https://github.com/jerimiahbitancor/Project-2-Environmental-Cleanup-Reward.git
cd Project-2-Environmental-Cleanup-Reward

# Install dependencies
npm install

# Create environment variables file
cp .env.local.example .env.local