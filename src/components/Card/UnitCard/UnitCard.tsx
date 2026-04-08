import cn from 'classnames';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { compareActions } from '../../../store/compare.slice';
import type { AppDispatch, RootState } from '../../../store/store';
import styles from './UnitCard.module.css';
import type { UnitCardProps } from './UnitCard.props';

function UnitCard({ unit, compact = false }: UnitCardProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { comparedIds } = useSelector((state: RootState) => state.compare);

  const isCompared = comparedIds.includes(unit.id);

  const toggleCompare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(compareActions.toggle(unit.id));
  };

  return (
    <Link to={`/units/${unit.id}`} className={styles.link}>
      <div className={cn(styles.card, { [styles.compact]: compact })}>
        <div className={styles.header}>
          <span className={cn(styles.badge, styles[unit.faction_type.toLowerCase()])}>
            {unit.faction_type}
          </span>
          {unit.invuln_save && (
            <span className={styles.invuln} title="Invulnerable Save">
              ⚡ {unit.invuln_save}
            </span>
          )}
        </div>

        <h3 className={styles.name}>{unit.name}</h3>
        <p className={styles.faction}>{unit.faction}</p>

        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Points</span>
            <span className={styles.statValue}>{unit.points.base}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>W</span>
            <span className={styles.statValue}>{unit.stats.W}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>T</span>
            <span className={styles.statValue}>{unit.stats.T}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>SV</span>
            <span className={styles.statValue}>{unit.stats.SV}</span>
          </div>
        </div>

        {!compact && unit.keywords.length > 0 && (
          <div className={styles.keywords}>
            {unit.keywords.slice(0, 3).map((kw: string) => (
              <span key={kw} className={styles.keyword}>
                {kw}
              </span>
            ))}
            {unit.keywords.length > 3 && (
              <span className={styles.more}>+{unit.keywords.length - 3}</span>
            )}
          </div>
        )}

        <button
          className={cn(styles.compareBtn, {
            [styles.active]: isCompared,
          })}
          onClick={toggleCompare}
          type="button"
        >
          {isCompared ? '✓ Compared' : 'Compare'}
        </button>
      </div>
    </Link>
  );
}

export default UnitCard;
