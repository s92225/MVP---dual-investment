# SilverTimes MVP

Static MVP prototype for SilverTimes product demos:

- **Dual Investment:** STT / USDT target-price strategies with yield and premium-paid price-move flows.
- **Silver Forecast:** daily silver UP/DOWN forecast challenge with fake wallet, Sparks ledger, STT tiers, configurable staking, raffle tickets, local leaderboard, and manual LBMA settlement.
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
- Move Up: Aggressive, Balanced, Conservative
- Move Down: Aggressive, Balanced, Conservative
- Exercise date: 25 Jun 2026
- COMEX references, strikes, delayed bid premiums, suggested rewards, estimated period yields, and estimated APYs
- Reward estimates assume 65% of option bid premium is passed through to the user, annualized over the 39-day option window shown by Barchart.
- Long-side premiums are static demo Ask snapshots by 1M, 3M, and 6M terms. Midpoint or Last can be used where Ask is unavailable.

`C:\Users\s9222\Downloads\DESIGN (1).md` is used only for visual direction.

## Prototype Behavior

- Connect Wallet toggles a local demo wallet state.
- Settlement term selection is monthly only: 1M, 3M, and 6M. Yield-side potential earning is previewed from the selected APR over the selected settlement window.
- Amount entry accepts either USDT or STT and converts the other side using the displayed spot price.
- Move Up and Move Down accept a USDT commit amount, estimate position size, show break-even, and cash-settle payout in USDT.
- Deposit / Stake / Buy CTA stores a local simulated position in `localStorage`.
- Admin Console settles local positions by term using a final reference price.
- Claim changes a settled local position to claimed.

This prototype does not perform real token approvals, wallet signatures, smart contract calls, KYC, legal gating, or oracle settlement.

## Silver Forecast MVP Behavior

- Fake Connect Wallet toggles a local demo wallet state.
- Daily round data, Spark balances, STT tier state, forecast history, missions, raffle ticket counts, and staking state are seeded/stored in `localStorage`.
- Each wallet starts with `10 Sparks`; the system adds `10 Sparks` per trading day while balance is `100 Sparks` or below.
- Users can submit one UP or DOWN forecast per HKT trading day with a minimum of `10 Sparks` and daily maximum of `100 Sparks`.
- Users can edit the latest forecast once during the valid HKT trading window. Full edit history is retained and only the latest valid forecast settles.
- Forecast submission shows a confirmation screen before Sparks are committed.
- Leaderboard ranks wallets by all-time Sparks earned.
- HKT trading day opens at `12:00 PM HKT` and closes at `10:00 AM HKT` the next calendar day, labeled by opening date.
- Wrong forecasts lose the Spark amount used. Correct forecasts return the Spark amount plus profit from `tier multiplier x active streak`, capped at `2.4x`.
- STT tiers: Spark `1.0x`, Flare `1.1x`, Blaze `1.25x`, Nova `1.5x`, Apex `2.0x`; 7-day holding/staking rules follow the campaign deck.
- Users can stake from `0.1 STT` in `0.1 STT` increments, view staking days, and unstake anytime. Tier eligibility still requires the required amount to be maintained for 7 days.
- Raffle tickets use `1 base ticket + floor(Sparks / 100)`.
- Sparks are non-transferable campaign points and cannot be redeemed for USDT.
- Missions award Sparks for wallet connect, profile setup, daily forecast submission, correct forecasts, weekly forecast/correct/perfect loops, 7-day holding, and 7-day staking.
- Admin Console is grouped into Round Prices, Round Status, Wallet and STT Testing, and Multiplier Testing. It can set round prices/status, adjust Spark balance, test username, held/staked STT, holding/staking days, tier override, active-day override, and trigger settlement. Spark rewards are demo records only; no on-chain payment or real wallet signature is performed.

## Range Prediction MVP Behavior

- Fake Connect Wallet toggles a local demo wallet state.
- Users choose Weekly, 1M, or 3M terms and trade YES/NO shares on whether silver settles inside a selected range.
- Presets include the example `US$70-US$90` range as fixed market ranges.
- Participation accepts USDT or STT with a minimum of `1 USDT` equivalent, converted into YES or NO shares priced between `$0.01` and `$0.99`.
- The page includes a demo YES price chart, order book, and resolution countdown.
- Admin Console settles open local predictions with a final reference price and marks YES or NO shares as won or lost.
- Deposits, shares, payouts, and settlements are demo records only; no on-chain payment, token approval, or real wallet signature is performed.

See `SILVER_PULSE_MVP_PLAN.md` and `design.md` for product and design details.
