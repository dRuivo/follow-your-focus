<script lang="ts">
	import '../app.css';
	import { EXTERNAL_URLS } from '$lib/config';

	import favicon from '$lib/assets/favicon.svg';
	import IntroModal from '$lib/components/IntroModal.svelte';
	import FeedbackModal from '$lib/components/FeedbackModal.svelte';

	let feedbackOpen = $state(false);
	let introModalOpen = $state(true);
	let mobileMenuOpen = $state(false);

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
			<div class="brand-name">Follow Your Focus</div>
			<div class="brand-tag">Community tools</div>
		</div>

		<!-- Desktop Navigation -->
		<nav class="nav nav-desktop">
			<button class="nav-btn" type="button" onclick={() => (introModalOpen = true)}>About</button>
			<button class="nav-btn" type="button" onclick={() => (feedbackOpen = true)}>Feedback</button>
			<a class="nav-link" href={EXTERNAL_URLS.GITHUB_REPO} target="_blank" rel="noreferrer"
				>Source</a
			>
			<a class="nav-pill" href={EXTERNAL_URLS.BUY_ME_COFFEE} target="_blank" rel="noreferrer"
				>☕ Tip</a
			>
		</nav>

		<!-- Mobile Navigation -->
		<nav class="nav nav-mobile">
			<a class="nav-pill" href={EXTERNAL_URLS.BUY_ME_COFFEE} target="_blank" rel="noreferrer"
				>☕ Tip</a
			>
			<button
				class="hamburger"
				type="button"
				aria-label="Toggle menu"
				onclick={() => (mobileMenuOpen = !mobileMenuOpen)}
			>
				<svg
					class="hamburger-icon"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.5"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
					/>
				</svg>
			</button>
		</nav>

		<!-- Mobile Menu Dropdown -->
		{#if mobileMenuOpen}
			<div class="mobile-menu">
				<button
					class="mobile-menu-item"
					onclick={() => {
						introModalOpen = true;
						mobileMenuOpen = false;
					}}
				>
					About
				</button>
				<button
					class="mobile-menu-item"
					onclick={() => {
						feedbackOpen = true;
						mobileMenuOpen = false;
					}}
				>
					Feedback
				</button>
				<a
					class="mobile-menu-item"
					href={EXTERNAL_URLS.GITHUB_REPO}
					target="_blank"
					rel="noreferrer"
					onclick={() => (mobileMenuOpen = false)}
				>
					Source
				</a>
			</div>
		{/if}
	</header>
	<main class="app-content">
		{@render children()}
	</main>
	<footer class="app-footer">
		<div class="footer-row">
			<div class="footer-left">Built for the commons.</div>
			<div class="footer-right footer-nav">
				<div class="footer-meta">Code: CC BY-NC 4.0 · Outputs: CC BY 4.0 · v0.1.0</div>
			</div>
		</div>
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
		height: 100vh;
		overflow: hidden;
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
		overflow: hidden;
	}

	.brand-name {
		font-family: var(--font-heading);
		font-weight: 700;
		letter-spacing: -0.025em;
		line-height: 1.1;
		color: var(--app-text);
	}

	.brand-tag {
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

	.nav-desktop {
		display: flex;
	}

	.nav-mobile {
		display: none;
	}

	@media (max-width: 768px) {
		.nav-desktop {
			display: none;
		}

		.nav-mobile {
			display: flex;
		}

		.footer-nav {
			display: none; /* Hide only navigation part on mobile */
		}
	}

	.hamburger {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 32px;
		height: 32px;
		background: transparent;
		border: none;
		cursor: pointer;
		padding: var(--space-1);
		border-radius: var(--radius-md);
		transition: background-color 0.15s ease;
	}

	.hamburger:hover {
		background-color: var(--app-panel-bg);
	}

	.hamburger:focus-visible {
		outline: 2px solid var(--color-primary-500);
		outline-offset: 2px;
	}

	.hamburger-icon {
		width: 20px;
		height: 20px;
		color: var(--app-text);
		transition: color 0.15s ease;
	}

	.mobile-menu {
		position: absolute;
		top: 100%;
		right: var(--space-4);
		background-color: var(--app-bg);
		border: 1px solid var(--app-border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-lg);
		z-index: 50;
		min-width: 150px;
		overflow: hidden;
	}

	.mobile-menu-item {
		display: block;
		width: 100%;
		padding: var(--space-3) var(--space-4);
		text-align: left;
		background: transparent;
		border: none;
		color: var(--app-text);
		font-size: var(--text-sm);
		font-family: var(--font-body);
		cursor: pointer;
		transition: background-color 0.15s ease;
		text-decoration: none;
	}

	.mobile-menu-item:hover {
		background-color: var(--app-panel-bg);
	}

	.mobile-menu-item:focus-visible {
		outline: 2px solid var(--color-primary-500);
		outline-offset: -2px;
	}

	.nav-btn {
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

	.nav-btn:hover {
		background-color: var(--app-panel-bg);
	}

	.nav-btn:focus-visible {
		outline: 2px solid var(--color-primary-500);
		outline-offset: 2px;
	}

	.nav-link {
		text-decoration: none;
		color: var(--app-text);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius-lg);
		font-size: var(--text-sm);
		transition: all 0.15s ease;
	}

	.nav-link:hover {
		background-color: var(--app-panel-bg);
	}

	.nav-link:focus-visible {
		outline: 2px solid var(--color-primary-500);
		outline-offset: 2px;
	}

	.nav-pill {
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

	.nav-pill:hover {
		background-color: var(--color-warning-50);
		border-color: var(--color-warning-700);
		color: var(--color-warning-700);
	}

	.nav-pill:focus-visible {
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

	.footer-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-3);
		flex-wrap: wrap;
	}

	.footer-left {
		font-size: var(--text-sm);
		color: var(--app-text-muted);
	}

	.footer-right {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		flex-wrap: wrap;
		justify-content: flex-end;
	}

	.footer-meta {
		margin-top: var(--space-2);
		font-size: var(--text-xs);
		color: var(--app-text-muted);
	}

	@media (max-width: 520px) {
		.brand-tag {
			display: none;
		}
	}
</style>
