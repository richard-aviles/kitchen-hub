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
 */
function normalizeFoodResult(item) {
  const nutrients = item.foodNutrients || []

  function getNutrient(name) {
    const n = nutrients.find(n => n.nutrientName === name)
    return n ? Math.round(n.value * 10) / 10 : 0
  }

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
      calories: getNutrient('Energy'),
      protein: getNutrient('Protein'),
      carbs: getNutrient('Carbohydrate, by difference'),
      fat: getNutrient('Total lipid (fat)')
    }
  }
}
