# STYLE_GUIDE.md - Innovation Budget Tracker Design System

## Design Philosophy

This app follows a **modern dashboard aesthetic** inspired by Sphere UI — clean, spacious, professional, with thoughtful data visualization. The design prioritizes clarity and information hierarchy while maintaining visual sophistication.

### Core Principles

1. **Generous whitespace** — Cards and sections breathe; never cramped
2. **Subtle depth** — Light shadows and borders, not heavy drop shadows
3. **Restrained color** — Mostly neutral with strategic blue accents
4. **Typography hierarchy** — Clear distinction between labels, values, and headings
5. **Consistent corners** — Rounded corners throughout (12-16px for cards, 8px for buttons)
6. **Micro-interactions** — Subtle hover states and transitions

---

## Color Palette

### Primary Colors

```css
:root {
  /* Primary Blue - Used sparingly for emphasis */
  --primary-500: #2563EB;        /* Main actions, highlighted data */
  --primary-600: #1D4ED8;        /* Hover states */
  --primary-400: #60A5FA;        /* Lighter accents */
  --primary-100: #DBEAFE;        /* Very light backgrounds */
  --primary-50: #EFF6FF;         /* Subtle highlights */
}
```

### Neutral Colors

```css
:root {
  /* Backgrounds */
  --bg-page: #F8FAFC;            /* Page background - very light gray */
  --bg-card: #FFFFFF;            /* Card backgrounds - pure white */
  --bg-elevated: #FFFFFF;        /* Modals, dropdowns */
  --bg-subtle: #F1F5F9;          /* Subtle section backgrounds */
  --bg-sidebar: #FFFFFF;         /* Sidebar background */
  
  /* Borders */
  --border-light: #E2E8F0;       /* Card borders, dividers */
  --border-default: #CBD5E1;     /* Input borders */
  --border-focus: #2563EB;       /* Focus rings */
  
  /* Text */
  --text-primary: #0F172A;       /* Headings, important text */
  --text-secondary: #475569;     /* Body text, descriptions */
  --text-tertiary: #94A3B8;      /* Labels, placeholders, muted */
  --text-inverse: #FFFFFF;       /* Text on dark backgrounds */
}
```

### Semantic Colors

```css
:root {
  /* Success - Green */
  --success-500: #10B981;
  --success-100: #D1FAE5;
  --success-700: #047857;
  
  /* Warning - Amber */
  --warning-500: #F59E0B;
  --warning-100: #FEF3C7;
  --warning-700: #B45309;
  
  /* Danger - Red */
  --danger-500: #EF4444;
  --danger-100: #FEE2E2;
  --danger-700: #B91C1C;
  
  /* Info - Blue (same as primary) */
  --info-500: #2563EB;
  --info-100: #DBEAFE;
}
```

### Chart Colors

```css
:root {
  /* Primary chart color - Blue */
  --chart-primary: #2563EB;
  --chart-primary-light: #93C5FD;
  
  /* Secondary chart color - Dark/Black */
  --chart-secondary: #1E293B;
  --chart-secondary-light: #64748B;
  
  /* Extended palette for multi-series charts */
  --chart-1: #2563EB;            /* Blue */
  --chart-2: #1E293B;            /* Near black */
  --chart-3: #94A3B8;            /* Gray */
  --chart-4: #DBEAFE;            /* Light blue */
  
  /* Status colors for project charts */
  --chart-active: #2563EB;
  --chart-pipeline: #F59E0B;
  --chart-completed: #94A3B8;
}
```

---

## Typography

### Font Stack

```css
:root {
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace;
}
```

**Note:** Use Inter as the primary font. Install via Google Fonts:
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

### Type Scale

| Name | Size | Weight | Line Height | Usage |
|------|------|--------|-------------|-------|
| `display` | 32px | 700 | 1.2 | Page titles, large dashboard numbers |
| `h1` | 24px | 600 | 1.3 | Section headers |
| `h2` | 20px | 600 | 1.4 | Card titles |
| `h3` | 16px | 600 | 1.5 | Subsection headers |
| `body` | 14px | 400 | 1.5 | Default body text |
| `body-sm` | 13px | 400 | 1.5 | Secondary text, table cells |
| `caption` | 12px | 500 | 1.4 | Labels, badges, meta info |
| `overline` | 11px | 600 | 1.3 | Category labels (uppercase) |

### Tailwind Classes

