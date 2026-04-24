export const summarizePrompt = (conversation: string) => ({
  system:
    'Summarize a helpdesk ticket conversation in under 5 bullet points for a new agent ' +
    'picking it up. Include the customer problem, what was tried, and current status.',
  user: `Conversation:\n${conversation}`,
});
