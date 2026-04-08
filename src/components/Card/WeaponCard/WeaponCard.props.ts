import type { Weapon } from '../../../interfaces';

export interface WeaponCardProps {
  weapon: Weapon;
  type: 'ranged' | 'melee';
  compact?: boolean;
}
