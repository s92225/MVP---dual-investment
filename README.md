# SilverTimes Dual Investment MVP

Static MVP prototype for the SilverTimes STT Dual Investment feature.

## Run

Open `index.html` in a browser.

No build step or package install is required.

## Deploy

This is a static site. It can be deployed directly to Vercel from the repository root with no build command.

## Data Source

Product data is taken only from the Notion page named **Staking**:

- Buy Low: Aggressive, Balanced, Conservative
- Sell High: Aggressive, Balanced, Conservative
- Exercise date: 25 Jun 2026
- COMEX references, strikes, model premiums, suggested rewards, estimated period yields, and estimated APRs

`C:\Users\s9222\Downloads\DESIGN (1).md` is used only for visual direction.

## Prototype Behavior

- Connect Wallet toggles a local demo wallet state.
- Expiry selection is structured as weekly Mon-Fri expiries and a monthly expiry. Rewards are previewed from the source APR over the selected expiry window.
- Deposit / Stake CTA stores a local simulated position in `localStorage`.
- Admin Console settles local positions by product using a final reference price.
- Claim changes a settled local position to claimed.

This prototype does not perform real token approvals, wallet signatures, smart contract calls, KYC, legal gating, or oracle settlement.
