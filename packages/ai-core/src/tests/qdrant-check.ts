import { QdrantClient } from '@qdrant/js-client-rest';

const COLLECTION_NAME = process.env['QDRANT_COLLECTION_TTAI'] ?? 'ttai-knowledge';
const QDRANT_URL = process.env['QDRANT_URL'] ?? 'http://localhost:6333';
const VECTOR_SIZE = 1536; // text-embedding-3-small dimension

async function main() {
  console.log(`Testing Qdrant connection at ${QDRANT_URL}...\n`);

  const client = new QdrantClient({ url: QDRANT_URL });

  try {
    // 1. Check if collection exists, create if not
    const collections = await client.getCollections();
    const exists = collections.collections.some(c => c.name === COLLECTION_NAME);

    if (!exists) {
      await client.createCollection(COLLECTION_NAME, {
        vectors: { size: VECTOR_SIZE, distance: 'Cosine' },
      });
      console.log(`Created collection "${COLLECTION_NAME}" with vector size ${VECTOR_SIZE}.`);
    } else {
      console.log(`Collection "${COLLECTION_NAME}" already exists.`);
    }

    // 2. Insert a test document
    const testId = 'test-doc-001';
    const testVector = Array.from({ length: VECTOR_SIZE }, () => Math.random());

    await client.upsert(COLLECTION_NAME, {
      wait: true,
      points: [{
        id: testId,
        vector: testVector,
        payload: {
          templeId: 'test-temple',
          content: 'This is a test document for TTAI Qdrant verification.',
          docType: 'test',
        },
      }],
    });
    console.log('Insert: OK');

    // 3. Query it back
    const searchResults = await client.search(COLLECTION_NAME, {
      vector: testVector,
      limit: 1,
      filter: {
        must: [{ key: 'templeId', match: { value: 'test-temple' } }],
      },
    });

    if (searchResults.length > 0 && searchResults[0]?.id === testId) {
      console.log('Query: OK');
    } else {
      throw new Error('Query returned unexpected results');
    }

    // 4. Delete the test document
    await client.delete(COLLECTION_NAME, {
      wait: true,
      points: [testId],
    });
    console.log('Delete: OK');

    console.log(`\n[PASS] Qdrant collection ready. Insert/query/delete: OK`);
    process.exit(0);
  } catch (error) {
    console.error('\n[FAIL] Qdrant connection test failed:', error);
    process.exit(1);
  }
}

main();
