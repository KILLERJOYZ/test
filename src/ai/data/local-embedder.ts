import { createHash } from "node:crypto";

/**
 * TypeScript port of embedder/embeddings.py::LocalHashEmbedder. Keeping the
 * algorithm identical means the AI layer can query the existing Qdrant
 * collection without re-embedding the corpus.
 */
export const LOCAL_EMBEDDING_DIMENSION = 384;

export function embedLocal(text: string, dimension = LOCAL_EMBEDDING_DIMENSION): number[] {
  const vector = new Float32Array(dimension);
  if (!text) return Array.from(vector);

  const tokens = text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}_\s-]/gu, " ")
    .split(/\s+/)
    .filter((token) => token.length > 0);

  const features = new Map<string, number>();
  const add = (feature: string, weight: number): void => {
    features.set(feature, (features.get(feature) ?? 0) + weight);
  };

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index]!;
    add(token, 1);
    const next = tokens[index + 1];
    if (next) add(`${token}_${next}`, 1.5);
    if (token.length >= 3) {
      for (let cursor = 0; cursor < token.length - 2; cursor += 1) {
        add(token.slice(cursor, cursor + 3), 0.5);
      }
    }
  }

  for (const [feature, count] of features) {
    const hash = BigInt(`0x${createHash("md5").update(feature, "utf8").digest("hex")}`);
    const bucket = Number(hash % BigInt(dimension));
    const sign = ((hash >> 32n) & 1n) === 0n ? 1 : -1;
    vector[bucket] = vector[bucket]! + sign * (1 + Math.log(count));
  }

  let squared = 0;
  for (let index = 0; index < vector.length; index += 1) {
    squared += vector[index]! * vector[index]!;
  }
  const norm = Math.sqrt(squared);
  if (norm > 1e-9) {
    for (let index = 0; index < vector.length; index += 1) {
      vector[index] = vector[index]! / norm;
    }
  }
  return Array.from(vector);
}

export function createLocalHashEmbedder(dimension = LOCAL_EMBEDDING_DIMENSION): (text: string) => number[] {
  return (text: string) => embedLocal(text, dimension);
}
