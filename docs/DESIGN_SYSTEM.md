# Design System — PMGuide

Complete design system specification: colors, typography, components, layouts, patterns, and animations.

---

## Color Palette

### Primary — Indigo

The primary brand color. Used for navigation, CTAs, active states, and brand accents.

| Token | Hex | Usage |
|-------|-----|-------|
| `primary-50` | `#EEF2FF` | Backgrounds, hover states on light surfaces |
| `primary-100` | `#E0E7FF` | Selected item backgrounds, subtle highlights |
| `primary-200` | `#C7D2FE` | Borders on active elements |
| `primary-300` | `#A5B4FC` | Icons on light backgrounds |
| `primary-400` | `#818CF8` | Hover state for primary buttons |
| `primary-500` | `#6366F1` | Default primary button, links |
| `primary-600` | `#4F46E5` | Primary button background |
| `primary-700` | `#4338CA` | Primary button pressed state |
| `primary-800` | `#3730A3` | Dark accents |
| `primary-900` | `#312E81` | Very dark accents, sidebar background |
| `primary-950` | `#1E1B4B` | Darkest backgrounds |

### Neutral — Slate

Used for text, backgrounds, borders, and all non-brand UI elements.

| Token | Hex | Usage |
|-------|-----|-------|
| `slate-50` | `#F8FAFC` | Page background |
| `slate-100` | `#F1F5F9` | Card backgrounds, input backgrounds |
| `slate-200` | `#E2E8F0` | Borders, dividers |
| `slate-300` | `#CBD5E1` | Disabled text, placeholder text |
| `slate-400` | `#94A3B8` | Muted text, secondary icons |
| `slate-500` | `#64748B` | Secondary text |
| `slate-600` | `#475569` | Body text |
| `slate-700` | `#334155` | Headings, strong text |
| `slate-800` | `#1E293B` | Primary text |
| `slate-900` | `#0F172A` | Maximum contrast text |
| `slate-950` | `#020617` | Near-black |

### Semantic Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `success-50` | `#F0FDF4` | Success background |
| `success-500` | `#22C55E` | Success icon, text |
| `success-700` | `#15803D` | Success dark text |
| `warning-50` | `#FFFBEB` | Warning background |
| `warning-500` | `#F59E0B` | Warning icon, medium severity |
| `warning-700` | `#B45309` | Warning dark text |
| `error-50` | `#FEF2F2` | Error background |
| `error-500` | `#EF4444` | Error icon, high severity |
| `error-700` | `#B91C1C` | Error dark text |
| `info-50` | `#EFF6FF` | Info background |
| `info-500` | `#3B82F6` | Info icon, low severity |
| `info-700` | `#1D4ED8` | Info dark text |

### Critique Severity Mapping

| Severity | Color Token | Badge | Background |
|----------|-------------|-------|------------|
| High | `error-500` | Red badge | `error-50` |
| Medium | `warning-500` | Amber badge | `warning-50` |
| Low | `info-500` | Blue badge | `info-50` |

---

## Typography

### Font Stack

```css
/* Primary (headings + body) */
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Monospace (code, metrics, data) */
font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
```

Load Inter from Google Fonts (variable weight). JetBrains Mono for any code or data display.

### Type Scale

| Token | Size | Weight | Line Height | Tracking | Usage |
|-------|------|--------|-------------|----------|-------|
| `text-xs` | 12px / 0.75rem | 400 | 16px / 1rem | 0.01em | Captions, badges, timestamps |
| `text-sm` | 14px / 0.875rem | 400 | 20px / 1.25rem | 0 | Secondary text, helper text |
| `text-base` | 16px / 1rem | 400 | 24px / 1.5rem | 0 | Body text, chat messages |
| `text-lg` | 18px / 1.125rem | 500 | 28px / 1.75rem | -0.01em | Section subtitles |
| `text-xl` | 20px / 1.25rem | 600 | 28px / 1.75rem | -0.01em | Card titles |
| `text-2xl` | 24px / 1.5rem | 700 | 32px / 2rem | -0.02em | Section headings |
| `text-3xl` | 30px / 1.875rem | 700 | 36px / 2.25rem | -0.02em | Page titles |
| `text-4xl` | 36px / 2.25rem | 800 | 40px / 2.5rem | -0.03em | Hero text (landing page) |

