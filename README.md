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

## Composables

### `useToggle`

Reactive boolean toggle.

```ts
import { useToggle } from '@ariefsn/svelte-use';

const { value, toggle, set } = useToggle();
// value → false
toggle();    // value → true
set(false);  // value → false
```

| Return    | Type                    | Description                     |
|-----------|-------------------------|---------------------------------|
| `value`   | `boolean` (reactive)    | Current boolean state           |
| `toggle`  | `() => void`            | Flips the value                 |
| `set`     | `(v: boolean) => void`  | Sets the value explicitly       |

---

### `useCounter`

Reactive counter with increment, decrement, and reset.

```ts
import { useCounter } from '@ariefsn/svelte-use';

const { value, inc, dec, reset } = useCounter(0);
inc();     // value → 1
inc(5);    // value → 6
dec(3);    // value → 3
reset();   // value → 0
```

| Return   | Type                   | Description                          |
|----------|------------------------|--------------------------------------|
| `value`  | `number` (reactive)    | Current counter value                |
| `inc`    | `(delta?: number) => void` | Increment by `delta` (default 1) |
| `dec`    | `(delta?: number) => void` | Decrement by `delta` (default 1) |
| `reset`  | `() => void`           | Reset to initial value               |

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

| Parameter | Type         | Description                              |
|-----------|--------------|------------------------------------------|
| `getter`  | `() => T`    | Reactive getter function to observe      |

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

| Parameter | Type      | Default | Description                   |
|-----------|-----------|---------|-------------------------------|
| `getter`  | `() => T` | —       | Reactive getter to debounce   |
| `delay`   | `number`  | `300`   | Delay in milliseconds         |

Returns a `() => T` getter.

---

### `useLocalStorage`

Reactive `localStorage` with SSR safety. Values are serialised with `JSON.stringify` / `JSON.parse`. Falls back to `initial` in non-browser environments or on parse errors.

```ts
import { useLocalStorage } from '@ariefsn/svelte-use';

const theme = useLocalStorage<'light' | 'dark'>('theme', 'light');
theme.set('dark');  // persists to localStorage
theme.value;        // 'dark'
```

| Parameter | Type     | Description                                      |
|-----------|----------|--------------------------------------------------|
| `key`     | `string` | `localStorage` key                               |
| `initial` | `T`      | Fallback when key is absent or in SSR            |

| Return  | Type                 | Description                         |
|---------|----------------------|-------------------------------------|
| `value` | `T` (reactive)       | Current stored value                |
| `set`   | `(v: T) => void`     | Update and persist the value        |

---

### `useIndexedDB`

Reactive IndexedDB utility with full CRUD, querying, and filtering. SSR-safe — all operations are no-ops on the server. Values survive page refreshes and browser restarts.

```ts
import { useIndexedDB } from '@ariefsn/svelte-use';

interface Note { id?: number; text: string; done: boolean }

const db = useIndexedDB<Note>('my-app', 'notes');

// CRUD
await db.add({ text: 'Buy milk', done: false }); // returns generated key
await db.get(1);                                  // Note | undefined
await db.getAll();                                // Note[]
await db.update({ id: 1, text: 'Buy milk', done: true });
await db.remove(1);
await db.clear();                                 // delete all records

// Reactive state (updated automatically after every mutation)
db.items;   // Note[]   — all records
db.loading; // boolean
db.error;   // Error | null

// Filtering
const pending = await db.query(n => !n.done);     // Note[]
```

**Options**

| Parameter | Type      | Default | Description                              |
|-----------|-----------|---------|------------------------------------------|
| `dbName`  | `string`  | —       | IndexedDB database name                  |
| `storeName` | `string` | —      | Object store name                        |
| `options.version` | `number` | `1` | Schema version (increment to migrate) |
| `options.keyPath` | `string` | `'id'` | Primary key field name            |
| `options.autoIncrement` | `boolean` | `true` | Auto-generate numeric keys   |

**Returns**

| Property / Method | Type | Description |
|---|---|---|
| `items` | `T[]` (reactive) | All stored records; refreshed after every mutation |
| `loading` | `boolean` (reactive) | `true` while an async operation is in flight |
| `error` | `Error \| null` (reactive) | Last error, or `null` |
| `add(record)` | `Promise<IDBValidKey \| undefined>` | Insert record; returns generated key |
| `get(key)` | `Promise<T \| undefined>` | Fetch single record by primary key |
| `getAll()` | `Promise<T[]>` | Fetch all records and sync `items` |
| `update(record)` | `Promise<void>` | Replace record (must include key field) |
| `remove(key)` | `Promise<void>` | Delete record by primary key |
| `query(filter)` | `Promise<T[]>` | Return records matching a predicate (doesn't modify `items`) |
| `clear()` | `Promise<void>` | Delete all records |

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
