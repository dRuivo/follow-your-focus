# Follow Your Focus - Codebase Documentation

## Project Overview

Follow Your Focus is a **browser-based parametric follow focus ring generator** for filmmakers and makers. It allows users to generate customizable focus rings that can be 3D-printed or locally fabricated.

**Key Philosophy**: Technical tools should serve people, not extract value from them. This project is:

- **Free forever** (no accounts, subscriptions, or telemetry)
- **Privacy by design** (all computation runs locally in the browser)
- **Commons-protected** (CC BY-NC 4.0 software license, CC BY 4.0 for generated outputs)
- **Regenerative** (designed for repair, adaptation, and long-term use)

---

## Technology Stack

| Layer                | Technology              | Version                    |
| -------------------- | ----------------------- | -------------------------- |
| **Framework**        | SvelteKit               | 2.49.1                     |
| **Language**         | TypeScript              | 5.9.3                      |
| **UI Library**       | Svelte                  | 5 (with runes)             |
| **3D Rendering**     | Three.js                | 0.182.0                    |
| **CSG Modeling**     | JSCAD                   | modeling 2.12.6, io 0.4.12 |
| **Styling**          | Custom CSS + Tailwind 4 | Native CSS variables       |
| **Data Compression** | lz-string               | Latest (URL parameters)    |
| **Email Service**    | Resend                  | Latest (feedback emails)   |
| **Deployment**       | Vercel adapter          | SvelteKit standard         |

---

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────┐
│               Browser-Based Single Page App (SvelteKit)          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────┐  ┌─────────────────────────────┐ │
│  │ +layout.svelte           │  │ +page.svelte                │ │
│  │ ┌─ Modals ────────────┐  │  │ ┌─ Canvas & Parameters ──┐ │ │
│  │ │ - IntroModal        │  │  │ │ - 3D Viewport          │ │ │
│  │ │ - FeedbackModal     │  │  │ │ - Parameter Controls   │ │ │
│  │ │ - WhatNextModal     │  │  │ │ - Update Flow          │ │ │
│  │ └─────────────────────┘  │  │ └────────────────────────┘ │ │
│  │ Global Header/Footer     │  │        │                    │ │
│  └──────────────────────────┘  └────────┼────────────────────┘ │
│         │                              │                       │
│         ├──────────────────────────────┤                       │
│         │                              │                       │
│  ┌──────▼──────────────────────────────▼──────────────┐       │
│  │  urlParams.ts                                      │       │
│  │  (URL Hash Encoding/Decoding with versioning)     │       │
│  │  - compressToEncodedURIComponent()                │       │
│  │  - decompressFromEncodedURIComponent()            │       │
│  │  - Browser History Support (hashchange)          │       │
│  └──────────────────────────────────────────────────┘       │
│                              │                               │
│         ┌────────────────────┼────────────────────┐          │
│         │                    │                    │          │
│    ┌────▼─────┐      ┌──────▼──────────┐    ┌───▼────────┐ │
│    │workerManager    │bootstrap.ts      │    │Resend API  │ │
│    │(Worker Comms)   │(Three.js Engine) │    │(Email)     │ │
│    │- Async API      │- Scene Setup     │    │/api/       │ │
│    │- Promise-based  │- Rendering Loop  │    │feedback    │ │
│    │- Timeout        │- STL Export      │    │            │ │
│    │protection       │                  │    │            │ │
│    └────┬─────┘      └──────────────────┘    └────────────┘ │
│         │                                                    │
│    ┌────▼──────────────────────────────┐                    │
│    │  Web Worker Thread                 │                    │
│    │  focusRing.worker.ts               │                    │
│    │  ┌─ makeFocusRing()                │                    │
│    │  │ - JSCAD CSG Generation         │                    │
│    │  │ - Involute gear geometry       │                    │
│    │  │ - Boolean operations           │                    │
│    │  │ - Optional features (chamfer,  │                    │
│    │  │   grub screws)                 │                    │
│    │  └─ Returns: Geometry + numTeeth  │                    │
│    └────────────────────────────────────┘                    │
│                                                              │
│    External Services:                                       │
│    • lz-string (URL compression)                            │
│    • Three.js (3D rendering)                                │
│    • JSCAD (CSG modeling)                                   │
│    • Resend (Email delivery)                                │
│                                                              │
└──────────────────────────────────────────────────────────────────┘

