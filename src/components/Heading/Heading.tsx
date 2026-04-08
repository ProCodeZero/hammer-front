import cn from 'classnames';
import styles from './Heading.module.css';
import type { HeadingProps } from './Heading.props';

export function Heading({
  children,
  level = 2,
  variant = 'default',
  className,
  ...props
}: HeadingProps) {
  const commonProps = {
    className: cn(
      styles.heading,
      styles[`heading-${level}`],
      variant !== 'default' && styles[`variant-${variant}`],
      className,
    ),
    ...props,
    children,
  } as const;

  switch (level) {
    case 1:
      return <h1 {...commonProps} />;
    case 2:
      return <h2 {...commonProps} />;
    case 3:
      return <h3 {...commonProps} />;
    case 4:
      return <h4 {...commonProps} />;
    case 5:
      return <h5 {...commonProps} />;
    case 6:
      return <h6 {...commonProps} />;
    default:
      return <h2 {...commonProps} />;
  }
}

export default Heading;
