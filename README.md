# SilverTimes MVP

Static MVP prototype for SilverTimes product demos:

- **Dual Investment:** STT / USDT target-price yield flow.
- **Silver Pulse:** daily silver UP/DOWN prediction challenge with fake wallet, local leaderboard, and manual LBMA settlement.
- **Range Prediction:** weekly, 1M, and 3M silver in-range prediction flow using USDT or STT participation.

## Run

Open either page in a browser:

- `index.html`
- `silver-pulse.html`
- `range-prediction.html`

No build step or package install is required.

## Deploy

This is a static site. It can be deployed directly to the existing Vercel project from the repository root with no build command.

## Dual Investment Data Source

Product APYs are static demo values refreshed from the Barchart `SIN26` June 25, 2026 option chain:

- Buy Low: Aggressive, Balanced, Conservative
- Sell High: Aggressive, Balanced, Conservative
- Exercise date: 25 Jun 2026
- COMEX references, strikes, delayed bid premiums, suggested rewards, estimated period yields, and estimated APYs
- Reward estimates assume 65% of option bid premium is passed through to the user, annualized over the 39-day option window shown by Barchart.

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

## Range Prediction MVP Behavior

- Fake Connect Wallet toggles a local demo wallet state.
- Users choose Weekly, 1M, or 3M terms and trade YES/NO shares on whether silver settles inside a selected range.
- Presets include the example `US$70-US$90` range as fixed market ranges.
- Participation accepts USDT or STT with a minimum of `1 USDT` equivalent, converted into YES or NO shares priced between `$0.01` and `$0.99`.
- The page includes a demo YES price chart, order book, and resolution countdown.
- Admin Console settles open local predictions with a final reference price and marks YES or NO shares as won or lost.
- Deposits, shares, payouts, and settlements are demo records only; no on-chain payment, token approval, or real wallet signature is performed.

See `SILVER_PULSE_MVP_PLAN.md` and `design.md` for product and design details.
