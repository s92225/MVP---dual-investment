# Silver Forecast MVP Plan

Date: 2026-05-28

Silver Forecast lives inside the existing **SilverTimes Dual Investment MVP** static project and Vercel deployment. The MVP is implemented as a separate page:

`silver-pulse.html`

## Product Definition

Silver Forecast is a daily silver forecast challenge. Users connect a demo wallet, receive Sparks, and forecast whether silver will close **UP** or **DOWN** versus the trading day's opening reference price.

Everyone can connect a demo wallet and play. STT holding and staking unlock tier multipliers, leaderboard payout eligibility, and raffle tickets. Sparks are campaign points and do not redeem into USDT in this MVP.

## Confirmed MVP Decisions

- Launch scope: global demo.
- Authentication: fake connect wallet only, matching the Dual Investment MVP behavior.
- Price source: LBMA silver price for settlement, manually entered for MVP.
- Timezone: Hong Kong time.
- Trading day: `12:00 PM HKT` to `10:00 AM HKT` the next calendar day, labeled by opening date.
- Round cadence: Monday through Friday opening dates.
- Starting balance: `10 Sparks`.
- Daily reward: `10 Sparks` while balance is `100 Sparks` or below.
- Minimum forecast: `10 Sparks`.
- Daily max forecast amount: `100 Sparks`.
- Raffle tickets: `1 base ticket + floor(Sparks / 100)`.
- Sparks are non-transferable.
- No USDT redemption flow.
- Deployment: existing Dual Investment MVP Vercel project.

## Gameplay Rules

Each trading day has one active round.

Users can:

- Connect a fake demo wallet.
- Set a profile username.
- View opening reference, current silver spot price, and closing price after settlement.
- Submit one UP or DOWN forecast per trading day.
- Edit the latest forecast once during the valid trading window.
- View community sentiment before settlement.
- View the all-time Spark leaderboard after settlement.
- View Spark balance, raffle tickets, STT tier, mission progress, and local forecast history.
- Stake as little as `0.1 STT` in `0.1 STT` increments, track staking days, and unstake anytime. Tier eligibility still requires the required amount to be maintained for 7 days.

Admin can:

- Set opening reference, silver spot price, and closing price manually.
- Adjust the demo wallet Spark balance.
- Set profile username.
- Set held STT, holding days, staked STT, and staking days.
- Override tier and active streak days for multiplier testing.
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

Wrong forecasts lose the Spark amount used. Correct forecasts return the Spark amount plus Spark profit.

```text
final_multiplier = min(2.4x, tier_multiplier x active_streak_multiplier)
```

Users see a confirmation screen before a new forecast or one allowed edit commits Sparks.

## Tier And Multiplier System

| Tier | Requirement | Multiplier | Leaderboard payout |
|---|---|---:|---|
| Spark | Wallet connected | 1.0x | No |
| Flare | Hold 0.1 STT for 7 days | 1.1x | Yes |
| Blaze | Hold 0.5 STT or stake 0.1 STT for 7 days | 1.25x | Yes |
| Nova | Hold 1 STT or stake 0.5 STT for 7 days | 1.5x | Yes |
| Apex | Stake 1 STT+ for 7 days | 2.0x | Yes |

Active streak bonus:

| Active days | Multiplier |
|---|---:|
| 0-1 | 1.0x |
| 2 | 1.05x |
| 3 | 1.10x |
| 4 | 1.15x |
| 5+ | 1.20x |

Total multiplier is capped at `2.4x`.

Staking:

- Minimum stake amount: `0.1 STT`.
- Stake increment: `0.1 STT`.
- Tier eligibility period: `7 days`.
- Users can unstake anytime. Unstaking removes the staked amount from automatic tier qualification.

## Missions

Mission rewards generate Sparks only:

- Connect wallet, one-time: `50 Sparks`.
- Set profile / username, one-time: `50 Sparks`.
- Submit Daily Forecast, daily trading window: `20 Sparks`.
- Correct Daily Forecast, daily: `30 Sparks`.
- 5 forecasts in one week, weekly: `100 Sparks`.
- 3 correct forecasts in one week, weekly: `150 Sparks`.
- Perfect 5/5 week, weekly: `300 Sparks`.
- Hold STT for 7 consecutive days, weekly: `200 Sparks`.
- Stake STT for 7 consecutive days, weekly: `400 Sparks`.

## Storage Model

This is a static MVP. It uses browser `localStorage` instead of a backend database.

Local storage keys:

- `silvertimes-silver-forecast-state-v6`
- `silvertimes-silver-pulse-wallet-connected`

The seeded state includes one active round, settled historical rounds, sample predictions, Spark payout records, and a demo wallet ledger.

## Compliance Guardrails

The MVP should remain a forecast challenge, not a casino-style product:

- Sparks are non-transferable.
- Demo records do not perform token approvals, wallet signatures, smart contract calls, KYC, or oracle settlement.
- Wallet-only users can complete missions and enter the raffle.
- Sparks cannot be redeemed for USDT in the MVP demo.

## Production Notes

Before production, revisit these choices:

- Real wallet auth should replace fake wallet state.
- STT holding and staking need contract, custody, compliance, and abuse-control review.
- A reliable price source, timestamp, precision rule, and audit log are needed for settlement.
- Anti-bot controls will be needed if Sparks affect raffle or airdrop allocation.
