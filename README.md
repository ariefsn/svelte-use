<div align="center">
  <img src="./static/logo.svg" alt="svelte-use logo" width="120" height="120" />

  <h1>@ariefsn/svelte-use</h1>

  <p>A collection of <strong>80+</strong> Svelte 5 runes-first utility composables.<br/>No stores. No external dependencies. SSR-safe. Fully typed.</p>

  <p>
    <a href="https://github.com/ariefsn/svelte-use">
      <img src="https://img.shields.io/badge/GitHub-ariefsn%2Fsvelte--use-181717?logo=github&logoColor=white" alt="GitHub" />
    </a>
    <a href="https://www.npmjs.com/package/@ariefsn/svelte-use">
      <img src="https://img.shields.io/npm/v/@ariefsn/svelte-use?color=a78bfa&logo=npm&logoColor=white" alt="npm version" />
    </a>
    <a href="https://www.npmjs.com/package/@ariefsn/svelte-use">
      <img src="https://img.shields.io/npm/dm/@ariefsn/svelte-use?color=a78bfa" alt="npm downloads" />
    </a>
    <img src="https://img.shields.io/badge/Svelte-5-FF3E00?logo=svelte&logoColor=white" alt="Svelte 5" />
    <img src="https://img.shields.io/badge/TypeScript-first-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  </p>
</div>

---

## Features

|                       |                                                       |
| --------------------- | ----------------------------------------------------- |
| ⚡ **Svelte 5 Runes** | Built for `$state`, `$derived`, `$effect` — no stores |
| 🌲 **Tree-shakable**  | Import only what you use                              |
| 🔒 **Fully typed**    | First-class TypeScript, no `any`                      |
| 🌐 **SSR safe**       | All browser APIs are guarded                          |
| 📦 **Zero deps**      | No runtime dependencies                               |
| 🧹 **Auto cleanup**   | Listeners removed on component destroy                |

---

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

### Animation

| Composable      | Description                                     |
| --------------- | ----------------------------------------------- |
| `useAnimate`    | Reactive Web Animations API wrapper             |
| `useParallax`   | Parallax effect based on pointer or device tilt |
| `useTransition` | Animated numeric transitions with easing        |

### Async

| Composable      | Description                                    |
| --------------- | ---------------------------------------------- |
| `useFetch`      | Reactive fetch with loading/error state        |
| `useWebSocket`  | Reactive WebSocket with auto-reconnect         |
| `useAsyncState` | Reactive async/promise state with loading/error |

### Time

| Composable       | Description                                  |
| ---------------- | -------------------------------------------- |
| `useInterval`    | Reactive interval counter                    |
| `useIntervalFn`  | Run a callback on an interval                |
| `useNow`         | Reactive current Date                        |
| `useTimeout`     | Reactive timeout flag                        |
| `useTimeoutFn`   | Run a callback after a delay                 |
| `useTimeoutPoll` | Poll a callback with timeout-based intervals |
| `useTimestamp`   | Reactive current timestamp (ms)              |

### State

| Composable     | Description                                 |
| -------------- | ------------------------------------------- |
| `useToggle`    | Reactive boolean toggle                     |
| `useCounter`   | Reactive counter with inc/dec/reset         |
| `usePrevious`  | Track previous value of any reactive getter |
| `useSorted`    | Reactive sorted copy of an array            |
| `useCycleList` | Cycle through a list reactively             |
| `useCountdown` | Countdown timer with start/stop/reset       |
| `useTimeAgo`        | Human-readable relative time string         |
| `useAutoResetState` | State that auto-resets to default after delay |
| `useDefaultState`   | State with fallback for null/undefined        |
| `useLastChanged`    | Timestamp of last reactive value change       |
| `useTrackHistory`   | Undo/redo history for reactive values         |
| `useHistoryState`   | State with built-in undo/redo history         |

### Reactivity

| Composable    | Description                                      |
| ------------- | ------------------------------------------------ |
| `useDebounce` | Debounce any reactive getter                     |
| `useWatch`    | Watch reactive values with current/previous args |
| `useWhenever` | Watch that fires only when value becomes truthy  |

### Browser – Keyboard & Scroll

| Composable       | Description                                               |
| ---------------- | --------------------------------------------------------- |
| `useMagicKeys`   | Reactive keyboard state via Proxy — single keys or combos |
| `useKeyModifier` | Track Ctrl/Shift/Alt/Meta state                           |
| `useScroll`      | Scroll position, direction, edge arrival                  |
| `useScrollLock`  | Lock/unlock body scroll                                   |

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

| Composable             | Description                                            |
| ---------------------- | ------------------------------------------------------ |
| `useIdle`              | Detect user idle state                                 |
| `useNetwork`           | Network Information API (downlink, RTT, effectiveType) |
| `useGeolocation`       | Reactive geolocation via watchPosition                 |
| `useBreakpoints`       | Reactive responsive breakpoints                        |
| `useBrowserLocation`   | Reactive browser location (URL, hash, search)          |
| `useNavigatorLanguage` | Reactive navigator language                            |
| `useOnline`            | Reactive online/offline status                         |
| `usePageLeave`         | Detect when user leaves the page                       |
| `useDocumentVisibility`| Reactive document visibility state                     |
| `useWindowFocus`       | Track whether browser window is focused                |
| `useDeviceMotion`      | Device acceleration and rotation data                  |
| `useDeviceOrientation` | Device physical orientation (alpha/beta/gamma)         |
| `useDevicePixelRatio`  | Reactive device pixel ratio for Retina detection       |
| `useScrollbarWidth`    | Measure scrollbar width of an element                  |

### Browser – Storage

