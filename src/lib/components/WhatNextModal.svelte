<script lang="ts">
	import { EXTERNAL_URLS } from '$lib/config';
	import Modal from './Modal.svelte';

	import { openModal } from '$lib/stores/modals';

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
		<h1>What's next</h1>
		<h2>This project is a living work in progress</h2>
		<h3>Here are some things I may work on next:</h3>
	{/snippet}

	{#snippet content()}
		<section>
			<h2>User Experience</h2>
			<ul>
				<li>Tutorial</li>
				<li>Preset saving and loading</li>
				<li>Healthy limits on parameters</li>
			</ul>
		</section>

		<section>
			<h2>Focus Ring Model</h2>
			<ul>
				<li>Text on inside</li>
				<li>Performance enhancements</li>
			</ul>
		</section>

		<section>
			<h2>How-to and Guides</h2>
			<ul>
				<li>How to measure the lens</li>
				<li>Printing guide</li>
			</ul>
		</section>

		<section>
			<h2>Hardware</h2>
			<p>Open Follow Focus system</p>
		</section>

		<section>
			<p>
				If you'd like to help, <button
					class="link-button"
					onclick={() => (closeModal(), openModal('feedback'))}>send me a note</button
				>.
			</p>
			<p>Another way would be by sharing it or leaving a tip:</p>
			<a href={EXTERNAL_URLS.BUY_ME_COFFEE} target="_blank" rel="noreferrer">☕ Buy Me a Coffee</a>
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

	section:last-child a {
		color: var(--color-warning-600);
		text-decoration: none;
		font-weight: 600;
		transition: all 0.2s ease;
		border-bottom: 2px solid transparent;
		padding-bottom: 2px;
		display: inline;
		width: fit-content;
	}

	section:last-child a:hover {
		color: var(--color-warning-700);
		border-bottom-color: var(--color-warning-600);
	}

	section:last-child a:focus-visible {
		outline: 2px solid var(--color-warning-600);
		outline-offset: 2px;
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

	.link-button {
		background: none;
		border: none;
		padding: 0;
		color: var(--color-primary-600);
		cursor: pointer;
		font-weight: 600;
		text-decoration: underline;
		transition: color 0.2s ease;
	}

	.link-button:hover {
		color: var(--color-primary-700);
	}

	.link-button:focus-visible {
		outline: 2px solid var(--color-primary-600);
		outline-offset: 2px;
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
