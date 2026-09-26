<script lang="ts">
	import { useAsyncQueue } from '$lib/async/useAsyncQueue.svelte.js';

	const LABELS = ['avatar.png', 'resume.pdf', 'slides.key', 'notes.md', 'photo.jpg'];

	let concurrency = $state(2);
	let failThird = $state(false);
	let runId = $state(0);

	// Filled by onSuccess. Completion order differs from array order once
	// concurrency is above 1, so the index is the only reliable way to know
	// which row just finished.
	let landed = $state<(number | null)[]>(LABELS.map(() => null));
	let order = $state(0);

	// Rebuilt on each run so the queue restarts from scratch
	const queue = $derived.by(() => {
		void runId;
		return useAsyncQueue(
			LABELS.map((label, index) => () => {
				return new Promise<string>((resolve, reject) => {
					setTimeout(
						() => (failThird && index === 2 ? reject(new Error('upload failed')) : resolve(label)),
						300 + index * 120
					);
				});
			}),
			{
				concurrency,
				abortOnError: false,
				onSuccess: (_data, index) => {
					order += 1;
					landed[index] = order;
				}
			}
		);
	});
</script>

<div class="demo-wrap">
	<div class="row">
		<span class="label">concurrency</span>
		<input type="number" bind:value={concurrency} min="1" max="5" />
	</div>
	<div class="row">
		<span class="label">fail the third</span>
		<input type="checkbox" bind:checked={failThird} />
	</div>

	<div class="actions">
		<button
			onclick={() => {
				landed = LABELS.map(() => null);
				order = 0;
				runId += 1;
			}}>Run</button
		>
		<button onclick={queue.abort} disabled={!queue.isRunning()}>Abort</button>
	</div>

	<div class="row">
		<span class="label">settled</span>
		<span class="value accent">{queue.settled()} / {queue.tasks().length}</span>
	</div>

	<ul class="text-text-muted m-0 list-none pl-0 text-[0.8rem]">
		{#each queue.tasks() as task, index (index)}
			<li>
				{LABELS[index]} — <span class="value accent">{task.status}</span>
				{#if landed[index] !== null}
					<span class="muted">finished #{landed[index]}</span>
				{/if}
			</li>
		{/each}
	</ul>

	<p class="hint">
		Raise concurrency and the tasks overlap — the <span class="value accent">finished #</span> marks
		show completion order, which stops matching row order as soon as they run in parallel. That is
		why <span class="value accent">onSuccess</span> carries an index. Abort mid-run marks the
		unstarted ones
		<span class="value accent">aborted</span> — work already running cannot be cancelled, because a promise
		has no cancellation.
	</p>
</div>
