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

| Layer            | Technology              | Version                    |
| ---------------- | ----------------------- | -------------------------- |
| **Framework**    | SvelteKit               | 2.49.1                     |
| **Language**     | TypeScript              | 5.9.3                      |
| **UI Library**   | Svelte                  | 5 (with runes)             |
| **3D Rendering** | Three.js                | 0.182.0                    |
| **CSG Modeling** | JSCAD                   | modeling 2.12.6, io 0.4.12 |
| **Styling**      | Custom CSS + Tailwind 4 | Native CSS variables       |
| **Deployment**   | Vercel adapter          | SvelteKit standard         |

---

## Architecture Overview

```
┌─────────────────────────────────────────┐
│     Browser-Based Single Page App       │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────┐  ┌─────────────────┐ │
│  │ +layout.svelte  │  │  +page.svelte   │ │
│  │ (Global       │  │  (Canvas & UI)  │ │
│  │  Header/      │  │                 │ │
│  │  Footer)      │  └─────────────────┘ │
│  └──────────────┘         │              │
│         │                 │              │
│         ├─────────────────┤              │
│         │                 │              │
│    ┌────▼────────────────▼──┐           │
│    │  bootstrap.ts (Engine)   │           │
│    │ - Three.js setup        │           │
│    │ - Geometry conversion   │           │
│    │ - Export (STL)          │           │
│    └────────────┬─────────────┘           │
│                 │                        │
│         ┌───────▼────────┐               │
│         │ makeFocusRing   │               │
│         │ (JSCAD CSG)     │               │
│         │ - Involute gear │               │
│         │ - Extrusion     │               │
│         │ - Boolean ops   │               │
│         └────────────────┘               │
│                                         │
└─────────────────────────────────────────┘
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
│   │   └── FeedbackModal.svelte     # Feedback collection modal
│   ├── focusRing/
│   │   ├── types.ts                # FocusRingParams type + defaults
│   │   ├── store.ts                # Svelte store + URL serialization
│   │   └── makeFocusRing.ts         # JSCAD CSG geometry generation
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
- **`paramsFromUrl()`**: Deserialize parameters from URL search params (enables shareable links)
- **`paramsToSearchParams()`**: Serialize parameters to URL (enables saving/sharing configurations)

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
- Could be moved to Web Worker for non-blocking UI in future

---

### 2. **3D Rendering Engine** (`lib/engine/bootstrap.ts`)

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

### 3. **UI Layer**

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

Main interactive interface:

**Left side (responsive)**:

- Canvas element (`<canvas id="c">`)
- Max height: 70vh desktop, 50vh mobile
- Contains 3D rendered geometry

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

### 4. **Modals**

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

**Styling**:

- Centered with CSS transform
- Modal header: h1 title + h2 subtitle ("Follow Your Focus" / "Community tools")
- Links use primary color with hover states

#### **FeedbackModal** (`lib/components/FeedbackModal.svelte`)

Feedback collection during WIP phase:

**Content**:

- Status message: "This is work in progress"
- 5-item list of feedback types (bugs, features, design, docs, general)
- Directs users to GitHub Issues for feedback

**Actions**:

- Close button (closes modal)
- "Open GitHub Issues" button (links to EXTERNAL_URLS.GITHUB_REPO)

---

### 5. **Design System** (`app.css`)

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

### URL State Sharing

```
User adjusts parameters and copies URL
        ↓
URL contains ?innerDiameter=50&thickness=5&...
        ↓
Recipient opens link
        ↓
paramsFromUrl() parses search params
        ↓
Parameters restored, geometry regenerates
```

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
5. **Export Formats**: STEP, OBJ, Fusion360 native format, GLTF
6. **Real-time Preview**: Live STL mesh preview before export
7. **Collaborative**: Real-time parameter sharing (WebSockets)
8. **Advanced UI**: Gear tooth animation, cross-section view, 2D tooth profile display
9. **Localization**: Multi-language support
10. **Parameter Constraints**: Smart validation with UI feedback
11. **Gear Simulation**: Mesh two gears and simulate rotation
12. **Custom Bore Profiles**: Non-circular inner bores

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
