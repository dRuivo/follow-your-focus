export type FocusRingParams = {
	innerDiameter: number;
	thickness: number;
	minWidth: number;
	clearance: number;
	gearModulus: number;
	pressureAngle: number;
	printTolerance: number;
};

export const defaultParams: FocusRingParams = {
	innerDiameter: 40,
	thickness: 5,
	minWidth: 2,
	clearance: 0.2,
	gearModulus: 0.8,
	pressureAngle: 20,
	printTolerance: 0.1
};
