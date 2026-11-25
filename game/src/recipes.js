// Ingredients and recipes: what a dish is made of and how each piece is
// prepared. A plate matches a recipe when its contents equal the recipe's
// needs as a multiset of (ingredient, state) pairs.

// Every ingredient: whether it needs chopping, whether it cooks in the wok,
// how long the wok takes, and the colour its drawing is built from.
export const INGREDIENTS = {
  rice:    { name: 'Nasi',   color: '#f7f1de', chop: false, cook: true,  cookTime: 4, bin: 'Rice bin' },
  noodle:  { name: 'Mie',    color: '#f2c94c', chop: false, cook: true,  cookTime: 4, bin: 'Noodle bin' },
  chicken: { name: 'Ayam',   color: '#f2a594', chop: true,  cook: true,  cookTime: 5, bin: 'Chicken bin' },
  veg:     { name: 'Sayur',  color: '#6fbf5a', chop: true,  cook: true,  cookTime: 3, bin: 'Veg bin' },
  egg:     { name: 'Telur',  color: '#fff3c4', chop: false, cook: true,  cookTime: 3, bin: 'Egg bin' },
  chilli:  { name: 'Cabai',  color: '#e5484d', chop: true,  cook: false, cookTime: 0, bin: 'Chilli bin' },
  sauce:   { name: 'Saus',   color: '#8a5a2b', chop: false, cook: false, cookTime: 0, bin: 'Sauce bin' },
};

export const INGREDIENT_IDS = Object.keys(INGREDIENTS);

// A need is [ingredientId, requiredState]. Raw sauce and chopped chilli go
// straight on the plate; everything else passes through the wok.
export const RECIPES = [
  {
    id: 'nasi-goreng',
    name: 'Nasi Goreng',
    price: 120,
    needs: [['rice', 'cooked'], ['egg', 'cooked'], ['chicken', 'cooked'], ['sauce', 'raw']],
  },
  {
    id: 'mie-ayam',
    name: 'Mie Ayam',
    price: 110,
    needs: [['noodle', 'cooked'], ['chicken', 'cooked'], ['veg', 'chopped']],
  },
  {
    id: 'nasi-ayam-geprek',
    name: 'Nasi Ayam Geprek',
    price: 130,
    needs: [['rice', 'cooked'], ['chicken', 'cooked'], ['chilli', 'chopped']],
  },
  {
    id: 'ayam-geprek',
    name: 'Ayam Geprek',
    price: 100,
    needs: [['chicken', 'cooked'], ['chilli', 'chopped']],
  },
  {
    id: 'tumis-sayur',
    name: 'Tumis Sayur',
    price: 80,
    needs: [['veg', 'cooked'], ['sauce', 'raw']],
  },
  {
    id: 'telur-dadar',
    name: 'Telur Dadar',
    price: 90,
    needs: [['egg', 'cooked'], ['veg', 'chopped']],
  },
];

export function recipeById(id) {
  return RECIPES.find((recipe) => recipe.id === id);
}

// Pick a recipe for a new order. Early orders favour the short ones so the
// player learns the kitchen before the four-part dishes arrive.
export function pickRecipe(rng, servedSoFar) {
  const pool = servedSoFar < 2
    ? RECIPES.filter((r) => r.needs.length <= 2)
    : RECIPES;
  return pool[Math.floor(rng() * pool.length)];
}

// Does the plate hold exactly the needs of a recipe? Order of items on the
// plate does not matter.
export function plateMatchesRecipe(plateItems, recipe) {
  if (plateItems.length !== recipe.needs.length) return false;
  const wanted = recipe.needs.map(([id, state]) => `${id}:${state}`).sort();
  const held = plateItems.map((item) => `${item.id}:${item.state}`).sort();
  return wanted.every((need, i) => need === held[i]);
}

// The first recipe the plate currently completes, or null.
export function completedDish(plateItems) {
  for (const recipe of RECIPES) {
    if (plateMatchesRecipe(plateItems, recipe)) return recipe;
  }
  return null;
}

// How many of the plate's items already belong to some recipe, for a hint.
export function plateProgress(plateItems) {
  let best = 0;
  for (const recipe of RECIPES) {
    let count = 0;
    const remaining = recipe.needs.map(([id, state]) => `${id}:${state}`);
    for (const item of plateItems) {
      const key = `${item.id}:${item.state}`;
      const at = remaining.indexOf(key);
      if (at !== -1) {
        remaining.splice(at, 1);
        count += 1;
      }
    }
    best = Math.max(best, count);
  }
  return best;
}
