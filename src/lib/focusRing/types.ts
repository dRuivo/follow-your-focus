export type FocusRingParams = {
	innerDiameter: number;
	thickness: number;
	minWidth: number;
	clearance: number;
	gearModulus: number;
	pressureAngle: number;
	printTolerance: number;
	grubScrew: boolean;
	grubScrew2: boolean;
	grubScrewDiameter: number;
	grubScrewCap: boolean;
	gearChamfer: boolean;
	gearChamferAngle: number;
	innerChamfer: boolean;
	innerChamferSize: number;
};

export const defaultParams: FocusRingParams = {
	innerDiameter: 71,
	thickness: 9,
	minWidth: 5,
	clearance: 0.2,
	gearModulus: 0.8,
	pressureAngle: 20,
	printTolerance: 0.2,
	grubScrew: true,
	grubScrew2: false,
	grubScrewDiameter: 2.8,
	grubScrewCap: true,
	gearChamfer: true,
	gearChamferAngle: 30,
	innerChamfer: true,
	innerChamferSize: 0.5
};
