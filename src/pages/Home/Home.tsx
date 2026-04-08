import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button';
import FactionCard from '../../components/Card/FactionCard/FactionCard';
import UnitCard from '../../components/Card/UnitCard/UnitCard';
import Heading from '../../components/Heading/Heading';
import Search from '../../components/Search/Search';
import StatsCard from '../../components/Stats/StatsCard';
import { API_BASE_URL, ENDPOINTS } from '../../helpers/api';
import type { FactionSummary, Unit } from '../../interfaces';
import styles from './Home.module.css';

export function Home() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState<{
    total_units: number;
    total_factions: number;
    factions_by_type: Record<string, number>;
  } | null>(null);
  const [recentUnits, setRecentUnits] = useState<Unit[]>([]);
  const [factions, setFactions] = useState<FactionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, unitsRes, factionsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}${ENDPOINTS.STATS}`),
          axios.get(`${API_BASE_URL}${ENDPOINTS.UNITS}`, {
            params: { limit: 6, sort_by: '-points' },
          }),
          axios.get(`${API_BASE_URL}${ENDPOINTS.FACTIONS}`),
        ]);

        setStats(statsRes.data);
        const rawUnits = unitsRes.data;
        const safeUnits = Array.isArray(rawUnits) ? rawUnits : rawUnits?.units || [];
        setRecentUnits(safeUnits);
        setFactions(factionsRes.data);
      } catch (error) {
        console.error('Failed to fetch home data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSearch = (value: string) => {
    if (value.trim()) {
      navigate(`/units?name=${encodeURIComponent(value.trim())}`);
    }
  };

  const handleRandomUnit = async () => {
    try {
      const { data } = await axios.get<Unit>(`${API_BASE_URL}${ENDPOINTS.UNITS_RANDOM}`, {
        params: { _t: Date.now() },
      });
      navigate(`/units/${data.id}`);
    } catch (error) {
      console.error('Failed to fetch random unit:', error);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading OpenHammer...</div>;
  }

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <Heading level={1} className={styles['hero-title']}>
          Warhammer 40K Unit Database
        </Heading>
        <p className={styles['hero-subtitle']}>
          Search, compare, and explore thousands of units from all factions. Build your army with
          confidence.
        </p>
        <div className={styles['hero-actions']}>
          <Button onClick={() => navigate('/units')} size="large">
            Browse Units
          </Button>
          <Button appearance="outline" size="large" onClick={handleRandomUnit}>
            🎲 Random Unit
          </Button>
        </div>
      </section>

      {/* Quick Search */}
      <section className={styles['quick-search']}>
        <Heading level={2} className={styles['quick-search-title']}>
          Find Your Unit
        </Heading>
        <div className={styles['search-container']}>
          <Search
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSearch={handleSearch}
            placeholder="Search by unit name, faction, or keyword..."
            size="large"
          />
        </div>
      </section>

      {/* Stats Overview */}
      <section className={styles['stats-overview']}>
        <StatsCard
          title="Total Units"
          value={stats?.total_units.toLocaleString() || '—'}
          icon="⚔️"
          color="primary"
        />
        <StatsCard
          title="Factions"
          value={stats?.total_factions.toLocaleString() || '—'}
          icon="🏛️"
          color="success"
        />
        <StatsCard
          title="Imperium Units"
          value={stats?.factions_by_type?.Imperium?.toLocaleString() || '—'}
          icon="🛡️"
          color="primary"
        />
        <StatsCard
          title="Chaos Units"
          value={stats?.factions_by_type?.Chaos?.toLocaleString() || '—'}
          icon="🔥"
          color="error"
        />
      </section>

      {/* Features */}
      <section className={styles.features}>
        <div className={styles['feature-card']}>
          <div className={styles['feature-icon']}>🔍</div>
          <h3 className={styles['feature-title']}>Advanced Search</h3>
          <p className={styles['feature-desc']}>
            Filter by faction, points, keywords, and special rules to find exactly what you need.
          </p>
        </div>
        <div className={styles['feature-card']}>
          <div className={styles['feature-icon']}>⚖️</div>
          <h3 className={styles['feature-title']}>Unit Comparison</h3>
          <p className={styles['feature-desc']}>
            Compare up to 4 units side-by-side to make informed army building decisions.
          </p>
        </div>
        <div className={styles['feature-card']}>
          <div className={styles['feature-icon']}>📊</div>
          <h3 className={styles['feature-title']}>Statistics</h3>
          <p className={styles['feature-desc']}>
            Explore faction stats, weapon distributions, and meta trends across the game.
          </p>
        </div>
      </section>

      {/* Recent Expensive Units */}
      <section className={styles['recent-section']}>
        <div className={styles['section-header']}>
          <Heading level={2}>Most Powerful Units</Heading>
          <Link to="/units?sort_by=-points" className={styles['view-all']}>
            View All →
          </Link>
        </div>
        <div className={styles['units-grid']}>
          {recentUnits.map((unit) => (
            <UnitCard key={unit.id} unit={unit} />
          ))}
        </div>
      </section>

      {/* Faction Preview */}
      <section className={styles['recent-section']} style={{ marginTop: 40 }}>
        <div className={styles['section-header']}>
          <Heading level={2}>Explore Factions</Heading>
          <Link to="/factions" className={styles['view-all']}>
            All Factions →
          </Link>
        </div>
        <div className={styles['units-grid']}>
          {factions.slice(0, 4).map((faction) => (
            <FactionCard
              key={faction.name}
              name={faction.name}
              faction_type={faction.faction_type}
              unit_count={faction.unit_count}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
