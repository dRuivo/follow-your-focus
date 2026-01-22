<script lang="ts">
	interface Props {
		value: number;
		min?: number;
		max?: number;
		step?: number;
		unit?: string;
		onChange?: (value: number) => void;
	}

	const { value, min = 0, max = 1, step = 0.05, unit = '', onChange }: Props = $props();

	let dragging = $state(false);
	let tooltipPos = $state({ x: 0, y: 0 });
	let displayValue = $state(value);
	let sliderElement: HTMLInputElement | undefined = $state();

	function handleMouseDown() {
		dragging = true;
	}

	function handleMouseUp() {
		dragging = false;
	}

	function updateTooltipPosition() {
		if (!sliderElement) return;
		const rect = sliderElement.getBoundingClientRect();
		// Use the actual slider element value, not the prop, so it updates in real-time while dragging
		const currentValue = parseFloat(sliderElement.value);
		const percentage = ((currentValue - min) / (max - min)) * 100;
		const thumbX = (rect.width * percentage) / 100 + rect.left;
		tooltipPos = {
			x: thumbX,
			y: rect.top - 40
		};
	}

	function handleChange(e: Event) {
		const target = e.target as HTMLInputElement;
		const newValue = parseFloat(target.value);
		if (onChange) {
			onChange(newValue);
		}
	}

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;
		displayValue = parseFloat(target.value);
		updateTooltipPosition();
	}
</script>

<div class="slider-container">
	<input
		type="range"
		{min}
		{max}
		{step}
		{value}
		bind:this={sliderElement}
		oninput={handleInput}
		onchange={handleChange}
		onmousedown={handleMouseDown}
		onmouseup={handleMouseUp}
		ontouchstart={handleMouseDown}
		ontouchend={handleMouseUp}
		class="slider-input"
	/>
	{#if dragging}
		<div class="slider-tooltip" style="left: {tooltipPos.x}px; top: {tooltipPos.y}px;">
			{displayValue.toFixed(2)}
			{unit}
		</div>
	{/if}
</div>

<style>
	.slider-container {
		display: flex;
		align-items: center;
		position: relative;
	}

	.slider-input {
		flex: 1;
		height: 6px;
		border-radius: 9999px;
		background: var(--app-border);
		outline: none;
		-webkit-appearance: none;
		appearance: none;
	}

	.slider-input::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 20px;
		height: 20px;
		border-radius: 9999px;
		background: var(--color-primary-600);
		cursor: pointer;
		transition: all 0.2s ease;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.slider-input::-webkit-slider-thumb:hover {
		background: var(--color-primary-700);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
		transform: scale(1.1);
	}

	.slider-input::-moz-range-thumb {
		width: 20px;
		height: 20px;
		border-radius: 9999px;
		background: var(--color-primary-600);
		cursor: pointer;
		border: none;
		transition: all 0.2s ease;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.slider-input::-moz-range-thumb:hover {
		background: var(--color-primary-700);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
		transform: scale(1.1);
	}

	.slider-input::-moz-range-track {
		background: transparent;
		border: none;
	}

	.slider-input:focus::-webkit-slider-thumb {
		box-shadow: 0 0 0 3px rgb(45 140 75 / 0.2);
	}

	.slider-tooltip {
		position: fixed;
		z-index: 10000;
		background-color: var(--color-neutral-800);
		color: var(--color-neutral-100);
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-md);
		font-size: var(--text-xs);
		font-weight: 500;
		font-family: var(--font-mono);
		white-space: nowrap;
		pointer-events: none;
		transform: translate(-50%, -8px);
		box-shadow: var(--shadow-lg);
		animation: tooltipFade 0.2s ease;
	}

	@keyframes tooltipFade {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>
