<script lang="ts">
	import { EXTERNAL_URLS } from '$lib/config';
	import Modal from './Modal.svelte';

	let {
		isOpen = $bindable(false),
		onClose = (): void => {}
	}: { isOpen?: boolean; onClose?: () => void } = $props();

	function openGitHub() {
		window.open(EXTERNAL_URLS.GITHUB_REPO, '_blank');
	}

	function closeModal() {
		isOpen = false;
		onClose();
	}
</script>

<Modal bind:isOpen {onClose}>
	{#snippet header()}
		<h1>Follow Your Focus</h1>
		<h2>Community tools</h2>
	{/snippet}

	{#snippet content()}
		<section class="modal-section">
			<h2>Welcome to the Commons</h2>
			<p>
				This tool exists to make filmmaking equipment more accessible, repairable, and shareable.
			</p>
			<p>
				Generate custom follow focus rings locally—adapted to your lenses—without subscriptions,
				accounts, or lock-in.
			</p>
		</section>

		<section class="modal-section">
			<h2>Why this exists</h2>
			<p>Technical tools should serve people, not extract value from them</p>
			<p>
				Professional gear is often overpriced, proprietary, or designed to be replaced rather than
				repaired.
			</p>
			<p>This tool is an alternative:</p>
			<ul class="modal-list">
				<li>fabricate locally</li>
				<li>adapt instead of discard</li>
				<li>share knowledge instead of extracting value</li>
			</ul>
		</section>

		<section class="modal-section">
			<h2>Values note</h2>
			<p>
				We ask that this tool be used in ways that support learning, creativity, and community. It
				is not intended for surveillance, coercion, or extractive practices.
			</p>
		</section>

		<section class="modal-section">
			<h2>Sharing & attribution</h2>
			<p>You're free to use the generated STL files commercially.</p>
			<p>If you share or sell prints, please credit where the tool came from (a link is enough).</p>
		</section>

		<section class="modal-section">
			<h2>Support</h2>
			<p>This project is free forever. If it helps you, consider sharing it or leaving a tip:</p>
			<a href={EXTERNAL_URLS.BUY_ME_COFFEE} target="_blank" rel="noreferrer">☕ Buy Me a Coffee</a>
		</section>
	{/snippet}

	{#snippet footer()}
		<div class="modal-actions">
			<button class="btn btn-secondary" onclick={openGitHub}>View on GitHub</button>
			<button class="btn btn-primary" onclick={closeModal}>Enter the tool</button>
		</div>
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

	section {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
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

	p + p {
		margin-top: var(--space-3);
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

	a {
		color: var(--color-warning-600);
		text-decoration: none;
		font-weight: 600;
		transition: all 0.2s ease;
		border-bottom: 2px solid transparent;
		padding-bottom: 2px;
	}

	a:hover {
		color: var(--color-warning-700);
		border-bottom-color: var(--color-warning-600);
	}

	a:focus-visible {
		outline: 2px solid var(--color-warning-600);
		outline-offset: 2px;
	}

	:global(.modal-footer) {
		justify-content: flex-end;
		align-items: center;
		flex-wrap: nowrap;
	}

	.modal-actions {
		display: flex;
		gap: var(--space-3);
		width: 100%;
	}

	.modal-actions .btn {
		flex: 1;
		min-height: var(--button-height-md);
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