### Font Weight Tokens

| Token | Weight | Usage |
|-------|--------|-------|
| `font-normal` | 400 | Body text, descriptions |
| `font-medium` | 500 | Labels, nav items, emphasis |
| `font-semibold` | 600 | Card titles, button text |
| `font-bold` | 700 | Section headings, page titles |
| `font-extrabold` | 800 | Hero text only |

---

## Spacing

Use Tailwind's default spacing scale. Key reference values:

| Token | Value | Usage |
|-------|-------|-------|
| `p-1` / `m-1` | 4px | Tight spacing (icon padding, badge padding) |
| `p-2` / `m-2` | 8px | Compact spacing (between inline elements) |
| `p-3` / `m-3` | 12px | Default inner padding (inputs, small cards) |
| `p-4` / `m-4` | 16px | Standard padding (cards, sections) |
| `p-6` / `m-6` | 24px | Comfortable padding (page sections) |
| `p-8` / `m-8` | 32px | Generous padding (major sections) |
| `gap-2` | 8px | Between inline elements |
| `gap-4` | 16px | Between cards, form fields |
| `gap-6` | 24px | Between sections |
| `gap-8` | 32px | Between major page sections |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-sm` | 4px | Badges, small elements |
| `rounded` | 6px | Inputs, small buttons |
| `rounded-md` | 8px | Buttons, tags |
| `rounded-lg` | 12px | Cards, panels |
| `rounded-xl` | 16px | Large cards, modals |
| `rounded-2xl` | 20px | Chat bubbles |
| `rounded-full` | 9999px | Avatars, circular buttons, pills |

---

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle depth (inputs, small cards) |
| `shadow` | `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)` | Cards, dropdowns |
| `shadow-md` | `0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)` | Elevated cards, floating elements |
| `shadow-lg` | `0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)` | Modals, popovers |
| `shadow-xl` | `0 20px 25px rgba(0,0,0,0.1), 0 10px 10px rgba(0,0,0,0.04)` | Dialogs, overlays |

---

## Component Library

### Button

```tsx
// Variants
<Button variant="primary">Upload Resume</Button>     // Indigo bg, white text
<Button variant="secondary">Cancel</Button>           // White bg, indigo border
<Button variant="ghost">View Details</Button>         // No bg, indigo text
<Button variant="danger">Delete</Button>              // Red bg, white text

// Sizes
<Button size="sm">Small</Button>                      // h-8, text-sm, px-3
<Button size="md">Medium</Button>                     // h-10, text-sm, px-4
<Button size="lg">Large</Button>                      // h-12, text-base, px-6

// States
<Button disabled>Processing...</Button>                // opacity-50, cursor-not-allowed
<Button loading>Generating...</Button>                 // Spinner icon, disabled
```

**Tailwind classes by variant:**

| Variant | Classes |
|---------|---------|
| `primary` | `bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2` |
| `secondary` | `bg-white text-primary-600 border border-primary-300 hover:bg-primary-50 active:bg-primary-100` |
| `ghost` | `text-primary-600 hover:bg-primary-50 active:bg-primary-100` |
| `danger` | `bg-error-500 text-white hover:bg-error-600 active:bg-error-700` |

### Card

```tsx
<Card>
  <CardHeader>
    <CardTitle>Resume Critique</CardTitle>
    <CardDescription>AI-powered analysis of your resume</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter>
    <Button variant="primary">Download</Button>
  </CardFooter>
