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
	// --------------------------------------------------- Browser – Document
	'use-title': {
		slug: 'use-title',
		title: 'useTitle',
		description:
			'Reads and writes `document.title`. Called with no argument it is read-only and never writes; called with a value it owns the title and restores the previous one on destroy.',
		usage: `import { useTitle } from '@ariefsn/svelte-use';

const title = useTitle('Dashboard');
title.set('Dashboard — 3 alerts');`,
		params: [
			{
				name: 'title',
				type: 'string | (() => string)',
				default: 'undefined',
				description: 'Title to apply, or a getter for a reactive one. Omit for read-only use.'
			},
			{ name: 'options', type: 'UseTitleOptions', default: '{}', description: 'Configuration' }
		],
		options: [
			{
				name: 'restoreOnDestroy',
				type: 'boolean',
				default: 'true',
				description:
					'Restore the title present when the composable initialised, once the scope is destroyed. Ignored in read-only mode.'
			},
			{
				name: 'template',
				type: '(title: string) => string',
				default: '(title) => title',
				description:
					'Wraps the value before writing. Applied to `set()` calls too, so callers never pre-format.'
			},
			{
				name: 'observe',
				type: 'boolean',
				default: 'false',
				description:
					'Track external writes to `document.title` with a `MutationObserver`. Only useful in read-only mode.'
			}
		],
		returns: [
			{ name: 'current', type: '() => string', description: 'The current title' },
			{
				name: 'set',
				type: '(title: string) => void',
				description: 'Writes a new title, passing it through `template`'
			}
		],
		example: `<script lang="ts">
  import { useTitle } from '@ariefsn/svelte-use';

  let unread = $state(0);

  // Live counter in the tab, restored when the component unmounts
  useTitle(() => (unread > 0 ? \`(\${unread}) Inbox\` : 'Inbox'));
</script>

<button onclick={() => unread++}>Receive a message</button>`,
		notes: [
			'Client-side only by nature: it mutates `document.title`, so it does **not** set the server-rendered `<title>` element. Use `<svelte:head>` for metadata that must be in the HTML.',
			'`useTitle()` with no argument is read-only and never writes, which is what stops a display-only consumer clobbering a title set elsewhere.',
			'The restore snapshot is taken at initialisation, so a nested instance hands back whatever the enclosing one set rather than the original page title.',
			'**For SEO, reach for server-rendered metadata instead.** Crawlers and link unfurlers mostly do not execute JavaScript, so a title set here is invisible to them. Use this for a title that changes in response to app state — `(3) Inbox`, a timer, upload progress.'
		]
	},
	'use-favicon': {
		slug: 'use-favicon',
		title: 'useFavicon',
		description:
			'Reads and writes the document favicon. Adopts an existing `link rel="icon"` rather than appending a second one, because browsers choose unpredictably among duplicates.',
		usage: `import { useFavicon } from '@ariefsn/svelte-use';

useFavicon('/icons/alert.svg');`,
		params: [
			{
				name: 'href',
				type: 'string | null | (() => string | null)',
				default: 'undefined',
				description: 'Favicon URL, or a getter. Omit for read-only use.'
			},
			{ name: 'options', type: 'UseFaviconOptions', default: '{}', description: 'Configuration' }
		],
		options: [
			{
				name: 'rel',
				type: 'string',
				default: "'icon'",
				description: '`rel` of the managed link, and the selector used to adopt an existing one'
			},
			{
				name: 'inferType',
				type: 'boolean',
				default: 'true',
				description: "Set the link's `type` from the href's file extension"
			},
			{
				name: 'restoreOnDestroy',
				type: 'boolean',
				default: 'true',
				description:
					'Restore the href present at initialisation on destroy. Applies only to an adopted link — a created one is removed instead.'
			},
			{
				name: 'parent',
				type: '() => HTMLElement | null | undefined',
				default: 'document.head',
				description: 'Container to search and append into'
			}
		],
		returns: [
			{ name: 'current', type: '() => string | null', description: 'The current favicon href' },
			{
				name: 'set',
				type: '(href: string | null) => void',
				description: 'Sets the href. `null` restores the original, or removes a created link.'
			}
		],
		example: `<script lang="ts">
  import { useFavicon } from '@ariefsn/svelte-use';

  let unread = $state(0);

  // Swap the icon while messages are waiting
  useFavicon(() => (unread > 0 ? '/icons/unread.svg' : '/icons/idle.svg'));
</script>`,
		notes: [
			'SSR safe: no DOM is touched and `current()` still reports the resolved href.',
			'An **adopted** link is restored rather than removed on destroy — this library did not put it there, so it does not take it away. A link it **created** is removed.',
			'`inferType` maps `.ico`, `.svg`, `.png`, `.gif`, `.jpg`, `.jpeg`, `.webp` and `.avif`, ignoring any query string or fragment.',
			'Some browsers cache favicons aggressively; append a version query (`/icon.svg?v=2`) if a change does not appear.'
		]
	},
	'use-style-tag': {
		slug: 'use-style-tag',
		title: 'useStyleTag',
		description:
			'Injects a `style` element and keeps its contents in sync. Tags are deduplicated by id, so two call sites sharing an id share one element and it survives until both release it.',
		usage: `import { useStyleTag } from '@ariefsn/svelte-use';

const tag = useStyleTag('.highlight { color: tomato; }');
tag.isLoaded(); // → true in a browser`,
		params: [
			{
				name: 'css',
				type: 'string | (() => string)',
				description: 'CSS text, or a getter for reactive CSS'
			},
			{ name: 'options', type: 'UseStyleTagOptions', default: '{}', description: 'Configuration' }
		],
		options: [
			{
				name: 'id',
				type: 'string',
				default: 'generated',
				description:
					'Element id, and the dedupe key. Omit for a private tag — an anonymous tag is never shared, so passing an explicit id is how a caller opts into sharing.'
			},
			{ name: 'media', type: 'string', default: 'undefined', description: '`media` attribute' },
			{
				name: 'immediate',
				type: 'boolean',
				default: 'true',
				description: 'Inject on initialisation. When `false`, nothing is appended until `load()`.'
			},
			{
				name: 'removeOnDestroy',
				type: 'boolean',
				default: 'true',
				description:
					'Detach the tag once the last consumer is destroyed. Defaults on — the opposite of `useScriptTag`.'
			},
			{
				name: 'parent',
				type: '() => HTMLElement | null | undefined',
				default: 'document.head',
				description: 'Container to append into'
			}
		],
		returns: [
			{ name: 'id', type: 'string', description: 'The element id in use. Stable, not reactive.' },
			{ name: 'css', type: '() => string', description: 'The CSS text currently applied' },
			{
				name: 'isLoaded',
				type: '() => boolean',
				description: 'Whether the tag is in the document'
			},
			{
				name: 'set',
				type: '(css: string) => void',
				description: 'Replaces the CSS text. Overwritten again if a reactive source later changes.'
			},
			{ name: 'load', type: '() => void', description: 'Appends the tag if absent. Idempotent.' },
			{
				name: 'unload',
				type: '() => void',
				description: "Drops this consumer's reference. Idempotent."
			}
		],
		example: `<script lang="ts">
  import { useStyleTag } from '@ariefsn/svelte-use';

  let hue = $state(200);
  useStyleTag(() => \`.themed { color: hsl(\${hue} 80% 60%); }\`);
</script>

<input type="range" min="0" max="360" bind:value={hue} />
<p class="themed">Recoloured as you drag.</p>`,
		notes: [
			'SSR safe: nothing is appended and `isLoaded()` stays `false`, while `css()` still reports the resolved text.',
			'The element is reused as reactive CSS changes rather than recreated.',
			'A **shared** tag is detached only once every consumer has released it, so one component cannot tear down CSS another still needs.',
			'A tag found already in the document is adopted and **never** detached — only a tag this library created is removed.',
			'For component-scoped styling prefer a plain Svelte `<style>` block. This is for CSS whose text is computed at runtime, or that must live outside the component tree.'
		]
	},
	'use-script-tag': {
		slug: 'use-script-tag',
		title: 'useScriptTag',
		description:
			'Loads an external script, deduplicated across every call site. Two components asking for the same URL share one element **and** one promise, so the second resolves as soon as the first has executed.',
		usage: `import { useScriptTag } from '@ariefsn/svelte-use';

const script = useScriptTag('https://cdn.example.com/sdk.js');
await script.load();
script.isLoaded(); // → true`,
		params: [
			{ name: 'src', type: 'string | (() => string)', description: 'Script URL, or a getter' },
			{ name: 'options', type: 'UseScriptTagOptions', default: '{}', description: 'Configuration' }
		],
		options: [
			{
				name: 'id',
				type: 'string',
				default: 'derived from `src`',
				description: 'Element id, and the dedupe key'
			},
			{ name: 'async', type: 'boolean', default: 'true', description: '`async` attribute' },
			{ name: 'defer', type: 'boolean', default: 'false', description: '`defer` attribute' },
			{
				name: 'type',
				type: 'string',
				default: "'text/javascript'",
				description: '`type` attribute'
			},
			{
				name: 'crossOrigin',
				type: "'anonymous' | 'use-credentials'",
				default: 'undefined',
				description: '`crossorigin` attribute'
			},
			{
				name: 'referrerPolicy',
				type: 'ReferrerPolicy',
				default: 'undefined',
				description: '`referrerpolicy` attribute'
			},
			{
				name: 'integrity',
				type: 'string',
				default: 'undefined',
				description: 'Subresource integrity hash'
			},
			{ name: 'noModule', type: 'boolean', default: 'false', description: '`nomodule` attribute' },
			{
				name: 'immediate',
				type: 'boolean',
				default: 'true',
				description: 'Append on initialisation. When `false`, nothing is appended until `load()`.'
			},
			{
				name: 'removeOnDestroy',
				type: 'boolean',
				default: 'false',
				description:
					'Detach the tag once the last consumer is destroyed. Defaults **off** — see the notes.'
			},
			{
				name: 'parent',
				type: '() => HTMLElement | null | undefined',
				default: 'document.head',
				description: 'Container to append into'
			},
			{
				name: 'onLoaded',
				type: '(element) => void',
				default: 'undefined',
				description: 'Called once the script has executed'
			},
			{
				name: 'onError',
				type: '(event: Event) => void',
				default: 'undefined',
				description: 'Called when the script fails to load'
			}
		],
		returns: [
			{ name: 'id', type: 'string', description: 'The element id in use. Stable, not reactive.' },
			{
				name: 'status',
				type: "() => 'idle' | 'loading' | 'loaded' | 'error'",
				description: 'Current lifecycle status'
			},
			{ name: 'isLoading', type: '() => boolean', description: 'Whether the script is in flight' },
			{ name: 'isLoaded', type: '() => boolean', description: 'Whether the script has executed' },
			{ name: 'error', type: '() => Event | null', description: 'The failure event, or `null`' },
			{
				name: 'load',
				type: '() => Promise<HTMLScriptElement>',
				description:
					'Appends the tag if absent and resolves once it has executed. Repeat calls return the same promise.'
			},
			{
				name: 'unload',
				type: '() => void',
				description: "Drops this consumer's reference. Idempotent."
			}
		],
		example: `<script lang="ts">
  import { useScriptTag } from '@ariefsn/svelte-use';

  // Defer loading until the user actually needs it
  const script = useScriptTag('https://cdn.example.com/player.js', {
    immediate: false
  });

  async function play() {
    await script.load();
    // the SDK's globals are available here
  }
</script>

<button onclick={play} disabled={script.isLoading()}>Play</button>`,
		notes: [
			'SSR safe: nothing is appended, `status()` stays `idle`, and `load()` returns a promise that never settles — awaiting it on the server would be a bug in the caller either way.',
			'**`removeOnDestroy` defaults to `false`, unlike `useStyleTag`.** CSS is declarative, so removing the tag reverses it; a script is not — removing it leaves every global it defined, listener it bound and timer it started, while re-adding runs all of that a second time.',
			'The load promise is shared per element, not per composable. A second consumer attaching its own `load` listener after the event had already fired would wait forever.',
			'A tag already present in `app.html` is adopted rather than duplicated. One case is unresolvable: a hand-written tag that finished loading before this composable existed and carries no marker — it will be treated as still loading.',
			'`src` is assigned last when creating the element, since setting it is what starts the fetch.'
		]
	},
	// ------------------------------------------------- Browser – Navigation
	'use-url-search-params': {
		slug: 'use-url-search-params',
		title: 'useUrlSearchParams',
		description:
			'Reads and writes URL parameters reactively. Tracks `popstate` and `hashchange`, so back/forward navigation and external URL edits flow back into the parameters.',
		usage: `import { useUrlSearchParams } from '@ariefsn/svelte-use';

const params = useUrlSearchParams();
params.set('page', '2');
params.get('page'); // → '2'`,
		params: [
			{
				name: 'mode',
				type: "'history' | 'hash' | 'hash-params'",
				default: "'history'",
				description: 'Where the parameters live: `?a=1`, `#/route?a=1`, or `#a=1` respectively'
			},
			{
				name: 'options',
				type: 'UseUrlSearchParamsOptions',
				default: '{}',
				description: 'Configuration'
			}
		],
		options: [
			{
				name: 'write',
				type: "'replace' | 'push' | false",
				default: "'replace'",
				description:
					'`replace` overwrites the current history entry, `push` adds one, and `false` keeps parameters in memory only'
			},
			{
				name: 'debounce',
				type: 'number',
				default: '0',
				description:
					'Milliseconds to coalesce rapid writes. With `push` this controls how many history entries a burst produces.'
			},
			{
				name: 'removeEmptyValues',
				type: 'boolean',
				default: 'true',
				description: 'Drop keys whose value is empty instead of emitting `?key=`'
			},
			{
				name: 'initial',
				type: 'UrlSearchParamsRecord',
				default: '{}',
				description:
					'Values applied for keys the URL does not already define. Never overrides what is in the URL.'
			}
		],
		returns: [
			{
				name: 'params',
				type: '() => UrlSearchParamsRecord',
				description:
					'Snapshot of the current parameters. A fresh object each change, so mutating it does nothing.'
			},
			{
				name: 'get',
				type: '(key: string) => string | string[] | undefined',
				description: 'One parameter, or `undefined` when absent'
			},
			{
				name: 'set',
				type: '(key, value) => void',
				description: 'Sets one parameter and schedules a URL write'
			},
			{ name: 'remove', type: '(key: string) => void', description: 'Removes one parameter' },
			{
				name: 'replace',
				type: '(next) => void',
				description: 'Replaces every parameter in a single write'
			},
			{ name: 'clear', type: '() => void', description: 'Removes every parameter' },
			{
				name: 'query',
				type: '() => string',
				description: 'The serialised parameter string, without a leading `?` or `#`'
			}
		],
		example: `<script lang="ts">
  import { useUrlSearchParams } from '@ariefsn/svelte-use';

  // Keep a search box in the URL, one history entry per pause in typing
  const params = useUrlSearchParams('history', { write: 'push', debounce: 400 });
  const query = $derived((params.get('q') as string) ?? '');
</script>

<input value={query} oninput={(e) => params.set('q', e.currentTarget.value)} />`,
		notes: [
			'SSR safe: parameters resolve to `initial` and no history call is made.',
			'A key appearing once is a bare string; a repeated key (`?a=1&a=2`) becomes an array. `?q=hello` should not force every consumer to unwrap a one-element array.',
			'There is deliberately **no effect that reads the parameters.** An effect writing the URL from them would loop in the hash modes — changing the hash fires `hashchange`, the listener reparses, the effect re-runs. Writes are imperative, reads are event-driven, and an internal record of the last written string lets the listener recognise its own echo.',
			'With `debounce` set, a write still pending when the scope is destroyed is dropped. In practice the scope is being destroyed during navigation and the URL is about to change anyway.',
			'`useBrowserLocation` does not observe `pushState`/`replaceState`, because neither fires an event — so a sibling `useBrowserLocation` goes stale after a write here.'
		]
	},
	// ----------------------------------------------- Async – Streams & Workers
	'use-event-source': {
		slug: 'use-event-source',
		title: 'useEventSource',
		description:
			'Server-sent events with reactive state. One-way and text-only, and the **browser** reconnects on its own — so there is deliberately no `autoReconnect` option.',
		usage: `import { useEventSource } from '@ariefsn/svelte-use';

const stream = useEventSource<string>(
  () => 'https://sse.tools.typinks.com/api/story'
);
stream.data();   // → each token as it streams in
stream.status(); // → 'CONNECTING' | 'OPEN' | 'CLOSED'`,
		params: [
			{
				name: 'url',
				type: '() => string | undefined',
				description: 'Getter for the endpoint. Return `undefined` to stay disconnected.'
			},
			{
				name: 'options',
				type: 'UseEventSourceOptions',
				default: '{}',
				description: 'Credentials, named events and connect-on-init behaviour'
			}
		],
		options: [
			{
				name: 'withCredentials',
				type: 'boolean',
				default: 'false',
				description: 'Send cookies and HTTP auth to a cross-origin endpoint'
			},
			{
				name: 'events',
				type: 'readonly string[]',
				default: '[]',
				description:
					'Named events to subscribe to. A server sending `event: ping` does **not** reach the default handler, so an unlisted name is silently dropped.'
			},
			{
				name: 'immediate',
				type: 'boolean',
				default: 'true',
				description: 'Connect as soon as the URL resolves. `false` waits for `open()`.'
			}
		],
		returns: [
			{
				name: 'data',
				type: '() => T | null',
				description: 'The last payload, JSON-parsed when possible'
			},
			{
				name: 'event',
				type: '() => string | null',
				description: "Name of the last event — `'message'` for unnamed ones"
			},
			{
				name: 'lastEventId',
				type: '() => string | null',
				description:
					'The last `id:` field the server sent, or `null` if it sends none. Most endpoints do not, so `null` is normal rather than a fault.'
			},
			{ name: 'status', type: '() => EventSourceStatus', description: 'Connection state' },
			{ name: 'error', type: '() => Event | null', description: 'The last error event' },
			{
				name: 'source',
				type: '() => EventSource | null',
				description: 'The underlying `EventSource`, for anything this does not wrap'
			},
			{ name: 'open', type: '() => void', description: 'Connects, if not already connected' },
			{
				name: 'close',
				type: '() => void',
				description: 'Closes the stream and stops the browser reconnecting'
			}
		],
		example: `<script lang="ts">
  import { untrack } from 'svelte';
  import { useEventSource } from '@ariefsn/svelte-use';

  // A live endpoint you can try: it streams a story token by token
  let endpoint = $state('https://sse.tools.typinks.com/api/story');

  // Named events must be listed, or they never arrive
  const stream = useEventSource<string>(() => endpoint || undefined, {
    events: ['ping']
  });

  // Accumulate, since each frame replaces data()
  let story = $state('');
  $effect(() => {
    const chunk = stream.data();
    if (chunk !== null) untrack(() => (story += chunk));
  });
</script>

<p>Status: {stream.status()}</p>
<p>{story}</p>
<button onclick={stream.close}>Stop</button>`,
		notes: [
			'**There is no `autoReconnect` option on purpose.** `EventSource` reconnects by itself when a connection drops, honouring the server’s `retry:` interval. Adding another layer on top would fight it.',
			"What the browser does *not* recover from is an HTTP-level failure — a 404, or a response that is not `text/event-stream`. That closes the stream permanently and shows up as `status() === 'CLOSED'` with a non-null `error()`. A retryable drop reports `'CONNECTING'` instead, so the two are distinguishable.",
			'Named events bypass the default handler entirely. If a server sends `event: ping` and `ping` is not in `events`, the message is dropped with no warning — this is the most common surprise with SSE.',
			'Messages are text only. A payload that parses as JSON is parsed; anything else is left as a string.',
			'Changing the URL closes the old connection first, and a late frame from it is ignored rather than overwriting fresher state.',
			'`data()` holds the **latest** frame, not an accumulation. A token-streaming endpoint therefore needs the consumer to append, and appending inside an `$effect` must be wrapped in `untrack` — `story += chunk` reads and writes the same state, which would otherwise re-trigger the effect forever.',
			'**`lastEventId()` is `null` for most endpoints, and that is not a fault.** It reflects the optional `id:` field. Its only job is resumption: when a stream drops, the browser reconnects by itself and sends the last id back as a `Last-Event-ID` request header, so the server can continue from that point instead of replaying from the start. A server that sends only `data:` lines — which is the common case — has nothing to resume from, and the spec leaves the value as an empty string.',
			"Likewise `event()` reports `'message'` for any frame the server did not name. A non-null `event()` other than `'message'` means the server sent an explicit `event:` line *and* you listed that name in `events`.",
			"SSR safe: nothing connects and `status()` is `'CLOSED'`."
		]
	},
	'use-broadcast-channel': {
		slug: 'use-broadcast-channel',
		title: 'useBroadcastChannel',
		description:
			'Cross-tab messaging over `BroadcastChannel`. Every tab, worker and iframe on the same origin using the same channel name receives what the others post — but the sender never receives its own message.',
		usage: `import { useBroadcastChannel } from '@ariefsn/svelte-use';

const channel = useBroadcastChannel<{ userId: string }>({ name: 'auth' });
channel.post({ userId: 'u1' });
channel.data(); // → what another tab posted`,
		params: [
			{
				name: 'options',
				type: 'UseBroadcastChannelOptions',
				description: 'The channel name'
			}
		],
		options: [
			{
				name: 'name',
				type: 'string',
				description:
					'Channel name. Every context using the same name on the same origin shares the channel.'
			}
		],
		returns: [
			{
				name: 'isSupported',
				type: '() => boolean',
				description: 'Whether `BroadcastChannel` exists'
			},
			{ name: 'data', type: '() => T | null', description: 'The last message received' },
			{
				name: 'error',
				type: '() => MessageEvent | null',
				description: 'The last `messageerror` — a payload that could not be deserialised'
			},
			{ name: 'isClosed', type: '() => boolean', description: 'Whether the channel is closed' },
			{
				name: 'post',
				type: '(data: T) => void',
				description: 'Posts to every **other** context on this channel'
			},
			{ name: 'close', type: '() => void', description: 'Closes the channel' }
		],
		example: `<script lang="ts">
  import { useBroadcastChannel } from '@ariefsn/svelte-use';
  import { goto } from '$app/navigation';

  const auth = useBroadcastChannel<{ userId: string | null }>({ name: 'auth' });

  // Signing out in one tab signs out the others
  $effect(() => {
    if (auth.data()?.userId === null) goto('/login');
  });
</script>

<button onclick={() => auth.post({ userId: null })}>Sign out everywhere</button>`,
		notes: [
			'**The sender never receives its own message.** This is the usual source of confusion when testing with a single tab — open a second one, or create two instances.',
			'Payloads travel by **structured clone**, not JSON. Objects, `Map`, `Set`, `Date`, `ArrayBuffer` and typed arrays all survive, and a string arrives as the string it was. Functions, DOM nodes and class behaviour do not; posting one throws a `DataCloneError`.',
			'This is why `useBroadcastChannel` deliberately does **not** share the JSON parsing that `useWebSocket` and `useEventSource` use. Running it here would turn a payload of `\'{"a":1}\'` into an object the sender never sent.',
			'`useColorMode` uses a *same-page* channel internally rather than this one, because `BroadcastChannel` does not deliver to the context that posted — and that util needs sibling instances in the same tab to update.',
			'Delivery is asynchronous, so a message posted now is not readable on the next line.',
			'SSR safe: `isSupported()` is `false` and `post()` is a no-op.'
		]
	},
	'use-web-worker-fn': {
		slug: 'use-web-worker-fn',
		title: 'useWebWorkerFn',
		description:
			'Runs a function on a Web Worker, off the main thread. The function is serialised with `toString()`, so it **must be entirely self-contained** — it cannot see imports, module constants or closures from the file it was written in.',
		usage: `import { useWebWorkerFn } from '@ariefsn/svelte-use';

const sorter = useWebWorkerFn((numbers: number[]) =>
  [...numbers].sort((a, b) => a - b)
);

const sorted = await sorter.run([5, 1, 4]);`,
		params: [
			{
				name: 'fn',
				type: '(...args: TArgs) => TResult | Promise<TResult>',
				description: 'A self-contained function to run off-thread'
			},
			{
				name: 'options',
				type: 'UseWebWorkerFnOptions',
				default: '{}',
				description: 'Timeout and `importScripts` dependencies'
			}
		],
		options: [
			{
				name: 'timeout',
				type: 'number',
				default: 'undefined',
				description: 'Milliseconds before a run is abandoned and the worker terminated'
			},
			{
				name: 'dependencies',
				type: 'readonly string[]',
				default: '[]',
				description:
					'Scripts to `importScripts()` inside the worker, as absolute URLs. The supported way to give the function code it does not carry itself.'
			}
		],
		returns: [
			{
				name: 'isSupported',
				type: '() => boolean',
				description: 'Whether `Worker`, `Blob` and `URL.createObjectURL` are all available'
			},
			{
				name: 'run',
				type: '(...args: TArgs) => Promise<TResult>',
				description: 'Runs the function off-thread. Starting a run cancels the previous one.'
			},
			{
				name: 'status',
				type: '() => WebWorkerStatus',
				description:
					"State of the most recent run: `'PENDING'`, `'RUNNING'`, `'SUCCESS'`, `'ERROR'`, `'TIMEOUT'` or `'TERMINATED'`"
			},
			{
				name: 'terminate',
				type: '() => void',
				description:
					"Terminates the running worker. The pending promise rejects and `status()` becomes `'TERMINATED'`."
			}
		],
		example: `<script lang="ts">
  import { useWebWorkerFn } from '@ariefsn/svelte-use';

  // Self-contained: everything it touches is an argument or a built-in
  const primes = useWebWorkerFn((limit: number) => {
    const sieve = new Uint8Array(limit + 1);
    const found: number[] = [];
    for (let n = 2; n <= limit; n++) {
      if (sieve[n]) continue;
      found.push(n);
      for (let m = n * n; m <= limit; m += n) sieve[m] = 1;
    }
    return found;
  }, { timeout: 5000 });

  let result = $state<number[]>([]);
</script>

<button onclick={async () => (result = await primes.run(5_000_000))}>
  Compute
</button>
<p>{primes.status()} — {result.length} primes</p>`,
		notes: [
			'**The function must be self-contained.** It is serialised with `Function.prototype.toString()` and re-created in a fresh worker scope, so imports, module-level constants and closed-over variables are all unavailable. Referencing one throws *inside the worker* — TypeScript cannot catch it, and the call site looks fine.',
			'Arguments and the return value cross by structured clone, so they may be objects, `Map`, `Set`, `Date` or typed arrays, but not functions, DOM nodes or class instances with behaviour. A non-cloneable argument rejects the promise rather than failing silently.',
			'**Async functions written in a `.svelte` or `.svelte.ts` file need no special handling, but only because this works around a compiler detail.** Svelte rewrites every `await` to `(await $.track_reactivity_loss(p))()`, where `$` is its internal import — a name that does not exist in a worker. A small shim for `$` is injected into the worker scope, so `$` is a reserved name there.',
			'Each `run()` gets a fresh worker, so no state leaks between runs, and starting a run cancels the previous one — its promise rejects rather than resolving late.',
			"`terminate()` moves the status to `'TERMINATED'`, not `'ERROR'` — the run was cancelled deliberately, not broken. It is also a distinct state from `'RUNNING'` on purpose: a button disabled while `status() === 'RUNNING'` would otherwise stay disabled forever after a cancel. Terminating while idle changes nothing.",
			'The Blob URL backing the worker is revoked on completion, timeout, `terminate()` and scope destroy. Skipping that leaks a URL per run.',
			'A strict Content Security Policy needs `worker-src blob:`, or worker construction throws.',
			'SSR safe: `isSupported()` is `false` and `run()` rejects.'
		]
	},
	// ------------------------------------------------------ Browser – Media
	'use-user-media': {
		slug: 'use-user-media',
		title: 'useUserMedia',
		description:
			'Camera and microphone capture via `getUserMedia`. Nothing is requested until `start()` is called, and changing `constraints` while a stream is live reacquires it — which is how you switch device.',
		usage: `import { useUserMedia } from '@ariefsn/svelte-use';

const camera = useUserMedia({ constraints: { video: true } });
await camera.start();
camera.stream(); // → MediaStream | null`,
		params: [
			{
				name: 'options',
				type: 'UseUserMediaOptions',
				default: '{}',
				description: 'Capture configuration'
			}
		],
		options: [
			{
				name: 'constraints',
				type: 'MediaStreamConstraints | (() => MediaStreamConstraints)',
				default: '{ audio: true, video: true }',
				description:
					'Constraints for `getUserMedia`. A getter makes them reactive: changing them while a stream is live stops it and reacquires with the new ones.'
			},
			{
				name: 'flip',
				type: 'UserMediaFlip | (() => UserMediaFlip)',
				default: "'none'",
				description:
					"How to mirror the **preview**: `'none'`, `'horizontal'`, `'vertical'` or `'both'`. Display only — it produces a CSS transform and never touches the captured pixels."
			}
		],
		returns: [
			{ name: 'isSupported', type: '() => boolean', description: 'Whether `getUserMedia` exists' },
			{
				name: 'stream',
				type: '() => MediaStream | null',
				description: 'The live stream, or `null` when nothing is being captured'
			},
			{ name: 'isActive', type: '() => boolean', description: 'Whether a stream is live' },
			{
				name: 'error',
				type: '() => DOMException | null',
				description:
					"The last failure. `error()?.name === 'NotAllowedError'` is a denied prompt; `NotFoundError` means no matching device."
			},
			{
				name: 'start',
				type: '() => Promise<MediaStream | null>',
				description: 'Acquires a stream, or returns the existing one. Resolves `null` on failure.'
			},
			{ name: 'stop', type: '() => void', description: 'Stops every track and clears the stream' },
			{
				name: 'restart',
				type: '() => Promise<MediaStream | null>',
				description: 'Stops, then acquires again'
			},
			{ name: 'flip', type: '() => UserMediaFlip', description: 'The current flip setting' },
			{
				name: 'transform',
				type: '() => string',
				description:
					"CSS `transform` for the preview element — `'scaleX(-1)'` for a horizontal flip, `'none'` otherwise"
			}
		],
		example: `<script lang="ts">
  import { useUserMedia } from '@ariefsn/svelte-use';

  let deviceId = $state<string | undefined>(undefined);

  // Switching deviceId reacquires automatically — no manual stop/start.
  // Mirroring the self-view costs nothing and never re-prompts.
  const camera = useUserMedia({
    constraints: () => ({ video: deviceId ? { deviceId } : true }),
    flip: 'horizontal'
  });
</script>

<button onclick={() => camera.start()} disabled={camera.isActive()}>Start</button>
<button onclick={camera.stop} disabled={!camera.isActive()}>Stop</button>

{#if camera.error()}
  <p>{camera.error()?.name === 'NotAllowedError' ? 'Permission denied' : 'Capture failed'}</p>
{/if}

{#if camera.stream()}
  <video
    srcobject={camera.stream()!}
    style:transform={camera.transform()}
    autoplay
    playsinline
    muted
  ></video>
{/if}`,
		notes: [
			'Capture never starts on its own. A permission prompt should follow a user action, not a page load.',
			'Calling `start()` twice in the same tick yields **one** stream and one prompt. Without that guard a double click opens two camera streams, and the second leaks.',
			'A request that resolves after `stop()` has its tracks stopped rather than becoming the live stream — otherwise the camera light stays on with nothing referencing it.',
			'Constraints are compared by their serialised form, so an inline `() => ({ video: true })` does not reacquire on every render just because the object identity changed.',
			'Releasing the `MediaStream` reference is not enough to turn the camera off; every track must be stopped. `stop()` and the destroy teardown both do this.',
			'**`flip` mirrors the preview, not the capture.** A `MediaStream`’s pixels cannot be flipped without reprocessing every frame, so `transform()` is a CSS value for the element showing the stream. Anything you record, upload or send over WebRTC is unmirrored — which is what you want: a self-view reads naturally when mirrored, but the person at the other end should see you the right way round. If you genuinely need flipped *pixels*, draw the video to a canvas and use `canvas.captureStream()`.',
			'`flip` never reacquires the stream, so it can be toggled live without a second permission prompt — unlike `constraints`, which does reacquire by design.',
			'Set `srcobject` (lowercase) in Svelte markup; Svelte maps it to the `srcObject` property, which cannot be expressed as a plain HTML attribute.',
			'SSR safe: `isSupported()` is `false` and `start()` resolves `null`.'
		]
	},
	'use-display-media': {
		slug: 'use-display-media',
		title: 'useDisplayMedia',
		description:
			'Screen, window or tab capture via `getDisplayMedia`. Watches for the browser’s own “Stop sharing” control, which ends the tracks without notifying the page.',
		usage: `import { useDisplayMedia } from '@ariefsn/svelte-use';

const screen = useDisplayMedia();
await screen.start(); // opens the picker — needs a user gesture`,
		params: [
			{
				name: 'options',
				type: 'UseDisplayMediaOptions',
				default: '{}',
				description: 'Capture configuration'
			}
		],
		options: [
			{
				name: 'options',
				type: 'DisplayMediaStreamOptions | (() => DisplayMediaStreamOptions)',
				default: '{ video: true }',
				description:
					'Passed to `getDisplayMedia`. Unlike `useUserMedia`, changing these does **not** reacquire a live stream — they apply to the next `start()`.'
			}
		],
		returns: [
			{
				name: 'isSupported',
				type: '() => boolean',
				description: 'Whether `getDisplayMedia` exists'
			},
			{
				name: 'stream',
				type: '() => MediaStream | null',
				description: 'The captured stream, or `null`'
			},
			{ name: 'isActive', type: '() => boolean', description: 'Whether capture is live' },
			{
				name: 'error',
				type: '() => DOMException | null',
				description: 'The last failure — `NotAllowedError` when the picker is dismissed'
			},
			{
				name: 'start',
				type: '() => Promise<MediaStream | null>',
				description: 'Opens the picker and acquires a stream'
			},
			{ name: 'stop', type: '() => void', description: 'Stops capture' },
			{
				name: 'restart',
				type: '() => Promise<MediaStream | null>',
				description: 'Stops, then opens the picker again'
			}
		],
		example: `<script lang="ts">
  import { useDisplayMedia } from '@ariefsn/svelte-use';

  const screen = useDisplayMedia({ options: { video: true, audio: false } });
</script>

<button onclick={() => screen.start()} disabled={screen.isActive()}>Share screen</button>
<button onclick={screen.stop} disabled={!screen.isActive()}>Stop</button>

<!-- Flips back to false on its own when the browser's "Stop sharing" is used -->
<p>Sharing: {screen.isActive()}</p>`,
		notes: [
			'`start()` must be called from a user gesture; browsers reject a picker opened without one.',
			'Ending capture from the browser’s own floating “Stop sharing” bar ends the tracks silently. This composable listens for that and clears `stream()`, so `isActive()` is trustworthy — a naive wrapper reports a live stream forever afterwards.',
			'Reactive `options` deliberately do **not** trigger a reacquire. Reopening the picker because a checkbox changed would be hostile; call `restart()` explicitly instead.',
			'Audio capture is not universally available — Chromium can capture tab audio, and Safari captures none.',
			'SSR safe: `isSupported()` is `false` and `start()` resolves `null`.'
		]
	},
	'use-devices-list': {
		slug: 'use-devices-list',
		title: 'useDevicesList',
		description:
			'The list of media input and output devices, grouped by kind and refreshed on `devicechange`. Until access is granted every `label` is an empty string, which `permissionGranted()` reports and `ensurePermissions()` resolves.',
		usage: `import { useDevicesList } from '@ariefsn/svelte-use';

const devices = useDevicesList();
devices.videoInputs(); // → readonly MediaDeviceInfo[]`,
		params: [
			{
				name: 'options',
				type: 'UseDevicesListOptions',
				default: '{}',
				description: 'Permission behaviour for the initial enumeration'
			}
		],
		options: [
			{
				name: 'requestPermissions',
				type: 'boolean',
				default: 'false',
				description:
					'Ask for access on init so labels are populated immediately. This shows a prompt, so leave it off unless the component only renders after a user action.'
			},
			{
				name: 'constraints',
				type: 'MediaStreamConstraints',
				default: '{ audio: true, video: true }',
				description: 'Constraints for the throwaway stream used to reveal labels'
			}
		],
		returns: [
			{
				name: 'isSupported',
				type: '() => boolean',
				description: 'Whether `enumerateDevices` exists'
			},
			{
				name: 'devices',
				type: '() => readonly MediaDeviceInfo[]',
				description: 'Every device, in the browser’s order'
			},
			{
				name: 'audioInputs',
				type: '() => readonly MediaDeviceInfo[]',
				description: 'Microphones and other audio sources'
			},
			{
				name: 'audioOutputs',
				type: '() => readonly MediaDeviceInfo[]',
				description: 'Speakers and other audio sinks'
			},
			{
				name: 'videoInputs',
				type: '() => readonly MediaDeviceInfo[]',
				description: 'Cameras'
			},
			{
				name: 'permissionGranted',
				type: '() => boolean',
				description: 'Whether labels are populated, i.e. access has been granted'
			},
			{
				name: 'ensurePermissions',
				type: '() => Promise<boolean>',
				description: 'Requests access so labels become readable. Resolves whether it worked.'
			},
			{
				name: 'update',
				type: '() => Promise<void>',
				description: 'Re-enumerates. Called automatically on `devicechange`.'
			}
		],
		example: `<script lang="ts">
  import { useDevicesList, useUserMedia } from '@ariefsn/svelte-use';

  const devices = useDevicesList();
  let deviceId = $state<string | undefined>(undefined);
  const camera = useUserMedia({
    constraints: () => ({ video: deviceId ? { deviceId } : true })
  });
</script>

{#if !devices.permissionGranted()}
  <button onclick={devices.ensurePermissions}>Show device names</button>
{/if}

<select bind:value={deviceId}>
  {#each devices.videoInputs() as camera (camera.deviceId)}
    <option value={camera.deviceId}>{camera.label || 'Camera'}</option>
  {/each}
</select>`,
		notes: [
			'`enumerateDevices()` always resolves, but before access is granted every entry has an empty `label` and an empty `deviceId`. A picker built on it renders a list of blanks, which is why `permissionGranted()` exists.',
			'`ensurePermissions()` opens a stream purely so the browser reveals labels, then stops it immediately. It is a no-op when labels are already present.',
			'The list refreshes on `devicechange`, so plugging in a headset updates it without a reload.',
			'This is the composable that drives a device picker for `useUserMedia` — pass a chosen `deviceId` into its constraints and the stream switches automatically.',
			'Enumeration can reject inside a cross-origin iframe without the right permissions policy; that surfaces as an empty list rather than a throw.',
			'SSR safe: `isSupported()` is `false` and every list is empty.'
		]
	},
	// ------------------------------------------------- Browser – Appearance
	'use-color-mode': {
		slug: 'use-color-mode',
		title: 'useColorMode',
		description:
			'Reactive colour mode with `auto` resolution, persistence and cross-tab sync. `auto` follows the OS preference and keeps following it, because resolution is derived rather than snapshotted.',
		usage: `import { useColorMode } from '@ariefsn/svelte-use';

const theme = useColorMode();
theme.toggle();
theme.isDark(); // → true`,
		params: [
			{
				name: 'options',
				type: 'UseColorModeOptions',
				default: '{}',
				description: 'Configuration'
			}
		],
		options: [
			{
				name: 'target',
				type: '() => HTMLElement | null | undefined',
				default: 'document.documentElement',
				description: 'Element receiving the mode'
			},
			{
				name: 'attribute',
				type: 'string',
				default: "'class'",
				description:
					'Attribute to write. The literal `class` toggles a class instead of calling `setAttribute`.'
			},
			{
				name: 'modes',
				type: 'Record<ResolvedColorMode, string>',
				default: "{ light: 'light', dark: 'dark' }",
				description:
					'Maps each resolved mode to the attribute value or class name it writes. An empty string removes the attribute, or adds no class.'
			},
			{
				name: 'initialValue',
				type: 'ColorModeSelection',
				default: "'auto'",
				description:
					'Selection used before storage is consulted. Pass `dark` to hard-default to dark regardless of the OS setting.'
			},
			{
				name: 'storageKey',
				type: 'string | null',
				default: "'svelte-use-color-mode'",
				description: 'Persistence key. `null` disables persistence and keeps the mode in memory.'
			},
			{
				name: 'storageArea',
				type: "'local' | 'session'",
				default: "'local'",
				description: 'Which Web Storage area persists the mode'
			},
			{
				name: 'disableTransition',
				type: 'boolean',
				default: 'true',
				description:
					'Suppress CSS transitions for one frame while the mode flips, so colours swap instantly instead of cross-fading every transitioned property'
			},
			{
				name: 'onChanged',
				type: '(resolved, applyDefault) => void',
				default: 'undefined',
				description:
					'Replaces the default DOM write. Receives the resolved mode and the default applier, so it can decorate rather than fully replace.'
			}
		],
		returns: [
			{
				name: 'mode',
				type: '() => ColorModeSelection',
				description: 'The current selection, which may be `auto`'
			},
			{
				name: 'resolved',
				type: '() => ResolvedColorMode',
				description: 'The selection with `auto` resolved against the OS preference'
			},
			{ name: 'isDark', type: '() => boolean', description: 'Whether the resolved mode is `dark`' },
			{
				name: 'system',
				type: "() => 'light' | 'dark'",
				description: 'The OS preference, regardless of the current selection'
			},
			{ name: 'set', type: '(mode) => void', description: 'Selects a mode and persists it' },
			{
				name: 'toggle',
				type: '() => void',
				description:
					'Flips between light and dark based on what is currently resolved, and therefore leaves `auto`'
			},
			{
				name: 'reset',
				type: '() => void',
				description: 'Returns to `initialValue` and clears the persisted selection'
			}
		],
		example: `<script lang="ts">
  import { useColorMode } from '@ariefsn/svelte-use';

  const theme = useColorMode({ initialValue: 'dark', attribute: 'data-theme' });
</script>

{#each ['auto', 'light', 'dark'] as const as option}
  <button class:active={theme.mode() === option} onclick={() => theme.set(option)}>
    {option}
  </button>
{/each}`,
		notes: [
			'A separate `useDark` is deliberately absent — it is `useColorMode().isDark`.',
			'**A composable cannot prevent the first-paint flash.** It runs after hydration, which is after first paint, so a stored mode differing from the server-rendered one always flashes. Paste `colorModeScript()` into `app.html` inside `<head>`, above every stylesheet, to fix it.',
			'`colorModeScript()` takes the same `storageKey`, `attribute`, `modes` and `initialValue` — pass the same values to both or the script will apply the wrong thing.',
			'The selection is stored as a bare value (`dark`, not `"dark"`), so the pre-paint script needs no `JSON.parse`.',
			'Unlike `useTextDirection`, this does **not** run a `MutationObserver`: it owns the attribute rather than sharing it, and two instances both observing and writing would mutually re-trigger. Editing the attribute by hand is therefore not adopted.',
			'Two instances in the same page stay in sync through an internal channel, because the `storage` event does not fire in the tab that caused the write.'
		]
	},
	'use-preferred-dark': {
		slug: 'use-preferred-dark',
		title: 'usePreferredDark',
		description:
			'Reactively tracks whether the OS requests a dark colour scheme, via `(prefers-color-scheme: dark)`.',
		usage: `import { usePreferredDark } from '@ariefsn/svelte-use';

const isDark = usePreferredDark();
isDark(); // → true when the OS is set to dark`,
		returns: [
			{ name: '(return)', type: '() => boolean', description: 'Whether dark mode is preferred' }
		],
		example: `<script lang="ts">
  import { usePreferredDark } from '@ariefsn/svelte-use';

  const prefersDark = usePreferredDark();
</script>

<img src={prefersDark() ? '/logo-dark.svg' : '/logo-light.svg'} alt="Logo" />`,
		notes: [
			'Returns `false` during SSR and until hydration.',
			'Not the same as `usePreferredColorScheme() === "dark"`: a user agent reporting no preference at all yields `false` here and `no-preference` there. Use this for a binary decision, that one to tell the two apart.',
			'Exports `PREFERS_DARK_QUERY`, the query literal, so `usePreferredColorScheme` and `useColorMode` share one copy of it.'
		]
	},
	'use-preferred-color-scheme': {
		slug: 'use-preferred-color-scheme',
		title: 'usePreferredColorScheme',
		description:
			'Reactively tracks the OS colour-scheme preference as `dark`, `light` or `no-preference`.',
		usage: `import { usePreferredColorScheme } from '@ariefsn/svelte-use';

const scheme = usePreferredColorScheme();
scheme(); // → 'dark' | 'light' | 'no-preference'`,
		returns: [
			{
				name: '(return)',
				type: "() => 'dark' | 'light' | 'no-preference'",
				description: 'The resolved preference'
			}
		],
		example: `<script lang="ts">
  import { usePreferredColorScheme } from '@ariefsn/svelte-use';

  const scheme = usePreferredColorScheme();

  // Fall back to your own default only when the OS has no opinion
  const theme = $derived(scheme() === 'no-preference' ? 'dark' : scheme());
</script>

<p>OS says {scheme()}, using {theme}</p>`,
		notes: [
			'Derived from **two** media queries rather than one, so an explicit `light` preference stays distinguishable from a user agent that reports nothing. Older engines and some embedded webviews match neither.',
			'Returns `no-preference` during SSR.',
			'A user agent reporting both queries resolves to `dark`, since candidates are checked in order.'
		]
	},
	'use-preferred-reduced-motion': {
		slug: 'use-preferred-reduced-motion',
		title: 'usePreferredReducedMotion',
		description:
			'Reactively tracks whether the OS requests reduced motion, as `reduce` or `no-preference`.',
		usage: `import { usePreferredReducedMotion } from '@ariefsn/svelte-use';

const motion = usePreferredReducedMotion();
motion(); // → 'reduce' when the user asked for less motion`,
		returns: [
			{
				name: '(return)',
				type: "() => 'reduce' | 'no-preference'",
				description: 'The resolved preference'
			}
		],
		example: `<script lang="ts">
  import { usePreferredReducedMotion } from '@ariefsn/svelte-use';

  const motion = usePreferredReducedMotion();

  // Skip the transition entirely rather than shortening it
  const duration = $derived(motion() === 'reduce' ? 0 : 300);
</script>`,
		notes: [
			'Returns `no-preference` during SSR — the safe default, since animations render normally until the real preference is known.',
			'Returns the CSS keyword rather than a boolean, matching the rest of the `usePreferred*` family and the value you would write in a `@media` block.',
			'Prefer removing an animation over merely shortening it; `reduce` is a request to stop moving things, not to move them faster.'
		]
	},
	'use-preferred-contrast': {
		slug: 'use-preferred-contrast',
		title: 'usePreferredContrast',
		description:
			'Reactively tracks the OS contrast preference as `more`, `less`, `custom` or `no-preference`.',
		usage: `import { usePreferredContrast } from '@ariefsn/svelte-use';

const contrast = usePreferredContrast();
contrast(); // → 'more' | 'less' | 'custom' | 'no-preference'`,
		returns: [
			{
				name: '(return)',
				type: "() => 'more' | 'less' | 'custom' | 'no-preference'",
				description: 'The resolved preference'
			}
		],
		example: `<script lang="ts">
  import { usePreferredContrast } from '@ariefsn/svelte-use';

  const contrast = usePreferredContrast();
  const borderWidth = $derived(contrast() === 'more' ? 2 : 1);
</script>

<div style="border: {borderWidth}px solid currentColor">Adaptive border</div>`,
		notes: [
			'Combines three media queries. Returns `no-preference` during SSR.',
			'`custom` means the user has set a specific palette — Windows High Contrast, or forced colours — rather than asking for more or less contrast in general.',
			'**Order is load-bearing:** a forced-colours mode often matches `custom` *and* `more` simultaneously, so `custom` is checked last and the more actionable answer wins.'
		]
	},
	'use-css-var': {
		slug: 'use-css-var',
		title: 'useCssVar',
		description:
			'Reads and writes a CSS custom property. Writes are instant; reads are deliberately not fully reactive, because custom properties have no change event.',
		usage: `import { useCssVar } from '@ariefsn/svelte-use';

const accent = useCssVar('--accent');
accent.set('tomato');
accent.current(); // → 'tomato'`,
		params: [
			{
				name: 'name',
				type: 'string | (() => string)',
				description: 'Custom property name, including the leading `--`'
			},
			{
				name: 'target',
				type: '() => HTMLElement | null | undefined',
				default: 'document.documentElement',
				description: 'Getter for the element to read and write'
			},
			{ name: 'options', type: 'UseCssVarOptions', default: '{}', description: 'Configuration' }
		],
		options: [
			{
				name: 'initialValue',
				type: 'string',
				default: "''",
				description: 'Value reported when the property is unset, unreadable, or during SSR'
			},
			{
				name: 'observe',
				type: 'boolean',
				default: 'false',
				description:
					"Re-read when the target's `style` or `class` attribute changes. Off by default because each change costs a style recalculation."
			}
		],
		returns: [
			{ name: 'current', type: '() => string', description: 'The current value, trimmed' },
			{
				name: 'set',
				type: '(value: string) => void',
				description: 'Writes the property inline and updates the value synchronously'
			},
			{
				name: 'remove',
				type: '() => void',
				description: 'Removes the inline property, then re-reads the inherited value'
			},
			{ name: 'refresh', type: '() => void', description: 'Forces a `getComputedStyle` re-read' }
		],
		example: `<script lang="ts">
  import { useCssVar, useColorMode } from '@ariefsn/svelte-use';

  useColorMode();
  // The theme class lands on <html>, which is also the default target,
  // so observing picks up a theme switch
  const surface = useCssVar('--color-surface', undefined, { observe: true });
</script>

<p>Surface is {surface()}</p>`,
		notes: [
			'**Writes are authoritative and free.** `set()` updates the element and the reactive value in the same synchronous call, so anything changed through this composable is instantly reactive with no reads.',
			'**Reads are the compromise.** Custom properties have no change event and `getComputedStyle` forces a style recalculation, so polling is off the table. This reads once at initialisation and then only when asked.',
			'`observe: true` adds a `MutationObserver` on `style` and `class`, which catches the common case — a theme class flipping on an ancestor. It still misses a swapped stylesheet, a CSSOM write, and an ancestor whose class changed. `refresh()` covers all of those.',
			'The name must include the leading `--`. Standard properties are not supported: `getPropertyValue("color")` returns a resolved colour rather than failing, which would make a typo look like it worked.',
			'Values are trimmed, because custom properties preserve leading whitespace and the raw value would not compare equal to what was written.'
		]
	},
	// -------------------------------------------------- Element & viewport
	'use-window-size': {
		slug: 'use-window-size',
		title: 'useWindowSize',
		description:
			'Reactive viewport dimensions. Tracks `resize` and `orientationchange`, so it stays correct when a mobile device is rotated — which does not always fire `resize` on its own.',
		usage: `import { useWindowSize } from '@ariefsn/svelte-use';

const { width, height } = useWindowSize();
width();  // → 1280`,
		params: [
			{ name: 'options', type: 'UseWindowSizeOptions', default: '{}', description: 'Configuration' }
		],
		options: [
			{
				name: 'includeScrollbar',
				type: 'boolean',
				default: 'true',
				description:
					'`true` uses `innerWidth`/`innerHeight`, which count the scrollbar. `false` uses `documentElement.clientWidth`/`clientHeight`, matching what CSS media queries measure.'
			},
			{
				name: 'initialWidth',
				type: 'number',
				default: '0',
				description: 'Width reported before the first measurement, i.e. during SSR'
			},
			{
				name: 'initialHeight',
				type: 'number',
				default: '0',
				description: 'Height reported before the first measurement, i.e. during SSR'
			}
		],
		returns: [
			{ name: 'width', type: '() => number', description: 'Viewport width in pixels' },
			{ name: 'height', type: '() => number', description: 'Viewport height in pixels' }
		],
		example: `<script lang="ts">
  import { useWindowSize } from '@ariefsn/svelte-use';

  // Matching CSS media queries means excluding the scrollbar
  const { width } = useWindowSize({ includeScrollbar: false });
</script>

{#if width() < 768}
  <MobileNav />
{:else}
  <DesktopNav />
{/if}`,
		notes: [
			'Also listens for `orientationchange`, because some mobile browsers fire only that on rotation.',
			'For layout decisions prefer `useMediaQuery` or `useBreakpoints` — they use `matchMedia`, which fires only when a threshold is crossed rather than on every resize frame.',
			'Set `initialWidth`/`initialHeight` to sensible defaults if you render based on these during SSR; otherwise the server renders as if the viewport were 0 wide.'
		]
	},

	'use-element-bounding': {
		slug: 'use-element-bounding',
		title: 'useElementBounding',
		description:
			'Reactive `getBoundingClientRect()` for an element. Where `useElementSize` reports only width and height, this exposes the full viewport-relative box — position included — and recalculates on resize, scroll, and size changes.',
		usage: `import { useElementBounding } from '@ariefsn/svelte-use';

let el = $state<HTMLDivElement | null>(null);
const { top, left, width, height } = useElementBounding(() => el);`,
		params: [
			{
				name: 'target',
				type: '() => Element | null | undefined',
				description: 'Reactive getter returning the element to measure'
			},
			{
				name: 'options',
				type: 'UseElementBoundingOptions',
				default: '{}',
				description: 'Configuration'
			}
		],
		options: [
			{
				name: 'reset',
				type: 'boolean',
				default: 'true',
				description: 'Reset every value to `0` when the target becomes `null`'
			},
			{
				name: 'windowResize',
				type: 'boolean',
				default: 'true',
				description: 'Recalculate on window `resize`'
			},
			{
				name: 'windowScroll',
				type: 'boolean',
				default: 'true',
				description: 'Recalculate on window `scroll`'
			}
		],
		returns: [
			{ name: 'x', type: '() => number', description: 'Viewport-relative x (same as `left`)' },
			{ name: 'y', type: '() => number', description: 'Viewport-relative y (same as `top`)' },
			{ name: 'top', type: '() => number', description: 'Distance from the top of the viewport' },
			{ name: 'right', type: '() => number', description: "The element's right edge" },
			{ name: 'bottom', type: '() => number', description: "The element's bottom edge" },
			{ name: 'left', type: '() => number', description: 'Distance from the left of the viewport' },
			{ name: 'width', type: '() => number', description: 'Border-box width' },
			{ name: 'height', type: '() => number', description: 'Border-box height' },
			{ name: 'update', type: '() => void', description: 'Recalculates immediately' }
		],
		example: `<script lang="ts">
  import { useElementBounding } from '@ariefsn/svelte-use';

  let anchor = $state<HTMLButtonElement | null>(null);
  const { bottom, left, width } = useElementBounding(() => anchor);
</script>

<button bind:this={anchor}>Open menu</button>

<!-- Position a dropdown under the button -->
<div style="position: fixed; top: {bottom()}px; left: {left()}px; width: {width()}px">
  …
</div>`,
		notes: [
			'All values are viewport-relative, matching `getBoundingClientRect()`. Add `window.scrollX`/`scrollY` for document coordinates.',
			'Because the rect is viewport-relative, **scrolling changes `top`/`bottom` even when the element has not moved** — which is why scroll is watched by default.',
			'The scroll listener uses `capture`, so scrolling inside any ancestor container is picked up, not just the document.',
			'A `ResizeObserver` covers the element changing size; the scroll and resize listeners cover it moving without resizing.',
			'**An element that moves without resizing is not detected.** `ResizeObserver` watches only the element\u2019s own size, and moving it fires no scroll or resize event — so a sibling appearing above it, or a layout shift elsewhere on the page, leaves `top`/`bottom` stale. Call `update()` after any such change.'
		]
	},

	'use-mouse-in-element': {
		slug: 'use-mouse-in-element',
		title: 'useMouseInElement',
		description:
			'Reactive pointer position relative to an element. Where `useMouse` gives viewport coordinates and `useElementHover` gives a boolean, this gives the offset *within* an element — what spotlight effects, tilt cards and custom sliders need.',
		usage: `import { useMouseInElement } from '@ariefsn/svelte-use';

let el = $state<HTMLDivElement | null>(null);
const { elementX, elementY, isOutside } = useMouseInElement(() => el);`,
		params: [
			{
				name: 'target',
				type: '() => Element | null | undefined',
				description: 'Reactive getter returning the element to measure against'
			},
			{
				name: 'options',
				type: 'UseMouseInElementOptions',
				default: '{}',
				description: 'Configuration'
			}
		],
		options: [
			{
				name: 'handleOutside',
				type: 'boolean',
				default: 'true',
				description: 'Treat the pointer as outside when it leaves the window entirely'
			},
			{
				name: 'touch',
				type: 'boolean',
				default: 'true',
				description: 'Also track `touchmove`, reporting the first touch point'
			}
		],
		returns: [
			{ name: 'x', type: '() => number', description: 'Pointer x relative to the viewport' },
			{ name: 'y', type: '() => number', description: 'Pointer y relative to the viewport' },
			{
				name: 'elementX',
				type: '() => number',
				description: "Pointer x from the element's left edge"
			},
			{
				name: 'elementY',
				type: '() => number',
				description: "Pointer y from the element's top edge"
			},
			{
				name: 'elementPositionX',
				type: '() => number',
				description: "The element's distance from the left of the viewport"
			},
			{
				name: 'elementPositionY',
				type: '() => number',
				description: "The element's distance from the top of the viewport"
			},
			{ name: 'elementWidth', type: '() => number', description: "The element's width" },
			{ name: 'elementHeight', type: '() => number', description: "The element's height" },
			{
				name: 'isOutside',
				type: '() => boolean',
				description: "Whether the pointer is outside the element's bounds"
			}
		],
		example: `<script lang="ts">
  import { useMouseInElement } from '@ariefsn/svelte-use';

  let card = $state<HTMLDivElement | null>(null);
  const { elementX, elementY, elementWidth, elementHeight, isOutside } =
    useMouseInElement(() => card);

  // 3D tilt that follows the pointer
  const rotateX = $derived(isOutside() ? 0 : (elementY() / elementHeight() - 0.5) * -20);
  const rotateY = $derived(isOutside() ? 0 : (elementX() / elementWidth() - 0.5) * 20);
</script>

<div bind:this={card} style="transform: perspective(600px) rotateX({rotateX}deg) rotateY({rotateY}deg)">
  tilt me
</div>`,
		notes: [
			'`elementX`/`elementY` are **not clamped** — they go negative or exceed the element size when the pointer is beyond it. Check `isOutside()` rather than assuming a range.',
			'The listener is on `window`, not the element, so coordinates keep updating while the pointer is outside — needed for effects that ease back to a resting state.',
			'`isOutside` starts `true` and stays so until the first pointer movement.',
			'Measures with `getBoundingClientRect()` on each move, so a scrolled or animated element stays correct without extra wiring.'
		]
	},

	'use-infinite-scroll': {
		slug: 'use-infinite-scroll',
		title: 'useInfiniteScroll',
		description:
			'Loads more content as a scroll container nears its edge. Fires once per arrival, never overlaps calls, and re-checks after each load so a short page that does not fill the container keeps loading until it does.',
		usage: `import { useInfiniteScroll } from '@ariefsn/svelte-use';

let el = $state<HTMLDivElement | null>(null);

const { isLoading } = useInfiniteScroll(() => el, async () => {
  items = [...items, ...(await fetchNextPage())];
}, { distance: 100 });`,
		params: [
			{
				name: 'target',
				type: '() => HTMLElement | null | undefined',
				description: 'Reactive getter returning the scroll container, or `null` for the window'
			},
			{
				name: 'onLoadMore',
				type: '() => void | Promise<void>',
				description: 'Called when the edge comes within `distance`'
			},
			{
				name: 'options',
				type: 'UseInfiniteScrollOptions',
				default: '{}',
				description: 'Configuration'
			}
		],
		options: [
			{
				name: 'distance',
				type: 'number',
				default: '0',
				description: 'How close to the edge, in pixels, before loading is triggered'
			},
			{
				name: 'direction',
				type: "'top' | 'bottom' | 'left' | 'right'",
				default: "'bottom'",
				description:
					"Which edge to watch. `'top'` suits reverse-chronological feeds such as chat transcripts."
			},
			{
				name: 'canLoadMore',
				type: '() => boolean',
				default: '() => true',
				description:
					'Whether another page may be loaded. Return `false` once the last page has arrived.'
			}
		],
		returns: [
			{
				name: 'isLoading',
				type: '() => boolean',
				description: '`true` while `onLoadMore` is in flight'
			},
			{
				name: 'check',
				type: '() => void',
				description: 'Checks the scroll position and loads now if the edge is already in range'
			}
		],
		example: `<script lang="ts">
  import { useInfiniteScroll } from '@ariefsn/svelte-use';

  let el = $state<HTMLDivElement | null>(null);
  let items = $state<Item[]>([]);
  let page = $state(0);

  const { isLoading } = useInfiniteScroll(
    () => el,
    async () => {
      items = [...items, ...(await fetchPage(page))];
      page++;
    },
    { distance: 100, canLoadMore: () => page < totalPages }
  );
</script>

<div bind:this={el} style="overflow-y: auto; height: 400px">
  {#each items as item (item.id)}<Row {item} />{/each}
  {#if isLoading()}<Spinner />{/if}
</div>`,
		notes: [
			'**Always provide `canLoadMore`.** Without it the loader keeps firing at the end of the list, since the container never leaves its edge.',
			'The first load happens immediately when the container starts at its edge — an empty or short list fires no `scroll` event, so waiting for one would stall forever.',
			'After each load it re-checks, and keeps loading while the content still does not overflow. One short page would otherwise leave no scrollbar and no way to continue.',
			'Calls never overlap: a scroll burst while a load is in flight is ignored rather than queued.',
			'`onLoadMore` may be async. A rejected promise stops the run rather than being swallowed — catch inside the callback if loading should continue.'
		]
	},

	'use-textarea-autosize': {
		slug: 'use-textarea-autosize',
		title: 'useTextareaAutosize',
		description:
			'Grows a textarea to fit its content. Recalculates on input, on window resize, and whenever the reactive `value` getter changes — the last case covering programmatic edits, which fire no `input` event.',
		usage: `import { useTextareaAutosize } from '@ariefsn/svelte-use';

let el = $state<HTMLTextAreaElement | null>(null);
let text = $state('');

useTextareaAutosize(() => el, { value: () => text, maxRows: 10 });`,
		params: [
			{
				name: 'target',
				type: '() => HTMLTextAreaElement | null | undefined',
				description: 'Reactive getter returning the textarea'
			},
			{
				name: 'options',
				type: 'UseTextareaAutosizeOptions',
				default: '{}',
				description: 'Configuration'
			}
		],
		options: [
			{
				name: 'value',
				type: '() => string',
				description:
					'Reactive getter for the current value. Needed because a programmatic change fires no `input` event.'
			},
			{
				name: 'minRows',
				type: 'number',
				description: 'Smallest height in rows'
			},
			{
				name: 'maxRows',
				type: 'number',
				description: 'Largest height in rows. Past this the textarea scrolls instead.'
			},
			{
				name: 'styleProp',
				type: "'height' | 'minHeight'",
				default: "'height'",
				description:
					"`'height'` resizes immediately; `'minHeight'` lets it grow but never shrink below a user-dragged size."
			}
		],
		returns: [
			{ name: 'resize', type: '() => void', description: 'Recalculates the height immediately' },
			{
				name: 'height',
				type: '() => number',
				description: 'The height last applied, in pixels. `0` before the first measurement.'
			}
		],
		example: `<script lang="ts">
  import { useTextareaAutosize } from '@ariefsn/svelte-use';

  let el = $state<HTMLTextAreaElement | null>(null);
  let message = $state('');

  useTextareaAutosize(() => el, {
    value: () => message,
    minRows: 2,
    maxRows: 8
  });
</script>

<textarea bind:this={el} bind:value={message} rows="1" style="resize: none"></textarea>`,
		notes: [
			'Pass `value` whenever the textarea can change programmatically — clearing it after submit, restoring a draft, inserting a template. Without it those edits leave the height stale.',
			'Resizing works by collapsing the height, reading `scrollHeight`, then applying it. The collapse is required: `scrollHeight` never reports less than the current height, so without it the textarea could grow but never shrink.',
			'`overflow-y` is only switched to `auto` once `maxRows` actually clips the content, so no scrollbar appears while the textarea is still growing.',
			'Set `resize: none` in CSS if you do not want the native resize handle fighting the automatic height.',
			'Recalculates on window resize too, since wrapping depends on width.'
		]
	},

	// ----------------------------------------------- Foundational primitives
	'use-supported': {
		slug: 'use-supported',
		title: 'useSupported',
		description:
			'Evaluates a feature-detection predicate once, with SSR safety. Replaces the `typeof window !== "undefined" && "X" in window` guard that browser composables would otherwise hand-roll.',
		usage: `import { useSupported } from '@ariefsn/svelte-use';

const isSupported = useSupported(() => 'geolocation' in navigator);
isSupported(); // → true in a browser with geolocation, false during SSR`,
		params: [
			{
				name: 'predicate',
				type: '() => boolean',
				description: 'Feature test. Only invoked in a browser, never during SSR.'
			}
		],
		returns: [
			{
				name: '()',
				type: '() => boolean',
				description: 'Whether the feature is available'
			}
		],
		example: `<script lang="ts">
  import { useSupported } from '@ariefsn/svelte-use';

  const hasClipboard = useSupported(() => 'clipboard' in navigator);
  const hasVibrate = useSupported(() => 'vibrate' in navigator);
</script>

{#if hasClipboard()}
  <button onclick={copy}>Copy</button>
{:else}
  <p>Clipboard is unavailable in this browser.</p>
{/if}`,
		notes: [
			'The predicate runs **immediately**, not inside an `$effect`, so the result is available during initialisation and this can be called outside a reactive scope.',
			'A predicate that throws is treated as unsupported. Touching some APIs throws under a restrictive permissions policy, which is indistinguishable from unavailable.',
			'Returns `false` during SSR, matching how every browser API behaves there. If you render on that value, expect the server HTML to show the unsupported branch until hydration.',
			'Support does not change at runtime, so the result is a stable value rather than reactive state — the predicate is evaluated exactly once.'
		]
	},

	'use-media-query': {
		slug: 'use-media-query',
		title: 'useMediaQuery',
		description:
			'Reactively tracks whether a CSS media query matches. Accepts a plain string or a getter, rebuilding the listener when a reactive query changes.',
		usage: `import { useMediaQuery } from '@ariefsn/svelte-use';

const isWide = useMediaQuery('(min-width: 768px)');
isWide(); // → true when the viewport is at least 768px`,
		params: [
			{
				name: 'query',
				type: 'string | (() => string)',
				description: 'Media query string, or a getter returning one'
			}
		],
		returns: [
			{
				name: '()',
				type: '() => boolean',
				description: 'Whether the query currently matches'
			}
		],
		example: `<script lang="ts">
  import { useMediaQuery } from '@ariefsn/svelte-use';

  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  // Reactive query — the listener is rebuilt as \`width\` changes
  let width = $state(768);
  const matches = useMediaQuery(() => \`(min-width: \${width}px)\`);
</script>

<p>Theme: {prefersDark() ? 'dark' : 'light'}</p>`,
		notes: [
			'The initial match is read **synchronously**, so the first render already has the correct answer rather than flashing the non-matching branch for a frame.',
			'Returns `false` during SSR, since `matchMedia` does not exist on the server.',
			'When `query` is a getter, changing it tears down the old listener and attaches a new one.',
			'`useBreakpoints` is built on this — prefer it when you have a named set of breakpoints.'
		]
	},

	'use-raf-fn': {
		slug: 'use-raf-fn',
		title: 'useRafFn',
		description:
			'Runs a callback on every animation frame, passing the frame `timestamp` and the `delta` since the previous invocation. Optionally throttled with `fpsLimit`.',
		usage: `import { useRafFn } from '@ariefsn/svelte-use';

const { isActive, pause, resume } = useRafFn(({ delta }) => {
  position += velocity * delta;
});`,
		params: [
			{
				name: 'fn',
				type: '(args: { delta: number; timestamp: number }) => void',
				description: 'Called once per frame'
			},
			{ name: 'options', type: 'UseRafFnOptions', default: '{}', description: 'Loop options' }
		],
		options: [
			{
				name: 'immediate',
				type: 'boolean',
				default: 'true',
				description: 'Start the loop immediately'
			},
			{
				name: 'fpsLimit',
				type: 'number',
				description: 'Cap the callback rate in frames per second. Unlimited when omitted.'
			}
		],
		returns: [
			{ name: 'isActive', type: '() => boolean', description: '`true` while the loop is running' },
			{ name: 'pause', type: '() => void', description: 'Stops the loop' },
			{ name: 'resume', type: '() => void', description: 'Starts the loop' }
		],
		example: `<script lang="ts">
  import { useRafFn } from '@ariefsn/svelte-use';

  let angle = $state(0);

  // Degrees per millisecond keeps the speed frame-rate independent
  const { isActive, pause, resume } = useRafFn(({ delta }) => {
    angle = (angle + delta * 0.18) % 360;
  });
</script>

<div style="transform: rotate({angle}deg)">spinning</div>
<button onclick={isActive() ? pause : resume}>
  {isActive() ? 'pause' : 'resume'}
</button>`,
		notes: [
			'Use `delta` rather than a fixed increment so animation speed stays constant across refresh rates — a 120Hz display fires twice as often as a 60Hz one.',
			'`delta` is `0` on the first frame, where there is no previous frame to measure against.',
			'`fpsLimit` throttles the **callback**, not the loop: frames are still requested, they just skip the callback until enough time has elapsed.',
			'Safe during SSR — no frame is ever requested and `isActive()` stays `false`.',
			'The loop is cancelled when the owning reactive scope is destroyed.'
		]
	},

	'use-until': {
		slug: 'use-until',
		title: 'useUntil',
		description:
			'Waits for a reactive value to reach a condition, as a promise. Fills the gap left by `useWatch` and `useWhenever`, which are callback-based — this lets you `await` a state change inside ordinary async code.',
		usage: `import { useUntil } from '@ariefsn/svelte-use';

const { isLoading, data } = useFetch(url);
await useUntil(isLoading).toBe(false);
console.log(data());`,
		params: [
			{
				name: 'source',
				type: '() => T',
				description: 'Getter returning the reactive value to watch'
			}
		],
		returns: [
			{
				name: 'toBe',
				type: '(expected: T, options?) => Promise<T>',
				description: 'Strict equality'
			},
			{ name: 'toBeTruthy', type: '(options?) => Promise<T>', description: 'Value becomes truthy' },
			{ name: 'toBeFalsy', type: '(options?) => Promise<T>', description: 'Value becomes falsy' },
			{
				name: 'toBeNullish',
				type: '(options?) => Promise<T>',
				description: 'Value becomes `null` or `undefined`'
			},
			{
				name: 'toBeDefined',
				type: '(options?) => Promise<T>',
				description: 'Value becomes neither `null` nor `undefined`'
			},
			{ name: 'toBeNaN', type: '(options?) => Promise<T>', description: 'Value becomes `NaN`' },
			{
				name: 'toContain',
				type: '(item: UseUntilItem<T>, options?) => Promise<T>',
				description:
					'Container gains `item`. Works with arrays, strings, `Set`, and `Map` (by key).'
			},
			{
				name: 'toHaveLength',
				type: '(length: number, options?) => Promise<T>',
				description: '`length` or `size` reaches the given number'
			},
			{
				name: 'toMatch',
				type: '(predicate: (value: T) => boolean, options?) => Promise<T>',
				description: 'Arbitrary predicate passes'
			},
			{
				name: 'changed',
				type: '(options?) => Promise<T>',
				description: 'Value changes from what it is now'
			},
			{
				name: 'changedTimes',
				type: '(times: number, options?) => Promise<T>',
				description: 'Value changes `times` times'
			},
			{
				name: 'not',
				type: 'UseUntilChain<T>',
				description: 'Inverts every matcher, e.g. `not.toBe(5)`'
			}
		],
		options: [
			{
				name: 'timeout',
				type: 'number',
				description: 'Reject after this many milliseconds. Waits forever when omitted.'
			},
			{
				name: 'resolveOnTimeout',
				type: 'boolean',
				default: 'false',
				description: 'Resolve with the current value on timeout instead of rejecting'
			}
		],
		example: `<script lang="ts">
  import { useUntil } from '@ariefsn/svelte-use';

  let items = $state<string[]>([]);
  let status = $state('pending');

  async function run() {
    // Containment, negation and a timeout
    await useUntil(() => items).toContain('ready');
    await useUntil(() => items).toHaveLength(3);

    try {
      await useUntil(() => status).not.toBe('pending', { timeout: 5000 });
    } catch {
      console.warn('still pending after 5s');
    }
  }
</script>`,
		notes: [
			'The condition is checked **immediately**, so an already-satisfied value resolves without waiting for a change.',
			'Creates its own `$effect.root` internally, so it can be called from anywhere — including event handlers and plain async functions outside a component.',
			'Watching stops as soon as the promise settles, and a pending timeout timer is cleared.',
			'`toContain` is typed as the container’s element type: calling it on a value that cannot contain anything, or with a mismatched item, is a **compile error** rather than a call that silently never matches.',
			'`changedTimes` counts transitions, so writing the same value again does not advance the count.'
		]
	},

	'use-storage': {
		slug: 'use-storage',
		title: 'useStorage',
		description:
			'Reactive Web Storage utility with SSR safety and cross-tab sync. The shared implementation behind `useLocalStorage` and `useSessionStorage` — use those unless the storage area needs to be chosen at runtime.',
		usage: `import { useStorage } from '@ariefsn/svelte-use';

const theme = useStorage('theme', 'light');
theme.set('dark');
theme.value;    // 'dark'
theme.remove(); // back to 'light'`,
		params: [
			{ name: 'key', type: 'string', description: 'Storage key' },
			{
				name: 'initial',
				type: 'T',
				description: 'Fallback used when the key is absent, unreadable, or in SSR'
			},
			{
				name: 'area',
				type: "'local' | 'session'",
				default: "'local'",
				description: 'Which Web Storage area to read and write'
			},
			{
				name: 'options',
				type: 'UseStorageOptions<T>',
				default: '{}',
				description: 'Optional custom serialiser / deserialiser pair'
			}
		],
		options: [
			{
				name: 'serializer',
				type: '(value: T) => string',
				default: 'JSON.stringify',
				description: 'Custom serialiser'
			},
			{
				name: 'deserializer',
				type: '(raw: string) => T',
				default: 'JSON.parse',
				description: 'Custom deserialiser'
			}
		],
		returns: [
			{ name: 'value', type: 'T', description: 'The reactive stored value' },
			{
				name: 'set',
				type: '(value: T) => void',
				description: 'Writes a new value and persists it'
			},
			{
				name: 'remove',
				type: '() => void',
				description: 'Removes the key from storage and resets the value to `initial`'
			}
		],
		example: `<script lang="ts">
  import { useStorage } from '@ariefsn/svelte-use';

  // Non-JSON values need a serialiser pair
  const seen = useStorage('last-seen', new Date(), 'session', {
    serializer: (d) => d.toISOString(),
    deserializer: (raw) => new Date(raw)
  });
</script>

<p>Last seen: {seen.value.toLocaleString()}</p>
<button onclick={() => seen.set(new Date())}>Update</button>`,
		notes: [
			'Storage access is wrapped throughout: quota errors, blocked cookies and private-mode restrictions degrade to the in-memory value rather than throwing.',
			'A `storage` event listener keeps the value in sync with other tabs on the same origin. Note that only `localStorage` fires these across tabs.',
			'After `remove()` the write-back is suppressed, so the key is not immediately re-created by the effect that mirrors the value.',
			'The storage object is resolved lazily rather than captured once, because touching `localStorage` can throw when cookies are blocked.'
		]
	},

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
		description:
			'A reactive boolean toggle. Flips between `true` and `false` with a `toggle()` call, or force a specific value with `set()`.',
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
			{
				name: 'value',
				type: 'boolean',
				description: 'Reactive boolean state (property accessor, not a function)'
			},
			{
				name: 'toggle',
				type: '() => void',
				description: 'Flip the value between `true` and `false`'
			},
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
		description:
			'A reactive integer counter with increment, decrement, and reset operations. Supports custom step deltas.',
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
			{
				name: 'value',
				type: 'number',
				description: 'Reactive numeric state (property accessor, not a function)'
			},
			{
				name: 'inc',
				type: '(delta?: number) => void',
				description: 'Increment by `delta` (default `1`)'
			},
			{
				name: 'dec',
				type: '(delta?: number) => void',
				description: 'Decrement by `delta` (default `1`)'
			},
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
		description:
			'Tracks the previous value of a reactive getter. Returns `undefined` until the value changes for the first time.',
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
		description:
			'Debounces a reactive getter value, delaying updates until the source stops changing for the specified duration.',
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
				description:
					'Getter returning the debounced value; reflects the initial value immediately then delays subsequent updates'
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
		description:
			'Reactively converts a `string`, `ArrayBuffer`, or `Blob` to its Base64 representation. Returns `undefined` while an async Blob conversion is in-flight or on the server.',
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
				description:
					'Getter returning the Base64-encoded string, or `undefined` when the input is `undefined`, during async Blob reads, or on the server'
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
		description:
			'Generates a reactive `blob:` URL for a `Blob`, `File`, or `MediaSource` object. Automatically revokes the previous URL when the source changes, preventing memory leaks.',
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
				description:
					'Getter returning the current object URL, or `undefined` when the source is `undefined` or in SSR'
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
		description:
			'Reactive `sessionStorage` utility. Reads the stored value on init, persists changes automatically, and syncs across tabs via the `storage` event.',
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
			{
				name: 'initial',
				type: 'T',
				description: 'Fallback value when the key is absent or during SSR'
			},
			{
				name: 'options',
				type: 'UseSessionStorageOptions<T>',
				default: '{}',
				description: 'Optional `serializer` and `deserializer` functions'
			}
		],
		returns: [
			{
				name: 'value',
				type: 'T',
				description: 'Reactive stored value (property accessor, not a function)'
			},
			{
				name: 'set',
				type: '(v: T) => void',
				description: 'Update the value and persist to sessionStorage'
			},
			{
				name: 'remove',
				type: '() => void',
				description: 'Remove the key from sessionStorage and reset to `initial`'
			}
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
			"The listener is attached to `document` in capture phase, so it fires before the element's own handlers.",
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
			"Returns `navigator.language` — the primary language of the user's browser UI.",
			'SSR-safe — returns `"en"` when `navigator` is unavailable.',
			'The `languagechange` event fires when the user changes their preferred language in browser settings.',
			'Cleanup is handled automatically when the component is destroyed.'
		]
	},

	'use-online': {
		slug: 'use-online',
		title: 'useOnline',
		description:
			"Reactive online/offline network status. Tracks `navigator.onLine` and updates on the browser's `online` / `offline` events. Returns `true` during SSR.",
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
			'Reactive wrapper around the Web Animations API. Attaches an `Animation` to a target element using the provided keyframes and options. The animation is automatically cancelled and re-created whenever the target, keyframes, or options change.',
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
				description:
					'Optional reactive getter returning animation options such as `duration`, `easing`, `iterations`'
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
				description: '`true` while the animation `playState` is `"running"`'
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
			'The animation starts **paused** — call `play()` to begin.',
			'Automatically cancelled and re-created when `target`, `keyframes`, or `options` change reactively.',
			'Cleaned up automatically when the owning component is destroyed.',
			'SSR-safe — no animation is created when `target` is `null` or `undefined`.'
		]
	},

	'use-parallax': {
		slug: 'use-parallax',
		title: 'useParallax',
		description:
			'Tracks mouse movement and exposes the cursor position as an offset relative to the centre of a target element, scaled by a speed multiplier. Use the returned `x` and `y` values to drive CSS transforms for parallax depth effects.',
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
				description:
					'Multiplier applied to the raw pixel offset. Negative values invert the direction.'
			}
		],
		returns: [
			{
				name: 'x',
				type: 'number',
				description: 'Reactive getter — horizontal offset in pixels multiplied by `speed`'
			},
			{
				name: 'y',
				type: 'number',
				description: 'Reactive getter — vertical offset in pixels multiplied by `speed`'
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
			'Attaches a single `mousemove` listener to `window`.',
			"The offset is calculated relative to the centre of the element's bounding box.",
			'Listener is removed automatically when the owning component is destroyed or the target changes.',
			'SSR-safe — no listener is attached when `window` is unavailable.'
		]
	},

	'use-transition': {
		slug: 'use-transition',
		title: 'useTransition',
		description:
			'Smoothly interpolates a reactive numeric source value using `requestAnimationFrame`. When the source changes the composable animates the displayed value from the previous value to the new target over a configurable duration.',
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
				description:
					'Easing function where `t` is in the range [0, 1]. Built-in options: `linear`, `cubicInOut`.'
			}
		],
		returns: [
			{
				name: '()',
				type: '() => number',
				description:
					'Getter returning the current interpolated value. Read in a reactive context for live updates.'
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
			'Built-in easing helpers `linear` and `cubicInOut` are exported from the same module.',
			'A pending animation frame is always cancelled before a new one begins — rapid source changes never stack animations.',
			'SSR-safe — jumps directly to the target value when `requestAnimationFrame` is unavailable.',
			'Works with any numeric value: percentages, pixel values, angles, etc.'
		]
	},

	// ------------------------------------------------------------- Async
	'use-fetch': {
		slug: 'use-fetch',
		title: 'useFetch',
		description:
			'Reactive fetch utility with automatic re-execution when the URL changes, in-flight request abortion via `AbortController`, and full SSR safety.',
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
				description:
					'Reactive getter returning the URL to fetch. Pass `undefined` to skip fetching.'
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
				description:
					'Whether to execute the fetch immediately and re-execute whenever the URL changes'
			},
			{
				name: 'init',
				type: 'RequestInit',
				default: 'undefined',
				description:
					'Optional `RequestInit` options forwarded to every `fetch` call (headers, method, body, etc.)'
			}
		],
		returns: [
			{
				name: 'data',
				type: '() => T | null',
				description: 'Parsed JSON response, or `null` before the first successful response'
			},
			{
				name: 'error',
				type: '() => Error | null',
				description: 'Last error, or `null` when no error has occurred'
			},
			{
				name: 'isFetching',
				type: '() => boolean',
				description: '`true` while a request is in-flight'
			},
			{
				name: 'execute',
				type: '() => Promise<void>',
				description:
					'Manually trigger a fetch. Aborts any in-flight request before starting a new one.'
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
			'Only JSON responses are parsed — non-OK responses throw an `Error` with the status code.',
			'Set `immediate: false` to control fetching manually via `execute()`.',
			'SSR-safe — no fetch is performed when `fetch` is unavailable.'
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
				description:
					'Reactive getter returning the WebSocket URL. Pass `undefined` to stay disconnected.'
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
				description: 'WebSocket sub-protocol(s) passed to the `WebSocket` constructor'
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
				description:
					'Milliseconds to wait between reconnection attempts (requires `autoReconnect: true`)'
			}
		],
		returns: [
			{
				name: 'data',
				type: '() => T | null',
				description: 'Last deserialized message, or `null` before the first message'
			},
			{
				name: 'status',
				type: '() => "CONNECTING" | "OPEN" | "CLOSED"',
				description: 'Current connection status'
			},
			{
				name: 'error',
				type: '() => Event | null',
				description: 'Last connection error event, or `null`'
			},
			{
				name: 'send',
				type: '(data: string | ArrayBufferLike | Blob | ArrayBufferView) => void',
				description: 'Send data through the WebSocket. No-ops when the socket is not `OPEN`.'
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

<p>Status: **{status()}**</p>
{#if data()}
  <p>Last message: {JSON.stringify(data())}</p>
{/if}

<input bind:value={input} placeholder="Type a message…" />
<button onclick={() => send(input)} disabled={status() !== 'OPEN'}>Send</button>
<button onclick={close}>Disconnect</button>`,
		notes: [
			'Incoming messages are automatically parsed as JSON; if parsing fails the raw string value is used.',
			'Call `close()` to permanently disconnect — this disables auto-reconnect.',
			'Changing the URL getter reactive value triggers a fresh connection.',
			'SSR-safe — no WebSocket is created when `WebSocket` is unavailable.'
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
				description: '`true` while the interval is running'
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
			'Changing the `delay` getter value clears the existing interval and starts a new one immediately.',
			'SSR-safe — uses only `setInterval` / `clearInterval`.',
			'The interval is cleared automatically when the owning reactive scope is destroyed.'
		]
	},

	'use-interval-fn': {
		slug: 'use-interval-fn',
		title: 'useIntervalFn',
		description:
			'Manually-controlled interval utility. Unlike `useInterval`, this composable does **not** start automatically — you must call `resume()` explicitly. The delay is a plain number and does not change after initialisation.',
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
				description: '`true` while the interval is running'
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
			'Does not start automatically — call `resume()` to begin.',
			'The delay is fixed at initialisation and cannot be changed reactively (use `useInterval` for a reactive delay).',
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
			'SSR-safe — uses only `Date.now()` and `setInterval`.',
			'The interval is cleared automatically when the owning reactive scope is destroyed.',
			'For a standalone version without options, see `useTimestamp`.'
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
				description: '`true` while the timeout has been scheduled but has not yet fired'
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
			'Changing the `delay` getter while the timeout is pending reschedules it from that moment.',
			'SSR-safe — uses only `setTimeout` / `clearTimeout`.',
			'The timeout is cleared automatically when the owning reactive scope is destroyed.'
		]
	},

	'use-timeout-fn': {
		slug: 'use-timeout-fn',
		title: 'useTimeoutFn',
		description:
			'Manually-controlled timeout utility. Unlike `useTimeout`, this composable does **not** start automatically — you must call `start()` explicitly. The timeout fires once, then becomes idle.',
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
				description: '`true` while the timeout has been armed but has not yet fired'
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
			'Does not start automatically — call `start()` to arm.',
			'Calling `start()` while already pending cancels the current timer and re-arms from the current time.',
			'The delay is fixed at initialisation (use `useTimeout` for a reactive delay).',
			'The timeout is cleared automatically when the owning reactive scope is destroyed.'
		]
	},

	'use-timeout-poll': {
		slug: 'use-timeout-poll',
		title: 'useTimeoutPoll',
		description:
			'Polling utility that chains `setTimeout` calls to repeatedly invoke a function, avoiding drift issues inherent in `setInterval`. The interval represents the delay *between* the end of one execution and the start of the next.',
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
				description: '`true` while polling is active'
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
			'Uses chained `setTimeout` rather than `setInterval`, so long-running `fn` invocations cannot stack.',
			'Does not start automatically — call `start()` to begin.',
			'Cleaned up automatically when the owning reactive scope is destroyed.'
		]
	},

	'use-timestamp': {
		slug: 'use-timestamp',
		title: 'useTimestamp',
		description:
			'Returns a reactive getter that yields the current Unix timestamp in milliseconds, updated at a configurable interval. This is a standalone implementation — it does not delegate to `useNow`.',
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
			'SSR-safe — uses only `Date.now()` and `setInterval`.',
			'The interval is cleared automatically when the owning reactive scope is destroyed.',
			'Similar to `useNow` — both expose the same API. `useNow` accepts options via its argument.'
		]
	},

	// --------------------------------------------------------------- Browser
	// --------------------------------------------------------------- New v1.1.0 State
	'use-auto-reset-state': {
		slug: 'use-auto-reset-state',
		title: 'useAutoResetState',
		description:
			'Creates reactive state that automatically resets to a default value after a specified delay.',
		usage: `import { useAutoResetState } from '@ariefsn/svelte-use';

const message = useAutoResetState('default', 3000);
message.value = 'changed'; // resets to 'default' after 3000ms`,
		params: [
			{ name: 'defaultValue', type: 'T', description: 'The value to reset to after the delay' },
			{
				name: 'delay',
				type: 'number',
				default: '1000',
				description: 'Time in milliseconds before auto-reset'
			}
		],
		returns: [
			{ name: 'value', type: 'T', description: 'Reactive value that auto-resets (read/write)' }
		],
		example: `<script lang="ts">
  import { useAutoResetState } from '@ariefsn/svelte-use';
  const msg = useAutoResetState('Ready', 2000);
</script>
<button onclick={() => msg.value = 'Clicked!'}>Click</button>
<p>{msg.value}</p>`,
		notes: ['SSR-safe — uses only `setTimeout`.', 'Timer resets on each new value change.']
	},

	'use-default-state': {
		slug: 'use-default-state',
		title: 'useDefaultState',
		description: 'Creates reactive state with a fallback value when set to null or undefined.',
		usage: `import { useDefaultState } from '@ariefsn/svelte-use';

const state = useDefaultState('fallback');
state.value = null; // value → 'fallback'`,
		params: [
			{ name: 'defaultValue', type: 'T', description: 'The fallback value' },
			{
				name: 'initialValue',
				type: 'T',
				default: 'defaultValue',
				description: 'Optional initial value'
			}
		],
		returns: [
			{
				name: 'value',
				type: 'T',
				description: 'Reactive value that falls back to default on null/undefined'
			}
		],
		example: `<script lang="ts">
  import { useDefaultState } from '@ariefsn/svelte-use';
  const name = useDefaultState('Anonymous');
</script>
<input oninput={(e) => name.value = e.currentTarget.value || null} />
<p>Hello, {name.value}!</p>`,
		notes: [
			'Falsy values like `""`, `0`, `false` are preserved — only `null` and `undefined` trigger fallback.'
		]
	},

	'use-last-changed': {
		slug: 'use-last-changed',
		title: 'useLastChanged',
		description: 'Tracks the timestamp (in milliseconds) of when a reactive value last changed.',
		usage: `import { useLastChanged } from '@ariefsn/svelte-use';

let count = $state(0);
const lastChanged = useLastChanged(() => count);`,
		params: [{ name: 'getter', type: '() => T', description: 'Reactive getter to observe' }],
		returns: [
			{
				name: '()',
				type: '() => number | undefined',
				description: 'Timestamp of last change, or undefined'
			}
		],
		example: `<script lang="ts">
  import { useLastChanged } from '@ariefsn/svelte-use';
  let count = $state(0);
  const lastChanged = useLastChanged(() => count);
</script>
<button onclick={() => count++}>Increment ({count})</button>
<p>Last changed: {lastChanged() ? new Date(lastChanged()!).toLocaleTimeString() : 'never'}</p>`,
		notes: [
			'Returns `undefined` until the first change occurs.',
			'Uses `$effect` cleanup to capture the timestamp.'
		]
	},

	'use-track-history': {
		slug: 'use-track-history',
		title: 'useTrackHistory',
		description: 'Tracks changes to a reactive value and provides undo/redo functionality.',
		usage: `import { useTrackHistory } from '@ariefsn/svelte-use';

let count = $state(0);
const tracker = useTrackHistory(() => count, (v) => count = v);
tracker.undo(); // restores previous value`,
		params: [
			{ name: 'getter', type: '() => T', description: 'Reactive getter to track' },
			{
				name: 'setter',
				type: '(v: T) => void',
				description: 'Function to update the tracked value'
			}
		],
		returns: [
			{ name: 'canUndo', type: '() => boolean', description: 'Whether undo is available' },
			{ name: 'canRedo', type: '() => boolean', description: 'Whether redo is available' },
			{ name: 'undo', type: '() => void', description: 'Undo to previous value' },
			{ name: 'redo', type: '() => void', description: 'Redo to next value' },
			{
				name: 'history',
				type: '() => HistorySnapshot<T>[]',
				description: 'Array of past snapshots'
			},
			{
				name: 'redoHistory',
				type: '() => HistorySnapshot<T>[]',
				description: 'Array of undone snapshots'
			}
		],
		example: `<script lang="ts">
  import { useTrackHistory } from '@ariefsn/svelte-use';
  let count = $state(0);
  const t = useTrackHistory(() => count, (v) => count = v);
</script>
<button onclick={() => count++}>Inc ({count})</button>
<button onclick={t.undo} disabled={!t.canUndo()}>Undo</button>
<button onclick={t.redo} disabled={!t.canRedo()}>Redo</button>`,
		notes: [
			'Redo history is cleared on new external changes.',
			'Each snapshot includes a timestamp.'
		]
	},

	'use-history-state': {
		slug: 'use-history-state',
		title: 'useHistoryState',
		description: 'Creates reactive state with built-in undo/redo history tracking.',
		usage: `import { useHistoryState } from '@ariefsn/svelte-use';

const counter = useHistoryState(0);
counter.value = 1;
counter.undo(); // counter.value → 0`,
		params: [{ name: 'initial', type: 'T', description: 'The initial state value' }],
		returns: [
			{ name: 'value', type: 'T', description: 'Reactive state value (read/write)' },
			{ name: 'canUndo', type: '() => boolean', description: 'Whether undo is available' },
			{ name: 'canRedo', type: '() => boolean', description: 'Whether redo is available' },
			{ name: 'undo', type: '() => void', description: 'Undo to previous value' },
			{ name: 'redo', type: '() => void', description: 'Redo to next value' }
		],
		example: `<script lang="ts">
  import { useHistoryState } from '@ariefsn/svelte-use';
  const state = useHistoryState('hello');
</script>
<input bind:value={state.value} />
<button onclick={state.undo} disabled={!state.canUndo()}>Undo</button>
<button onclick={state.redo} disabled={!state.canRedo()}>Redo</button>`,
		notes: ['Combines `$state` with `useTrackHistory` for convenience.']
	},

	// --------------------------------------------------------------- New v1.1.0 Reactivity
	'use-watch': {
		slug: 'use-watch',
		title: 'useWatch',
		description:
			'Watches one or more reactive getters and calls a callback with the current and previous values.',
		usage: `import { useWatch } from '@ariefsn/svelte-use';

let count = $state(0);
useWatch(() => count, (curr, prev) => {
  console.log(\`\${prev} → \${curr}\`);
});`,
		params: [
			{
				name: 'deps',
				type: '(() => T) | (() => any)[]',
				description: 'Getter or array of getters to watch'
			},
			{
				name: 'fn',
				type: '(current, previous) => void',
				description: 'Callback with current and previous values'
			},
			{
				name: 'options',
				type: '{ runOnMounted?: boolean }',
				default: '{ runOnMounted: true }',
				description: 'Configuration'
			}
		],
		returns: [],
		example: `<script lang="ts">
  import { useWatch } from '@ariefsn/svelte-use';
  let count = $state(0);
  let log = $state('');
  useWatch(() => count, (curr, prev) => {
    log = \`\${prev} → \${curr}\`;
  });
</script>
<button onclick={() => count++}>Inc ({count})</button>
<p>{log}</p>`,
		notes: [
			'Supports single and multiple dependency watching.',
			'Set `runOnMounted: false` to skip initial call.'
		]
	},

	'use-whenever': {
		slug: 'use-whenever',
		title: 'useWhenever',
		description:
			'Watches a reactive getter and calls the callback only when the value becomes truthy.',
		usage: `import { useWhenever } from '@ariefsn/svelte-use';

let ready = $state(false);
useWhenever(() => ready, () => console.log('ready!'));`,
		params: [
			{
				name: 'deps',
				type: '(() => boolean) | (() => boolean)[]',
				description: 'Boolean getter(s) to watch'
			},
			{ name: 'fn', type: '() => void', description: 'Callback when truthy' },
			{
				name: 'options',
				type: '{ runOnMounted?: boolean }',
				default: '{ runOnMounted: true }',
				description: 'Configuration'
			}
		],
		returns: [],
		example: `<script lang="ts">
  import { useWhenever } from '@ariefsn/svelte-use';
  let ready = $state(false);
  let msg = $state('');
  useWhenever(() => ready, () => msg = 'Now ready!');
</script>
<button onclick={() => ready = !ready}>Toggle ({ready})</button>
<p>{msg}</p>`,
		notes: ['With multiple deps, all must be truthy.', 'Does not fire when value becomes falsy.']
	},

	'use-async-state': {
		slug: 'use-async-state',
		title: 'useAsyncState',
		description: 'Reactive wrapper around async operations, tracking loading and error states.',
		usage: `import { useAsyncState } from '@ariefsn/svelte-use';

const { current, isLoading, error } = useAsyncState(
  () => fetch('/api').then(r => r.json()),
  null
);`,
		params: [
			{
				name: 'promise',
				type: '(() => Promise<T>) | Promise<T>',
				description: 'Async function or promise'
			},
			{ name: 'initial', type: 'T', description: 'Initial value before resolution' },
			{
				name: 'options',
				type: 'UseAsyncStateOptions<T>',
				default: '{}',
				description: 'Configuration'
			}
		],
		returns: [
			{ name: 'isReady', type: '() => boolean', description: 'Whether resolved at least once' },
			{ name: 'isLoading', type: '() => boolean', description: 'Whether currently pending' },
			{ name: 'current', type: '() => T', description: 'The resolved data' },
			{ name: 'error', type: '() => unknown | null', description: 'Error if rejected' },
			{ name: 'execute', type: '(...args) => Promise<T>', description: 'Manually execute' }
		],
		example: `<script lang="ts">
  import { useAsyncState } from '@ariefsn/svelte-use';
  const { current, isLoading, error } = useAsyncState(
    () => fetch('https://jsonplaceholder.typicode.com/todos/1').then(r => r.json()),
    null
  );
</script>
{#if isLoading()}<p>Loading…</p>{:else}<pre>{JSON.stringify(current(), null, 2)}</pre>{/if}`,
		notes: [
			'Executes immediately by default. Set `immediate: false` to control manually.',
			'Supports `onSuccess` and `onError` callbacks.'
		]
	},

	// --------------------------------------------------------------- New v1.1.0 Web APIs
	'use-eye-dropper': {
		slug: 'use-eye-dropper',
		title: 'useEyeDropper',
		description: 'Reactive wrapper around the EyeDropper API for picking colors from the screen.',
		usage: `import { useEyeDropper } from '@ariefsn/svelte-use';
const { isSupported, current, open } = useEyeDropper();
const color = await open();`,
		returns: [
			{
				name: 'isSupported',
				type: '() => boolean',
				description: 'Whether EyeDropper API is available'
			},
			{ name: 'current', type: '() => string | undefined', description: 'Last picked hex color' },
			{
				name: 'open',
				type: '() => Promise<string | undefined>',
				description: 'Opens the eye dropper'
			}
		],
		example: `<script lang="ts">
  import { useEyeDropper } from '@ariefsn/svelte-use';
  const { isSupported, current, open } = useEyeDropper();
</script>
{#if isSupported()}
  <button onclick={() => open()}>Pick Color</button>
  <p style="color:{current()}">{current() ?? 'No color picked'}</p>
{:else}<p>EyeDropper not supported</p>{/if}`,
		notes: ['Only available in Chromium-based browsers.', 'Returns `undefined` if user cancels.']
	},

	'use-file-dialog': {
		slug: 'use-file-dialog',
		title: 'useFileDialog',
		description: 'Programmatic file input dialog using a hidden input element.',
		usage: `import { useFileDialog } from '@ariefsn/svelte-use';
const { files, open, reset } = useFileDialog({ accept: 'image/*' });`,
		params: [
			{ name: 'options', type: 'UseFileDialogOptions', default: '{}', description: 'Configuration' }
		],
		returns: [
			{ name: 'files', type: '() => File[]', description: 'Selected files' },
			{ name: 'open', type: '() => void', description: 'Opens file dialog' },
			{ name: 'reset', type: '() => void', description: 'Clears selected files' }
		],
		example: `<script lang="ts">
  import { useFileDialog } from '@ariefsn/svelte-use';
  const { files, open, reset } = useFileDialog({ accept: 'image/*', multiple: true });
</script>
<button onclick={open}>Select Files</button>
<button onclick={reset}>Clear</button>
<p>{files().length} file(s) selected</p>`,
		notes: ['Uses a hidden `<input type="file">` element.', 'Cleaned up automatically on destroy.']
	},

	'use-share': {
		slug: 'use-share',
		title: 'useShare',
		description: 'Reactive wrapper around the Web Share API for native sharing.',
		usage: `import { useShare } from '@ariefsn/svelte-use';
const { isSupported, share } = useShare();`,
		returns: [
			{ name: 'isSupported', type: '() => boolean', description: 'Whether Web Share is available' },
			{
				name: 'share',
				type: '(data?) => Promise<boolean>',
				description: 'Triggers native share dialog'
			}
		],
		example: `<script lang="ts">
  import { useShare } from '@ariefsn/svelte-use';
  const { isSupported, share } = useShare();
</script>
{#if isSupported()}
  <button onclick={() => share({ title: 'Check this!', url: location.href })}>Share</button>
{/if}`,
		notes: [
			'Must be triggered by a user gesture (button click).',
			'Returns `true` on success, `false` on cancel/error.'
		]
	},

	'use-vibrate': {
		slug: 'use-vibrate',
		title: 'useVibrate',
		description: 'Reactive wrapper around the Vibration API.',
		usage: `import { useVibrate } from '@ariefsn/svelte-use';
const { isSupported, vibrate, stop } = useVibrate();`,
		params: [
			{
				name: 'pattern',
				type: 'VibratePattern',
				default: '200',
				description: 'Default vibration pattern in ms'
			}
		],
		returns: [
			{
				name: 'isSupported',
				type: '() => boolean',
				description: 'Whether Vibration API is available'
			},
			{ name: 'vibrate', type: '(pattern?) => boolean', description: 'Starts vibration' },
			{ name: 'stop', type: '() => void', description: 'Stops vibration' }
		],
		example: `<script lang="ts">
  import { useVibrate } from '@ariefsn/svelte-use';
  const { isSupported, vibrate, stop } = useVibrate();
</script>
<button onclick={() => vibrate([200, 100, 200])}>Vibrate</button>
<button onclick={stop}>Stop</button>`,
		notes: [
			'Pattern is an array of alternating vibrate/pause durations in ms.',
			'Mobile devices only.'
		]
	},

	'use-web-notification': {
		slug: 'use-web-notification',
		title: 'useWebNotification',
		description: 'Reactive wrapper around the Web Notifications API for desktop notifications.',
		usage: `import { useWebNotification } from '@ariefsn/svelte-use';
const { isSupported, show, close } = useWebNotification({ title: 'Hello!' });`,
		returns: [
			{
				name: 'isSupported',
				type: '() => boolean',
				description: 'Whether Notification API is available'
			},
			{
				name: 'isPermissionGranted',
				type: '() => boolean',
				description: 'Whether permission is granted'
			},
			{
				name: 'show',
				type: '(overrides?) => Promise<Notification | null>',
				description: 'Shows notification'
			},
			{ name: 'close', type: '() => void', description: 'Closes active notification' }
		],
		example: `<script lang="ts">
  import { useWebNotification } from '@ariefsn/svelte-use';
  const { isSupported, show } = useWebNotification({ title: 'Svelte Use' });
</script>
<button onclick={() => show({ body: 'Hello from Svelte!' })}>Notify</button>`,
		notes: ['Auto-requests permission by default.', 'Cleaned up on component destroy.']
	},

	'use-permission': {
		slug: 'use-permission',
		title: 'usePermission',
		description: 'Reactive wrapper around the Permissions API to query browser permission states.',
		usage: `import { usePermission } from '@ariefsn/svelte-use';
const { isSupported, state } = usePermission('camera');`,
		params: [
			{
				name: 'name',
				type: 'PermissionName',
				description: 'Permission to query (e.g., camera, microphone)'
			}
		],
		returns: [
			{
				name: 'isSupported',
				type: '() => boolean',
				description: 'Whether Permissions API is available'
			},
			{
				name: 'state',
				type: '() => PermissionState | undefined',
				description: 'granted, denied, or prompt'
			}
		],
		example: `<script lang="ts">
  import { usePermission } from '@ariefsn/svelte-use';
  const cam = usePermission('camera');
</script>
<p>Camera: {cam.state() ?? 'unknown'}</p>`,
		notes: [
			'Reactively updates when permission state changes.',
			'Not all permission names are supported in all browsers.'
		]
	},

	'use-wake-lock': {
		slug: 'use-wake-lock',
		title: 'useWakeLock',
		description:
			'Prevents the device screen from dimming or locking using the Screen Wake Lock API.',
		usage: `import { useWakeLock } from '@ariefsn/svelte-use';
const { isSupported, isActive, request, release } = useWakeLock();`,
		returns: [
			{
				name: 'isSupported',
				type: '() => boolean',
				description: 'Whether Wake Lock API is available'
			},
			{ name: 'isActive', type: '() => boolean', description: 'Whether lock is active' },
			{ name: 'request', type: '() => Promise<void>', description: 'Request wake lock' },
			{ name: 'release', type: '() => Promise<void>', description: 'Release wake lock' }
		],
		example: `<script lang="ts">
  import { useWakeLock } from '@ariefsn/svelte-use';
  const { isSupported, isActive, request, release } = useWakeLock();
</script>
<button onclick={request}>Keep Screen On</button>
<button onclick={release}>Allow Sleep</button>
<p>Active: {isActive()}</p>`,
		notes: [
			'Released automatically on component destroy.',
			'May be released by the browser when tab becomes hidden.'
		]
	},

	'use-event-listener': {
		slug: 'use-event-listener',
		title: 'useEventListener',
		description: 'Generic event listener utility with automatic cleanup on component destroy.',
		usage: `import { useEventListener } from '@ariefsn/svelte-use';
useEventListener(window, 'resize', (e) => console.log(e));`,
		params: [
			{ name: 'target', type: 'EventTarget | (() => EventTarget)', description: 'Event target' },
			{ name: 'event', type: 'string | string[]', description: 'Event name(s)' },
			{ name: 'handler', type: '(e) => void', description: 'Event handler' },
			{
				name: 'options',
				type: 'AddEventListenerOptions',
				default: 'undefined',
				description: 'Listener options'
			}
		],
		returns: [{ name: '()', type: '() => void', description: 'Manual cleanup function' }],
		example: `<script lang="ts">
  import { useEventListener } from '@ariefsn/svelte-use';
  let size = $state({ w: 0, h: 0 });
  useEventListener(window, 'resize', () => {
    size = { w: window.innerWidth, h: window.innerHeight };
  });
</script>
<p>{size.w} × {size.h}</p>`,
		notes: ['Supports multiple events via array.', 'Supports getter functions for dynamic targets.']
	},

	'use-text-direction': {
		slug: 'use-text-direction',
		title: 'useTextDirection',
		description:
			'Reactively tracks and sets the text directionality (dir attribute) of an element.',
		usage: `import { useTextDirection } from '@ariefsn/svelte-use';
const { current, set } = useTextDirection();`,
		returns: [
			{
				name: 'current',
				type: '() => TextDirection',
				description: 'Current direction (ltr, rtl, auto)'
			},
			{ name: 'set', type: '(dir) => void', description: 'Set the direction' }
		],
		example: `<script lang="ts">
  import { useTextDirection } from '@ariefsn/svelte-use';
  const { current, set } = useTextDirection();
</script>
<button onclick={() => set(current() === 'ltr' ? 'rtl' : 'ltr')}>
  Toggle ({current()})
</button>`,
		notes: [
			'Defaults to `document.documentElement`.',
			'Uses MutationObserver to track external changes.'
		]
	},

	'use-text-selection': {
		slug: 'use-text-selection',
		title: 'useTextSelection',
		description: 'Reactively tracks the current text selection in the document.',
		usage: `import { useTextSelection } from '@ariefsn/svelte-use';
const { text, rects, ranges } = useTextSelection();`,
		returns: [
			{ name: 'text', type: '() => string', description: 'Selected text content' },
			{ name: 'rects', type: '() => DOMRect[]', description: 'Bounding rectangles' },
			{ name: 'ranges', type: '() => Range[]', description: 'Selection ranges' },
			{ name: 'selection', type: '() => Selection | null', description: 'Current Selection object' }
		],
		example: `<script lang="ts">
  import { useTextSelection } from '@ariefsn/svelte-use';
  const { text } = useTextSelection();
</script>
<p>Select some text on this page</p>
<p>Selected: "{text()}"</p>`,
		notes: ['Listens to `selectionchange` event.', 'SSR-safe.']
	},

	// --------------------------------------------------------------- New v1.1.0 Sensors
	'use-document-visibility': {
		slug: 'use-document-visibility',
		title: 'useDocumentVisibility',
		description: 'Reactively tracks the document visibility state (visible/hidden).',
		usage: `import { useDocumentVisibility } from '@ariefsn/svelte-use';
const { current } = useDocumentVisibility();`,
		returns: [
			{ name: 'current', type: '() => DocumentVisibilityState', description: 'visible or hidden' }
		],
		example: `<script lang="ts">
  import { useDocumentVisibility } from '@ariefsn/svelte-use';
  const { current } = useDocumentVisibility();
</script>
<p>Tab is {current()}</p>`,
		notes: ['Useful for pausing animations when tab is hidden.']
	},

	'use-window-focus': {
		slug: 'use-window-focus',
		title: 'useWindowFocus',
		description: 'Reactively tracks whether the browser window has focus.',
		usage: `import { useWindowFocus } from '@ariefsn/svelte-use';
const { focused } = useWindowFocus();`,
		returns: [{ name: 'focused', type: '() => boolean', description: 'Whether window is focused' }],
		example: `<script lang="ts">
  import { useWindowFocus } from '@ariefsn/svelte-use';
  const { focused } = useWindowFocus();
</script>
<p>Window {focused() ? 'focused' : 'blurred'}</p>`,
		notes: ['SSR-safe — defaults to `false`.']
	},

	'use-device-motion': {
		slug: 'use-device-motion',
		title: 'useDeviceMotion',
		description:
			'Reactive wrapper around the DeviceMotion API for tracking device acceleration and rotation.',
		usage: `import { useDeviceMotion } from '@ariefsn/svelte-use';
const { isSupported, acceleration, rotationRate } = useDeviceMotion();`,
		returns: [
			{
				name: 'isSupported',
				type: '() => boolean',
				description: 'Whether DeviceMotion is available'
			},
			{
				name: 'acceleration',
				type: '() => DeviceMotionEventAcceleration | null',
				description: 'Acceleration excluding gravity'
			},
			{
				name: 'accelerationIncludingGravity',
				type: '() => DeviceMotionEventAcceleration | null',
				description: 'Acceleration including gravity'
			},
			{
				name: 'rotationRate',
				type: '() => DeviceMotionEventRotationRate | null',
				description: 'Rotation rate'
			},
			{ name: 'interval', type: '() => number', description: 'Sampling interval in ms' }
		],
		example: `<script lang="ts">
  import { useDeviceMotion } from '@ariefsn/svelte-use';
  const { acceleration } = useDeviceMotion();
</script>
<p>X: {acceleration()?.x?.toFixed(2) ?? 'N/A'}</p>`,
		notes: ['Mobile devices only.', 'May require HTTPS and user permission.']
	},

	'use-device-orientation': {
		slug: 'use-device-orientation',
		title: 'useDeviceOrientation',
		description:
			'Reactive wrapper around the DeviceOrientation API for tracking physical device orientation.',
		usage: `import { useDeviceOrientation } from '@ariefsn/svelte-use';
const { alpha, beta, gamma } = useDeviceOrientation();`,
		returns: [
			{
				name: 'isSupported',
				type: '() => boolean',
				description: 'Whether DeviceOrientation is available'
			},
			{ name: 'isAbsolute', type: '() => boolean', description: 'Whether data is absolute' },
			{ name: 'alpha', type: '() => number | null', description: 'Z-axis rotation (0-360°)' },
			{ name: 'beta', type: '() => number | null', description: 'X-axis rotation (-180 to 180°)' },
			{ name: 'gamma', type: '() => number | null', description: 'Y-axis rotation (-90 to 90°)' }
		],
		example: `<script lang="ts">
  import { useDeviceOrientation } from '@ariefsn/svelte-use';
  const { alpha, beta, gamma } = useDeviceOrientation();
</script>
<p>α: {alpha()?.toFixed(1)} β: {beta()?.toFixed(1)} γ: {gamma()?.toFixed(1)}</p>`,
		notes: ['Mobile devices only.']
	},

	'use-device-pixel-ratio': {
		slug: 'use-device-pixel-ratio',
		title: 'useDevicePixelRatio',
		description: 'Reactively tracks the device pixel ratio (DPR) for Retina display detection.',
		usage: `import { useDevicePixelRatio } from '@ariefsn/svelte-use';
const { current } = useDevicePixelRatio();`,
		returns: [
			{ name: 'isSupported', type: '() => boolean', description: 'Whether DPR is available' },
			{ name: 'current', type: '() => number', description: 'Current pixel ratio' }
		],
		example: `<script lang="ts">
  import { useDevicePixelRatio } from '@ariefsn/svelte-use';
  const { current } = useDevicePixelRatio();
</script>
<p>DPR: {current()} ({current() > 1 ? 'HiDPI' : 'Standard'})</p>`,
		notes: ['Updates when DPR changes (e.g., moving window between displays).']
	},

	'use-scrollbar-width': {
		slug: 'use-scrollbar-width',
		title: 'useScrollbarWidth',
		description: 'Measures the scrollbar width of an element.',
		usage: `import { useScrollbarWidth } from '@ariefsn/svelte-use';
let el: HTMLElement;
const { x, y } = useScrollbarWidth(() => el);`,
		params: [
			{ name: 'target', type: '() => HTMLElement | null', description: 'Target element getter' }
		],
		returns: [
			{ name: 'x', type: '() => number', description: 'Horizontal scrollbar height in px' },
			{ name: 'y', type: '() => number', description: 'Vertical scrollbar width in px' }
		],
		example: `<script lang="ts">
  import { useScrollbarWidth } from '@ariefsn/svelte-use';
  let el: HTMLDivElement;
  const { y } = useScrollbarWidth(() => el);
</script>
<div bind:this={el} style="height:100px;overflow:auto">
  <div style="height:500px">Content</div>
</div>
<p>Scrollbar width: {y()}px</p>`,
		notes: ['Uses ResizeObserver to update on size changes.']
	},

	// --------------------------------------------------------------- New v1.1.0 Interaction
	'use-active-element': {
		slug: 'use-active-element',
		title: 'useActiveElement',
		description: 'Tracks the currently focused element in the document.',
		usage: `import { useActiveElement } from '@ariefsn/svelte-use';
const { current } = useActiveElement();`,
		returns: [
			{ name: 'current', type: '() => Element | null', description: 'Currently focused element' }
		],
		example: `<script lang="ts">
  import { useActiveElement } from '@ariefsn/svelte-use';
  const { current } = useActiveElement();
</script>
<input placeholder="Focus me" />
<button>Or me</button>
<p>Active: {current()?.tagName ?? 'none'}</p>`,
		notes: [
			'Listens to focus/blur events on window (capture phase).',
			'Different from useFocus which tracks a specific element.'
		]
	},

	'use-long-press': {
		slug: 'use-long-press',
		title: 'useLongPress',
		description: 'Detects long press gestures on an element using pointer events.',
		usage: `import { useLongPress } from '@ariefsn/svelte-use';
let el: HTMLElement;
useLongPress(() => el, (e) => console.log('long pressed!'));`,
		params: [
			{ name: 'target', type: '() => HTMLElement | null', description: 'Target element getter' },
			{ name: 'handler', type: '(e: PointerEvent) => void', description: 'Long press callback' },
			{ name: 'options', type: 'UseLongPressOptions', default: '{}', description: 'Configuration' }
		],
		returns: [{ name: '()', type: '() => void', description: 'Manual cleanup function' }],
		example: `<script lang="ts">
  import { useLongPress } from '@ariefsn/svelte-use';
  let el: HTMLDivElement;
  let pressed = $state(false);
  useLongPress(() => el, () => pressed = true, { delay: 500 });
</script>
<div bind:this={el} style="padding:2rem;background:#1e1e2e;cursor:pointer">
  {pressed ? 'Long pressed!' : 'Hold me...'}
</div>`,
		notes: [
			'Cancels if pointer moves beyond distance threshold.',
			'Default delay: 500ms, threshold: 10px.'
		]
	},

	'use-start-typing': {
		slug: 'use-start-typing',
		title: 'useStartTyping',
		description: 'Detects when a user starts typing on non-editable elements.',
		usage: `import { useStartTyping } from '@ariefsn/svelte-use';
useStartTyping((e) => searchInput.focus());`,
		params: [
			{
				name: 'callback',
				type: '(e: KeyboardEvent) => void',
				description: 'Callback when typing starts'
			}
		],
		returns: [{ name: '()', type: '() => void', description: 'Manual cleanup function' }],
		example: `<script lang="ts">
  import { useStartTyping } from '@ariefsn/svelte-use';
  let input: HTMLInputElement;
  useStartTyping(() => input?.focus());
</script>
<p>Start typing anywhere to focus the search:</p>
<input bind:this={input} placeholder="Search..." />`,
		notes: [
			'Ignores keys when active element is an input/textarea/contentEditable.',
			'Ignores modifier keys (Ctrl, Meta, Alt).'
		]
	},

	'use-swipe': {
		slug: 'use-swipe',
		title: 'useSwipe',
		description: 'Detects touch swipe gestures on an element.',
		usage: `import { useSwipe } from '@ariefsn/svelte-use';
let el: HTMLElement;
const { direction, isSwiping } = useSwipe(() => el);`,
		params: [
			{ name: 'target', type: '() => HTMLElement | null', description: 'Target element getter' },
			{ name: 'options', type: 'UseSwipeOptions', default: '{}', description: 'Configuration' }
		],
		returns: [
			{ name: 'isSwiping', type: '() => boolean', description: 'Whether swiping' },
			{
				name: 'direction',
				type: '() => SwipeDirection',
				description: 'up, down, left, right, or none'
			},
			{ name: 'coordsStart', type: '() => {x, y}', description: 'Start position' },
			{ name: 'coordsEnd', type: '() => {x, y}', description: 'End position' },
			{ name: 'lengthX', type: '() => number', description: 'Horizontal distance' },
			{ name: 'lengthY', type: '() => number', description: 'Vertical distance' },
			{ name: 'reset', type: '() => void', description: 'Reset state' }
		],
		example: `<script lang="ts">
  import { useSwipe } from '@ariefsn/svelte-use';
  let el: HTMLDivElement;
  const { direction, isSwiping } = useSwipe(() => el, { threshold: 50 });
</script>
<div bind:this={el} style="height:200px;background:#1e1e2e;touch-action:none">
  <p>{isSwiping() ? 'Swiping...' : direction() !== 'none' ? direction() : 'Swipe here'}</p>
</div>`,
		notes: [
			'Uses TouchEvents.',
			'Default threshold: 50px.',
			'Supports `onStart`, `onMove`, `onEnd` callbacks.'
		]
	},

	'use-navigation-guard': {
		slug: 'use-navigation-guard',
		title: 'useNavigationGuard',
		description: 'Guards SvelteKit navigation with a confirm/cancel flow for unsaved changes.',
		usage: `import { useNavigationGuard } from '@ariefsn/svelte-use';

const { confirm, cancel } = useNavigationGuard({
  shouldBlock: () => hasChanges,
  onBlock: () => showDialog = true
});`,
		params: [
			{ name: 'options', type: 'UseNavigationGuardOptions', description: 'Guard configuration' }
		],
		returns: [
			{ name: 'confirm', type: '() => void', description: 'Proceed with pending navigation' },
			{ name: 'cancel', type: '() => void', description: 'Cancel pending navigation' }
		],
		example: `<script lang="ts">
  import { useNavigationGuard } from '@ariefsn/svelte-use';

  let draft = $state('');
  let saved = $state('');
  let showDialog = $state(false);

  const hasUnsavedChanges = $derived(draft !== saved);

  const { confirm, cancel } = useNavigationGuard({
    shouldBlock: () => hasUnsavedChanges,
    onBlock: () => (showDialog = true)
  });
</script>

<textarea bind:value={draft}></textarea>
<button onclick={() => (saved = draft)} disabled={!hasUnsavedChanges}>Save</button>

{#if showDialog}
  <div role="alertdialog">
    <p>Leave without saving?</p>
    <!-- confirm() bypasses the guard for this one navigation, so there is no
         need to clear hasUnsavedChanges first -->
    <button onclick={() => { showDialog = false; confirm(); }}>Leave anyway</button>
    <button onclick={() => { showDialog = false; cancel(); }}>Stay here</button>
  </div>
{/if}`,
		notes: [
			'**Requires SvelteKit.** This is the only composable in the library that is not plain-Svelte — it imports `beforeNavigate` and `goto` from `$app/navigation`, a SvelteKit-only module. Every other util works in any Svelte 5 app.',
			'`@sveltejs/kit` is not declared as a peer dependency, so a non-SvelteKit project importing this util will fail to resolve `$app/navigation` at build time.',
			'Handles popstate, link, and goto navigation types. Form submissions are not guarded.',
			'`confirm()` and `cancel()` are actions you call to resolve a pending navigation — not callbacks you supply. Use the `onBlock` option to react to the guard firing.',
			'`confirm()` lets exactly one navigation through, so you do **not** need to clear your own `shouldBlock` flag before calling it. The bypass is single-use: the next navigation is guarded again.',
			'`confirm()` is a no-op unless a navigation was actually blocked, since it replays the URL the guard captured.'
		]
	},

	'use-scroll-lock': {
		slug: 'use-scroll-lock',
		title: 'useScrollLock',
		description:
			'Locks and unlocks scroll on a target element (defaults to `document.body`) by toggling `overflow: hidden`. The previous overflow value is captured before locking and restored on unlock.',
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
			'The previous `overflow` value is captured before locking and restored when `unlock()` is called, preventing style leaks.',
			'Scroll is automatically unlocked when the component that owns the reactive scope is destroyed.',
			'Calling `lock()` multiple times without an intervening `unlock()` is a no-op — the original overflow is preserved.'
		]
	}
};
