<script lang="ts">
	import { useDevicePixelRatio } from '$lib/browser/sensors/useDevicePixelRatio.svelte.js';
	const { isSupported, current } = useDevicePixelRatio();
</script>
<div class="demo-wrap">
	<div class="row">
		<span class="label">supported</span>
		<span class="value accent">{isSupported()}</span>
	</div>
	<div class="row">
		<span class="label">pixel ratio</span>
		<span class="value accent">{current()}</span>
	</div>
	<div class="row">
		<span class="label">display type</span>
		<span class="value accent">{current() > 1 ? 'HiDPI / Retina' : 'Standard'}</span>
	</div>
	<p class="hint">Try zooming in/out (Cmd+/Cmd-) to see the ratio change.</p>
</div>
