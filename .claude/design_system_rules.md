# PMGuide Design System Rules

## Color Tokens

### Primary Palette - Indigo
A distinctive indigo palette that balances professionalism with personality, appropriate for a career development tool. Aligned with DESIGN_SYSTEM.md (source of truth).

| Token | Light Mode | Usage |
|---|---|---|
| `--color-primary-50` | `#EEF2FF` | Subtle backgrounds, hover states |
| `--color-primary-100` | `#E0E7FF` | Selected states, active backgrounds |
| `--color-primary-200` | `#C7D2FE` | Borders, dividers on primary elements |
| `--color-primary-300` | `#A5B4FC` | Icons, secondary text on dark |
| `--color-primary-400` | `#818CF8` | Interactive elements hover |
| `--color-primary-500` | `#6366F1` | Primary buttons, links, key actions |
| `--color-primary-600` | `#4F46E5` | Primary button hover, emphasis |
| `--color-primary-700` | `#4338CA` | Active/pressed states |
| `--color-primary-800` | `#3730A3` | High-emphasis text on light backgrounds |
| `--color-primary-900` | `#312E81` | Headings, maximum contrast |
| `--color-primary-950` | `#1E1B4B` | Darkest backgrounds |

### Secondary Palette - Warm Accent (Optional for MVP)
A warm accent palette for highlights, progress indicators, and celebratory moments. Not required for initial build.

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `--color-accent-50` | `#FFF7ED` | `#451A03` | Subtle warm backgrounds |
| `--color-accent-100` | `#FFEDD5` | `#7C2D12` | Badges, tags background |
| `--color-accent-200` | `#FED7AA` | `#9A3412` | Warm borders |
| `--color-accent-300` | `#FDBA74` | `#C2410C` | Icons on warm backgrounds |
| `--color-accent-400` | `#FB923C` | `#EA580C` | Progress bars, achievement indicators |
| `--color-accent-500` | `#F97316` | `#FB923C` | Accent buttons, key highlights |
| `--color-accent-600` | `#EA580C` | `#FDBA74` | Accent hover |
| `--color-accent-700` | `#C2410C` | `#FED7AA` | Active accent |

### Neutral — Slate
Used for text, backgrounds, borders, and structural elements. Aligned with Tailwind's Slate scale (DESIGN_SYSTEM.md source of truth).

| Token | Light Mode | Usage |
|---|---|---|
| `--color-neutral-0` | `#FFFFFF` | Page background |
| `--color-neutral-50` | `#F8FAFC` | Card backgrounds, subtle surfaces |
| `--color-neutral-100` | `#F1F5F9` | Input backgrounds, secondary surfaces |
| `--color-neutral-200` | `#E2E8F0` | Borders, dividers |
| `--color-neutral-300` | `#CBD5E1` | Disabled borders, placeholder text |
| `--color-neutral-400` | `#94A3B8` | Muted text, secondary icons |
| `--color-neutral-500` | `#64748B` | Secondary text, captions |
| `--color-neutral-600` | `#475569` | Body text |
| `--color-neutral-700` | `#334155` | Headings, strong text |
| `--color-neutral-800` | `#1E293B` | Primary text |
| `--color-neutral-900` | `#0F172A` | Maximum contrast text |
| `--color-neutral-950` | `#020617` | Near-black |

### Semantic Colors
Contextual colors for feedback, status, and system messages.

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `--color-success-light` | `#F0FDF4` | `#052E16` | Success background |
| `--color-success` | `#22C55E` | `#4ADE80` | Success icons, text, borders |
| `--color-success-dark` | `#15803D` | `#86EFAC` | Success emphasis |
| `--color-warning-light` | `#FFFBEB` | `#422006` | Warning background |
| `--color-warning` | `#EAB308` | `#FACC15` | Warning icons, text, borders |
| `--color-warning-dark` | `#A16207` | `#FDE047` | Warning emphasis |
| `--color-error-light` | `#FEF2F2` | `#450A0A` | Error background |
| `--color-error` | `#EF4444` | `#F87171` | Error icons, text, borders |
| `--color-error-dark` | `#B91C1C` | `#FCA5A5` | Error emphasis |
| `--color-info-light` | `#EFF6FF` | `#1E3A5F` | Info background |
| `--color-info` | `#3B82F6` | `#60A5FA` | Info icons, text, borders |
| `--color-info-dark` | `#1D4ED8` | `#93C5FD` | Info emphasis |

