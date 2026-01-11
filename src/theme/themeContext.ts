import { createContext } from 'react';

export type ThemeMode = 'light' | 'dark';

export interface ThemeContextValue {
  mode: ThemeMode;
  toggleTheme: VoidFunction;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(
  undefined
);