```html
<!-- Display (large numbers like $952,041) -->
<span class="text-3xl font-bold text-slate-900">$952,041</span>

<!-- Card Title -->
<h3 class="text-lg font-semibold text-slate-900">Overview</h3>

<!-- Body Text -->
<p class="text-sm text-slate-600">Project description here</p>

<!-- Label/Caption -->
<span class="text-xs font-medium text-slate-500">TOTAL BUDGET</span>

<!-- Metric Label (uppercase) -->
<span class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Budget</span>
```

---

## Spacing System

Use Tailwind's default spacing scale. Key values:

| Token | Value | Usage |
|-------|-------|-------|
| `1` | 4px | Tight spacing, icon gaps |
| `2` | 8px | Inline element spacing |
| `3` | 12px | Small component padding |
| `4` | 16px | Default card padding, gaps |
| `5` | 20px | Medium spacing |
| `6` | 24px | Section spacing |
| `8` | 32px | Large section gaps |
| `10` | 40px | Page margins |
| `12` | 48px | Major section dividers |

### Layout Spacing

```css
/* Page container */
.page-container {
  @apply max-w-7xl mx-auto px-6 py-8;
}

/* Card grid */
.card-grid {
  @apply grid gap-6;
}

/* Card internal padding */
.card {
  @apply p-5;
}
```

---

## Components

### Cards

The primary container for content. Multiple variants based on content type.

```html
<!-- Base Card -->
<div class="bg-white rounded-2xl border border-slate-200 p-5">
  <!-- Content -->
</div>

<!-- Card with Header -->
<div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
  <div class="px-5 py-4 border-b border-slate-100">
    <div class="flex items-center justify-between">
      <h3 class="text-base font-semibold text-slate-900">Card Title</h3>
      <button class="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
        <svg class="w-4 h-4 text-slate-400"><!-- Arrow icon --></svg>
      </button>
    </div>
  </div>
  <div class="p-5">
    <!-- Content -->
  </div>
</div>

<!-- Metric Card (like Revenue, Page Views in Sphere UI) -->
<div class="bg-white rounded-2xl border border-slate-200 p-5">
  <div class="flex items-center justify-between mb-4">
    <div class="flex items-center gap-2">
      <span class="text-blue-600">⚡</span>
      <span class="text-sm font-medium text-slate-600">Revenue</span>
    </div>
    <button class="p-1 hover:bg-slate-100 rounded transition-colors">
      <svg class="w-4 h-4 text-slate-400"><!-- Expand arrow --></svg>
    </button>
  </div>
  <div class="mb-1">
    <span class="text-2xl font-bold text-slate-900">$5,010.68</span>
  </div>
  <div class="flex items-center gap-2">
    <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
      ↑ 46.9%
    </span>
    <span class="text-xs text-slate-400">from $4,430.41</span>
  </div>
</div>
```

### Metric Display

For displaying key numbers with context.

```html
<!-- Large Metric (Dashboard hero) -->
<div class="text-center">
  <div class="text-4xl font-bold text-slate-900 mb-1">$324,432</div>
  <div class="text-sm text-slate-500">YTD Actual Spend</div>
</div>

<!-- Metric with Change Indicator -->
<div>
  <div class="text-2xl font-bold text-slate-900">34.1%</div>
  <div class="flex items-center gap-2 mt-1">
    <span class="text-xs font-medium text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded">
      Below pace
    </span>
  </div>
</div>

<!-- Compact Metric Row -->
<div class="flex items-center justify-between py-3 border-b border-slate-100">
  <span class="text-sm text-slate-600">Budget</span>
  <span class="text-sm font-semibold text-slate-900">$952,041</span>
</div>
```

### Badges / Status Pills

```html
<!-- Status Badges -->
<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
  Active
</span>

<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
  Pipeline
</span>

<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
  Completed
</span>

<!-- Change Indicator -->
<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
  ↑ 12.0%
</span>

<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
  ↓ 5.4%
</span>

<!-- Neutral/Info Badge -->
<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
  Q3
</span>
```

### Buttons

```html
<!-- Primary Button -->
<button class="inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors">
  Save Changes
</button>

<!-- Secondary Button -->
<button class="inline-flex items-center justify-center px-4 py-2.5 bg-white text-slate-700 text-sm font-medium rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
  Cancel
</button>

<!-- Ghost Button -->
<button class="inline-flex items-center justify-center px-3 py-2 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-100 transition-colors">
  View All
</button>

<!-- Icon Button -->
<button class="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
  <svg class="w-5 h-5"><!-- Icon --></svg>
</button>

<!-- Button with Icon -->
<button class="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors">
  <svg class="w-4 h-4"><!-- Plus icon --></svg>
  New Allocation
</button>
```

