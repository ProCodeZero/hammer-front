export interface FactionSummary {
  name: string;
  faction_type: 'Imperium' | 'Chaos' | 'Xenos' | 'Unaligned';
  unit_count: number;
}

export interface FactionDetails {
  name: string;
  faction_type: string;
  unit_breakdown: Record<string, number>;
  stats: {
    avg_points: number;
    avg_toughness: number;
    avg_wounds: number;
  };
  keywords: Array<{ keyword: string; count: number }>;
  special_rules: string[];
}

export interface FactionStats {
  points_distribution: Record<string, number>;
  weapons: {
    most_common: string[];
    highest_damage: string[];
  };
  invulnerable_saves: Record<string, number>;
}
