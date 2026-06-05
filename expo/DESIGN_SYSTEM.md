# Design System Guide

## Overview

This design system provides a comprehensive set of constants and guidelines for building consistent, visually appealing UI components across the 2Spoons More app.

## Core Constants

### Typography (`constants/typography.ts`)

**Font Sizes**
- `xs`: 12px — captions, small labels
- `sm`: 14px — small text, helper text
- `base`: 16px — body text, regular labels
- `lg`: 18px — subheadings, large labels
- `xl`: 20px — headings, important text
- `2xl`: 24px — major headings
- `3xl`: 28px — section titles
- `4xl`: 32px — page titles

**Font Weights**
- `light`: 300 — subtle text
- `normal`: 400 — body text
- `medium`: 500 — labels, secondary info
- `semibold`: 600 — emphasis, button text
- `bold`: 700 — headings, primary emphasis
- `extrabold`: 800 — hero text

**Predefined Text Styles**
```typescript
typography.styles.h1  // Page titles
typography.styles.h2  // Section titles
typography.styles.h3  // Subsection titles
typography.styles.h4  // Card titles
typography.styles.body // Regular body text
typography.styles.bodySmall // Smaller body text
typography.styles.label // Form labels
typography.styles.caption // Extra small text
```

### Spacing (`constants/spacing.ts`)

**Base Units** (4px = 1 unit)
- `xs`: 4px
- `sm`: 8px
- `md`: 12px
- `lg`: 16px
- `xl`: 20px
- `2xl`: 24px
- `3xl`: 32px
- `4xl`: 40px
- `5xl`: 48px

**Border Radius**
- `sm`: 8px — small inputs, badges
- `md`: 12px — buttons, form fields
- `lg`: 16px — cards, modals
- `xl`: 20px — larger cards, hero sections
- `full`: 24px — prominent cards
- `circle`: 999px — circles, avatars

**Shadows**
- `sm`: opacity 0.08, radius 8px — subtle elevation
- `md`: opacity 0.12, radius 12px — standard elevation
- `lg`: opacity 0.15, radius 16px — strong elevation
- `xl`: opacity 0.2, radius 20px — maximum elevation

### Colors (`constants/colors.ts`)

**Primary Brand**
- `primary`: #FF6B35 — main actions, highlights
- `secondary`: #4ECDC4 — secondary actions, accents

**Admin Theme**
- `adminPrimary`: #6C5CE7
- `adminSuccess`: #00B894
- `adminWarning`: #FDCB6E
- `adminError`: #E17055

**Semantic**
- `error`: #E74C3C — errors, destructive actions
- `success`: #27AE60 — success states
- `warning`: #F39C12 — warnings
- `info`: #3498DB — information

**Base**
- `white`: #FFFFFF
- `background`: #F8F9FA — page background
- `card`: #FFFFFF — card/container background
- `text`: #2C3E50 — primary text
- `textLight`: #7F8C8D — secondary text
- `border`: #E9ECEF — borders, dividers

## Component Usage

### Buttons

```tsx
import Button from '@/components/Button';

// Primary button
<Button 
  title="Save" 
  onPress={handleSave}
  variant="primary"
  size="medium"
/>

// Variants: 'primary' | 'secondary' | 'outline' | 'danger'
// Sizes: 'small' | 'medium' | 'large'
```

**Styling Guidelines:**
- Primary buttons: Full width on mobile, constrained on web
- Use `size="large"` (56px height) for main CTAs
- Use `size="medium"` (48px height) for secondary actions
- Use `size="small"` (40px height) for inline/compact actions
- Always include shadows for depth

### Input Fields

```tsx
import Input from '@/components/Input';

<Input
  label="Email"
  placeholder="you@example.com"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  error={emailError}
/>
```

**Styling Guidelines:**
- Minimum height: 48px for touch targets
- Padding: `spacing.md` (12px) horizontal
- Border radius: `spacing.radius.md` (12px)
- Add subtle shadows for elevation

### Cards

```tsx
const cardStyle = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: spacing.radius.lg,
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  }
});
```

**Card Sizes:**
- **Large cards**: 24px padding, radius 24px, strong shadow
- **Medium cards**: 16px padding, radius 20px, standard shadow
- **Small cards**: 12px padding, radius 12px, subtle shadow

### Text Hierarchy

```tsx
// Page Title
<Text style={typography.styles.h1}>Page Title</Text>

// Section Heading
<Text style={typography.styles.h2}>Section Title</Text>

// Card Title
<Text style={typography.styles.h3}>Card Title</Text>

// Body Text
<Text style={typography.styles.body}>Regular body text</Text>

// Helper Text
<Text style={[typography.styles.caption, { color: colors.textLight }]}>
  Helper text or metadata
</Text>
```

### Spacing Rules

**Margins & Padding**
- Container padding: `spacing.xl` (16px) to `spacing['2xl']` (24px)
- Between sections: `spacing['2xl']` (24px)
- Between components: `spacing.lg` (16px)
- Within components: `spacing.md` (12px)

**Gap in Lists**
- Horizontal gap: `spacing.md` (12px)
- Vertical gap: `spacing.lg` (16px)

## Design Patterns

### Food Listing Cards
- Image height: 100-140px
- Image aspect ratio: 4:3 or 1:1
- Title: `typography.styles.h4`
- Price: `typography.sizes.sm`, bold, primary color
- Rating: `typography.sizes.xs`, with icon
- Corner radius: 20px
- Shadow: `lg` elevation

### Button Specifications

**Primary Button**
- Background: `colors.primary` (#FF6B35)
- Text: White, `typography.weights.semibold`
- Padding: `spacing.lg` vertical, `spacing.lg` horizontal
- Border radius: `spacing.radius.md` (12px)
- Shadow: Standard elevation

**Outline Button**
- Background: Transparent
- Border: 1px `colors.primary`
- Text: `colors.primary`
- Same padding and radius as primary

### Form Layout

```tsx
<View style={{ paddingHorizontal: spacing['2xl'], paddingVertical: spacing.lg }}>
  <Input label="Field 1" ... />
  <Input label="Field 2" ... />
  <Button title="Submit" variant="primary" size="large" />
</View>
```

## Implementation Checklist

When creating new screens:

- [ ] Import `typography`, `spacing`, and `colors` constants
- [ ] Use `typography.sizes.*` for all font sizes
- [ ] Use `typography.weights.*` for all font weights
- [ ] Use `spacing.*` for all margins and padding
- [ ] Use `spacing.radius.*` for all border radii
- [ ] Add shadows to elevated elements using `spacing.shadow.*`
- [ ] Ensure minimum touch target size of 48px
- [ ] Use semantic color names (primary, error, success)
- [ ] Test on both iOS and Android

## Responsive Design

**Mobile First**
- Base design optimized for 375px width
- Padding: 16-20px horizontal
- Full-width components by default

**Tablet** (768px+)
- Maximum width constraints (600px for content)
- Larger touch targets and spacing
- Multi-column layouts where appropriate

## Accessibility

- Minimum text size: 12px (`typography.sizes.xs`)
- Color contrast ratio: 4.5:1 for normal text
- Touch target minimum: 48px × 48px
- Icon size: 20-24px for interactive elements

## Future Enhancements

- [ ] Dark mode color palette
- [ ] Responsive typography scaling
- [ ] Animation/transition timings
- [ ] Component composition library
- [ ] Figma design tokens sync