### Form Inputs

```html
<!-- Text Input -->
<div>
  <label class="block text-sm font-medium text-slate-700 mb-1.5">
    Project Name
  </label>
  <input 
    type="text" 
    class="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
    placeholder="Enter project name"
  />
</div>

<!-- Select -->
<div>
  <label class="block text-sm font-medium text-slate-700 mb-1.5">
    Funder
  </label>
  <select class="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow appearance-none cursor-pointer">
    <option>Select funder...</option>
    <option>CABHI</option>
    <option>envisAGE</option>
  </select>
</div>

<!-- Number Input (for hours, currency) -->
<div>
  <label class="block text-sm font-medium text-slate-700 mb-1.5">
    Budgeted Hours
  </label>
  <input 
    type="number" 
    class="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 text-right font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
    placeholder="0"
  />
</div>
```

### Progress Bars

```html
<!-- Simple Progress Bar -->
<div class="h-2 bg-slate-100 rounded-full overflow-hidden">
  <div class="h-full bg-blue-600 rounded-full" style="width: 34%"></div>
</div>

<!-- Progress with Label -->
<div>
  <div class="flex justify-between text-sm mb-1.5">
    <span class="text-slate-600">Spent</span>
    <span class="font-medium text-slate-900">34%</span>
  </div>
  <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
    <div class="h-full bg-blue-600 rounded-full transition-all duration-500" style="width: 34%"></div>
  </div>
</div>

<!-- Multi-segment Progress (Budget vs Actual) -->
<div class="h-3 bg-slate-100 rounded-full overflow-hidden flex">
  <div class="h-full bg-blue-600" style="width: 34%"></div>
  <div class="h-full bg-slate-300" style="width: 43%"></div>
</div>

<!-- Status-colored Progress -->
<div class="h-2 bg-slate-100 rounded-full overflow-hidden">
  <div class="h-full bg-amber-500 rounded-full" style="width: 46%"></div>
</div>
```

### Tables

```html
<div class="bg-white rounded-2xl border border-slate-200 overflow-hidden">
  <table class="w-full">
    <thead>
      <tr class="border-b border-slate-100">
        <th class="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Employee</th>
        <th class="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Base Rate</th>
        <th class="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Benefits</th>
        <th class="px-5 py-3 text-right text-xs font-semibold text-slate-500 uppercase tracking-wide">Total</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-slate-100">
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="px-5 py-4">
          <div class="text-sm font-medium text-slate-900">Daly, Blake</div>
          <div class="text-xs text-slate-500">Director</div>
        </td>
        <td class="px-5 py-4 text-right text-sm text-slate-600">$75.51</td>
        <td class="px-5 py-4 text-right text-sm text-slate-600">$19.23</td>
        <td class="px-5 py-4 text-right text-sm font-semibold text-slate-900">$94.74</td>
      </tr>
      <!-- More rows -->
    </tbody>
  </table>
</div>
```

### Lists

```html
<!-- Project List Item -->
<div class="flex items-center gap-4 p-4 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer">
  <div class="flex-1 min-w-0">
    <div class="flex items-center gap-2">
      <h4 class="text-sm font-semibold text-slate-900 truncate">8-80 Initiative</h4>
      <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
        Active
      </span>
    </div>
    <p class="text-xs text-slate-500 mt-0.5">CHEO RI • 84 days left</p>
  </div>
  <div class="text-right">
    <div class="text-sm font-semibold text-slate-900">38%</div>
    <div class="text-xs text-slate-400">spent</div>
  </div>
  <svg class="w-4 h-4 text-slate-300"><!-- Chevron right --></svg>
</div>
```

---

## Navigation

### Sidebar (Desktop)

