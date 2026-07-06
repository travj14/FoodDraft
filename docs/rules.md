# Rules

## Draft format

- **Snake draft**, **7 rounds** by default, for **10 teams** (both configurable).
- **Round N draws only from Tier N's pool.** No cross-round picking.
- Everyone drafts **one item per round**, so each player ends with a **unique
  7-food lineup**.
- Once a food is taken, it's gone — nobody else can draft it.

### Snake order

Round 1 goes 1→N, Round 2 goes N→1, Round 3 goes 1→N, and so on. This keeps the
early "warm-up tier" picks fair.

## Random board (on Start Draft)

The tier lists in [`food-pools.md`](food-pools.md) are **master pools**, not the board.
When the host clicks **Start Draft**, the app builds *this* draft's board by randomly
sampling from those pools:

- The board holds **`teams × (rounds + 1)`** foods — enough to fill every pick, **plus
  one extra round** of buffer so even the last drafter in a round still has a choice.
  → 10 teams × (7 + 1) = **80 foods** (70 picked + 10 buffer).
- Foods are drawn **one tier per round**: each round gets ~`teams + buffer` distinct
  items randomly sampled from that round's master pool.
- Because each pool holds far more items than a draft uses, **every draft is a unique
  board.** Same league, same rules, brand-new set of horrors each year.

Exact selection algorithm lives in [`build-notes.md`](build-notes.md).

## Quantity is part of the pick — volume vs. content

Every draftable item is a **food + a fixed quantity**, and that quantity is *the
whole game*. Each item is a punishment in one of two ways:

- 🍔 **Volume** — a genuinely edible food at a brutal amount (5 McDonald's burgers,
  a pound of mac and cheese). The taste is fine; the *quantity* is the punishment.
  Big quantities are **only** for foods that actually taste fine.
- 🤢 **Content** — an inherently nasty food at a **normal or small** amount (one whole
  raw onion, a jar of banana baby food, 2 oz of mayo). One bite is the punishment, so
  the portion stays small — no cup-of-mayo cruelty.

So drafting is a gut-check on nearly every pick: **can you out-eat your stomach, or
out-tough your gag reflex?** The full board with per-item quantities lives in
[`food-pools.md`](food-pools.md).

**Lock all quantities BEFORE the draft** so nobody argues later. Rules of thumb if
you add your own items:

| Item type        | Baseline portion     |
| ---------------- | -------------------- |
| "Good" food (volume) | 3–5× a normal serving |
| Sandwich / sub   | 1 full sandwich (×N for volume) |
| Canned item      | 1 standard can       |
| Condiment        | 3–4 oz               |
| Cheese           | 4 oz                 |
| Baby food        | 1 jar                |
| Whole raw item   | 1 whole item         |

## Eating the lineup (for the last-place finisher)

- Must eat the **entire 7-food lineup**.
- **Time limit: ~4 hours** to finish everything.

## Safety rules (non-negotiable)

- **No vomiting-and-continuing** — if it comes back up, that's it, no forcing more.
- **No capsaicin / hot-sauce extracts** or other "challenge" heat products.
- **No raw or unsafe meat.** Anything perishable must be handled and stored safely.
- **Allergy substitutions allowed** — swap for a comparable-tier item.
- **Final-boss items** (e.g., surströmming) must be handled properly and, where
  relevant, eaten outdoors. Only source specialty items (century egg, etc.) from
  reputable food sellers.
