# SilverTimes Dual Investment MVP Plan

Date: 2026-05-11

Source constraint: use only the Notion page named **Staking** for product data and product rules. `C:\Users\s9222\Downloads\DESIGN (1).md` is used only for visual style.

## MVP Definition

Build a browser-based MVP for **STT Dual Investment**, an opt-in yield feature where users stake **STT or USDT** into silver-linked strategies.

The MVP has two products:

- **Sell High:** user stakes STT, chooses a higher target price, earns yield, and STT may be sold at the target price if silver reaches it.
- **Buy Low:** user deposits USDT, chooses a lower target price, earns yield, and USDT may be used to buy STT if silver falls to the target price.

## Product Catalog

### Buy Low

User deposits USDT and earns yield by selecting a lower STT accumulation price.

| Choice | COMEX reference | Strike price | Exercise date | Model option premium / oz | Suggested user reward / STT-equivalent | Est. period yield | Est. APR |
|---|---|---:|---|---:|---:|---:|---:|
| Aggressive | Sell Put | US$77.50 | 25 Jun 2026 | ~US$4.17 | ~US$2.71 | 3.36% | 27.2% |
| Balanced | Sell Put | US$75.00 | 25 Jun 2026 | ~US$3.16 | ~US$2.05 | 2.54% | 20.6% |
| Conservative | Sell Put | US$70.00 | 25 Jun 2026 | ~US$1.64 | ~US$1.06 | 1.32% | 10.7% |

### Sell High

User deposits STT and earns yield by selecting a higher sell price.

| Choice | COMEX reference | Strike price | Exercise date | Model option premium / oz | Suggested user reward / STT | Est. period yield | Est. APR |
|---|---|---:|---|---:|---:|---:|---:|
| Aggressive | Sell Call | US$85.00 | 25 Jun 2026 | ~US$4.10 | ~US$2.67 | 3.30% | 26.8% |
| Balanced | Sell Call | US$90.00 | 25 Jun 2026 | ~US$2.61 | ~US$1.70 | 2.10% | 17.0% |
| Conservative | Sell Call | US$95.00 | 25 Jun 2026 | ~US$1.60 | ~US$1.04 | 1.29% | 10.5% |

Verification link from source doc:
`https://www.barchart.com/futures/quotes/SI*0/options?futuresOptionsView=merged`

## MVP Screens

### Dashboard

- Fixed top nav.
- Product tabs: Buy Low and Sell High.
- Product list showing choice, COMEX reference, strike, exercise date, reward estimate, period yield, APR, and verification link.
- Selected product detail panel.
- Settlement term selector: monthly-only 1M, 3M, and 6M terms.

### Deposit Flow

- Amount input.
- Quote preview using source APR values. Potential earning is previewed from APR over the selected settlement window.
- Two outcome explanations:
  - Buy Low: final price above target returns USDT principal plus reward estimate; final price at or below target accumulates STT at the target price.
  - Sell High: final price below target returns STT principal plus reward estimate; final price at or above target sells STT at the target price.
- Required acknowledgements before a simulated deposit is created.

### Positions

- Local simulated positions stored in browser `localStorage`.
- Active, settled, and claimable states.
- Product, deposit amount, target price, settlement term, estimated potential earning, and settlement result.

### Admin Settlement Mock

- Choose a product.
- Enter final reference price.
- Settle all local positions for that product.
- Show outcome according to the Staking doc rules.

## Design Direction

Use the attached Steep-style design brief:

- Dark canvas with crisp elevated card surfaces.
- Serif display headings paired with system sans UI text.
- Warm Mist accent only for emphasis.
- Filled high-contrast primary CTA for the main deposit action.
- Fewer explanatory text blocks; favor product cards, target bars, outcome cards, and quote metrics.
- Compact hero with floating metric cards instead of a large patterned background.
- The first screen stays product-led, not marketing-led.

## Implementation Scope

This execution creates a dependency-free static MVP prototype:

- `index.html`
- `styles.css`
- `app.js`
- `README.md`

It does not implement real wallet transactions, token approvals, smart contracts, KYC, legal gating, or oracle settlement. Those are next-stage production tasks after the product rules and legal treatment are confirmed.

## Open Questions From Staking Doc

- Do we need a license or regulatory approval to offer this as a structured product?
- What percentage of option premium should be passed to users versus retained by SilverTimes?
- What benchmark determines yield?
- Which oracle is used?

## Source

- <mention-page url="https://www.notion.so/35dc65a7457f8049bafac5f40641a926">Staking</mention-page>
- `C:\Users\s9222\Downloads\DESIGN (1).md` for visual style only
