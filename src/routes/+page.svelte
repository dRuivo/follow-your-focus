<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { get } from 'svelte/store';

	import { focusRingParams, paramsFromUrl, paramsToSearchParams } from '$lib/focusRing/store';
	import type { FocusRingParams } from '$lib/focusRing/types';
	import { defaultParams } from '$lib/focusRing/types';

	let canvas: HTMLCanvasElement;
	let viewer: null | {
		update: (p: FocusRingParams) => void;
		exportStl: (f?: string) => void;
		destroy: () => void;
	} = null;

	let params: FocusRingParams = { ...defaultParams };

	onMount(async () => {
		canvas = document.getElementById('c') as HTMLCanvasElement;
		// createViewer(canvas);
		const mod = await import('$lib/engine/bootstrap');
		viewer = mod.createEngine(canvas);
		viewer.update(params);
	});

	onDestroy(() => viewer?.destroy());

	function updateParams(p: FocusRingParams) {
		focusRingParams.set(params);
		viewer?.update(params);
	}

	// convenience for bindings
	$: params = get(focusRingParams);
</script>

<div class="layout">
	<aside class="panel">
		<button onclick={() => viewer?.exportStl()}>Export STL</button>

		<label for="innerDiameter">Inner Diameter: {params.innerDiameter}</label>
		<input
			id="innerDiameter"
			type="range"
			min="10"
			max="100"
			step="0.1"
			bind:value={params.innerDiameter}
			onchange={() => updateParams(params)}
		/>

		<!-- repeat for other params (we can factor into a Slider component) -->
	</aside>
	<main class="viewer">
		<canvas id="c" style="width: 100%; height: 100%;"></canvas>
	</main>
</div>
