import pkg from 'lz-string';
const { compressToEncodedURIComponent, decompressFromEncodedURIComponent } = pkg;
import type { FocusRingParams } from './types';

const CURRENT_VERSION = 1;

interface EncodedParams {
	v: number; // version
	p: FocusRingParams; // parameters
}

/**
 * Encodes parameters to a URL-safe compressed string
 */
export function encodeParams(params: FocusRingParams): string {
	const data: EncodedParams = {
		v: CURRENT_VERSION,
		p: params
	};

	const json = JSON.stringify(data);
	// Use lz-string's built-in URL-safe encoding
	return compressToEncodedURIComponent(json);
}

/**
 * Decodes parameters from a URL-safe compressed string
 */
export function decodeParams(hash: string): FocusRingParams | null {
	try {
		// Validate hash is not empty
		if (!hash || typeof hash !== 'string') {
			return null;
		}

		// Use lz-string's built-in URL-safe decoding
		const json = decompressFromEncodedURIComponent(hash);

		if (!json) {
			console.warn('Failed to decompress parameters');
			return null;
		}

		const data: EncodedParams = JSON.parse(json);

		// Handle version migrations here if needed
		if (data.v === 1) {
			return data.p;
		}

		console.warn(`Unknown params version: ${data.v}`);
		return null;
	} catch (error) {
		console.error('Failed to decode params from URL:', error);
		return null;
	}
}

/**
 * Updates the URL hash with the current parameters
 */
export function updateUrlHash(params: FocusRingParams): void {
	// Only run in browser
	if (typeof window === 'undefined') {
		return;
	}

	const encoded = encodeParams(params);
	window.location.hash = encoded;
}

/**
 * Gets parameters from the current URL hash
 */
export function getParamsFromUrl(): FocusRingParams | null {
	// Only run in browser
	if (typeof window === 'undefined') {
		return null;
	}

	const hash = window.location.hash.slice(1); // Remove leading #

	if (!hash) {
		return null;
	}

	return decodeParams(hash);
}
