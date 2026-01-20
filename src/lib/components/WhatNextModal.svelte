<script lang="ts">
	import { onMount } from 'svelte';
	import { EXTERNAL_URLS } from '$lib/config';

	let { isOpen = $bindable(false), onClose = () => {} } = $props();

	let dialogElement: HTMLDialogElement | undefined;

	function closeModal() {
		isOpen = false;
		onClose();
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === dialogElement) {
			closeModal();
		}
	}

	// Watch for isOpen changes
	$effect(() => {
		if (!dialogElement) return;

		if (isOpen) {
			try {
				// Force display first
				dialogElement.style.display = 'block';

				if (typeof dialogElement.showModal === 'function') {
					dialogElement.showModal();
				} else {
					dialogElement.setAttribute('open', '');
				}

				// Focus the primary button after a short delay
				setTimeout(() => {
					const primaryBtn = dialogElement?.querySelector(
						'.modal-footer .btn-primary'
					) as HTMLButtonElement;
					primaryBtn?.focus({ preventScroll: true });
				}, 100);
			} catch (error) {
				console.error('Error opening IntroModal:', error);
			}
		} else {
			try {
				if (typeof dialogElement.close === 'function') {
					dialogElement.close();
				} else {
					dialogElement.removeAttribute('open');
				}
				// Reset display
				dialogElement.style.display = '';
			} catch (error) {
				console.error('Error closing IntroModal:', error);
			}
		}
	});

	onMount(() => {
		// Handle Escape key
		const handleKeydown = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				closeModal();
			}
		};

		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});
</script>

<dialog
	bind:this={dialogElement}
	onclick={handleBackdropClick}
	oncancel={() => closeModal()}
	class="intro-modal"
	aria-labelledby="intro-modal-title"
	aria-describedby="intro-modal-content"
>
	<div class="modal-overlay">
		<div class="modal-content">
			<div class="modal-header">
				<h1 id="intro-modal-title">What`s next</h1>
				<h2>This project is a living work in progress</h2>
				<h3>Here are some things I may work on next:</h3>
			</div>

			<div id="intro-modal-content" class="modal-body">
				<section class="modal-section">
					<h2>User Experience</h2>
					<ul class="modal-list">
						<li>Simpler parameter selection</li>
						<li>Preset saving and loading</li>
						<li>Tooltip for parameters</li>
						<li>Healthy limits on parameters</li>
					</ul>
				</section>

				<section class="modal-section">
					<h2>Focus Ring Model</h2>
					<ul class="modal-list">
						<li>Text on inside</li>
						<li>Performance enhancements</li>
					</ul>
				</section>

				<section class="modal-section">
					<h2>How-to and Guides</h2>
					<ul class="modal-list">
						<li>How to measure the lens</li>
						<li>Printing guide</li>
					</ul>
				</section>

				<section class="modal-section">
					<h2>Hardware</h2>
					<p>Open Follow Focus system</p>
				</section>
			</div>

			<div class="modal-footer">
				<div>
					<p>If you'd like to help, send me a Note.</p>
					<p>Another way would be by sharing it or leaving a tip:</p>
					<a href={EXTERNAL_URLS.BUY_ME_COFFEE} target="_blank" rel="noreferrer"
						>☕ Buy Me a Coffee</a
					>
				</div>
				<button class="btn btn-primary" onclick={() => closeModal()}>Enter the tool</button>
			</div>
		</div>
	</div>
</dialog>

<style>
	.intro-modal {
		border: none;
		border-radius: var(--radius-xl);
		padding: 0;
		max-width: 600px;
		width: 90vw;
		min-height: 80vh;
		max-height: 95vh;
		box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
		background: var(--app-bg);
		color: var(--app-text);
	}

	/* Ensure the dialog is always visible when open */
	.intro-modal[open] {
		display: block !important;
		position: fixed !important;
		left: 50% !important;
		top: 50% !important;
		transform: translate(-50%, -50%) !important;
		z-index: 1000 !important;
		visibility: visible !important;
		opacity: 1 !important;
	}

	/* Fallback for browsers that support :modal */
	.intro-modal:modal {
		display: block !important;
		position: fixed !important;
		left: 50% !important;
		top: 50% !important;
		transform: translate(-50%, -50%) !important;
		z-index: 1000 !important;
	}

	.intro-modal::backdrop {
		background-color: rgb(0 0 0 / 0.5);
		backdrop-filter: blur(4px);
	}

	.modal-overlay {
		display: flex;
		flex-direction: column;
		height: 100%;
		width: 100%;
	}

	.modal-content {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.modal-header {
		padding: var(--space-6);
		border-bottom: 1px solid var(--app-border);
		background-color: var(--app-header-bg);
		flex-shrink: 0;
	}

	.modal-header h1 {
		margin: 0 0 var(--space-1) 0;
		font-size: var(--text-3xl);
		font-weight: 700;
		color: var(--color-primary-600);
	}

	.modal-header h2 {
		margin: 0;
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--app-text-muted);
		font-family: var(--font-body);
		letter-spacing: 0;
	}

	.modal-header h3 {
		margin: 0;
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--app-text-muted);
		font-family: var(--font-body);
		letter-spacing: 0;
	}

	.modal-body {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-6);
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	.modal-section {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.modal-section h2 {
		margin: 0;
		font-size: var(--text-lg);
		font-weight: 600;
		color: var(--app-text);
		font-family: var(--font-heading);
		letter-spacing: -0.025em;
	}

	.modal-section p {
		margin: 0;
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		color: var(--app-text);
	}

	.modal-list {
		margin: var(--space-2) 0 0 var(--space-4);
		padding: 0;
		list-style: disc;
		color: var(--app-text);
	}

	.modal-list li {
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		color: var(--app-text);
		margin-bottom: var(--space-1);
	}

	.modal-footer {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
		padding: var(--space-6);
		border-top: 1px solid var(--app-border);
		background-color: var(--app-header-bg);
		flex-shrink: 0;
		align-items: flex-start;
	}

	.modal-footer > div {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
		width: 100%;
	}

	.modal-footer .btn {
		align-self: flex-end;
	}

	@media (max-width: 640px) {
		.intro-modal {
			width: 95vw;
			max-height: 85vh;
		}

		.modal-header {
			padding: var(--space-4);
		}

		.modal-header h1 {
			font-size: var(--text-xl);
		}

		.modal-body {
			padding: var(--space-4);
			gap: var(--space-4);
		}

		.modal-footer {
			flex-direction: column;
			padding: var(--space-4);
		}

		.modal-footer .btn {
			width: 100%;
		}
	}
</style>
