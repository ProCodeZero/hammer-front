import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/Button/Button';
import Heading from '../../components/Heading/Heading';
import { compareActions } from '../../store/compare.slice';
import type { AppDispatch, RootState } from '../../store/store';
import { fetchUnitById } from '../../store/units.slice';
import styles from './Compare.module.css';

export function Compare() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { comparedIds } = useSelector((s: RootState) => s.compare);
  const { items: allUnits } = useSelector((s: RootState) => s.units);

  const comparedUnits = comparedIds
    .map((id) => allUnits.find((u) => u.id === id))
    .filter((u): u is NonNullable<typeof u> => u !== undefined);

  useEffect(() => {
    comparedIds.forEach((id) => {
      if (!allUnits.find((u) => u.id === id)) {
        dispatch(fetchUnitById(id));
      }
    });
  }, [dispatch, comparedIds, allUnits]);

  const clearCompare = () => dispatch(compareActions.clear());
  const removeUnit = (id: string) => dispatch(compareActions.remove(id));
  const goToUnits = () => navigate('/units');

  if (comparedUnits.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles['empty-state']}>
          <h3>No units to compare</h3>
          <p>Search for units and add them to comparison to see them side-by-side.</p>
          <Button onClick={goToUnits}>Browse Units</Button>
          <div className={styles['search-hint']}>
            Click the "Compare" button on any unit card to add it here
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Heading className={styles.title}>Compare Units ({comparedUnits.length})</Heading>
        <button className={styles['clear-btn']} onClick={clearCompare}>
          Clear All
        </button>
      </div>
      <div className={styles['comparison-grid']}>
        {comparedUnits.map((unit) => (
          <div key={unit.id} className={styles['unit-compare-card']}>
            <button
              className={styles['remove-btn']}
              onClick={() => removeUnit(unit.id)}
              title="Remove from comparison"
            >
              ✕
            </button>
            <div className={styles['unit-header']}>
              <h3 className={styles['unit-name']}>{unit.name}</h3>
              <p className={styles['unit-faction']}>{unit.faction}</p>
              <p className={styles['unit-points']}>{unit.points.base} pts</p>
            </div>

            {/* Core Stats */}
            <table className={styles['stats-table']}>
              <thead>
                <tr>
                  <th>M</th>
                  <th>T</th>
                  <th>SV</th>
                  <th>W</th>
                  <th>LD</th>
                  <th>OC</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{unit.stats.M}</td>
                  <td>{unit.stats.T}</td>
                  <td>{unit.stats.SV}</td>
                  <td>{unit.stats.W}</td>
                  <td>{unit.stats.LD}</td>
                  <td>{unit.stats.OC}</td>
                </tr>
              </tbody>
            </table>

            {/* Invuln & Transport */}
            {(unit.invuln_save || unit.transport) && (
              <div style={{ marginBottom: 16 }}>
                {unit.invuln_save && (
                  <p style={{ margin: '4px 0', fontSize: 13 }}>
                    <strong>Invuln:</strong> {unit.invuln_save}
                  </p>
                )}
                {unit.transport && (
                  <p style={{ margin: '4px 0', fontSize: 13 }}>
                    <strong>Transport:</strong> {unit.transport}
                  </p>
                )}
              </div>
            )}

            {/* Abilities */}
            {unit.abilities.length > 0 && (
              <>
                <h4 className={styles['section-title']}>Abilities</h4>
                <div className={styles['abilities-list']}>
                  {unit.abilities.slice(0, 3).map((ability, idx) => (
                    <div key={idx} className={styles['ability-item']}>
                      <div className={styles['ability-name']}>{ability.name}</div>
                      <div className={styles['ability-desc']}>
                        {ability.description.length > 100
                          ? ability.description.slice(0, 100) + '...'
                          : ability.description}
                      </div>
                    </div>
                  ))}
                  {unit.abilities.length > 3 && (
                    <span style={{ fontSize: 12, color: 'var(--secondary-text-color)' }}>
                      +{unit.abilities.length - 3} more
                    </span>
                  )}
                </div>
              </>
            )}

            {/* Keywords */}
            {unit.keywords.length > 0 && (
              <>
                <h4 className={styles['section-title']} style={{ marginTop: 16 }}>
                  Keywords
                </h4>
                <div className={styles['keywords-list']}>
                  {unit.keywords.slice(0, 6).map((kw) => (
                    <span key={kw} className={styles['keyword-tag']}>
                      {kw}
                    </span>
                  ))}
                  {unit.keywords.length > 6 && (
                    <span className={styles['keyword-tag']}>+{unit.keywords.length - 6}</span>
                  )}
                </div>
              </>
            )}
          </div>
        ))}

        {/* Add More Slot */}
        {comparedUnits.length < 4 && (
          <div className={styles['add-more']} onClick={goToUnits}>
            <p className={styles['add-more-text']}>+ Add Another Unit</p>
          </div>
        )}
      </div>
    </div>
  );
}
