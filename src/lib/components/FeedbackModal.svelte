<script lang="ts">
	import Modal from './Modal.svelte';

	let {
		isOpen = $bindable(false),
		onClose = (): void => {}
	}: { isOpen?: boolean; onClose?: () => void } = $props();

	let isSubmitting = $state(false);
	let submitError = $state('');
	let submitSuccess = $state(false);

	let formData = $state({
		name: '',
		email: '',
		message: ''
	});

	function closeModal() {
		isOpen = false;
		resetForm();
		onClose();
	}

	function resetForm() {
		formData = { name: '', email: '', message: '' };
		submitError = '';
		submitSuccess = false;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		isSubmitting = true;
		submitError = '';
		submitSuccess = false;

		try {
			const response = await fetch('/api/feedback', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData)
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || 'Failed to submit feedback');
			}

			submitSuccess = true;
		} catch (error) {
			submitError = error instanceof Error ? error.message : 'An error occurred';
		} finally {
			isSubmitting = false;
		}
	}
</script>

<Modal bind:isOpen {onClose}>
	{#snippet header()}
		<h1>Leave a note for the maker</h1>
		<p class="subtitle">
			My name is Diogo, and I'm the creator of Follow Your Focus.<br />
			I'd love to hear your thoughts! <br />
			Tell me what's working, what's confusing, or what you wish was different.
		</p>
	{/snippet}

	{#snippet content()}
		{#if submitSuccess}
			<div class="alert alert-success">
				<p>✓ Thank you! Your note has been sent successfully.</p>
				{#if !formData.email}
					<p class="alert-meta">You submitted anonymously.</p>
				{:else}
					<p class="alert-meta">A confirmation email has been sent to {formData.email}</p>
				{/if}
			</div>
		{:else}
			<form onsubmit={handleSubmit}>
				<div class="form-group">
					<label for="name">Name <span class="text-muted">(optional)</span></label>
					<input
						type="text"
						id="name"
						bind:value={formData.name}
						placeholder="Your name"
						disabled={isSubmitting}
					/>
				</div>

				<div class="form-group">
					<label for="email"
						>Email <span class="text-muted">(optional, if you want a reply)</span></label
					>
					<input
						type="email"
						id="email"
						bind:value={formData.email}
						placeholder="your@email.com"
						disabled={isSubmitting}
					/>
				</div>

				<div class="guidance-section">
					<h3>Some questions you may want to answer:</h3>
					<ol>
						<li>What were you hoping to do?</li>
						<li>What surprised or frustrated you?</li>
						<li>Anything else you'd like me to know?</li>
					</ol>
				</div>

				<div class="form-group">
					<label for="message">Note</label>
					<textarea
						id="message"
						bind:value={formData.message}
						placeholder="Your note..."
						required
						disabled={isSubmitting}
						rows="5"
					></textarea>
				</div>

				{#if submitError}
					<div class="alert alert-error">
						<p>✗ {submitError}</p>
					</div>
				{/if}

				<div class="footer-content">
					<p>
						I read everything and genuinely appreciate your thoughts. I can't reply to everything or
						implement every idea, but your feedback shapes what I build next.
					</p>
				</div>

				<div class="modal-actions">
					<button type="submit" class="btn btn-primary" disabled={isSubmitting}>
						{isSubmitting ? 'Sending...' : 'Send Note'}
					</button>
					<button
						type="button"
						class="btn btn-secondary"
						onclick={() => closeModal()}
						disabled={isSubmitting}
					>
						Cancel
					</button>
				</div>
			</form>
		{/if}
	{/snippet}
</Modal>

<style>
	:global(.modal-header h1) {
		margin: 0 0 var(--space-2) 0;
		font-size: var(--text-3xl);
		font-weight: 700;
		color: var(--color-primary-600);
	}

	.subtitle {
		margin: 0;
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		color: var(--app-text-muted);
	}

	form {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.form-group label {
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--app-text);
		letter-spacing: -0.01em;
	}

	.text-muted {
		color: var(--app-text-muted);
		font-weight: 400;
	}

	input,
	textarea {
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--app-text);
		background-color: var(--app-bg);
		border: 1px solid var(--app-border);
		border-radius: var(--radius-lg);
		padding: var(--space-3) var(--space-4);
		transition: all 0.2s ease;
		outline: none;
		box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
	}

	input:hover:not(:focus),
	textarea:hover:not(:focus) {
		border-color: var(--color-neutral-300);
	}

	input:focus,
	textarea:focus {
		border-color: var(--color-primary-500);
		box-shadow: 0 0 0 3px rgb(45 140 75 / 0.1);
	}

	input:disabled,
	textarea:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.guidance-section {
		background: var(--app-panel-bg);
		border: 1px solid var(--app-border);
		border-radius: var(--radius-lg);
		padding: var(--space-4);
	}

	.guidance-section h3 {
		margin: 0 0 var(--space-3) 0;
		font-size: var(--text-base);
		font-weight: 600;
		color: var(--app-text);
	}

	.guidance-section ol {
		margin: 0;
		padding-left: var(--space-6);
		color: var(--app-text);
	}

	.guidance-section li {
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		color: var(--app-text);
		margin-bottom: var(--space-2);
	}

	.guidance-section li:last-child {
		margin-bottom: 0;
	}

	.alert {
		padding: var(--space-4);
		border-radius: var(--radius-lg);
		border: 1px solid;
	}

	.alert p {
		margin: 0;
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
	}

	.alert-meta {
		margin-top: var(--space-2) !important;
		font-size: var(--text-xs) !important;
		opacity: 0.9;
	}

	.alert-success {
		background-color: var(--color-success-50);
		color: var(--color-success-700);
		border-color: var(--color-success-200);
	}

	.alert-error {
		background-color: var(--color-error-50);
		color: var(--color-error-700);
		border-color: var(--color-error-200);
	}

	.footer-content {
		background: var(--app-panel-bg);
		border-radius: var(--radius-lg);
		padding: var(--space-4);
	}

	.footer-content p {
		margin: 0 0 var(--space-2) 0;
		font-size: var(--text-sm);
		line-height: var(--leading-relaxed);
		color: var(--app-text);
	}

	.footer-content p:last-child {
		margin-bottom: 0;
	}

	.modal-actions {
		display: flex;
		gap: var(--space-3);
		padding-top: var(--space-4);
		border-top: 1px solid var(--app-border);
	}

	.modal-actions .btn {
		flex: 1;
		min-height: var(--button-height-md);
		justify-content: center;
	}

	@media (max-width: 640px) {
		:global(.modal-header h1) {
			font-size: var(--text-2xl);
		}

		.modal-actions {
			flex-direction: column;
			padding-top: var(--space-4);
		}
	}
</style>
