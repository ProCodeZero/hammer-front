import cn from 'classnames';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/Button/Button';
import Heading from '../../components/Heading/Heading';
import { compareActions } from '../../store/compare.slice';
import type { AppDispatch, RootState } from '../../store/store';
import { fetchUnitById } from '../../store/units.slice';
import styles from './UnitDetail.module.css';

export function UnitDetail() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items, loading, error } = useSelector((s: RootState) => s.units);
  const { comparedIds } = useSelector((s: RootState) => s.compare);
  const unit = items.find((u) => u.id === id);
  const isCompared = unit ? comparedIds.includes(unit.id) : false;
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    abilities: true,
  });

  useEffect(() => {
    if (id && !unit && !loading) {
      dispatch(fetchUnitById(id));
    }
  }, [dispatch, id, unit, loading]);

  const toggleCompare = () => {
    if (!unit) return;
    dispatch(compareActions.toggle(unit.id));
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const goBack = () => navigate(-1);

  if (loading && !unit) {
    return <div className={styles.loading}>Loading unit...</div>;
  }
  if (error) {
    return <div className={styles.error}>Error: {error}</div>;
  }
  if (!unit) {
    return (
      <div className={styles['not-found']}>
        <Heading>Unit Not Found</Heading>
        <p style={{ marginTop: 16 }}>
          <Link to="/units">← Back to Units</Link>
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles['back-btn']} onClick={goBack}>
          ← Back
        </button>
        <div className={styles['title-section']}>
          <h1 className={styles['unit-name']}>{unit.name}</h1>
          <p className={styles['unit-faction']}>
            <span className={cn(styles.badge, styles[unit.faction_type.toLowerCase()])}>
              {unit.faction_type}
            </span>
            {unit.faction}
          </p>
          <p className={styles['unit-type']}>
            {unit.type === 'model' ? 'Model' : 'Unit'}
            {unit.composition.min_models && unit.composition.max_models && (
              <span>
                {' '}
                • {unit.composition.min_models}-{unit.composition.max_models} models
              </span>
            )}
          </p>
        </div>
        <div className={styles['points-display']}>
          <p className={styles['points-value']}>{unit.points.base}</p>
          <p className={styles['points-label']}>points</p>
          {unit.points.variants.length > 1 && (
            <div className={styles['points-variants']}>
              {unit.points.variants.map((v, idx) => (
                <div key={idx} className={styles['variant-item']}>
                  <span>{v.models} models</span>
                  <span>{v.points} pts</span>
                </div>
              ))}
            </div>
          )}
          <Button
            className={styles['compare-btn']}
            appearance={isCompared ? 'primary' : 'outline'}
            size="small"
            onClick={toggleCompare}
          >
            {isCompared ? '✓ In Compare' : '⚖️ Add to Compare'}
          </Button>
        </div>
      </div>

      <div className={styles['main-grid']}>
        {/* Main Content */}
        <div>
          {/* Abilities Section */}
          {unit.abilities.length > 0 && (
            <div className={styles['content-section']}>
              <div className={styles['section-header']}>
                <h2 className={styles['section-title']}>Abilities</h2>
                <button
                  className={styles['section-toggle']}
                  onClick={() => toggleSection('abilities')}
                >
                  {expandedSections.abilities ? '▼ Collapse' : '▶ Expand'}
                </button>
              </div>
              {expandedSections.abilities && (
                <div className={styles['abilities-list']}>
                  {unit.abilities.map((ability, idx) => (
                    <div key={idx} className={styles['ability-card']}>
                      <h4 className={styles['ability-name']}>{ability.name}</h4>
                      <p className={styles['ability-desc']}>{ability.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Special Rules */}
          {unit.special_rules.length > 0 && (
            <div className={styles['content-section']}>
              <h2 className={styles['section-title']} style={{ marginBottom: 12 }}>
                Special Rules
              </h2>
              <div className={styles['special-rules']}>
                {unit.special_rules.map((rule, idx) => (
                  <span key={idx} className={styles['rule-tag']}>
                    {rule}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Keywords */}
          {unit.keywords.length > 0 && (
            <div className={styles['content-section']}>
              <h2 className={styles['section-title']} style={{ marginBottom: 12 }}>
                Keywords
              </h2>
              <div className={styles['keywords-list']}>
                {unit.keywords.map((kw) => (
                  <span key={kw} className={styles['keyword-tag']}>
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Stats */}
        <div className={styles['stats-panel']}>
          <Heading style={{ fontSize: 20, marginBottom: 16 }}>Core Stats</Heading>
          <div className={styles['stats-grid']}>
            <div className={styles['stat-box']}>
              <span className={styles['stat-label']}>Move</span>
              <span className={styles['stat-value']}>{unit.stats.M}"</span>
            </div>
            <div className={styles['stat-box']}>
              <span className={styles['stat-label']}>Toughness</span>
              <span className={styles['stat-value']}>{unit.stats.T}</span>
            </div>
            <div className={cn(styles['stat-box'], { [styles.highlight]: unit.invuln_save })}>
              <span className={styles['stat-label']}>Save</span>
              <span className={styles['stat-value']}>
                {unit.stats.SV}
                {unit.invuln_save && `/${unit.invuln_save}`}
              </span>
            </div>
            <div className={styles['stat-box']}>
              <span className={styles['stat-label']}>Wounds</span>
              <span className={styles['stat-value']}>{unit.stats.W}</span>
            </div>
            <div className={styles['stat-box']}>
              <span className={styles['stat-label']}>Leadership</span>
              <span className={styles['stat-value']}>{unit.stats.LD}+</span>
            </div>
            <div className={styles['stat-box']}>
              <span className={styles['stat-label']}>Objective</span>
              <span className={styles['stat-value']}>{unit.stats.OC}</span>
            </div>
          </div>
          <div className={styles['special-traits']}>
            {unit.invuln_save && (
              <div className={styles['trait-item']}>
                <span className={styles['trait-icon']}>🛡️</span>
                <span>Invulnerable Save: {unit.invuln_save}+</span>
              </div>
            )}
            {unit.transport && (
              <div className={styles['trait-item']}>
                <span className={styles['trait-icon']}>🚚</span>
                <span>Transport Capacity: {unit.transport}</span>
              </div>
            )}
          </div>
          {unit.composition.min_models && (
            <p className={styles.composition}>
              <strong>Composition:</strong> {unit.composition.min_models}
              {unit.composition.max_models && `-${unit.composition.max_models}`} models
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
