<script lang="ts">
	import { resolve } from '$app/paths';
	import { useNavigationGuard } from '$lib';

	let draft = $state('');
	let saved = $state('');
	let showDialog = $state(false);

	const hasUnsavedChanges = $derived(draft !== saved);

	const { confirm, cancel } = useNavigationGuard({
		shouldBlock: () => hasUnsavedChanges,
		onBlock: () => (showDialog = true)
	});

	function save() {
		saved = draft;
	}

	function leave() {
		showDialog = false;
		confirm();
	}

	function stay() {
		showDialog = false;
		cancel();
	}
</script>

<div class="demo-root">
	<label class="field">
		<span class="field-label">Draft note</span>
		<textarea bind:value={draft} rows="2" placeholder="Type something, then try the link below…"
		></textarea>
	</label>

	<div class="status" class:dirty={hasUnsavedChanges}>
		<span class="dot"></span>
		<span>
			{hasUnsavedChanges ? 'Unsaved changes — navigation is guarded' : 'No unsaved changes'}
		</span>
	</div>

	<div class="actions">
		<button onclick={save} disabled={!hasUnsavedChanges}>Save</button>
		<a class="try-link" href={resolve('/docs/[slug]', { slug: 'use-fetch' })}>
			Try navigating to useFetch →
		</a>
	</div>

	{#if showDialog}
		<div class="dialog" role="alertdialog" aria-label="Unsaved changes">
			<p class="dialog-title">Leave without saving?</p>
			<p class="dialog-body">Navigation was blocked because the draft has unsaved changes.</p>
			<div class="dialog-actions">
				<button class="danger" onclick={leave}>Leave anyway</button>
				<button onclick={stay}>Stay here</button>
			</div>
		</div>
	{/if}

	<p class="hint">
		Save first and the link navigates normally. Leave the draft dirty and the guard intercepts it.
	</p>
</div>

<style>
	.demo-root {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}
	.field-label {
		font-size: 0.78rem;
		color: #666;
		font-family: monospace;
	}
	textarea {
		width: 100%;
		padding: 0.6rem 0.7rem;
		background: #0d0d0d;
		border: 1px solid #262626;
		border-radius: 8px;
		color: #ddd;
		font-size: 0.9rem;
		font-family: inherit;
		line-height: 1.5;
		resize: vertical;
	}
	textarea:focus {
		outline: none;
		border-color: #a78bfa;
	}
	.status {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.55rem 0.85rem;
		border-radius: 8px;
		border: 1px solid #166534;
		background: #0f2e1f;
		color: #4ade80;
		font-size: 0.86rem;
		width: fit-content;
	}
	.status.dirty {
		border-color: #92400e;
		background: #2a1e0f;
		color: #fbbf24;
	}
	.dot {
		width: 9px;
		height: 9px;
		border-radius: 50%;
		background: currentColor;
		flex-shrink: 0;
	}
	.actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}
	button {
		padding: 0.4rem 0.8rem;
		background: #1a1a1a;
		border: 1px solid #333;
		border-radius: 6px;
		color: #ccc;
		font-size: 0.85rem;
		cursor: pointer;
	}
	button:disabled {
		opacity: 0.45;
		cursor: default;
	}
	button:not(:disabled):hover {
		border-color: #555;
	}
	button.danger {
		border-color: #92400e;
		color: #fbbf24;
	}
	.try-link {
		font-size: 0.85rem;
		color: #a78bfa;
		text-decoration: none;
	}
	.try-link:hover {
		text-decoration: underline;
	}
	.dialog {
		padding: 0.85rem 1rem;
		border: 1px solid #92400e;
		border-radius: 8px;
		background: #1a1208;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	.dialog-title {
		margin: 0;
		font-size: 0.92rem;
		font-weight: 600;
		color: #fbbf24;
	}
	.dialog-body {
		margin: 0;
		font-size: 0.84rem;
		color: #a18a5f;
		line-height: 1.5;
	}
	.dialog-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 0.3rem;
	}
	.hint {
		margin: 0;
		font-size: 0.82rem;
		color: #666;
		font-style: italic;
		line-height: 1.5;
	}
</style>
