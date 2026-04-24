import Anthropic from '@anthropic-ai/sdk';
import { env } from '../../config/env';
import { ApiError } from '../../common/errors/ApiError';
import { classifyPrompt } from './prompts/classify.prompt';
import { polishPrompt } from './prompts/polish.prompt';
import { summarizePrompt } from './prompts/summarize.prompt';

const MODEL = 'claude-sonnet-4-6';

let client: Anthropic | null = null;
const getClient = () => {
  if (!env.ANTHROPIC_API_KEY) {
    throw ApiError.badRequest('AI features are disabled (ANTHROPIC_API_KEY not set)');
  }
  if (!client) client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
  return client;
};

const runPrompt = async (prompt: { system: string; user: string }, maxTokens = 512) => {
  const resp = await getClient().messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system: prompt.system,
    messages: [{ role: 'user', content: prompt.user }],
  });
  const text = resp.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();
  return { text, usage: resp.usage };
};

export const aiService = {
  async classify(text: string) {
    const { text: raw, usage } = await runPrompt(classifyPrompt(text), 200);
    try {
      return { result: JSON.parse(raw), usage };
    } catch {
      throw ApiError.badRequest('AI classify returned invalid JSON', { raw });
    }
  },

  async polish(draft: string) {
    const { text, usage } = await runPrompt(polishPrompt(draft), 800);
    return { polished: text, usage };
  },

  async summarize(conversation: string) {
    const { text, usage } = await runPrompt(summarizePrompt(conversation), 400);
    return { summary: text, usage };
  },
};