| Composable          | Description                             |
| ------------------- | --------------------------------------- |
| `useLocalStorage`   | Reactive localStorage with SSR safety   |
| `useIndexedDB`      | Reactive IndexedDB with CRUD & querying |
| `useBase64`         | Reactive Base64 encode/decode           |
| `useObjectUrl`      | Reactive object URL from Blob/File      |
| `useSessionStorage` | Reactive sessionStorage with SSR safety |

### Browser – Interaction

| Composable        | Description                               |
| ----------------- | ----------------------------------------- |
| `useClickOutside` | Detect clicks outside an element          |
| `useDropZone`     | Drag-and-drop zone with file/data support |
| `useElementHover` | Detect hover state of an element          |
| `useFocus`        | Reactive focus state of an element        |
| `useActiveElement`| Track currently focused element globally   |
| `useLongPress`    | Long press gesture detection               |
| `useStartTyping`  | Detect typing on non-editable elements     |
| `useSwipe`        | Touch swipe gesture detection              |

### Performance

| Composable      | Description                        |
| --------------- | ---------------------------------- |
| `useFps`        | Reactive frames-per-second counter |
| `useThrottleFn` | Throttle any function              |
| `useDebounceFn` | Debounce any function              |

### Virtualization

| Composable       | Description                      |
| ---------------- | -------------------------------- |
| `useVirtualList` | Efficient virtual list rendering |

### Web APIs

| Composable             | Description                         |
| ---------------------- | ----------------------------------- |
| `useClipboard`         | Reactive clipboard read/write       |
| `useBattery`           | Reactive Battery Status API         |
| `useSpeechRecognition` | Reactive Web Speech Recognition API |
| `useEyeDropper`        | EyeDropper API for color picking    |
| `useFileDialog`        | Programmatic file input dialog      |
| `useShare`             | Native Web Share API                |
| `useVibrate`           | Vibration API                       |
| `useWebNotification`   | Desktop notifications API           |
| `usePermission`        | Browser Permissions API             |
| `useWakeLock`          | Screen Wake Lock API                |
| `useEventListener`     | Generic event listener with cleanup |
| `useTextDirection`     | Track/set text directionality       |
| `useTextSelection`     | Track text selection                |

### Browser – Navigation

| Composable            | Description                                 |
| --------------------- | ------------------------------------------- |
| `useNavigationGuard`  | SvelteKit navigation guard with confirm/cancel |

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

### `useFetch`

Reactive fetch wrapper with loading/error state.

```ts
import { useFetch } from '@ariefsn/svelte-use';

const { data, loading, error, execute } = useFetch<User[]>('/api/users');
// data() → User[] | null
// loading() → boolean
// error() → Error | null
```

---

### `useWebSocket`

Reactive WebSocket with auto-reconnect.

```ts
import { useWebSocket } from '@ariefsn/svelte-use';

const ws = useWebSocket('wss://echo.example.com');
ws.send('hello');
ws.data(); // → last received message
ws.status(); // → 'OPEN' | 'CLOSED' | 'CONNECTING'
```

---

### `useAnimate`

Reactive Web Animations API wrapper.

```ts
import { useAnimate } from '@ariefsn/svelte-use';

const { animate, stop } = useAnimate(() => el);
animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
```

---

### `useParallax`

Parallax effect based on pointer position or device tilt.

```ts
import { useParallax } from '@ariefsn/svelte-use';

const { tilt, roll } = useParallax(() => containerEl);
// tilt() → number  (−0.5 to 0.5)
// roll() → number  (−0.5 to 0.5)
```

---

### `useTransition`

Animated numeric transitions with easing.

```ts
import { useTransition } from '@ariefsn/svelte-use';

let target = $state(0);
const animated = useTransition(() => target, { duration: 500 });
// animated() smoothly interpolates to target
```

---

### `useInterval`

Reactive interval counter.

```ts
import { useInterval } from '@ariefsn/svelte-use';

const { counter, pause, resume } = useInterval(1000);
counter(); // → increments every second
```

---

### `useNow`

Reactive current `Date`.

```ts
import { useNow } from '@ariefsn/svelte-use';

const now = useNow();
now(); // → Date (updated every second by default)
```

---

### `useTimestamp`

Reactive current timestamp in milliseconds.

```ts
import { useTimestamp } from '@ariefsn/svelte-use';

const ts = useTimestamp();
ts(); // → number (ms since epoch)
```

---

### `useBreakpoints`

Reactive responsive breakpoints.

```ts
import { useBreakpoints } from '@ariefsn/svelte-use';

const bp = useBreakpoints({ sm: 640, md: 768, lg: 1024 });
bp.lg(); // → true if viewport ≥ 1024px
bp.between('sm', 'lg')(); // → boolean
```

---

### `useClipboard`

Reactive clipboard read/write.

```ts
import { useClipboard } from '@ariefsn/svelte-use';

const { text, copy, copied } = useClipboard();
copy('Hello!');
copied(); // → true for 1.5s after copy
```

---

### `useBattery`

Reactive Battery Status API.

```ts
import { useBattery } from '@ariefsn/svelte-use';

const battery = useBattery();
battery.level(); // → 0–1
battery.charging(); // → boolean
```

---

### `useVirtualList`

Efficient virtual list rendering for large datasets.

```ts
import { useVirtualList } from '@ariefsn/svelte-use';

const { list, containerProps, wrapperProps } = useVirtualList(items, { itemHeight: 40 });
// list() → only the visible slice of items
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

## Links

- 📦 **npm**: https://www.npmjs.com/package/@ariefsn/svelte-use
- 🐙 **GitHub**: https://github.com/ariefsn/svelte-use

## License

[MIT](./LICENSE.md)
