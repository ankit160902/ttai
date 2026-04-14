import { QdrantClient } from '@qdrant/js-client-rest';
import { embedText } from './embedder.js';

const qdrantUrl = process.env['QDRANT_URL'] ?? 'http://localhost:6333';
const collectionName = process.env['QDRANT_COLLECTION_TTAI'] ?? 'ttai-knowledge';

const client = new QdrantClient({ url: qdrantUrl });

export interface RetrievalResult {
  id: string;
  score: number;
  payload: Record<string, unknown>;
}

export async function retrieveRelevantDocuments(
  query: string,
  templeId: string,
  limit: number = 5
): Promise<RetrievalResult[]> {
  // TODO: Implement full RAG retrieval pipeline
  const queryVector = await embedText(query);

  const results = await client.search(collectionName, {
    vector: queryVector,
    limit,
    filter: {
      must: [
        { key: 'templeId', match: { value: templeId } },
      ],
    },
  });

  return results.map(r => ({
    id: String(r.id),
    score: r.score,
    payload: (r.payload ?? {}) as Record<string, unknown>,
  }));
}