</Card>
```

**Tailwind classes:** `bg-white rounded-lg shadow border border-slate-200 p-6`

### Badge

```tsx
<Badge variant="default">PM</Badge>          // slate bg
<Badge variant="primary">Active</Badge>      // indigo bg
<Badge variant="success">Complete</Badge>    // green bg
<Badge variant="warning">In Progress</Badge> // amber bg
<Badge variant="error">Critical</Badge>      // red bg
<Badge variant="outline">Coming Soon</Badge> // border only
```

**Tailwind classes:** `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium`

### Progress Bar

```tsx
<Progress value={65} label="Profile Completeness" />
```

**Structure:**
- Track: `h-2 bg-slate-200 rounded-full overflow-hidden`
- Fill: `h-full bg-primary-600 rounded-full transition-all duration-500`
- Label: `text-sm text-slate-600 mb-1`
- Percentage: `text-sm font-medium text-slate-800`

**Color thresholds:**
- 0-33%: `bg-error-500` (red)
- 34-66%: `bg-warning-500` (amber)
- 67-100%: `bg-success-500` (green)

### Input

```tsx
<Input
  label="Job Description"
  placeholder="Paste the job description here..."
  helperText="We'll use this to tailor your resume"
  error="Job description is required"
/>
```

**Tailwind classes:**
- Container: `flex flex-col gap-1.5`
- Label: `text-sm font-medium text-slate-700`
- Input: `h-10 rounded-md border border-slate-300 px-3 text-base text-slate-800 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none`
- Helper: `text-xs text-slate-500`
- Error: `text-xs text-error-500`
- Error state border: `border-error-500 focus:border-error-500 focus:ring-error-500/20`

### Textarea

Same styling as Input but:
- Min height: `min-h-[120px]`
- Resize: `resize-y`

---

## Layout Patterns

### Desktop Layout (1024px+)

```
┌──────────────────────────────────────────────────────────┐
│                    Top Bar (optional)                     │
├─────────────┬────────────────────────────────────────────┤
│             │                                            │
│   Sidebar   │              Main Content                  │
│   (240px)   │              (flex-1)                      │
│             │                                            │
│  ┌────────┐ │  ┌──────────────────────────────────────┐  │
│  │ Logo   │ │  │                                      │  │
│  ├────────┤ │  │         Section Content               │  │
│  │ About  │ │  │         (max-w-4xl mx-auto)           │  │
│  │ Resume │ │  │                                      │  │
│  │ Outrea │ │  │                                      │  │
│  │ Interv │ │  │                                      │  │
│  │ Negoti │ │  │                                      │  │
│  ├────────┤ │  │                                      │  │
│  │Profile │ │  │                                      │  │
│  │ Card   │ │  └──────────────────────────────────────┘  │
│  └────────┘ │                                            │
│             │                                            │
└─────────────┴────────────────────────────────────────────┘
```

**Sidebar:**
- Width: `w-60` (240px)
- Background: `bg-white` with `border-r border-slate-200`
- Position: `fixed h-screen`
- Content padding: `p-4`
- Nav items: `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium`
- Active nav: `bg-primary-50 text-primary-700`
- Inactive nav: `text-slate-600 hover:bg-slate-50 hover:text-slate-900`
- Locked nav (stub sections): `text-slate-400 cursor-not-allowed` with lock icon

**Main content area:**
- Offset: `ml-60` (to clear sidebar)
- Padding: `p-8`
- Max content width: `max-w-4xl mx-auto`

### Mobile Layout (< 768px)

```
┌──────────────────────────┐
│      Section Header      │
├──────────────────────────┤
│                          │
│                          │
│      Main Content        │
│      (full width)        │
│      (px-4)              │
│                          │
│                          │
│                          │
├──────────────────────────┤
│  About │Resume│  ...  │  │
│   Me   │      │       │  │
│  ───── │      │       │  │
│ Bottom Tab Navigation    │
└──────────────────────────┘
```

**Bottom tabs:**
- Position: `fixed bottom-0 left-0 right-0`
- Background: `bg-white border-t border-slate-200`
- Height: `h-16`
- Layout: `flex items-center justify-around`
- Tab: `flex flex-col items-center gap-1 text-xs`
- Active tab: `text-primary-600`
- Inactive tab: `text-slate-400`
- Safe area padding: `pb-safe` (for iPhone notch)

### Tablet Layout (768px-1023px)

Same as desktop but with a collapsible sidebar:
- Sidebar starts collapsed (icon-only, `w-16`)
- Hamburger toggle to expand to full `w-60`
- Main content adjusts: `ml-16` (collapsed) / `ml-60` (expanded)

---

## Chat UI Patterns

### Chat Container

```
┌──────────────────────────────────────┐
│         Section Header               │
├──────────────────────────────────────┤
│                                      │
│  ┌──────────────────────────────┐    │
│  │  AI message                  │    │
│  │  (left-aligned, slate bg)    │    │
│  └──────────────────────────────┘    │
│                                      │
│         ┌──────────────────────────┐ │
│         │  User message            │ │
│         │  (right-aligned, indigo) │ │
│         └──────────────────────────┘ │
│                                      │
│  ┌──────────────────────────────┐    │
│  │  AI typing indicator...      │    │
│  └──────────────────────────────┘    │
│                                      │
├──────────────────────────────────────┤
│  [Mic] [  Type your message...  ][→] │
└──────────────────────────────────────┘
```

### Chat Message Styles

**AI message (assistant):**
- Alignment: left
- Max width: `max-w-[80%]`
- Background: `bg-slate-100`
- Text: `text-slate-800`
- Border radius: `rounded-2xl rounded-tl-md` (flat top-left corner)
- Padding: `px-4 py-3`
- Avatar: Indigo circle with "PM" initials, `w-8 h-8 rounded-full bg-primary-600 text-white`

**User message:**
- Alignment: right
- Max width: `max-w-[80%]`
- Background: `bg-primary-600`
- Text: `text-white`
- Border radius: `rounded-2xl rounded-tr-md` (flat top-right corner)
- Padding: `px-4 py-3`

**Typing indicator:**
- Three animated dots in a message bubble
- Animation: `animate-bounce` with staggered delays (0ms, 150ms, 300ms)
- Dot size: `w-2 h-2 rounded-full bg-slate-400`
- Container: same as AI message

### Chat Input Bar

- Container: `flex items-end gap-2 p-4 border-t border-slate-200 bg-white`
- Voice button: `w-10 h-10 rounded-full flex items-center justify-center`
  - Idle: `bg-slate-100 text-slate-500 hover:bg-slate-200`
  - Recording: `bg-error-500 text-white animate-pulse`
- Text input: `flex-1 min-h-[40px] max-h-[120px] rounded-2xl border border-slate-300 px-4 py-2 resize-none`
- Send button: `w-10 h-10 rounded-full bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50`
  - Icon: Arrow-up or paper plane

### Voice Input Indicator

When recording is active:
- Mic button pulses red: `animate-pulse bg-error-500`
- Waveform visualization (optional): animated bars next to the input
- Status text below input: `text-xs text-error-500 font-medium` — "Recording... tap to stop"
- Real-time transcript appears in the input field as the user speaks

---

## Form Patterns

### Upload Zone (Drag and Drop)

```
┌─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐
│                                      │
│         📄 Drop your resume here     │
│                                      │
│        or click to browse files      │
│                                      │
│         PDF only, up to 10MB         │
│                                      │
└─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘
```

**States:**
- Default: `border-2 border-dashed border-slate-300 bg-slate-50 rounded-xl p-12 text-center`
- Hover/drag-over: `border-primary-400 bg-primary-50`
- Uploading: Progress bar inside the zone, file name displayed
- Complete: `border-success-400 bg-success-50`, checkmark icon, file name
- Error: `border-error-400 bg-error-50`, error message

### Profile Editor

Inline editing pattern — click to edit, save on blur or Enter:

```
┌──────────────────────────────────────┐
│  Profile                    [Edit]   │
├──────────────────────────────────────┤
│  Name:           Jane Smith      ✏️  │
│  Current Role:   Senior PM       ✏️  │
│  Experience:     6 years         ✏️  │
│  Goal Role:      Director        ✏️  │
│  Company:        Stripe          ✏️  │
│  ────────────────────────────────    │
│  Frameworks:     RICE, OKRs, JTBD   │
│  Industries:     Fintech, AI/ML     │
│  ────────────────────────────────    │
│  Completeness:   ████████░░ 85%     │
└──────────────────────────────────────┘
```

**Field display mode:** `text-slate-800 text-sm py-1 hover:bg-slate-50 rounded cursor-pointer`
**Field edit mode:** `border border-primary-500 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-primary-500/20`

---

## "Coming Soon" Pattern

Used for stub sections (Outreach, Interview, Negotiate):

```
┌──────────────────────────────────────┐
│                                      │
│          🔒 Coming Soon              │
│                                      │
│    [Section Name]                    │
│    [Description text]                │
│                                      │
│  ┌─────────┐ ┌─────────┐ ┌────────┐ │
│  │Feature 1│ │Feature 2│ │Feature │ │
│  │ preview │ │ preview │ │   3    │ │
│  │(grayed) │ │(grayed) │ │(grayed)│ │
│  └─────────┘ └─────────┘ └────────┘ │
│                                      │
│     We're building this next.        │
│     [Get notified when it's ready]   │
│                                      │
└──────────────────────────────────────┘
```

**Container:** `flex flex-col items-center justify-center min-h-[60vh] text-center px-4`
**Badge:** `<Badge variant="outline">Coming Soon</Badge>`
**Title:** `text-3xl font-bold text-slate-800 mt-4`
**Description:** `text-lg text-slate-500 mt-2 max-w-md`
**Feature cards:** `bg-slate-100 rounded-lg p-4 opacity-60`
**Feature card content:** `text-sm text-slate-500`

---

## Animation & Transition Guidelines

### General Rules

- All transitions use `transition-all duration-200 ease-in-out` unless otherwise specified
- Respect `prefers-reduced-motion`: wrap animations in `motion-safe:` variant
- No animations on initial page load (avoid layout shift)
- Loading states use subtle animations, never aggressive spinners

### Specific Animations

| Element | Animation | Duration | Tailwind |
|---------|-----------|----------|----------|
| Button hover | Background color shift | 200ms | `transition-colors duration-200` |
| Card hover | Subtle lift | 200ms | `transition-shadow duration-200 hover:shadow-md` |
| Sidebar expand | Width + content fade | 300ms | `transition-all duration-300` |
| Chat message appear | Fade in + slide up | 300ms | Custom: `animate-message-in` |
| Typing indicator dots | Bounce | 600ms loop | `animate-bounce` with stagger |
| Progress bar fill | Width expansion | 500ms | `transition-all duration-500` |
| Voice recording pulse | Opacity pulse | 1000ms loop | `animate-pulse` |
| Upload zone drag-over | Border + bg color | 150ms | `transition-colors duration-150` |
| Toast notification | Slide in from top | 300ms | Custom: `animate-slide-down` |
| Modal overlay | Fade in | 200ms | `animate-fade-in` |
| Modal content | Scale up + fade | 200ms | `animate-scale-in` |

### Custom Keyframes

Add to `tailwind.config.ts`:

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      keyframes: {
        "message-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          "0%": { opacity: "0", transform: "translateY(-12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "message-in": "message-in 300ms ease-out",
        "slide-down": "slide-down 300ms ease-out",
        "fade-in": "fade-in 200ms ease-out",
        "scale-in": "scale-in 200ms ease-out",
      },
    },
  },
};
```

### Loading States

**Chat AI response:** Typing indicator (three bouncing dots) in a message bubble
**File upload:** Linear progress bar inside the upload zone
**Resume generation:** Skeleton UI showing the resume layout with pulsing placeholder blocks
**Page navigation:** No full-page loader. Content streams in. Skeleton UI for async content.

**Skeleton pattern:**
```tsx
<div className="animate-pulse space-y-4">
  <div className="h-4 bg-slate-200 rounded w-3/4" />
  <div className="h-4 bg-slate-200 rounded w-1/2" />
  <div className="h-4 bg-slate-200 rounded w-5/6" />
</div>
```

---

## Iconography

Use [Lucide React](https://lucide.dev/) for all icons. Consistent, open-source, tree-shakeable.

### Key Icons

| Usage | Icon | Size |
|-------|------|------|
| Navigation: About Me | `User` | 20px |
| Navigation: Resume | `FileText` | 20px |
| Navigation: Outreach | `Mail` | 20px |
| Navigation: Interview | `MessageSquare` | 20px |
| Navigation: Negotiate | `DollarSign` | 20px |
| Chat: Send | `ArrowUp` or `Send` | 20px |
| Chat: Voice | `Mic` | 20px |
| Chat: Voice (recording) | `MicOff` or `Square` | 20px |
| Upload: File | `Upload` | 24px |
| Upload: Success | `CheckCircle` | 24px |
| Download | `Download` | 20px |
| Edit | `Pencil` | 16px |
| Lock | `Lock` | 16px |
| Severity: High | `AlertTriangle` | 16px |
| Severity: Medium | `AlertCircle` | 16px |
| Severity: Low | `Info` | 16px |
| Close / Dismiss | `X` | 20px |
| Menu (mobile) | `Menu` | 24px |
| Back | `ChevronLeft` | 20px |
| Expand | `ChevronDown` | 16px |

### Icon Colors

- Interactive (clickable): `text-slate-500 hover:text-slate-700`
- Active/selected: `text-primary-600`
- Decorative (in text): `text-slate-400`
- Status: Use semantic colors (`text-success-500`, `text-error-500`, etc.)

---

## Responsive Breakpoints

| Breakpoint | Min Width | Tailwind Prefix | Layout |
|------------|-----------|-----------------|--------|
| Mobile | 0px | (default) | Single column, bottom tabs |
| Tablet | 768px | `md:` | Collapsible sidebar |
| Desktop | 1024px | `lg:` | Fixed sidebar |
| Wide | 1280px | `xl:` | Wider content area |

### Mobile-First Approach

Write styles mobile-first, then add responsive overrides:

```tsx
<div className="px-4 md:px-6 lg:px-8">           // Padding scales up
<div className="grid grid-cols-1 md:grid-cols-2">  // Stack → 2 columns
<div className="hidden lg:block">                   // Sidebar: desktop only
<div className="fixed bottom-0 lg:hidden">          // Bottom nav: mobile only
```

---

## Dark Mode

**Not in MVP.** The design system is built for light mode only. However, all color references use Tailwind tokens, making a future dark mode implementation straightforward by adding `dark:` variants.

When dark mode is added:
- `bg-white` → `dark:bg-slate-900`
- `text-slate-800` → `dark:text-slate-200`
- `border-slate-200` → `dark:border-slate-700`
- Cards: `dark:bg-slate-800`
- Inputs: `dark:bg-slate-800 dark:border-slate-600`

---

## Accessibility Checklist

- [ ] All interactive elements have visible focus states (`focus:ring-2`)
- [ ] Color contrast meets WCAG AA (4.5:1 for text, 3:1 for UI components)
- [ ] Icons used alongside text have `aria-hidden="true"`
- [ ] Icon-only buttons have `aria-label`
- [ ] Form inputs have associated `<label>` elements
- [ ] Error messages are linked via `aria-describedby`
- [ ] Chat messages use `role="log"` with `aria-live="polite"`
- [ ] Voice recording state is announced to screen readers
- [ ] Keyboard navigation: Tab through all interactive elements in logical order
- [ ] Skip navigation link for keyboard users
- [ ] `prefers-reduced-motion` disables all non-essential animations
