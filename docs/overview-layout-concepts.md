# Overview Page — 3 Layout Concepts

---

## Concept 1: Command Center
**Emotion:** Serious, operational, real-time. For the power user who lives in the dashboard.

**Theme:** Deep dark mode with controlled accent glow. Background: `#0f1117` with subtle grid. Surface: `#1a1d27`. Accent: cyan-400 (`#22d3ee`).

**Layout structure (single viewport, no scroll for KPI section):**

```
┌──────────────────────────────────────────────────────┐
│ [Section label: SALES OVERVIEW]                       │
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                  │
│ │ KSh   │ │ 48   │ │ 3    │ │ 247  │                  │
│ │ 12,400│ │items │ │low   │ │total │                  │
│ │Sales  │ │sold  │ │stock │ │prods │                  │
│ │ today │ │today │ │alerts│ │      │                  │
│ │ ▲ +8% │ │ ▲ 12 │ │ ● ok │ │ ●  — │                  │
│ └──────┘ └──────┘ └──────┘ └──────┘                  │
│                                                        │
│ [Section label: PERFORMANCE]                           │
│ ┌────────────────────────┬───────────────────────────┐│
│ │  Weekly Sales Chart    │  Top Products             ││
│ │                        │  ┌─────────────────────┐  ││
│ │   ▄ ▄   ▄ ▄ ▄          │  │ #1 Power Bank   ████│  ││
│ │  █ █ █ █ █ █ █ █       │  │ #2 HDMI Cable   ███ │  ││
│ │  █ █ █ █ █ █ █ █ █     │  │ #3 Bluetooth    ██  │  ││
│ │  M  T  W  T  F  S  S   │  │ #4 Webcam       █   │  ││
│ │  [week/month toggle]   │  └─────────────────────┘  ││
│ └────────────────────────┴───────────────────────────┘│
│                                                        │
│ [Section label: WEBSITE ANALYTICS] (only if hasWebsite)│
│ ┌──────────────────────┬─────────────────────────────┐│
│ │ Slow Moving Stock    │ ┌──────┐ ┌──────┐           ││
│ │ (product list with   │ │14.2K │ │ 342  │           ││
│ │ progress bars)       │ │Total │ │Today │           ││
│ │                      │ │Views │ │Views │           ││
│ └──────────────────────┘ ├──────┤ ├──────┤           ││
│                          │  /   │ │  5   │           ││
│                          │Most  │ │Pages │           ││
│                          │Viewed│ │      │           ││
│                          └──────┘ └──────┘           ││
│ ┌───────────────┬───────────────┬──────────────────┐  ││
│ │Most Viewed    │Traffic        │Top Viewed         │  ││
│ │Pages          │Sources        │Products           │  ││
│ │/about    45%  │● Insta  52%   │Power Bank    100% │  ││
│ │/pricing  32%  │● Direct 28%   │Cable         72%  │  ││
│ │/contact  20%  │● Google 15%   │Charger       45%  │  ││
│ └───────────────┴───────────────┴──────────────────┘  ││
│ └──────────────────────┴─────────────────────────────┘│
└──────────────────────────────────────────────────────┘
```

**Key details:**
- Section labels: `text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-500 mb-2` — subtle, doesn't compete with content
- Stat cards: No colored backgrounds. Solid `bg-[#1a1d27]` with thin `border-white/5`. Value is 24px bold, label is 11px muted. Mini trend arrow (green up/red down) in top-right corner
- Chart: Clean, no gridlines. Area fill with low-opacity cyan gradient. Legend minimal
- Top products: Horizontal stacked bar chart — label on left, percent bar on right, clean monospace percentages
- Website analytics section: Only renders when `hasWebsite` is true. The three detail cards (Pages, Sources, Products) are equal-width bento cells
- Spacing: 24px between sections, 16px card padding
- Scroll: Full page scrolls. KPI row is visible above fold

**When this layout works:** User checks dashboard multiple times daily, wants maximum density, dark environment preference.

---

## Concept 2: Contextual Journal
**Emotion:** Calm, reflective, guided. For the user who opens the dashboard weekly to understand their business story.

**Theme:** Pristine light mode. Background: `#f8f6f3` (warm off-white). Surface: `#ffffff` with `border-slate-200`. Accent: emerald-600 (`#059669`).

**Layout structure:**

```
┌──────────────────────────────────────────────────────┐
│                                                        │
│  [Section heading: small dashboard icon + "Your        │
│   store earned KSh 12,400 today"]                      │
│  Subheading: "3 items need restocking · 48 units       │
│   sold" — all inline, no stat cards                    │
│                                                        │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
│                                                        │
│  [Section heading: "Weekly Revenue"]                    │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Full-width area chart                            │  │
│  │  Smooth line, warm gradient fill                  │  │
│  │  Subtle dots on data points                       │  │
│  │  X-axis: day names, Y-axis: hidden                │  │
│  │  [week/month] toggle in top-right                 │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  [Section heading: "Top Products"]                      │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                  │
│  │Power │ │HDMI  │ │Blue- │ │Webcam│                  │
│  │Bank  │ │Cable │ │tooth │ │      │                  │
│  │12% ↑ │ │8% ↑  │ │5% ↑  │ │3% ↑  │                  │
│  └──────┘ └──────┘ └──────┘ └──────┘                  │
│  4 clean stat cards with soft green borders             │
│                                                        │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
│                                                        │
│  [Section heading: "Website Analytics"]                 │
│  (only if hasWebsite)                                   │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  "14,287 total visits" (giant number)             │  │
│  │  "342 visited today"                              │  │
│  │  Subdued text, center-aligned                     │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ┌───────────────┬───────────────┬──────────────────┐  │
│  │ Pages         │ Sources       │ Products         │  │
│  │ /about   45%  │ Instagram 52% │ Power Bank  100% │  │
│  │ /pricing 32%  │ Direct    28% │ HDMI Cable  72% │  │
│  │ /contact 20%  │ Google    15% │ Bluetooth   45% │  │
│  └───────────────┴───────────────┴──────────────────┘  │
│  3 equal cards with simple bar charts                  │
│                                                        │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Slow Moving Stock                                │  │
│  │  Compact product list with days-unsold badge      │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
└──────────────────────────────────────────────────────┘
```

