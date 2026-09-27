<script lang="ts">
	import { useNow } from '$lib/time/useNow.svelte.js';

	const now = useNow({ interval: 1000 });

	const time = $derived(new Date(now()).toLocaleTimeString());
	const date = $derived(new Date(now()).toLocaleDateString());
</script>

<div class="demo-wrap">
	<div class="text-accent mb-2 font-mono text-[2.75rem] leading-none font-extrabold tabular-nums">
		{time}
	</div>
	<div class="row">
		<span class="label">date</span>
		<span class="value">{date}</span>
	</div>
	<div class="row">
		<span class="label">unix ms</span>
		<span class="value accent">{now()}</span>
	</div>
	<p class="hint">Updates every 1000ms via setInterval</p>
</div>
