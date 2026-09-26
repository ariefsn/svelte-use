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

<div class="demo-wrap">
	<label class="flex flex-col gap-1.5">
		<span class="text-text-muted font-mono text-[0.78rem]">Draft note</span>
		<textarea
			bind:value={draft}
			rows="2"
			placeholder="Type something, then try the link below…"
			class="bg-bg-sunken border-border-strong text-text focus:border-accent w-full resize-y rounded-lg border px-2.5 py-2.5 font-[inherit] text-[0.9rem] leading-normal outline-none"
		></textarea>
	</label>

	<div
		class="flex w-fit items-center gap-2.5 rounded-lg border px-3.5 py-2 text-[0.86rem] {hasUnsavedChanges
			? 'border-warning-border bg-warning-bg text-warning'
			: 'border-success-border bg-success-bg text-success'}"
	>
		<span class="h-2.5 w-2.5 shrink-0 rounded-full bg-current"></span>
		<span>
			{hasUnsavedChanges ? 'Unsaved changes — navigation is guarded' : 'No unsaved changes'}
		</span>
	</div>

	<div class="actions">
		<button onclick={save} disabled={!hasUnsavedChanges}>Save</button>
		<a
			class="text-accent text-[0.85rem] no-underline hover:underline"
			href={resolve('/docs/[slug]', { slug: 'use-fetch' })}
		>
			Try navigating to useFetch →
		</a>
	</div>

	{#if showDialog}
		<div
			class="border-warning-border bg-warning-bg flex flex-col gap-1.5 rounded-lg border px-4 py-3.5"
			role="alertdialog"
			aria-label="Unsaved changes"
		>
			<p class="text-warning m-0 text-[0.92rem] font-semibold">Leave without saving?</p>
			<p class="text-warning/80 m-0 text-[0.84rem] leading-normal">
				Navigation was blocked because the draft has unsaved changes.
			</p>
			<div class="mt-1 flex gap-2">
				<button class="border-warning-border! text-warning!" onclick={leave}>Leave anyway</button>
				<button onclick={stay}>Stay here</button>
			</div>
		</div>
	{/if}

	<p class="hint">
		Save first and the link navigates normally. Leave the draft dirty and the guard intercepts it.
	</p>
</div>
