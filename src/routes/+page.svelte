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

	function resetParams() {
		params = { ...defaultParams };
		updateParams(params);
	}

	function updateParams(p: FocusRingParams) {
		focusRingParams.set(params);
		viewer?.update(params);
		numTeeth = viewer?.getNumTeeth() ?? 0;
	}

	// convenience for bindings
	$: params = get(focusRingParams);
</script>

<!-- Main Content Area -->
<main class="page-main">
	<div class="page-title">
		<h1 style="color: var(--color-primary-600);">Focus Ring Designer</h1>
		<p>Design and customize focus rings for your camera lens</p>
	</div>
	<div class="content-wrapper">
		<div class="canvas-container">
			<canvas id="c" class="canvas"></canvas>
		</div>

		<!-- Right Panel - Parameter Editor -->
		<aside class="panel editor-panel">
			<div class="panel-header">
				<h2>Parameters</h2>
			</div>

			<div class="panel-content-wrapper">
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

					<!-- Chamfer Section -->
					<div class="parameter-group">
						<label class="checkbox-label">
							<span>Chamfer Gear</span>
							<input
								type="checkbox"
								bind:checked={params.gearChamfer}
								onchange={() => updateParams(params)}
								class="checkbox-input"
							/>
						</label>
					</div>

					{#if params.gearChamfer}
						<div class="conditional-params" transition:slide={{ duration: 300 }}>
							<div class="parameter-group">
								<label for="chamferAngle" class="param-label">Chamfer Angle</label>
								<input
									id="chamferAngle"
									type="number"
									min="1"
									max="45"
									step="0.1"
									bind:value={params.gearChamferAngle}
									onchange={() => updateParams(params)}
									class="numeric-input"
								/>
							</div>
						</div>
					{/if}

					<!-- Inner Chamfer Section -->
					<div class="parameter-group">
						<label class="checkbox-label">
							<span>Chamfer Inner Bore</span>
							<input
								type="checkbox"
								bind:checked={params.innerChamfer}
								onchange={() => updateParams(params)}
								class="checkbox-input"
							/>
						</label>
					</div>

					{#if params.innerChamfer}
						<div class="conditional-params" transition:slide={{ duration: 300 }}>
							<div class="parameter-group">
								<label for="innerChamferSize" class="param-label">Inner Chamfer Size</label>
								<input
									id="innerChamferSize"
									type="number"
									min="0.1"
									max="5"
									step="0.1"
									bind:value={params.innerChamferSize}
									onchange={() => updateParams(params)}
									class="numeric-input"
								/>
							</div>
						</div>
					{/if}

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

					<!-- Reset to default -->
					<div class="parameter-group">
						<button class="btn btn-secondary btn-lg" onclick={resetParams}>
							Reset to Default
						</button>
					</div>
				</div>

				<!-- Sticky Export Button -->
				<div class="panel-footer">
					<button class="btn btn-primary btn-lg" onclick={() => viewer?.exportStl()}>
						Export STL
					</button>
				</div>
			</div>
		</aside>
	</div>
</main>

<style>
	.page-main {
		display: flex;
		flex-direction: column;
		height: 100%;
		max-width: 1400px;
		width: 100%;
		margin: 0 auto;
		overflow: hidden;
	}

	.page-title {
		padding: var(--space-6) var(--space-6) var(--space-4);
		text-align: left;
		border-bottom: 1px solid var(--app-border);
		background-color: var(--app-header-bg);
		flex-shrink: 0;
	}

	.page-title p {
		/* Using app.css p styles with custom color */
		color: var(--app-text-muted);
	}

	.content-wrapper {
		flex: 1;
		display: flex;
		flex-direction: row;
		gap: 0;
		overflow: hidden;
	}

	.canvas-container {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--space-6);
		background-color: var(--app-bg);
		overflow: hidden;
		max-height: 70vh;
		min-height: 300px;
	}

	.canvas {
		width: 100%;
		height: 100%;
		max-width: 100%;
		max-height: 100%;
		border-radius: var(--radius-xl);
		background-color: var(--color-neutral-100);
		box-shadow: var(--shadow-lg);
		border: 1px solid var(--app-border);
	}

	.editor-panel {
		width: 350px;
		border-left: 1px solid var(--app-border);
		overflow: hidden;
	}

	@media (max-width: 1024px) {
		.page-title {
			padding: var(--space-3) var(--space-4) var(--space-2);
		}

		.page-title h1 {
			font-size: var(--text-2xl); /* Smaller title on mobile */
			margin-bottom: 0; /* Remove bottom margin since no subtitle */
		}

		.page-title p {
			display: none; /* Hide subtitle on mobile to save space */
		}

		.content-wrapper {
			flex-direction: column;
		}

		.canvas-container {
			max-height: 30vh;
			min-height: 200px;
			flex: 0 0 auto;
		}

		.editor-panel {
			width: 100%;
			border-left: none;
			border-top: 1px solid var(--app-border);
			flex: 1;
			min-height: 0; /* Allow shrinking */
			display: flex;
			flex-direction: column;
		}

		.panel-content-wrapper {
			flex: 1;
			min-height: 0; /* Allow shrinking */
			overflow: hidden;
		}

		.panel-content {
			padding: var(--space-4);
			gap: var(--space-4);
			height: 100%; /* Take full height of wrapper */
			overflow-y: auto; /* Enable scrolling */
		}

		.panel-footer {
			flex-shrink: 0; /* Prevent footer from shrinking */
			padding: var(--space-4);
		}
	}

	.panel-content-wrapper {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.panel-content {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-6);
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
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
		padding: var(--space-6);
		border-top: 1px solid var(--app-border);
		background-color: var(--app-header-bg);
		flex-shrink: 0;
		box-shadow: var(--shadow-lg);
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
