# Rules

## Draft format

- **Snake draft**, **7 rounds** by default, for **10 teams** (both configurable).
- **One flat food pool — every food is available on every pick.** There is no
  round-by-round tier gating; you can draft any remaining food at any time.
- Everyone drafts **one food per pick**, ending with a **unique lineup**.
- Once a food is taken, it's gone — nobody else can draft it.

### Snake order

Round 1 goes 1→N, Round 2 goes N→1, Round 3 goes 1→N, and so on.

### Draft order (host-editable)

Before the draft, the **room owner can drag-and-drop the draft order** in the lobby.
Empty slots are auto-filled with bots on start, keeping the owner's chosen positions.

## Random pool (on Start Draft)

The tier lists in [`food-pools.md`](food-pools.md) are the **master list** the pool is
drawn from. When the host clicks **Start Draft**, the app randomly samples a single
flat pool from *all* foods across every tier:

- The **host sets the pool size** (how many foods). Default is **auto** =
  `teams × (rounds + 1)` — enough to fill every pick plus a round of cushion
  (10 teams, 7 rounds → 80 foods). Minimum is `teams × rounds` so the draft can finish.
- The pool is sampled from the **whole master list**, so it's naturally mostly-bad
  (most master items are 🤢 content) and **different every draft.**
- Tiers now only **organize/flavor** the master list and drive the 🍔/🤢 filter in the
  food list — they no longer decide which round a food belongs to.

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
