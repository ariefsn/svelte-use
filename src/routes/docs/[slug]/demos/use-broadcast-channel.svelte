<script lang="ts">
	import { useBroadcastChannel } from '$lib/async/useBroadcastChannel.svelte.js';

	type Ping = { from: string; at: string };

	// Two instances on one channel, because a sender never receives its own
	// message — this is what two browser tabs would look like.
	const tabA = useBroadcastChannel<Ping>({ name: 'svelte-use-demo' });
	const tabB = useBroadcastChannel<Ping>({ name: 'svelte-use-demo' });

	function send(from: string) {
		const message = { from, at: new Date().toLocaleTimeString() };
		if (from === 'A') tabA.post(message);
		else tabB.post(message);
	}
</script>

<div class="demo-wrap">
	<div class="row">
		<span class="label">supported</span>
		<span class="value accent">{tabA.isSupported()}</span>
	</div>

	<div class="actions">
		<button onclick={() => send('A')}>Post from A</button>
		<button onclick={() => send('B')}>Post from B</button>
	</div>

	<div class="divider"></div>

	<div class="row">
		<span class="label">A received</span>
		<span class="value accent"
			>{tabA.data() ? `${tabA.data()?.from} @ ${tabA.data()?.at}` : '—'}</span
		>
	</div>
	<div class="row">
		<span class="label">B received</span>
		<span class="value accent"
			>{tabB.data() ? `${tabB.data()?.from} @ ${tabB.data()?.at}` : '—'}</span
		>
	</div>

	<p class="hint">
		Posting from A updates only B, and vice versa — a channel never delivers to the instance that
		posted. Open this page in a second tab and both will light up there too.
	</p>
</div>
