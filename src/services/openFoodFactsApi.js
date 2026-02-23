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
 *
 * Open Food Facts stores nutrients per 100g but also provides pre-calculated
 * per-serving values (_serving suffix) and a numeric serving_quantity field.
 * We prefer per-serving values when available; otherwise scale from per-100g.
 */
function normalizeProduct(product, barcode) {
  const nutr = product.nutriments || {}

  // serving_quantity is the serving size in grams as a number (e.g. 28)
  const servingG = parseFloat(product.serving_quantity) || 100
  const scale = servingG / 100

  function perServing(servingKey, per100Key, fallbackKey) {
    // Prefer the pre-calculated _serving value if present
    if (nutr[servingKey] != null) return nutr[servingKey]
    // Otherwise scale from per-100g
    return (nutr[per100Key] ?? nutr[fallbackKey] ?? 0) * scale
  }

  return {
    id: `off-${barcode}`,
    name: product.product_name || product.product_name_en || 'Unknown Product',
    brand: product.brands || null,
    barcode,
    source: 'openfoodfacts',
    sourceId: barcode,
    servingSize: product.serving_size || '100g',
    nutrition: {
      calories: Math.round(perServing('energy-kcal_serving', 'energy-kcal_100g', 'energy-kcal')),
      protein: Math.round(perServing('proteins_serving', 'proteins_100g', 'proteins') * 10) / 10,
      carbs: Math.round(perServing('carbohydrates_serving', 'carbohydrates_100g', 'carbohydrates') * 10) / 10,
      fat: Math.round(perServing('fat_serving', 'fat_100g', 'fat') * 10) / 10
    }
  }
}
