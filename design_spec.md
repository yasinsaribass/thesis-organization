# COMPLETE DESIGN SPECIFICATION

This document outlines the exhaustive design, architecture, and component library for the application.

## 1. Global Tailwind Configuration & Design Tokens

### Colors
Based on `src/styles/theme.css`:

| Token Name | Hex / Value (Light) | Hex / Value (Dark) |
| :--- | :--- | :--- |
| **Backgrounds** | | |
| `background` | `#ffffff` | `oklch(0.145 0 0)` |
| `foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` |
| `card` | `#ffffff` | `oklch(0.145 0 0)` |
| `card-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` |
| `popover` | `oklch(1 0 0)` | `oklch(0.145 0 0)` |
| `popover-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` |
| **Primary** | | |
| `primary` | `#030213` | `oklch(0.985 0 0)` |
| `primary-foreground` | `oklch(1 0 0)` | `oklch(0.205 0 0)` |
| **Secondary** | | |
| `secondary` | `oklch(0.95 0.0058 264.53)` | `oklch(0.269 0 0)` |
| `secondary-foreground` | `#030213` | `oklch(0.985 0 0)` |
| **Muted** | | |
| `muted` | `#ececf0` | `oklch(0.269 0 0)` |
| `muted-foreground` | `#717182` | `oklch(0.708 0 0)` |
| **Accent** | | |
| `accent` | `#e9ebef` | `oklch(0.269 0 0)` |
| `accent-foreground` | `#030213` | `oklch(0.985 0 0)` |
| **Destructive** | | |
| `destructive` | `#d4183d` | `oklch(0.396 0.141 25.723)` |
| `destructive-foreground` | `#ffffff` | `oklch(0.637 0.237 25.331)` |
| **Borders & Inputs** | | |
| `border` | `rgba(0, 0, 0, 0.1)` | `oklch(0.269 0 0)` |
| `input` | `transparent` | `oklch(0.269 0 0)` |
| `input-background` | `#f3f3f5` | N/A |
| `switch-background` | `#cbced4` | N/A |
| `ring` | `oklch(0.708 0 0)` | `oklch(0.439 0 0)` |
| **Sidebar** | | |
| `sidebar` | `oklch(0.985 0 0)` | `oklch(0.205 0 0)` |
| `sidebar-foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` |
| `sidebar-primary` | `#030213` | `oklch(0.488 0.243 264.376)` |
| `sidebar-primary-foreground` | `oklch(0.985 0 0)` | `oklch(0.985 0 0)` |
| `sidebar-accent` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` |
| `sidebar-accent-foreground` | `oklch(0.205 0 0)` | `oklch(0.985 0 0)` |
| `sidebar-border` | `oklch(0.922 0 0)` | `oklch(0.269 0 0)` |
| `sidebar-ring` | `oklch(0.708 0 0)` | `oklch(0.439 0 0)` |

### Typography
Base font size: `16px`

| Element | Size | Weight | Line Height |
| :--- | :--- | :--- | :--- |
| `h1` | `text-2xl` | Medium (500) | 1.5 |
| `h2` | `text-xl` | Medium (500) | 1.5 |
| `h3` | `text-lg` | Medium (500) | 1.5 |
| `h4` | `text-base` | Medium (500) | 1.5 |
| `label` | `text-base` | Medium (500) | 1.5 |
| `button` | `text-base` | Medium (500) | 1.5 |
| `input` | `text-base` | Normal (400) | 1.5 |

### Radius
- Default Radius: `0.625rem` (approx 10px)
- `radius-sm`: `calc(0.625rem - 4px)`
- `radius-md`: `calc(0.625rem - 2px)`
- `radius-lg`: `0.625rem`
- `radius-xl`: `calc(0.625rem + 4px)`

---

## 2. Assets & Global Styles

### Icons
- **Library**: `lucide-react` (v0.487.0)
- **Usage**: Used throughout components, typically imported as named exports (e.g., `import { Bell } from 'lucide-react'`).

### Global CSS
- `src/styles/theme.css`: Defines CSS variables for colors, radius, and standard typography overrides.
- `src/styles/index.css`: Imports `fonts.css`, `tailwind.css`, and `theme.css`.

---

## 3. Component Library Overview

The project uses a component library structure located in `src/app/components/ui`.
These describe specific implementations of **shadcn/ui** primitives.

**List of UI Components:**
- Accordion, Alert, AlertDialog, AspectRatio, Avatar, Badge, Breadcrumb, Button, Calendar, Card, Carousel, Chart, Checkbox, Collapsible, Command, ContextMenu, Dialog, Drawer, DropdownMenu, Form, HoverCard, Input, InputOTP, Label, Menubar, NavigationMenu, Pagination, Popover, Progress, RadioGroup, Resizable, ScrollArea, Select, Separator, Sheet, Sidebar, Skeleton, Slider, Sonner, Switch, Table, Tabs, Textarea, Toggle, ToggleGroup, Tooltip.

**Special Internal Components:**
- `DeadlineNotification` (used in KanbanScreen)
- `TaskCard`, `ColumnDropZone` (internal to KanbanScreen)

---

## 4. Spacing, Grid & Alignment Rules

### Page Containers
Standard layout containers are used across pages:
- **Centered Card Layout**: `max-w-md` or `max-w-2xl` centered vertically and horizontally (`min-h-screen flex items-center justify-center`).
- **Dashboard Layout**: `max-w-4xl`, `max-w-5xl`, or `max-w-7xl` centered horizontally (`mx-auto`).

### Spacing Guidelines
- **Padding**: Standard page padding is `p-8`.
- **Gaps**: `gap-4`, `gap-6`, `space-y-4`, `space-y-8` are frequently used.
- **Margins**: `mb-12` is common for separating Headers from Content.

### Backgrounds
- Global Page Background: `bg-gray-50` (`#f9fafb`)
- Card Background: `bg-white`

