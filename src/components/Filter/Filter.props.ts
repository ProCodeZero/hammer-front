import type { UnitsFilters } from '../../store/units.slice';

export interface FilterProps {
  currentFilters: UnitsFilters;
  onFilterChange: (filters: Partial<UnitsFilters>) => void;
  onClear: () => void;
  availableFactions?: string[];
  availableKeywords?: string[];
}
