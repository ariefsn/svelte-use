# @ariefsn/svelte-use

Svelte 5 runes-first utility library. No stores, no external deps, SSR-safe, tree-shakable.

## Installation

```sh
npm install @ariefsn/svelte-use
# or
pnpm add @ariefsn/svelte-use
# or
bun add @ariefsn/svelte-use
```

> Requires **Svelte 5** as a peer dependency.

---

## Utilities

### State

| Composable     | Description                                 |
| -------------- | ------------------------------------------- |
| `useToggle`    | Reactive boolean toggle                     |
| `useCounter`   | Reactive counter with inc/dec/reset         |
| `usePrevious`  | Track previous value of any reactive getter |
| `useSorted`    | Reactive sorted copy of an array            |
| `useCycleList` | Cycle through a list reactively             |
| `useCountdown` | Countdown timer with start/stop/reset       |
| `useTimeAgo`   | Human-readable relative time string         |

### Browser – Keyboard & Scroll

| Composable       | Description                                               |
| ---------------- | --------------------------------------------------------- |
| `useMagicKeys`   | Reactive keyboard state via Proxy — single keys or combos |
| `useKeyModifier` | Track Ctrl/Shift/Alt/Meta state                           |
| `useScroll`      | Scroll position, direction, edge arrival                  |

### Browser – Pointer & Drag

| Composable        | Description                                        |
| ----------------- | -------------------------------------------------- |
| `useMouse`        | Viewport-relative pointer position                 |
| `useMousePressed` | Detect mouse button press state                    |
| `useDraggable`    | Full-featured draggable with axis, bounds, handles |

### Browser – Observers

| Composable                | Description                                    |
| ------------------------- | ---------------------------------------------- |
| `useElementSize`          | Reactive element dimensions via ResizeObserver |
| `useIntersectionObserver` | Visibility detection via IntersectionObserver  |
| `useResizeObserver`       | Raw ResizeObserver with callback               |
| `useMutationObserver`     | DOM mutation observation                       |

### Browser – Sensors

| Composable       | Description                                            |
| ---------------- | ------------------------------------------------------ |
| `useIdle`        | Detect user idle state                                 |
| `useNetwork`     | Network Information API (downlink, RTT, effectiveType) |
| `useGeolocation` | Reactive geolocation via watchPosition                 |

### Reactivity / Time / Async

| Composable        | Description                             |
| ----------------- | --------------------------------------- |
| `useDebounce`     | Debounce any reactive getter            |
| `useLocalStorage` | Reactive localStorage with SSR safety   |
| `useIndexedDB`    | Reactive IndexedDB with CRUD & querying |

---

## Composable Reference

### `useToggle`

Reactive boolean toggle.

```ts
import { useToggle } from '@ariefsn/svelte-use';

const { value, toggle, set } = useToggle();
// value → false
toggle(); // value → true
set(false); // value → false
```

| Return   | Type                   | Description               |
| -------- | ---------------------- | ------------------------- |
| `value`  | `boolean` (reactive)   | Current boolean state     |
| `toggle` | `() => void`           | Flips the value           |
| `set`    | `(v: boolean) => void` | Sets the value explicitly |

---

### `useCounter`

Reactive counter with increment, decrement, and reset.

```ts
import { useCounter } from '@ariefsn/svelte-use';

const { value, inc, dec, reset } = useCounter(0);
inc(); // value → 1
inc(5); // value → 6
dec(3); // value → 3
reset(); // value → 0
```

| Return  | Type                       | Description                      |
| ------- | -------------------------- | -------------------------------- |
| `value` | `number` (reactive)        | Current counter value            |
| `inc`   | `(delta?: number) => void` | Increment by `delta` (default 1) |
| `dec`   | `(delta?: number) => void` | Decrement by `delta` (default 1) |
| `reset` | `() => void`               | Reset to initial value           |

---

### `usePrevious`

Tracks the previous value of any reactive getter. Returns `undefined` until the tracked value changes for the first time.

```ts
import { usePrevious } from '@ariefsn/svelte-use';

let count = $state(0);
const prev = usePrevious(() => count);
// prev() → undefined
count = 1;
// prev() → 0
count = 2;
// prev() → 1
```

| Parameter | Type      | Description                         |
| --------- | --------- | ----------------------------------- |
| `getter`  | `() => T` | Reactive getter function to observe |

Returns a `() => T | undefined` getter.

---

### `useDebounce`

Delays a reactive value until the source stops changing for the specified duration.

```ts
import { useDebounce } from '@ariefsn/svelte-use';

let query = $state('');
const debounced = useDebounce(() => query, 500);
// debounced() updates only after 500 ms of inactivity
```

