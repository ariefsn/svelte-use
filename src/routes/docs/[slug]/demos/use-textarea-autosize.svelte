<script lang="ts">
	import { useTextareaAutosize } from '$lib';

	let el = $state<HTMLTextAreaElement | null>(null);
	let text = $state('Type across several lines —\nthis textarea grows to fit.');

	const { height } = useTextareaAutosize(() => el, {
		value: () => text,
		minRows: 2,
		maxRows: 8
	});
</script>

<div class="demo-wrap">
	<textarea
		bind:this={el}
		bind:value={text}
		rows="1"
		class="bg-bg-sunken border-border-strong text-text focus:border-accent w-full resize-none rounded-lg border px-2.5 py-2.5 font-[inherit] text-[0.9rem] leading-relaxed outline-none"
	></textarea>

	<div class="row">
		<span class="label">applied height</span>
		<span class="value accent">{height().toFixed(0)}px</span>
	</div>
	<div class="row">
		<span class="label">lines</span>
		<span class="value accent">{text.split('\n').length}</span>
	</div>

	<div class="actions">
		<button onclick={() => (text = `${text}\nanother line`)}>append line (no input event)</button>
		<button onclick={() => (text = '')}>clear</button>
	</div>
	<p class="hint">
		Clamped between 2 and 8 rows — past 8 it scrolls. The append button changes the value
		programmatically, which fires no <code>input</code> event.
	</p>
</div>
