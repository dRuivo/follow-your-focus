import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import jscadIo from '@jscad/io';
import type { FocusRingParams } from '$lib/focusRing/types';
import { FocusRingWorkerManager } from '$lib/worker/workerManager';

const { stlSerializer } = jscadIo;

export type Engine = {
	update: (p: FocusRingParams) => Promise<void>;
	exportStl: (filename?: string) => void;
	getNumTeeth: () => number;
	destroy: () => void;
};

export function createEngine(canvas: HTMLCanvasElement): Engine {
	const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
	renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

	const scene = new THREE.Scene();
	scene.add(new THREE.AxesHelper(30));

	const camera = new THREE.PerspectiveCamera(45, 2, 0.1, 2000);
	camera.position.set(120, 90, 120);
	camera.lookAt(0, 0, 0);

	scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.2));
	const dir = new THREE.DirectionalLight(0xffffff, 1.0);
	dir.position.set(1, 2, 3);
	scene.add(dir);

	const controls = new OrbitControls(camera, renderer.domElement);
	controls.update();

	const material = new THREE.MeshStandardMaterial({ metalness: 0.1, roughness: 0.6 });

	// Loading indicator overlay
	const loadingOverlay = createLoadingOverlay(canvas);

	let mesh: THREE.Mesh | null = null;
	let currentGeom: unknown = null;
	let numTeeth = 0;
	let raf = 0;

	// Initialize worker manager
	const workerManager = new FocusRingWorkerManager();
	let isGenerating = false;

	function resizeToDisplaySize() {
		const w = canvas.clientWidth;
		const h = canvas.clientHeight;
		const needsResize = canvas.width !== w || canvas.height !== h;
		if (needsResize) {
			renderer.setSize(w, h, false);
			camera.aspect = w / h;
			camera.updateProjectionMatrix();
		}
	}

	function jscadToBufferGeometry(geom: any): THREE.BufferGeometry {
		const geometry = new THREE.BufferGeometry();
		const vertices: number[] = [];
		const indices: number[] = [];
		let vertexCount = 0;

		for (const poly of geom.polygons) {
			const verts = poly.vertices;
			for (let i = 1; i < verts.length - 1; i++) {
				indices.push(vertexCount, vertexCount + i, vertexCount + i + 1);
			}
			for (const v of verts) vertices.push(v[0], v[1], v[2]);
			vertexCount += verts.length;
		}

		geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
		geometry.setIndex(indices);
		geometry.computeVertexNormals();
		geometry.center();
		return geometry;
	}

	function setMesh(geom: any) {
		const geo = jscadToBufferGeometry(geom);

		if (!mesh) {
			mesh = new THREE.Mesh(geo, material);
			scene.add(mesh);
		} else {
			mesh.geometry.dispose();
			mesh.geometry = geo;
		}
	}

	// Updated to async, uses worker
	async function update(p: FocusRingParams) {
		if (isGenerating) return; // Prevent concurrent requests

		isGenerating = true;
		loadingOverlay.show();
		try {
			const result = await workerManager.generate(p);
			currentGeom = result.geometry;
			numTeeth = result.numTeeth;
			setMesh(currentGeom);
		} catch (error) {
			console.error('Failed to generate focus ring:', error);
		} finally {
			isGenerating = false;
			loadingOverlay.hide();
		}
	}

	function getNumTeeth() {
		return numTeeth;
	}

	function exportStl(filename = 'followFocusRing.stl') {
		if (!currentGeom) return;
		const raw = stlSerializer.serialize({ binary: true }, currentGeom as any);
		const blob = new Blob(raw, { type: 'model/stl' });

		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
	}

	function start() {
		const tick = () => {
			resizeToDisplaySize();
			controls.update();
			renderer.render(scene, camera);
			raf = requestAnimationFrame(tick);
		};
		tick();
	}

	function destroy() {
		cancelAnimationFrame(raf);
		if (mesh) {
			mesh.geometry.dispose();
			scene.remove(mesh);
			mesh = null;
		}
		material.dispose();
		renderer.dispose();
		workerManager.terminate();
		loadingOverlay.destroy();
	}

	start();

	return { update, exportStl, getNumTeeth, destroy };
}

// Helper function to create loading overlay
function createLoadingOverlay(canvas: HTMLCanvasElement) {
	const overlay = document.createElement('div');
	overlay.style.cssText = `
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: none;
		align-items: center;
		justify-content: center;
		background-color: rgba(0, 0, 0, 0.4);
		backdrop-filter: blur(2px);
		z-index: 100;
		border-radius: var(--radius-lg);
	`;

	const text = document.createElement('div');
	text.style.cssText = `
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--color-primary-500);
		font-family: var(--font-heading);
		letter-spacing: -0.025em;
		display: flex;
		align-items: center;
		gap: 0.75rem;
	`;
	text.innerHTML = `
		<span>Generating...</span>
		<span style="
			display: inline-block;
			width: 1.5rem;
			height: 1.5rem;
			border: 3px solid var(--color-primary-200);
			border-top-color: var(--color-primary-500);
			border-radius: 50%;
			animation: spin 1s linear infinite;
		"></span>
	`;

	// Add animation keyframes
	if (!document.getElementById('spinner-animation')) {
		const style = document.createElement('style');
		style.id = 'spinner-animation';
		style.textContent = `
			@keyframes spin {
				to { transform: rotate(360deg); }
			}
		`;
		document.head.appendChild(style);
	}

	overlay.appendChild(text);

	// Position overlay relative to canvas
	const canvasParent = canvas.parentElement;
	if (canvasParent) {
		// Ensure parent is positioned
		if (getComputedStyle(canvasParent).position === 'static') {
			canvasParent.style.position = 'relative';
		}
		canvasParent.appendChild(overlay);
	}

	return {
		show: () => {
			overlay.style.display = 'flex';
		},
		hide: () => {
			overlay.style.display = 'none';
		},
		destroy: () => {
			overlay.remove();
		}
	};
}
