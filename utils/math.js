/**
 * Calculate cosine similarity between two vectors
 * @param {number[]} vecA - First vector
 * @param {number[]} vecB - Second vector
 * @returns {number} Cosine similarity between the vectors
 */
export function cosineSimilarity(vecA, vecB) {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

/**
 * Calculate Euclidean distance between two vectors
 * @param {number[]} vecA - First vector
 * @param {number[]} vecB - Second vector
 * @returns {number} Euclidean distance between the vectors
 */
export function euclideanDistance(vecA, vecB) {
  return Math.sqrt(
    vecA.reduce((sum, a, i) => sum + Math.pow(a - vecB[i], 2), 0)
  );
}

/**
 * Normalize a vector to unit length
 * @param {number[]} vec - Vector to normalize
 * @returns {number[]} Normalized vector
 */
export function normalizeVector(vec) {
  const magnitude = Math.sqrt(vec.reduce((sum, val) => sum + val * val, 0));
  return vec.map(val => val / magnitude);
} 