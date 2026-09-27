<script lang="ts">
	import { useNavigatorLanguage } from '$lib';

	const language = useNavigatorLanguage();
</script>

<div class="demo-wrap">
	<div class="flex items-center gap-3 text-[0.9rem]">
		<span class="text-text-muted font-mono">navigator.language</span>
		<span class="text-accent font-mono text-[1.1rem] font-semibold">{language()}</span>
	</div>

	<p class="hint">
		Change your browser's preferred language in settings to see this update (via the
		<code>languagechange</code> event).
	</p>
</div>
