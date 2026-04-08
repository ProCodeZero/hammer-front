export interface FactionCardProps {
  name: string;
  faction_type: 'Imperium' | 'Chaos' | 'Xenos' | 'Unaligned';
  unit_count: number;
  onClick?: () => void;
}
