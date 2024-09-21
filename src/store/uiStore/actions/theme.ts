import { UIState } from '../state';
import { Theme } from '../types';
import { saveSettings } from '.';

export const setTheme = (state: UIState, newTheme: Theme) => {
  state.theme = newTheme;
  saveSettings(state);
  applyTheme(state);
};

export const applyTheme = (state: UIState) => {
  const isDark =
    state.theme === 'dark' ||
    (state.theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  document.documentElement.classList.toggle('dark', isDark);
  updateThemeColor(isDark);
  updateFavicon(isDark);
};

export const updateThemeColor = (isDark: boolean) => {
  const color = isDark ? '#424242' : '#f7f4e4';
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute('content', color);
};

export const updateFavicon = (isDark: boolean) => {
  const faviconPath = isDark
    ? '/icons/dark/favicon.ico'
    : '/icons/light/favicon.ico';
  document.querySelector('link[rel="icon"]')?.setAttribute('href', faviconPath);
};
