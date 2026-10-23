import { describe, it, expect } from 'vitest';
import brandTokens from '../src/styles/brand.tokens.json';
import { BrandSkinService } from '../src/services/brandSkin';
import { ThemeId } from '../src/types';

describe('Themes & Brand Tokens Test Suite', () => {
  it('loads brand tokens with exact Subhash UI/UX palette', () => {
    expect(brandTokens.colors.dark).toBe('#141413');
    expect(brandTokens.colors.light).toBe('#faf9f5');
    expect(brandTokens.colors.accentOrange).toBe('#d97757');
    expect(brandTokens.colors.accentBlue).toBe('#6a9bcc');
    expect(brandTokens.colors.accentGreen).toBe('#788c5d');
  });

  it('defines all 4 required themes with valid primary and accent colors', () => {
    const requiredThemes: ThemeId[] = [
      'modern-stone',
      'enterprise-slate',
      'executive-navy',
      'forest-executive',
    ];

    for (const themeId of requiredThemes) {
      const details = BrandSkinService.getThemeDetails(themeId);
      expect(details).toBeDefined();
      expect(details.primary).toMatch(/^#[0-9A-Fa-f]{6}$/);
      expect(details.accent).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});
