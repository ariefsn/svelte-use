<script lang="ts">
	import { useConfirmDialog } from '$lib/state/useConfirmDialog.svelte.js';

	const dialog = useConfirmDialog<string>();

	let files = $state(['report.pdf', 'notes.md', 'photo.jpg']);
	let lastOutcome = $state<string | null>(null);

	async function remove(name: string) {
		const { isCanceled } = await dialog.reveal(name);
		if (isCanceled) {
			lastOutcome = `kept ${name}`;
			return;
		}
		files = files.filter((file) => file !== name);
		lastOutcome = `deleted ${name}`;
	}
</script>

<div class="demo-wrap">
	<div class="actions">
		{#each files as file (file)}
			<button onclick={() => remove(file)}>Delete {file}</button>
		{/each}
	</div>

	{#if files.length === 0}
		<p class="muted">Everything deleted.</p>
		<div class="actions">
			<button onclick={() => (files = ['report.pdf', 'notes.md', 'photo.jpg'])}>Reset</button>
		</div>
	{/if}

	<div class="row">
		<span class="label">last outcome</span>
		<span class="value accent">{lastOutcome ?? '—'}</span>
	</div>

	{#if dialog.isRevealed()}
		<div class="bg-surface border-border rounded-lg border p-3" role="dialog" aria-modal="true">
			<p class="m-0 mb-2 text-[0.85rem]">Delete <strong>{dialog.revealData()}</strong>?</p>
			<div class="actions">
				<button onclick={() => dialog.confirm()}>Delete</button>
				<button onclick={() => dialog.cancel()}>Keep</button>
			</div>
		</div>
	{/if}

	<p class="hint">
		The whole flow is one <span class="value accent">await</span> in the click handler — no flags threaded
		through callbacks. The markup is entirely yours; this only owns the state and the promise.
	</p>
</div>
