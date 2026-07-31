---
name: Boxful Kinetic
colors:
  surface: '#f4fbf8'
  surface-dim: '#d4dcd8'
  surface-bright: '#f4fbf8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eef5f2'
  surface-container: '#e8efec'
  surface-container-high: '#e2eae6'
  surface-container-highest: '#dde4e1'
  on-surface: '#161d1b'
  on-surface-variant: '#3c4a46'
  inverse-surface: '#2b3230'
  inverse-on-surface: '#ebf2ef'
  outline: '#6c7a76'
  outline-variant: '#bacac5'
  surface-tint: '#006b5d'
  primary: '#006b5d'
  on-primary: '#ffffff'
  primary-container: '#00c3ac'
  on-primary-container: '#004a40'
  inverse-primary: '#3fddc5'
  secondary: '#5f5e5f'
  on-secondary: '#ffffff'
  secondary-container: '#e2dfe0'
  on-secondary-container: '#636263'
  tertiary: '#7f5600'
  on-tertiary: '#ffffff'
  tertiary-container: '#e4a11a'
  on-tertiary-container: '#593b00'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#64fae1'
  primary-fixed-dim: '#3fddc5'
  on-primary-fixed: '#00201b'
  on-primary-fixed-variant: '#005046'
  secondary-fixed: '#e5e2e3'
  secondary-fixed-dim: '#c8c6c7'
  on-secondary-fixed: '#1b1b1c'
  on-secondary-fixed-variant: '#474647'
  tertiary-fixed: '#ffdeae'
  tertiary-fixed-dim: '#ffba3e'
  on-tertiary-fixed: '#281900'
  on-tertiary-fixed-variant: '#604100'
  background: '#f4fbf8'
  on-background: '#161d1b'
  surface-variant: '#dde4e1'
  surface-subtle: '#F8FAFB'
  border-muted: '#E5E7EB'
  text-muted: '#6B7280'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  body-lg:
    fontFamily: Source Sans 3
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Source Sans 3
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Source Sans 3
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Source Sans 3
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.03em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  max-width: 1280px
---

## Brand & Style
The design system is a high-performance logistics framework that blends industrial efficiency with modern tech-forward aesthetics. Inspired by the clarity of top-tier storage solutions, the style prioritizes "glanceability" and operational speed. 

The aesthetic is **Corporate / Modern** with a lean toward **Minimalism**. It utilizes expansive white space, a disciplined grid, and bold accents to create an environment that feels organized, secure, and technologically advanced. The UI should evoke a sense of reliability and precision, using sharp layouts and high-contrast elements to guide users through complex logistics workflows without friction.

## Colors
This design system utilizes a high-contrast palette built around a signature "Boxful Teal" primary color. This color is reserved for primary actions, success states, and brand-critical indicators. 

The neutral palette is dominated by pure white (#FFFFFF) for primary surfaces and a deep charcoal (#141415) for heavy typography and structural elements, ensuring maximum legibility. A secondary "Amber" (#F5AF2B) is used sparingly for warnings and secondary highlights to provide warmth against the cool teal and monochrome base. Backgrounds should alternate between pure white and a very light grey to define distinct content regions without relying on heavy borders.

## Typography
The typography strategy pairs the geometric, friendly confidence of **Plus Jakarta Sans** for headlines with the utilitarian precision of **Source Sans 3** for body text and data-heavy interfaces. 

Headlines should use tight letter-spacing and heavy weights to command attention. Body text prioritizes a generous line height to maintain readability during long-form reading or complex data entry. Labels, especially in the context of logistics tracking and inventory, should use semi-bold or bold weights of Source Sans 3 to ensure they remain distinct from standard body copy even at small sizes.

## Layout & Spacing
The design system employs a **Fixed Grid** model for desktop and a fluid model for mobile. On desktop, content is centered within a 1280px container using a 12-column grid.

A strict 4px/8px baseline rhythm is applied to all components. Gutters are kept wide (24px) to emphasize the clean, airy aesthetic inspired by spaceship.com.sg. 
- **Mobile (<768px):** 4-column grid, 16px margins, 16px gutters.
- **Tablet (768px - 1024px):** 8-column grid, 24px margins, 20px gutters.
- **Desktop (>1024px):** 12-column grid, 48px margins (or auto-centered), 24px gutters.

## Elevation & Depth
Depth is communicated through **Tonal Layers** and extremely subtle **Ambient Shadows**. Instead of heavy drop shadows, this design system uses 1px borders in a soft grey (#E5E7EB) to define containers.

When elevation is required (e.g., for modals or floating action buttons), use a multi-layered shadow with very high diffusion and low opacity (4-8%), tinted slightly with the primary teal or a neutral navy to prevent a "dirty" look. Interactive elements like cards should use a "lift" effect—transitioning from a flat border to a subtle shadow on hover—to provide tactile feedback.

## Shapes
This design system uses a **Soft** shape language. A standard radius of 4px (0.25rem) is applied to buttons, input fields, and small components to maintain a professional, slightly architectural feel. 

Larger containers like cards or informational blocks can use up to 8px (0.5rem) to soften the layout. Avoid pill-shaped buttons; instead, stick to the 4px rounded rectangle to reinforce the "box" metaphor inherent to the brand. Icons should follow a consistent stroke weight (typically 2px) with slightly rounded terminals to match the component radius.

## Components
- **Buttons:** Primary buttons use a solid Teal (#00C3AC) fill with white text. Secondary buttons use a thick 2px charcoal border. All buttons have a 4px border radius and use bold Source Sans 3 labels.
- **Inputs:** Fields use a 1px border (#E5E7EB) that thickens and changes to Teal on focus. Labels sit clearly above the input in `label-sm` style.
- **Cards:** White background, 1px border, no shadow in default state. Content should be padded by at least 24px to maintain the spacious aesthetic.
- **Chips/Badges:** Used for status (e.g., "In Transit", "Stored"). Use light-tinted backgrounds of the status color (Teal for success, Amber for warning) with high-contrast text.
- **Lists:** Clean, border-bottom separation only. Use `body-md` for primary list items and `label-md` for metadata.
- **Data Tables:** High-density but clear, using alternating row colors (White and #F8FAFB) rather than vertical grid lines to guide the eye.