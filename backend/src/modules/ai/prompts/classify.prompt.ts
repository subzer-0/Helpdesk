export const classifyPrompt = (text: string) => ({
  system:
    'You are an intelligent helpdesk assistant. Classify the user\'s incoming ticket. ' +
    'Determine the urgency, category, and if the issue is simple enough for you to resolve or complex enough to require a human agent. ' +
    'If simple, provide a helpful and polite "autoResponse". If it requires a human, set "isComplex" to true and leave "autoResponse" empty. ' +
    'Respond ONLY with compact JSON matching this exact structure: ' +
    '{"priority":"LOW|MEDIUM|HIGH|URGENT", "category":"string", "isComplex": boolean, "autoResponse": "string" | null}',
  user: `Analyze this incoming ticket:\n\n${text}`,
});
