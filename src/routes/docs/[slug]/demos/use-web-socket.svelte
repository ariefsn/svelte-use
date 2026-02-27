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
		<span class="badge badge-{status().toLowerCase()}">{status()}</span>
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

	<div class="send-row">
		<input type="text" bind:value={input} placeholder="Message…" />
		<button onclick={sendMessage} disabled={status() !== 'OPEN'}>Send</button>
	</div>

	{#if log.length > 0}
		<div class="divider"></div>
		<div class="log">
			{#each log as entry}
				<div class="log-entry {entry.startsWith('→') ? 'sent' : 'recv'}">{entry}</div>
			{/each}
		</div>
	{/if}

	<p class="hint">Uses wss://echo.websocket.events — messages are echoed back</p>
</div>

<style>
	.badge {
		font-size: 0.75rem;
		padding: 0.1rem 0.5rem;
		border-radius: 999px;
		font-family: monospace;
	}

	.badge-connecting {
		background: #1e1e1e;
		color: #facc15;
	}
	.badge-open {
		background: #142a14;
		color: #86efac;
	}
	.badge-closed {
		background: #1e1e1e;
		color: #555;
	}

	.send-row {
		display: flex;
		gap: 0.4rem;
	}

	.send-row input {
		flex: 1;
		background: #1e1e1e;
		border: 1px solid #2e2e2e;
		border-radius: 6px;
		padding: 0.35rem 0.65rem;
		color: #e8e8e8;
		font-size: 0.85rem;
		outline: none;
	}

	.send-row input:focus {
		border-color: #a78bfa;
	}

	.log {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.log-entry {
		font-family: monospace;
		font-size: 0.8rem;
		padding: 0.2rem 0.5rem;
		border-radius: 4px;
	}

	.log-entry.sent {
		color: #a78bfa;
		background: #1a1630;
	}
	.log-entry.recv {
		color: #86efac;
		background: #142a14;
	}
</style>
