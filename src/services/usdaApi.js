/**
 * USDA FoodData Central API
 *
 * Searches for foods by name and returns normalized nutrition data.
 * Requires a free API key from https://fdc.nal.usda.gov/api-key-signup/
 */

const BASE_URL = 'https://api.nal.usda.gov/fdc/v1'

function getApiKey() {
  return import.meta.env.VITE_USDA_API_KEY || ''
}

/**
 * Search for foods by query string.
 * @param {string} query - Food name to search (e.g. "banana")
 * @param {number} pageSize - Max results (default 10)
 * @returns {Promise<Array>} Normalized food results
 */
export async function searchFoods(query, pageSize = 10) {
  const apiKey = getApiKey()
  if (!apiKey) {
    throw new Error('USDA API key not configured. Add VITE_USDA_API_KEY to your .env file.')
  }

  const res = await fetch(`${BASE_URL}/foods/search?api_key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      pageSize,
      dataType: ['Foundation', 'SR Legacy', 'Branded']
    })
  })

  if (!res.ok) {
    throw new Error(`USDA API error: ${res.status}`)
  }

  const data = await res.json()
  return (data.foods || []).map(normalizeFoodResult)
}

/**
 * Normalize a USDA food result into our standard food shape.
 *
 * USDA returns all nutrient values per 100g. If the food has a serving size
 * in grams (or ml, which we treat as ~equal), we scale the nutrients to
 * match the actual serving size so the displayed values match the package label.
 */
function normalizeFoodResult(item) {
  const nutrients = item.foodNutrients || []

  function getNutrient(name) {
    const n = nutrients.find(n => n.nutrientName === name)
    return n ? n.value : 0
  }

  // USDA sometimes has two "Energy" entries: one in kcal, one in kJ.
  // Explicitly find the kcal entry to avoid accidentally using kJ.
  function getCalories() {
    const kcal = nutrients.find(
      n => n.nutrientName === 'Energy' && n.unitName?.toUpperCase() === 'KCAL'
    )
    if (kcal) return kcal.value
    // Fallback: first Energy entry (may be kJ — convert if so)
    const any = nutrients.find(n => n.nutrientName === 'Energy')
    if (!any) return 0
    return any.unitName?.toUpperCase() === 'KJ' ? any.value / 4.184 : any.value
  }

  // Scale from per-100g to per-serving when a gram-based serving size is available
  const unit = (item.servingSizeUnit || 'g').toLowerCase()
  const servingG = item.servingSize && (unit === 'g' || unit === 'ml')
    ? item.servingSize
    : 100
  const scale = servingG / 100

  return {
    id: `usda-${item.fdcId}`,
    name: item.description || item.lowercaseDescription || 'Unknown',
    brand: item.brandName || item.brandOwner || null,
    barcode: item.gtinUpc || null,
    source: 'usda',
    sourceId: String(item.fdcId),
    servingSize: item.servingSize
      ? `${item.servingSize}${item.servingSizeUnit || 'g'}`
      : '100g',
    nutrition: {
      calories: Math.round(getCalories() * scale),
      protein: Math.round(getNutrient('Protein') * scale * 10) / 10,
      carbs: Math.round(getNutrient('Carbohydrate, by difference') * scale * 10) / 10,
      fat: Math.round(getNutrient('Total lipid (fat)') * scale * 10) / 10
    }
  }
}
