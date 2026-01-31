import { Institution } from '../types';

export interface ThemeColors {
  '--color-primary': string;
  '--color-primary-dark': string;
  '--color-secondary': string;
  '--color-secondary-light': string;
  '--color-accent': string;
  '--color-danger': string;
  '--color-gold': string;
  '--color-info': string;
}

export const THEMES: Record<Institution, ThemeColors> = {
  PMMG: {
    '--color-primary': '#002147', // Navy
    '--color-primary-dark': '#001530',
    '--color-secondary': '#c5b39a', // Khaki
    '--color-secondary-light': '#dcd1c1',
    '--color-accent': '#ffcc00', // Yellow
    '--color-danger': '#e31c1c', // Red
    '--color-gold': '#d4af37', // Gold
    '--color-info': '#0047ab', // Blue
  },
  PMESP: {
    '--color-primary': '#050505', // Black/Dark Navy
    '--color-primary-dark': '#000000',
    '--color-secondary': '#424243', // Dark Grey/Uniform
    '--color-secondary-light': '#555555',
    '--color-accent': '#ffcc00', // Yellow/Gold
    '--color-danger': '#e31c1c', // Red
    '--color-gold': '#d4af37', // Gold
    '--color-info': '#0047ab', // Blue (Neutral Info)
  },
};

export const applyTheme = (institution: Institution) => {
  const theme = THEMES[institution];
  const root = document.documentElement;
  if (root) {
    Object.entries(theme).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
  }
};