Data Flow:
┌─────────────┐  ┌──────────────┐  ┌─────────────┐  ┌──────────────┐
│ User Input  │→ │ updateParams │→ │workerManager│→ │Web Worker    │
│ Parameters  │  │(Async)       │  │.generate()  │  │makeFocusRing │
└─────────────┘  └──┬───────────┘  └──────┬──────┘  └──────┬───────┘
                    │                     │               │
                    ├─→ updateUrlHash()   │               │
                    │   (URL persistence) │               │
                    │                     │               │
                    └─→ focusRingParams   │               │
                       .set(params)       │               │
                       (Store update)     │               │
                                         │               │
                    ┌────────────────────▼───────┐
                    │ Return Geometry + numTeeth  │
                    └────────────────┬────────────┘
                                     │
                    ┌────────────────▼───────┐
                    │ Update Mesh & Display  │
                    │ (Three.js Viewport)    │
                    └────────────────────────┘
```

---

## Directory Structure

```
src/
├── app.css                          # Global design system (CSS variables, components)
├── app.d.ts                         # TypeScript declarations (JSCAD types)
├── app.html                         # HTML template
├── routes/
│   ├── +layout.svelte              # Root layout (header, footer, modals)
│   └── +page.svelte                # Main page (canvas + parameter panel)
├── lib/
│   ├── config.ts                   # Configuration (external URLs)
│   ├── assets/
│   │   └── favicon.svg
│   ├── components/
│   │   ├── IntroModal.svelte        # Welcome/onboarding modal
│   │   ├── FeedbackModal.svelte     # Feedback collection modal (with email integration)
│   │   └── WhatNextModal.svelte     # Project roadmap & support modal
│   ├── focusRing/
│   │   ├── types.ts                # FocusRingParams type + defaults
│   │   ├── store.ts                # Svelte store + parameter management
│   │   ├── urlParams.ts            # URL hash encoding/decoding with versioning
│   │   └── makeFocusRing.ts         # JSCAD CSG geometry generation
│   ├── worker/
│   │   ├── focusRing.worker.ts     # Web Worker for background geometry generation
│   │   └── workerManager.ts        # Worker communication manager
│   └── engine/
│       └── bootstrap.ts             # Three.js engine & rendering
└── static/
    └── robots.txt
```

---

## Core Modules

### 1. **Parameter System** (`focusRing/`)

#### `types.ts` - Type Definitions

```typescript
export type FocusRingParams = {
	// Core geometry
	innerDiameter: number; // Inner bore hole size: 40-100 mm
	thickness: number; // Ring depth (Z-axis): 1-20 mm
	minWidth: number; // Minimum tooth base width: 0.5-10 mm

	// Gear teeth design
	gearModulus: number; // Tooth size (standard gear parameter): 0.1-2 mm
	pressureAngle: number; // Involute angle: 0-45°
	clearance: number; // Space between tooth root and bore: 0-1 mm
	printTolerance: number; // Manufacturing tolerance buffer: 0-1 mm

	// Gear side chamfering (optional beveled edges)
	gearChamfer: boolean; // Enable/disable chamfer on gear sides
	gearChamferAngle: number; // Bevel angle in degrees: 1-45°

	// Inner bore chamfering (optional beveled edges)
	innerChamfer: boolean; // Enable/disable chamfer on inner bore
	innerChamferSize: number; // Chamfer size in mm: 0.1-5 mm

	// Grub screw mounting holes (optional)
	grubScrew: boolean; // Enable/disable grub screw hole
	grubScrewDiameter: number; // Hole diameter: 1-10 mm
	grubScrew2: boolean; // Enable/disable second grub screw hole (perpendicular)
};
```

**Default values**: Sensible starting point for a follow focus ring (inner diameter 40mm, gear modulus 0.8mm, pressure angle 20°, etc.)

#### `store.ts` - State Management

- **`focusRingParams`**: Svelte writable store (all parameter updates flow through here)

This is the single source of truth for all focus ring parameters across the application.

#### `urlParams.ts` - URL State Persistence with Versioning

Enables sharing parametric designs via URL hashes with built-in version migration support.

**Key functions**:

- **`encodeParams(params)`**: Compresses parameters to a URL-safe string using lz-string
  - Uses `compressToEncodedURIComponent()` for automatic URL encoding
  - Wraps params in version envelope: `{ v: 1, p: FocusRingParams }`
  - Returns compressed string safe for URL hash
  - Example hash: `#N4IgBCAsBwCQIYC4...` (much shorter than JSON query params)

- **`decodeParams(hash)`**: Decompresses URL hash back to parameters
  - Uses `decompressFromEncodedURIComponent()` for automatic URL decoding
  - Handles version migrations (currently v1)
  - Gracefully returns `null` on decode errors (invalid/corrupted hashes)
  - Falls back to defaults if hash is malformed