---

## 5. Exhaustive Page Inventory & Layouts

### 1. Login Screen
- **Route**: `/login`
- **File**: `src/app/components/LoginScreen.tsx`
- **Structure**: Split Screen Layout (`min-h-screen flex`)
    - **Left (lg+)**: `w-1/2 bg-gray-50` with Branding/Logo.
    - **Right**: `flex-1 bg-white lg:bg-gray-50` with centered Login Card (`max-w-md bg-white`).
- **Components**: Standard HTML elements (`button`, `input`). Emoji icons used for roles.
- **Local State**: `selectedRole` ('student' | 'supervisor'), `email`, `password`.

### 2. Setup Screen (Thesis Planning)
- **Route**: `/`
- **File**: `src/app/components/SetupScreen.tsx`
- **Structure**: Centered Card (`max-w-md bg-white`) on `bg-gray-50` background.
- **Sections**:
    - Header: "Bachelor Thesis Journey"
    - Form: Thesis Title (Input), Final Deadline (Input), Start Planning (Button).
- **Validation**: Checks for empty fields before navigation.

### 3. Main Tasks Screen
- **Route**: `/main-tasks`
- **File**: `src/app/components/MainTasksScreen.tsx`
- **Structure**: `max-w-4xl mx-auto` container.
- **Sections**:
    - Context Header: Thesis Title.
    - Title Header: "Main Tasks" with "Supervisor Suggestions" button (with `Bell` icon).
    - Task List: Vertical stack of tasks. Each task card has Title, Badge (if supervisor assigned), Description, "Edit" button, "Open" (Kanban) button.
    - Footer: "Create New Main Task" button (large), Back to Home link.
- **Components**: `Badge` (UI), `Bell` (Lucide).

### 4. Planning Screen
- **Route**: `/planning`
- **File**: `src/app/components/PlanningScreen.tsx`
- **Structure**: Centered Card (`max-w-2xl bg-white`) on `bg-gray-50`.
- **Sections**:
    - Header: "Prepare your next stage"
    - Form: Main Task Title, Subtasks (Add Subtask input + list), "Start working on this task" button.
- **Features**: Dynamic list of subtasks with optional notes and deadlines.

### 5. Edit Main Task Screen
- **Route**: `/edit-main-task`
- **File**: `src/app/components/EditMainTaskScreen.tsx`
- **Structure**: Centered Card (`max-w-2xl bg-white`).
- **Sections**: Identical structure to Planning Screen but pre-filled.
- **Components**: `X` icon (Lucide) for removing subtasks.