```html
<aside class="w-64 bg-white border-r border-slate-200 h-screen flex flex-col">
  <!-- Logo -->
  <div class="px-5 py-6 border-b border-slate-100">
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center">
        <span class="text-white font-bold text-sm">IB</span>
      </div>
      <div>
        <div class="text-sm font-semibold text-slate-900">Innovation</div>
        <div class="text-xs text-slate-500">Budget Tracker</div>
      </div>
    </div>
  </div>
  
  <!-- Navigation -->
  <nav class="flex-1 px-3 py-4 space-y-1">
    <!-- Active Item -->
    <a href="#" class="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-100 text-slate-900">
      <svg class="w-5 h-5"><!-- Icon --></svg>
      <span class="text-sm font-medium">Overview</span>
    </a>
    
    <!-- Inactive Item -->
    <a href="#" class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
      <svg class="w-5 h-5"><!-- Icon --></svg>
      <span class="text-sm font-medium">Projects</span>
    </a>
    
    <!-- Expandable Section -->
    <div>
      <button class="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
        <div class="flex items-center gap-3">
          <svg class="w-5 h-5"><!-- Icon --></svg>
          <span class="text-sm font-medium">Allocations</span>
        </div>
        <svg class="w-4 h-4"><!-- Chevron --></svg>
      </button>
      <div class="ml-8 mt-1 space-y-1">
        <a href="#" class="block px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors">
          Salary Budget
        </a>
        <a href="#" class="block px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors">
          Enter Actuals
        </a>
      </div>
    </div>
  </nav>
  
  <!-- Footer -->
  <div class="px-5 py-4 border-t border-slate-100">
    <div class="text-xs text-slate-400">FY 2025-26 • Q3</div>
  </div>
</aside>
```

### Tab Navigation

```html
<!-- Pill Tabs (like Today/Week/Month/Year in Sphere UI) -->
<div class="inline-flex items-center bg-slate-100 rounded-xl p-1">
  <button class="px-4 py-2 text-sm font-medium text-slate-500 rounded-lg hover:text-slate-700 transition-colors">
    Today
  </button>
  <button class="px-4 py-2 text-sm font-medium text-slate-900 bg-white rounded-lg shadow-sm">
    Week
  </button>
  <button class="px-4 py-2 text-sm font-medium text-slate-500 rounded-lg hover:text-slate-700 transition-colors">
    Month
  </button>
  <button class="px-4 py-2 text-sm font-medium text-slate-500 rounded-lg hover:text-slate-700 transition-colors">
    Year
  </button>
</div>

<!-- Filter Pills -->
<div class="flex items-center gap-2">
  <button class="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-full">
    All (12)
  </button>
  <button class="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
    Active (8)
  </button>
  <button class="px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
    Pipeline (4)
  </button>
</div>
```

---

## Charts & Data Visualization

### Chart Styling Guidelines

1. **Use blue as primary color**, dark gray/black as secondary
2. **Rounded bar ends** for bar charts
3. **Light grid lines** (slate-100) or no grid
4. **Clean axis labels** — small, slate-500 color
5. **Tooltips** — white background, subtle shadow, rounded corners
6. **Legends** — inline when possible, small dots + labels

### Recharts Configuration

```tsx
// Theme constants for Recharts
const chartTheme = {
  colors: {
    primary: '#2563EB',
    secondary: '#1E293B',
    tertiary: '#94A3B8',
    grid: '#E2E8F0',
  },
  fontFamily: 'Inter, sans-serif',
};

// Bar Chart Example
<BarChart data={data}>
  <CartesianGrid strokeDasharray="0" stroke="#E2E8F0" vertical={false} />
  <XAxis 
    dataKey="month" 
    axisLine={false}
    tickLine={false}
    tick={{ fill: '#94A3B8', fontSize: 12 }}
  />
  <YAxis 
    axisLine={false}
    tickLine={false}
    tick={{ fill: '#94A3B8', fontSize: 12 }}
    tickFormatter={(value) => `$${value/1000}k`}
  />
  <Bar 
    dataKey="budget" 
    fill="#E2E8F0" 
    radius={[4, 4, 0, 0]}
  />
  <Bar 
    dataKey="actual" 
    fill="#2563EB" 
    radius={[4, 4, 0, 0]}
  />
</BarChart>

// Area Chart Example
<AreaChart data={data}>
  <defs>
    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1}/>
      <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
    </linearGradient>
  </defs>
  <Area 
    type="monotone" 
    dataKey="value" 
    stroke="#2563EB" 
    strokeWidth={2}
    fill="url(#colorValue)"
  />
</AreaChart>
```

### Mini Sparklines

For inline charts in cards (like in Sphere UI):

```tsx
// Small inline area chart
<ResponsiveContainer width={120} height={40}>
  <AreaChart data={sparklineData}>
    <Area 
      type="monotone" 
      dataKey="value" 
      stroke="#2563EB" 
      strokeWidth={1.5}
      fill="#DBEAFE"
    />
  </AreaChart>
</ResponsiveContainer>
```