**Key details:**
- No "KPI cards" section — top metrics are written as a narrative sentence. This is the defining difference
- Section headings: `text-sm font-semibold text-slate-800` with 32px margin-top, 16px margin-bottom
- Thin horizontal rule (`border-slate-200`) separates major groups
- Chart: Warm emerald gradient area fill, smooth curve, minimal axis. Elevated with subtle shadow
- Top products: Simple cards with growth percentage, green trend arrow
- Website section: Hero stat centered (big number), detail cards below
- Spacing: 48px between groups, lots of breathing room. Content feels unhurried
- Card borders: `border border-slate-200`, no shadows except chart

**When this layout works:** User wants a quick pulse check, not deep monitoring. Prefers reading a story to scanning a grid. Light mode user.

---

## Concept 3: Bento Analytics
**Emotion:** Modern, premium, curated. For the user who values design as much as data — feels like a high-end SaaS product.

**Theme:** Quiet premium neutral. Background: `#fafafa`. Surface mix: white + `#f5f5f4` (stone-50). Accent: violet-500 (`#8b5cf6`). Dark mode alternative: deep charcoal `#0c0c0d` with warm zinc surfaces.

**Layout structure (asymmetric bento grid):**

```
┌──────────────────────────────────────────────────────┐
│                                                        │
│ ┌──────────────────────┬──────────────┬──────────────┐ │
│ │ TODAY'S REVENUE      │ Items Sold   │ Low Stock    │ │
│ │                        │              │              │ │
│ │  KSh 12,400           │ 48           │ 3            │ │
│ │                        │              │              │ │
│ │ ▲ 8% from yesterday   │ ▲ 12 units   │ Needs        │ │
│ │                        │              │ attention    │ │
│ │ [large, spans 2 cols]  │              │              │ │
│ └──────────────────────┴──────────────┴──────────────┘ │
│                                                        │
│ ┌──────────────────────┬──────────────────────────────┐│
│ │  WEEKLY CHART        │  TOP PRODUCTS                ││
│ │  (Line + bar hybrid) │                              ││
│ │                      │  #1 Power Bank    ██████████ ││
│ │   ╱╲   ╱╲            │  #2 HDMI Cable    ████████   ││
│ │  ╱  ╲ ╱  ╲          │  #3 Bluetooth     ██████     ││
│ │ ╱    ╲    ╲ ╱╲      │  #4 Webcam         ████     ││
│ │                      │                              ││
│ │  M  T  W  T  F  S  S│  [profit margin chips]       ││
│ │                      │  +12%  +8%  +5%  +3%         ││
│ └──────────────────────┴──────────────────────────────┘│
│                                                        │
│ ┌──────────────────────┬──────────────────────────────┐│
│ │  SLOW MOVING STOCK   │  WEBSITE ANALYTICS · 14.2K   ││
│ │                      │                              ││
│ │  Product A — 45 days │  ┌──────┐ ┌──────┐ ┌──────┐ ││
│ │  Product B — 30 days │  │Pages │ │Traff │ │Prod  │ ││
│ │  Product C — 22 days │  │45%   │ │52%   │ │100%  │ ││
│ │                      │  │32%   │ │28%   │ │72%   │ ││
│ │  [compact status list]│  └──────┘ └──────┘ └──────┘ ││
│ └──────────────────────┴──────────────────────────────┘│
│                                                        │
└──────────────────────────────────────────────────────┘
```

**Key details:**
- Revenue stat card spans 2 columns, uses large type (`text-3xl font-bold`), subtle bg tint (`bg-violet-50 dark:bg-violet-500/5`)
- Other KPI cards are compact, 1 column, no background tint, just value + label
- Chart uses accent color for line, muted area fill. No legend, cleaner
- Top products: horizontal bars with gradient fills. Profit margin chips inline after product names
- Slow-moving stock: Compact list format, not cards. Days-unsold as colored badge (amber >14d, red >30d)
- Website analytics: Combined into a single wider card that shows total views as the heading number + three mini bar cards inline below
- All cards: `rounded-2xl`, `shadow-sm`, `border border-black/[0.04] dark:border-white/[0.06]`
- Spacing: 20px grid gap, 16px internal padding
- No visible section headings — each card's title acts as its own section label

**When this layout works:** User appreciates design, values glanceability. The layout reveals hierarchy through size and position, not labels. Good for both light and dark mode.

---

## Implementation Notes

All three concepts:
- Assume the `hasWebsite` gating — website analytics cards only render when `websiteUrl` is set
- Place `SlowMovingStock` within the website section (it's inventory adjacen
- Use the same data source (`get_dashboard_summary` RPC) — just different presentatio
- Are mobile-responsive: stack to single column on small screens, keeping the same emotional intent
- Keep the time range toggle (week/month) on the chart in all concepts

| Concept | Best for | Theme | Density | Complexity |
|---|---|---|---|---|
| Command Center | Daily power users | Dark | High | Medium |
| Contextual Journal | Weekly pulse checkers | Light | Low | Low |
| Bento Analytics | Design-conscious owners | Light/Dark | Medium | Medium-High |
