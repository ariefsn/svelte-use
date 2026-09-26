<script lang="ts">
	import { useWindowSize } from '$lib';

	const full = useWindowSize();
	const noScrollbar = useWindowSize({ includeScrollbar: false });
</script>

<div class="demo-wrap">
	<div class="row">
		<span class="label">width × height</span>
		<span class="value accent">{full.width()} × {full.height()}</span>
	</div>
	<div class="row">
		<span class="label">excluding scrollbar</span>
		<span class="value accent">{noScrollbar.width()} × {noScrollbar.height()}</span>
	</div>
	<div class="row">
		<span class="label">scrollbar width</span>
		<span class="value accent">{full.width() - noScrollbar.width()}px</span>
	</div>
	<p class="hint">
		Resize the window to watch these update. The difference is the scrollbar — which is what CSS
		media queries exclude.
	</p>
</div>
