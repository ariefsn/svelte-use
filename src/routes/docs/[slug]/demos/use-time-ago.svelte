<script lang="ts">
	import { useTimeAgo } from '$lib/state/useTimeAgo.svelte.js';

	// A date that was set to "5 minutes ago" at load time
	const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
	const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
	const yesterday = new Date(Date.now() - 25 * 60 * 60 * 1000);

	const ago1 = useTimeAgo(() => fiveMinAgo, { interval: 5000 });
	const ago2 = useTimeAgo(() => oneHourAgo, { interval: 5000 });
	const ago3 = useTimeAgo(() => yesterday, { interval: 5000 });

	// Live: current time minus a growing offset
	let offsetSec = $state(0);
	$effect(() => {
		const id = setInterval(() => offsetSec++, 1000);
		return () => clearInterval(id);
	});
	const live = useTimeAgo(() => new Date(Date.now() - offsetSec * 1000), { interval: 500 });
</script>

<div class="demo-wrap">
	<div class="row">
		<span class="label">5 min ago</span><span class="value accent">{ago1()}</span>
	</div>
	<div class="row">
		<span class="label">1 hour ago</span><span class="value accent">{ago2()}</span>
	</div>
	<div class="row">
		<span class="label">yesterday</span><span class="value accent">{ago3()}</span>
	</div>

	<div class="divider"></div>

	<div class="row">
		<span class="label">live ({offsetSec}s)</span>
		<span class="value accent">{live()}</span>
	</div>
</div>
