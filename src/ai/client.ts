import type { ClaudeRequest, ClaudeResponse } from './types';
import { AIError } from './types';

const API_URL = 'https://api.anthropic.com/v1/messages';
const API_VERSION = '2023-06-01';

export async function callClaude(
  apiKey: string,
  request: ClaudeRequest
): Promise<ClaudeResponse> {
  let response: Response;

  try {
    response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': API_VERSION,
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify(request),
    });
  } catch {
    throw new AIError(
      'No internet connection. AI features require connectivity.',
      'network'
    );
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new AIError('Invalid API key. Check Settings > AI.', 'auth');
    }
    if (response.status === 429) {
      throw new AIError('Rate limit reached. Wait a moment and try again.', 'rate_limit');
    }
    if (response.status >= 500) {
      throw new AIError('Claude API is temporarily unavailable.', 'server');
    }
    const body = await response.text().catch(() => '');
    throw new AIError(`API error (${response.status}): ${body}`, 'unknown');
  }

  return response.json();
}

export async function testConnection(apiKey: string): Promise<boolean> {
  const response = await callClaude(apiKey, {
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 10,
    system: 'Respond with OK.',
    messages: [{ role: 'user', content: 'ping' }],
  });
  return response.content.length > 0;
}
