import { generateText } from 'ai';
import { google } from '@ai-sdk/google';

async function main() {
  console.log('Testing Gemini API connection...\n');

  try {
    const { text } = await generateText({
      model: google('gemini-2.0-flash'),
      prompt: 'Say exactly: TTAI API connection confirmed.',
      maxTokens: 50,
    });

    console.log('Response:', text);

    if (text.includes('TTAI API connection confirmed')) {
      console.log('\n[PASS] Gemini API connection verified.');
      process.exit(0);
    } else {
      console.error('\n[FAIL] Unexpected response — API connected but response did not match.');
      process.exit(1);
    }
  } catch (error) {
    console.error('\n[FAIL] Gemini API connection failed:', error);
    process.exit(1);
  }
}

main();
