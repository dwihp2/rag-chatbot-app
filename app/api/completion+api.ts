import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';

export async function POST(req: Request) {
  const { prompt } = await req.json();

  const result = await generateText({
    model: openai("gpt-4.1-nano"),
    prompt,
    system: "You are a helpful assistant.",
  });

  return new Response(result.text, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}