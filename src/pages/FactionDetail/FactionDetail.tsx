import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/Button/Button';
import UnitCard from '../../components/Card/UnitCard/UnitCard';
import Heading from '../../components/Heading/Heading';
import { API_BASE_URL, ENDPOINTS } from '../../helpers/api';
import type { FactionDetails, FactionStats, Unit } from '../../interfaces';
import styles from './FactionDetail.module.css';

export function FactionDetail() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();

  const [faction, setFaction] = useState<FactionDetails | null>(null);
  const [factionStats, setFactionStats] = useState<FactionStats | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!name) {
      navigate('/factions');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [detailsRes, statsRes, unitsRes] = await Promise.all([
          axios.get<FactionDetails>(`${API_BASE_URL}${ENDPOINTS.FACTION_DETAILS(name)}`),
          axios.get<FactionStats>(`${API_BASE_URL}${ENDPOINTS.FACTION_STATS(name)}`),
          axios.get<{ units: Unit[] }>(`${API_BASE_URL}${ENDPOINTS.FACTION_UNITS(name)}`, {
            params: { limit: 12 },
          }),
        ]);

        setFaction(detailsRes.data);
        setFactionStats(statsRes.data);
        setUnits(unitsRes.data.units);
      } catch (err) {
        setError('Failed to load faction data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [name, navigate]);

  const goBack = () => navigate(-1);

  if (loading) {
    return <div className={styles.loading}>Loading faction...</div>;
  }

  if (error || !faction) {
    return (
      <div className={styles.error}>
        <Heading level={2}>Faction Not Found</Heading>
        <p style={{ marginTop: 16 }}>
          <Link to="/factions">← Back to Factions</Link>
        </p>
      </div>
    );
  }

  const totalUnits = Object.values(faction.unit_breakdown).reduce((a, b) => a + b, 0);

  return (
    <div className={styles.container}>
      <button className={styles['back-btn']} onClick={goBack}>
        ← Back
      </button>

      <header className={styles.header}>
        <div className={styles['faction-header']}>
          <div className={styles['faction-info']}>
            <span
              className={`${styles['faction-type']} ${styles[faction.faction_type.toLowerCase()]}`}
            >
              {faction.faction_type}
            </span>
            <h1 className={styles['faction-name']}>{faction.name}</h1>
            <p className={styles['faction-desc']}>
              {totalUnits} units across {Object.keys(faction.unit_breakdown).length} types
            </p>
          </div>

          <div className={styles['faction-stats']}>
            <div className={styles['stat-card']}>
              <div className={styles.value}>{faction.stats.avg_points.toFixed(0)}</div>
              <div className={styles.label}>Avg Points</div>
            </div>
            <div className={styles['stat-card']}>
              <div className={styles.value}>{faction.stats.avg_toughness}</div>
              <div className={styles.label}>Avg Toughness</div>
            </div>
            <div className={styles['stat-card']}>
              <div className={styles.value}>{faction.stats.avg_wounds}</div>
              <div className={styles.label}>Avg Wounds</div>
            </div>
          </div>
        </div>
      </header>

      <div className={styles['content-grid']}>
        {/* Main Content */}
        <div>
          {/* Unit Breakdown */}
          <section className={styles.section}>
            <h2 className={styles['section-title']}>Unit Breakdown</h2>
            <div className={styles['unit-breakdown']}>
              {Object.entries(faction.unit_breakdown).map(([type, count]) => (
                <div key={type} className={styles['breakdown-item']}>
                  <span className={styles.type}>{type}</span>
                  <span className={styles.count}>{count}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Keywords */}
          {faction.keywords.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles['section-title']}>Keywords</h2>
              <div className={styles['keywords-list']}>
                {faction.keywords.slice(0, 20).map((kw) => (
                  <span key={kw.keyword} className={styles['keyword-tag']}>
                    {kw.keyword} ({kw.count})
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Special Rules */}
          {faction.special_rules.length > 0 && (
            <section className={styles.section}>
              <h2 className={styles['section-title']}>Special Rules</h2>
              <div className={styles['rules-list']}>
                {faction.special_rules.map((rule) => (
                  <span key={rule} className={styles['rule-tag']}>
                    {rule}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Units Preview */}
          <section className={styles.section}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <h2 className={styles['section-title']} style={{ marginBottom: 0 }}>
                Featured Units
              </h2>
              <Link
                to={`/units?faction=${encodeURIComponent(faction.name)}`}
                className={styles['view-all']}
              >
                View All {totalUnits} Units →
              </Link>
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 16,
              }}
            >
              {units.map((unit) => (
                <UnitCard key={unit.id} unit={unit} />
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div>
          {/* Points Distribution */}
          {factionStats?.points_distribution && (
            <section className={styles['sidebar-section']}>
              <h3 className={styles['section-title']}>Points Distribution</h3>
              <div className={styles['points-chart']}>
                {Object.entries(factionStats.points_distribution)
                  .slice(0, 6)
                  .map(([range, count]) => {
                    const max = Math.max(...Object.values(factionStats.points_distribution));
                    const percent = (count / max) * 100;
                    return (
                      <div key={range} className={styles['chart-bar']}>
                        <span className={styles.range}>{range}</span>
                        <div className={styles.bar}>
                          <div className={styles.fill} style={{ width: `${percent}%` }} />
                        </div>
                        <span className={styles.value}>{count}</span>
                      </div>
                    );
                  })}
              </div>
            </section>
          )}

          {/* Top Weapons */}
          {factionStats !== null &&
            factionStats.weapons?.most_common &&
            factionStats.weapons.most_common.length > 0 && (
              <section className={styles['sidebar-section']}>
                <h3 className={styles['section-title']}>Common Weapons</h3>
                <div className={styles['top-weapons']}>
                  {factionStats.weapons.most_common.slice(0, 5).map((weapon) => (
                    <div key={weapon} className={styles['weapon-item']}>
                      <div className={styles['weapon-name']}>{weapon}</div>
                      <div className={styles['weapon-count']}>
                        {factionStats.weapons.most_common.filter((w) => w === weapon).length} units
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

          {/* Invulnerable Saves */}
          {factionStats?.invulnerable_saves &&
            Object.keys(factionStats.invulnerable_saves).length > 0 && (
              <section className={styles['sidebar-section']}>
                <h3 className={styles['section-title']}>Invulnerable Saves</h3>
                <div className={styles['unit-breakdown']}>
                  {Object.entries(factionStats.invulnerable_saves).map(([save, count]) => (
                    <div key={save} className={styles['breakdown-item']}>
                      <span className={styles.type}>{save}+</span>
                      <span className={styles.count}>{count}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

          {/* Quick Actions */}
          <section className={styles['sidebar-section']}>
            <h3 className={styles['section-title']}>Quick Actions</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Button
                appearance="outline"
                onClick={() =>
                  navigate(`/units?faction=${encodeURIComponent(faction.name)}&sort_by=-points`)
                }
              >
                Most Expensive
              </Button>
              <Button
                appearance="outline"
                onClick={() =>
                  navigate(`/units?faction=${encodeURIComponent(faction.name)}&sort_by=points`)
                }
              >
                Cheapest Units
              </Button>
              <Button
                appearance="ghost"
                onClick={() => {
                  const keywords = faction.keywords.map((k) => k.keyword).join(',');
                  navigate(
                    `/units?faction=${encodeURIComponent(faction.name)}&keyword=${encodeURIComponent(keywords.split(',')[0])}`,
                  );
                }}
              >
                Filter by Keywords
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default FactionDetail;
