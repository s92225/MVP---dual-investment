# Silver Pulse MVP Plan

Date: 2026-05-12

Silver Pulse now lives inside the existing **SilverTimes Dual Investment MVP** static project and Vercel deployment. The MVP is implemented as a separate page:

`silver-pulse.html`

## Product Definition

Silver Pulse is a free-to-play daily silver prediction game. Users connect a fake demo wallet and predict whether silver will close **UP** or **DOWN** versus the day's opening LBMA silver reference price.

Correct users are ranked by score. The top ranked winners share a fixed daily USDT reward pool.

## Confirmed MVP Decisions

- Launch scope: global demo.
- Authentication: fake connect wallet only, matching the Dual Investment MVP behavior.
- Price source: LBMA silver price for settlement, manually entered for MVP. The live display labels the current value as silver spot price.
- Round timezone: trading round uses the London LBMA schedule.
- Round cadence: silver trading days only, Monday through Friday for MVP.
- Reward unit: USDT records.
- Reward pool: default 20 USDT.
- Winner display: shortened wallet address.
- Deployment: existing Dual Investment MVP Vercel project.

## MVP Route

- `/silver-pulse.html`: Silver Pulse game page.
- `/index.html`: Dual Investment MVP remains unchanged except for links into Silver Pulse.

## Gameplay Rules

Each trading day has one active round.

Users can:

- Connect a fake demo wallet.
- View opening reference, current silver spot price, and closing LBMA price after settlement.
- Submit exactly one UP or DOWN prediction per round.
- View community sentiment before settlement.
- View final leaderboard after settlement.
- View local wallet prediction history and rewards.

Admin can:

- Set opening reference, silver spot price, and closing price manually.
- Set reward pool and max winners.
- Set round status.
- Override result as UP, DOWN, or FLAT.
- Trigger settlement.
- Mark rewards pending, approved, or paid.

## Settlement Logic

Automatic result:

```text
closing_price > opening_price = UP
closing_price < opening_price = DOWN
closing_price == opening_price = FLAT
```

If admin sets a result override, the override wins.

If result is FLAT, no rewards are created.

Entries close two hours before LBMA publication:

- Prediction cutoff: 10:00 London time.
- LBMA silver benchmark: 12:00 London time.

## Score Formula

Only correct predictions receive score.

```text
score = base_points * time_bonus * win_streak_multiplier
```

Current MVP formula:

- Correct side base points: `100`
- Wrong side base points: `0`
- Time bonus depends on how long before the 10:00 London cutoff the prediction is submitted.
- Win streak multiplier uses the current correct streak, including the current correct prediction.

Time bonus:

| Time to cutoff when joined | Bonus |
|---|---:|
| 8h+ | 1.5x |
| 6h+ | 1.3x |
| 4h+ | 1.2x |
| 2h+ | 1.1x |
| Less than 2h | 1.0x |

Win streak multiplier:

| Win streak | Multiplier |
|---|---:|
| 1 correct | 1.0x |
| 2 correct | 1.1x |
| 3 correct | 1.2x |
| 5 correct | 1.5x |
| 7 correct | 1.8x |
| 10+ correct | 2.0x |

For streak counts between listed thresholds, use the highest threshold already reached. For example, 4 correct uses 1.2x and 6 correct uses 1.5x.

Example:

```text
8h+ before cutoff + current 3-win streak = 100 * 1.5 * 1.2 = 180 points
```

Tie-breakers:

1. Higher score first.
2. Earlier prediction timestamp.
3. Lower wallet address alphabetically.

## Reward Formula

Rewards are stored in integer cents to avoid decimal rounding issues.

```text
winners = top correct predictions up to max_winners
reward_per_winner = reward_pool / winners.length
```

If cents do not divide evenly, leftover cents are assigned from rank 1 downward.

Examples:

- 20 or more correct users and max winners is 20: top 20 receive 1.00 USDT each.
- 5 correct users: 5 winners receive 4.00 USDT each.
- 0 correct users or FLAT: no payout.

## Storage Model

This is a static MVP. It uses browser `localStorage` instead of a backend database.

Local storage keys:

- `silvertimes-silver-pulse-state-v4`
- `silvertimes-silver-pulse-wallet-connected`

The seeded state includes one active round, two settled historical rounds, sample predictions, and one paid historical reward for the demo wallet.

## Compliance Guardrails

The MVP should remain a promotional prediction challenge:

- No deposits.
- No user-funded prize pool.
- No odds.
- No tradable positions.
- No leverage.
- No language promising profit, investment return, or guaranteed wins.

Use wording such as:

- prediction
- forecast
- daily challenge
- reward pool
- free-to-play

Avoid wording such as:

- bet
- gamble
- wager
- casino
- odds
- guaranteed win
- profit
- investment return

## Production Notes

Before production, revisit these choices:

- Global launch plus user-local daily rounds can fragment the leaderboard by timezone. A single UTC or LBMA publication-day round may be cleaner.
- Manual LBMA input is acceptable for MVP, but production needs a reliable source, timestamp, precision rule, and audit log.
- USDT rewards may trigger jurisdiction-specific rules even when free-to-play. Legal review is required before a public launch.
- Fake wallet auth should be replaced with real wallet signature or another identity layer.
- Anti-bot controls will be needed if rewards become claimable.
