import cn from 'classnames';
import styles from './WeaponCard.module.css';
import type { WeaponCardProps } from './WeaponCard.props';

function WeaponCard({ weapon, type, compact = false }: WeaponCardProps) {
  const statLabels =
    type === 'ranged'
      ? { A: 'Att', BS: 'BS', S: 'Str', AP: 'AP', D: 'Dmg', Range: 'Range' }
      : { A: 'Att', WS: 'WS', S: 'Str', AP: 'AP', D: 'Dmg', Range: 'Range' };

  return (
    <div
      className={cn(styles.card, { [styles.melee]: type === 'melee', [styles.compact]: compact })}
    >
      <div className={styles.header}>
        <h4 className={styles.name}>{weapon.name}</h4>
        <span className={cn(styles['type-badge'], { [styles.melee]: type === 'melee' })}>
          {type}
        </span>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles['stat-label']}>{statLabels.Range}</span>
          <span className={styles['stat-value']}>{weapon.Range}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles['stat-label']}>{statLabels.A}</span>
          <span className={styles['stat-value']}>{weapon.A}</span>
        </div>
        {type === 'ranged' && weapon.BS && (
          <div className={styles.stat}>
            <span className={styles['stat-label']}>{statLabels.BS}</span>
            <span className={styles['stat-value']}>{weapon.BS}</span>
          </div>
        )}
        {type === 'melee' && weapon.WS && (
          <div className={styles.stat}>
            <span className={styles['stat-label']}>{statLabels.WS}</span>
            <span className={styles['stat-value']}>{weapon.WS}</span>
          </div>
        )}
        <div className={styles.stat}>
          <span className={styles['stat-label']}>{statLabels.S}</span>
          <span className={styles['stat-value']}>{weapon.S}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles['stat-label']}>{statLabels.AP}</span>
          <span className={styles['stat-value']}>{weapon.AP}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles['stat-label']}>{statLabels.D}</span>
          <span className={styles['stat-value']}>{weapon.D}</span>
        </div>
      </div>

      {weapon.Keywords && (
        <div className={styles.keywords}>
          {weapon.Keywords.split(', ').map((kw) => (
            <span key={kw} className={styles.keyword}>
              {kw}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default WeaponCard;
