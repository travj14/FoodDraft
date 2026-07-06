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

## Start Draft: random board selection

The tier lists are **master pools**; a draft uses only a random subset, so every draft
is different.

```
buildBoard(teams, rounds, masterPools):
  totalTarget = teams * (rounds + 1)        # e.g. 10 * 8 = 80
  perRound    = distribute(totalTarget, rounds)   # even split, remainder to early rounds
                                                  # 80 over 7 rounds -> [12,12,12,11,11,11,11]
  board = {}
  for r in 1..rounds:
    pool = masterPools[tier r]
    board[r] = sampleDistinct(pool, min(perRound[r], len(pool)))   # random, no repeats
  return board
```

- `perRound` must be **≥ teams** for every round (so everyone can pick); the `+1 round`
  of buffer guarantees a cushion above that.
- `sampleDistinct` = shuffle the pool, take the first N. No item appears twice on the
  board.
- Because each pool (~28–31 items) is far larger than `perRound` (~11–12), the number
  of possible boards is astronomical → **effectively unique every draft.**
- Reroll option: let the host regenerate the board before the first pick if they want a
  different set.

## Possible tech approaches (decide later)

- **Simplest real-time path:** a hosted realtime DB (e.g. Firebase Firestore or
  Supabase Realtime) + a lightweight frontend (plain JS or a small React app).
  No custom server code to maintain.
- **Own server:** Node + WebSockets for full control; more to build/host.
- **Cheap hosting:** static frontend on Vercel/Netlify/GitHub Pages, realtime state
  in the hosted DB.

## Data model sketch

- `Draft`: id, teams, rounds, players[], currentRound, currentPickIndex,
  snakeDirection, status
- `Player`: id, name, lineup[] (one food per round)
- `Pick`: draftId, round, playerId, foodName, timestamp
- `FoodItem`: name, **quantity** (e.g. "4 McDonald's cheeseburgers"), **type**
  (`volume` | `content`), taken flag. Rule: `content` items stay small-portioned;
  only `volume` (edible) items get big quantities.
- `MasterPools`: tier → full list of `FoodItem` (source, never mutated)
- `Board`: round → the randomly-sampled `FoodItem`s for *this* draft (mark taken/removed)

The UI should surface each item's **quantity and volume/content type** at pick time —
that trade-off is the entire draft strategy, so it can't be hidden in a tooltip.

## Open questions

- Web-only, or does it need to survive on mobile browsers well? (Own-device use =
  mobile-first.)
- Draft timer per pick, or untimed?
- Save past seasons / drafts, or one-and-done each year?
