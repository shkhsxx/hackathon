import type { BodyShape, DbProduct } from "@/types";

/**
 * Maps body shape → compatible fit_type values for product matching.
 * Priority order matters: first match is "best fit", rest are alternatives.
 */
export const SHAPE_FIT_MAP: Record<BodyShape, string[]> = {
  triangle: [
    "wide fit",
    "flare fit",
    "a-line",
    "regular fit",
    "oversized fit",
    "relaxed fit",
  ],
  inverted_triangle: [
    "wide fit",
    "flare fit",
    "a-line",
    "regular fit",
    "relaxed fit",
    "tapered fit",
  ],
  rectangle: [
    "oversized fit",
    "semi oversized",
    "relaxed fit",
    "regular fit",
    "wide fit",
    "a-line",
  ],
  hourglass: [
    "slim fit",
    "regular fit",
    "a-line",
    "tapered fit",
    "straight fit",
  ],
  oval: [
    "relaxed fit",
    "regular fit",
    "a-line",
    "wide fit",
    "oversized fit",
    "straight fit",
  ],
};

/**
 * Scores a product based on how well its fit_type matches the body shape.
 * Returns 0 if no match (product should be filtered or shown last).
 */
export function scoreProduct(product: DbProduct, bodyShape: BodyShape): number {
  const fits = SHAPE_FIT_MAP[bodyShape];
  const idx = fits.indexOf(product.fit_type.toLowerCase());
  if (idx === -1) return 0;
  return fits.length - idx; // higher = better match
}

/**
 * Filters and sorts products by body shape compatibility.
 * Returns top `limit` products across all categories (balanced selection).
 */
export function rankProducts(
  products: DbProduct[],
  bodyShape: BodyShape,
  limit = 8
): DbProduct[] {
  const scored = products
    .map((p) => ({ product: p, score: scoreProduct(p, bodyShape) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  // Ensure category diversity: pick at most ceil(limit/categories) per category
  const byCategory = new Map<string, DbProduct[]>();
  scored.forEach(({ product }) => {
    if (!byCategory.has(product.category)) byCategory.set(product.category, []);
    byCategory.get(product.category)!.push(product);
  });

  const result: DbProduct[] = [];
  const perCategory = Math.ceil(limit / byCategory.size);

  for (const items of byCategory.values()) {
    result.push(...items.slice(0, perCategory));
    if (result.length >= limit) break;
  }

  return result.slice(0, limit);
}
