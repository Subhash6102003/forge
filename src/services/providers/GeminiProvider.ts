export interface GeminiStreamOptions {
  apiKey: string;
  model: string;
  prompt: string;
  systemPrompt?: string;
  onToken?: (token: string) => void;
  signal?: AbortSignal;
}

export class GeminiProvider {
  static async streamCompletion(options: GeminiStreamOptions): Promise<{ response: string; tokensPerSec: number }> {
    const startTime = performance.now();
    let tokenCount = 0;
    let fullText = '';

    const modelName = options.model.replace(/^Gemini\s*\((.*?)\)$/i, '$1').replace(/^gemini:/i, '').trim() || 'gemini-1.5-flash';

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:streamGenerateContent?key=${options.apiKey.trim()}&alt=sse`;

    const body: any = {
      contents: [
        {
          role: 'user',
          parts: [{ text: options.prompt }],
        },
      ],
    };

    if (options.systemPrompt) {
      body.systemInstruction = {
        parts: [{ text: options.systemPrompt }],
      };
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: options.signal,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => null);
      throw new Error(errorData?.error?.message || `Gemini request failed with status ${res.status}`);
    }

    if (!res.body) {
      throw new Error('No response body received from Gemini stream');
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
          const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            fullText += text;
            tokenCount += text.split(/\s+/).length || 1;
            options.onToken?.(text);
          }
        } catch {
          // ignore non-json
        }
      }
    }

    const elapsedSec = (performance.now() - startTime) / 1000;
    const tokensPerSec = Math.max(1, tokenCount / Math.max(elapsedSec, 0.05));

    return { response: fullText, tokensPerSec };
  }
}
