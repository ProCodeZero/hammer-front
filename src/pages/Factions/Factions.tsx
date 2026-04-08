import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import FactionCard from '../../components/Card/FactionCard/FactionCard';
import Heading from '../../components/Heading/Heading';
import { API_BASE_URL, ENDPOINTS } from '../../helpers/api';
import type { FactionSummary } from '../../interfaces/faction.interface';
import styles from './Factions.module.css';

const FACTION_TYPES = ['All', 'Imperium', 'Chaos', 'Xenos', 'Unaligned'] as const;
type FactionType = (typeof FACTION_TYPES)[number];

export function Factions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [factions, setFactions] = useState<FactionSummary[]>([]);
  const [filteredFactions, setFilteredFactions] = useState<FactionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<FactionType>('All');

  useEffect(() => {
    const fetchFactions = async () => {
      try {
        setLoading(true);
        const typeParam = searchParams.get('faction_type');
        const url = typeParam
          ? `${API_BASE_URL}${ENDPOINTS.FACTIONS}?faction_type=${typeParam}`
          : `${API_BASE_URL}${ENDPOINTS.FACTIONS}`;

        const { data } = await axios.get<FactionSummary[]>(url);
        setFactions(data);
        setFilteredFactions(data);
        if (typeParam && FACTION_TYPES.includes(typeParam as FactionType)) {
          setSelectedType(typeParam as FactionType);
        }
      } catch (err) {
        setError('Failed to load factions');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFactions();
  }, [searchParams]);

  const handleTypeChange = (type: FactionType) => {
    setSelectedType(type);
    if (type === 'All') {
      setFilteredFactions(factions);
      setSearchParams({});
    } else {
      const filtered = factions.filter((f) => f.faction_type === type);
      setFilteredFactions(filtered);
      setSearchParams({ faction_type: type });
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading factions...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  const totalUnits = factions.reduce((sum, f) => sum + f.unit_count, 0);
  const avgUnits = factions.length > 0 ? Math.round(totalUnits / factions.length) : 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles['title-section']}>
          <Heading level={1}>Factions</Heading>
          <p style={{ color: 'var(--secondary-text-color)', marginTop: 8 }}>
            {factions.length} factions • {totalUnits.toLocaleString()} total units
          </p>
        </div>

        <div className={styles.filters}>
          {FACTION_TYPES.map((type) => (
            <button
              key={type}
              className={`${styles['type-filter']} ${selectedType === type ? styles.active : ''}`}
              onClick={() => handleTypeChange(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className={styles['stats-bar']}>
        <div className={styles['stat-item']}>
          <div className={styles['stat-value']}>{factions.length}</div>
          <div className={styles['stat-label']}>Factions</div>
        </div>
        <div className={styles['stat-item']}>
          <div className={styles['stat-value']}>{totalUnits.toLocaleString()}</div>
          <div className={styles['stat-label']}>Total Units</div>
        </div>
        <div className={styles['stat-item']}>
          <div className={styles['stat-value']}>{avgUnits}</div>
          <div className={styles['stat-label']}>Avg Units/Faction</div>
        </div>
        <div className={styles['stat-item']}>
          <div className={styles['stat-value']}>
            {factions.filter((f) => f.faction_type === 'Imperium').length}
          </div>
          <div className={styles['stat-label']}>Imperium</div>
        </div>
      </div>

      {/* Faction Grid */}
      {filteredFactions.length === 0 ? (
        <div className={styles.empty}>No factions found for "{selectedType}"</div>
      ) : (
        <div className={styles.grid}>
          {filteredFactions.map((faction) => (
            <FactionCard
              key={faction.name}
              name={faction.name}
              faction_type={faction.faction_type}
              unit_count={faction.unit_count}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Factions;
