# Silver Pulse MVP Plan

Date: 2026-05-21

Silver Pulse lives inside the existing **SilverTimes Dual Investment MVP** static project and Vercel deployment. The MVP is implemented as a separate page:

`silver-pulse.html`

## Product Definition

Silver Pulse is a daily silver prediction challenge. Users connect a demo wallet, receive Sparks, and guess whether silver will close **UP** or **DOWN** versus the trading day's opening reference price.

Everyone can play in paper trading mode. Users can stake `1 STT` to enter real trading mode, unlock the `1.5x` win multiplier, and redeem Sparks at `2,000 Sparks = 1 USDT`.

## Confirmed MVP Decisions

- Launch scope: global demo.
- Authentication: fake connect wallet only, matching the Dual Investment MVP behavior.
- Price source: LBMA silver price for settlement, manually entered for MVP.
- Timezone: Hong Kong time.
- Trading day: `12:00 PM HKT` to `10:00 AM HKT` the next calendar day, labeled by opening date.
- Round cadence: Monday through Friday opening dates.
- Starting balance: `10 Sparks`.
- Daily reward: `10 Sparks` while balance is `100 Sparks` or below.
- Minimum guess: `10 Sparks`.
- Daily max guess amount: `100 Sparks`.
- Redemption rate: `2,000 Sparks = 1 USDT`.
- Sparks are non-transferable.
- Deployment: existing Dual Investment MVP Vercel project.

## Gameplay Rules

Each trading day has one active round.

Users can:

- Connect a fake demo wallet.
- View opening reference, current silver spot price, and closing price after settlement.
- Submit one UP or DOWN guess per trading day.
- Edit the latest guess once during the valid trading window.
- View community sentiment before settlement.
- View the all-time Spark leaderboard after settlement.
- View profile balance, staking status, mission progress, and local guess history.

Admin can:

- Set opening reference, silver spot price, and closing price manually.
- Adjust the demo wallet Spark balance.
- Set round status.
- Override result as UP, DOWN, or FLAT.
- Trigger settlement.
- Mark Spark payout records approved or paid.

## Settlement Logic

Automatic result:

```text
closing_price > opening_price = UP
closing_price < opening_price = DOWN
closing_price == opening_price = FLAT
```

If admin sets a result override, the override wins.

Wrong guesses lose the Spark amount used. Correct guesses return the Spark amount plus Spark profit.

```text
final_win_multiplier = max(staking_multiplier, streak_multiplier)
```

The final win multiplier is capped at `1.5x` for MVP.

Users see a confirmation screen before a new guess or one allowed edit commits Sparks.

## Staking And Yield

Real trading mode:

- User stakes `1 STT`.
- Stake is locked for one week.
- After one week, the user can unstake anytime.
- Staking unlocks the `1.5x` win multiplier and Spark redemption.

Estimated yield wording:

> Stake 1 STT to unlock up to 4% estimated annualized Spark earning yield.

Calculation:

```text
Max daily play = 100 Sparks
Expected staking edge at 50% win rate = 25%
Expected bonus = 25 Sparks per trading day
25 Sparks = 0.0125 USDT
260 trading days/year = 3.25 USDT expected annual value
1 STT = 75 USDT
3.25 / 75 = 4.33%, rounded to 4%
```

This is not guaranteed yield. Actual results depend on win rate, daily play, STT price, and the Spark redemption rate.

## Winning Streak

Winning streak bonus is based on previous consecutive winning trading days:

| Previous winning days | Multiplier |
|---|---:|
| 0 | 1.0x |
| 1 | 1.1x |
| 2 | 1.2x |
| 3 | 1.3x |
| 4 | 1.4x |
| 5+ | 1.5x |

The staking multiplier and streak multiplier do not stack. The higher multiplier applies.

## Missions

Mission rewards are one-time Spark rewards:

- Submit guesses for 5 consecutive trading days in the same Monday-Friday week: `100 Sparks`.
- Score the first winning daily guess: `100 Sparks`.
- Stake `1 STT`: `1,000 Sparks`.

## Storage Model

This is a static MVP. It uses browser `localStorage` instead of a backend database.

Local storage keys:

- `silvertimes-silver-pulse-state-v5`
- `silvertimes-silver-pulse-wallet-connected`

The seeded state includes one active round, settled historical rounds, sample predictions, Spark payout records, and a demo wallet ledger.

## Compliance Guardrails

The MVP should remain a prediction challenge, not a casino-style product:

- Sparks are non-transferable.
- Demo records do not perform token approvals, wallet signatures, smart contract calls, KYC, or oracle settlement.
- Paper users can complete missions and qualify for airdrops.
- Only staked users can redeem Sparks in the MVP demo.
- The 4% figure must be shown as an estimate, not a guarantee.

## Production Notes

Before production, revisit these choices:

- Real wallet auth should replace fake wallet state.
- STT staking and Spark redemption need contract, custody, compliance, and abuse-control review.
- A reliable price source, timestamp, precision rule, and audit log are needed for settlement.
- Anti-bot controls will be needed if Sparks become redeemable or airdrop-relevant.
