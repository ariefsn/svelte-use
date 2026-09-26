<script lang="ts">
	import { untrack } from 'svelte';
	import { useEventSource } from '$lib/async/useEventSource.svelte.js';

	const LIVE = 'https://sse.tools.typinks.com/api/story';

	let url = $state(LIVE);

	const stream = useEventSource<string>(() => url || undefined, {
		events: ['ping']
	});

	// `data()` is the latest frame, not an accumulation, so a token stream has
	// to be appended by the consumer. `story += chunk` reads and writes the
	// same state, so it must be untracked or the effect re-triggers forever.
	let story = $state('');
	$effect(() => {
		const chunk = stream.data();
		if (chunk === null) return;
		untrack(() => (story += typeof chunk === 'string' ? chunk : JSON.stringify(chunk)));
	});

	function reconnect(next: string) {
		story = '';
		url = '';
		// Let the effect tear the old connection down before opening a new one.
		queueMicrotask(() => (url = next));
	}
</script>

<div class="demo-wrap">
	<div class="row">
		<span class="label">endpoint</span>
		<input type="text" bind:value={url} placeholder="https://example.com/events" />
	</div>

	<div class="actions">
		<button onclick={() => reconnect(LIVE)}>Stream a story</button>
		<button onclick={() => reconnect('/sse-endpoint-that-does-not-exist')}>Connect to a 404</button>
		<button onclick={() => (url = '')} disabled={!url}>Disconnect</button>
	</div>

	<div class="divider"></div>

	<div class="row">
		<span class="label">status</span>
		<span class="value accent">{stream.status()}</span>
	</div>
	<div class="row">
		<span class="label">event</span>
		<span class="value accent">{stream.event() ?? '—'}</span>
	</div>
	<div class="row">
		<span class="label">lastEventId</span>
		<span class="value accent">{stream.lastEventId() ?? 'none sent'}</span>
	</div>
	<div class="row">
		<span class="label">errored</span>
		<span class="value accent">{stream.error() !== null}</span>
	</div>

	{#if story}
		<p class="text-text-muted m-0 max-h-40 overflow-y-auto text-[0.8rem] leading-relaxed">
			{story}
		</p>
	{/if}

	<p class="hint">
		The default endpoint streams a story token by token — each frame replaces
		<span class="value accent">data()</span>, so the text above is accumulated by the demo. It sends
		only <span class="value accent">data:</span> lines, so
		<span class="value accent">lastEventId</span> stays empty and every frame arrives unnamed as
		<span class="value accent">message</span>; ids exist only so a server can resume a dropped
		stream from where it stopped.
	</p>
	<p class="hint">
		A 404 settles on <span class="value accent">CLOSED</span>, because an HTTP failure ends the
		stream for good; a dropped connection shows <span class="value accent">CONNECTING</span> while
		the browser retries on its own, which is why there is no
		<span class="value accent">autoReconnect</span> option.
	</p>
</div>