### Dark Mode
**Out of scope for MVP.** Light mode only. Use Tailwind tokens so dark mode can be added later with `dark:` variants.

---

## Typography

### Font Family
- **Primary:** `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Monospace:** `'JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace`
- Load Inter via Google Fonts or self-host with `font-display: swap` for performance

### Type Scale

| Token | Size | Weight | Line Height | Letter Spacing | Usage |
|---|---|---|---|---|---|
| `--text-xs` | 12px / 0.75rem | 400 | 1.5 (18px) | 0.02em | Fine print, timestamps, badges |
| `--text-sm` | 14px / 0.875rem | 400 | 1.5 (21px) | 0.01em | Captions, helper text, secondary labels |
| `--text-base` | 16px / 1rem | 400 | 1.6 (25.6px) | 0 | Body text, chat messages, form labels |
| `--text-lg` | 18px / 1.125rem | 500 | 1.5 (27px) | -0.01em | Emphasized body, card titles |
| `--text-xl` | 20px / 1.25rem | 600 | 1.4 (28px) | -0.01em | Section subheadings |
| `--text-2xl` | 24px / 1.5rem | 600 | 1.35 (32.4px) | -0.02em | Section headings |
| `--text-3xl` | 30px / 1.875rem | 700 | 1.3 (39px) | -0.02em | Page titles |
| `--text-4xl` | 36px / 2.25rem | 700 | 1.2 (43.2px) | -0.03em | Hero headings |
| `--text-5xl` | 48px / 3rem | 700 | 1.1 (52.8px) | -0.03em | Landing page hero only |

### Font Weights
| Token | Value | Usage |
|---|---|---|
| `--font-regular` | 400 | Body text, descriptions |
| `--font-medium` | 500 | Emphasized text, labels, navigation items |
| `--font-semibold` | 600 | Subheadings, button text, card titles |
| `--font-bold` | 700 | Page titles, hero headings, strong emphasis |

### Typography Rules
- Maximum line length: 65-75 characters for readability (use `max-width: 65ch` on text containers)
- No font sizes below 12px for accessibility
- Use `rem` units for font sizes to respect user browser settings
- Heading hierarchy must be sequential (never skip from h1 to h3)

---

## Spacing

### Base Unit
All spacing derives from a **4px base unit**. Use only multiples of 4px for consistency.

### Spacing Scale

| Token | Value | Common Usage |
|---|---|---|
| `--space-1` | 4px / 0.25rem | Tight spacing: icon-to-text gap, inline element margins |
| `--space-2` | 8px / 0.5rem | Default gap: between related items, input padding-y |
| `--space-3` | 12px / 0.75rem | Compact padding: small cards, tags, badges |
| `--space-4` | 16px / 1rem | Standard padding: buttons, input fields, list items |
| `--space-5` | 20px / 1.25rem | Comfortable padding: card padding, form group gaps |
| `--space-6` | 24px / 1.5rem | Section content padding |
| `--space-8` | 32px / 2rem | Section gaps, major element separation |
| `--space-10` | 40px / 2.5rem | Large section padding |
| `--space-12` | 48px / 3rem | Page section dividers |
| `--space-16` | 64px / 4rem | Major page sections, hero spacing |

### Spacing Rules
- Use `gap` property for flex/grid layouts instead of margins
- Padding inside components: use `--space-4` (16px) as the default
- Margin between sibling components: use `--space-6` (24px) as the default
- Page padding: `--space-4` mobile, `--space-8` desktop
- Never use arbitrary pixel values outside the scale

---

## Components

### Chat Bubble

The primary interaction component for the About Me chatbot and any conversational UI.

#### User Variant
```
- Background: var(--color-primary-500)
- Text color: #FFFFFF
- Border radius: 16px 16px 16px 4px (flat bottom-right corner — speech tail)
- Padding: 12px 16px
- Max width: 80% of container
- Alignment: right-aligned
- Font: var(--text-base), var(--font-regular)
- Margin bottom: 8px
- Timestamp: var(--text-xs), var(--color-neutral-400), below bubble, right-aligned
```

