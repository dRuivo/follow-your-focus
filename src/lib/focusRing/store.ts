import { writable } from 'svelte/store';
import type { FocusRingParams } from './types';
import { defaultParams } from './types';

export const focusRingParams = writable<FocusRingParams>(defaultParams);

// whitelist keys to avoid random query params affecting state
const keys = Object.keys(defaultParams) as (keyof FocusRingParams)[];

export function paramsFromUrl(url: URL): FocusRingParams {
	const p: FocusRingParams = { ...defaultParams };

	for (const k of keys) {
		const v = url.searchParams.get(k);
		if (v === null) continue;
		const n = Number(v);
		if (Number.isFinite(n)) (p[k] as number) = n;
	}

	return p;
}

export function paramsToSearchParams(params: FocusRingParams): URLSearchParams {
	const sp = new URLSearchParams();
	for (const k of keys) sp.set(k, String(params[k]));
	return sp;
}
