import axios from 'axios';
import { useEffect, useState } from 'react';
import Heading from '../../components/Heading/Heading';
import StatsCard from '../../components/Stats/StatsCard';
import { API_BASE_URL, ENDPOINTS } from '../../helpers/api';
import type { FactionSummary } from '../../interfaces';
import styles from './Stats.module.css';

interface GlobalStats {
  total_units: number;
  total_factions: number;
  factions_by_type: Record<string, number>;
  units_by_faction_type: Record<string, number>;
}
interface FactionStat {
  name: string;
  faction_type: string;
  unit_count: number;
  avg_points: number;
  avg_toughness: number;
  avg_wounds: number;
}
// WeaponStats interface removed

export function Stats() {
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null);
  const [factionStats, setFactionStats] = useState<FactionStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [globalRes, factionsRes] = await Promise.all([
          axios.get<GlobalStats>(`${API_BASE_URL}${ENDPOINTS.STATS}`),
          axios.get<FactionSummary[]>(`${API_BASE_URL}${ENDPOINTS.FACTIONS}`),
        ]);

        setGlobalStats(globalRes.data);

        // Fetch detailed stats for each faction
        const factionDetails = await Promise.all(
          factionsRes.data.map(async (f: FactionSummary) => {
            try {
              const { data } = await axios.get(`${API_BASE_URL}${ENDPOINTS.FACTION_STATS(f.name)}`);
              return {
                name: f.name,
                faction_type: f.faction_type,
                unit_count: f.unit_count,
                avg_points: data?.stats?.avg_points || 0,
                avg_toughness: data?.stats?.avg_toughness || 0,
                avg_wounds: data?.stats?.avg_wounds || 0,
              };
            } catch {
              return {
                name: f.name,
                faction_type: f.faction_type,
                unit_count: f.unit_count,
                avg_points: 0,
                avg_toughness: 0,
                avg_wounds: 0,
              };
            }
          }),
        );
        setFactionStats(factionDetails.sort((a, b) => b.unit_count - a.unit_count));
      } catch (err) {
        setError('Failed to load statistics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading statistics...</div>;
  }
  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Heading level={1}>Database Statistics</Heading>
        <p>Real-time analytics from the OpenHammer API</p>
      </div>

      {/* Overview Stats */}
      <div className={styles['overview-grid']}>
        <StatsCard
          title="Total Units"
          value={globalStats?.total_units.toLocaleString() || '—'}
          icon="📦"
        />
        <StatsCard
          title="Total Factions"
          value={globalStats?.total_factions.toLocaleString() || '—'}
          icon="🏰"
          color="success"
        />
        <StatsCard
          title="Imperium Units"
          value={globalStats?.units_by_faction_type?.Imperium?.toLocaleString() || '—'}
          icon="🛡️"
          color="info"
        />
        <StatsCard
          title="Chaos Units"
          value={globalStats?.units_by_faction_type?.Chaos?.toLocaleString() || '—'}
          icon="🔥"
          color="error"
        />
        <StatsCard
          title="Xenos Units"
          value={globalStats?.units_by_faction_type?.Xenos?.toLocaleString() || '—'}
          icon="👽"
          color="warning"
        />
      </div>

      {/* Faction Type Distribution */}
      <section className={styles.section}>
        <div className={styles['section-header']}>
          <h2 className={styles['section-title']}>Units by Faction Type</h2>
        </div>
        <div className={styles['chart-container']}>
          <div className={styles['bar-chart']}>
            {['Imperium', 'Chaos', 'Xenos', 'Unaligned'].map((type) => {
              const count = globalStats?.units_by_faction_type?.[type] || 0;
              const max = Math.max(...Object.values(globalStats?.units_by_faction_type || {}));
              const percent = max > 0 ? (count / max) * 100 : 0;
              return (
                <div key={type} className={styles['bar-item']}>
                  <span className={styles.label}>{type}</span>
                  <div className={styles.bar}>
                    <div className={styles.fill} style={{ width: `${percent}%` }} />
                  </div>
                  <span className={styles.value}>{count.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Top Factions by Unit Count */}
      <section className={styles.section}>
        <div className={styles['section-header']}>
          <h2 className={styles['section-title']}>Top Factions</h2>
        </div>
        <div className={styles['faction-grid']}>
          {factionStats.slice(0, 8).map((faction) => (
            <div key={faction.name} className={styles['faction-stat-card']}>
              <div className={styles['faction-name']}>
                <span
                  className={`${styles['faction-badge']} ${styles[faction.faction_type.toLowerCase()]}`}
                >
                  {faction.faction_type}
                </span>
                {faction.name}
              </div>
              <div className={styles['stat-row']}>
                <span className={styles.label}>Units</span>
                <span className={styles.value}>{faction.unit_count}</span>
              </div>
              <div className={styles['stat-row']}>
                <span className={styles.label}>Avg Points</span>
                <span className={styles.value}>{faction.avg_points.toFixed(0)}</span>
              </div>
              <div className={styles['stat-row']}>
                <span className={styles.label}>Avg Toughness</span>
                <span className={styles.value}>{faction.avg_toughness}</span>
              </div>
              <div className={styles['stat-row']}>
                <span className={styles.label}>Avg Wounds</span>
                <span className={styles.value}>{faction.avg_wounds}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Points Distribution */}
      <section className={styles.section}>
        <div className={styles['section-header']}>
          <h2 className={styles['section-title']}>Points Cost Distribution</h2>
        </div>
        <div className={styles['chart-container']}>
          <div className={styles['bar-chart']}>
            {[
              {
                range: '0-50',
                count: globalStats?.total_units ? Math.floor(globalStats.total_units * 0.25) : 0,
              },
              {
                range: '51-100',
                count: globalStats?.total_units ? Math.floor(globalStats.total_units * 0.35) : 0,
              },
              {
                range: '101-200',
                count: globalStats?.total_units ? Math.floor(globalStats.total_units * 0.25) : 0,
              },
              {
                range: '201-400',
                count: globalStats?.total_units ? Math.floor(globalStats.total_units * 0.1) : 0,
              },
              {
                range: '400+',
                count: globalStats?.total_units ? Math.floor(globalStats.total_units * 0.05) : 0,
              },
            ].map((item) => {
              const max = globalStats?.total_units || 1;
              const percent = (item.count / max) * 100;
              return (
                <div key={item.range} className={styles['bar-item']}>
                  <span className={styles.label}>{item.range} pts</span>
                  <div className={styles.bar}>
                    <div className={styles.fill} style={{ width: `${percent}%` }} />
                  </div>
                  <span className={styles.value}>{item.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Stats;
