<script lang="ts">
	import { useColorMode } from '$lib';

	/*
	 * Deliberately the site's own colour mode — same default storage key, same
	 * target — rather than a sandboxed copy. Changing it here moves the whole
	 * page, and the toggle in the sidebar follows instantly, which is the
	 * same-page sync channel doing its job: the `storage` event does not fire
	 * in the tab that caused the write, so two instances would otherwise
	 * disagree.
	 */
	const theme = useColorMode({ initialValue: 'dark' });

	const options = ['auto', 'light', 'dark'] as const;
</script>

<div class="demo-wrap">
	<div class="actions">
		{#each options as option (option)}
			<button class:active={theme.mode() === option} onclick={() => theme.set(option)}>
				{option}
			</button>
		{/each}
		<button onclick={() => theme.toggle()}>toggle</button>
		<button onclick={() => theme.reset()}>reset</button>
	</div>

	<div class="row">
		<span class="label">mode</span>
		<span class="value accent">{theme.mode()}</span>
	</div>
	<div class="row">
		<span class="label">resolved</span>
		<span class="value accent">{theme.resolved()}</span>
	</div>
	<div class="row">
		<span class="label">isDark</span>
		<span class="value">{theme.isDark()}</span>
	</div>
	<div class="row">
		<span class="label">system</span>
		<span class="value">{theme.system()}</span>
	</div>

	<div
		class="bg-surface border-border text-text flex items-center justify-between gap-3 rounded-lg border px-3.5 py-3 text-[0.85rem]"
	>
		<strong>This whole page follows the selection.</strong>
		<span class="text-text-muted font-mono">html.{theme.resolved()}</span>
	</div>

	<p class="hint">
		The selection persists, so it survives a reload, and the sidebar toggle stays in step. On
		<code>auto</code> it keeps following your OS appearance. The flash on first paint is prevented
		by
		<code>colorModeScript()</code> in <code>app.html</code> — a composable runs after hydration, which
		is after first paint.
	</p>
</div>