#### AI Variant
```
- Background: var(--color-neutral-100) [light] / var(--color-neutral-800) [dark]
- Text color: var(--color-neutral-800) [light] / var(--color-neutral-100) [dark]
- Border radius: 16px 16px 4px 16px (flat bottom-left corner — speech tail)
- Padding: 12px 16px
- Max width: 80% of container
- Alignment: left-aligned
- Avatar: 32x32px PMGuide logo, left of bubble, vertically aligned to top
- Font: var(--text-base), var(--font-regular)
- Margin bottom: 8px
- Typing indicator: three animated dots when AI is generating
- Timestamp: var(--text-xs), var(--color-neutral-400), below bubble, left-aligned
```

### Input Field

Standard text input used across all forms and the chat interface.

```
- Height: 44px (meets touch target minimum)
- Padding: 10px 16px
- Background: var(--color-neutral-0)
- Border: 1px solid var(--color-neutral-300)
- Border radius: 8px
- Font: var(--text-base)
- Placeholder color: var(--color-neutral-400)
- Focus: border-color var(--color-primary-500), box-shadow 0 0 0 3px var(--color-primary-100)
- Error: border-color var(--color-error), box-shadow 0 0 0 3px var(--color-error-light)
- Disabled: background var(--color-neutral-100), opacity 0.6, cursor not-allowed
- Chat variant: rounded-full (24px radius), with send button inside right side
- Multiline variant: min-height 44px, auto-grow up to 120px, then scroll
```

### Button

#### Primary Button
```
- Height: 44px
- Padding: 10px 24px
- Background: var(--color-primary-500)
- Text: #FFFFFF, var(--text-base), var(--font-semibold)
- Border: none
- Border radius: 8px
- Hover: background var(--color-primary-600), translateY(-1px), shadow sm
- Active: background var(--color-primary-700), translateY(0)
- Focus: box-shadow 0 0 0 3px var(--color-primary-200)
- Disabled: opacity 0.5, cursor not-allowed, no hover effect
- Loading: spinner icon replaces text, maintains button width
- Transition: all 150ms ease
```

#### Secondary Button
```
- Height: 44px
- Padding: 10px 24px
- Background: transparent
- Text: var(--color-primary-500), var(--text-base), var(--font-semibold)
- Border: 1px solid var(--color-primary-300)
- Border radius: 8px
- Hover: background var(--color-primary-50), border-color var(--color-primary-400)
- Active: background var(--color-primary-100)
- Focus: box-shadow 0 0 0 3px var(--color-primary-200)
```

#### Ghost Button
```
- Height: 44px
- Padding: 10px 24px
- Background: transparent
- Text: var(--color-neutral-600), var(--text-base), var(--font-medium)
- Border: none
- Border radius: 8px
- Hover: background var(--color-neutral-100), text var(--color-neutral-800)
- Active: background var(--color-neutral-200)
- Focus: box-shadow 0 0 0 3px var(--color-neutral-200)
```

### Card

Container for grouped content: resume sections, feature previews, agent status.

```
- Background: var(--color-neutral-0) [light] / var(--color-neutral-50) [dark]
- Border: 1px solid var(--color-neutral-200)
- Border radius: 12px
- Padding: 24px
- Shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)
- Hover (if interactive): shadow 0 4px 12px rgba(0,0,0,0.08), translateY(-2px)
- Transition: all 200ms ease
- Title: var(--text-lg), var(--font-semibold), margin-bottom 8px
- Description: var(--text-base), var(--color-neutral-600)
```

### Section Navigation

Sidebar or top-level navigation between PMGuide sections (About Me, Resume, Outreach, Interview, Negotiate).

```
- Container: vertical sidebar on desktop, horizontal scroll on mobile
- Nav item height: 44px
- Nav item padding: 10px 16px
- Nav item font: var(--text-base), var(--font-medium)
- Default state: text var(--color-neutral-600), background transparent
- Hover: background var(--color-neutral-100), text var(--color-neutral-800)
- Active: background var(--color-primary-50), text var(--color-primary-700),
  left border 3px solid var(--color-primary-500) [desktop],
  bottom border 3px solid var(--color-primary-500) [mobile]
- Disabled (Coming Soon): text var(--color-neutral-400), italic "Coming Soon" badge
- Icon: 20x20px, left of text, gap 12px
- Border radius: 8px
- Transition: all 150ms ease
```

