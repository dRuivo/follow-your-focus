<script lang="ts">
	import { onMount, tick } from 'svelte';
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
		console.log('IntroModal effect triggered, isOpen:', isOpen, 'dialogElement:', !!dialogElement);
		if (!dialogElement) return;

		if (isOpen) {
			try {
				console.log('Attempting to open IntroModal');
				// Force display first
				dialogElement.style.display = 'block';

				if (typeof dialogElement.showModal === 'function') {
					dialogElement.showModal();
					console.log('showModal() called successfully');
				} else {
					dialogElement.setAttribute('open', '');
					console.log('set open attribute');
				}

				// Focus the primary button after a short delay
				setTimeout(() => {
					const primaryBtn = dialogElement?.querySelector(
						'.modal-footer .btn-primary'
					) as HTMLButtonElement;
					primaryBtn?.focus();
				}, 100);
			} catch (error) {
				console.error('Error opening IntroModal:', error);
			}
		} else {
			try {
				console.log('Attempting to close IntroModal');
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

	function openGitHub() {
		window.open(EXTERNAL_URLS.GITHUB_REPO, '_blank');
	}
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
				<h1 id="intro-modal-title">Follow Your Focus</h1>
				<h2>Community tools</h2>
			</div>

			<div id="intro-modal-content" class="modal-body">
				<section class="modal-section">
					<h2>Welcome to the Commons</h2>
					<p>
						This tool exists to make filmmaking equipment more accessible, repairable, and
						shareable.
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
						Professional gear is often overpriced, proprietary, or designed to be replaced rather
						than repaired.
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
						We ask that this tool be used in ways that support learning, creativity, and community.
						It is not intended for surveillance, coercion, or extractive practices.
					</p>
				</section>

				<section class="modal-section">
					<h2>Sharing & attribution</h2>
					<p>You're free to use the generated STL files commercially.</p>
					<p>
						If you share or sell prints, please credit where the tool came from (a link is enough).
					</p>
				</section>

				<section class="modal-section">
					<h2>Support</h2>
					<p>
						This project is free forever. If it helps you, consider sharing it or leaving a tip:
					</p>
					<a href={EXTERNAL_URLS.BUY_ME_COFFEE} target="_blank" rel="noreferrer"
						>☕ Buy Me a Coffee</a
					>
				</section>
			</div>

			<div class="modal-footer">
				<button class="btn btn-secondary" onclick={openGitHub}>View on GitHub</button>
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
		font-size: var(--text-2xl);
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

	.modal-section p + p {
		margin-top: var(--space-3);
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
		gap: var(--space-3);
		padding: var(--space-6);
		border-top: 1px solid var(--app-border);
		background-color: var(--app-header-bg);
		flex-shrink: 0;
		justify-content: flex-end;
	}

	.modal-footer .btn {
		min-width: 150px;
		justify-content: center;
	}

	.modal-section a {
		color: var(--color-warning-600);
		text-decoration: none;
		font-weight: 600;
		transition: all 0.2s ease;
		border-bottom: 2px solid transparent;
		padding-bottom: 2px;
	}

	.modal-section a:hover {
		color: var(--color-warning-700);
		border-bottom-color: var(--color-warning-600);
	}

	.modal-section a:focus-visible {
		outline: 2px solid var(--color-warning-600);
		outline-offset: 2px;
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
