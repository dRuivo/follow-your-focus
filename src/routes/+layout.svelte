<script lang="ts">
	import '../app.css';
	import { EXTERNAL_URLS } from '$lib/config';

	import favicon from '$lib/assets/favicon.svg';
	import IntroModal from '$lib/components/IntroModal.svelte';
	import FeedbackModal from '$lib/components/FeedbackModal.svelte';

	let feedbackOpen = $state(false);
	let introModalOpen = $state(true);

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<IntroModal bind:isOpen={introModalOpen} />
<FeedbackModal bind:isOpen={feedbackOpen} />

<div class="app-wrapper">
	<header class="app-header">
		<div class="brand">
			<div class="brand__name">Follow Your Focus</div>
			<div class="brand__tag">Community tools</div>
		</div>

		<nav class="nav">
			<button class="nav__btn" type="button" onclick={() => (introModalOpen = true)}>About</button>
			<button class="nav__btn" type="button" onclick={() => (feedbackOpen = true)}>Feedback</button>
			<a class="nav__link" href={EXTERNAL_URLS.GITHUB_REPO} target="_blank" rel="noreferrer"
				>Source</a
			>
			<a class="nav__pill" href={EXTERNAL_URLS.BUY_ME_COFFEE} target="_blank" rel="noreferrer"
				>☕ Tip</a
			>
		</nav>
	</header>
	<main class="app-content">
		{@render children()}
	</main>
	<footer class="app-footer">
		<div class="footer__row">
			<div class="footer__left">Built for the commons.</div>
			<div class="footer__right">
				<button class="footer__btn" type="button" onclick={() => (introModalOpen = true)}>
					About
				</button>
				<span class="dot">·</span>
				<a class="footer__link" href={EXTERNAL_URLS.GITHUB_REPO} target="_blank" rel="noreferrer"
					>Source</a
				>
				<span class="dot">·</span>
				<button class="footer__btn" type="button" onclick={() => (feedbackOpen = true)}
					>Feedback</button
				>
			</div>
		</div>

		<div class="footer__meta">Code: CC BY-NC 4.0 · Outputs: CC BY 4.0 · v0.1.0</div>
	</footer>
</div>

<style>
	:global(html),
	:global(body) {
		height: 100%;
		margin: 0;
	}

	.app-wrapper {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	.app-header {
		position: sticky;
		top: 0;
		z-index: 20;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		padding: var(--space-3) var(--space-4);
		border-bottom: 1px solid var(--app-border);
		background-color: var(--app-header-bg);
		backdrop-filter: blur(8px);
		flex-shrink: 0;
	}

	.app-content {
		flex: 1;
	}

	.brand__name {
		font-family: var(--font-heading);
		font-weight: 700;
		letter-spacing: -0.025em;
		line-height: 1.1;
		color: var(--app-text);
	}

	.brand__tag {
		font-size: var(--text-xs);
		color: var(--app-text-muted);
		margin-top: var(--space-1);
	}

	.nav {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		flex-wrap: wrap;
		justify-content: flex-end;
	}

	.nav__btn,
	.footer__btn {
		appearance: none;
		border: none;
		background: transparent;
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-lg);
		cursor: pointer;
		font-family: var(--font-body);
		font-size: var(--text-sm);
		color: var(--app-text);
		transition: all 0.15s ease;
	}

	.nav__btn:hover,
	.footer__btn:hover {
		background-color: var(--app-panel-bg);
	}

	.nav__btn:focus-visible,
	.footer__btn:focus-visible {
		outline: 2px solid var(--color-primary-500);
		outline-offset: 2px;
	}

	.nav__link,
	.footer__link {
		text-decoration: none;
		color: var(--app-text);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-lg);
		font-size: var(--text-sm);
		transition: all 0.15s ease;
	}

	.nav__link:hover,
	.footer__link:hover {
		background-color: var(--app-panel-bg);
	}

	.nav__link:focus-visible,
	.footer__link:focus-visible {
		outline: 2px solid var(--color-primary-500);
		outline-offset: 2px;
	}

	.nav__pill {
		text-decoration: none;
		color: var(--color-warning-600);
		padding: var(--space-1) var(--space-3);
		border-radius: var(--radius-full);
		border: 1px solid var(--color-warning-600);
		background-color: var(--app-bg);
		font-size: var(--text-sm);
		font-weight: 600;
		transition: all 0.15s ease;
	}

	.nav__pill:hover {
		background-color: var(--color-warning-50);
		border-color: var(--color-warning-700);
		color: var(--color-warning-700);
	}

	.nav__pill:focus-visible {
		outline: 2px solid var(--color-warning-600);
		outline-offset: 2px;
	}

	.app-footer {
		border-top: 1px solid var(--app-border);
		padding: var(--space-3) var(--space-4);
		background-color: var(--app-header-bg);
		backdrop-filter: blur(8px);
		flex-shrink: 0;
	}

	.footer__row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		flex-wrap: wrap;
	}

	.footer__left {
		font-size: var(--text-sm);
		color: var(--app-text-muted);
	}

	.footer__right {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		flex-wrap: wrap;
		justify-content: flex-end;
	}

	.dot {
		color: var(--app-border);
	}

	.footer__meta {
		margin-top: var(--space-2);
		font-size: var(--text-xs);
		color: var(--app-text-muted);
	}

	@media (max-width: 520px) {
		.brand__tag {
			display: none;
		}
	}
</style>
