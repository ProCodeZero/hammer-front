import type { InputHTMLAttributes } from 'react';

export interface SearchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  placeholder?: string;
  onSearch?: (value: string) => void;
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
}
