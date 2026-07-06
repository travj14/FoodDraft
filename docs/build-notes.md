# Build Notes (future)

> Nothing built yet. This is the plan for the live draft page.

## Goal

A small web page to run the live food draft with friends, **each on their own
device**, picking in real time.

## Core requirement: real-time multiplayer

Because everyone is on their own phone/laptop, we need shared live state:

- A player picks → **everyone's board updates instantly**.
- The board **enforces turn order** (snake) and **removes drafted foods** so no two
  people can grab the same item.
- Everyone can see **whose turn it is** and a running view of **each player's
  lineup**.

This means we need a **backend / real-time sync layer**, not just a static page.

## What the app needs to do

1. **Create a league / draft room** — host sets `teams` (default 10) and `rounds`
   (default 7), then shares a join link/code.
2. **Load the master pools** from `docs/food-pools.md` (7 tiers, one per round).
3. **On Start Draft, randomly build the board** — sample from each tier so this draft
   is unique (see algorithm below).
4. **Enforce draft rules** — snake order, one pick per round, current-tier-only,
   no duplicate foods.
5. **Show live state** — current pick, timer (optional), each player's lineup.
6. **Export results** — final lineups so the last-place loser's meal is on record.

## Start Draft: random pool selection

One flat pool, sampled from **all** foods across every tier. Every food is available on
every pick (no round gating). A draft uses only a random subset, so every draft differs.

```
buildPool(teams, rounds, poolSize, allFoods):
  target = poolSize > 0 ? poolSize : teams * (rounds + 1)   # default auto = 80
  n = min(len(allFoods), max(target, teams * rounds))       # enough to finish
  return sampleDistinct(allFoods, n)                        # shuffle, take first n
```

- Picking pulls from this one flat pool; a taken food is removed for everyone.
- Because the master list (~200 foods) far exceeds any pool, the sample is effectively
  unique every draft, and mostly-bad (most master items are 🤢 content).

## Draft order (host-editable, pre-draft)

- `seatMap`: array of length `teams`, each slot a human `memberId` or `null`.
- New joiners drop into the first open slot. The **owner drag-reorders** slots in the
  lobby (`order:set` event) — validated to be exactly the current humans, same length.
- On Start, each slot's human takes that seat; `null` slots become bots **in place**,
  preserving the owner's chosen order.

## Possible tech approaches (decide later)

- **Simplest real-time path:** a hosted realtime DB (e.g. Firebase Firestore or
  Supabase Realtime) + a lightweight frontend (plain JS or a small React app).
  No custom server code to maintain.
- **Own server:** Node + WebSockets for full control; more to build/host.
- **Cheap hosting:** static frontend on Vercel/Netlify/GitHub Pages, realtime state
  in the hosted DB.

## Data model sketch

- `Draft`: id, teams, rounds, seatMap[], members[], order[], currentOverall, status
- `seatMap`: length `teams`, each slot = human `memberId` | `null` (host-orderable)
- `Player`: id, name, lineup[] (their picks)
- `Pick`: draftId, overall, round, pickInRound, seat, item
- `FoodItem`: name, **quantity** (e.g. "4 McDonald's cheeseburgers"), **type**
  (`volume` | `content`), tier, taken flag. Rule: `content` items stay small-portioned;
  only `volume` (edible) items get big quantities.
- `MasterList`: all `FoodItem`s across every tier (source, never mutated)
- `Board`: one **flat** array — the randomly-sampled pool for *this* draft
  (mark taken/removed). All of it is draftable on every pick.

The UI should surface each item's **quantity and volume/content type** at pick time —
that trade-off is the entire draft strategy, so it can't be hidden in a tooltip.

## Open questions

- Web-only, or does it need to survive on mobile browsers well? (Own-device use =
  mobile-first.)
- Draft timer per pick, or untimed?
- Save past seasons / drafts, or one-and-done each year?