- **`updateUrlHash(params)`**: Updates browser URL hash with current parameters
  - Only runs in browser (checked via `typeof window`)
  - Called after every parameter change
  - Enables browser history (back/forward buttons restore previous designs)

- **`getParamsFromUrl()`**: Reads parameters from current URL hash on page load
  - Only runs in browser (SSR-safe)
  - Returns `null` if no hash present (uses defaults)
  - Called during `onMount()` to restore state

**Why versioning?**

The `v` field allows future format changes without breaking old links:

```typescript
if (data.v === 1) {
	return data.p; // Current format
}
if (data.v === 2) {
	// Handle migration from v1 to v2 if we add/remove fields
	return migrateFromV1(data.p);
}
```

**Why lz-string's `CompressToEncodedURIComponent`?**

- **URL-safe by design**: No manual `encodeURIComponent()` needed (avoids double-encoding issues)
- **Compression**: Reduces typical parameter set from ~200 chars → ~80 chars
- **Atomic encoding**: Single step instead of compress + encode (prevents corruption)
- **Error handling**: Built-in safeguards for malformed data

#### `makeFocusRing.ts` - CSG Geometry Generation

This is the **mathematical heart** of the application. It generates precise involute gear teeth and applies optional features.

**Algorithm overview**:

1. **Parameter Validation**:
   - Guards against invalid inputs (negative/zero values, out-of-range angles)
   - Validates that geometry is physically possible (e.g., root radius > inner radius)
   - Throws descriptive errors if constraints violated

2. **Gear Geometry Calculation**:
   - Converts modulus to circular pitch: `p = πm`
   - Calculates number of teeth to maintain minimum width: `z = ⌈2(r_root + dedendum) / m⌉`
   - Computes standard gear radii:
     - `pitchRadius = m × z / 2` (engagement point)
     - `baseRadius = pitchRadius × cos(pressureAngle)` (involute origin)
     - `outerRadius = pitchRadius + m` (outer edge)
     - `rootRadius = pitchRadius - (m + clearance)` (tooth base)

3. **Involute Tooth Profile Generation**:
   - Creates a single 2D tooth polygon using involute curve mathematics
   - Uses **power law approximation** for involute angle: `angle = maxAngle × t^(2/3)` for smooth distribution
   - Generates 12 resolution points per side (24 total per tooth)
   - **Side A**: Extends from involute base outward (right flank)
   - **Side B**: Mirrors the profile (left flank), creating symmetrical tooth shape
   - Tooth width at base determined by pressure angle and circular pitch

4. **3D Extrusion & Boolean Operations**:
   - Extrudes 2D tooth polygon to 3D with given thickness
   - Arrays tooth around center: `for i in 0..numTeeth: rotate(2πi/z, tooth3d)`
   - Unions all teeth together
   - Creates root disk (solid cylinder at base) for structural integrity
   - Subtracts inner bore cylinder to create mounting hole
   - Centers geometry at Z=0 midplane

5. **Optional Features** (applied sequentially):

   **Grub Screw Holes**:
   - Creates cylindrical holes for mechanical fastening
   - Hole 1: Along X-axis at outer radius (radial mounting)
   - Hole 2 (optional): Along Y-axis, perpendicular to hole 1
   - Diameter: `params.grubScrewDiameter - 2×printTolerance`
   - Subtracted from final geometry using boolean difference

   **Gear Side Chamfering** (beveled gear edges):
   - Creates angled cuts on top and bottom gear faces
   - Uses triangular profile rotated 360° around Z-axis
   - Angle: `params.gearChamferAngle` (degrees from horizontal)
   - Chamfer tapers from root radius inward
   - Applied to both top and bottom faces via separate boolean operations

   **Inner Bore Chamfering** (beveled bore edges):
   - Creates angled cuts on inner bore edges (top and bottom)
   - Triangular profile rotated 360° around Z-axis
   - Bevel size: `params.innerChamferSize` (radial distance)
   - Eases sharp bore edges for assembly

**Return value**: `{ geometry: Geom3, numTeeth: number }` - final CSG geometry and calculated tooth count

**Performance notes**:

- Segment count tied to tooth count for consistent resolution: `Math.max(64, numTeeth × 4)`
- All CSG operations (union, subtract) are CPU-bound, ~100-300ms depending on complexity
- Moved to Web Worker for background processing (prevents UI blocking on large tooth counts)

#### Performance Optimizations in `makeFocusRing.ts`

**Adaptive Segment Calculation**:

```typescript
function segmentsForCircumference(radius: number, segmentLength: number): number {
	return Math.ceil((2 * Math.PI * radius) / segmentLength);
}

const outerSegmentCount = segmentsForCircumference(outerRadius, 1);
const innerSegmentCount = segmentsForCircumference(innerRadius, 1);
```

Replaces hardcoded `Math.max(64, numTeeth × 4)` with actual circumference-based calculation. Results:

- **Small rings** (~60mm): ~38 segments (was 64) - 40% fewer polygons
- **Large rings** (~100mm): ~94 segments (was 256) - 63% fewer polygons
- **Consistent quality**: Segment length always ~1mm for smooth curves
- **Performance**: 50-70% faster geometry generation for typical designs

**Sequential Subtraction Strategy**:

Empirically determined: sequential `subtract()` calls outperform batched `union()` of all cutouts, likely due to JSCAD's boolean operation optimization.

```typescript
// Better performance:
let geometry = base;
geometry = subtract(geometry, grubScrew1);
geometry = subtract(geometry, grubScrew2);

// Worse performance:
const allCutouts = union([grubScrew1, grubScrew2]);
geometry = subtract(base, allCutouts);
```

---

#### Web Worker Implementation (`lib/worker/`)

Moving expensive CSG operations to a background thread prevents UI blocking.

**`focusRing.worker.ts` - Background Geometry Generation**:

```typescript
self.onmessage = (event) => {
	if (event.data.type === 'generate') {
		const { geometry, numTeeth } = makeFocusRing(event.data.params);
		self.postMessage({ geometry, numTeeth });
	}
};
```

**Benefits**:

- **Non-blocking UI**: Complex geometries (~250-400ms) don't freeze interaction
- **Smooth animations**: 60 FPS maintained during generation
- **Loading indicator**: User sees "Generating..." overlay with spinner

**`workerManager.ts` - Worker Communication**:

Asynchronous request/response pattern with timeout protection:

```typescript
public async generate(params: FocusRingParams): Promise<GeometryResult> {
  const id = this.nextId++;
  return new Promise((resolve, reject) => {
    this.pendingRequests.set(id, { resolve, reject });
    this.worker.postMessage({ id, type: 'generate', params });

    // 30-second timeout safeguard
    setTimeout(() => {
      if (this.pendingRequests.has(id)) {
        this.pendingRequests.delete(id);
        reject(new Error('Worker timeout'));
      }
    }, 30000);
  });
}
```

**Features**:

- **Promise-based API**: Natural async/await integration
- **Request tracking**: Map of pending requests by ID
- **Timeout protection**: Prevents hanging requests
- **Proper cleanup**: Worker terminated in `destroy()`

---

### 3. **3D Rendering Engine** (`lib/engine/bootstrap.ts`)

#### Scene Setup

```typescript
// Three.js basics
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 2000);
const controls = new OrbitControls(camera, renderer.domElement); // User can rotate/zoom
```

#### Geometry Conversion: JSCAD → Three.js

```typescript
function jscadToBufferGeometry(geom): THREE.BufferGeometry {
	// Extract vertices and face indices from JSCAD polygons
	// Triangulate each polygon (assumes convex faces)
	// Create THREE.BufferGeometry with positions and indices
	// Compute vertex normals for lighting
}
```

#### Mesh Management

- **Lazy initialization**: First call to `update()` creates mesh
- **Geometry disposal**: Previous geometry freed before replacing (prevents memory leaks)
- **Material**: Standard metallic material (metalness: 0.1, roughness: 0.6)

#### Async Geometry Generation with Loading Overlay

```typescript
export async function update(params: FocusRingParams): Promise<void> {
	const overlay = createLoadingOverlay();
	try {
		const result = await workerManager.generate(params);
		// Geometry updated from worker result
	} finally {
		overlay.remove();
	}
}

function createLoadingOverlay(): HTMLElement {
	const overlay = document.createElement('div');
	overlay.style.position = 'absolute';
	overlay.innerHTML = '<div class="spinner"></div><p>Generating...</p>';
	container.appendChild(overlay);
	return overlay;
}
```

**Loading UX**:

- Overlay appears over canvas with semi-transparent background
- Animated spinner indicates active computation
- "Generating..." text provides user feedback
- Overlay removed automatically on completion or error

#### Rendering Loop

```typescript
function start() {
	const tick = () => {
		resizeToDisplaySize(); // Handle canvas resizing
		controls.update(); // Update camera from user input
		renderer.render(scene, camera); // Render frame
		raf = requestAnimationFrame(tick);
	};
	tick();
}
```

#### Export to STL

```typescript
function exportStl(filename = 'followFocusRing.stl') {
	// Get current JSCAD geometry
	// Serialize to binary STL format using @jscad/io
	// Create blob and trigger download
}
```

