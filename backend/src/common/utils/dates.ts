const units: Record<string, number> = {
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

export const parseDurationMs = (input: string): number => {
  const match = /^(\d+)([smhd])$/.exec(input.trim());
  if (!match) throw new Error(`Invalid duration: ${input}`);
  return Number(match[1]) * units[match[2]];
};

export const addMs = (date: Date, ms: number) => new Date(date.getTime() + ms);