| Parameter | Type      | Default | Description                 |
| --------- | --------- | ------- | --------------------------- |
| `getter`  | `() => T` | —       | Reactive getter to debounce |
| `delay`   | `number`  | `300`   | Delay in milliseconds       |

Returns a `() => T` getter.

---

### `useLocalStorage`

Reactive `localStorage` with SSR safety. Values are serialised with `JSON.stringify` / `JSON.parse`. Falls back to `initial` in non-browser environments or on parse errors.

```ts
import { useLocalStorage } from '@ariefsn/svelte-use';

const theme = useLocalStorage<'light' | 'dark'>('theme', 'light');
theme.set('dark'); // persists to localStorage
theme.value; // 'dark'
```

| Parameter | Type     | Description                           |
| --------- | -------- | ------------------------------------- |
| `key`     | `string` | `localStorage` key                    |
| `initial` | `T`      | Fallback when key is absent or in SSR |

| Return  | Type             | Description                  |
| ------- | ---------------- | ---------------------------- |
| `value` | `T` (reactive)   | Current stored value         |
| `set`   | `(v: T) => void` | Update and persist the value |

---

### `useIndexedDB`

Reactive IndexedDB utility with full CRUD, querying, and filtering. SSR-safe — all operations are no-ops on the server. Values survive page refreshes and browser restarts.

```ts
import { useIndexedDB } from '@ariefsn/svelte-use';

interface Note {
	id?: number;
	text: string;
	done: boolean;
}

const db = useIndexedDB<Note>('my-app', 'notes');

// CRUD
await db.add({ text: 'Buy milk', done: false }); // returns generated key
await db.get(1); // Note | undefined
await db.getAll(); // Note[]
await db.update({ id: 1, text: 'Buy milk', done: true });
await db.remove(1);
await db.clear(); // delete all records

// Reactive state (updated automatically after every mutation)
db.items; // Note[]   — all records
db.loading; // boolean
db.error; // Error | null

// Filtering
const pending = await db.query((n) => !n.done); // Note[]
```

**Options**

| Parameter               | Type      | Default | Description                           |
| ----------------------- | --------- | ------- | ------------------------------------- |
| `dbName`                | `string`  | —       | IndexedDB database name               |
| `storeName`             | `string`  | —       | Object store name                     |
| `options.version`       | `number`  | `1`     | Schema version (increment to migrate) |
| `options.keyPath`       | `string`  | `'id'`  | Primary key field name                |
| `options.autoIncrement` | `boolean` | `true`  | Auto-generate numeric keys            |

**Returns**

