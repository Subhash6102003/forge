---
name: subhash-uiux
description: Subhash UI/UX Calm Enterprise Design System. Focuses on low visual fatigue, 4px grid, 10-point governance scoring, and strict color hierarchy.
version: 1.0.0
---

# Subhash UI/UX Design System

## Principles
1. **Calm Precision**: Workspaces must minimize cognitive load and visual fatigue over long coding sessions. Avoid aggressive saturated colors, heavy dropshadows, or distraction-heavy gradients.
2. **4px Grid Discipline**: All paddings, margins, gaps, and sizes must be multiples of 4px (`--space-1`: 4px, `--space-2`: 8px, `--space-3`: 12px, `--space-4`: 16px, `--space-6`: 24px, `--space-8`: 32px).
3. **Four Core Themes**:
   - **Modern Stone (Default)**: Warm neutral grays (#FAFAF8 / #141413) with terracotta accent (#D97757).
   - **Enterprise Slate**: Cool business slate (#F7F8FA / #11161D) with cobalt blue accent (#2563EB / #58A6FF).
   - **Executive Navy**: Deep maritime midnight (#F5F7FA / #0B1320) with sky blue accent (#38BDF8).
   - **Forest Executive**: Natural eucalyptus and emerald (#F7F8F6 / #0E1915) with mint accent (#34D399).
4. **Color Hierarchy & Max 5% Gradient Rule**: 85% surface/neutral background, 10% structural borders and secondary text, 5% primary accents and indicators. Gradients must never cover more than 5% of any viewport.
5. **Motion**: 150ms-250ms cubic-bezier(0.4, 0, 0.2, 1). No spring or bounce physics. Fully honors `prefers-reduced-motion`.
6. **10-Point Governance Review Criteria**:
   - 1. Clarity (0-10)
   - 2. Readability (0-10)
   - 3. Accessibility & WCAG AA Contrast (0-10)
   - 4. Trustworthiness (0-10)
   - 5. Professionalism (0-10)
   - 6. Information Hierarchy (0-10)
   - 7. Enterprise Readiness (0-10)
   - 8. Visual Consistency (0-10)
   - 9. User Efficiency & Keyboard Shortcuts (0-10)
   - 10. Maintainability (0-10)
   All screens and components in Forge must score >= 8/10 on every metric.
