import cn from 'classnames';
import type { ChangeEvent } from 'react';
import { useState } from 'react';
import Button from '../Button/Button';
import styles from './Filter.module.css';
import type { FilterProps } from './Filter.props';

const FACTION_TYPES = ['Imperium', 'Chaos', 'Xenos', 'Unaligned'] as const;

function Filter({
  currentFilters,
  onFilterChange,
  onClear,
  availableFactions = [],
  availableKeywords = [],
}: FilterProps) {
  const [expanded, setExpanded] = useState(false);

  const handleSelectChange =
    (key: keyof typeof currentFilters) => (e: ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value || undefined;
      onFilterChange({ [key]: value });
    };

  const handleCheckboxChange =
    (key: keyof typeof currentFilters) => (e: ChangeEvent<HTMLInputElement>) => {
      onFilterChange({ [key]: e.target.checked ? true : undefined });
    };

  const handleKeywordToggle = (keyword: string) => {
    const current = currentFilters.keyword;
    onFilterChange({ keyword: current === keyword ? undefined : keyword });
  };

  return (
    <div className={styles.filter}>
      <div className={styles.header}>
        <h3 className={styles.title}>Filters</h3>
        <button className={styles['clear-btn']} onClick={onClear}>
          Clear all
        </button>
      </div>

      <div className={styles.grid}>
        {/* Faction Type */}
        <div className={styles.field}>
          <label className={styles.label}>Faction Type</label>
          <select
            className={styles.select}
            value={currentFilters.faction_type || ''}
            onChange={handleSelectChange('faction_type')}
          >
            <option value="">All Types</option>
            {FACTION_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Faction */}
        <div className={styles.field}>
          <label className={styles.label}>Faction</label>
          <select
            className={styles.select}
            value={currentFilters.faction || ''}
            onChange={handleSelectChange('faction')}
          >
            <option value="">All Factions</option>
            {availableFactions.map((faction) => (
              <option key={faction} value={faction}>
                {faction}
              </option>
            ))}
          </select>
        </div>

        {/* Unit Type */}
        <div className={styles.field}>
          <label className={styles.label}>Type</label>
          <select
            className={styles.select}
            value={currentFilters.type || ''}
            onChange={handleSelectChange('type')}
          >
            <option value="">All Types</option>
            <option value="unit">Unit</option>
            <option value="model">Model</option>
          </select>
        </div>

        {/* Points Range */}
        <div className={styles.field}>
          <label className={styles.label}>Points Range</label>
          <div className={styles['range-wrapper']}>
            {/* Min Range */}
            <div className={styles['range-control']}>
              <div className={styles['range-header']}>
                <span className={styles['range-label']}>Min</span>
                <span className={styles['range-value']}>{currentFilters.points_min ?? 0} pts</span>
              </div>
              <input
                type="range"
                className={styles['range-slider']}
                min={0}
                max={1000}
                step={25}
                value={currentFilters.points_min ?? 0}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  onFilterChange({
                    points_min: value,
                    ...(value > (currentFilters.points_max ?? 1000) && { points_max: value }),
                  });
                }}
              />
            </div>

            {/* Max Range */}
            <div className={styles['range-control']}>
              <div className={styles['range-header']}>
                <span className={styles['range-label']}>Max</span>
                <span className={styles['range-value']}>
                  {currentFilters.points_max ?? 1000} pts
                </span>
              </div>
              <input
                type="range"
                className={styles['range-slider']}
                min={0}
                max={1000}
                step={25}
                value={currentFilters.points_max ?? 1000}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  onFilterChange({
                    points_max: value,
                    ...(value < (currentFilters.points_min ?? 0) && { points_min: value }),
                  });
                }}
              />
            </div>
          </div>

          {/* Quick presets */}
          <div className={styles['range-presets']}>
            <button
              type="button"
              className={styles['preset-btn']}
              onClick={() => onFilterChange({ points_min: 0, points_max: 100 })}
            >
              ≤100
            </button>
            <button
              type="button"
              className={styles['preset-btn']}
              onClick={() => onFilterChange({ points_min: 101, points_max: 300 })}
            >
              101-300
            </button>
            <button
              type="button"
              className={styles['preset-btn']}
              onClick={() => onFilterChange({ points_min: 301, points_max: 1000 })}
            >
              ≥301
            </button>
            <button
              type="button"
              className={styles['preset-btn']}
              onClick={() => onFilterChange({ points_min: undefined, points_max: undefined })}
            >
              Any
            </button>
          </div>
        </div>

        {/* Boolean Filters */}
        <div className={styles.field}>
          <label className={styles.label}>Special</label>
          <label className={styles['checkbox-group']}>
            <input
              type="checkbox"
              checked={!!currentFilters.has_invuln}
              onChange={handleCheckboxChange('has_invuln')}
            />
            <span>Has Invulnerable Save</span>
          </label>
          <label className={styles['checkbox-group']}>
            <input
              type="checkbox"
              checked={!!currentFilters.has_transport}
              onChange={handleCheckboxChange('has_transport')}
            />
            <span>Is Transport</span>
          </label>
        </div>
      </div>

      {/* Keywords */}
      {availableKeywords.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <button
            className={styles['clear-btn']}
            onClick={() => setExpanded(!expanded)}
            style={{ padding: 0, fontSize: 13 }}
          >
            {expanded ? '▼ Hide Keywords' : '▶ Show Keywords'}
          </button>

          {expanded && (
            <div className={styles['keyword-chips']}>
              {availableKeywords.slice(0, 20).map((keyword) => (
                <span
                  key={keyword}
                  className={cn(styles['keyword-chip'], {
                    [styles.active]: currentFilters.keyword === keyword,
                  })}
                  onClick={() => handleKeywordToggle(keyword)}
                >
                  {keyword}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className={styles.actions}>
        <Button appearance="outline" size="small" onClick={onClear}>
          Reset
        </Button>
        <Button size="small" onClick={() => {}}>
          Apply Filters
        </Button>
      </div>
    </div>
  );
}

export default Filter;
