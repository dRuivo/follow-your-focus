<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import { get } from 'svelte/store';

	import { focusRingParams, paramsFromUrl, paramsToSearchParams } from '$lib/focusRing/store';
	import type { FocusRingParams } from '$lib/focusRing/types';
	import { defaultParams } from '$lib/focusRing/types';

	let canvas: HTMLCanvasElement;
	let viewer: null | {
		update: (p: FocusRingParams) => void;
		exportStl: (f?: string) => void;
		getNumTeeth: () => number;
		destroy: () => void;
	} = null;

	let params: FocusRingParams = { ...defaultParams };
	let advancedOpen = false;
	let numTeeth = 0;

	onMount(async () => {
		canvas = document.getElementById('c') as HTMLCanvasElement;
		const mod = await import('$lib/engine/bootstrap');
		viewer = mod.createEngine(canvas);
		viewer.update(params);
		numTeeth = viewer.getNumTeeth();
	});

	onDestroy(() => viewer?.destroy());

	function updateParams(p: FocusRingParams) {
		focusRingParams.set(params);
		viewer?.update(params);
		numTeeth = viewer?.getNumTeeth() ?? 0;
	}

	// convenience for bindings
	$: params = get(focusRingParams);
</script>

<div class="page-container">
	<!-- Header -->
	<div class="page-header">
		<div class="header-content">
			<div class="header-title-section">
				<h1>Follow Your Focus</h1>
				<p class="header-description">Design custom focus rings for your lense</p>
			</div>
		</div>
	</div>

	<!-- Main Content Area -->
	<main class="page-main">
		<div class="canvas-container">
			<canvas id="c" class="canvas"></canvas>
		</div>

		<!-- Right Panel - Parameter Editor -->
		<aside class="editor-panel">
			<div class="panel-header">
				<h2>Parameters</h2>
			</div>

			<div class="panel-content">
				<!-- Parameter Controls -->
				<div class="parameter-group">
					<label for="innerDiameter" class="param-label">Inner Diameter</label>
					<input
						id="innerDiameter"
						type="number"
						min="40"
						max="100"
						step="0.1"
						bind:value={params.innerDiameter}
						onchange={() => updateParams(params)}
						class="numeric-input"
					/>
				</div>

				<div class="parameter-group">
					<label for="thickness" class="param-label">Thickness</label>
					<input
						id="thickness"
						type="number"
						min="1"
						max="20"
						step="0.1"
						bind:value={params.thickness}
						onchange={() => updateParams(params)}
						class="numeric-input"
					/>
				</div>

				<div class="parameter-group">
					<label for="minWidth" class="param-label">Min Width</label>
					<input
						id="minWidth"
						type="number"
						min="0.5"
						max="10"
						step="0.1"
						bind:value={params.minWidth}
						onchange={() => updateParams(params)}
						class="numeric-input"
					/>
				</div>

				<div class="parameter-group">
					<label for="printTolerance" class="param-label">Print Tolerance</label>
					<input
						id="printTolerance"
						type="number"
						min="0"
						max="1"
						step="0.01"
						bind:value={params.printTolerance}
						onchange={() => updateParams(params)}
						class="numeric-input"
					/>
				</div>

				<div class="parameter-group">
					<label for="numberOfTeeth" class="param-label">
						Number of Teeth
						<span>{numTeeth}</span>
					</label>
				</div>

				<!-- Grub Screws Section -->
				<div class="parameter-group">
					<label class="checkbox-label">
						<span>Grub Screw</span>
						<input
							type="checkbox"
							bind:checked={params.grubScrew}
							onchange={() => updateParams(params)}
							class="checkbox-input"
						/>
					</label>
				</div>

				{#if params.grubScrew}
					<div class="conditional-params" transition:slide={{ duration: 300 }}>
						<div class="parameter-group">
							<label for="grubScrewDiameter" class="param-label">Screw Diameter</label>
							<input
								id="grubScrewDiameter"
								type="number"
								min="1"
								max="10"
								step="0.1"
								bind:value={params.grubScrewDiameter}
								onchange={() => updateParams(params)}
								class="numeric-input"
							/>
						</div>

						<div class="parameter-group">
							<label class="checkbox-label">
								<span>Second Screw</span>
								<input
									type="checkbox"
									bind:checked={params.grubScrew2}
									onchange={() => updateParams(params)}
									class="checkbox-input"
								/>
							</label>
						</div>
					</div>
				{/if}

				<!-- Advanced Parameters Accordion -->
				<div class="accordion">
					<button
						class="accordion-trigger"
						onclick={() => (advancedOpen = !advancedOpen)}
						aria-expanded={advancedOpen}
					>
						<span class="accordion-title">Advanced Parameters</span>
						<span class="accordion-icon" class:open={advancedOpen}>▼</span>
					</button>

					{#if advancedOpen}
						<div class="accordion-content">
							<div class="parameter-group">
								<label for="gearModulus" class="param-label">Gear Modulus</label>
								<input
									id="gearModulus"
									type="number"
									min="0.1"
									max="2"
									step="0.01"
									bind:value={params.gearModulus}
									onchange={() => updateParams(params)}
									class="numeric-input"
								/>
							</div>
							<div class="parameter-group">
								<label for="pressureAngle" class="param-label">Pressure Angle</label>
								<input
									id="pressureAngle"
									type="number"
									min="0"
									max="45"
									step="0.1"
									bind:value={params.pressureAngle}
									onchange={() => updateParams(params)}
									class="numeric-input"
								/>
							</div>
							<div class="parameter-group">
								<label for="clearance" class="param-label">Clearance</label>
								<input
									id="clearance"
									type="number"
									min="0"
									max="1"
									step="0.01"
									bind:value={params.clearance}
									onchange={() => updateParams(params)}
									class="numeric-input"
								/>
							</div>
						</div>
					{/if}
				</div>

				<!-- Export Button at Bottom -->
				<div class="panel-footer">
					<button class="btn btn-primary btn-lg" onclick={() => viewer?.exportStl()}>
						Export STL
					</button>
				</div>
			</div>
		</aside>
	</main>
</div>

<style>
	.page-container {
		display: flex;
		flex-direction: column;
		height: 100%;
		background-color: var(--app-bg);
		color: var(--app-text);
	}

	.page-header {
		background-color: var(--app-header-bg);
		border-bottom: 1px solid var(--app-border);
		padding: var(--space-6);
		box-shadow: var(--shadow-sm);
	}

	.header-content {
		max-width: 1400px;
		margin: 0 auto;
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
	}

	.header-title-section h1 {
		margin: 0 0 var(--space-2) 0;
		font-size: var(--text-3xl);
		font-weight: 700;
		color: var(--color-primary-600);
	}

	.header-description {
		margin: 0;
		font-size: var(--text-base);
		color: var(--app-text-muted);
	}

	.page-main {
		flex: 1;
		display: flex;
		flex-direction: row;
		gap: 0;
		overflow: hidden;
		max-width: 1400px;
		width: 100%;
		margin: 0 auto;
	}

	@media (max-width: 1024px) {
		.page-main {
			flex-direction: column;
		}
	}

	.canvas-container {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-4);
		background-color: var(--app-bg);
		overflow: hidden;
	}

	.canvas {
		width: 100%;
		max-height: 70vh;
		border-radius: var(--radius-lg);
		background-color: var(--color-neutral-100);
		box-shadow: var(--shadow-md);
	}
	@media (max-width: 1024px) {
		.canvas-container {
			max-height: 50vh; /* Shorter on mobile to show params */
		}
	}

	.editor-panel {
		width: 320px;
		display: flex;
		flex-direction: column;
		background-color: var(--app-panel-bg);
		border-left: 1px solid var(--app-border);
		overflow: hidden;
	}

	@media (max-width: 1024px) {
		.editor-panel {
			width: 100%;
			border-left: none;
			border-top: 1px solid var(--app-border);
			max-height: 40%;
		}
	}

	.panel-header {
		padding: var(--space-4);
		border-bottom: 1px solid var(--app-border);
		background-color: var(--app-header-bg);
	}

	.panel-header h2 {
		margin: 0;
		font-size: var(--text-lg);
		font-weight: 600;
		color: var(--app-text);
	}

	.panel-content {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.parameter-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.parameter-group label {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-1);
	}

	.param-label {
		font-weight: 500;
		font-size: var(--text-sm);
		color: var(--app-text);
	}

	.numeric-input {
		width: 100%;
		padding: var(--space-2) var(--space-3);
		font-size: var(--text-sm);
		font-weight: 500;
		font-family: var(--font-mono);
		color: var(--app-text);
		background-color: var(--app-bg);
		border: 1px solid var(--app-border);
		border-radius: var(--radius-lg);
		transition: all 0.2s ease;
		outline: none;
		box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
	}

	.numeric-input:hover:not(:focus) {
		border-color: var(--color-neutral-300);
	}

	.numeric-input:focus {
		border-color: var(--color-primary-500);
		box-shadow: 0 0 0 3px rgb(45 140 75 / 0.1);
	}

	.numeric-input::-webkit-outer-spin-button,
	.numeric-input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	.numeric-input[type='number'] {
		appearance: textfield;
		-moz-appearance: textfield;
	}

	.panel-footer {
		padding: var(--space-4);
		border-top: 1px solid var(--app-border);
		background-color: var(--app-header-bg);
	}

	.panel-footer .btn {
		width: 100%;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		cursor: pointer;
		font-weight: 500;
		font-size: var(--text-sm);
		color: var(--app-text);
		user-select: none;
	}

	.checkbox-input {
		width: 18px;
		height: 18px;
		cursor: pointer;
		accent-color: var(--color-primary-600);
	}

	.conditional-params {
		padding: var(--space-3);
		border: 1px solid var(--app-border);
		border-radius: var(--radius-lg);
		background-color: var(--color-neutral-50);
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.accordion {
		border: 1px solid var(--app-border);
		border-radius: var(--radius-lg);
		overflow: hidden;
		background-color: var(--app-bg);
	}

	.accordion-trigger {
		width: 100%;
		padding: var(--space-3) var(--space-4);
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: var(--app-bg);
		border: none;
		cursor: pointer;
		transition: all 0.2s ease;
		font-weight: 500;
		font-size: var(--text-sm);
		color: var(--app-text);
	}

	.accordion-trigger:hover {
		background-color: var(--app-panel-bg);
	}

	.accordion-title {
		font-weight: 600;
		color: var(--app-text);
	}

	.accordion-icon {
		display: inline-flex;
		transition: transform 0.3s ease;
		color: var(--app-text-muted);
		font-size: 12px;
	}

	.accordion-icon.open {
		transform: rotate(180deg);
	}

	.accordion-content {
		padding: var(--space-4);
		border-top: 1px solid var(--app-border);
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
		animation: slideDown 0.3s ease;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
