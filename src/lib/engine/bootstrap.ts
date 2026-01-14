import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import jscadIo from '@jscad/io';
import type { FocusRingParams } from '$lib/focusRing/types';
import { makeFocusRing } from '$lib/focusRing/makeFocusRing';

// If you use @jscad/io's stlSerializer:
const { stlSerializer } = jscadIo;

export type Engine = {
	update: (p: FocusRingParams) => void;
	exportStl: (filename?: string) => void;
	destroy: () => void;
};

export function createEngine(canvas: HTMLCanvasElement): Engine {
	// --- three basics
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

	let mesh: THREE.Mesh | null = null;
	let currentGeom: unknown = null;
	let raf = 0;

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

	// --- JSCAD geom3 -> THREE.BufferGeometry
	// Note: this assumes polygon faces are convex. It often works for many solids,
	// but if you see artifacts, we’ll swap in a robust triangulator next.
	function jscadToBufferGeometry(geom: any): THREE.BufferGeometry {
		const geometry = new THREE.BufferGeometry();
		const vertices: number[] = [];
		const indices: number[] = [];
		let vertexCount = 0;

		for (const poly of geom.polygons) {
			const verts = poly.vertices; // usually [[x,y,z],...]
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

	// --- public API
	function update(p: FocusRingParams) {
		currentGeom = makeFocusRing(p);
		setMesh(currentGeom);
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
	}

	// Start immediately on creation
	start();

	return { update, exportStl, destroy };
}
