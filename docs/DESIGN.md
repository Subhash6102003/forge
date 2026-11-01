# Design System & UI/UX Guidelines
> Maintained by the Design & Experience Lead

## 1. Aesthetic Foundations (Calm Enterprise & High Taste)
Distilled using `taste-skill`, `impeccable`, and `react-bits`:
- **Discipline**: High contrast, crisp 1px borders, zero visual slop, max 5% subtle gradients.
- **Grid & Spacing**: Strict 4px base grid (`p-1` = 4px, `p-2` = 8px, `p-3` = 12px, `p-4` = 16px).
- **Typography**: Primary sans-serif for UI (`Inter` / `Geist` / `Poppins`), monospace for code and metrics (`JetBrains Mono`).

## 2. Supported Design Themes
1. **Modern Stone / Calm Enterprise (Default)**:
   - Background: `#141413`
   - Accent: Warm Orange `#D97757`
   - Borders: `#262624`
2. **MongoDB / Supabase (Dark Technical Emerald)**:
   - Background: `#0B0F12`
   - Surface: `#141E1B`
   - Accent: Precision Emerald `#00ED64`
   - Borders: `#1F332C`
3. **Linear (Monochrome Slate)**:
   - Background: `#0E0F12`
   - Accent: Electric Indigo `#5E6AD2`
   - Borders: `#22242B`
4. **Autonomous High-Taste**:
   - Dynamic palette synthesized per project using `design-extract` tokens.

## 3. Motion Principles
- Driven by `gsap-skills` and `transitions-dev`.
- Fast transitions: 150ms–250ms with ease-out curves.
- Strict compliance with `prefers-reduced-motion: reduce`.
