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
		description: 'Cycles through a list of items reactively. Wraps around at both ends.',
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
		description: 'Tracks the current pointer position (mouse or touch) relative to the viewport.',
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
				type: 'DraggablePointerType[]',
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
		returns: [{ name: 'stop', type: '() => void', description: 'Disconnect the observer' }],
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
		returns: [{ name: 'stop', type: '() => void', description: 'Disconnect the observer' }],
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
			'Detects when the user has been idle (no mouse, keyboard, or touch activity) for longer than the specified timeout.',
		usage: `import { useIdle } from '@ariefsn/svelte-use';

const isIdle = useIdle(5000); // idle after 5s
isIdle() // → true when no activity for 5s

// Default timeout: 60 seconds
const idle = useIdle();
idle() // → boolean`,
		params: [
			{
				name: 'timeout',
				type: 'number',
				default: '60000',
				description: 'Milliseconds of inactivity before the return value becomes `true`'
			}
		],
		returns: [
			{
				name: '()',
				type: '() => boolean',
				description: '`true` when the user has been inactive for longer than `timeout`'
			}
		],
		example: `<script lang="ts">
  import { useIdle } from '@ariefsn/svelte-use';

  const isIdle = useIdle(3000); // idle after 3s
</script>

{#if isIdle()}
  <p>User is idle</p>
{:else}
  <p>User is active</p>
{/if}`,
		notes: [
			'Tracks: `mousemove`, `mousedown`, `keydown`, `touchstart`.',
			'SSR-safe — listeners are added only in the browser.',
			'Cleanup is handled automatically when the component is destroyed.'
		]
	},

	'use-network': {
		slug: 'use-network',
		title: 'useNetwork',
		description:
			'Reactively tracks online/offline state using the browser `online` and `offline` events.',
		usage: `import { useNetwork } from '@ariefsn/svelte-use';

const net = useNetwork();
net.online() // → true when navigator.onLine is true`,
		returns: [
			{
				name: 'online',
				type: '() => boolean',
				description:
					'`true` when the browser reports an active network connection. Defaults to `true` on the server.'
			}
		],
		example: `<script lang="ts">
  import { useNetwork } from '@ariefsn/svelte-use';

  const net = useNetwork();
</script>

{#if net.online()}
  <p>Online</p>
{:else}
  <p>Offline — check your connection</p>
{/if}`,
		notes: [
			'Listens to `window` `online` and `offline` events.',
			'SSR-safe — defaults to `true` on the server (matches `navigator.onLine` behavior).',
			'Cleanup is handled automatically when the component is destroyed.'
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

geo.coords()           // → GeolocationCoordinates | null
geo.coords()?.latitude  // → number
geo.error()            // → GeolocationPositionError | null`,
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
				description:
					'Last geolocation error, or `null`. Cleared automatically on the next successful fix.'
			}
		],
		example: `<script lang="ts">
  import { useGeolocation } from '@ariefsn/svelte-use';

  const geo = useGeolocation();
</script>

{#if geo.error()}
  <p>Error: {geo.error()?.message}</p>
{:else if geo.coords()}
  <p>Lat: {geo.coords()?.latitude}</p>
  <p>Lon: {geo.coords()?.longitude}</p>
{:else}
  <p>Acquiring position…</p>
{/if}`,
		notes: [
			'Requires explicit user permission. The browser will show a permission prompt.',
			'SSR-safe — guards against missing `navigator.geolocation`; all values are `null` on the server.',
			'The position watcher is automatically cleared when the component is destroyed.'
		]
	},

	// ──────────────────────────────────────────── Performance
	'use-fps': {
		slug: 'use-fps',
		title: 'useFps',
		description:
			'Tracks the current frames-per-second rate of the browser rendering loop using `requestAnimationFrame`.',
		usage: `import { useFps } from '@ariefsn/svelte-use';

const fps = useFps();
fps() // → current FPS as a rounded integer`,
		returns: [
			{
				name: '()',
				type: '() => number',
				description:
					'Current FPS as a rounded integer. Returns `0` when `requestAnimationFrame` is unavailable (SSR).'
			}
		],
		example: `<script lang="ts">
  import { useFps } from '@ariefsn/svelte-use';

  const fps = useFps();
</script>

<p>{fps()} fps</p>`,
		notes: [
			'Uses a `requestAnimationFrame` loop internally; the loop is cancelled automatically on component destroy.',
			'SSR-safe — returns `0` when `requestAnimationFrame` is not available.',
			'Rounds to the nearest integer via `Math.round(1000 / delta)`.'
		]
	},

	'use-throttle-fn': {
		slug: 'use-throttle-fn',
		title: 'useThrottleFn',
		description:
			'Returns a throttled version of a function that fires at most once per `delay` milliseconds. Uses leading-edge invocation with a trailing call for the remainder of the window.',
		usage: `import { useThrottleFn } from '@ariefsn/svelte-use';

const throttled = useThrottleFn((value: string) => {
  console.log('search:', value);
}, 300);

throttled('hello'); // fires immediately
throttled('world'); // queued — fires after 300ms`,
		params: [
			{
				name: 'fn',
				type: 'T extends (...args) => ReturnType<T>',
				description: 'The function to throttle'
			},
			{
				name: 'delay',
				type: 'number',
				description: 'Minimum milliseconds between invocations'
			}
		],
		returns: [
			{
				name: '()',
				type: 'T',
				description: 'A throttled wrapper with the same signature as `fn`'
			}
		],
		example: `<script lang="ts">
  import { useThrottleFn } from '@ariefsn/svelte-use';

  let pos = $state({ x: 0, y: 0 });

  const onMove = useThrottleFn((e: MouseEvent) => {
    pos = { x: e.clientX, y: e.clientY };
  }, 50);
</script>

<svelte:window onmousemove={onMove} />
<p>X: {pos.x} Y: {pos.y}</p>`,
		notes: [
			'Leading-edge: the first call fires immediately, subsequent calls within `delay` are delayed.',
			'The trailing call always uses the most recent arguments.',
			'The pending timer is cleared automatically when the component is destroyed.'
		]
	},

	'use-debounce-fn': {
		slug: 'use-debounce-fn',
		title: 'useDebounceFn',
		description:
			'Returns a debounced version of a function that only executes after `delay` milliseconds of inactivity. Each new call resets the timer.',
		usage: `import { useDebounceFn } from '@ariefsn/svelte-use';

const search = useDebounceFn((query: string) => {
  fetch('/api/search?q=' + query);
}, 400);

// Only fires 400ms after the last call
search('s');
search('sv');
search('svelte'); // ← this one fires`,
		params: [
			{
				name: 'fn',
				type: 'T extends (...args) => ReturnType<T>',
				description: 'The function to debounce'
			},
			{
				name: 'delay',
				type: 'number',
				description: 'Milliseconds to wait after the last call'
			}
		],
		returns: [
			{
				name: '()',
				type: 'T',
				description: 'A debounced wrapper with the same signature as `fn`'
			}
		],
		example: `<script lang="ts">
  import { useDebounceFn } from '@ariefsn/svelte-use';

  let results = $state<string[]>([]);

  const search = useDebounceFn(async (q: string) => {
    results = await fetch('/api?q=' + q).then(r => r.json());
  }, 400);
</script>

<input oninput={(e) => search(e.currentTarget.value)} placeholder="Search…" />`,
		notes: [
			'Pure trailing debounce — no leading-edge execution.',
			'The return value is always `undefined` since execution is deferred.',
			'The pending timer is cleared automatically when the component is destroyed.'
		]
	},

	// ──────────────────────────────────────────── Virtualization
	'use-virtual-list': {
		slug: 'use-virtual-list',
		title: 'useVirtualList',
		description:
			'Renders only the items currently visible in a scrollable container. Handles lists of any size with a fixed row height, dramatically reducing DOM nodes.',
		usage: `import { useVirtualList } from '@ariefsn/svelte-use';

const items = Array.from({ length: 10_000 }, (_, i) => ({ id: i, name: 'Item ' + i }));

const { list, containerProps, wrapperProps } = useVirtualList(
  () => items,
  { itemHeight: 40, overscan: 5 }
);

// list()             → VirtualItem<T>[] — only visible items
// list()[0].data     → the source item
// list()[0].style    → "position: absolute; top: Npx; height: 40px;"
// list()[0].index    → original index in source array`,
		params: [
			{
				name: 'list',
				type: '() => T[]',
				description: 'Reactive getter returning the full source array'
			}
		],
		options: [
			{
				name: 'itemHeight',
				type: 'number',
				description: 'Fixed height in px for every row (required)'
			},
			{
				name: 'overscan',
				type: 'number',
				default: '3',
				description: 'Number of extra items to render above and below the visible window'
			}
		],
		returns: [
			{
				name: 'list',
				type: '() => VirtualItem<T>[]',
				description: 'Getter returning only the currently visible items with positioning styles'
			},
			{
				name: 'containerProps.style',
				type: 'string',
				description: 'Apply to the scroll container: `"overflow-y: auto; position: relative;"`'
			},
			{
				name: 'containerProps.onscroll',
				type: '(event: Event) => void',
				description: "Scroll handler — bind to the container's `onscroll`"
			},
			{
				name: 'wrapperProps.style',
				type: 'string (reactive getter)',
				description:
					'Apply to the inner wrapper: sets `height` to `totalItems × itemHeight` to maintain scrollbar size'
			}
		],
		example: `<script lang="ts">
  import { useVirtualList } from '@ariefsn/svelte-use';

  const data = Array.from({ length: 5000 }, (_, i) => 'Row ' + i);

  const { list, containerProps, wrapperProps } = useVirtualList(
    () => data,
    { itemHeight: 32 }
  );
</script>

<div style="{containerProps.style} height: 400px;" onscroll={containerProps.onscroll}>
  <div style={wrapperProps.style}>
    {#each list() as item (item.index)}
      <div style={item.style}>
        {item.data}
      </div>
    {/each}
  </div>
</div>`,
		notes: [
			'`itemHeight` must be fixed and consistent — variable heights are not supported.',
			'SSR-safe — renders a first-page estimate when the container height is unknown.',
			'No DOM listeners are added internally; scroll state is managed via the `onscroll` prop.'
		]
	},

	// ──────────────────────────────────────────── Web APIs
	'use-clipboard': {
		slug: 'use-clipboard',
		title: 'useClipboard',
		description:
			'Provides a reactive interface for reading and writing to the system clipboard, with a temporary `copied` flag and a `document.execCommand` fallback.',
		usage: `import { useClipboard } from '@ariefsn/svelte-use';

const clipboard = useClipboard();

await clipboard.copy('Hello, world!');
clipboard.text()   // → 'Hello, world!'
clipboard.copied() // → true (for 1500ms, then resets to false)`,
		returns: [
			{
				name: 'text',
				type: '() => string',
				description: 'The last successfully copied text value'
			},
			{
				name: 'copied',
				type: '() => boolean',
				description: '`true` for 1500 ms after a successful `copy()` call'
			},
			{
				name: 'copy',
				type: '(value: string) => Promise<void>',
				description: 'Write a string to the clipboard'
			}
		],
		example: `<script lang="ts">
  import { useClipboard } from '@ariefsn/svelte-use';

  const clipboard = useClipboard();
</script>

<button onclick={() => clipboard.copy('npm install @ariefsn/svelte-use')}>
  {clipboard.copied() ? 'Copied!' : 'Copy install command'}
</button>`,
		notes: [
			'Uses `navigator.clipboard.writeText` with a `document.execCommand("copy")` textarea fallback for older browsers.',
			'The `copied` flag resets to `false` automatically after 1500 ms.',
			'SSR-safe — `copy()` is a no-op on the server.',
			'Cleanup clears the reset timer when the component is destroyed.'
		]
	},

	'use-battery': {
		slug: 'use-battery',
		title: 'useBattery',
		description:
			'Reactively tracks battery charging state and charge level via the Battery Status API.',
		usage: `import { useBattery } from '@ariefsn/svelte-use';

const battery = useBattery();
battery.charging() // → true when plugged in
battery.level()    // → 0.0–1.0 charge level`,
		returns: [
			{
				name: 'charging',
				type: '() => boolean',
				description: '`true` when the battery is currently charging. Defaults to `false`.'
			},
			{
				name: 'level',
				type: '() => number',
				description: 'Battery charge level from `0.0` (empty) to `1.0` (full). Defaults to `1`.'
			}
		],
		example: `<script lang="ts">
  import { useBattery } from '@ariefsn/svelte-use';

  const battery = useBattery();
</script>

<p>
  {Math.round(battery.level() * 100)}% —
  {battery.charging() ? 'Charging' : 'On battery'}
</p>`,
		notes: [
			'The Battery Status API is available in Chrome/Edge. Returns default values (`charging: false`, `level: 1`) when unsupported.',
			'SSR-safe — guards against missing `navigator.getBattery`.',
			'Event listeners are removed automatically when the component is destroyed.'
		]
	},

	'use-speech-recognition': {
		slug: 'use-speech-recognition',
		title: 'useSpeechRecognition',
		description:
			'Reactive speech-to-text using the Web Speech API. Returns a live transcript that updates as the user speaks.',
		usage: `import { useSpeechRecognition } from '@ariefsn/svelte-use';

const speech = useSpeechRecognition();

speech.start();
speech.isListening() // → true
speech.result()      // → live transcript string
speech.stop();`,
		returns: [
			{
				name: 'result',
				type: '() => string',
				description: 'The latest transcript. Empty string when unsupported or not started.'
			},
			{
				name: 'isListening',
				type: '() => boolean',
				description: '`true` while recognition is active'
			},
			{
				name: 'start',
				type: '() => void',
				description: 'Start listening. No-op when the API is unsupported.'
			},
			{
				name: 'stop',
				type: '() => void',
				description: 'Stop listening. No-op when the API is unsupported.'
			}
		],
		example: `<script lang="ts">
  import { useSpeechRecognition } from '@ariefsn/svelte-use';

  const speech = useSpeechRecognition();
</script>

<button onclick={() => speech.isListening() ? speech.stop() : speech.start()}>
  {speech.isListening() ? 'Stop' : 'Start'}
</button>

<p>{speech.result() || 'Say something…'}</p>`,
		notes: [
			'Uses `window.SpeechRecognition` with `window.webkitSpeechRecognition` as a vendor-prefix fallback.',
			'`continuous` and `interimResults` are both set to `true` — the transcript streams partial results.',
			'SSR-safe — `start()` and `stop()` are no-ops when the API is unavailable.',
			'Recognition is stopped automatically when the component is destroyed.'
		]
	},

	// ------------------------------------------------------------------ State (continued)
	'use-toggle': {
		slug: 'use-toggle',
		title: 'useToggle',
		description: 'A reactive boolean toggle. Flips between `true` and `false` with a `toggle()` call, or force a specific value with `set()`.',
		usage: `import { useToggle } from '@ariefsn/svelte-use';

const toggle = useToggle();        // starts false
toggle.value  // → false
toggle.toggle();
toggle.value  // → true
toggle.set(false);
toggle.value  // → false

// Custom initial value
const on = useToggle(true);`,
		params: [
			{
				name: 'initial',
				type: 'boolean',
				default: 'false',
				description: 'Starting value'
			}
		],
		returns: [
			{ name: 'value', type: 'boolean', description: 'Reactive boolean state (property accessor, not a function)' },
			{ name: 'toggle', type: '() => void', description: 'Flip the value between `true` and `false`' },
			{ name: 'set', type: '(v: boolean) => void', description: 'Set an explicit boolean value' }
		],
		example: `<script lang="ts">
  import { useToggle } from '@ariefsn/svelte-use';

  const dark = useToggle(false);
</script>

<button onclick={() => dark.toggle()}>
  {dark.value ? 'Dark mode' : 'Light mode'}
</button>`,
		notes: [
			'`value` is a reactive property accessor (`get value()`), not a getter function. Use `toggle.value` directly in templates.',
			'SSR-safe — no browser APIs used.'
		]
	},

	'use-counter': {
		slug: 'use-counter',
		title: 'useCounter',
		description: 'A reactive integer counter with increment, decrement, and reset operations. Supports custom step deltas.',
		usage: `import { useCounter } from '@ariefsn/svelte-use';

const counter = useCounter(0);
counter.value  // → 0
counter.inc();
counter.value  // → 1
counter.inc(5);
counter.value  // → 6
counter.dec(3);
counter.value  // → 3
counter.reset();
counter.value  // → 0`,
		params: [
			{
				name: 'initial',
				type: 'number',
				default: '0',
				description: 'Starting value'
			}
		],
		returns: [
			{ name: 'value', type: 'number', description: 'Reactive numeric state (property accessor, not a function)' },
			{ name: 'inc', type: '(delta?: number) => void', description: 'Increment by `delta` (default `1`)' },
			{ name: 'dec', type: '(delta?: number) => void', description: 'Decrement by `delta` (default `1`)' },
			{ name: 'reset', type: '() => void', description: 'Reset to the initial value' }
		],
		example: `<script lang="ts">
  import { useCounter } from '@ariefsn/svelte-use';

  const count = useCounter(10);
</script>

<p>Count: {count.value}</p>
<button onclick={() => count.inc()}>+1</button>
<button onclick={() => count.dec()}>-1</button>
<button onclick={() => count.reset()}>Reset</button>`,
		notes: [
			'`value` is a reactive property accessor (`get value()`), not a getter function. Use `count.value` directly in templates.',
			'SSR-safe — no browser APIs used.'
		]
	},

	'use-previous': {
		slug: 'use-previous',
		title: 'usePrevious',
		description: 'Tracks the previous value of a reactive getter. Returns `undefined` until the value changes for the first time.',
		usage: `import { usePrevious } from '@ariefsn/svelte-use';

let count = $state(0);
const prev = usePrevious(() => count);
prev()  // → undefined (no change yet)

count = 1;
prev()  // → 0

count = 2;
prev()  // → 1`,
		params: [
			{
				name: 'getter',
				type: '() => T',
				description: 'Reactive getter function to observe'
			}
		],
		returns: [
			{
				name: '()',
				type: '() => T | undefined',
				description: 'Getter returning the previous value, or `undefined` before the first change'
			}
		],
		example: `<script lang="ts">
  import { usePrevious } from '@ariefsn/svelte-use';

  let name = $state('Alice');
  const prev = usePrevious(() => name);
</script>

<input bind:value={name} />
<p>Current: {name}</p>
<p>Previous: {prev() ?? 'none'}</p>`,
		notes: [
			'Uses `$effect` cleanup to capture the value from the previous render cycle.',
			'Returns `undefined` on the first render (before any change occurs).',
			'SSR-safe — no browser APIs used.'
		]
	},

	// ------------------------------------------------------------------ Reactivity
	'use-debounce': {
		slug: 'use-debounce',
		title: 'useDebounce',
		description: 'Debounces a reactive getter value, delaying updates until the source stops changing for the specified duration.',
		usage: `import { useDebounce } from '@ariefsn/svelte-use';

let query = $state('');
const debounced = useDebounce(() => query, 300);

// debounced() reflects the value of query only after 300ms of no changes`,
		params: [
			{
				name: 'getter',
				type: '() => T',
				description: 'Reactive getter function to debounce'
			},
			{
				name: 'delay',
				type: 'number',
				default: '300',
				description: 'Debounce delay in milliseconds'
			}
		],
		returns: [
			{
				name: '()',
				type: '() => T',
				description: 'Getter returning the debounced value; reflects the initial value immediately then delays subsequent updates'
			}
		],
		example: `<script lang="ts">
  import { useDebounce } from '@ariefsn/svelte-use';

  let query = $state('');
  const debouncedQuery = useDebounce(() => query, 300);

  $effect(() => {
    if (debouncedQuery()) {
      fetch('/api/search?q=' + debouncedQuery());
    }
  });
</script>

<input bind:value={query} placeholder="Search…" />
<p>Searching for: {debouncedQuery()}</p>`,
		notes: [
			'The initial value is reflected immediately; only subsequent changes are delayed.',
			'SSR-safe — `$effect` only runs in the browser in SvelteKit.',
			'The pending timer is cleared automatically when the component is destroyed.'
		]
	},

	// --------------------------------------------------------------- Browser – Storage
	'use-base64': {
		slug: 'use-base64',
		title: 'useBase64',
		description: 'Reactively converts a `string`, `ArrayBuffer`, or `Blob` to its Base64 representation. Returns `undefined` while an async Blob conversion is in-flight or on the server.',
		usage: `import { useBase64 } from '@ariefsn/svelte-use';

let data = $state<string | undefined>('hello');
const b64 = useBase64(() => data);
b64()  // → 'aGVsbG8='

data = undefined;
b64()  // → undefined

// Also accepts ArrayBuffer or Blob
let buffer = $state<ArrayBuffer | undefined>(someBuffer);
const b64buf = useBase64(() => buffer);`,
		params: [
			{
				name: 'input',
				type: '() => string | ArrayBuffer | Blob | undefined',
				description: 'Reactive getter returning the value to encode'
			}
		],
		returns: [
			{
				name: '()',
				type: '() => string | undefined',
				description: 'Getter returning the Base64-encoded string, or `undefined` when the input is `undefined`, during async Blob reads, or on the server'
			}
		],
		example: `<script lang="ts">
  import { useBase64 } from '@ariefsn/svelte-use';

  let text = $state('svelte');
  const encoded = useBase64(() => text);
</script>

<input bind:value={text} />
<p>Base64: {encoded() ?? '…'}</p>`,
		notes: [
			'String values are encoded via `TextEncoder` + `btoa` (UTF-8 safe).',
			'`Blob` values are read asynchronously via `FileReader`; the getter returns `undefined` until the read completes.',
			'SSR-safe — returns `undefined` in non-browser environments.'
		]
	},

	'use-object-url': {
		slug: 'use-object-url',
		title: 'useObjectUrl',
		description: 'Generates a reactive `blob:` URL for a `Blob`, `File`, or `MediaSource` object. Automatically revokes the previous URL when the source changes, preventing memory leaks.',
		usage: `import { useObjectUrl } from '@ariefsn/svelte-use';

let file = $state<File | undefined>(undefined);
const url = useObjectUrl(() => file);
// url() → undefined

file = new File(['hello'], 'hello.txt');
// url() → 'blob:...'`,
		params: [
			{
				name: 'object',
				type: '() => Blob | File | MediaSource | undefined',
				description: 'Reactive getter returning the object to create a URL for'
			}
		],
		returns: [
			{
				name: '()',
				type: '() => string | undefined',
				description: 'Getter returning the current object URL, or `undefined` when the source is `undefined` or in SSR'
			}
		],
		example: `<script lang="ts">
  import { useObjectUrl } from '@ariefsn/svelte-use';

  let file = $state<File | undefined>(undefined);
  const url = useObjectUrl(() => file);
</script>

<input type="file" onchange={(e) => { file = e.currentTarget.files?.[0] }} />
{#if url()}
  <a href={url()} target="_blank">Open file</a>
{/if}`,
		notes: [
			'The previous object URL is automatically revoked via `URL.revokeObjectURL` when the source changes or the component is destroyed.',
			'SSR-safe — returns `undefined` in non-browser environments.',
			'The generated URL is only valid in the browser tab where it was created.'
		]
	},

	'use-session-storage': {
		slug: 'use-session-storage',
		title: 'useSessionStorage',
		description: 'Reactive `sessionStorage` utility. Reads the stored value on init, persists changes automatically, and syncs across tabs via the `storage` event.',
		usage: `import { useSessionStorage } from '@ariefsn/svelte-use';

const token = useSessionStorage('auth-token', '');
token.value          // persisted string
token.set('abc123'); // writes to sessionStorage
token.remove();      // removes key, value → initial

// Custom serializer / deserializer
const obj = useSessionStorage('my-obj', {}, {
  serializer: JSON.stringify,
  deserializer: JSON.parse
});`,
		params: [
			{ name: 'key', type: 'string', description: '`sessionStorage` key' },
			{ name: 'initial', type: 'T', description: 'Fallback value when the key is absent or during SSR' },
			{
				name: 'options',
				type: 'UseSessionStorageOptions<T>',
				default: '{}',
				description: 'Optional `serializer` and `deserializer` functions'
			}
		],
		returns: [
			{ name: 'value', type: 'T', description: 'Reactive stored value (property accessor, not a function)' },
			{ name: 'set', type: '(v: T) => void', description: 'Update the value and persist to sessionStorage' },
			{ name: 'remove', type: '() => void', description: 'Remove the key from sessionStorage and reset to `initial`' }
		],
		example: `<script lang="ts">
  import { useSessionStorage } from '@ariefsn/svelte-use';

  const name = useSessionStorage('username', '');
</script>

<input bind:value={name.value} placeholder="Enter your name" />
<p>Stored: {name.value || 'nothing yet'}</p>
<button onclick={() => name.remove()}>Clear</button>`,
		notes: [
			'`value` is a reactive property accessor (`get value()`), not a getter function. Use `store.value` directly in templates.',
			'SSR-safe — storage reads and writes are skipped on the server; `initial` is used instead.',
			'Listens to the `storage` event to sync changes made in other tabs on the same origin.',
			'Uses `JSON.stringify` / `JSON.parse` by default; supply custom `serializer`/`deserializer` for non-JSON values.'
		]
	},

	// --------------------------------------------------------------- Browser – Storage (legacy)
	'use-local-storage': {
		slug: 'use-local-storage',
		title: 'useLocalStorage',
		description:
			'Reactive `localStorage` utility with SSR safety. Values are serialised with `JSON.stringify` / `JSON.parse`. Falls back to `initial` in non-browser environments or on parse errors.',
		usage: `import { useLocalStorage } from '@ariefsn/svelte-use';

const theme = useLocalStorage<'light' | 'dark'>('theme', 'light');
theme.set('dark'); // persists to localStorage
theme.value;       // 'dark'`,
		params: [
			{ name: 'key', type: 'string', description: '`localStorage` key' },
			{
				name: 'initial',
				type: 'T',
				description: 'Fallback value when the key is absent or during SSR'
			}
		],
		returns: [
			{
				name: 'value',
				type: 'T',
				description: 'Reactive stored value (property accessor, not a function)'
			},
			{ name: 'set', type: '(v: T) => void', description: 'Update and persist the value' }
		],
		example: `<script lang="ts">
  import { useLocalStorage } from '@ariefsn/svelte-use';

  const theme = useLocalStorage<'light' | 'dark'>('theme', 'light');
</script>

<p>Theme: {theme.value}</p>
<button onclick={() => theme.set('dark')}>Dark</button>
<button onclick={() => theme.set('light')}>Light</button>`,
		notes: [
			'`value` is a reactive property accessor (`get value()`), not a getter function. Use `store.value` directly in templates.',
			'Values are serialised with `JSON.stringify` / `JSON.parse`; parse errors silently fall back to `initial`.',
			'SSR-safe — storage reads and writes are skipped on the server.'
		]
	},

	// --------------------------------------------------------------- Browser – Storage (legacy)
	'use-indexed-db': {
		slug: 'use-indexed-db',
		title: 'useIndexedDB',
		description:
			'Reactive IndexedDB utility with full CRUD, querying, and filtering. SSR-safe — all operations are no-ops on the server. Values survive page refreshes and browser restarts.',
		usage: `import { useIndexedDB } from '@ariefsn/svelte-use';

interface Note { id?: number; text: string; done: boolean }
const db = useIndexedDB<Note>('my-app', 'notes');

// CRUD
await db.add({ text: 'Buy milk', done: false }); // returns generated key
await db.get(1);          // Note | undefined
await db.getAll();        // Note[]
await db.update({ id: 1, text: 'Buy milk', done: true });
await db.remove(1);
await db.clear();         // delete all records

// Reactive state
db.items;    // Note[] — all records
db.loading;  // boolean
db.error;    // Error | null

// Filtering
const pending = await db.query((n) => !n.done); // Note[]`,
		params: [
			{ name: 'dbName', type: 'string', description: 'IndexedDB database name' },
			{ name: 'storeName', type: 'string', description: 'Object store name' }
		],
		options: [
			{
				name: 'version',
				type: 'number',
				default: '1',
				description: 'Schema version (increment to migrate)'
			},
			{
				name: 'keyPath',
				type: 'string',
				default: "'id'",
				description: 'Primary key field name'
			},
			{
				name: 'autoIncrement',
				type: 'boolean',
				default: 'true',
				description: 'Auto-generate numeric keys'
			}
		],
		returns: [
			{
				name: 'items',
				type: 'T[]',
				description: 'Reactive array of all records; refreshed after every mutation'
			},
			{
				name: 'loading',
				type: 'boolean',
				description: '`true` while an async operation is in flight'
			},
			{ name: 'error', type: 'Error | null', description: 'Last error, or `null`' },
			{
				name: 'add(record)',
				type: 'Promise<IDBValidKey | undefined>',
				description: 'Insert record; returns generated key'
			},
			{
				name: 'get(key)',
				type: 'Promise<T | undefined>',
				description: 'Fetch single record by primary key'
			},
			{
				name: 'getAll()',
				type: 'Promise<T[]>',
				description: 'Fetch all records and sync `items`'
			},
			{
				name: 'update(record)',
				type: 'Promise<void>',
				description: 'Replace record (must include key field)'
			},
			{ name: 'remove(key)', type: 'Promise<void>', description: 'Delete record by primary key' },
			{
				name: 'query(filter)',
				type: 'Promise<T[]>',
				description: "Return records matching a predicate (doesn't modify `items`)"
			},
			{ name: 'clear()', type: 'Promise<void>', description: 'Delete all records' }
		],
		example: `<script lang="ts">
  import { useIndexedDB } from '@ariefsn/svelte-use';

  interface Note { id?: number; text: string; done: boolean }
  const db = useIndexedDB<Note>('demo', 'notes');
  let input = $state('');
</script>

<input bind:value={input} placeholder="New note…" />
<button onclick={() => { db.add({ text: input, done: false }); input = ''; }}>Add</button>

{#each db.items as note (note.id)}
  <p>{note.text}</p>
{/each}`,
		notes: [
			'`items`, `loading`, and `error` are reactive property accessors — use them directly in templates.',
			'SSR-safe — all operations are guarded by `isBrowser` checks.',
			'The store is opened lazily on the first operation.',
			'`query()` reads directly from IndexedDB and does not update `items`.'
		]
	},

	// --------------------------------------------------------------- Browser – Interaction
	'use-click-outside': {
		slug: 'use-click-outside',
		title: 'useClickOutside',
		description:
			'Calls a handler whenever a pointer event fires outside of the target element. Useful for closing dropdowns, modals, and menus.',
		usage: `import { useClickOutside } from '@ariefsn/svelte-use';

let el: HTMLElement;
useClickOutside(() => el, () => {
  open = false;
});

// Custom event type
useClickOutside(() => el, handler, { event: 'click' });`,
		params: [
			{
				name: 'target',
				type: '() => HTMLElement | null | undefined',
				description: 'Reactive getter returning the element to watch'
			},
			{
				name: 'handler',
				type: '(event: MouseEvent | TouchEvent) => void',
				description: 'Callback invoked when a click occurs outside the target'
			}
		],
		options: [
			{
				name: 'event',
				type: "'click' | 'mousedown' | 'pointerdown'",
				default: "'pointerdown'",
				description: 'DOM event type to listen for'
			}
		],
		returns: [],
		example: `<script lang="ts">
  import { useClickOutside } from '@ariefsn/svelte-use';

  let menu: HTMLElement;
  let open = $state(false);

  useClickOutside(() => menu, () => { open = false; });
</script>

<button onclick={() => (open = true)}>Open menu</button>

{#if open}
  <div bind:this={menu} class="menu">
    Menu content — click outside to close
  </div>
{/if}`,
		notes: [
			'The listener is attached to `document` in capture phase, so it fires before the element\'s own handlers.',
			'SSR-safe — no listeners are added when `document` is unavailable.',
			'Cleanup is handled automatically when the component is destroyed.'
		]
	},

	'use-drop-zone': {
		slug: 'use-drop-zone',
		title: 'useDropZone',
		description:
			'Turns any element into a file drop zone. Tracks whether a drag is currently over the element and calls `onDrop` with the dropped `File` objects.',
		usage: `import { useDropZone } from '@ariefsn/svelte-use';

let zone: HTMLElement;
const { isOver } = useDropZone(() => zone, (files) => {
  console.log('Dropped:', files);
});

isOver() // → true while dragging over the element`,
		params: [
			{
				name: 'target',
				type: '() => HTMLElement | null | undefined',
				description: 'Reactive getter returning the drop-zone element'
			},
			{
				name: 'onDrop',
				type: '(files: File[]) => void',
				default: 'undefined',
				description: 'Optional callback invoked with the dropped files array'
			}
		],
		returns: [
			{
				name: 'isOver',
				type: '() => boolean',
				description: '`true` while a drag is over the element'
			}
		],
		example: `<script lang="ts">
  import { useDropZone } from '@ariefsn/svelte-use';

  let zone: HTMLElement;
  let dropped = $state<string[]>([]);

  const { isOver } = useDropZone(() => zone, (files) => {
    dropped = files.map((f) => f.name);
  });
</script>

<div
  bind:this={zone}
  style="padding:2rem; border:2px dashed {isOver() ? '#a78bfa' : '#444'};"
>
  {isOver() ? 'Release to drop' : 'Drop files here'}
</div>

{#each dropped as name}<p>{name}</p>{/each}`,
		notes: [
			'Uses a counter to track enter/leave depth, preventing false `dragleave` events when moving over child elements.',
			'Default browser drop behavior is suppressed (`preventDefault` on `dragover` and `drop`).',
			'SSR-safe — no listeners are added when `document` is unavailable.',
			'Cleanup is handled automatically when the component is destroyed.'
		]
	},

	'use-element-hover': {
		slug: 'use-element-hover',
		title: 'useElementHover',
		description:
			'Tracks whether the pointer is currently hovering over a specific element via `mouseenter` and `mouseleave` events.',
		usage: `import { useElementHover } from '@ariefsn/svelte-use';

let el: HTMLElement;
const { hovering } = useElementHover(() => el);
hovering() // → true while the cursor is over el`,
		params: [
			{
				name: 'target',
				type: '() => HTMLElement | null | undefined',
				description: 'Reactive getter returning the element to observe'
			}
		],
		returns: [
			{
				name: 'hovering',
				type: '() => boolean',
				description: '`true` while the pointer is over the element'
			}
		],
		example: `<script lang="ts">
  import { useElementHover } from '@ariefsn/svelte-use';

  let card: HTMLElement;
  const { hovering } = useElementHover(() => card);
</script>

<div
  bind:this={card}
  style="padding:1rem; background:{hovering() ? '#2a1f4e' : '#1e1e1e'};"
>
  {hovering() ? 'Hovered!' : 'Hover over me'}
</div>`,
		notes: [
			'Uses `mouseenter` / `mouseleave`, which do not bubble — only the exact target element triggers a state change.',
			'SSR-safe — no listeners are added when `document` is unavailable.',
			'Cleanup is handled automatically when the component is destroyed.'
		]
	},

	'use-focus': {
		slug: 'use-focus',
		title: 'useFocus',
		description:
			'Tracks whether a specific element currently holds keyboard focus via `focus` and `blur` events.',
		usage: `import { useFocus } from '@ariefsn/svelte-use';

let input: HTMLInputElement;
const { focused } = useFocus(() => input);
focused() // → true while input has focus`,
		params: [
			{
				name: 'target',
				type: '() => HTMLElement | null | undefined',
				description: 'Reactive getter returning the element to observe'
			}
		],
		returns: [
			{
				name: 'focused',
				type: '() => boolean',
				description: '`true` while the element holds keyboard focus'
			}
		],
		example: `<script lang="ts">
  import { useFocus } from '@ariefsn/svelte-use';

  let input: HTMLInputElement;
  const { focused } = useFocus(() => input);
</script>

<input
  bind:this={input}
  placeholder="Click to focus"
  style="border-color: {focused() ? '#a78bfa' : '#444'};"
/>
<p>{focused() ? 'Focused' : 'Not focused'}</p>`,
		notes: [
			'Uses native `focus` and `blur` events — these do not bubble, so only direct focus/blur on the element is detected (not child elements).',
			'SSR-safe — no listeners are added when `document` is unavailable.',
			'Cleanup is handled automatically when the component is destroyed.'
		]
	},

	// --------------------------------------------------------------- Browser – Sensors
	'use-breakpoints': {
		slug: 'use-breakpoints',
		title: 'useBreakpoints',
		description:
			'Reactive breakpoint matcher. Tracks which named min-width breakpoints are currently matched using `window.matchMedia`. Updates automatically when the viewport is resized.',
		usage: `import { useBreakpoints } from '@ariefsn/svelte-use';

const bp = useBreakpoints({ sm: 640, md: 768, lg: 1024, xl: 1280 });

bp.active(); // → ['sm', 'md'] on a 900px viewport
bp.is('lg'); // → false
bp.is('sm'); // → true`,
		params: [
			{
				name: 'breakpoints',
				type: 'Record<string, number>',
				description: 'Map of breakpoint names to their min-width pixel values'
			}
		],
		returns: [
			{
				name: 'active',
				type: '() => string[]',
				description: 'Getter returning names of all currently matched breakpoints'
			},
			{
				name: 'is',
				type: '(key: string) => boolean',
				description: '`true` when the named breakpoint is currently matched'
			}
		],
		example: `<script lang="ts">
  import { useBreakpoints } from '@ariefsn/svelte-use';

  const bp = useBreakpoints({ sm: 640, md: 768, lg: 1024 });
</script>

<p>Active: {bp.active().join(', ') || 'none'}</p>
<p>Is lg: {bp.is('lg')}</p>`,
		notes: [
			'Each breakpoint maps to a `(min-width: Npx)` media query.',
			'SSR-safe — `active()` returns `[]` and `is()` returns `false` on the server.',
			'`MediaQueryList` listeners are removed automatically when the component is destroyed.'
		]
	},

	'use-browser-location': {
		slug: 'use-browser-location',
		title: 'useBrowserLocation',
		description:
			'Reactive snapshot of `window.location`. Updates on `popstate` and `hashchange` events, keeping `href`, `pathname`, `search`, and `hash` in sync with navigation.',
		usage: `import { useBrowserLocation } from '@ariefsn/svelte-use';

const loc = useBrowserLocation();

loc.pathname(); // → '/about'
loc.hash();     // → '#section-1'
loc.search();   // → '?tab=2'
loc.href();     // → full URL string`,
		returns: [
			{ name: 'href', type: '() => string', description: '`window.location.href`' },
			{ name: 'pathname', type: '() => string', description: '`window.location.pathname`' },
			{
				name: 'search',
				type: '() => string',
				description: '`window.location.search` (includes `?`)'
			},
			{
				name: 'hash',
				type: '() => string',
				description: '`window.location.hash` (includes `#`)'
			}
		],
		example: `<script lang="ts">
  import { useBrowserLocation } from '@ariefsn/svelte-use';

  const loc = useBrowserLocation();
</script>

<p>Path: {loc.pathname()}</p>
<p>Hash: {loc.hash() || 'none'}</p>`,
		notes: [
			'Does not intercept `history.pushState` / `replaceState` — only responds to `popstate` and `hashchange` events.',
			'SSR-safe — all getters return empty strings on the server.',
			'Listeners are removed automatically when the component is destroyed.'
		]
	},

	'use-navigator-language': {
		slug: 'use-navigator-language',
		title: 'useNavigatorLanguage',
		description:
			'Reactive browser language preference. Returns `navigator.language` as a BCP 47 language tag and updates on `languagechange` events. Falls back to `"en"` during SSR.',
		usage: `import { useNavigatorLanguage } from '@ariefsn/svelte-use';

const language = useNavigatorLanguage();
language() // → 'en-US'`,
		returns: [
			{
				name: '()',
				type: '() => string',
				description: 'Current BCP 47 language tag (e.g. `"en-US"`, `"fr"`, `"ja-JP"`)'
			}
		],
		example: `<script lang="ts">
  import { useNavigatorLanguage } from '@ariefsn/svelte-use';

  const language = useNavigatorLanguage();
</script>

<p>Browser language: {language()}</p>`,
		notes: [
			'Returns `navigator.language` — the primary language of the user\'s browser UI.',
			'SSR-safe — returns `"en"` when `navigator` is unavailable.',
			'The `languagechange` event fires when the user changes their preferred language in browser settings.',
			'Cleanup is handled automatically when the component is destroyed.'
		]
	},

	'use-online': {
		slug: 'use-online',
		title: 'useOnline',
		description:
			'Reactive online/offline network status. Tracks `navigator.onLine` and updates on the browser\'s `online` / `offline` events. Returns `true` during SSR.',
		usage: `import { useOnline } from '@ariefsn/svelte-use';

const isOnline = useOnline();
isOnline() // → true | false`,
		returns: [
			{
				name: '()',
				type: '() => boolean',
				description:
					'`true` when the browser reports an active network connection. Defaults to `true` on the server.'
			}
		],
		example: `<script lang="ts">
  import { useOnline } from '@ariefsn/svelte-use';

  const isOnline = useOnline();
</script>

{#if isOnline()}
  <p>Online</p>
{:else}
  <p>Offline — check your connection</p>
{/if}`,
		notes: [
			'`navigator.onLine` can be unreliable — it detects local network connectivity but not internet reachability.',
			'SSR-safe — defaults to `true` on the server.',
			'Listens to `window` `online` and `offline` events.',
			'Cleanup is handled automatically when the component is destroyed.'
		]
	},

	'use-page-leave': {
		slug: 'use-page-leave',
		title: 'usePageLeave',
		description:
			'Detects when the mouse cursor leaves the browser viewport by listening to `document` `mouseleave` / `mouseenter` events. Useful for exit-intent popups or pausing background tasks.',
		usage: `import { usePageLeave } from '@ariefsn/svelte-use';

const hasLeft = usePageLeave();
hasLeft() // → true when the cursor is outside the viewport`,
		returns: [
			{
				name: '()',
				type: '() => boolean',
				description: '`true` when the mouse cursor has left the browser viewport'
			}
		],
		example: `<script lang="ts">
  import { usePageLeave } from '@ariefsn/svelte-use';

  const hasLeft = usePageLeave();
</script>

{#if hasLeft()}
  <div class="exit-banner">Wait, don't go!</div>
{/if}

<p>Cursor in page: {!hasLeft()}</p>`,
		notes: [
			'Detects viewport exit, not window blur — moving the cursor to the browser chrome also triggers it.',
			'SSR-safe — no listeners are added when `document` is unavailable.',
			'Cleanup is handled automatically when the component is destroyed.'
		]
	},

	// ------------------------------------------------------------ Animation
	'use-animate': {
		slug: 'use-animate',
		title: 'useAnimate',
		description:
			'Reactive wrapper around the Web Animations API. Attaches an <code>Animation</code> to a target element using the provided keyframes and options. The animation is automatically cancelled and re-created whenever the target, keyframes, or options change.',
		usage: `import { useAnimate } from '@ariefsn/svelte-use';

let el = $state<HTMLDivElement | null>(null);

const { play, pause, cancel, finish, isRunning } = useAnimate(
  () => el,
  () => [{ opacity: 0 }, { opacity: 1 }],
  () => ({ duration: 300, fill: 'forwards' })
);`,
		params: [
			{
				name: 'target',
				type: '() => HTMLElement | null | undefined',
				description: 'Reactive getter returning the element to animate'
			},
			{
				name: 'keyframes',
				type: '() => Keyframe[] | PropertyIndexedKeyframes',
				description: 'Reactive getter returning the keyframes for the animation'
			},
			{
				name: 'options',
				type: '() => KeyframeAnimationOptions | undefined',
				default: 'undefined',
				description: 'Optional reactive getter returning animation options such as <code>duration</code>, <code>easing</code>, <code>iterations</code>'
			}
		],
		returns: [
			{
				name: 'play',
				type: '() => void',
				description: 'Starts or resumes the animation'
			},
			{
				name: 'pause',
				type: '() => void',
				description: 'Pauses the animation at the current position'
			},
			{
				name: 'cancel',
				type: '() => void',
				description: 'Cancels the animation and resets to the initial state'
			},
			{
				name: 'finish',
				type: '() => void',
				description: 'Immediately jumps the animation to its end state'
			},
			{
				name: 'isRunning',
				type: '() => boolean',
				description: '<code>true</code> while the animation <code>playState</code> is <code>"running"</code>'
			}
		],
		example: `<script lang="ts">
  import { useAnimate } from '@ariefsn/svelte-use';

  let el = $state<HTMLDivElement | null>(null);

  const { play, pause, cancel, finish, isRunning } = useAnimate(
    () => el,
    () => [{ transform: 'translateX(0px)' }, { transform: 'translateX(200px)' }],
    () => ({ duration: 600, easing: 'ease-in-out', fill: 'forwards' })
  );
</script>

<div bind:this={el} style="width:60px;height:60px;background:#a78bfa;border-radius:8px" />

<div>
  <button onclick={play} disabled={isRunning()}>Play</button>
  <button onclick={pause}>Pause</button>
  <button onclick={cancel}>Cancel</button>
  <button onclick={finish}>Finish</button>
</div>

<p>Running: {isRunning()}</p>`,
		notes: [
			'The animation starts <strong>paused</strong> — call <code>play()</code> to begin.',
			'Automatically cancelled and re-created when <code>target</code>, <code>keyframes</code>, or <code>options</code> change reactively.',
			'Cleaned up automatically when the owning component is destroyed.',
			'SSR-safe — no animation is created when <code>target</code> is <code>null</code> or <code>undefined</code>.'
		]
	},

	'use-parallax': {
		slug: 'use-parallax',
		title: 'useParallax',
		description:
			'Tracks mouse movement and exposes the cursor position as an offset relative to the centre of a target element, scaled by a speed multiplier. Use the returned <code>x</code> and <code>y</code> values to drive CSS transforms for parallax depth effects.',
		usage: `import { useParallax } from '@ariefsn/svelte-use';

let el = $state<HTMLDivElement | null>(null);
const { x, y } = useParallax(() => el, { speed: 0.05 });
// Use x and y in style:transform`,
		params: [
			{
				name: 'target',
				type: '() => HTMLElement | null | undefined',
				description: 'Reactive getter returning the reference element'
			},
			{
				name: 'options',
				type: '{ speed?: number }',
				default: 'undefined',
				description: 'Optional configuration object'
			}
		],
		options: [
			{
				name: 'speed',
				type: 'number',
				default: '0.1',
				description: 'Multiplier applied to the raw pixel offset. Negative values invert the direction.'
			}
		],
		returns: [
			{
				name: 'x',
				type: 'number',
				description: 'Reactive getter — horizontal offset in pixels multiplied by <code>speed</code>'
			},
			{
				name: 'y',
				type: 'number',
				description: 'Reactive getter — vertical offset in pixels multiplied by <code>speed</code>'
			}
		],
		example: `<script lang="ts">
  import { useParallax } from '@ariefsn/svelte-use';

  let card = $state<HTMLDivElement | null>(null);
  const { x, y } = useParallax(() => card, { speed: 0.08 });
</script>

<div
  bind:this={card}
  style:transform="translate({x}px, {y}px)"
  style="width:200px;height:120px;background:#1e1e2e;border:1px solid #a78bfa;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#a78bfa"
>
  Move your mouse over me
</div>`,
		notes: [
			'Attaches a single <code>mousemove</code> listener to <code>window</code>.',
			'The offset is calculated relative to the centre of the element\'s bounding box.',
			'Listener is removed automatically when the owning component is destroyed or the target changes.',
			'SSR-safe — no listener is attached when <code>window</code> is unavailable.'
		]
	},

	'use-transition': {
		slug: 'use-transition',
		title: 'useTransition',
		description:
			'Smoothly interpolates a reactive numeric source value using <code>requestAnimationFrame</code>. When the source changes the composable animates the displayed value from the previous value to the new target over a configurable duration.',
		usage: `import { useTransition } from '@ariefsn/svelte-use';

let target = $state(0);
const displayed = useTransition(() => target, { duration: 500 });
// displayed() returns the interpolated value, updating via rAF`,
		params: [
			{
				name: 'source',
				type: '() => number',
				description: 'Reactive getter providing the current target number'
			},
			{
				name: 'options',
				type: '{ duration?: number; easing?: (t: number) => number }',
				default: 'undefined',
				description: 'Optional configuration object'
			}
		],
		options: [
			{
				name: 'duration',
				type: 'number',
				default: '300',
				description: 'Animation duration in milliseconds'
			},
			{
				name: 'easing',
				type: '(t: number) => number',
				default: 'cubicInOut',
				description: 'Easing function where <code>t</code> is in the range [0, 1]. Built-in options: <code>linear</code>, <code>cubicInOut</code>.'
			}
		],
		returns: [
			{
				name: '()',
				type: '() => number',
				description: 'Getter returning the current interpolated value. Read in a reactive context for live updates.'
			}
		],
		example: `<script lang="ts">
  import { useTransition } from '@ariefsn/svelte-use';

  let target = $state(0);
  const displayed = useTransition(() => target, { duration: 600 });
</script>

<p style="font-size:3rem;font-weight:800;color:#a78bfa">
  {displayed().toFixed(1)}
</p>

<div style="display:flex;gap:0.5rem">
  <button onclick={() => (target = 0)}>0</button>
  <button onclick={() => (target = 50)}>50</button>
  <button onclick={() => (target = 100)}>100</button>
</div>`,
		notes: [
			'Built-in easing helpers <code>linear</code> and <code>cubicInOut</code> are exported from the same module.',
			'A pending animation frame is always cancelled before a new one begins — rapid source changes never stack animations.',
			'SSR-safe — jumps directly to the target value when <code>requestAnimationFrame</code> is unavailable.',
			'Works with any numeric value: percentages, pixel values, angles, etc.'
		]
	},

	// ------------------------------------------------------------- Async
	'use-fetch': {
		slug: 'use-fetch',
		title: 'useFetch',
		description:
			'Reactive fetch utility with automatic re-execution when the URL changes, in-flight request abortion via <code>AbortController</code>, and full SSR safety.',
		usage: `import { useFetch } from '@ariefsn/svelte-use';

let id = $state(1);
const { data, error, isFetching, execute } = useFetch(
  () => \`/api/users/\${id}\`
);
// Reactive: changing id automatically refetches`,
		params: [
			{
				name: 'url',
				type: '() => string | undefined',
				description: 'Reactive getter returning the URL to fetch. Pass <code>undefined</code> to skip fetching.'
			},
			{
				name: 'options',
				type: 'UseFetchOptions',
				default: '{}',
				description: 'Optional configuration object'
			}
		],
		options: [
			{
				name: 'immediate',
				type: 'boolean',
				default: 'true',
				description: 'Whether to execute the fetch immediately and re-execute whenever the URL changes'
			},
			{
				name: 'init',
				type: 'RequestInit',
				default: 'undefined',
				description: 'Optional <code>RequestInit</code> options forwarded to every <code>fetch</code> call (headers, method, body, etc.)'
			}
		],
		returns: [
			{
				name: 'data',
				type: '() => T | null',
				description: 'Parsed JSON response, or <code>null</code> before the first successful response'
			},
			{
				name: 'error',
				type: '() => Error | null',
				description: 'Last error, or <code>null</code> when no error has occurred'
			},
			{
				name: 'isFetching',
				type: '() => boolean',
				description: '<code>true</code> while a request is in-flight'
			},
			{
				name: 'execute',
				type: '() => Promise<void>',
				description: 'Manually trigger a fetch. Aborts any in-flight request before starting a new one.'
			}
		],
		example: `<script lang="ts">
  import { useFetch } from '@ariefsn/svelte-use';

  interface Post { id: number; title: string; body: string }

  let postId = $state(1);
  const { data, error, isFetching, execute } = useFetch<Post>(
    () => \`https://jsonplaceholder.typicode.com/posts/\${postId}\`
  );
</script>

<div>
  {#if isFetching()}
    <p>Loading…</p>
  {:else if error()}
    <p>Error: {error()?.message}</p>
  {:else if data()}
    <h3>{data()?.title}</h3>
    <p>{data()?.body}</p>
  {/if}
</div>

<div>
  <button onclick={() => postId--} disabled={postId <= 1}>Prev</button>
  <button onclick={() => postId++}>Next</button>
  <button onclick={execute}>Refetch</button>
</div>`,
		notes: [
			'Automatically aborts the in-flight request when the URL changes or the component is destroyed.',
			'Only JSON responses are parsed — non-OK responses throw an <code>Error</code> with the status code.',
			'Set <code>immediate: false</code> to control fetching manually via <code>execute()</code>.',
			'SSR-safe — no fetch is performed when <code>fetch</code> is unavailable.'
		]
	},

	'use-web-socket': {
		slug: 'use-web-socket',
		title: 'useWebSocket',
		description:
			'Reactive WebSocket utility with optional auto-reconnect, reactive URL changes, and full SSR safety. The socket opens when a URL is provided and closes automatically when the component is destroyed.',
		usage: `import { useWebSocket } from '@ariefsn/svelte-use';

const { data, status, send, close } = useWebSocket(
  () => 'wss://example.com/ws',
  { autoReconnect: true, reconnectInterval: 2000 }
);`,
		params: [
			{
				name: 'url',
				type: '() => string | undefined',
				description: 'Reactive getter returning the WebSocket URL. Pass <code>undefined</code> to stay disconnected.'
			},
			{
				name: 'options',
				type: 'UseWebSocketOptions',
				default: '{}',
				description: 'Optional configuration object'
			}
		],
		options: [
			{
				name: 'protocols',
				type: 'string | string[]',
				default: 'undefined',
				description: 'WebSocket sub-protocol(s) passed to the <code>WebSocket</code> constructor'
			},
			{
				name: 'autoReconnect',
				type: 'boolean',
				default: 'false',
				description: 'Automatically reconnect when the socket closes unexpectedly'
			},
			{
				name: 'reconnectInterval',
				type: 'number',
				default: '1000',
				description: 'Milliseconds to wait between reconnection attempts (requires <code>autoReconnect: true</code>)'
			}
		],
		returns: [
			{
				name: 'data',
				type: '() => T | null',
				description: 'Last deserialized message, or <code>null</code> before the first message'
			},
			{
				name: 'status',
				type: '() => "CONNECTING" | "OPEN" | "CLOSED"',
				description: 'Current connection status'
			},
			{
				name: 'error',
				type: '() => Event | null',
				description: 'Last connection error event, or <code>null</code>'
			},
			{
				name: 'send',
				type: '(data: string | ArrayBufferLike | Blob | ArrayBufferView) => void',
				description: 'Send data through the WebSocket. No-ops when the socket is not <code>OPEN</code>.'
			},
			{
				name: 'close',
				type: '() => void',
				description: 'Close the connection and disable auto-reconnect for the current URL'
			}
		],
		example: `<script lang="ts">
  import { useWebSocket } from '@ariefsn/svelte-use';

  interface ChatMessage { user: string; text: string }

  let input = $state('');
  const { data, status, send, close } = useWebSocket<ChatMessage>(
    () => 'wss://echo.websocket.events',
    { autoReconnect: true }
  );
</script>

<p>Status: <strong>{status()}</strong></p>
{#if data()}
  <p>Last message: {JSON.stringify(data())}</p>
{/if}

<input bind:value={input} placeholder="Type a message…" />
<button onclick={() => send(input)} disabled={status() !== 'OPEN'}>Send</button>
<button onclick={close}>Disconnect</button>`,
		notes: [
			'Incoming messages are automatically parsed as JSON; if parsing fails the raw string value is used.',
			'Call <code>close()</code> to permanently disconnect — this disables auto-reconnect.',
			'Changing the URL getter reactive value triggers a fresh connection.',
			'SSR-safe — no WebSocket is created when <code>WebSocket</code> is unavailable.'
		]
	},

	// -------------------------------------------------------------- Time
	'use-interval': {
		slug: 'use-interval',
		title: 'useInterval',
		description:
			'Reactive interval utility that invokes a callback on a recurring schedule. Starts automatically by default and can be paused and resumed at any time. The delay is a reactive getter — changing it restarts the interval.',
		usage: `import { useInterval } from '@ariefsn/svelte-use';

let delay = $state(1000);
const { pause, resume, isActive } = useInterval(
  () => console.log('tick'),
  () => delay
);
// Ticks every 1000ms immediately. Change delay to restart.`,
		params: [
			{
				name: 'callback',
				type: '() => void',
				description: 'Function to invoke on each tick'
			},
			{
				name: 'delay',
				type: '() => number',
				description: 'Reactive getter returning the interval delay in milliseconds'
			},
			{
				name: 'options',
				type: 'UseIntervalOptions',
				default: '{}',
				description: 'Optional configuration object'
			}
		],
		options: [
			{
				name: 'immediate',
				type: 'boolean',
				default: 'true',
				description: 'Whether to start ticking automatically on initialisation'
			}
		],
		returns: [
			{
				name: 'pause',
				type: '() => void',
				description: 'Stops the interval'
			},
			{
				name: 'resume',
				type: '() => void',
				description: 'Resumes the interval'
			},
			{
				name: 'isActive',
				type: '() => boolean',
				description: '<code>true</code> while the interval is running'
			}
		],
		example: `<script lang="ts">
  import { useInterval } from '@ariefsn/svelte-use';

  let count = $state(0);
  let delay = $state(1000);
  const { pause, resume, isActive } = useInterval(() => count++, () => delay);
</script>

<p>Count: {count} — Active: {isActive()}</p>
<div>
  <button onclick={pause}>Pause</button>
  <button onclick={resume}>Resume</button>
  <button onclick={() => (delay = delay === 1000 ? 300 : 1000)}>
    Toggle speed ({delay}ms)
  </button>
</div>`,
		notes: [
			'Changing the <code>delay</code> getter value clears the existing interval and starts a new one immediately.',
			'SSR-safe — uses only <code>setInterval</code> / <code>clearInterval</code>.',
			'The interval is cleared automatically when the owning reactive scope is destroyed.'
		]
	},

	'use-interval-fn': {
		slug: 'use-interval-fn',
		title: 'useIntervalFn',
		description:
			'Manually-controlled interval utility. Unlike <code>useInterval</code>, this composable does <strong>not</strong> start automatically — you must call <code>resume()</code> explicitly. The delay is a plain number and does not change after initialisation.',
		usage: `import { useIntervalFn } from '@ariefsn/svelte-use';

const { resume, pause, isActive } = useIntervalFn(() => console.log('tick'), 1000);
resume();   // start ticking every 1000ms
pause();    // stop ticking`,
		params: [
			{
				name: 'fn',
				type: '() => void',
				description: 'Function to invoke on each tick'
			},
			{
				name: 'delay',
				type: 'number',
				description: 'Interval delay in milliseconds'
			}
		],
		returns: [
			{
				name: 'resume',
				type: '() => void',
				description: 'Starts the interval'
			},
			{
				name: 'pause',
				type: '() => void',
				description: 'Stops the interval'
			},
			{
				name: 'isActive',
				type: '() => boolean',
				description: '<code>true</code> while the interval is running'
			}
		],
		example: `<script lang="ts">
  import { useIntervalFn } from '@ariefsn/svelte-use';

  let count = $state(0);
  const { resume, pause, isActive } = useIntervalFn(() => count++, 500);
</script>

<p>Count: {count}</p>
<div>
  {#if isActive()}
    <button onclick={pause}>Pause</button>
  {:else}
    <button onclick={resume}>Start</button>
  {/if}
</div>`,
		notes: [
			'Does not start automatically — call <code>resume()</code> to begin.',
			'The delay is fixed at initialisation and cannot be changed reactively (use <code>useInterval</code> for a reactive delay).',
			'The interval is cleared automatically when the owning reactive scope is destroyed.'
		]
	},

	'use-now': {
		slug: 'use-now',
		title: 'useNow',
		description:
			'Returns a reactive getter that yields the current Unix timestamp in milliseconds, updated at a configurable interval. Starts immediately.',
		usage: `import { useNow } from '@ariefsn/svelte-use';

const now = useNow();
now() // e.g. 1700000000000 — updates every second

const precise = useNow({ interval: 100 });
precise() // updates every 100ms`,
		options: [
			{
				name: 'interval',
				type: 'number',
				default: '1000',
				description: 'Update interval in milliseconds'
			}
		],
		returns: [
			{
				name: '()',
				type: '() => number',
				description: 'Current Unix timestamp in milliseconds, updated at the configured interval'
			}
		],
		example: `<script lang="ts">
  import { useNow } from '@ariefsn/svelte-use';

  const now = useNow({ interval: 1000 });
  const formatted = $derived(new Date(now()).toLocaleTimeString());
</script>

<p>Current time: {formatted}</p>`,
		notes: [
			'SSR-safe — uses only <code>Date.now()</code> and <code>setInterval</code>.',
			'The interval is cleared automatically when the owning reactive scope is destroyed.',
			'For a standalone version without options, see <code>useTimestamp</code>.'
		]
	},

	'use-timeout': {
		slug: 'use-timeout',
		title: 'useTimeout',
		description:
			'Reactive timeout utility that schedules a callback after a reactive delay. Starts automatically by default. The timeout is automatically re-scheduled whenever the delay getter returns a new value while running.',
		usage: `import { useTimeout } from '@ariefsn/svelte-use';

let delay = $state(1000);
const { isPending, stop, start } = useTimeout(
  () => console.log('fired'),
  () => delay
);
// Auto-starts. isPending() → true until callback fires.`,
		params: [
			{
				name: 'callback',
				type: '() => void',
				description: 'Function to invoke when the timeout fires'
			},
			{
				name: 'delay',
				type: '() => number',
				description: 'Reactive getter returning the delay in milliseconds'
			},
			{
				name: 'options',
				type: 'UseTimeoutOptions',
				default: '{}',
				description: 'Optional configuration object'
			}
		],
		options: [
			{
				name: 'immediate',
				type: 'boolean',
				default: 'true',
				description: 'Whether to schedule the timeout automatically on initialisation'
			}
		],
		returns: [
			{
				name: 'start',
				type: '() => void',
				description: 'Arms (or re-arms) the timeout from the current point in time'
			},
			{
				name: 'stop',
				type: '() => void',
				description: 'Cancels the pending timeout'
			},
			{
				name: 'isPending',
				type: '() => boolean',
				description: '<code>true</code> while the timeout has been scheduled but has not yet fired'
			}
		],
		example: `<script lang="ts">
  import { useTimeout } from '@ariefsn/svelte-use';

  let message = $state('Waiting…');
  let delay = $state(2000);

  const { isPending, start, stop } = useTimeout(
    () => { message = 'Timeout fired!'; },
    () => delay
  );
</script>

<p>{message}</p>
<p>Pending: {isPending()}</p>
<div>
  <button onclick={start}>Restart</button>
  <button onclick={stop}>Cancel</button>
</div>`,
		notes: [
			'Changing the <code>delay</code> getter while the timeout is pending reschedules it from that moment.',
			'SSR-safe — uses only <code>setTimeout</code> / <code>clearTimeout</code>.',
			'The timeout is cleared automatically when the owning reactive scope is destroyed.'
		]
	},

	'use-timeout-fn': {
		slug: 'use-timeout-fn',
		title: 'useTimeoutFn',
		description:
			'Manually-controlled timeout utility. Unlike <code>useTimeout</code>, this composable does <strong>not</strong> start automatically — you must call <code>start()</code> explicitly. The timeout fires once, then becomes idle.',
		usage: `import { useTimeoutFn } from '@ariefsn/svelte-use';

const { start, stop, isPending } = useTimeoutFn(() => console.log('done'), 1000);
start();        // arms the timeout
isPending();    // → true
// after 1000ms → fn fires, isPending() → false`,
		params: [
			{
				name: 'fn',
				type: '() => void',
				description: 'Function to invoke when the timeout fires'
			},
			{
				name: 'delay',
				type: 'number',
				description: 'Delay in milliseconds'
			}
		],
		returns: [
			{
				name: 'start',
				type: '() => void',
				description: 'Arms (or re-arms) the timeout'
			},
			{
				name: 'stop',
				type: '() => void',
				description: 'Cancels the pending timeout'
			},
			{
				name: 'isPending',
				type: '() => boolean',
				description: '<code>true</code> while the timeout has been armed but has not yet fired'
			}
		],
		example: `<script lang="ts">
  import { useTimeoutFn } from '@ariefsn/svelte-use';

  let status = $state('idle');
  const { start, stop, isPending } = useTimeoutFn(() => {
    status = 'done';
  }, 2000);
</script>

<p>Status: {status} — Pending: {isPending()}</p>
<div>
  <button onclick={() => { status = 'waiting'; start(); }}>Start</button>
  <button onclick={stop}>Cancel</button>
</div>`,
		notes: [
			'Does not start automatically — call <code>start()</code> to arm.',
			'Calling <code>start()</code> while already pending cancels the current timer and re-arms from the current time.',
			'The delay is fixed at initialisation (use <code>useTimeout</code> for a reactive delay).',
			'The timeout is cleared automatically when the owning reactive scope is destroyed.'
		]
	},

	'use-timeout-poll': {
		slug: 'use-timeout-poll',
		title: 'useTimeoutPoll',
		description:
			'Polling utility that chains <code>setTimeout</code> calls to repeatedly invoke a function, avoiding drift issues inherent in <code>setInterval</code>. The interval represents the delay <em>between</em> the end of one execution and the start of the next.',
		usage: `import { useTimeoutPoll } from '@ariefsn/svelte-use';

const { start, stop, isActive } = useTimeoutPoll(() => fetchData(), 5000);
start();    // begin polling every 5 seconds
stop();     // stop polling`,
		params: [
			{
				name: 'fn',
				type: '() => void',
				description: 'Function to invoke on each poll'
			},
			{
				name: 'interval',
				type: 'number',
				description: 'Delay in milliseconds between polls (measured from the end of each execution)'
			}
		],
		returns: [
			{
				name: 'start',
				type: '() => void',
				description: 'Begins polling'
			},
			{
				name: 'stop',
				type: '() => void',
				description: 'Stops polling'
			},
			{
				name: 'isActive',
				type: '() => boolean',
				description: '<code>true</code> while polling is active'
			}
		],
		example: `<script lang="ts">
  import { useTimeoutPoll } from '@ariefsn/svelte-use';

  let pollCount = $state(0);
  let lastPoll = $state('');

  const { start, stop, isActive } = useTimeoutPoll(() => {
    pollCount++;
    lastPoll = new Date().toLocaleTimeString();
  }, 2000);
</script>

<p>Poll count: {pollCount}</p>
<p>Last poll: {lastPoll || '—'}</p>
<div>
  {#if isActive()}
    <button onclick={stop}>Stop polling</button>
  {:else}
    <button onclick={start}>Start polling</button>
  {/if}
</div>`,
		notes: [
			'Uses chained <code>setTimeout</code> rather than <code>setInterval</code>, so long-running <code>fn</code> invocations cannot stack.',
			'Does not start automatically — call <code>start()</code> to begin.',
			'Cleaned up automatically when the owning reactive scope is destroyed.'
		]
	},

	'use-timestamp': {
		slug: 'use-timestamp',
		title: 'useTimestamp',
		description:
			'Returns a reactive getter that yields the current Unix timestamp in milliseconds, updated at a configurable interval. This is a standalone implementation — it does not delegate to <code>useNow</code>.',
		usage: `import { useTimestamp } from '@ariefsn/svelte-use';

const timestamp = useTimestamp();
timestamp() // e.g. 1700000000000 — updates every second

const precise = useTimestamp({ interval: 100 });
precise() // updates every 100ms`,
		options: [
			{
				name: 'interval',
				type: 'number',
				default: '1000',
				description: 'Update interval in milliseconds'
			}
		],
		returns: [
			{
				name: '()',
				type: '() => number',
				description: 'Current Unix timestamp in milliseconds, updated at the configured interval'
			}
		],
		example: `<script lang="ts">
  import { useTimestamp } from '@ariefsn/svelte-use';

  const timestamp = useTimestamp({ interval: 1000 });
</script>

<p>Unix ms: {timestamp()}</p>
<p>ISO: {new Date(timestamp()).toISOString()}</p>`,
		notes: [
			'SSR-safe — uses only <code>Date.now()</code> and <code>setInterval</code>.',
			'The interval is cleared automatically when the owning reactive scope is destroyed.',
			'Similar to <code>useNow</code> — both expose the same API. <code>useNow</code> accepts options via its argument.'
		]
	},

	// --------------------------------------------------------------- Browser
	'use-scroll-lock': {
		slug: 'use-scroll-lock',
		title: 'useScrollLock',
		description:
			'Locks and unlocks scroll on a target element (defaults to <code>document.body</code>) by toggling <code>overflow: hidden</code>. The previous overflow value is captured before locking and restored on unlock.',
		usage: `import { useScrollLock } from '@ariefsn/svelte-use';

const { isLocked, lock, unlock } = useScrollLock();

lock();       // → document.body overflow set to 'hidden'
isLocked();   // → true
unlock();     // → overflow restored to original value`,
		params: [
			{
				name: 'target',
				type: '() => HTMLElement | null | undefined',
				default: 'document.body',
				description:
					'Optional reactive getter returning the element to lock. Falls back to `document.body` when omitted or when the getter returns `null`/`undefined`.'
			}
		],
		returns: [
			{
				name: 'isLocked',
				type: '() => boolean',
				description: '`true` while the element scroll is locked.'
			},
			{
				name: 'lock',
				type: '() => void',
				description:
					'Locks scroll on the target element by setting `overflow: hidden`. Saves the previous overflow value for restoration. No-op when already locked.'
			},
			{
				name: 'unlock',
				type: '() => void',
				description:
					'Unlocks scroll by restoring the overflow value that was saved when `lock()` was called. No-op when not locked.'
			}
		],
		example: `<script lang="ts">
  import { useScrollLock } from '@ariefsn/svelte-use';

  let modalOpen = $state(false);
  const { isLocked, lock, unlock } = useScrollLock();

  $effect(() => {
    if (modalOpen) lock(); else unlock();
  });
</script>

<button onclick={() => (modalOpen = !modalOpen)}>
  {modalOpen ? 'Close modal' : 'Open modal'}
</button>

{#if modalOpen}
  <div class="modal">Scroll is locked while this modal is open.</div>
{/if}

<p>Body scroll locked: {isLocked()}</p>`,
		notes: [
			'SSR-safe — no DOM operations are performed outside the browser.',
			'The previous <code>overflow</code> value is captured before locking and restored when <code>unlock()</code> is called, preventing style leaks.',
			'Scroll is automatically unlocked when the component that owns the reactive scope is destroyed.',
			'Calling <code>lock()</code> multiple times without an intervening <code>unlock()</code> is a no-op — the original overflow is preserved.'
		]
	}
};