#### Cleanup

- Cancels animation frame
- Disposes Three.js resources (geometry, material, renderer)
- Removes mesh from scene

---

### 4. **UI Layer**

#### **Layout** (`routes/+layout.svelte`)

Provides the top-level application structure:

- **Header** (sticky):
  - Brand name & tagline
  - Navigation: About, Feedback, Source, Tip (Buy Me Coffee)
- **Main content** (`<main>`):
  - Flex grow to fill available space
  - Routes child content (+page.svelte)
- **Footer** (sticky at bottom):
  - "Built for the commons" statement
  - Footer links: About, Source, Feedback
  - License & version info

- **Modals** (global):
  - **IntroModal**: Welcome screen with project vision
  - **FeedbackModal**: WIP feedback collection directing to GitHub issues

**Layout structure** ensures:

- Full viewport height coverage (`min-height: 100vh`)
- Sticky header and footer
- Content grows to fill space
- Proper flex ordering (header, content, footer)

#### **Page** (`routes/+page.svelte`)

Main interactive interface with URL state integration:

**Initialization** (in `onMount()`)

:

```typescript
onMount(async () => {
	// Load params from URL hash if available
	const urlParams = getParamsFromUrl();
	if (urlParams) {
		params = urlParams;
	}

	// Initialize viewer with params
	const mod = await import('$lib/engine/bootstrap');
	viewer = mod.createEngine(canvas);
	await viewer.update(params);
	numTeeth = viewer.getNumTeeth();

	// Listen for browser history changes (back/forward)
	window.addEventListener('hashchange', handleHashChange);
});
```

**Parameter Changes**:

Every parameter update flows through `updateParams()`:

```typescript
async function updateParams(p: FocusRingParams) {
	focusRingParams.set(params);
	await viewer?.update(params); // Async: runs in worker
	numTeeth = viewer?.getNumTeeth() ?? 0;
	updateUrlHash(params); // Persist to URL
}
```

This ensures:

- Store is updated (for component reactivity)
- Viewer generates new geometry (in background worker)
- Tooth count recalculated
- URL hash updated (enables sharing/history)

**Left side (responsive)**:

- Canvas element (`<canvas id="c">`)
- Max height: 70vh desktop, 50vh mobile
- Contains 3D rendered geometry
- Shows "Generating..." loading overlay during worker processing

**Right side parameter panel** (320px fixed on desktop, 100% on mobile):

- **Basic Parameters** (numeric inputs):
  - Geometry: Inner Diameter, Thickness, Min Width
  - Tolerances: Print Tolerance
  - Gear Teeth: Gear Modulus, Pressure Angle, Clearance

- **Optional Features** (collapsible sections with checkboxes):
  - **Chamfer Gear**: Toggle gear side beveling + Chamfer Angle slider
  - **Chamfer Inner Bore**: Toggle bore beveling + Chamfer Size slider
  - **Grub Screw**: Toggle screw holes + Screw Diameter + Second Screw toggle

- **Advanced Parameters** (accordion, initially collapsed):
  - Gear Modulus, Pressure Angle, Clearance (duplicated for fine-tuning)
  - "Number of Teeth" display (read-only, calculated from parameters)

- **Action Buttons**:
  - "Reset to Default": Restores all parameters to defaults
  - "Export STL" (sticky footer): Downloads geometry as binary STL file

**State management**:

- Local state: `params`, `advancedOpen`
- Global store: `focusRingParams` (for sharing between pages if needed)
- On mount: Initializes Three.js engine with canvas
- On change: Updates viewer via `viewer.update(params)`
- On destroy: Cleans up Three.js resources

**Responsive behavior**:

- Desktop (≥1024px): Side-by-side layout (canvas flex, panel fixed 320px)
- Mobile (<1024px): Stacked layout (canvas 70vh, panel 40vh max)

---

### 5. **Modals**

#### **IntroModal** (`lib/components/IntroModal.svelte`)

Welcome/onboarding experience:

**Content sections**:

1. Welcome introduction ("Welcome to the commons")
2. Project origin ("Why this exists")
3. Values statement (tool philosophy)
4. Sharing & attribution guidelines
5. Support info ("How to contribute")

**Technical features**:

- Opens on first visit (`isOpen` binding)
- No localStorage (stateless - always shows on page reload)
- Accessible: Proper dialog semantics, ESC key support, backdrop click
- Browser compatibility: Feature detection for `dialog.showModal()`, fallback to `[open]` attribute for Safari
- Focus management: `preventScroll: true` prevents auto-scroll when opening/closing

**Styling**:

