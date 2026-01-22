<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		position?: 'top' | 'bottom' | 'left' | 'right';
		delay?: number;
		trigger: Snippet;
		content: Snippet;
	}

	const { position = 'top', delay = 200, trigger, content }: Props = $props();

	let visible = $state(false);
	let timeoutId: ReturnType<typeof setTimeout> | null = null;
	let tooltipElement: HTMLDivElement | undefined = $state();
	let triggerElement: HTMLDivElement | undefined = $state();
	let tooltipPos = $state({ x: 0, y: 0 });

	function updatePosition() {
		if (!triggerElement || !tooltipElement) return;

		const triggerRect = triggerElement.getBoundingClientRect();
		const tooltipRect = tooltipElement.getBoundingClientRect();

		let x = 0;
		let y = 0;

		const offset = 8; // Distance from trigger

		switch (position) {
			case 'top':
				x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
				y = triggerRect.top - tooltipRect.height - offset;
				break;
			case 'bottom':
				x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
				y = triggerRect.bottom + offset;
				break;
			case 'left':
				x = triggerRect.left - tooltipRect.width - offset;
				y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
				break;
			case 'right':
				x = triggerRect.right + offset;
				y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
				break;
		}

		tooltipPos = { x, y };
	}

	function show() {
		if (timeoutId) clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			visible = true;
		}, delay);
	}

	function hide() {
		if (timeoutId) clearTimeout(timeoutId);
		visible = false;
	}

	// Update position when tooltip becomes visible
	$effect(() => {
		if (visible && tooltipElement) {
			// Use microtask to ensure DOM is ready
			queueMicrotask(() => {
				updatePosition();
			});
		}
	});

	// Cleanup on destroy
	$effect(() => {
		return () => {
			if (timeoutId) clearTimeout(timeoutId);
		};
	});
</script>

<div
	class="tooltip-trigger"
	bind:this={triggerElement}
	onmouseenter={show}
	onmouseleave={hide}
	onfocus={show}
	onblur={hide}
	role="button"
	tabindex="0"
	aria-describedby="tooltip-content"
>
	{@render trigger()}
</div>

{#if visible}
	<div
		id="tooltip-content"
		class="tooltip-content"
		class:tooltip-top={position === 'top'}
		class:tooltip-bottom={position === 'bottom'}
		class:tooltip-left={position === 'left'}
		class:tooltip-right={position === 'right'}
		bind:this={tooltipElement}
		style="left: {tooltipPos.x}px; top: {tooltipPos.y}px;"
		onmouseenter={show}
		onmouseleave={hide}
		role="tooltip"
	>
		{@render content()}
	</div>
{/if}

<style>
	.tooltip-trigger {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		/* cursor: help; */
	}

	.tooltip-content {
		position: fixed;
		z-index: 10000;
		background-color: var(--color-neutral-800);
		color: var(--color-neutral-100);
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-lg);
		font-size: var(--text-xs);
		font-weight: 500;
		font-family: var(--font-body);
		line-height: var(--leading-normal);
		box-shadow: var(--shadow-lg);
		animation: tooltipFade 0.2s ease;
		max-width: 280px;
		word-break: break-word;
		white-space: normal;
		pointer-events: auto;
		letter-spacing: -0.01em;
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