---

## Layout Patterns

### Dashboard Grid

```html
<!-- Main dashboard layout -->
<div class="min-h-screen bg-slate-50">
  <!-- Sidebar -->
  <aside class="fixed left-0 top-0 w-64 h-full">
    <!-- Sidebar content -->
  </aside>
  
  <!-- Main content -->
  <main class="ml-64 p-8">
    <!-- Page header -->
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">Overview</h1>
        <p class="text-sm text-slate-500 mt-1">FY 2025-26 Budget Tracking</p>
      </div>
      <div class="flex items-center gap-4">
        <!-- Date picker, filters, etc -->
      </div>
    </div>
    
    <!-- Metric cards row -->
    <div class="grid grid-cols-4 gap-6 mb-8">
      <!-- Metric cards -->
    </div>
    
    <!-- Main content grid -->
    <div class="grid grid-cols-3 gap-6">
      <!-- Large card spanning 2 cols -->
      <div class="col-span-2">
        <!-- Chart card -->
      </div>
      <!-- Sidebar card -->
      <div>
        <!-- List card -->
      </div>
    </div>
  </main>
</div>
```

### Card Grid Patterns

```html
<!-- 4-column metric cards -->
<div class="grid grid-cols-4 gap-6">
  <!-- Cards -->
</div>

<!-- 2-column with varying heights -->
<div class="grid grid-cols-2 gap-6">
  <!-- Cards -->
</div>

<!-- Responsive grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  <!-- Cards -->
</div>
```

---

## Animations & Transitions

### Standard Transitions

```css
/* Default transition for interactive elements */
.transition-default {
  @apply transition-all duration-200 ease-out;
}

/* Hover transitions */
.hover-lift {
  @apply transition-transform duration-200 hover:-translate-y-0.5;
}

/* Focus ring */
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2;
}
```

### Loading States

```html
<!-- Skeleton loader for cards -->
<div class="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
  <div class="h-4 bg-slate-200 rounded w-1/3 mb-4"></div>
  <div class="h-8 bg-slate-200 rounded w-1/2 mb-2"></div>
  <div class="h-3 bg-slate-200 rounded w-1/4"></div>
</div>

<!-- Spinner -->
<svg class="animate-spin h-5 w-5 text-blue-600" viewBox="0 0 24 24">
  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
</svg>
```

---

## Icons

Use **Lucide React** icons (consistent with Sphere UI style):

```bash
npm install lucide-react
```

```tsx
import { 
  LayoutDashboard,
  FolderKanban,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  ChevronDown,
  Plus,
  Search,
  Settings,
  Download,
  Upload,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
} from 'lucide-react';

// Usage
<LayoutDashboard className="w-5 h-5 text-slate-600" />
```

### Icon Sizing

| Context | Size | Class |
|---------|------|-------|
| Navigation | 20px | `w-5 h-5` |
| Buttons | 16px | `w-4 h-4` |
| Inline text | 14px | `w-3.5 h-3.5` |
| Large feature | 24px | `w-6 h-6` |

---

## Responsive Breakpoints

Follow Tailwind defaults:

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| `sm` | 640px | Large phones |
| `md` | 768px | Tablets |
| `lg` | 1024px | Small laptops |
| `xl` | 1280px | Desktops |
| `2xl` | 1536px | Large screens |

### Mobile Adaptations

- Sidebar collapses to bottom navigation or hamburger menu
- Cards stack vertically
- Tables become card lists
- Reduce padding (p-4 instead of p-5)

---

## Do's and Don'ts

### Do ✓

- Use generous whitespace between sections
- Keep text hierarchy clear (max 3 levels visible)
- Use blue sparingly — mostly for CTAs and emphasis
- Round corners consistently (2xl for cards, xl for buttons)
- Add subtle hover states to all interactive elements
- Use icons alongside labels for clarity
- Show loading states for async operations

### Don't ✗

- Don't use more than 2-3 colors in a single view
- Don't make text too small (minimum 12px for anything readable)
- Don't use heavy drop shadows — keep them subtle
- Don't overcrowd cards with information
- Don't use all-caps except for small labels
- Don't mix different border radius values
- Don't use pure black (#000) — use slate-900 instead

---

## Tailwind Config

```js
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      colors: {
        // Add any custom colors if needed
      },
    },
  },
  plugins: [],
};
```

---

*This style guide should be used alongside CLAUDE.md when building the Innovation Budget Tracker PWA.*
