<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import { Share, ArrowDownTray, InformationCircle, Printer } from 'svelte-heros-v2';

	import { focusRingParams } from '$lib/focusRing/store';
	import type { FocusRingParams } from '$lib/focusRing/types';
	import { defaultParams } from '$lib/focusRing/types';
	import { getParamsFromUrl, updateUrlHash } from '$lib/focusRing/urlParams';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import SliderInput from '$lib/components/SliderInput.svelte';

	import { openModal } from '$lib/stores/modals';

	let canvas: HTMLCanvasElement;
	let viewer: null | {
		update: (p: FocusRingParams) => void;
		exportStl: (f?: string) => void;
		getNumTeeth: () => number;
		destroy: () => void;
	} = null;

	let params: FocusRingParams = $state({ ...defaultParams });
	let perimeter = $state(Math.round(100 * Math.PI * params.innerDiameter) / 100);
	let diameter = $state(params.innerDiameter);
	let advancedOpen = $state(false);
	let numTeeth = $state(0);

	// Prototype: lens size input mode selection
	let lensSizeMode: 'diameter' | 'perimeter' = $state('diameter');
	let unsubscribeParams: (() => void) | null = null;

	onMount(async () => {
		// Load params from URL if available, otherwise use defaults
		const urlParams = getParamsFromUrl();
		if (urlParams) {
			params = urlParams;
			focusRingParams.set(urlParams);
		}

		canvas = document.getElementById('c') as HTMLCanvasElement;
		const mod = await import('$lib/engine/bootstrap');
		viewer = mod.createEngine(canvas);
		await viewer.update(params);
		numTeeth = viewer.getNumTeeth();

		unsubscribeParams = focusRingParams.subscribe((value) => {
			params = value;
		});

		// Listen for hash changes (browser back/forward)
		if (typeof window !== 'undefined') {
			window.addEventListener('hashchange', handleHashChange);
		}
	});

	onDestroy(() => {
		viewer?.destroy();
		unsubscribeParams?.();
		if (typeof window !== 'undefined') {
			window.removeEventListener('hashchange', handleHashChange);
		}
	});

	async function handleHashChange() {
		const urlParams = getParamsFromUrl();
		if (urlParams) {
			params = urlParams;
			focusRingParams.set(params);
			await viewer?.update(params);
			numTeeth = viewer?.getNumTeeth() ?? 0;
		}
	}

	function resetParams() {
		params = { ...defaultParams };
		focusRingParams.set({ ...defaultParams });
		updateUrlHash(params);
	}

	async function shareDesign() {
		if (typeof window === 'undefined') return;

		const url = window.location.href;

		// Try to use Web Share API if available
		if (navigator.share) {
			try {
				await navigator.share({
					title: 'Focus Ring Design',
					text: 'Check out this focus ring design I created!',
					url
				});
				return;
			} catch (err) {
				// User cancelled share or API not available
				console.log('Share cancelled');
			}
		}

		// Fallback: Copy to clipboard
		try {
			await navigator.clipboard.writeText(url);
			alert('Design link copied to clipboard!');
		} catch (err) {
			console.error('Failed to copy:', err);
			alert('Could not copy link. Please try again.');
		}
	}

	async function updateParams(p: FocusRingParams) {
		const next = { ...p };
		focusRingParams.set(next);
		updateUrlHash(next);
	}

	async function updateByPerimeter(per: number) {
		const nextDiameter = Math.round((100 * per) / Math.PI) / 100;
		diameter = nextDiameter;
		params.innerDiameter = nextDiameter;
		await updateParams(params);
	}

	async function updateByDiameter(dia: number) {
		const nextPerimeter = Math.round(100 * Math.PI * dia) / 100;
		perimeter = nextPerimeter;
		params.innerDiameter = dia;
		await updateParams(params);
	}
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
					<div class="related-params-group">
						<div class="lens-size-label">Define Lens Size by:</div>

						<!-- Diameter Option Block -->
						<div class="lens-size-option-block">
							<label class="radio-with-input-label">
								<input
									type="radio"
									name="lensSizeMode"
									value="diameter"
									bind:group={lensSizeMode}
									class="radio-input"
								/>
								<Tooltip position="left">
									{#snippet trigger()}
										<span class="radio-label-text">Lens Diameter [mm] </span><InformationCircle
											size="16"
											strokeWidth="1.5"
											class="help-icon"
										/>
									{/snippet}
									{#snippet content()}
										The outer diameter of your lens in millimeters.
										<br /><br />
										<strong>Example:</strong> A 50mm lens ≈ 157mm perimeter
									{/snippet}
								</Tooltip>
							</label>
							<input
								id="innerDiameter"
								type="number"
								min="40"
								max="100"
								step="0.1"
								bind:value={diameter}
								onchange={() => updateByDiameter(diameter)}
								class="numeric-input"
								class:disabled={lensSizeMode !== 'diameter'}
								disabled={lensSizeMode !== 'diameter'}
							/>
						</div>

						<!-- Perimeter Option Block -->
						<div class="lens-size-option-block">
							<label class="radio-with-input-label">
								<input
									type="radio"
									name="lensSizeMode"
									value="perimeter"
									bind:group={lensSizeMode}
									class="radio-input"
								/>
								<Tooltip position="left">
									{#snippet trigger()}
										<span class="radio-label-text">Lens Perimeter [mm]</span>
										<InformationCircle size="16" strokeWidth="1.5" class="help-icon" />
									{/snippet}
									{#snippet content()}
										The circumference around your lens.
										<br /><br />
										<em>Formula:</em> perimeter = diameter × π
									{/snippet}
								</Tooltip>
							</label>
							<input
								id="perimeter"
								type="number"
								min="125"
								max="400"
								step="0.1"
								bind:value={perimeter}
								onchange={() => updateByPerimeter(perimeter)}
								class="numeric-input"
								class:disabled={lensSizeMode !== 'perimeter'}
								disabled={lensSizeMode !== 'perimeter'}
							/>
						</div>
					</div>

					<!-- Min Wall Width -->
					<div class="related-params-group">
						<div class="parameter-group">
							<label for="minWidth" class="param-label">
								<Tooltip position="left">
									{#snippet trigger()}
										<span>Min Wall Width [mm]</span>
										<InformationCircle size="16" strokeWidth="1.5" class="help-icon" />
									{/snippet}
									{#snippet content()}
										Minimum distance between lense and teeth root.
										<br /><br />
										Thicker walls = stronger ring, but more teeth.
									{/snippet}
								</Tooltip>
							</label>
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
							<p class="param-label">
								Resulting Number of Teeth:
								<span>{numTeeth}</span>
							</p>
						</div>
					</div>

					<!-- Thickness -->
					<div class="related-params-group">
						<div class="parameter-group">
							<label for="thickness" class="param-label">
								<Tooltip position="left">
									{#snippet trigger()}
										<span>Thickness [mm]</span>
										<InformationCircle size="16" strokeWidth="1.5" class="help-icon" />
									{/snippet}
									{#snippet content()}
										Thickness of the entire focus ring (1–20 mm).
										<br /><br />
										Thicker = stronger, more tooth to touch.
									{/snippet}
								</Tooltip>
							</label>
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
					</div>

					<!-- Print Tolerance -->
					<div class="related-params-group">
						<div class="parameter-group">
							<label for="printTolerance" class="param-label">
								<Tooltip position="left">
									{#snippet trigger()}
										<span>Print Tolerance</span>
										<InformationCircle size="16" strokeWidth="1.5" class="help-icon" />
									{/snippet}
									{#snippet content()}
										Shrinkage compensation for your 3D printer. This only affects the inner diameter
										of the ring, so you can keep a direct measurement of your lens.
										<br /><br />
										Typical: 0.2–0.5 mm for FDM printers.
									{/snippet}
								</Tooltip>
							</label>
							<SliderInput
								value={params.printTolerance}
								min={0}
								max={0.5}
								step={0.05}
								unit="mm"
								onChange={(v) => {
									params.printTolerance = v;
									updateParams(params);
								}}
							/>
						</div>
					</div>

					<!-- Chamfer Section -->
					<div class="related-params-group">
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
									<label for="chamferAngle" class="param-label">Chamfer Angle [°]</label>
									<input
										id="chamferAngle"
										type="number"
										min="5"
										max="45"
										step="0.1"
										bind:value={params.gearChamferAngle}
										onchange={() => updateParams(params)}
										class="numeric-input"
									/>
								</div>
							</div>
						{/if}
					</div>

					<!-- Inner Chamfer Section -->
					<div class="related-params-group">
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
									<label for="innerChamferSize" class="param-label">Inner Chamfer Size [mm]</label>
									<input
										id="innerChamferSize"
										type="number"
										min="0.5"
										max="5"
										step="0.1"
										bind:value={params.innerChamferSize}
										onchange={() => updateParams(params)}
										class="numeric-input"
									/>
								</div>
							</div>
						{/if}
					</div>

					<!-- Grub Screws Section -->
					<div class="related-params-group">
						<div class="parameter-group">
							<label class="checkbox-label">
								<Tooltip position="left">
									{#snippet trigger()}
										<span>Grub Screw</span>
										<InformationCircle size="16" strokeWidth="1.5" class="help-icon" />
									{/snippet}
									{#snippet content()}
										Add a grub screw hole to secure the focus ring to your lens.
									{/snippet}
								</Tooltip>
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
									<label for="grubScrewDiameter" class="param-label">
										<Tooltip position="left">
											{#snippet trigger()}
												<span>Screw Size</span>
												<InformationCircle size="16" strokeWidth="1.5" class="help-icon" />
											{/snippet}
											{#snippet content()}
												Select the grub screw size to match your lens.
												<br /><br />
												Common sizes:
												<ul>
													<li><strong>M3</strong> - 2.8 mm hole diameter</li>
													<li><strong>M4</strong> - 3.7 mm hole diameter</li>
												</ul>
											{/snippet}
										</Tooltip>
									</label>
									<select
										id="grubScrewDiameter"
										value={String(params.grubScrewDiameter)}
										onchange={(e) => {
											const val = parseFloat((e.target as HTMLSelectElement).value);
											params.grubScrewDiameter = val;
											updateParams(params);
										}}
										class="select-input"
									>
										<option value="2.8">M3 (2.8 mm hole)</option>
										<option value="3.7">M4 (3.7 mm hole)</option>
									</select>
								</div>
								<div class="parameter-group">
									<label class="checkbox-label">
										<Tooltip position="left">
											{#snippet trigger()}
												<span>Screw Cap</span>
												<InformationCircle size="16" strokeWidth="1.5" class="help-icon" />
											{/snippet}
											{#snippet content()}
												Add a cap to cover the grub screw for a cleaner look and to protect the lens
												from scratches.
											{/snippet}
										</Tooltip>
										<input
											type="checkbox"
											bind:checked={params.grubScrewCap}
											onchange={() => updateParams(params)}
											class="checkbox-input"
										/>
									</label>
								</div>
								<div class="parameter-group">
									<label class="checkbox-label">
										<Tooltip position="left">
											{#snippet trigger()}
												<span>Second Screw</span>
												<InformationCircle size="16" strokeWidth="1.5" class="help-icon" />
											{/snippet}
											{#snippet content()}
												Add a second grub screw at 90° from the first for extra security.
											{/snippet}
										</Tooltip>
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
					</div>

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
					<button
						class="btn btn-secondary btn-icon btn-share"
						onclick={shareDesign}
						title="Share Design"
					>
						<Share class="icon-sm" />
					</button>
					<button
						class="btn btn-primary btn-icon btn-export"
						onclick={() => viewer?.exportStl()}
						title="Export STL"
					>
						<ArrowDownTray class="icon-sm" />
						<span>STL</span>
					</button>
					<button
						class="btn btn-secondary btn-icon btn-help"
						onclick={() => openModal('helpPrinting')}
						title="Help Printing"
					>
						<Printer class="icon-sm" />
						<span>Help</span>
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
		display: flex;
		align-items: center;
		gap: var(--space-2);
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

	/* Lens Size Label */
	.lens-size-label {
		display: block;
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--app-text);
		margin-bottom: var(--space-3);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--app-text-muted);
	}

	/* Blocky Option Sections */
	.lens-size-option-block {
		padding: var(--space-4);
		margin-bottom: var(--space-3);
		border: 2px solid var(--app-border);
		border-radius: var(--radius-lg);
		background-color: var(--app-bg);
		transition: all 0.2s ease;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		opacity: 0.5;
	}

	.lens-size-option-block:has(input:checked) {
		opacity: 1;
		border-color: var(--app-border);
	}

	/* Radio Button Styling */
	.radio-input {
		width: 20px;
		height: 20px;
		cursor: pointer;
		accent-color: var(--color-primary-600);
		flex-shrink: 0;
	}

	.radio-with-input-label {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		cursor: pointer;
		font-size: var(--text-sm);
		color: var(--app-text);
		user-select: none;
		margin-bottom: var(--space-2);
	}

	.radio-label-text {
		font-weight: 600;
		color: var(--app-text);
	}

	.lens-size-option-block:has(input:checked) .radio-label-text {
		color: var(--app-text);
	}

	.numeric-input:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		background-color: var(--app-panel-bg);
	}

	.numeric-input.disabled {
		opacity: 0.5;
	}

	.panel-footer {
		padding: var(--space-6);
		border-top: 1px solid var(--app-border);
		background-color: var(--app-header-bg);
		flex-shrink: 0;
		box-shadow: var(--shadow-lg);
		display: flex;
		gap: var(--space-3);
		flex-direction: row;
	}

	.panel-footer .btn {
		min-width: 0;
	}

	.panel-footer .btn-share {
		flex: 0 0 calc(20% - calc(var(--space-3) / 2));
	}

	.panel-footer .btn-export {
		flex: 0 0 calc(40% - calc(var(--space-3) / 2));
	}

	.panel-footer .btn-help {
		flex: 0 0 calc(40% - calc(var(--space-3) / 2));
	}

	.panel-footer .btn-icon {
		font-size: var(--text-lg);
		font-weight: 700;
		padding: var(--space-3) var(--space-2);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		min-height: 48px;
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

	.select-input {
		width: 100%;
		padding: var(--space-2) var(--space-3);
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--app-text);
		background-color: var(--app-bg);
		border: 1px solid var(--app-border);
		border-radius: var(--radius-lg);
		transition: all 0.2s ease;
		outline: none;
		box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
		cursor: pointer;
	}

	.select-input:hover {
		border-color: var(--color-neutral-300);
	}

	.select-input:focus {
		border-color: var(--color-primary-500);
		box-shadow: 0 0 0 3px rgb(45 140 75 / 0.1);
	}

	.conditional-params {
		padding: var(--space-3);
		border: 1px solid var(--app-border);
		border-radius: var(--radius-lg);
		background-color: var(--app-panel-bg);
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	/* Related parameters group - lighter than conditional-params */
	.related-params-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		padding: var(--space-2);
		border: 1px solid var(--app-border);
		border-radius: var(--radius-lg);
		background-color: transparent;
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