| Property / Method | Type                                | Description                                                  |
| ----------------- | ----------------------------------- | ------------------------------------------------------------ |
| `items`           | `T[]` (reactive)                    | All stored records; refreshed after every mutation           |
| `loading`         | `boolean` (reactive)                | `true` while an async operation is in flight                 |
| `error`           | `Error \| null` (reactive)          | Last error, or `null`                                        |
| `add(record)`     | `Promise<IDBValidKey \| undefined>` | Insert record; returns generated key                         |
| `get(key)`        | `Promise<T \| undefined>`           | Fetch single record by primary key                           |
| `getAll()`        | `Promise<T[]>`                      | Fetch all records and sync `items`                           |
| `update(record)`  | `Promise<void>`                     | Replace record (must include key field)                      |
| `remove(key)`     | `Promise<void>`                     | Delete record by primary key                                 |
| `query(filter)`   | `Promise<T[]>`                      | Return records matching a predicate (doesn't modify `items`) |
| `clear()`         | `Promise<void>`                     | Delete all records                                           |

---

### `useSorted`

Returns a reactive sorted copy of an array. Never mutates the source.

```ts
import { useSorted } from '@ariefsn/svelte-use';

let items = $state([3, 1, 4, 1, 5]);
const sorted = useSorted(() => items);
// sorted() → [1, 1, 3, 4, 5]

const desc = useSorted(
	() => items,
	(a, b) => b - a
);
```

---

### `useCycleList`

Cycle through a list reactively. Wraps around at both ends.

```ts
import { useCycleList } from '@ariefsn/svelte-use';

const cycle = useCycleList(['light', 'dark', 'system']);
cycle.state(); // → 'light'
cycle.next(); // → 'dark'
cycle.prev(); // → 'light'
cycle.setIndex(2);
```

---

### `useCountdown`

Countdown timer with start/stop/reset.

```ts
import { useCountdown } from '@ariefsn/svelte-use';

const timer = useCountdown(60); // 60s at 1s intervals
timer.start();
timer.count(); // → 60, 59, …, 0
timer.isActive(); // → true
timer.stop();
timer.reset();
```

---

### `useTimeAgo`

Reactive human-readable relative time string.

```ts
import { useTimeAgo } from '@ariefsn/svelte-use';

const ago = useTimeAgo(() => new Date('2024-01-01'));
ago(); // → "1 year ago"
```

---

### `useMagicKeys`

Track any key or combination via a Proxy.

```ts
import { useMagicKeys } from '@ariefsn/svelte-use';

const keys = useMagicKeys();
keys['ctrl+s'](); // → true while Ctrl+S is held
keys['shift'](); // → true while Shift is held
```

---

### `useKeyModifier`

Track a specific modifier key state.

```ts
import { useKeyModifier } from '@ariefsn/svelte-use';

const ctrl = useKeyModifier('ctrl'); // 'ctrl' | 'shift' | 'alt' | 'meta'
ctrl(); // → true while Ctrl is held
```

---

### `useScroll`

Scroll position, direction flags, edge detection for any scrollable element or `window`.

```ts
import { useScroll } from '@ariefsn/svelte-use';

const scroll = useScroll(); // window
const elScroll = useScroll(() => myEl, { offset: { bottom: 20 } });

scroll.y(); // → number
scroll.isScrolling(); // → boolean
scroll.arrivedState.bottom(); // → boolean
scroll.directions.down(); // → boolean
scroll.scrollTo({ top: 0 });
```

---

### `useMouse`

Tracks viewport-relative pointer position.

```ts
import { useMouse } from '@ariefsn/svelte-use';

const mouse = useMouse();
mouse.x(); // → number
mouse.y(); // → number
mouse.sourceType(); // → 'mouse' | 'touch' | null
```

---

### `useMousePressed`

Detects whether any mouse button is held.

```ts
import { useMousePressed } from '@ariefsn/svelte-use';

const pressed = useMousePressed();
pressed(); // → boolean
```

---

### `useDraggable`

Full-featured draggable with axis constraints, bounds, handles, and callbacks.

```ts
import { useDraggable } from '@ariefsn/svelte-use';

const drag = useDraggable(() => el, {
	axis: 'x',
	initialValue: { x: 100, y: 100 },
	onEnd: (pos) => console.log(pos)
});

drag.x(); // → number
drag.isDragging(); // → boolean
drag.style(); // → "transform: translate(100px, 0px);"
```

---

### `useElementSize`

Reactively tracks element dimensions via `ResizeObserver`.

```ts
import { useElementSize } from '@ariefsn/svelte-use';

const size = useElementSize(() => el);
size.width(); // → number
size.height(); // → number
```

---

### `useIntersectionObserver`

Viewport visibility detection.

```ts
import { useIntersectionObserver } from '@ariefsn/svelte-use';

const { isIntersecting, stop } = useIntersectionObserver(() => el, { threshold: 0.5 });
isIntersecting(); // → boolean
```

---

### `useResizeObserver`

Raw `ResizeObserver` wrapper with automatic cleanup.

```ts
import { useResizeObserver } from '@ariefsn/svelte-use';

const { stop } = useResizeObserver(
	() => el,
	(entry) => {
		console.log(entry.contentRect.width);
	}
);
```

---

### `useMutationObserver`

Observes DOM mutations on any node.

```ts
import { useMutationObserver } from '@ariefsn/svelte-use';

const { stop } = useMutationObserver(
	() => el,
	(mutations) => {
		for (const m of mutations) console.log(m.type);
	},
	{ childList: true, subtree: true }
);
```

---

### `useIdle`

Detect user inactivity.

```ts
import { useIdle } from '@ariefsn/svelte-use';

const { isIdle, reset } = useIdle(5000); // idle after 5s
isIdle(); // → boolean
```

---

### `useNetwork`

Reactive Network Information API.

```ts
import { useNetwork } from '@ariefsn/svelte-use';

const net = useNetwork();
net.effectiveType(); // → '4g' | '3g' | undefined
net.downlink(); // → Mbps | undefined
net.saveData(); // → boolean | undefined
```

---

### `useGeolocation`

Reactive geolocation via `watchPosition`.

```ts
import { useGeolocation } from '@ariefsn/svelte-use';

const geo = useGeolocation({ enableHighAccuracy: true });
geo.coords()?.latitude; // → number | null
geo.error(); // → GeolocationPositionError | null
geo.isSupported(); // → boolean
```

---

## Developing

```sh
bun install
bun run dev
```

To run tests:

```sh
bun run test
```

## Building & Publishing

```sh
# build the library
bun run build

# publish to npm
npm publish --access public
```

## License

MIT