### Upload Dropzone

Drag-and-drop area for resume file uploads.

```
- Min height: 200px
- Border: 2px dashed var(--color-neutral-300)
- Border radius: 12px
- Background: var(--color-neutral-50)
- Padding: 40px 24px
- Text alignment: center
- Icon: Upload icon, 48x48px, var(--color-neutral-400), centered
- Primary text: "Drag & drop your resume here", var(--text-lg), var(--font-medium)
- Secondary text: "or click to browse", var(--text-sm), var(--color-primary-500), underline
- Accepted formats text: "PDF, DOCX, or TXT (max 5MB)", var(--text-xs), var(--color-neutral-400)
- Drag hover: border-color var(--color-primary-500), background var(--color-primary-50),
  border-style solid
- File selected: show file name, size, and remove button; hide upload prompt
- Error state: border-color var(--color-error), error message below
- Transition: all 200ms ease
```

### Progress Indicator

Shows progress through multi-step flows (onboarding phases, resume pipeline).

```
- Type: horizontal step indicator
- Step circle: 32px diameter
- Incomplete: background var(--color-neutral-200), text var(--color-neutral-500)
- Current: background var(--color-primary-500), text #FFFFFF, pulse animation
- Complete: background var(--color-success), checkmark icon #FFFFFF
- Connector line: 2px height, between circles
- Incomplete connector: var(--color-neutral-200)
- Complete connector: var(--color-success)
- Step label: below circle, var(--text-sm), var(--font-medium)
- Mobile: show current step as "Step 2 of 5" text instead of full visual
```

### Toast / Alert

Temporary notification messages for confirmations, errors, and info.

```
- Position: top-right corner, 24px from edges
- Width: auto, max 420px
- Padding: 12px 16px
- Border radius: 8px
- Shadow: 0 4px 12px rgba(0,0,0,0.15)
- Animation: slide in from right, slide out to right
- Auto-dismiss: 5 seconds (info/success), persistent (error/warning until dismissed)
- Dismiss button: X icon, top-right, 24x24px touch target

Variants:
- Success: left border 4px var(--color-success), background var(--color-success-light)
- Warning: left border 4px var(--color-warning), background var(--color-warning-light)
- Error: left border 4px var(--color-error), background var(--color-error-light)
- Info: left border 4px var(--color-info), background var(--color-info-light)

- Icon: 20x20px, left side, color matches variant
- Title: var(--text-sm), var(--font-semibold)
- Message: var(--text-sm), var(--font-regular), var(--color-neutral-600)
- Stack: multiple toasts stack vertically with 8px gap
- Max visible: 3 toasts, older ones dismiss when 4th arrives
```

### Skeleton Loader

Placeholder content shown while data is loading.

```
- Shape: matches the component it replaces (text lines, avatars, cards)
- Background: var(--color-neutral-200) [light] / var(--color-neutral-700) [dark]
- Animation: shimmer effect, left-to-right gradient sweep
  background: linear-gradient(90deg, transparent 0%, var(--color-neutral-100) 50%, transparent 100%)
  animation: shimmer 1.5s infinite
- Border radius: match the component (4px for text, 50% for avatars, 12px for cards)
- Text skeleton: height matches text line-height, width varies (100%, 80%, 60% for visual variety)
- Spacing: matches actual component spacing
- Duration: show for minimum 300ms to prevent flash (even if data loads faster)
- Accessibility: aria-busy="true", aria-label="Loading..."
```

---

## Responsive Breakpoints

### Breakpoint Values
| Name | Value | Target |
|---|---|---|
| `--breakpoint-mobile` | < 768px | Phones, small tablets (portrait) |
| `--breakpoint-desktop` | >= 768px | Tablets (landscape), laptops, desktops |

### Mobile (< 768px) Rules
- Single-column layout
- Section navigation: horizontal scrollable tabs at top
- Chat bubbles: max-width 90% of container
- Cards: full width, stack vertically
- Page padding: 16px
- Hide sidebar, show hamburger menu
- Touch targets: minimum 44x44px for all interactive elements
- Feature cards in Coming Soon pages: single column stack
- Progress indicator: text-based "Step X of Y" instead of visual circles

