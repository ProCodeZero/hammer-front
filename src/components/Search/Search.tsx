import cn from 'classnames';
import type { ChangeEvent } from 'react';
import { useState } from 'react';
import styles from './Search.module.css';
import type { SearchProps } from './Search.props';

export function Search({
  placeholder = 'Search...',
  onSearch,
  size = 'medium',
  isLoading = false,
  className,
  value: controlledValue,
  onChange,
  ...props
}: SearchProps) {
  const [localValue, setLocalValue] = useState('');

  const value = controlledValue !== undefined ? controlledValue : localValue;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
    onChange?.(e);
  };

  const handleClear = () => {
    setLocalValue('');
    const event = { target: { value: '' } } as ChangeEvent<HTMLInputElement>;
    onChange?.(event);
    onSearch?.('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch?.(value as string);
    }
  };

  return (
    <div className={cn(styles.search, styles[size], className)}>
      <input
        type="search"
        className={styles.input}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        {...props}
      />
      <span className={styles.icon}></span>

      {value && !isLoading && (
        <button
          type="button"
          className={styles['clear-btn']}
          onClick={handleClear}
          aria-label="Clear search"
        >
          ×
        </button>
      )}

      {isLoading && <span className={styles.loading}>⏳</span>}
    </div>
  );
}

export default Search;
