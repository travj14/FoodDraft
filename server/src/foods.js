// Master food pools — 7 tiers.
// t: 'v' = volume (edible, big portion),  'c' = content (gross, small portion)
// Portions are tuned so every entry is a genuine punishment: edible/bland foods get
// real volume (taste isn't the barrier); truly gross foods stay small (one serving
// is the punishment — no need to go vulgar).

const TIERS = [
  {
    name: 'Warm-up',
    items: [
      ['McDonald’s cheeseburger', '5', 'v'], ['Chicken nuggets', '20', 'v'],
      ['Pizza', '6 slices', 'v'], ['Mozzarella sticks', '10', 'v'],
      ['Corn dog', '4', 'v'], ['Grilled cheese', '3 sandwiches', 'v'],
      ['Mac and cheese', '1 lb', 'v'], ['Soft pretzel', '3', 'v'],
      ['Tater tots', '1 lb', 'v'], ['Chicken wings', '15', 'v'],
      ['Chicken tenders', '8', 'v'], ['Quesadilla', '3', 'v'],
      ['Mini tacos', '12', 'v'], ['Burrito', '2', 'v'],
      ['Fried chicken', '6 pieces', 'v'], ['Meatball sub', '2', 'v'],
      ['Philly cheesesteak', '2', 'v'], ['Pizza rolls', '30', 'v'],
      ['Loaded fries', '1 lb', 'v'], ['Nachos', '1 lb', 'v'],
      ['Garlic bread', '8 slices', 'v'], ['French toast', '6 slices', 'v'],
      ['Pancakes', '8', 'v'], ['Waffle', '5', 'v'],
      ['Cinnamon roll', '5', 'v'], ['Donut', '6', 'v'],
      ['Hash browns', '1 lb', 'v'], ['Bacon', '15 strips', 'v'],
      ['Breakfast sandwich', '3', 'v'], ['Raw white onion', '½ onion', 'c'],
      ['Plain dry white bread', '1 loaf', 'c'],
    ],
  },
  {
    name: 'Heavy & Greasy',
    items: [
      ['Chili cheese fries', '1 lb', 'v'], ['Loaded baked potato', '3', 'v'],
      ['Biscuits and gravy', '4 biscuits', 'v'], ['Fettuccine Alfredo', '1 lb', 'v'],
      ['Meatloaf', '1 lb', 'v'], ['Fried fish', '4 fillets', 'v'],
      ['Onion rings', '1 lb', 'v'], ['Country fried steak', '2', 'v'],
      ['Sloppy joe', '3', 'v'], ['Lasagna', '1 lb', 'v'],
      ['Beef stew', '16 oz', 'v'], ['Shepherd’s pie', '16 oz', 'v'],
      ['Chicken pot pie', '2', 'v'], ['Sausage gravy', '12 oz', 'v'],
      ['Cheese curds', '1 lb', 'v'], ['Deep-fried ravioli', '12', 'v'],
      ['Stuffed crust pizza', '6 slices', 'v'], ['Pulled pork mac and cheese', '1 lb', 'v'],
      ['Blooming onion', '1 portion', 'v'], ['Chili dog', '3', 'v'],
      ['Fried pickles', '10', 'v'], ['Tuna melt', '2', 'c'],
      ['Egg salad sandwich', '2', 'c'], ['Jalapeño poppers', '6', 'c'],
      ['Cold canned baked beans', '4 oz', 'c'], ['Hard-boiled eggs', '4', 'c'],
      ['Sauerkraut', '3 oz', 'c'], ['Whole raw onion', '1', 'c'],
      ['Double bacon cheeseburger', '2', 'v'], ['Deep-dish pizza', '4 slices', 'v'],
      ['Gyro platter', '1', 'v'], ['Corned beef hash', '1 lb', 'v'],
      ['Fried mac-and-cheese balls', '10', 'v'], ['Loaded potato skins', '12', 'v'],
      ['Deep-fried Oreos', '12', 'v'], ['Deep-fried Twinkie', '3', 'v'],
      ['Fried bologna sandwich', '3', 'v'],
    ],
  },
  {
    name: 'Bland, Canned & Cold',
    items: [
      ['Tomato soup', '24 oz', 'v'], ['Oatmeal (plain)', '24 oz', 'v'],
      ['Mashed potatoes', '1 lb', 'v'], ['Grits (plain)', '24 oz', 'v'],
      ['Plain Greek yogurt', '16 oz', 'v'], ['Cottage cheese', '8 oz', 'c'],
      ['Canned ravioli', '4 oz', 'c'], ['Canned spaghetti', '4 oz', 'c'],
      ['Canned chili', '4 oz', 'c'], ['Refried beans', '3 oz', 'c'],
      ['Creamed corn', '3 oz', 'c'], ['Clam chowder', '6 oz', 'c'],
      ['Broccoli cheddar soup', '16 oz', 'c'], ['Canned chicken noodle soup', '16 oz', 'c'],
      ['Deviled eggs', '4', 'c'], ['Coleslaw', '3 oz', 'c'],
      ['Potato salad', '6 oz', 'c'], ['Macaroni salad', '6 oz', 'c'],
      ['Tuna salad', '3 oz', 'c'], ['Baked beans', '8 oz', 'c'],
      ['Pickled beets', '3 oz', 'c'], ['Canned peas', '8 oz', 'c'],
      ['Canned carrots', '8 oz', 'c'], ['Stuffing', '8 oz', 'c'],
      ['Rice pudding', '4 oz', 'c'], ['Tapioca pudding', '4 oz', 'c'],
      ['Applesauce', '12 oz', 'c'], ['Canned green beans', '8 oz', 'c'],
      ['Canned mushrooms', '3 oz', 'c'],
      ['Plain white rice', '24 oz', 'v'], ['Cream of mushroom soup (straight)', '6 oz', 'c'],
      ['Split pea soup', '8 oz', 'c'], ['Cold plain pasta, no sauce', '8 oz', 'c'],
      ['Saltines, dry', '1 box (4 sleeves)', 'c'], ['Plain rice cakes', '40', 'c'],
      ['Jellied cranberry sauce', '4 oz', 'c'], ['Canned pears in syrup', '4 oz', 'c'],
      ['Buttermilk, straight', '4 oz', 'c'], ['Prune juice', '6 oz', 'c'],
    ],
  },
  {
    name: 'Condiment Hell',
    items: [
      ['Mayonnaise', '2 oz', 'c'], ['Miracle Whip', '2 oz', 'c'],
      ['Yellow mustard', '2 oz', 'c'], ['Dijon mustard', '2 oz', 'c'],
      ['Horseradish sauce', '1 oz', 'c'], ['Tartar sauce', '2 oz', 'c'],
      ['Cocktail sauce', '2 oz', 'c'], ['Ranch dressing', '2 oz', 'c'],
      ['Blue cheese dressing', '2 oz', 'c'], ['Caesar dressing', '2 oz', 'c'],
      ['Thousand Island dressing', '2 oz', 'c'], ['Russian dressing', '2 oz', 'c'],
      ['Relish', '2 oz', 'c'], ['Pickle juice', '3 oz', 'c'],
      ['Olive brine', '2 oz', 'c'], ['Jalapeño juice', '2 oz', 'c'],
      ['Sauerkraut juice', '2 oz', 'c'], ['Sour cream', '2 oz', 'c'],
      ['Cream cheese', '2 oz', 'c'], ['Nacho cheese', '2 oz', 'c'],
      ['Cheese sauce', '2 oz', 'c'], ['Gravy', '3 oz', 'c'],
      ['Hummus', '5 oz', 'c'], ['Pesto', '2 oz', 'c'],
      ['Ketchup', '2 oz', 'c'], ['Barbecue sauce', '2 oz', 'c'],
      ['Seafood sauce', '2 oz', 'c'], ['Ricotta cheese', '6 oz', 'c'],
      ['Wet scrambled eggs', '2 eggs', 'c'],
      ['Fish sauce', '1 oz', 'c'], ['Worcestershire, straight', '1 oz', 'c'],
      ['Soy sauce, straight', '1 oz', 'c'], ['Malt vinegar shot', '1 oz', 'c'],
      ['Tahini', '2 oz', 'c'], ['Marmite / Vegemite', '1 tbsp', 'c'],
      ['Cheez Whiz, straight', '2 oz', 'c'], ['Corn syrup, straight', '2 oz', 'c'],
      ['Honey, straight', '3 oz', 'c'],
    ],
  },
  {
    name: 'Fish, Organs & Fermented',
    items: [
      ['Canned tuna', '½ can', 'c'], ['Canned chicken', '3 oz', 'c'],
      ['Vienna sausages', '3', 'c'], ['Spam', '2 slices', 'c'],
      ['Liverwurst', '2 oz', 'c'], ['Potted meat', '1 can', 'c'],
      ['Sardines (in water)', '½ tin', 'c'], ['Sardines in mustard', '½ tin', 'c'],
      ['Anchovy fillets', '4', 'c'], ['Smoked oysters', '4', 'c'],
      ['Canned salmon', '3 oz', 'c'], ['Imitation crab', '6 oz', 'c'],
      ['Pickled herring', '3 oz', 'c'], ['Gefilte fish', '1 piece', 'c'],
      ['Canned mackerel', '3 oz', 'c'], ['Canned corned beef', '3 oz', 'c'],
      ['Beef liver', '3 oz', 'c'], ['Chicken liver', '3 oz', 'c'],
      ['Blood sausage', '3 oz', 'c'], ['Head cheese', '2 oz', 'c'],
      ['Scrapple', '3 oz', 'c'], ['Pickled pigs’ feet', '1', 'c'],
      ['Pickled eggs', '2', 'c'], ['Cold hot dogs', '2', 'c'],
      ['Natto', '1 pack', 'c'], ['Kimchi', '3 oz', 'c'],
      ['Blue cheese', '2 oz', 'c'], ['Goat cheese', '2 oz', 'c'],
      ['Limburger cheese', '2 oz', 'c'], ['Plain tofu', '8 oz', 'c'],
      ['Kippers (kippered herring)', '½ tin', 'c'], ['Canned baby clams', '3 oz', 'c'],
      ['Braunschweiger', '2 oz', 'c'], ['Beef tongue', '2 oz', 'c'],
      ['Tripe', '2 oz', 'c'], ['Sweetbreads', '2 oz', 'c'],
      ['Cod liver oil', '1 tbsp', 'c'], ['Roquefort (stinky blue)', '2 oz', 'c'],
      ['Durian', '3 oz', 'c'],
    ],
  },
  {
    name: 'Weird & Cursed',
    items: [
      ['Banana baby food', '1 jar', 'c'], ['Pea baby food', '1 jar', 'c'],
      ['Turkey baby food', '1 jar', 'c'], ['Prune baby food', '1 jar', 'c'],
      ['Ham baby food', '1 jar', 'c'], ['Molasses', '1 oz', 'c'],
      ['Black licorice', '3 oz', 'c'], ['Circus peanuts', '6', 'c'],
      ['Maraschino cherries', '24', 'c'], ['Candy corn', '8 oz', 'c'],
      ['Peanut butter + pickle sandwich', '1', 'c'], ['Mayonnaise + banana sandwich', '1', 'c'],
      ['Sardine + cream cheese cracker stack', '3', 'c'], ['Spam + marshmallow fluff sandwich', '1', 'c'],
      ['Cottage cheese + mustard bowl', '3 oz', 'c'], ['Hot dog dipped in peanut butter', '1', 'c'],
      ['Canned tuna + maple syrup bowl', '3 oz', 'c'], ['Sauerkraut + whipped cream', '3 oz', 'c'],
      ['Oatmeal + ranch', '4 oz', 'c'], ['Banana + mayonnaise', '1', 'c'],
      ['Deviled egg + chocolate syrup', '2', 'c'], ['Pickled herring + Nutella toast', '1', 'c'],
      ['Blue cheese + chocolate syrup', '2 oz', 'c'], ['Hard-boiled egg with jelly', '2', 'c'],
      ['Rice pudding with hot sauce', '3 oz', 'c'], ['Mac and cheese with applesauce', '4 oz', 'c'],
      ['Baked beans with frosting', '3 oz', 'c'], ['Anchovy peanut butter toast', '1', 'c'],
      ['Sardine and banana sandwich', '1', 'c'], ['Tuna and applesauce bowl', '3 oz', 'c'],
      ['Mustard on vanilla ice cream', '1 scoop', 'c'], ['Ketchup on pancakes', '2', 'c'],
      ['Mayo on watermelon', '2 slices', 'c'], ['Pickles dunked in milk', '3', 'c'],
      ['Cereal with orange juice instead of milk', '1 bowl', 'c'], ['Spaghetti with chocolate syrup', '4 oz', 'c'],
      ['Cottage cheese + ketchup', '3 oz', 'c'], ['Baked beans on a glazed doughnut', '1', 'c'],
      ['Anchovies on a Pop-Tart', '1', 'c'],
    ],
  },
  {
    name: 'Final Boss',
    items: [
      ['Surströmming (outdoors)', '1 fillet', 'c'], ['Natto', '1 pack', 'c'],
      ['Century egg', '1', 'c'], ['Fermented tofu', '2 oz', 'c'],
      ['Pickled pigs’ feet', '1', 'c'], ['Head cheese', '2 oz', 'c'],
      ['Blood sausage', '3 oz', 'c'], ['Beef liver', '3 oz', 'c'],
      ['Chicken liver', '3 oz', 'c'], ['Canned squid in ink', '3 oz', 'c'],
      ['Canned octopus', '3 oz', 'c'], ['Whole sardines', '1 tin', 'c'],
      ['Anchovy fillets', '5', 'c'], ['Pickled herring', '3 oz', 'c'],
      ['Smoked oysters', '5', 'c'], ['Canned mackerel', '3 oz', 'c'],
      ['Limburger cheese', '2 oz', 'c'], ['Liver pâté', '2 oz', 'c'],
      ['Potted meat', '1 can', 'c'], ['Prune baby food', '1 jar', 'c'],
      ['Turkey baby food', '1 jar', 'c'], ['Ham baby food', '1 jar', 'c'],
      ['Whole raw onion', '1', 'c'], ['Raw garlic cloves', '3', 'c'],
      ['Horseradish', '1 oz', 'c'], ['Whole lemon', '1, eaten whole', 'c'],
      ['Wasabi', '1 tbsp', 'c'], ['Anchovy paste', '1 oz', 'c'],
      ['Feta', '3 oz', 'c'], ['Sardines in mustard', '1 tin', 'c'],
      ['Hákarl (fermented shark)', '1 cube', 'c'], ['Lutefisk', '2 oz', 'c'],
      ['Fermented shrimp paste', '1 tsp', 'c'], ['Escamoles (ant larvae)', '1 tbsp', 'c'],
      ['Chapulines (seasoned grasshoppers)', '1 tbsp', 'c'],
    ],
  },
];

