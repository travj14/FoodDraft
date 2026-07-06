# Food Pools (master list)

Seven tiers of foods. **These organize the master list — they are no longer one tier
per round.** On **Start Draft**, the app samples a single **flat pool** from *all* of
these foods combined; every food in that pool is available on **every** pick (no
round gating). The host sets how many foods the pool holds. Tiers still drive the
🍔 volume / 🤢 content flavor and the food-list filter, and keep the master list
mostly-bad. See [Random selection](#random-selection-on-start-draft) below.

## How to read this

Every item is a **food + a fixed quantity**, tuned so the pick is a real punishment.
The type tells you *why* it hurts:

- 🍔 **Volume** — tastes fine, but the amount is brutal. *Only good/edible foods get
  big quantities.*
- 🤢 **Content** — it's inherently nasty, so the portion stays **normal or small**.
  The grossness does the work, not the volume. (No cup-of-mayo cruelty.)

Rounds ramp up in overall misery, but the volume/content choice exists in every
round. **Most items in every tier are bad.**

Every entry is tuned to be a genuine punishment: edible/bland foods get real volume
(a whole loaf of dry bread, not 3 slices), while truly gross foods stay small.

> **Source of truth:** the live quantities the app uses live in
> [`server/src/foods.js`](../server/src/foods.js). The tables below are illustrative
> and may lag the latest tuning.

---

## Random selection (on Start Draft)

- A draft is **`rounds` rounds** (default **7**) for **`teams` teams** (default **10**).
- The host sets the **pool size**. Default is **auto** = `teams × (rounds + 1)` — enough
  to fill every pick plus a round of cushion (10 × 8 = **80 foods**). Minimum is
  `teams × rounds` so the draft can finish.
- The pool is one **flat, random sample of all foods below** (every tier combined).
  **All of it is available on every pick** — no round gating.
- Because the master list holds far more foods than any single draft uses, the sampled
  pool is **unique every time.**

See [`build-notes.md`](build-notes.md) for the exact algorithm.

---

## Tier 1 — Warm-up (Round 1)

The "easy" round. Mostly 🍔 volume — good food, punishing amounts.

| Item | Quantity | Type |
| --- | --- | --- |
| McDonald's cheeseburger | 4 | 🍔 |
| Chicken nuggets | 20 | 🍔 |
| Pizza | 4 slices | 🍔 |
| Mozzarella sticks | 10 | 🍔 |
| Corn dog | 3 | 🍔 |
| Grilled cheese | 3 sandwiches | 🍔 |
| Mac and cheese | 1 lb | 🍔 |
| Soft pretzel | 3 | 🍔 |
| Tater tots | 1 lb | 🍔 |
| Chicken wings | 15 | 🍔 |
| Chicken tenders | 8 | 🍔 |
| Quesadilla | 2 | 🍔 |
| Mini tacos | 12 | 🍔 |
| Burrito | 2 | 🍔 |
| Fried chicken | 6 pieces | 🍔 |
| Meatball sub | 2 | 🍔 |
| Philly cheesesteak | 2 | 🍔 |
| Pizza rolls | 30 | 🍔 |
| Loaded fries | 1 lb | 🍔 |
| Nachos | 1 lb | 🍔 |
| Garlic bread | 8 slices | 🍔 |
| French toast | 6 slices | 🍔 |
| Pancakes | 8 | 🍔 |
| Waffle | 5 | 🍔 |
| Cinnamon roll | 5 | 🍔 |
| Donut | 6 | 🍔 |
| Hash browns | 1 lb | 🍔 |
| Bacon | 15 strips | 🍔 |
| Breakfast sandwich | 3 | 🍔 |
| Raw white onion | ½ onion | 🤢 |
| Plain dry white bread | 3 slices | 🤢 |

## Tier 2 — Heavy & Greasy (Round 2)

Volume gets heavier and greasier; the first real 🤢 options show up.

| Item | Quantity | Type |
| --- | --- | --- |
| Chili cheese fries | 1 lb | 🍔 |
| Loaded baked potato | 3 | 🍔 |
| Biscuits and gravy | 4 biscuits | 🍔 |
| Fettuccine Alfredo | 1 lb | 🍔 |
| Meatloaf | 1 lb | 🍔 |
| Fried fish | 4 fillets | 🍔 |
| Onion rings | 1 lb | 🍔 |
| Country fried steak | 2 | 🍔 |
| Sloppy joe | 3 | 🍔 |
| Lasagna | 1 lb | 🍔 |
| Beef stew | 16 oz | 🍔 |
| Shepherd's pie | 16 oz | 🍔 |
| Chicken pot pie | 2 | 🍔 |
| Sausage gravy | 12 oz | 🍔 |
| Cheese curds | 1 lb | 🍔 |
| Deep-fried ravioli | 12 | 🍔 |
| Stuffed crust pizza | 4 slices | 🍔 |
| Pulled pork mac and cheese | 1 lb | 🍔 |
| Blooming onion | 1 portion | 🍔 |
| Chili dog | 3 | 🍔 |
| Fried pickles | 10 | 🍔 |
| Tuna melt | 2 | 🤢 |
| Egg salad sandwich | 2 | 🤢 |
| Jalapeño poppers | 4 | 🤢 |
| Cold canned baked beans | 4 oz | 🤢 |
| Hard-boiled eggs | 2 | 🤢 |
| Sauerkraut | 3 oz | 🤢 |
| Whole raw onion | 1 | 🤢 |

## Tier 3 — Bland, Canned & Cold (Round 3)

A few 🍔 "fine but rough in bulk" picks; the rest is small-portion 🤢 canned dread.

| Item | Quantity | Type |
| --- | --- | --- |
| Tomato soup | 24 oz | 🍔 |
| Oatmeal (plain) | 24 oz | 🍔 |
| Mashed potatoes | 1 lb | 🍔 |
| Grits (plain) | 24 oz | 🍔 |
| Plain Greek yogurt | 16 oz | 🍔 |
| Cottage cheese | 4 oz | 🤢 |
| Canned ravioli | 4 oz | 🤢 |
| Canned spaghetti | 4 oz | 🤢 |
| Canned chili | 4 oz | 🤢 |
| Refried beans | 3 oz | 🤢 |
| Creamed corn | 3 oz | 🤢 |
| Clam chowder | 6 oz | 🤢 |
| Broccoli cheddar soup | 8 oz | 🤢 |
| Canned chicken noodle soup | 8 oz | 🤢 |
| Deviled eggs | 2 | 🤢 |
| Coleslaw | 3 oz | 🤢 |
| Potato salad | 3 oz | 🤢 |
| Macaroni salad | 3 oz | 🤢 |
| Tuna salad | 3 oz | 🤢 |
| Baked beans | 4 oz | 🤢 |
| Pickled beets | 3 oz | 🤢 |
| Canned peas | 3 oz | 🤢 |
| Canned carrots | 3 oz | 🤢 |
| Stuffing | 4 oz | 🤢 |
| Rice pudding | 4 oz | 🤢 |
| Tapioca pudding | 4 oz | 🤢 |
| Applesauce | 4 oz | 🤢 |
| Canned green beans | 3 oz | 🤢 |
| Canned mushrooms | 3 oz | 🤢 |

## Tier 4 — Condiment Hell (Round 4)

Pure content. No food, just the sauce — small portions so it's brutal, not a joke.

| Item | Quantity | Type |
| --- | --- | --- |
| Mayonnaise | 2 oz | 🤢 |
| Miracle Whip | 2 oz | 🤢 |
| Yellow mustard | 2 oz | 🤢 |
| Dijon mustard | 2 oz | 🤢 |
| Horseradish sauce | 1 oz | 🤢 |
| Tartar sauce | 2 oz | 🤢 |
| Cocktail sauce | 2 oz | 🤢 |
| Ranch dressing | 2 oz | 🤢 |
| Blue cheese dressing | 2 oz | 🤢 |
| Caesar dressing | 2 oz | 🤢 |
| Thousand Island dressing | 2 oz | 🤢 |
| Russian dressing | 2 oz | 🤢 |
| Relish | 2 oz | 🤢 |
| Pickle juice | 3 oz | 🤢 |
| Olive brine | 2 oz | 🤢 |
| Jalapeño juice | 2 oz | 🤢 |
| Sauerkraut juice | 2 oz | 🤢 |
| Sour cream | 2 oz | 🤢 |
| Cream cheese | 2 oz | 🤢 |
| Nacho cheese | 2 oz | 🤢 |
| Cheese sauce | 2 oz | 🤢 |
| Gravy | 3 oz | 🤢 |
| Hummus | 3 oz | 🤢 |
| Pesto | 2 oz | 🤢 |
| Ketchup | 2 oz | 🤢 |
| Barbecue sauce | 2 oz | 🤢 |
| Seafood sauce | 2 oz | 🤢 |
| Ricotta cheese | 3 oz | 🤢 |
| Wet scrambled eggs | 2 eggs | 🤢 |

## Tier 5 — Fish, Organs & Fermented (Round 5)

Almost entirely content — canned fish, organs, fermented things, aggressive cheeses.
Small bites.

| Item | Quantity | Type |
| --- | --- | --- |
| Canned tuna | ½ can | 🤢 |
| Canned chicken | 3 oz | 🤢 |
| Vienna sausages | 3 | 🤢 |
| Spam | 2 slices | 🤢 |
| Liverwurst | 2 oz | 🤢 |
| Potted meat | 1 can | 🤢 |
| Sardines (in water) | ½ tin | 🤢 |
| Sardines in mustard | ½ tin | 🤢 |
| Anchovy fillets | 4 | 🤢 |
| Smoked oysters | 4 | 🤢 |
| Canned salmon | 3 oz | 🤢 |
| Imitation crab | 3 oz | 🤢 |
| Pickled herring | 3 oz | 🤢 |
| Gefilte fish | 1 piece | 🤢 |
| Canned mackerel | 3 oz | 🤢 |
| Canned corned beef | 3 oz | 🤢 |
| Beef liver | 3 oz | 🤢 |
| Chicken liver | 3 oz | 🤢 |
| Blood sausage | 3 oz | 🤢 |
| Head cheese | 2 oz | 🤢 |
| Scrapple | 3 oz | 🤢 |
| Pickled pigs' feet | 1 | 🤢 |
| Pickled eggs | 2 | 🤢 |
| Cold hot dogs | 2 | 🤢 |
| Natto | 1 pack | 🤢 |
| Kimchi | 3 oz | 🤢 |
| Blue cheese | 2 oz | 🤢 |
| Goat cheese | 2 oz | 🤢 |
| Limburger cheese | 2 oz | 🤢 |
| Plain tofu | 3 oz | 🤢 |

## Tier 6 — Weird & Cursed (Round 6)

Baby food, sweet horrors, and deliberately vile combinations. All 🤢, all small.

| Item | Quantity | Type |
| --- | --- | --- |
| Banana baby food | 1 jar | 🤢 |
| Pea baby food | 1 jar | 🤢 |
| Turkey baby food | 1 jar | 🤢 |
| Prune baby food | 1 jar | 🤢 |
| Ham baby food | 1 jar | 🤢 |
| Molasses | 1 oz | 🤢 |
| Black licorice | 3 oz | 🤢 |
| Circus peanuts | 6 | 🤢 |
| Maraschino cherries | 12 | 🤢 |
| Candy corn | 4 oz | 🤢 |
| Peanut butter + pickle sandwich | 1 | 🤢 |
| Mayonnaise + banana sandwich | 1 | 🤢 |
| Sardine + cream cheese cracker stack | 3 | 🤢 |
| Spam + marshmallow fluff sandwich | 1 | 🤢 |
| Cottage cheese + mustard bowl | 3 oz | 🤢 |
| Hot dog dipped in peanut butter | 1 | 🤢 |
| Canned tuna + maple syrup bowl | 3 oz | 🤢 |
| Sauerkraut + whipped cream | 3 oz | 🤢 |
| Oatmeal + ranch | 4 oz | 🤢 |
| Banana + mayonnaise | 1 | 🤢 |
| Deviled egg + chocolate syrup | 2 | 🤢 |
| Pickled herring + Nutella toast | 1 | 🤢 |
| Blue cheese + chocolate syrup | 2 oz | 🤢 |
| Hard-boiled egg with jelly | 2 | 🤢 |
| Rice pudding with hot sauce | 3 oz | 🤢 |
| Mac and cheese with applesauce mixed in | 4 oz | 🤢 |
| Baked beans with frosting | 3 oz | 🤢 |
| Anchovy peanut butter toast | 1 | 🤢 |
| Sardine and banana sandwich | 1 | 🤢 |
| Tuna and applesauce bowl | 3 oz | 🤢 |

## Tier 7 — Final Boss (Round 7)

The nastiest content in the game — still **small portions**, because the grossness is
the whole point.

| Item | Quantity | Type |
| --- | --- | --- |
| Surströmming (outdoors, handled properly) | 1 fillet | 🤢 |
| Natto | 1 pack | 🤢 |
| Century egg | 1 | 🤢 |
| Fermented tofu | 2 oz | 🤢 |
| Pickled pigs' feet | 1 | 🤢 |
| Head cheese | 2 oz | 🤢 |
| Blood sausage | 3 oz | 🤢 |
| Beef liver | 3 oz | 🤢 |
| Chicken liver | 3 oz | 🤢 |
| Canned squid in ink | 3 oz | 🤢 |
| Canned octopus | 3 oz | 🤢 |
| Whole sardines | 1 tin | 🤢 |
| Anchovy fillets | 5 | 🤢 |
| Pickled herring | 3 oz | 🤢 |
| Smoked oysters | 5 | 🤢 |
| Canned mackerel | 3 oz | 🤢 |
| Limburger cheese | 2 oz | 🤢 |
| Liver pâté | 2 oz | 🤢 |
| Potted meat | 1 can | 🤢 |
| Prune baby food | 1 jar | 🤢 |
| Turkey baby food | 1 jar | 🤢 |
| Ham baby food | 1 jar | 🤢 |
| Whole raw onion | 1 | 🤢 |
| Raw garlic cloves | 3 | 🤢 |
| Horseradish | 1 oz | 🤢 |
| Whole lemon | 1, eaten whole | 🤢 |
| Wasabi | 1 tbsp | 🤢 |
| Anchovy paste | 1 oz | 🤢 |
| Feta | 3 oz | 🤢 |
| Sardines in mustard | 1 tin | 🤢 |

---

### Balancing tips

- **Big quantities are only for 🍔 volume (edible) foods.** Anything 🤢 stays at a
  normal or small portion — a whole raw onion is plenty; a cup of mayo is just mean.
- Each tier holds ~28–31 items but a draft only samples ~11–12 per round, so there are
  millions of possible boards — **every draft is effectively unique.**
- Want even more variety? Add items to any tier. The more you add, the more unique
  each draft becomes. Keep the volume/content rule when you do.
