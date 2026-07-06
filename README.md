# 🏈🤢 FoodDraft

A preseason ritual for a fantasy football league: draft a lineup of foods that
descends from *delicious* to *cursed*, and whoever finishes last in fantasy has
to **eat their entire drafted lineup** at the end of the season.

## The pitch

At the **start of the season** — before anyone knows who'll lose — the league runs
a **food draft**. It's a **7-round snake draft** where each round is a "misery tier":

- **Every pick is a punishment.** You're never drafting something *nice* — you're
  choosing your poison.
- Each round descends in overall misery: warm-up → heavy → canned/cold → **condiment
  hell** → fish/organs/fermented → weird & cursed → **final boss** (surströmming,
  natto, century egg).
- You can **only pick from the current round's pool**, so nobody loads up on
  chicken nuggets.
- Everyone ends the draft with a **unique 7-food lineup** (one per round).

Then the season plays out. The **last-place finisher eats their own lineup.**

## A different draft every time

The food lists are big **master pools**. When you hit **Start Draft**, the app
**randomly picks** the foods for that draft — enough to fill every pick plus one extra
round of buffer (for a 10-team, 7-round draft that's **80 foods**: 70 drafted + 10
spare so the last picker still has a choice). Because the pools hold far more than any
one draft uses, **no two drafts are ever the same.**

## The core tension: volume vs. content

Most items in every round are **bad** — but bad in one of two ways, and the drafter
has to choose:

- **Volume** — a genuinely edible/good food at a *punishing quantity* (5 McDonald's
  cheeseburgers, a pound of mac and cheese, 24 nuggets). Tastes fine. Getting it all
  down is the problem. **Only edible foods get big quantities.**
- **Content** — an inherently unpleasant food at a *normal or small quantity* (one
  whole raw onion, one jar of banana baby food, 2 oz of mayonnaise). One bite is the
  problem. Gross foods stay small — the nastiness does the work, not the volume.

So every pick is a gut-check: *"Can I out-eat my stomach, or out-tough my gag
reflex?"* Quantities are part of the draft board and are set before the draft.

## Why it's better than picking the punishment later

You're making **blind strategic bets in August**: *"I can handle sardines, so I'll
grab them over the liverwurst."* You might be drafting your own punishment and not
know it. The draft itself becomes the event.

## What we're building

A **small web page to run the live draft** with friends, each on their own device,
picking in real time. See [`docs/build-notes.md`](docs/build-notes.md) for the
planned approach.

## Running the app

Two dev servers — a Node/Socket.IO backend (`server/`, port **4100**) and a Vite +
React frontend (`web/`, port **5173**).

```bash
# one-time
npm install                 # root (concurrently)
npm install --prefix server
npm install --prefix web

# run both at once
npm run dev                 # backend :4100 + frontend :5173

# or separately
npm run server              # backend only
npm run web                 # frontend only
```

Then open **http://localhost:5173**, create an account, and either **Start a mock
draft** (drafts vs. bots immediately) or **Create a league**, share the code, and run
the real thing.

## What's built (MVP)

- **Auth** — username/password (bcrypt + JWT).
- **Lobby** — create a league (get a share code), join by code, or spin up a mock draft.
- **Live draft room, Sleeper-styled** — colored snake board grid, on-the-clock
  highlight, one **flat food pool** (all foods draftable every pick), searchable +
  🍔/🤢 filterable list, **queue** (reorder/remove), roster + chat tabs, **auto-pick**
  toggle.
- **Editable draft order** — the owner **drag-and-drops** the draft order in the lobby
  before starting; empty slots become bots in place.
- **Draft engine** — snake order, one random pool sampled from the whole master list on
  start (host-set pool size, default `teams × (rounds+1)`), per-pick timer, **bots
  autofill empty seats**, auto-pick from your queue, owner **Start / Pause / Resume**,
  and **overnight sleep-break** windows that freeze the clock.
- **Customizable settings** — teams, rounds, pick clock, pool size, break window.

## Contents

- [`docs/food-pools.md`](docs/food-pools.md) — the tiered food lists (the master pools)
- [`docs/rules.md`](docs/rules.md) — draft format, portion sizes, and safety rules
- [`docs/build-notes.md`](docs/build-notes.md) — architecture & data model
- `server/` — Node + Express + Socket.IO backend (draft engine, auth, rooms)
- `web/` — React + Vite frontend (lobby + Sleeper-style draft room)

> Status: **MVP built and running.** Verified end-to-end: a full mock draft (humans +
> bots, snake order, timers, completion) runs correctly.
