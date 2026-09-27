<script lang="ts">
	import { useWebSocket } from '$lib/async/useWebSocket.svelte.js';

	let input = $state('Hello, WebSocket!');
	let log = $state<string[]>([]);

	let connected = $state(false);

	const { data, status, send, close } = useWebSocket<string>(
		() => (connected ? 'wss://echo.websocket.events' : undefined),
		{ autoReconnect: false }
	);

	$effect(() => {
		const msg = data();
		if (msg !== null) {
			log = [`← ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`, ...log].slice(0, 6);
		}
	});

	function sendMessage() {
		if (input.trim()) {
			log = [`→ ${input}`, ...log].slice(0, 6);
			send(input);
		}
	}
</script>

<div class="demo-wrap">
	<div class="row">
		<span class="label">status</span>
		<span
			class="rounded-full px-2 py-[0.1rem] font-mono text-[0.75rem] {status() === 'OPEN'
				? 'bg-success-bg text-success'
				: status() === 'CONNECTING'
					? 'bg-surface text-warning'
					: 'bg-surface text-text-faint'}">{status()}</span
		>
	</div>

	<div class="actions">
		{#if !connected}
			<button onclick={() => (connected = true)}>Connect</button>
		{:else}
			<button
				onclick={() => {
					connected = false;
					close();
				}}>Disconnect</button
			>
		{/if}
	</div>

	<div class="flex gap-1.5">
		<input type="text" bind:value={input} placeholder="Message…" />
		<button onclick={sendMessage} disabled={status() !== 'OPEN'}>Send</button>
	</div>

	{#if log.length > 0}
		<div class="divider"></div>
		<div class="flex flex-col gap-1">
			{#each log as entry, i (i)}
				<div
					class="rounded px-2 py-1 font-mono text-[0.8rem] {entry.startsWith('→')
						? 'text-accent bg-accent-bg'
						: 'text-success bg-success-bg'}"
				>
					{entry}
				</div>
			{/each}
		</div>
	{/if}

	<p class="hint">Uses wss://echo.websocket.events — messages are echoed back</p>
</div>
