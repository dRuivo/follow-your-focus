import jscad from '@jscad/modeling';
const { primitives, booleans, transforms, extrusions } = jscad;

import type { FocusRingParams } from './types';

const MAX_SEGMENTS = 64;

export function makeFocusRing(params: FocusRingParams): {
	geometry: jscad.geometries.geom3.Geom3;
	numTeeth: number;
} {
	const { cylinder, polygon } = primitives;
	const { extrudeLinear, extrudeRotate } = extrusions;
	const { union, subtract } = booleans;
	const { rotate, rotateZ, translate } = transforms;

	// --- Basic guards (prevents silent garbage geometry)
	if (params.gearModulus <= 0) throw new Error('gearModulus must be > 0');
	if (params.thickness <= 0) throw new Error('thickness must be > 0');
	if (params.innerDiameter <= 0) throw new Error('innerDiameter must be > 0');
	if (params.minWidth < 0) throw new Error('minWidth must be >= 0');
	if (params.pressureAngle <= 0 || params.pressureAngle >= 45)
		throw new Error('pressureAngle should be in degrees, e.g. 20');

	const circularPitch = Math.PI * params.gearModulus; // p = πm
	const addendum = params.gearModulus; // standard: addendum = m
	const dedendum = params.gearModulus + params.clearance; // standard-ish: dedendum = m + clearance

	// We want the root radius to be at least (innerRadius + minWidth)
	const innerRadius = params.innerDiameter / 2;
	const targetRootRadius = innerRadius + params.minWidth;
	// rootRadius = pitchRadius - dedendum = (m*z)/2 - dedendum
	// => z = 2*(rootRadius + dedendum)/m
	const numTeeth = Math.ceil((2 * (targetRootRadius + dedendum)) / params.gearModulus);

	// avoid tiny tooth counts (booleans get weird, gear becomes nonsense)
	// numTeeth = Math.max(numTeeth, 6);

	// Radii
	const pitchRadius = (numTeeth * params.gearModulus) / 2; // since pitchDiameter = m*z
	const baseRadius = pitchRadius * Math.cos((Math.PI * params.pressureAngle) / 180);
	const outerRadius = pitchRadius + params.gearModulus;
	const rootRadius = pitchRadius - (params.gearModulus + params.clearance);

	if (rootRadius <= innerRadius) {
		throw new Error(
			`Invalid geometry: rootRadius (${rootRadius.toFixed(
				3
			)}) <= innerRadius (${innerRadius.toFixed(3)}). Increase minWidth or gearModulus/teeth.`
		);
	}
	if (baseRadius <= 0 || outerRadius <= baseRadius) {
		throw new Error('Invalid involute radii. Check pressureAngle / gearModulus / numTeeth.');
	}

	// Involute limits
	const maxTanLength = Math.sqrt(outerRadius * outerRadius - baseRadius * baseRadius);
	const maxAngle = maxTanLength / baseRadius;

	const tanLenAtPitch = Math.sqrt(pitchRadius * pitchRadius - baseRadius * baseRadius);
	const angleAtPitch = tanLenAtPitch / baseRadius;
	const diffAngle = angleAtPitch - Math.atan(angleAtPitch);
	const angularToothWidthAtBase = Math.PI / numTeeth + 2 * diffAngle;

	// --- Build a single tooth polygon (2D)
	const resolution = 12; // higher is smoother / more stable
	const toothPts: jscad.maths.vec2.Vec2[] = [];

	// Side A
	for (let i = 0; i <= resolution; i++) {
		const t = i / resolution;
		const angle = maxAngle * Math.pow(t, 2 / 3);
		const tanLength = angle * baseRadius;

		const rad = [Math.cos(angle), Math.sin(angle)];
		const tan = [Math.sin(angle), -Math.cos(angle)];

		toothPts.push([
			rad[0] * baseRadius + tan[0] * tanLength,
			rad[1] * baseRadius + tan[1] * tanLength
		]);
	}

	// Side B (mirror-ish), go backwards to close the loop cleanly
	for (let i = resolution; i >= 0; i--) {
		const t = i / resolution;
		const angle = maxAngle * Math.pow(t, 2 / 3);
		const tanLength = angle * baseRadius;

		const opp = angularToothWidthAtBase - angle;
		const rad = [Math.cos(opp), Math.sin(opp)];
		let tan = [-Math.sin(opp), Math.cos(opp)]; // tangent points outward

		toothPts.push([
			rad[0] * baseRadius + tan[0] * tanLength,
			rad[1] * baseRadius + tan[1] * tanLength
		]);
	}

	const tooth2d = polygon({ points: toothPts });
	const tooth3d = extrudeLinear({ height: params.thickness }, tooth2d);

	// --- Array of rotated teeth
	const allTeeth = [];
	for (let i = 0; i < numTeeth; i++) {
		const a = (i * 2 * Math.PI) / numTeeth;
		allTeeth.push(rotateZ(a, tooth3d));
	}

	const teethUnion = translate([0, 0, -params.thickness / 2], union(allTeeth));

	// --- Root disk (more stable than polygon ring)
	// Use enough segments so it looks round; tie it to teeth count
	const rootDisk = cylinder({
		radius: rootRadius,
		height: params.thickness,
		segments: Math.max(MAX_SEGMENTS, numTeeth * 4)
	});

	// --- Bore cutout (inner diameter)
	const eps = 0.4;
	const bore = cylinder({
		radius: innerRadius + params.printTolerance,
		height: params.thickness + eps,
		segments: Math.max(MAX_SEGMENTS, numTeeth * 4)
	});

	// let result = teethUnion;
	let result = union(rootDisk, teethUnion);
	result = subtract(result, translate([0, 0, -eps / 2], bore));

	// Center at origin (Z=0 mid-plane)
	result = translate([0, 0, -params.thickness / 2], result);

	if (params.grubScrew) {
		// --- Grub screw hole
		const screw = cylinder({
			radius: params.grubScrewDiameter / 2 - 2 * params.printTolerance,
			height: outerRadius + eps,
			segments: 128
		});
		// Scew hole 1
		result = subtract(
			result,
			translate(
				[outerRadius - eps / 2, 0, -params.thickness / 2],
				rotate([0, Math.PI / 2, 0], screw)
			)
		);
		if (params.grubScrew2) {
			// Scew hole 2
			result = subtract(
				result,
				translate(
					[0, outerRadius - eps / 2, -params.thickness / 2],
					rotate([Math.PI / 2, 0, 0], screw)
				)
			);
		}
	}

	// --- Chamfer gear sides
	if (params.gearChamfer) {
		const chamferTan = Math.tan((params.gearChamferAngle * Math.PI) / 180);
		const t = params.thickness / 2;
		const chamferPolygon = polygon({
			points: [
				[rootRadius - eps * chamferTan, 0],
				[outerRadius + eps, 0 - (outerRadius - rootRadius + 2 * eps) * chamferTan],
				[outerRadius + eps, 0]
			]
		});
		const extrudedChamfer = extrudeRotate(
			{ segments: Math.max(MAX_SEGMENTS, numTeeth * 4), startAngle: 0, angle: 2 * Math.PI },
			chamferPolygon
		);
		result = subtract(
			result,
			translate([0, 0, -params.thickness], rotate([Math.PI, 0, 0], extrudedChamfer))
		);
		result = subtract(result, extrudedChamfer);
	}

	// --- Chamfer inner bore
	if (params.innerChamfer) {
		const innerChamferPolygon = polygon({
			points: [
				[innerRadius - eps, 0],
				[innerRadius - eps, -eps - params.innerChamferSize],
				[innerRadius + params.innerChamferSize + eps, 0]
			]
		});
		const extrudedInnerChamfer = extrudeRotate(
			{ segments: Math.max(MAX_SEGMENTS, numTeeth * 4), startAngle: 0, angle: 2 * Math.PI },
			innerChamferPolygon
		);
		result = subtract(result, extrudedInnerChamfer);
		result = subtract(
			result,
			translate([0, 0, -params.thickness], rotate([Math.PI, 0, 0], extrudedInnerChamfer))
		);
	}

	return { geometry: result, numTeeth };
}
