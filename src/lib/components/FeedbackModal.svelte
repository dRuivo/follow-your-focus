<script lang="ts">
	import { EXTERNAL_URLS } from '$lib/config';

	export let isOpen = false;
	export let onClose: () => void = () => {};

	let dialogElement: HTMLDialogElement;

	function closeModal() {
		isOpen = false;
		onClose();
	}

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === dialogElement) {
			closeModal();
		}
	}

	$: if (dialogElement && isOpen) {
		if (typeof dialogElement.showModal === 'function') {
			dialogElement.showModal();
		} else {
			dialogElement.setAttribute('open', '');
		}
		// Focus the primary button
		setTimeout(() => {
			const primaryBtn = dialogElement?.querySelector(
				'.modal-footer .btn-primary'
			) as HTMLButtonElement;
			primaryBtn?.focus();
		}, 0);
	}

	$: if (dialogElement && !isOpen) {
		if (typeof dialogElement.close === 'function') {
			dialogElement.close();
		} else {
			dialogElement.removeAttribute('open');
		}
	}

	function openGitHub() {
		window.open(EXTERNAL_URLS.GITHUB_REPO, '_blank');
	}
</script>

<dialog
	bind:this={dialogElement}
	onclick={handleBackdropClick}
	oncancel={() => closeModal()}
	class="feedback-modal"
	aria-labelledby="feedback-modal-title"
	aria-describedby="feedback-modal-content"
>
	<div class="modal-overlay">
		<div class="modal-content">
			<div class="modal-header">
				<h1 id="feedback-modal-title">Feedback</h1>
			</div>

			<div id="feedback-modal-content" class="modal-body">
				<section class="modal-section">
					<h2>Work in Progress</h2>
					<p>
						A dedicated feedback form is coming soon. For now, we'd appreciate your input through
						GitHub issues.
					</p>
				</section>

				<section class="modal-section">
					<h2>How to Share Feedback</h2>
					<p>
						Head over to the <a href={EXTERNAL_URLS.GITHUB_REPO} target="_blank" rel="noreferrer"
							>GitHub repository</a
						> and open an issue with your feedback, bug reports, or feature requests.
					</p>
				</section>

				<section class="modal-section">
					<h2>What We're Looking For</h2>
					<ul class="modal-list">
						<li>Bug reports and issues</li>
						<li>Feature suggestions</li>
						<li>Design improvements</li>
						<li>Documentation improvements</li>
						<li>General feedback</li>
					</ul>
				</section>
			</div>

			<div class="modal-footer">
				<button class="btn btn-secondary" onclick={() => closeModal()}>Close</button>
				<button class="btn btn-primary" onclick={openGitHub}>Open GitHub Issues</button>
			</div>
		</div>
	</div>
</dialog>

<style>
	.feedback-modal {
		border: none;
		border-radius: var(--radius-xl);
		padding: 0;
		max-width: 600px;
		width: 90vw;
		max-height: 90vh;
		box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
		background: var(--app-bg);
		color: var(--app-text);
		display: none;
		position: fixed;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		z-index: 1000;
	}

	.feedback-modal[open],
	.feedback-modal:modal {
		display: flex;
	}

	.feedback-modal::backdrop {
		background-color: rgb(0 0 0 / 0.5);
		backdrop-filter: blur(4px);
	}

	.modal-overlay {
		display: flex;
		flex-direction: column;
		height: 100%;
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
		margin: 0;
		font-size: var(--text-2xl);
		font-weight: 700;
		color: var(--color-primary-600);
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

	.modal-section a {
		color: var(--color-primary-600);
		text-decoration: none;
		font-weight: 600;
		transition: all 0.2s ease;
		border-bottom: 2px solid transparent;
		padding-bottom: 2px;
	}

	.modal-section a:hover {
		color: var(--color-primary-700);
		border-bottom-color: var(--color-primary-600);
	}

	.modal-section a:focus-visible {
		outline: 2px solid var(--color-primary-600);
		outline-offset: 2px;
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

	@media (max-width: 640px) {
		.feedback-modal {
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
