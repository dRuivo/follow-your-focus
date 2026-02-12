<script lang="ts">
	import { EXTERNAL_URLS } from '$lib/config';
	import Modal from './Modal.svelte';

	let {
		isOpen = $bindable(false),
		onClose = (): void => {}
	}: { isOpen?: boolean; onClose?: () => void } = $props();

	function closeModal() {
		isOpen = false;
		onClose();
	}
</script>

<Modal bind:isOpen {onClose}>
	{#snippet header()}
		<h1>Need Help printing?</h1>
		<h2>Here are some tips</h2>
	{/snippet}

	{#snippet content()}
		<section>
			<h2>Material Selection</h2>
			<p>
				Any material will do. A simple PLA can offer great results, but if you want the part to last
				longer, consider using ABS or ASA.
			</p>
			<p>If you're doing a screwless option, TPU is a very good choice.</p>
			<p>There is no need for a fiber filed filament.</p>
		</section>

		<section>
			<h2>Print parameters</h2>
			<p>A standard 0.4mm nozzle profile with 0.2mm layer height creates good results.</p>
			<p>If you want to explore, here are some things to consider:</p>
			<ul>
				<li>Line width should be relatively small, go finer for crispier teeth.</li>
				<li>Layer height doesn't affect the quality much.</li>
				<li>Increase wall loops for more durable parts (3 or more)</li>
				<li>Infill can be low, around 10-20%</li>
				<li>Standard top and bottom layers are fine (3-5)</li>
			</ul>
		</section>

		<section>
			<p>If you need more help, Send me a Note.</p>
		</section>
	{/snippet}

	{#snippet footer()}
		<button class="btn btn-primary" onclick={closeModal}>Enter the tool</button>
	{/snippet}
</Modal>

<style>
	:global(.modal-header h1) {
		margin: 0 0 var(--space-1) 0;
		font-size: var(--text-3xl);
		font-weight: 700;
		color: var(--color-primary-600);
	}

	:global(.modal-header h2) {
		margin: 0;
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--app-text-muted);
	}

	:global(.modal-header h3) {
		margin: 0;
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--app-text-muted);
	}

	section {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	section:last-child {
		background: var(--app-panel-bg);
		border: 1px solid var(--app-border);
		border-radius: var(--radius-lg);
		padding: var(--space-4);
		gap: var(--space-1);
	}

	h2 {
		margin: 0;
		font-size: var(--text-lg);
		font-weight: 600;
		color: var(--app-text);
		letter-spacing: -0.025em;
	}

	p {
		margin: 0;
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		color: var(--app-text);
	}

	ul {
		margin: var(--space-2) 0 0 var(--space-4);
		padding: 0;
		list-style: disc;
		color: var(--app-text);
	}

	li {
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		color: var(--app-text);
		margin-bottom: var(--space-1);
	}

	:global(.modal-footer) {
		justify-content: flex-end;
	}

	:global(.modal-footer .btn) {
		justify-content: center;
	}

	@media (max-width: 640px) {
		:global(.modal-header h1) {
			font-size: var(--text-xl);
		}

		:global(.modal-footer) {
			flex-direction: column;
		}

		:global(.modal-footer .btn) {
			width: 100%;
		}
	}
</style>