### 6. Kanban Screen
- **Route**: `/kanban`
- **File**: `src/app/components/KanbanScreen.tsx`
- **Structure**: `max-w-7xl mx-auto` container.
- **Libraries**: `react-dnd`, `react-dnd-html5-backend`.
- **Sections**:
    - Header: Thesis Title, Main Task Title, DeadlineNotification.
    - Board: 3 Columns ("To Do", "In Progress", "Done").
    - Columns: `ColumnDropZone` component.
    - Cards: `TaskCard` component (Supports Drag & Drop).
    - Footer: Navigation to Planning/Progress.
- **Features**: Visual deadline indicators (colors), Supervisor Assigned badge on cards, Double-click to edit subtask details (Modal).

### 7. Progress Screen
- **Route**: `/progress`
- **File**: `src/app/components/ProgressScreen.tsx`
- **Structure**: Centered Card (`max-w-2xl bg-white`).
- **Sections**:
    - Header: Thesis/Main Task Context.
    - Circular Progress: Custom SVG implementation showing completed subtasks count.
    - Subtask Progress List: List showing progress bars for individual subtasks.
    - Navigation: Back to Kanban/Planning, Forward to Feedback.
- **Components**: `Circle`, `ArrowRight`, `Check` (Lucide).

### 8. Feedback Screen
- **Route**: `/feedback`
- **File**: `src/app/components/FeedbackScreen.tsx`
- **Structure**: Centered Card (`max-w-2xl bg-white`).
- **Sections**:
    - Header: "Weekly Feedback".
    - Feedback List: Static list of feedback cards.
    - Footer: Navigation links.

### 9. Supervisor Dashboard
- **Route**: `/supervisor-dashboard`
- **File**: `src/app/components/SupervisorDashboard.tsx`
- **Structure**: Full-width Navbar + `max-w-7xl mx-auto` Content.
- **Sections**:
    - Navbar: Logo, "Supervisor" label, Logout button.
    - Header: "Supervisor Dashboard".
    - Grid: 2-column grid of Student Cards (`bg-white rounded-lg`).
    - Student Card: Student Name, Thesis Title, "View Details" button.
- **Components**: `Button` (UI).

### 10. Student Detail View
- **Route**: `/student-detail`
- **File**: `src/app/components/StudentDetailView.tsx`
- **Structure**: Full-width Navbar + `max-w-7xl mx-auto` Content.
- **Sections**:
    - Header: Student Name, Thesis Title, Overall Progress Bar.
    - Main Tasks Overview: `Collapsible` list of main tasks.
        - Expanded View: Shows subtasks table (Name, Status Badge, Source Badge, Deadline).
    - Suggestion Activity: Filterable table (Pending/Accepted/Rejected) of suggestions.
- **Components**: `Button`, `Badge`, `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` (UI/Collapsible), `ChevronDown/Up`.

### 11. Supervisor Task Suggestions
- **Route**: `/supervisor-suggestions`
- **File**: `src/app/components/SupervisorTaskSuggestions.tsx`
- **Structure**: Navbar + `max-w-5xl mx-auto` Content.
- **Sections**:
    - Header: "Supervisor Task Suggestions".
    - List: Cards for each suggestion (`bg-white rounded-lg`).
        - Card Content: Title, Badge ("Suggested by Supervisor"), Description, Deadline, Subtasks list (if applicable).
        - Actions: Accept / Reject buttons.
- **Components**: `Button`, `Badge`.

### 12. Create Task Suggestion (Supervisor)
- **Route**: `/create-task-suggestion`
- **File**: `src/app/components/CreateTaskSuggestion.tsx`
- **Structure**: Navbar + `max-w-4xl mx-auto` Content.
- **Sections**:
    - Form:
        - Task Type: Radio Group (Main Task vs Subtask).
        - Parent Task Select (if Subtask).
        - Task Details: Title, Description, Deadline.
        - Subtasks Builder: Add/Remove subtasks dynamically.
    - Footer: "Send for Student Approval" / Cancel.
- **Components**: `Button`, `Input`, `Label`, `Textarea`, `RadioGroup`, `Select`, `X` icon.

