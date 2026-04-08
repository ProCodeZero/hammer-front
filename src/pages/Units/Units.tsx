import type { ChangeEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import Button from '../../components/Button/Button';
import UnitCard from '../../components/Card/UnitCard/UnitCard';
import Filter from '../../components/Filter/Filter';
import Heading from '../../components/Heading/Heading';
import Search from '../../components/Search/Search';
import type { FactionSummary } from '../../interfaces/faction.interface';
import type { AppDispatch, RootState } from '../../store/store';
import type { UnitsFilters } from '../../store/units.slice';
import { fetchUnits, unitsActions } from '../../store/units.slice';
import styles from './Units.module.css';

export function Units() {
  const [searchParams, setSearchParams] = useSearchParams();
  const dispatch = useDispatch<AppDispatch>();

  const {
    items = [],
    filters,
    loading,
    error,
    total,
    limit,
    offset,
  } = useSelector((state: RootState) => state.units);

  const [localSearch, setLocalSearch] = useState(filters.name || '');
  const [availableKeywords, setAvailableKeywords] = useState<string[]>([]);
  const [availableFactions, setAvailableFactions] = useState<string[]>([]);

  useEffect(() => {
    const name = searchParams.get('name') || undefined;
    const faction = searchParams.get('faction') || undefined;
    const faction_type = searchParams.get('faction_type') as
      | UnitsFilters['faction_type']
      | undefined;
    const type = searchParams.get('type') as UnitsFilters['type'] | undefined;
    const has_invuln = searchParams.get('has_invuln') === 'true' ? true : undefined;
    const has_transport = searchParams.get('has_transport') === 'true' ? true : undefined;
    const keyword = searchParams.get('keyword') || undefined;
    const points_min = searchParams.get('points_min')
      ? parseInt(searchParams.get('points_min')!, 10)
      : undefined;
    const points_max = searchParams.get('points_max')
      ? parseInt(searchParams.get('points_max')!, 10)
      : undefined;
    const sort_by = searchParams.get('sort_by') as UnitsFilters['sort_by'] | undefined;

    dispatch(
      unitsActions.setFilters({
        name,
        faction,
        faction_type,
        type,
        has_invuln,
        has_transport,
        keyword,
        points_min,
        points_max,
        sort_by,
      }),
    );
  }, [dispatch, searchParams]);

  // Fetch units when filters/pagination change
  useEffect(() => {
    dispatch(fetchUnits({ filters, limit, offset }));
  }, [dispatch, filters, limit, offset]);

  // Fetch available keywords and factions for filter dropdowns
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [keywordsRes, factionsRes] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/abilities/keywords/list?limit=100`),
          fetch(`${import.meta.env.VITE_API_URL}/factions`),
        ]);

        if (keywordsRes.ok) {
          const keywords = await keywordsRes.json();
          setAvailableKeywords(keywords);
        }
        if (factionsRes.ok) {
          const factions = await factionsRes.json();
          setAvailableFactions(factions.map((f: FactionSummary) => f.name));
        }
      } catch (err) {
        console.error('Failed to fetch filter options:', err);
      }
    };
    fetchFilterOptions();
  }, []);

  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setLocalSearch(e.target.value);
  }, []);

  const handleSearchSubmit = useCallback(() => {
    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      if (localSearch.trim()) {
        newParams.set('name', localSearch.trim());
      } else {
        newParams.delete('name');
      }
      newParams.delete('offset'); // Reset pagination on new search
      return newParams;
    });
  }, [localSearch, setSearchParams]);

  const handleFilterChange = useCallback(
    (newFilters: Partial<UnitsFilters>) => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        Object.entries(newFilters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            newParams.set(key, String(value));
          } else {
            newParams.delete(key);
          }
        });
        newParams.delete('offset'); // Reset pagination on filter change
        return newParams;
      });
    },
    [setSearchParams],
  );

  const handleClearFilters = useCallback(() => {
    setSearchParams({});
    setLocalSearch('');
  }, [setSearchParams]);

  const loadMore = useCallback(() => {
    dispatch(unitsActions.setPagination({ offset: offset + limit }));
  }, [dispatch, offset, limit]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Heading level={1}>Units Database</Heading>
        <div className={styles.searchWrapper}>
          <Search
            value={localSearch}
            onChange={handleSearchChange}
            onKeyUp={(e) => e.key === 'Enter' && handleSearchSubmit()}
            placeholder="Search units by name, faction, or keyword..."
            isLoading={loading && items.length === 0}
          />
          <Button onClick={handleSearchSubmit} size="small">
            Search
          </Button>
        </div>
      </div>

      <Filter
        currentFilters={filters}
        onFilterChange={handleFilterChange}
        onClear={handleClearFilters}
        availableFactions={availableFactions}
        availableKeywords={availableKeywords}
      />

      {error && (
        <div className={styles.error} role="alert">
          <strong>Error:</strong> {error}
          <Button
            appearance="ghost"
            size="small"
            onClick={() => dispatch(fetchUnits({ filters, limit, offset }))}
            style={{ marginLeft: 12 }}
          >
            Retry
          </Button>
        </div>
      )}

      <div className={styles.grid} role="list">
        {items.map((unit) => (
          <UnitCard key={unit.id} unit={unit} />
        ))}
      </div>

      {loading && items.length === 0 && (
        <div className={styles.loading} aria-live="polite">
          Loading units...
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className={styles.empty}>
          <Heading level={3}>No units found</Heading>
          <p style={{ marginTop: 8, color: 'var(--secondary-text-color)' }}>
            Try adjusting your filters or search terms.
          </p>
          <Button appearance="outline" onClick={handleClearFilters} style={{ marginTop: 16 }}>
            Clear All Filters
          </Button>
        </div>
      )}

      {items.length > 0 && items.length < total && (
        <div className={styles.loadMore}>
          <Button onClick={loadMore} appearance="outline" loading={loading}>
            Load More ({items.length}/{total})
          </Button>
        </div>
      )}
    </div>
  );
}

export default Units;
