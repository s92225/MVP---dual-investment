# SilverTimes MVP Design

This project uses one shared visual language across **Dual Investment** and **Silver Pulse**: dark, crisp, product-led fintech UI adapted from the Steep design reference.

## Design Direction

- Dark canvas with elevated card surfaces and subtle borders.
- Compact first screen with live product data visible immediately.
- Editorial heading scale paired with clean system UI text.
- Warm Mist and Terracotta used sparingly for emphasis, thresholds, selected states, and settlement states.
- Dense but calm layouts: fewer explanatory paragraphs, more metric cards, segmented controls, charts, ledgers, and stateful panels.
- Primary actions are high-contrast filled pills. Secondary actions are outlined pills or quiet text links.
- Avoid casino-style visuals and wording. Silver Pulse should feel like a daily forecast challenge, not a betting product.

## Core Tokens

```css
:root {
  --color-canvas: #080a0d;
  --color-ink: #f7f7f8;
  --color-graphite: #ffffff;
  --color-warm-mist: #211713;
  --color-terracotta: #f0a47a;
  --color-fog: #11161d;
  --color-muted-stone: #c6c9d1;
  --color-light-steel: #8f96a3;
  --color-hint-of-grey: #303844;
  --color-dusk-link: #a9afba;

  --surface-panel: #0d1117;
  --surface-elevated: #151b23;

  --font-sohne: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-signifier: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;

  --shadow-subtle:
    rgba(255, 255, 255, 0.07) 0 0 0 1px,
    rgba(0, 0, 0, 0.45) 0 22px 34px -18px,
    rgba(0, 0, 0, 0.35) 0 8px 12px -8px;
}
```

## Typography

- Body: `15px`, line-height `1.43`, `--font-sohne`, color `--color-ink`.
- Captions, labels, secondary metadata: `13px-14px`, color `--color-light-steel` or `--color-muted-stone`.
- H1: `clamp(38px, 5vw, 54px)`, line-height `1.05`, weight `600`.
- H2: `clamp(34px, 4vw, 44px)`, line-height `1.1`, weight `600`.
- H3/card titles: `22px`, line-height `1.18`, weight `500`.
- Keep letter spacing neutral.

## Layout

- Page width: `min(1280px, calc(100% - 40px))` on desktop.
- Mobile page width: `min(100% - 24px, 1280px)`.
- Top navigation is sticky, pill-shaped, translucent, and blurred.
- Main work areas use a two-column desktop layout:
  - Primary list/table/chart column.
  - Sticky detail/action panel on the right.
- Stack to one column below roughly `1080px`.
- Hide nonessential hero decoration on mobile and prioritize controls, metrics, and content.

## Components

### Top Bar

- Sticky at the top with rounded pill shape.
- Background: `rgba(13, 17, 23, 0.9)`.
- Use `backdrop-filter: blur(18px)`.
- Include brand, section links, live status/spot metric, and one primary CTA.

### Buttons

- Primary button: filled `--color-ink`, text `#080a0d`, pill radius `999px`, minimum height `42px`.
- Ghost button: transparent background, `1px` border in `--color-ink`, text `--color-ink`.
- Compact buttons may use `36px` height.

### Hero Band

- Use a compact, product-led hero.
- Rounded `24px`.
- Animated dark gradient using deep blue, dark warm brown, and canvas black.
- Fine texture grid overlay with very low opacity.
- Floating metric cards on desktop.
- Do not make the hero a generic marketing section.

### Cards And Panels

- Main panel: `--surface-panel`.
- Nested or active state: `--surface-elevated`.
- Secondary fields/cards: `--color-fog`.
- Main panel radius: `24px`.
- Inner card radius: `16px-20px`.
- Use `--shadow-subtle` on top-level cards and panels.

### Segmented Controls

- Container background: `--color-fog`.
- Container radius: `999px`.
- Padding: `4px`.
- Active segment background: `--surface-elevated`.
- Active segment text: `--color-ink`.

### Inputs

- Height: `48px`.
- Border: `1px solid --color-hint-of-grey`.
- Radius: `16px`.
- Background: `--color-fog`.
- Text: `--color-ink`.
- Focus border: `--color-ink`.

### Metrics And Charts

- Use metric cards instead of long descriptions.
- Chart panel background: `--surface-elevated` or `#111720`.
- Grid lines: low-opacity white.
- Threshold/reference lines: Terracotta with dashed stroke.
- Current value dot: `#67c7ff`.
- Threshold/settlement/alert value: `--color-terracotta`.

### Silver Pulse Specifics

- UP can use a restrained green accent: `#5fd69a`.
- DOWN can use a restrained red accent: `#ff7575`.
- These colors should only appear in prediction choices, sentiment bars, and result states.
- Do not use gambling, odds, casino, or betting visual language.

## Responsive Rules

- At `max-width: 1080px`, switch major grids to one column and remove sticky detail panels.
- At `max-width: 760px`, hide nav links, reduce page gutters, stack controls, and hide desktop-only hero metric decoration.
- Buttons and segmented controls must remain tappable with no clipped labels.

## Reference

- Primary implementation: `styles.css`
- Dual Investment page: `index.html`
- Silver Pulse page: `silver-pulse.html`
- Original visual brief: `C:\Users\s9222\Downloads\DESIGN (1).md`