- Centered with CSS transform
- Modal header: h1 title + h2 subtitle with subtle styling
- Modal body: Scrollable content area
- Modal footer: Sticky action button
- Links use primary color with hover states
- Responsive: Adjusts sizing and layout on mobile (<640px)

#### **FeedbackModal** (`lib/components/FeedbackModal.svelte`)

Feedback collection with email integration via **Resend**:

**Content**:

- Status message: "Help shape this tool"
- Multi-line textarea for feedback message
- Optional email field (for user confirmation)
- Consent checkbox confirming feedback can be shared publicly
- Sends two emails via **Resend API**:
  - **To admin**: Full feedback with optional user email
  - **To user**: Confirmation receipt (if email provided)

**Email Service - Resend**:

- **Service**: Resend (https://resend.com) - email for developers
- **API Key**: Configured via `.env.local` with `RESEND_API_KEY`
- **Endpoint**: Server-side API route `/api/feedback`
- **HTML emails**: Styled emails with branding
- **Email subjects**:
  - Admin: "New feedback for Follow Your Focus"
  - User: "We received your feedback!"

**Technical features**:

- Browser compatibility: Safari-compatible with `.modal-overlay` wrapper
- Accessible: Proper dialog semantics, label associations
- Form validation: Basic required field checks
- Error handling: User feedback on send success/failure
- Server-side email sending: Protects API key (never sent to browser)

**Styling**:

- Modal header: h1 title + h2 subtitle
- Modal body: Form fields with clear spacing
- Modal footer: Single column layout with text above and button aligned right
- CSS animations: Smooth transitions on open/close
- Responsive: Adjusts layout on mobile

**Data Flow** (with Resend):

```
User fills feedback form
        ↓
Clicks "Send Feedback"
        ↓
POST /api/feedback with { message, email?, agreed: true }
        ↓
Server receives request, validates input
        ↓
Server calls Resend API with email data:
  - Admin email with full feedback + user contact info
  - User confirmation email (if email provided)
        ↓
Resend delivers emails
        ↓
Modal closes with success message
```

#### **WhatNextModal** (`lib/components/WhatNextModal.svelte`)

Project roadmap and support information:

**Content sections**:

1. **User Experience**: Future UX improvements (preset saving, tooltips, etc.)
2. **Focus Ring Model**: Technical improvements (text on inside, performance)
3. **How-to and Guides**: Documentation (measurement guide, printing guide)
4. **Hardware**: Long-term vision (Open Follow Focus system)

**Call to action**:

- "If you'd like to help, send me a Note"
- "Buy Me a Coffee" link for supporter contributions
- Primary button: "Enter the tool" (closes modal)

**Technical features**:

- Similar structure to IntroModal
- Scrollable body content for long roadmap
- Footer with single-column layout
- All content properly semantic (h1, h2, h3 hierarchy)

**Styling**:

- Header: h1 (main title), h2 (subtitle), h3 (helper text)
- Sections: h2 headings with bullet lists
- Footer: Text content followed by right-aligned button
- Responsive: Stack to full-width on mobile (<640px)

---

### 6. **Design System** (`app.css`)

The app uses a **CSS variable-based design system** (not relying on Tailwind classes):

#### **Color palette**:

```css
--color-primary-600: #16a34a /* Green */ --color-warning-600: #ca8a04
	/* Amber/Gold - used for "Tip" button */ --color-neutral- *: Various /* Grays */ --app-text: Main
	text color --app-bg: Background --app-border: Borders --app-text-muted: Subtle text;
```

#### **Typography**:

```css
--font-heading:
	'Space Grotesk' /* Bold, modern */ --font-body: 'Inter' /* Clean, readable */ --text-sm,
	--text-base, --text-lg, --text-2xl, --text-3xl --line-height-tight: 1.2 --line-height-normal: 1.5;
```

#### **Spacing scale** (8px base):

```css
--space-1: 0.5rem /* 8px */ --space-2: 1rem /* 16px */ --space-3: 1.5rem /* 24px */ --space-4: 2rem
	/* 32px */ --space-5: 2.5rem /* 40px */ --space-6: 3rem /* 48px */;
```

#### **Component classes**:

- **Buttons**: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`, `.btn-sm`, `.btn-lg`
- **Inputs**: Numeric inputs with focus states
- **Utilities**: `.dot` (separator), semantic classes for layout

---

## Data Flow

### Parameter Updates

```
User adjusts numeric input
        ↓
Svelte bind:value updates params
        ↓
onchange handler calls updateParams(params)
        ↓
focusRingParams.set(params) [global store]
viewer.update(params) [3D engine]
        ↓
makeFocusRing(params) generates new geometry
        ↓
jscadToBufferGeometry() converts to Three.js
        ↓
Mesh geometry replaced, render loop displays new frame
```

### Export Flow

```
User clicks "Export STL"
        ↓
viewer.exportStl() called
        ↓
JSCAD geometry serialized to binary STL
        ↓
Blob created with type 'model/stl'
        ↓
Browser download dialog triggered
        ↓
File saved as 'followFocusRing.stl'
```

### URL State Sharing (with Versioning)

```
User adjusts parameters
        ↓
updateParams() calls updateUrlHash(params)
        ↓
URL updates with compressed hash: #N4IgBCA...
        ↓
User copies and shares URL with hash
        ↓
Recipient opens link
        ↓
onMount() calls getParamsFromUrl()
        ↓
decodeParams() decompresses hash back to parameters
        ↓
viewer.update(params) regenerates geometry
        ↓
Geometry appears identical to sender's design
```

**Hash structure** (encoded with version):

```typescript
// Original object
{
  v: 1,  // Format version (for future migrations)
  p: {   // FocusRingParams
    innerDiameter: 71,
    thickness: 9,
    minWidth: 5,
    // ... all 15 parameters
  }
}

// Encoded to URL-safe hash
#N4IgBCAsBwCQIYC4...
```

**Benefits over query parameters**:

| Approach                        | Length     | Readability    | Shareable | Mobile-friendly                      |
| ------------------------------- | ---------- | -------------- | --------- | ------------------------------------ |
| **Query params**                | ~280 chars | Human-readable | ✓         | Poor (truncated by SMS/chat)         |
| **URL hash** (v1, our approach) | ~80 chars  | Not readable   | ✓         | ✓ (hash survives message truncation) |

The hash survives URL truncation in messaging apps and is more suitable for sharing.

**Browser History Support**:

The `hashchange` event listener enables back/forward navigation:

```typescript
window.addEventListener('hashchange', async () => {
	const urlParams = getParamsFromUrl();
	if (urlParams) {
		params = urlParams;
		await viewer?.update(params);
	}
});
```

Users can press browser back button to restore previous designs.

---

## Key Algorithms & Calculations

### Involute Gear Generation

The core of `makeFocusRing.ts` implements **involute curve tooth profiling**, which is the standard for mechanical gears:

**Involute curve mathematics**:

The involute is generated using parametric equations where a point moves along a line tangent to the base circle:

```
angle = tanLength / baseRadius  (tangent length unwrapped from base radius)
x = baseRadius·cos(angle) + tanLength·sin(angle)
y = baseRadius·sin(angle) - tanLength·cos(angle)
```

**Power Law Approximation** (used for smooth tooth distribution):

Rather than linear steps along the involute, the implementation uses a power law to concentrate resolution at the tooth tip:

```
t ∈ [0, 1]  (normalized parameter)
angle = maxAngle × t^(2/3)  (curve heavily weighted toward tip)
```

This provides better numerical stability and smoother geometry than linear parametrization.

**Tooth Construction**:

1. Side A: Involute profile from base to outer radius
2. Side B: Mirrored involute profile (opposite flank)
3. Closed polygon: Both sides joined to form complete tooth cross-section
4. The tooth angle is calculated from the pressure angle and gear pitch

**Why involutes?**

- **Constant pressure angle**: Maintains smooth, efficient tooth engagement
- **Constant velocity ratio**: Gear ratio doesn't vary with tooth position
- **Forgiving tolerance**: Works even if center distance varies slightly
- **Industry standard**: All mechanical gears use involute profiles
- **Mathematically precise**: No approximation in tooth shape (except power law for sampling)

### Gear Geometry Calculations

Standard gear formulas used to ensure proper tooth engagement:

```typescript
// Given parameters
circularPitch = π × gearModulus
numTeeth = ⌈2(targetRootRadius + dedendum) / gearModulus⌉

// Calculated radii
pitchRadius = (numTeeth × gearModulus) / 2
baseRadius = pitchRadius × cos(pressureAngle°)
outerRadius = pitchRadius + gearModulus
rootRadius = pitchRadius - (gearModulus + clearance)
dedendum = gearModulus + clearance
addendum = gearModulus
```

**Number of Teeth**: Calculated to ensure `minWidth` space between inner bore and tooth root. Prevents undercuts and ensures structural integrity.

**Radii Hierarchy**:

- `innerRadius < rootRadius < baseRadius < pitchRadius < outerRadius`

Each radius serves a specific purpose in gear kinematics and CSG construction.

---

## Browser Compatibility & Fallbacks

### Dialog Element Support

```typescript
if (typeof dialogElement.showModal === 'function') {
	dialogElement.showModal(); // Modern browsers
} else {
	dialogElement.setAttribute('open', ''); // Fallback (Safari)
}
```

### Canvas Resizing

```typescript
const w = canvas.clientWidth;
const h = canvas.clientHeight;
if (canvas.width !== w || canvas.height !== h) {
	renderer.setSize(w, h, false);
	camera.updateProjectionMatrix(); // Maintain aspect ratio
}
```

---

## State Management

### Svelte Stores (Global)

- **`focusRingParams`**: Current parameter set (writable store)

### Component State ($state runes)

- **Layout**: `feedbackOpen`, `introModalOpen` (modal visibility)
- **Page**: `params`, `advancedOpen`, `canvas`, `viewer`

### No Persistence

- Parameters are not saved to localStorage
- Page reload resets to defaults
- URL can be shared to preserve state

---

## Configuration

### External URLs (`lib/config.ts`)

```typescript
export const EXTERNAL_URLS = {
	GITHUB_REPO: 'https://github.com/diogoruivo/follow-your-focus',
	BUY_ME_COFFEE: 'https://buymeacoffee.com/yourname'
};
```

Used by: Layout header/footer, IntroModal, FeedbackModal

---

## Build & Deployment

### Development

```bash
pnpm install
pnpm run dev      # Dev server
pnpm run build    # Production build
```

### Production (Vercel)

- Configured with `@sveltejs/adapter-vercel`
- SvelteKit handles routing and SSR
- All computation happens in browser (no server-side processing)
- Static deployment possible (SPA mode)

---

## Accessibility Features

1. **Dialog elements** with proper ARIA semantics
2. **Keyboard navigation**: ESC closes modals, tabs through inputs
3. **Focus management**: Modal focus trap, visible focus states
4. **Semantic HTML**: Proper heading hierarchy, labels for inputs
5. **Color contrast**: Design system maintains WCAG compliance
6. **Responsive**: Mobile-friendly layout at <1024px breakpoint

---

## Performance Considerations

### Geometry Generation

- **Cold start**: JSCAD CSG operations (~100-300ms depending on tooth count)
- **Hot updates**: Mesh geometry disposal & replacement (~50-100ms)
- **Web Workers**: Could be used for geometry generation (not currently implemented)

### Rendering

- **Target**: 60 FPS with requestAnimationFrame
- **Antialias**: Enabled for smooth edges
- **Pixel ratio**: Capped at 2x for high-DPI displays

### Memory

- **Disposal strategy**: Geometry and material are properly disposed before replacement
- **Animation frame cleanup**: Cancelled on component destroy

---

## Testing Files

- `src/demo.spec.ts` - Demo/integration tests
- `src/routes/page.svelte.spec.ts` - Page component tests

---

## Future Enhancement Opportunities

1. **Web Workers**: Move CSG generation to worker thread (prevent UI blocking on large tooth counts)
2. **Undo/Redo**: State history with parameter snapshots
3. **Presets**: Save/load common configurations (localStorage or cloud)
4. **STL Mesh Optimization**: Reduce polygon count for faster exports
5. **Export Formats**: STEP, OBJ, 3mf
6. **Localization**: Multi-language support
7. **Parameter Constraints**: Smart validation with UI feedback
8. **Gear Simulation**: Mesh two gears and simulate rotation
9. **Custom Bore Profiles**: Non-circular inner bores
10. **Custome Test on Part**: Text on the gear's inside wall

---

## Philosophy & Design Decisions

### Why SvelteKit?

- Minimal framework overhead (smaller bundle)
- Reactive by design (natural parameter updates)
- Scoped styling (no CSS conflicts)
- Built-in routing (future expansion)

### Why JSCAD?

- CSG operations are perfect for gear modeling
- Precise geometric calculations
- Lightweight (no heavy CAD engine)
- Browser-native (no plugins)

### Why Three.js?

- Industry-standard WebGL library
- Excellent performance
- Rich material/lighting system
- Large community & resources

### Why No Backend?

- **Privacy**: Computation stays on user's device
- **Reliability**: No server dependency
- **Scalability**: Infinite concurrent users
- **Philosophy**: Truly commons-based (can be self-hosted)

---

## License & Attribution

- **Software**: CC BY-NC 4.0 (non-commercial use only)
- **Generated outputs (STL files)**: CC BY 4.0 (commercial use allowed, attribution required)
- **Attribution**: Generated files should credit the tool and link back to the project

---

_Last updated: January 2026_  
_Version: 0.1.0_