### Desktop (>= 768px) Rules
- Two-column layout: sidebar nav (260px) + main content
- Main content max-width: 800px for readability
- Cards: grid layout (2 or 3 columns depending on content)
- Page padding: 32px
- Sidebar: fixed position, full height
- Chat interface: centered, max-width 700px
- Feature cards in Coming Soon pages: 2-column grid

### Implementation
```css
/* Mobile-first approach */
.component { /* mobile styles */ }

@media (min-width: 768px) {
  .component { /* desktop styles */ }
}
```

---

## Accessibility

### WCAG AA Compliance (Minimum Standard)

#### Contrast Ratios
- **Normal text (< 18px):** minimum 4.5:1 contrast ratio against background
- **Large text (>= 18px bold or >= 24px regular):** minimum 3:1 contrast ratio
- **UI components and graphical objects:** minimum 3:1 contrast ratio against adjacent colors
- **Focus indicators:** minimum 3:1 contrast ratio against the background
- Verify all color pairs in both light and dark modes

#### Touch Targets
- Minimum interactive element size: **44 x 44px** (CSS pixels)
- This applies to: buttons, links, nav items, form inputs, checkboxes, radio buttons, toggle switches
- If the visual element is smaller (e.g., a small icon button), extend the tap area with padding
- Minimum spacing between adjacent touch targets: 8px

#### Focus Indicators
```
- All interactive elements must have visible focus indicators
- Default focus style: box-shadow 0 0 0 3px var(--color-primary-200)
- High contrast focus: 2px solid outline + 2px offset for keyboard-only users
- Never use outline: none without providing an alternative focus indicator
- Focus must be visible in both light and dark modes
- Use :focus-visible (not :focus) to avoid showing focus rings on mouse clicks
```

#### Keyboard Navigation
- All interactive elements must be reachable via Tab key
- Logical tab order following visual layout (left-to-right, top-to-bottom)
- Escape key closes modals, dropdowns, and toasts
- Enter/Space activates buttons and links
- Arrow keys navigate within radio groups, select menus, and tab lists
- Skip-to-content link as first focusable element on every page

#### Screen Reader Support
- All images have descriptive `alt` text (or `alt=""` for decorative images)
- Form inputs have associated `<label>` elements (or `aria-label`)
- Dynamic content updates use `aria-live` regions (chat messages, toasts, loading states)
- Page landmarks: `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`
- Heading hierarchy: sequential, no skipped levels
- Chat messages: `role="log"`, `aria-live="polite"` on the chat container
- Loading states: `aria-busy="true"`, descriptive `aria-label`

#### Motion and Animation
- Respect `prefers-reduced-motion`: disable non-essential animations
- Essential animations (loading spinners) remain but simplify
- No auto-playing animations that cannot be paused
- Transition durations under 200ms for micro-interactions

---

## Icon System Recommendation

### Recommended Library
**Lucide React** (`lucide-react`)

- Open source, MIT licensed
- Consistent 24x24px grid, 2px stroke weight
- Tree-shakeable (only import icons you use)
- Excellent React component support
- Active maintenance, large icon set (1000+)
- Accessible by default (includes title props)

### Usage Guidelines
```
- Default size: 20x20px for inline/nav icons, 24x24px for standalone icons
- Stroke width: 2px (default), 1.5px for smaller sizes
- Color: inherit from parent text color (currentColor)
- Interactive icons: wrap in button with aria-label
- Decorative icons: aria-hidden="true"
- Always pair icons with text labels (icon-only buttons need aria-label)
- Consistent metaphors:
  - Navigation: Home, User, FileText, Mail, MessageSquare, Scale
  - Actions: Plus, Edit, Trash2, Download, Upload, Send
  - Status: Check, X, AlertTriangle, Info, Loader
  - PM Domain: Lightbulb, Target, BarChart3, Users, Briefcase
```

### Icon Sizing Scale
| Context | Size | Usage |
|---|---|---|
| Inline with text | 16px | Inside buttons next to label text |
| Navigation items | 20px | Sidebar nav, tab bar |
| Standalone buttons | 24px | Icon buttons, card actions |
| Feature icons | 32px | Feature cards, empty states |
| Hero/illustration | 48px | Coming Soon pages, onboarding |
