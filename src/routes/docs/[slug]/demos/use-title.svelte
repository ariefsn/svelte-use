<script lang="ts">
	import { useTitle } from '$lib';

	let unread = $state(0);

	// Owns the title while this page is mounted, and restores it on leave.
	const title = useTitle(() => (unread > 0 ? `(${unread}) Svelte Use` : 'Svelte Use'));
</script>

<div class="demo-wrap">
	<div class="actions">
		<button onclick={() => (unread += 1)}>+1 unread</button>
		<button onclick={() => (unread = 0)}>mark read</button>
		<button onclick={() => title.set('Set directly')}>set directly</button>
	</div>

	<div class="row">
		<span class="label">unread</span>
		<span class="value accent">{unread}</span>
	</div>
	<div class="row">
		<span class="label">document.title</span>
		<span class="value">{title.current()}</span>
	</div>

	<p class="hint">
		Watch the browser tab. Navigating away restores the previous title, because the snapshot is
		taken at initialisation. Called with no argument it is read-only and never writes — which is
		what stops a display-only consumer clobbering a title set elsewhere.
	</p>
</div>
