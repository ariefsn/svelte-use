export interface ApiRow {
	name: string;
	type: string;
	default?: string;
	description: string;
}

export interface DocPage {
	slug: string;
	title: string;
	description: string;
	usage: string;
	params?: ApiRow[];
	options?: ApiRow[];
	returns?: ApiRow[];
	example: string;
	notes?: string[];
}

export const pages: Record<string, DocPage> = {
	// ------------------------------------------------------------------ State
	'use-sorted': {
		slug: 'use-sorted',
		title: 'useSorted',
		description:
			'Returns a reactive sorted copy of an array. The sorted result updates automatically whenever the source array changes. The original array is never mutated.',
		usage: `import { useSorted } from '@ariefsn/svelte-use';

let items = $state([3, 1, 4, 1, 5, 9]);
const sorted = useSorted(() => items);
// sorted() → [1, 1, 3, 4, 5, 9]

// Custom comparator
const desc = useSorted(() => items, (a, b) => b - a);
// desc() → [9, 5, 4, 3, 1, 1]`,
		params: [
			{
				name: 'source',
				type: '() => T[]',
				description: 'Reactive getter returning the array to sort'
			},
			{
				name: 'compareFn',
				type: '(a: T, b: T) => number',
				default: 'undefined',
				description: 'Optional comparator (same signature as Array.prototype.sort)'
			}
		],
		returns: [
			{
				name: '()',
				type: '() => T[]',
				description: 'Getter that returns the sorted copy, updated reactively'
			}
		],
		example: `<script lang="ts">
  import { useSorted } from '@ariefsn/svelte-use';

  let nums = $state([5, 2, 8, 1, 9]);
  const sorted = useSorted(() => nums);
</script>

<button onclick={() => nums.push(Math.floor(Math.random() * 10))}>
  Add random
</button>

<p>Original: {nums.join(', ')}</p>
<p>Sorted: {sorted().join(', ')}</p>`,
		notes: [
			'SSR-safe — no browser APIs used.',
			'Creates a new array on every sort; does not mutate the source.',
			'Uses the default locale-aware comparator when no `compareFn` is provided.'
		]
	},

	'use-cycle-list': {
		slug: 'use-cycle-list',
		title: 'useCycleList',
		description:
			'Cycles through a list of items reactively. Wraps around at both ends.',
		usage: `import { useCycleList } from '@ariefsn/svelte-use';

const cycle = useCycleList(['apple', 'banana', 'cherry']);
cycle.state()  // → 'apple'
cycle.next();
cycle.state()  // → 'banana'
cycle.prev();
cycle.state()  // → 'apple'
cycle.setIndex(2);
cycle.state()  // → 'cherry'`,
		params: [
			{
				name: 'list',
				type: 'T[]',
				description: 'The array of items to cycle through'
			},
			{
				name: 'initialIndex',
				type: 'number',
				default: '0',
				description: 'Index of the item to start at'
			}
		],
		returns: [
			{ name: 'state', type: '() => T', description: 'Getter for the current item' },
			{ name: 'index', type: '() => number', description: 'Getter for the current index' },
			{ name: 'next', type: '() => void', description: 'Advance to the next item (wraps around)' },
			{ name: 'prev', type: '() => void', description: 'Go to the previous item (wraps around)' },
			{
				name: 'setIndex',
				type: '(i: number) => void',
				description: 'Jump to a specific index'
			}
		],
		example: `<script lang="ts">
  import { useCycleList } from '@ariefsn/svelte-use';

  const themes = useCycleList(['light', 'dark', 'system']);
</script>

<p>Current theme: {themes.state()}</p>
<button onclick={() => themes.next()}>Next</button>
<button onclick={() => themes.prev()}>Prev</button>`,
		notes: ['SSR-safe — no browser APIs used.']
	},

	'use-countdown': {
		slug: 'use-countdown',
		title: 'useCountdown',
		description:
			'A reactive countdown timer. Counts down from an initial value to zero at a configurable interval.',
		usage: `import { useCountdown } from '@ariefsn/svelte-use';

const timer = useCountdown(60);       // 60s countdown, 1s interval
const fast  = useCountdown(10, 500); // 10 ticks, 500ms interval

timer.start();
timer.count()    // → 60, 59, 58 …
timer.isActive() // → true
timer.stop();
timer.reset();   // back to 60`,
		params: [
			{
				name: 'initial',
				type: 'number',
				description: 'Starting value for the countdown'
			},
			{
				name: 'interval',
				type: 'number',
				default: '1000',
				description: 'Milliseconds between each tick'
			}
		],
		returns: [
			{ name: 'count', type: '() => number', description: 'Current countdown value' },
			{
				name: 'isActive',
				type: '() => boolean',
				description: '`true` while the countdown is running'
			},
			{ name: 'start', type: '() => void', description: 'Start or resume the countdown' },
			{ name: 'stop', type: '() => void', description: 'Pause the countdown' },
			{ name: 'reset', type: '() => void', description: 'Reset to the initial value and stop' }
		],
		example: `<script lang="ts">
  import { useCountdown } from '@ariefsn/svelte-use';

  const timer = useCountdown(10);
</script>

<p>{timer.count()} seconds remaining</p>
{#if timer.isActive()}
  <button onclick={() => timer.stop()}>Pause</button>
{:else}
  <button onclick={() => timer.start()}>Start</button>
{/if}
<button onclick={() => timer.reset()}>Reset</button>`,
		notes: [
			'The timer stops automatically when `count` reaches 0.',
			'SSR-safe — interval is only created in the browser via `$effect`.',
			'Cleanup is handled automatically when the component is destroyed.'
		]
	},

	'use-time-ago': {
		slug: 'use-time-ago',
		title: 'useTimeAgo',
		description:
			'Returns a reactive human-readable relative time string (e.g. "3 minutes ago") that updates automatically.',
		usage: `import { useTimeAgo } from '@ariefsn/svelte-use';

const ago = useTimeAgo(() => new Date('2024-01-01'));
ago() // → "1 year ago"

// With options
const live = useTimeAgo(() => someDate, { interval: 10_000 }); // refresh every 10s`,
		params: [
			{
				name: 'date',
				type: '() => Date | number',
				description: 'Reactive getter returning a Date or Unix timestamp (ms)'
			}
		],
		options: [
			{
				name: 'interval',
				type: 'number',
				default: '30000',
				description: 'How often (ms) to refresh the relative string'
			}
		],
		returns: [
			{
				name: '()',
				type: '() => string',
				description:
					'Getter returning the formatted string: "just now", "X seconds ago", "X minutes ago", etc.'
			}
		],
		example: `<script lang="ts">
  import { useTimeAgo } from '@ariefsn/svelte-use';

  const posted = new Date(Date.now() - 5 * 60 * 1000); // 5 min ago
  const timeAgo = useTimeAgo(() => posted);
</script>

<span>Posted {timeAgo()}</span>`,
		notes: [
			'Updates on the configured `interval`; defaults to every 30 seconds.',
			'SSR-safe — interval is only started in the browser.',
			'Cleanup is handled automatically when the component is destroyed.'
		]
	},

	// ------------------------------------------------ Browser – Keyboard & Scroll
	'use-magic-keys': {
		slug: 'use-magic-keys',
		title: 'useMagicKeys',
		description:
			'Tracks keyboard state reactively via a `Proxy`. Access any key or combination by name to get a boolean getter that is `true` while those keys are held.',
		usage: `import { useMagicKeys } from '@ariefsn/svelte-use';

const keys = useMagicKeys();

// Single key
const shift = keys['shift']; // () => boolean

// Combo
const save = keys['ctrl+s'];  // () => boolean

// Use in $effect or template
$effect(() => {
  if (save()) {
    console.log('Ctrl+S pressed!');
  }
});`,
		returns: [
			{
				name: 'keys[name]',
				type: '() => boolean',
				description:
					'Getter for a single key or `+`-joined combo. `true` while all keys in the combo are held.'
			}
		],
		example: `<script lang="ts">
  import { useMagicKeys } from '@ariefsn/svelte-use';

  const keys = useMagicKeys();
  const ctrl = keys['ctrl'];
  const ctrlK = keys['ctrl+k'];
</script>

<p>Ctrl held: {ctrl()}</p>
<p>Ctrl+K: {ctrlK()}</p>`,
		notes: [
			'Key names are normalized: `Control` → `ctrl`, `Escape` → `esc`, `" "` → `space`, arrow keys → `up/down/left/right`.',
			'SSR-safe — listeners are added only in the browser.',
			'Cleanup is handled automatically when the component is destroyed.'
		]
	},

	'use-key-modifier': {
		slug: 'use-key-modifier',
		title: 'useKeyModifier',
		description:
			'Tracks whether a specific modifier key (Ctrl, Shift, Alt, Meta) is currently held.',
		usage: `import { useKeyModifier } from '@ariefsn/svelte-use';

const ctrl  = useKeyModifier('ctrl');
const shift = useKeyModifier('shift');
const alt   = useKeyModifier('alt');
const meta  = useKeyModifier('meta');

ctrl() // → true while Ctrl is held`,
		params: [
			{
				name: 'modifier',
				type: "'ctrl' | 'shift' | 'alt' | 'meta'",
				description: 'The modifier key to track'
			}
		],
		returns: [
			{ name: '()', type: '() => boolean', description: '`true` while the modifier key is held' }
		],
		example: `<script lang="ts">
  import { useKeyModifier } from '@ariefsn/svelte-use';

  const shift = useKeyModifier('shift');
</script>

<p>Shift is {shift() ? 'held' : 'not held'}</p>`,
		notes: [
			'Uses a shared global listener — safe to call multiple times for the same modifier.',
			'SSR-safe — listeners are added only in the browser.',
			'Cleanup is handled automatically when the component is destroyed.'
		]
	},

	'use-scroll': {
		slug: 'use-scroll',
		title: 'useScroll',
		description:
			'Tracks scroll position, direction, edge arrival, and scrolling state for any scrollable element or `window`.',
		usage: `import { useScroll } from '@ariefsn/svelte-use';

// Window scroll (default)
const scroll = useScroll();

// Specific element
let el: HTMLElement;
const scroll = useScroll(() => el, {
  throttle: 100,
  offset: { bottom: 20 }
});

scroll.x()                   // → horizontal scroll position
scroll.y()                   // → vertical scroll position
scroll.isScrolling()         // → true while scrolling
scroll.arrivedState.bottom() // → true when near the bottom
scroll.directions.down()     // → true when scrolling down
scroll.scrollTo({ top: 0 }); // imperative scroll`,
		params: [
			{
				name: 'target',
				type: 'Window | HTMLElement | (() => HTMLElement | null) | null',
				default: 'window',
				description: 'The scroll target. Defaults to `window`.'
			}
		],
		options: [
			{
				name: 'throttle',
				type: 'number',
				default: '150',
				description: 'Delay (ms) before `isScrolling` resets to `false`'
			},
			{
				name: 'offset.top',
				type: 'number',
				default: '0',
				description: 'Pixel offset for top-edge detection'
			},
			{
				name: 'offset.bottom',
				type: 'number',
				default: '0',
				description: 'Pixel offset for bottom-edge detection'
			},
			{
				name: 'offset.left',
				type: 'number',
				default: '0',
				description: 'Pixel offset for left-edge detection'
			},
			{
				name: 'offset.right',
				type: 'number',
				default: '0',
				description: 'Pixel offset for right-edge detection'
			}
		],
		returns: [
			{ name: 'x', type: '() => number', description: 'Horizontal scroll position in px' },
			{ name: 'y', type: '() => number', description: 'Vertical scroll position in px' },
			{
				name: 'isScrolling',
				type: '() => boolean',
				description: '`true` while scroll events are firing'
			},
			{
				name: 'arrivedState.top',
				type: '() => boolean',
				description: '`true` when scroll is at (or within offset of) the top'
			},
			{
				name: 'arrivedState.bottom',
				type: '() => boolean',
				description: '`true` when scroll is at (or within offset of) the bottom'
			},
			{
				name: 'arrivedState.left',
				type: '() => boolean',
				description: '`true` when scroll is at the left edge'
			},
			{
				name: 'arrivedState.right',
				type: '() => boolean',
				description: '`true` when scroll is at the right edge'
			},
			{ name: 'directions.up', type: '() => boolean', description: 'Scrolling upward' },
			{ name: 'directions.down', type: '() => boolean', description: 'Scrolling downward' },
			{ name: 'directions.left', type: '() => boolean', description: 'Scrolling left' },
			{ name: 'directions.right', type: '() => boolean', description: 'Scrolling right' },
			{
				name: 'scrollTo',
				type: '(options: ScrollToOptions) => void',
				description: 'Imperatively scroll the target'
			}
		],
		example: `<script lang="ts">
  import { useScroll } from '@ariefsn/svelte-use';

  let container: HTMLElement;
  const scroll = useScroll(() => container, { offset: { bottom: 20 } });
</script>

<div bind:this={container} style="height:200px; overflow-y:auto;">
  <!-- content -->
</div>

<p>Y: {scroll.y()}px | Scrolling: {scroll.isScrolling()}</p>
{#if scroll.arrivedState.bottom()}
  <p>Reached the bottom!</p>
{/if}`,
		notes: [
			'SSR-safe — listeners are added only in the browser.',
			'`isScrolling` uses a debounce internally; configure with `throttle` option.',
			'Cleanup is handled automatically when the component is destroyed.'
		]
	},

	// ------------------------------------------------ Browser – Pointer & Drag
	'use-mouse': {
		slug: 'use-mouse',
		title: 'useMouse',
		description:
			'Tracks the current pointer position (mouse or touch) relative to the viewport.',
		usage: `import { useMouse } from '@ariefsn/svelte-use';

const mouse = useMouse();
mouse.x()          // → current X in px
mouse.y()          // → current Y in px
mouse.sourceType() // → 'mouse' | 'touch' | null

// Disable touch tracking
const mouseOnly = useMouse({ touch: false });`,
		options: [
			{
				name: 'touch',
				type: 'boolean',
				default: 'true',
				description: 'Whether to track touch events in addition to mouse'
			}
		],
		returns: [
			{ name: 'x', type: '() => number', description: 'Viewport-relative X coordinate' },
			{ name: 'y', type: '() => number', description: 'Viewport-relative Y coordinate' },
			{
				name: 'sourceType',
				type: "() => 'mouse' | 'touch' | null",
				description: 'Type of the last pointer event'
			}
		],
		example: `<script lang="ts">
  import { useMouse } from '@ariefsn/svelte-use';

  const mouse = useMouse();
</script>

<svelte:window />

<p>X: {mouse.x()} Y: {mouse.y()}</p>
<p>Source: {mouse.sourceType() ?? 'none'}</p>`,
		notes: [
			'Coordinates are relative to the viewport (not the document).',
			'SSR-safe — listeners are added only in the browser.',
			'Cleanup is handled automatically when the component is destroyed.'
		]
	},

	'use-mouse-pressed': {
		slug: 'use-mouse-pressed',
		title: 'useMousePressed',
		description: 'Tracks whether any mouse button is currently pressed anywhere in the document.',
		usage: `import { useMousePressed } from '@ariefsn/svelte-use';

const pressed = useMousePressed();
pressed() // → true while a mouse button is held`,
		returns: [
			{
				name: '()',
				type: '() => boolean',
				description: '`true` while any mouse button is pressed'
			}
		],
		example: `<script lang="ts">
  import { useMousePressed } from '@ariefsn/svelte-use';

  const pressed = useMousePressed();
</script>

<p>Mouse is {pressed() ? 'pressed' : 'released'}</p>`,
		notes: [
			'Listens to `mousedown` and `mouseup` on the document.',
			'SSR-safe — listeners are added only in the browser.',
			'Cleanup is handled automatically when the component is destroyed.'
		]
	},

	'use-draggable': {
		slug: 'use-draggable',
		title: 'useDraggable',
		description:
			'Makes any element draggable with full control over axis constraints, bounds, pointer types, handles, and callbacks.',
		usage: `import { useDraggable } from '@ariefsn/svelte-use';

let el: HTMLElement;
const drag = useDraggable(() => el, {
  initialValue: { x: 100, y: 100 },
  axis: 'x', // lock to horizontal
});

drag.x()         // → current X
drag.y()         // → current Y
drag.isDragging() // → true while dragging
drag.style()     // → "transform: translate(100px, 0px);"`,
		params: [
			{
				name: 'target',
				type: '() => HTMLElement | null',
				description: 'Ref to the element to make draggable'
			}
		],
		options: [
			{
				name: 'initialValue',
				type: 'DraggablePosition',
				default: '{ x: 0, y: 0 }',
				description: 'Initial position'
			},
			{
				name: 'axis',
				type: "'both' | 'x' | 'y'",
				default: "'both'",
				description: 'Constrain drag to an axis'
			},
			{
				name: 'disabled',
				type: 'boolean',
				default: 'false',
				description: 'Disable dragging'
			},
			{
				name: 'handle',
				type: 'HTMLElement | (() => HTMLElement | null) | null',
				default: 'undefined',
				description: 'A separate drag handle element'
			},
			{
				name: 'containerBounds',
				type: 'DraggableBounds | HTMLElement | null',
				default: 'undefined',
				description: 'Constrain movement to bounds or element'
			},
			{
				name: 'pointerTypes',
				type: "DraggablePointerType[]",
				default: 'all types',
				description: "Limit to 'mouse', 'touch', 'pen'"
			},
			{
				name: 'preventDefault',
				type: 'boolean',
				default: 'false',
				description: 'Call `preventDefault` on pointer events'
			},
			{
				name: 'onStart',
				type: '(pos, event) => void | false',
				default: 'undefined',
				description: 'Called on drag start; return `false` to cancel'
			},
			{
				name: 'onMove',
				type: '(pos, event) => void',
				default: 'undefined',
				description: 'Called on every drag move'
			},
			{
				name: 'onEnd',
				type: '(pos, event) => void',
				default: 'undefined',
				description: 'Called when drag ends'
			}
		],
		returns: [
			{ name: 'x', type: '() => number', description: 'Current X position in px' },
			{ name: 'y', type: '() => number', description: 'Current Y position in px' },
			{
				name: 'isDragging',
				type: '() => boolean',
				description: '`true` while actively dragging'
			},
			{
				name: 'style',
				type: '() => string',
				description: 'Convenience CSS string: `transform: translate(Xpx, Ypx);`'
			}
		],
		example: `<script lang="ts">
  import { useDraggable } from '@ariefsn/svelte-use';

  let el: HTMLElement;
  const drag = useDraggable(() => el, { initialValue: { x: 50, y: 50 } });
</script>

<div
  bind:this={el}
  style="position:fixed; width:80px; height:80px; background:#a78bfa; {drag.style()}"
>
  Drag me
</div>`,
		notes: [
			'Apply `position: fixed` or `position: absolute` to the dragged element and use `drag.style()` for positioning.',
			'SSR-safe — pointer listeners are added only in the browser.',
			'Cleanup is handled automatically when the component is destroyed.'
		]
	},

	// ------------------------------------------------ Browser – Observers
	'use-element-size': {
		slug: 'use-element-size',
		title: 'useElementSize',
		description:
			'Reactively tracks the dimensions of a DOM element using `ResizeObserver`. Updates whenever the element is resized.',
		usage: `import { useElementSize } from '@ariefsn/svelte-use';

let el: HTMLElement;
const size = useElementSize(() => el);

size.width()  // → current width in px
size.height() // → current height in px

// Measure border-box
const borderSize = useElementSize(() => el, { box: 'border-box' });`,
		params: [
			{
				name: 'target',
				type: '() => HTMLElement | null',
				description: 'Ref to the element to observe'
			}
		],
		options: [
			{
				name: 'box',
				type: "'content-box' | 'border-box'",
				default: "'content-box'",
				description: 'Which CSS box model to measure'
			}
		],
		returns: [
			{
				name: 'width',
				type: '() => number',
				description: 'Element width in px (updates on resize)'
			},
			{
				name: 'height',
				type: '() => number',
				description: 'Element height in px (updates on resize)'
			}
		],
		example: `<script lang="ts">
  import { useElementSize } from '@ariefsn/svelte-use';

  let container: HTMLElement;
  const size = useElementSize(() => container);
</script>

<div bind:this={container} style="resize:both; overflow:auto; padding:1rem;">
  Resize me
</div>

<p>Width: {size.width()}px — Height: {size.height()}px</p>`,
		notes: [
			'Requires `ResizeObserver` support (all modern browsers).',
			'SSR-safe — observer is created only in the browser.',
			'Cleanup is handled automatically when the component is destroyed.'
		]
	},

	'use-intersection-observer': {
		slug: 'use-intersection-observer',
		title: 'useIntersectionObserver',
		description:
			'Reactively tracks whether an element is visible within the viewport (or a scroll container) using `IntersectionObserver`.',
		usage: `import { useIntersectionObserver } from '@ariefsn/svelte-use';

let el: HTMLElement;
const { isIntersecting, entry, stop } = useIntersectionObserver(() => el, {
  threshold: 0.5,   // 50% visible
  rootMargin: '-20px'
});

isIntersecting() // → true when at least 50% is visible
stop();          // stop observing`,
		params: [
			{
				name: 'target',
				type: '() => Element | null',
				description: 'Ref to the element to observe'
			}
		],
		options: [
			{
				name: 'root',
				type: 'Element | null',
				default: 'null (viewport)',
				description: 'Scroll container to use as the viewport'
			},
			{
				name: 'rootMargin',
				type: 'string',
				default: "'0px'",
				description: 'Margin around the root (CSS syntax)'
			},
			{
				name: 'threshold',
				type: 'number | number[]',
				default: '0',
				description: 'Visibility ratio(s) at which to trigger'
			}
		],
		returns: [
			{
				name: 'isIntersecting',
				type: '() => boolean',
				description: '`true` when the element meets the threshold'
			},
			{
				name: 'entry',
				type: '() => IntersectionObserverEntry | null',
				description: 'The latest observer entry'
			},
			{ name: 'stop', type: '() => void', description: 'Manually disconnect the observer' }
		],
		example: `<script lang="ts">
  import { useIntersectionObserver } from '@ariefsn/svelte-use';

  let target: HTMLElement;
  const { isIntersecting } = useIntersectionObserver(() => target);
</script>

<div style="height:100vh">Scroll down</div>

<div bind:this={target}>
  {isIntersecting() ? 'Visible!' : 'Not visible'}
</div>`,
		notes: [
			'Requires `IntersectionObserver` support (all modern browsers).',
			'SSR-safe — observer is created only in the browser.',
			'Cleanup is handled automatically; call `stop()` to disconnect early.'
		]
	},

	'use-resize-observer': {
		slug: 'use-resize-observer',
		title: 'useResizeObserver',
		description:
			'Low-level `ResizeObserver` wrapper. Calls your callback with a `ResizeObserverEntry` whenever the target element changes size.',
		usage: `import { useResizeObserver } from '@ariefsn/svelte-use';

let el: HTMLElement;
const { stop } = useResizeObserver(() => el, (entry) => {
  console.log(entry.contentRect.width, entry.contentRect.height);
});

stop(); // disconnect manually`,
		params: [
			{
				name: 'target',
				type: '() => Element | null',
				description: 'Ref to the element to observe'
			},
			{
				name: 'callback',
				type: '(entry: ResizeObserverEntry) => void',
				description: 'Called on every resize event'
			}
		],
		returns: [
			{ name: 'stop', type: '() => void', description: 'Disconnect the observer' }
		],
		example: `<script lang="ts">
  import { useResizeObserver } from '@ariefsn/svelte-use';

  let el: HTMLElement;
  let w = $state(0), h = $state(0);

  useResizeObserver(() => el, (entry) => {
    w = entry.contentRect.width;
    h = entry.contentRect.height;
  });
</script>

<div bind:this={el} style="resize:both; overflow:auto; padding:1rem;">
  {w} × {h}
</div>`,
		notes: [
			'For a higher-level API, prefer `useElementSize` which exposes reactive getters directly.',
			'SSR-safe — observer is created only in the browser.',
			'Cleanup is handled automatically when the component is destroyed.'
		]
	},

	'use-mutation-observer': {
		slug: 'use-mutation-observer',
		title: 'useMutationObserver',
		description:
			'Watches for DOM mutations (child additions, attribute changes, subtree modifications) on a target node using `MutationObserver`.',
		usage: `import { useMutationObserver } from '@ariefsn/svelte-use';

let el: HTMLElement;
const { stop } = useMutationObserver(
  () => el,
  (mutations) => {
    for (const m of mutations) {
      console.log(m.type, m.addedNodes);
    }
  },
  { childList: true, subtree: true, attributes: true }
);

stop(); // disconnect manually`,
		params: [
			{
				name: 'target',
				type: '() => Node | null',
				description: 'Ref to the DOM node to observe'
			},
			{
				name: 'callback',
				type: '(mutations: MutationRecord[], observer: MutationObserver) => void',
				description: 'Called when mutations occur'
			},
			{
				name: 'options',
				type: 'MutationObserverInit',
				default: '{}',
				description:
					'Standard `MutationObserverInit`: `childList`, `attributes`, `subtree`, `characterData`, etc.'
			}
		],
		returns: [
			{ name: 'stop', type: '() => void', description: 'Disconnect the observer' }
		],
		example: `<script lang="ts">
  import { useMutationObserver } from '@ariefsn/svelte-use';

  let container: HTMLElement;
  let log = $state<string[]>([]);

  useMutationObserver(
    () => container,
    (mutations) => {
      for (const m of mutations) log = [...log, m.type];
    },
    { childList: true }
  );
</script>

<div bind:this={container}><!-- dynamic children --></div>
<ul>{#each log as entry}<li>{entry}</li>{/each}</ul>`,
		notes: [
			'SSR-safe — observer is created only in the browser.',
			'Cleanup is handled automatically when the component is destroyed.',
			'You must specify at least one option (`childList`, `attributes`, or `characterData`) or the browser will throw.'
		]
	},

	// ------------------------------------------------ Browser – Sensors
	'use-idle': {
		slug: 'use-idle',
		title: 'useIdle',
		description:
			'Detects when the user has been idle (no mouse, keyboard, touch, or scroll activity) for longer than the specified timeout.',
		usage: `import { useIdle } from '@ariefsn/svelte-use';

const { isIdle, reset } = useIdle(5000); // idle after 5s

isIdle() // → true when no activity for 5s
reset()  // restart the idle timer`,
		params: [
			{
				name: 'timeout',
				type: 'number',
				description: 'Milliseconds of inactivity before `isIdle` becomes `true`'
			}
		],
		returns: [
			{
				name: 'isIdle',
				type: '() => boolean',
				description: '`true` when the user has been inactive for longer than `timeout`'
			},
			{ name: 'reset', type: '() => void', description: 'Restart the idle timer' }
		],
		example: `<script lang="ts">
  import { useIdle } from '@ariefsn/svelte-use';

  const { isIdle } = useIdle(3000); // 3s
</script>

{#if isIdle()}
  <p>User is idle</p>
{:else}
  <p>User is active</p>
{/if}`,
		notes: [
			'Tracks: `mousemove`, `mousedown`, `keydown`, `touchstart`, `wheel`, `pointermove`, `scroll`, `resize`, `visibilitychange`.',
			'SSR-safe — listeners are added only in the browser.',
			'Cleanup is handled automatically when the component is destroyed.'
		]
	},

	'use-network': {
		slug: 'use-network',
		title: 'useNetwork',
		description:
			'Reactively exposes Network Information API data: effective connection type, estimated downlink speed, round-trip time, and data-saver mode.',
		usage: `import { useNetwork } from '@ariefsn/svelte-use';

const net = useNetwork();

net.effectiveType() // → '4g' | '3g' | '2g' | 'slow-2g' | undefined
net.downlink()      // → Mbps estimate | undefined
net.rtt()           // → ms | undefined
net.saveData()      // → true if data-saver is on | undefined`,
		returns: [
			{
				name: 'effectiveType',
				type: "() => string | undefined",
				description: "Effective connection type: `'4g'`, `'3g'`, `'2g'`, `'slow-2g'`"
			},
			{
				name: 'downlink',
				type: '() => number | undefined',
				description: 'Estimated downlink speed in Mbps'
			},
			{
				name: 'rtt',
				type: '() => number | undefined',
				description: 'Estimated round-trip time in ms'
			},
			{
				name: 'saveData',
				type: '() => boolean | undefined',
				description: '`true` if the user has data-saver mode enabled'
			}
		],
		example: `<script lang="ts">
  import { useNetwork } from '@ariefsn/svelte-use';

  const net = useNetwork();
</script>

<p>Connection: {net.effectiveType() ?? 'unknown'}</p>
<p>Downlink: {net.downlink() ?? '?'} Mbps</p>
{#if net.saveData()}
  <p>Data saver active — serving reduced assets</p>
{/if}`,
		notes: [
			'The Network Information API is not available in Firefox or Safari; all values will be `undefined`.',
			'SSR-safe — all values return `undefined` on the server.',
			'Updates reactively when the connection changes.'
		]
	},

	'use-geolocation': {
		slug: 'use-geolocation',
		title: 'useGeolocation',
		description:
			'Reactively tracks the device geographic position using `navigator.geolocation.watchPosition`.',
		usage: `import { useGeolocation } from '@ariefsn/svelte-use';

const geo = useGeolocation({
  enableHighAccuracy: true,
  timeout: 10_000
});

geo.isSupported()         // → true if Geolocation API available
geo.coords()              // → GeolocationCoordinates | null
geo.coords()?.latitude    // → number
geo.coords()?.longitude   // → number
geo.error()               // → GeolocationPositionError | null`,
		options: [
			{
				name: 'enableHighAccuracy',
				type: 'boolean',
				default: 'false',
				description: 'Request high-accuracy position (may use GPS)'
			},
			{
				name: 'timeout',
				type: 'number',
				default: 'Infinity',
				description: 'Max ms to wait for a position'
			},
			{
				name: 'maximumAge',
				type: 'number',
				default: '0',
				description: 'Max age (ms) of a cached position to accept'
			}
		],
		returns: [
			{
				name: 'coords',
				type: '() => GeolocationCoordinates | null',
				description: 'Current coordinates, or `null` before first fix or on error'
			},
			{
				name: 'error',
				type: '() => GeolocationPositionError | null',
				description: 'Last error, or `null`'
			},
			{
				name: 'isSupported',
				type: '() => boolean',
				description: '`true` if the Geolocation API is available'
			}
		],
		example: `<script lang="ts">
  import { useGeolocation } from '@ariefsn/svelte-use';

  const geo = useGeolocation();
</script>

{#if !geo.isSupported()}
  <p>Geolocation not supported</p>
{:else if geo.error()}
  <p>Error: {geo.error()?.message}</p>
{:else if geo.coords()}
  <p>Lat: {geo.coords()?.latitude}</p>
  <p>Lon: {geo.coords()?.longitude}</p>
{:else}
  <p>Acquiring position…</p>
{/if}`,
		notes: [
			'Requires explicit user permission. The browser will show a permission prompt.',
			'SSR-safe — `isSupported()` returns `false` on the server; all other values are `null`.',
			'The position watcher is automatically cleared when the component is destroyed.'
		]
	}
};
