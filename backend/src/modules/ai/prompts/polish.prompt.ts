export const polishPrompt = (draft: string) => ({
  system:
    'You are a writing assistant for helpdesk agents. Rewrite the draft to be clear, ' +
    'empathetic, and professional. Preserve meaning, keep it concise, do not invent facts.',
  user: `Draft:\n${draft}\n\nReturn only the polished reply text.`,
});
