import cn from 'classnames';
import { Link } from 'react-router-dom';
import styles from './FactionCard.module.css';
import type { FactionCardProps } from './FactionCard.props';

function FactionCard({ name, faction_type, unit_count, onClick }: FactionCardProps) {
  return (
    <Link to={`/factions/${encodeURIComponent(name)}`} className={styles.link} onClick={onClick}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={cn(styles.badge, styles[faction_type.toLowerCase()])}>
            {faction_type}
          </span>
          <span className={styles['unit-count']}>{unit_count} units</span>
        </div>

        <h3 className={styles.name}>{name}</h3>

        <div className={styles['stats-preview']}>
          <div className={styles['stat-item']}>
            <span className={styles['stat-value']}>{unit_count}</span>
            <span className={styles['stat-label']}>Units</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default FactionCard;
