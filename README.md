# SilverTimes MVP

Static MVP prototype for two SilverTimes product demos:

- **Dual Investment:** STT / USDT target-price yield flow.
- **Silver Pulse:** daily silver UP/DOWN prediction challenge with fake wallet, local leaderboard, and manual LBMA settlement.

## Run

Open either page in a browser:

- `index.html`
- `silver-pulse.html`

No build step or package install is required.

## Deploy

This is a static site. It can be deployed directly to the existing Vercel project from the repository root with no build command.

## Dual Investment Data Source

Product data is taken only from the Notion page named **Staking**:

- Buy Low: Aggressive, Balanced, Conservative
- Sell High: Aggressive, Balanced, Conservative
- Exercise date: 25 Jun 2026
- COMEX references, strikes, model premiums, suggested rewards, estimated period yields, and estimated APRs

`C:\Users\s9222\Downloads\DESIGN (1).md` is used only for visual direction.

## Prototype Behavior

- Connect Wallet toggles a local demo wallet state.
- Settlement term selection is monthly only: 1M, 3M, and 6M. Potential earning is previewed from the selected APR over the selected settlement window.
- Amount entry accepts either USDT or STT and converts the other side using the displayed spot price.
- Deposit / Stake CTA stores a local simulated position in `localStorage`.
- Admin Console settles local positions by product using a final reference price.
- Claim changes a settled local position to claimed.

This prototype does not perform real token approvals, wallet signatures, smart contract calls, KYC, legal gating, or oracle settlement.

## Silver Pulse MVP Behavior

- Fake Connect Wallet toggles a local demo wallet state.
- Daily round data is seeded in `localStorage`.
- Price source is labeled as LBMA silver price, with manual MVP input through the admin console.
- Users can submit one UP or DOWN prediction per round.
- Score is calculated as `base points * time bonus * win-streak multiplier`.
- Admin can set round prices, trigger settlement, and mark USDT reward records as pending, approved, or paid.
- Rewards are demo records only; no on-chain payment or real wallet signature is performed.

See `SILVER_PULSE_MVP_PLAN.md` and `design.md` for product and design details.
