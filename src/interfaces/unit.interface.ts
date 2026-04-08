export interface UnitPoints {
  base: number;
  variants: Array<{ models: number; points: number }>;
}

export interface UnitStats {
  M: string;
  T: string;
  SV: string;
  W: string;
  LD: string;
  OC: string;
}

export interface Weapon {
  name: string;
  Range: string;
  A: string;
  BS?: string;
  WS?: string;
  S: string;
  AP: string;
  D: string;
  Keywords: string;
}

export interface Ability {
  name: string;
  description: string;
}

export interface Unit {
  name: string;
  id: string;
  type: 'unit' | 'model';
  faction: string;
  faction_type: 'Imperium' | 'Chaos' | 'Xenos' | 'Unaligned';
  points: UnitPoints;
  composition: { min_models: number | null; max_models: number | null };
  stats: UnitStats;
  invuln_save: string | null;
  transport: string | null;
  weapons: {
    ranged: Weapon[];
    melee: Weapon[];
  };
  abilities: Ability[];
  special_rules: string[];
  keywords: string[];
}

export interface UnitListResponse {
  units: Unit[];
  total?: number;
  limit?: number;
  offset?: number;
}

export const normalizeUnitList = (response: unknown): UnitListResponse => {
  if (Array.isArray(response)) {
    return { units: response as Unit[], total: response.length };
  }
  if (response && typeof response === 'object' && 'units' in response) {
    return response as UnitListResponse;
  }
  return { units: [], total: 0 };
};
