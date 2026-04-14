import OpenAI from 'openai';

const openai = new OpenAI();

export async function embedText(text: string): Promise<number[]> {
  // TODO: Implement embedding pipeline with text-embedding-3-small
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });

  return response.data[0]?.embedding ?? [];
}

export async function embedBatch(texts: string[]): Promise<number[][]> {
  // TODO: Implement batch embedding with chunking for large inputs
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: texts,
  });

  return response.data.map(d => d.embedding);
}
