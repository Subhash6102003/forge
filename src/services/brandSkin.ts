import brandTokens from '../styles/brand.tokens.json';
import { ThemeId, ThemeMode } from '../types';

export class BrandSkinService {
  static getTokens() {
    return brandTokens;
  }

  static applyTheme(theme: ThemeId, mode: ThemeMode) {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-mode', mode);
  }

  static getThemeDetails(theme: ThemeId) {
    const map: Record<ThemeId, { name: string; description: string; primary: string; accent: string }> = {
      'modern-stone': {
        name: 'Modern Stone',
        description: 'Warm neutral grays with terracotta accent. Calm and fatigue-reducing.',
        primary: '#4A4A4A',
        accent: '#D97757',
      },
      'enterprise-slate': {
        name: 'Enterprise Slate',
        description: 'Cool balanced slate with cobalt blue accents. Corporate precision.',
        primary: '#2F3A45',
        accent: '#2563EB',
      },
      'executive-navy': {
        name: 'Executive Navy',
        description: 'Deep midnight blue with sky blue highlight. High visual focus.',
        primary: '#223A5E',
        accent: '#38BDF8',
      },
      'forest-executive': {
        name: 'Forest Executive',
        description: 'Natural eucalyptus and deep emerald with mint accent. Organic calm.',
        primary: '#314D43',
        accent: '#34D399',
      },
    };
    return map[theme];
  }
}
