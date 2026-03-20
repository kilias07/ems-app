export const SUIT_MULTIPLIERS: Record<string, number> = {
  R0: 1.2,
  R1: 1.2,
  RW2: 1.1,
  R2: 1.0,
  R3: 0.9,
  R4: 0.8,
  R5: 0.7,
};

export type SuitSize = keyof typeof SUIT_MULTIPLIERS;

export const SUIT_SIZES = Object.keys(SUIT_MULTIPLIERS) as SuitSize[];
