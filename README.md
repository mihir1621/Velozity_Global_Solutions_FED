# Project Alpha Analytics - Multi-View Task Management App

## Overview
A production-ready React + TypeScript application featuring a multi-view project management system (Kanban, List, and Timeline). It is built from scratch without any UI, Drag-and-Drop, or Virtual Scrolling libraries, conforming to modern performance metrics and clean structural practices.

## Folder Structure

```
/src
 ├── /components
 │    ├── /filters      # FilterBar component (managing status/priority filtering)
 │    ├── /kanban       # KanbanBoard, Column, and Card components (Custom DND Logic)
 │    ├── /layout       # Header component (Navigation and Collaboration sim)
 │    ├── /list         # ListView component (Custom Virtual Scrolling & Inline editing)
 │    ├── /timeline     # TimelineView component (Gantt-style rendering)
 │    └── /ui           # Reusable UI components (Avatar, Badge, generic wrappers)
 ├── /store
 │    └── useStore.ts   # Global Zustand state (Tasks, Filters, Active Users, Selectors)
 ├── /types
 │    └── index.ts      # TypeScript definitions and interfaces
 ├── /utils
 │    └── dataGenerator.ts # Generates 500+ robust mock tasks using random bounds
 ├── App.tsx            # Main Application Route and Simulation interval setup
 ├── main.tsx           # React Root and Vite entry point
 └── index.css          # TailwindCSS v4 Bootstrap and custom drag/drop utilities
```

## Setup Instructions

1. **Pre-requisites:** NodeJS (v18+)
2. **Install Dependencies:**
   ```bash
   npm install
   ```
3. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   *The application will be running at `http://localhost:5173/`*
4. **Build for Production:**
   ```bash
   npm run build
   ```

## Key Logic Explanations

### 1. Custom Drag-and-Drop Implementation
The Kanban DND capability is completely custom-built using React Pointer events to ensure mobile-touch and mouse capability across devices.
* **Tracking State:** When `onPointerDown` fires on a task card, it is saved into `draggedTask` global state, tracking the `pointerPos` and `dragOffset`.
* **Global Move Listeners:** Listeners are subsequently attached to `window` for `pointermove` and `pointerup`. This avoids getting "stuck" when dragging the mouse rapidly outside of the origin column boundaries.
* **Shadow Clones/Portals:** `createPortal` mounts an absolute replica of the card directly into the `document.body`, tracking the pointer in real time with shadow optimizations (`transform: translate`).
* **Hover Hit Detection:** We use native `document.elementsFromPoint(x, y)` to calculate which column the mouse is hovering over in real-time, highlighting the valid drop zone and animating a drop placeholder.
* **Snap Back / Success Drop:** Upon `pointerup`, if the cursor is above a valid drop zone, the central Zustand state updates the item's status, instantly re-rendering it into the new column. If dropped outside boundaries, pointer events are stripped and the drop finishes.

### 2. Virtual Scrolling Logic
The robust `ListView.tsx` component handles rendering 500+ UI row nodes efficiently using a custom virtualizer without using packages like `react-window`.
* **Container Math:** It wraps inside `overflow-y-auto` container with an explicit fixed `ROW_HEIGHT = 64px`.
* **Dynamic Indexing:** A scroll listener fires tracking the `scrollTop`. The `startIndex` is dynamically formulated by `Math.floor(scrollTop / ROW_HEIGHT) - BUFFER`. Number of visible rows is derived dynamically using a `ResizeObserver` observing the table's total `viewportHeight`.
* **Absolute Padding Illusion:** A dummy internal wrapper mimics the total height of all 500+ tasks using `totalHeight = tasks.length * ROW_HEIGHT`. 
* The actual data slice `tasks.slice(startIndex, endIndex)` renders absolutely positioned by translating down the Y-axis: `transform: translateY(startIndex * ROW_HEIGHT)`. This removes hundreds of unmounting invisible nodes from the DOM, guaranteeing flawless 60 FPS scrolling.

### 3. State Management Approach
Handled entirely using **Zustand** due to its atomic update capabilities without massive React Provider wrapping overheads.
* **Centralization:** The `useStore` tracks `tasks[]`, `filters{}` object, `sort{}` object, and `viewMode`. 
* **Derived Getters:** Instead of maintaining a separate "filtered tasks" array prone to stale race-conditions, we expose a central `getFilteredSortedTasks()` function that pulls the latest raw tasks and applies Multi-select array filters + Status range computations on-demand.
* **URL Syncing:** The `FilterBar` uses React Router `useSearchParams` bound via simple `useEffect` hooks so that when Filter state updates -> URL query changes. On refresh, the reverse occurs: `useSearchParams` -> Store Hydration.
* **Simulated WS Engine:** A single global `setInterval` in `App.tsx` simulates server socket emits, triggering a Zustand action (`simulateCollaboration()`) that cycles avatars across live tasks without reloading standard data mappings.
