import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button';
import Heading from '../../components/Heading/Heading';
import Search from '../../components/Search/Search';
import { API_BASE_URL, ENDPOINTS } from '../../helpers/api';
import type { Unit, Weapon } from '../../interfaces/unit.interface';
import styles from './Weapons.module.css';

type WeaponType = 'all' | 'ranged' | 'melee';

interface WeaponEntry {
  name: string;
  type: 'ranged' | 'melee';
  stats: {
    Range: string;
    A: string;
    S: string;
    AP: string;
    D: string;
    BS?: string;
    WS?: string;
  };
  keywords: string[];
  units_count: number;
  units: Array<{ name: string; id: string; faction: string }>;
}

export function Weapons() {
  const navigate = useNavigate();

  const [weapons, setWeapons] = useState<WeaponEntry[]>([]);
  const [weaponStats, setWeaponStats] = useState<{
    total_weapon_entries: number;
    ranged: { count: number; avg_damage: number };
    melee: { count: number; avg_damage: number };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [weaponType, setWeaponType] = useState<WeaponType>('all');
  const [limit, setLimit] = useState(24);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsRes, weaponsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}${ENDPOINTS.WEAPONS_STATS}`),
          axios.get(`${API_BASE_URL}${ENDPOINTS.WEAPONS_LIST}`, {
            params: {
              weapon_type: weaponType === 'all' ? undefined : weaponType,
              limit: 50,
            },
          }),
        ]);

        setWeaponStats(statsRes.data);

        // Fetch details for each weapon
        const weaponNames = weaponsRes.data.slice(0, limit);
        const detailsPromises = weaponNames.map((name: string) =>
          axios.get(`${API_BASE_URL}${ENDPOINTS.WEAPONS_SEARCH(name)}`),
        );

        const detailsResults = await Promise.all(detailsPromises);
        const enrichedWeapons = detailsResults.map((res, idx) => {
          const units = res.data || [];
          const firstUnit = units[0];
          const weapon =
            firstUnit?.weapons?.ranged?.find((w: Weapon) => w.name === weaponNames[idx]) ||
            firstUnit?.weapons?.melee?.find((w: Weapon) => w.name === weaponNames[idx]);

          return {
            name: weaponNames[idx],
            type:
              weaponType === 'all'
                ? firstUnit?.weapons?.ranged?.some((w: Weapon) => w.name === weaponNames[idx])
                  ? 'ranged'
                  : 'melee'
                : weaponType,
            stats: weapon
              ? {
                  Range: weapon.Range,
                  A: weapon.A,
                  S: weapon.S,
                  AP: weapon.AP,
                  D: weapon.D,
                  BS: weapon.BS,
                  WS: weapon.WS,
                }
              : { Range: '-', A: '-', S: '-', AP: '-', D: '-' },
            keywords: weapon?.Keywords?.split(', ') || [],
            units_count: units.length,
            units: units.slice(0, 3).map((u: Unit) => ({
              name: u.name,
              id: u.id,
              faction: u.faction,
            })),
          };
        });

        setWeapons(enrichedWeapons);
      } catch (err) {
        setError('Failed to load weapons data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [weaponType, limit]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      navigate(`/units?name=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleTypeChange = (type: WeaponType) => {
    setWeaponType(type);
    setLimit(24);
  };

  const handleLoadMore = () => {
    setLimit((prev) => prev + 24);
  };

  const handleUnitClick = (unitId: string) => {
    navigate(`/units/${unitId}`);
  };

  if (loading && weapons.length === 0) {
    return <div className={styles.loading}>Loading weapons...</div>;
  }

  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }

  const filteredWeapons = weapons.filter((w) =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <Heading level={1}>Weapons Database</Heading>
          <p style={{ color: 'var(--secondary-text-color)', marginTop: 8 }}>
            Explore ranged and melee weapons across all factions
          </p>
        </div>

        <div className={styles['search-section']}>
          <Search
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onSearch={handleSearch}
            placeholder="Search weapons or units..."
          />
        </div>
      </div>

      {/* Filters */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div className={styles.filters}>
          <span style={{ color: 'var(--secondary-text-color)', fontSize: '0.9rem' }}>Type:</span>
          <div className={styles['type-toggle']}>
            {(['all', 'ranged', 'melee'] as WeaponType[]).map((type) => (
              <button
                key={type}
                className={`${styles['type-btn']} ${weaponType === type ? styles.active : ''}`}
                onClick={() => handleTypeChange(type)}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {weaponStats && (
          <span style={{ color: 'var(--secondary-text-color)', fontSize: '0.9rem' }}>
            Showing {filteredWeapons.length} of {weaponStats.total_weapon_entries} weapons
          </span>
        )}
      </div>

      {/* Stats */}
      {weaponStats && (
        <div className={styles['stats-bar']}>
          <div className={styles['stat-item']}>
            <div className={styles.value}>{weaponStats.total_weapon_entries}</div>
            <div className={styles.label}>Total Weapons</div>
          </div>
          <div className={styles['stat-item']}>
            <div className={styles.value}>{weaponStats.ranged?.count || 0}</div>
            <div className={styles.label}>Ranged</div>
          </div>
          <div className={styles['stat-item']}>
            <div className={styles.value}>{weaponStats.melee?.count || 0}</div>
            <div className={styles.label}>Melee</div>
          </div>
          <div className={styles['stat-item']}>
            <div className={styles.value}>{weaponStats.ranged?.avg_damage?.toFixed(1) || '-'}</div>
            <div className={styles.label}>Avg Ranged Dmg</div>
          </div>
        </div>
      )}

      {/* Weapons Grid */}
      {filteredWeapons.length === 0 ? (
        <div className={styles.empty}>No weapons found matching "{searchQuery}"</div>
      ) : (
        <div className={styles.grid}>
          {filteredWeapons.map((weapon) => (
            <div
              key={weapon.name}
              className={`${styles['weapon-card']} ${weapon.type === 'melee' ? styles.melee : ''}`}
            >
              <div className={styles['weapon-header']}>
                <h3 className={styles['weapon-name']}>{weapon.name}</h3>
                <span className={`${styles['weapon-type']} ${styles[weapon.type]}`}>
                  {weapon.type}
                </span>
              </div>

              <div className={styles['weapon-stats']}>
                <div className={styles.stat}>
                  <span className={styles['stat-label']}>Range</span>
                  <span className={styles['stat-value']}>{weapon.stats.Range}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles['stat-label']}>Att</span>
                  <span className={styles['stat-value']}>{weapon.stats.A}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles['stat-label']}>Str</span>
                  <span className={styles['stat-value']}>{weapon.stats.S}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles['stat-label']}>AP</span>
                  <span className={styles['stat-value']}>{weapon.stats.AP}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles['stat-label']}>Dmg</span>
                  <span className={styles['stat-value']}>{weapon.stats.D}</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles['stat-label']}>
                    {weapon.type === 'ranged' ? 'BS' : 'WS'}
                  </span>
                  <span className={styles['stat-value']}>
                    {weapon.type === 'ranged' ? weapon.stats.BS || '-' : weapon.stats.WS || '-'}
                  </span>
                </div>
              </div>

              {weapon.keywords.length > 0 && (
                <div className={styles['weapon-keywords']}>
                  {weapon.keywords.slice(0, 4).map((kw) => (
                    <span key={kw} className={styles.keyword}>
                      {kw}
                    </span>
                  ))}
                  {weapon.keywords.length > 4 && (
                    <span className={styles.keyword}>+{weapon.keywords.length - 4}</span>
                  )}
                </div>
              )}

              <div className={styles['units-equipped']}>
                Equipped on <strong>{weapon.units_count}</strong> units
                {weapon.units.length > 0 && (
                  <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {weapon.units.map((u) => (
                      <button
                        key={u.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnitClick(u.id);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary-color)',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          padding: 0,
                          textDecoration: 'underline',
                        }}
                      >
                        {u.name}
                      </button>
                    ))}
                    {weapon.units_count > 3 && (
                      <span style={{ color: 'var(--secondary-text-color)' }}>
                        +{weapon.units_count - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Load More */}
      {filteredWeapons.length < weapons.length && (
        <div className={styles['load-more']}>
          <Button appearance="outline" onClick={handleLoadMore}>
            Load More Weapons
          </Button>
        </div>
      )}
    </div>
  );
}

export default Weapons;