import crypto from 'crypto';

// The tiers above are the SEED. The live, editable food list lives in the store
// (data.json) and is seeded from this once. `ord` preserves curated within-tier order.
export const TIER_NAMES = TIERS.map((t) => t.name);

export function buildSeedFoods() {
  const out = [];
  let ord = 0;
  TIERS.forEach((tier, ti) => {
    tier.items.forEach(([name, qty, type]) => {
      out.push({
        id: crypto.randomUUID(), ord: ord++, name, qty,
        type: type === 'v' ? 'volume' : 'content', tier: ti,
      });
    });
  });
  return out;
}

export function tierItems(tierIndex) {
  const tier = TIERS[tierIndex];
  return tier.items.map(([name, qty, type], i) => ({
    id: `${tierIndex}-${i}`,
    name,
    qty,
    type: type === 'v' ? 'volume' : 'content',
    tier: tierIndex,
  }));
}

export function tierForRound(round /* 0-based */) {
  return round % TIERS.length;
}

// Every food across all tiers, flattened into one pool (all available any round).
export function allItems() {
  const out = [];
  TIERS.forEach((tier, ti) =>
    tier.items.forEach(([name, qty, type], i) =>
      out.push({ id: `${ti}-${i}`, name, qty, type: type === 'v' ? 'volume' : 'content', tier: ti })
    )
  );
  return out;
}

export const TIER_COUNT = TIERS.length;
