export interface AnthropicStreamOptions {
  apiKey: string;
  model: string;
  prompt: string;
  systemPrompt?: string;
  onToken?: (token: string) => void;
  signal?: AbortSignal;
}

export class AnthropicProvider {
  static async testConnection(apiKey: string): Promise<{ ok: boolean; error?: string }> {
    if (!apiKey || !apiKey.trim()) {
      return { ok: false, error: 'API key is required' };
    }
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey.trim(),
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'ping' }],
        }),
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const msg = errorData?.error?.message || `HTTP ${res.status}: ${res.statusText}`;
        return { ok: false, error: msg };
      }

      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err.message || 'Connection failed' };
    }
  }

  static async streamCompletion(options: AnthropicStreamOptions): Promise<{ response: string; tokensPerSec: number }> {
    const startTime = performance.now();
    let tokenCount = 0;
    let fullText = '';

    const modelName = options.model.replace(/^Anthropic\s*\((.*?)\)$/i, '$1').trim() || 'claude-3-5-sonnet-20241022';

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': options.apiKey.trim(),
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: modelName,
        max_tokens: 4096,
        ...(options.systemPrompt ? { system: options.systemPrompt } : {}),
        messages: [{ role: 'user', content: options.prompt }],
        stream: true,
      }),
      signal: options.signal,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.error?.message || `Anthropic request failed with status ${res.status}`);
    }

    if (!res.body) {
      throw new Error('No response body received from Anthropic stream');
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data:')) continue;
        const dataStr = trimmed.replace(/^data:\s*/, '').trim();

        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
            tokenCount += 1;
            fullText += parsed.delta.text;
            options.onToken?.(parsed.delta.text);
          }
        } catch {
          // Skip non-JSON SSE chunks
        }
      }
    }

    const elapsedSec = (performance.now() - startTime) / 1000;
    const tokensPerSec = Math.max(1, tokenCount / Math.max(elapsedSec, 0.05));

    return { response: fullText, tokensPerSec };
  }
}
