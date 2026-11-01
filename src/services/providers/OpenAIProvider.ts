export interface OpenAIStreamOptions {
  apiKey: string;
  model: string;
  prompt: string;
  systemPrompt?: string;
  baseUrl?: string;
  onToken?: (token: string) => void;
  signal?: AbortSignal;
}

export class OpenAIProvider {
  static async testConnection(apiKey: string): Promise<{ ok: boolean; error?: string }> {
    if (!apiKey || !apiKey.trim()) {
      return { ok: false, error: 'API key is required' };
    }
    try {
      const res = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey.trim()}`,
        },
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

  static async streamCompletion(options: OpenAIStreamOptions): Promise<{ response: string; tokensPerSec: number }> {
    const startTime = performance.now();
    let tokenCount = 0;
    let fullText = '';

    const modelName = options.model.replace(/^OpenAI\s*\((.*?)\)$/i, '$1').trim() || 'gpt-4o';

    const messages: Array<{ role: string; content: string }> = [];
    if (options.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    messages.push({ role: 'user', content: options.prompt });

    const baseUrl = (options.baseUrl || 'https://api.openai.com/v1').replace(/\/+$/, '');
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${options.apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages,
        stream: true,
      }),
      signal: options.signal,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.error?.message || `OpenAI request failed with status ${res.status}`);
    }

    if (!res.body) {
      throw new Error('No response body received from OpenAI stream');
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
        if (dataStr === '[DONE]') break;

        try {
          const parsed = JSON.parse(dataStr);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            tokenCount += 1;
            fullText += delta;
            options.onToken?.(delta);
          }
        } catch {
          // Skip unparseable SSE lines
        }
      }
    }

    const elapsedSec = (performance.now() - startTime) / 1000;
    const tokensPerSec = Math.max(1, tokenCount / Math.max(elapsedSec, 0.05));

    return { response: fullText, tokensPerSec };
  }
}
