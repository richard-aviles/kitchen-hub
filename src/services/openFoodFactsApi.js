/**
 * Open Food Facts API
 *
 * Looks up packaged food products by barcode.
 * Completely free, no API key required.
 * https://world.openfoodfacts.org/
 */

const BASE_URL = 'https://world.openfoodfacts.org/api/v2'

/**
 * Look up a product by its barcode (EAN/UPC).
 * @param {string} barcode - The barcode string
 * @returns {Promise<object|null>} Normalized food result or null if not found
 */
export async function lookupBarcode(barcode) {
  const res = await fetch(
    `${BASE_URL}/product/${encodeURIComponent(barcode)}.json`,
    { headers: { 'User-Agent': 'KitchenHub/1.0' } }
  )

  if (!res.ok) {
    throw new Error(`Open Food Facts API error: ${res.status}`)
  }

  const data = await res.json()

  if (data.status !== 1 || !data.product) {
    return null
  }

  return normalizeProduct(data.product, barcode)
}

/**
 * Normalize an Open Food Facts product into our standard food shape.
 */
function normalizeProduct(product, barcode) {
  const nutr = product.nutriments || {}

  return {
    id: `off-${barcode}`,
    name: product.product_name || product.product_name_en || 'Unknown Product',
    brand: product.brands || null,
    barcode,
    source: 'openfoodfacts',
    sourceId: barcode,
    servingSize: product.serving_size || '100g',
    nutrition: {
      calories: Math.round(nutr['energy-kcal_100g'] || nutr['energy-kcal'] || 0),
      protein: Math.round((nutr.proteins_100g || nutr.proteins || 0) * 10) / 10,
      carbs: Math.round((nutr.carbohydrates_100g || nutr.carbohydrates || 0) * 10) / 10,
      fat: Math.round((nutr.fat_100g || nutr.fat || 0) * 10) / 10
    }
  }
}
