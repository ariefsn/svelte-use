<script lang="ts">
	import { useCloned } from '$lib/reactivity/useCloned.svelte.js';

	let source = $state({ name: 'Ada', role: 'Engineer' });
	let serverPushes = $state(0);

	// `manual` so incoming source changes do not discard unsaved edits
	const draft = useCloned(() => source, { manual: true });

	function save() {
		source = { ...draft.cloned() };
	}

	/** Stands in for a websocket push or a refetch landing mid-edit. */
	function externalUpdate() {
		serverPushes += 1;
		source = { name: 'Ada', role: `Engineer (rev ${serverPushes})` };
	}
</script>

<div class="demo-wrap">
	<div class="row">
		<span class="label">source</span>
		<span class="value accent">{source.name} — {source.role}</span>
	</div>
	<div class="row">
		<span class="label">modified</span>
		<span class="value accent">{draft.isModified()}</span>
	</div>

	<div class="divider"></div>

	<div class="row">
		<span class="label">name</span>
		<input type="text" bind:value={() => draft.cloned().name, (v) => (draft.cloned().name = v)} />
	</div>
	<div class="row">
		<span class="label">role</span>
		<input type="text" bind:value={() => draft.cloned().role, (v) => (draft.cloned().role = v)} />
	</div>

	<div class="actions">
		<button onclick={save} disabled={!draft.isModified()}>Save</button>
		<button onclick={draft.sync} disabled={!draft.isModified()}>Discard</button>
		<button onclick={externalUpdate}>Simulate Server Update</button>
	</div>

	<p class="hint">
		Type in either field: <span class="value accent">modified</span> flips to
		<span class="value accent">true</span> and the source above stays untouched until you hit Save.
	</p>
	<p class="hint">
		Now edit a field and press <span class="value accent">Simulate Server Update</span> — the source
		changes underneath but your edits survive, because
		<span class="value accent">manual</span> is on. Without it, every incoming update would wipe the half-finished
		form. Discard re-clones from whatever the source is now.
	</p>
</div>
