<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';

	interface Props {
		isOpen?: boolean;
		onClose?: () => void;
		header?: Snippet;
		content?: Snippet;
		footer?: Snippet;
	}

	let { isOpen = $bindable(false), onClose = () => {}, header, content, footer }: Props = $props();

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

	// Handle dialog open/close
	$effect(() => {
		if (!dialogElement) return;

		if (isOpen) {
			if (typeof dialogElement.showModal === 'function') {
				dialogElement.showModal();
			} else {
				// Safari fallback
				dialogElement.setAttribute('open', '');
			}
			// Focus first button after open
			setTimeout(() => {
				const primaryBtn = dialogElement?.querySelector(
					'.modal-footer .btn-primary'
				) as HTMLButtonElement;
				primaryBtn?.focus({ preventScroll: true });
			}, 100);
		} else {
			if (typeof dialogElement.close === 'function') {
				dialogElement.close();
			} else {
				// Safari fallback
				dialogElement.removeAttribute('open');
			}
		}
	});

	onMount(() => {
		const handleKeydown = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				closeModal();
			}
		};

		window.addEventListener('keydown', handleKeydown);
		return () => window.removeEventListener('keydown', handleKeydown);
	});
</script>

<dialog bind:this={dialogElement} class="modal" aria-modal="true" onclick={handleBackdropClick}>
	<div class="modal-overlay">
		<div class="modal-content">
			{#if header}
				<div class="modal-header">
					{@render header()}
				</div>
			{/if}

			{#if content}
				<div class="modal-body">
					{@render content()}
				</div>
			{/if}

			{#if footer}
				<div class="modal-footer">
					{@render footer()}
				</div>
			{/if}
		</div>
	</div>
</dialog>

<style>
	.modal {
		border: none;
		border-radius: var(--radius-xl);
		padding: 0;
		max-width: 600px;
		width: 90vw;
		max-height: 95vh;
		box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
		background: var(--app-bg);
		color: var(--app-text);
	}

	.modal[open] {
		display: block !important;
		position: fixed !important;
		left: 50% !important;
		top: 50% !important;
		transform: translate(-50%, -50%) !important;
		z-index: 10000 !important;
		visibility: visible !important;
		opacity: 1 !important;
	}

	.modal:modal {
		display: block !important;
		position: fixed !important;
		left: 50% !important;
		top: 50% !important;
		transform: translate(-50%, -50%) !important;
		z-index: 1000 !important;
	}

	.modal::backdrop {
		background-color: rgb(0 0 0 / 0.5);
		backdrop-filter: blur(4px);
	}

	.modal-overlay {
		display: flex;
		flex-direction: column;
		height: auto;
		width: 100%;
	}

	.modal-content {
		display: flex;
		flex-direction: column;
		height: auto;
	}

	.modal-header {
		padding: var(--space-6);
		border-bottom: 1px solid var(--app-border);
		background-color: var(--app-header-bg);
		flex-shrink: 0;
	}

	.modal-body {
		flex: 1;
		overflow-y: auto;
		padding: var(--space-6);
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	.modal-footer {
		padding: var(--space-6);
		border-top: 1px solid var(--app-border);
		background-color: var(--app-header-bg);
		flex-shrink: 0;
		display: flex;
		gap: var(--space-3);
		justify-content: flex-end;
	}

	@media (max-width: 640px) {
		.modal {
			width: 95vw;
			max-height: 90vh;
		}

		.modal-header {
			padding: var(--space-4);
		}

		.modal-body {
			padding: var(--space-4);
		}

		.modal-footer {
			padding: var(--space-4);
		}
	}
</style>
