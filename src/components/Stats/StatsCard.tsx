import cn from 'classnames';
import styles from './StatsCard.module.css';
import type { StatsCardProps } from './StatsCard.props';

function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  color = 'primary',
}: StatsCardProps) {
  return (
    <div className={cn(styles.card, styles[color])}>
      {icon && <div className={styles['icon-wrapper']}>{icon}</div>}

      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.value}>{value}</p>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}

        {trend && trendValue && (
          <span className={cn(styles.trend, styles[trend])}>
            {trend === 'up' && '↑'}
            {trend === 'down' && '↓'}
            {trend === 'neutral' && '→'}
            {trendValue}
          </span>
        )}
      </div>
    </div>
  );
}

export default StatsCard;
