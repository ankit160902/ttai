import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { getTemple } from '../../../lib/temple-store';
import { buildTempleContext } from '../../../lib/temple-context';
import { buildSystemPrompt } from '../../../lib/prompts/trustee-system';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { messages, templeId } = await req.json();

    const id = templeId ?? 'temple-001';
    const temple = await getTemple(id);

    if (!temple) {
      return new Response(JSON.stringify({ error: `Temple ${id} not found` }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const templeContext = buildTempleContext(temple);
    const systemPrompt = buildSystemPrompt(templeContext, temple.name);

    const result = streamText({
      model: google('gemini-2.0-flash'),
      system: systemPrompt,
      messages,
      onError: ({ error }) => {
        console.error('[chat] streamText error:', error);
      },
    });

    return result.toDataStreamResponse({
      getErrorMessage: (err: unknown) => {
        if (err instanceof Error) return err.message;
        if (typeof err === 'string') return err;
        try {
          return JSON.stringify(err);
        } catch {
          return 'Unknown streaming error';
        }
      },
    });
  } catch (err) {
    console.error('[chat] route error:', err);
    const message = err instanceof Error ? err.message : String(err);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
