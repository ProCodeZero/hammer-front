export type FactionType = 'Imperium' | 'Chaos' | 'Xenos' | 'Unaligned';
export type UnitType = 'unit' | 'model';
export type WeaponType = 'ranged' | 'melee';
export type SortDirection = 'asc' | 'desc';
export type SortField = 'name' | 'points' | 'faction';

export interface UnitsQueryParams {
  limit?: number;
  offset?: number;
  name?: string;
  faction?: string;
  faction_type?: FactionType;
  type?: UnitType;
  has_invuln?: boolean;
  has_transport?: boolean;
  keyword?: string;
  points_min?: number;
  points_max?: number;
  sort_by?: `${SortDirection}-${SortField}` | SortField;
}
