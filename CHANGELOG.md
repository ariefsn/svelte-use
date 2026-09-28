# Changelog

All notable changes to `@ariefsn/svelte-use` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.1] - 2026-09-28

### Fixed

- `useDraggable` stopped after a few pixels on touch devices: the browser took the gesture as a pan and fired `pointercancel`. While touch is allowed, `style()` now includes `touch-action: none` and the handle gets it inline on mount. It lives in `style()` because a `style={...}` binding overwrites the whole inline style, which broke every drag after the first (#27)
- `useDraggable` no longer lets a second pointer (another finger) restart or hijack an active drag

## [1.2.0] - 2026-09-27

### Added

- **40 new utility composables and the library's first component**, built in tiers so each one removes duplication rather than adding to it

#### Head & SEO

- `useSeo` — layered SEO metadata as a builder, merged per key and rendered into `<svelte:head>`
- `Seo` — component that renders `useSeo` output; the first Svelte component this library ships

#### Foundational

- `useSupported` — SSR-safe feature detection, replacing the guard ten composables hand-rolled
- `useMediaQuery` — reactively track whether a CSS media query matches
- `useRafFn` — run a callback on every animation frame, with pause and resume
- `useUntil` — await a reactive value reaching a condition
- `useStorage` — the shared generic beneath `useLocalStorage` and `useSessionStorage`

#### State

- `useStateMachine` — finite state machine with states and actions inferred from the config
- `useOffsetPagination` — pagination state that corrects itself when the total shrinks
- `useConfirmDialog` — confirmation flow as a single `await`, with no markup of its own

#### Reactivity

- `useCloned` — deep copy of a reactive value, for edit buffers

#### Async

- `useEventSource` — server-sent events; the browser's own reconnection is left alone
- `useBroadcastChannel` — cross-tab messaging by structured clone
- `useAsyncQueue` — run async tasks with bounded concurrency and per-task status

#### Performance

- `useWebWorkerFn` — run a self-contained function off the main thread
- `useMemoize` — cache a function's results by its arguments, with optional LRU eviction

#### Browser - Appearance

- `useColorMode` — colour mode with `auto` resolution, persistence and cross-tab sync
- `usePreferredDark` — whether the OS requests a dark colour scheme
- `usePreferredColorScheme` — OS colour scheme as `dark` / `light` / `no-preference`
- `usePreferredReducedMotion` — whether the OS requests reduced motion
- `usePreferredContrast` — OS contrast preference, including forced colours
- `useCssVar` — read and write a CSS custom property

#### Browser - Document

- `useTitle` — read and write `document.title`, restored on destroy
- `useFavicon` — read and write the favicon, adopting an existing link
- `useStyleTag` — inject a `<style>` element, deduplicated by id
- `useScriptTag` — load an external script, deduplicated across call sites

#### Browser - Media

- `useUserMedia` — camera and microphone capture, with device switching and preview mirroring
- `useDisplayMedia` — screen capture that notices the browser's own "Stop sharing"
- `useDevicesList` — media devices grouped by kind, refreshed on `devicechange`

#### Browser - Sensors

- `useWindowSize` — reactive viewport dimensions
- `useScreenOrientation` — screen orientation and angle, with locking where available
- `useGamepad` — gamepad state, polled only while a controller is connected

#### Browser - Elements & Input

- `useElementBounding` — reactive full bounding box, position included
- `useMouseInElement` — pointer position relative to an element
- `useInfiniteScroll` — load more content as a container nears its edge
- `useTextareaAutosize` — grow a textarea to fit its content

#### Browser - Navigation

- `useUrlSearchParams` — reactive URL query parameters, with history and hash modes

#### Web APIs

- `useFullscreen` — display any element fullscreen, driven by `fullscreenchange`
- `useImage` — preload an image and track its load state
- `useSpeechSynthesis` — text-to-speech, handling asynchronous voice loading
- `useFileSystemAccess` — read **and write** real files via file handles (Chromium only)

#### Types

- Exported `UseSpeechRecognitionOptions`, `UseUntilItem`, `VirtualItem`, `UseVirtualListOptions`, `UseVirtualListReturn` and `DEFAULT_COLOR_MODE_STORAGE_KEY`, which existed but were unreachable from the package root
- Exported `EventTargetEventMap`, used by the widened `useEventListener` overload

### Changed

- `useEventListener` accepts any `EventTarget` — `MediaDevices`, `EventSource`, `BroadcastChannel`, `ScreenOrientation`, `SpeechSynthesis`, `MediaStreamTrack`, `Worker` and more — each resolved to its exact event map. The existing Window, Document and HTMLElement overloads are unchanged
- `useBreakpoints` and `useDevicePixelRatio` now build on `useMediaQuery` instead of hand-rolling `matchMedia`
- `useFps` and `useTransition` now build on `useRafFn`
- `useLocalStorage` and `useSessionStorage` now build on `useStorage`
- Nine composables — `useDeviceMotion`, `useDeviceOrientation`, `useEyeDropper`, `useGeolocation`, `usePermission`, `useShare`, `useVibrate`, `useWakeLock` and `useWebNotification` — now use `useSupported` rather than their own guards
- `useWebSocket` now shares its JSON frame parsing with `useEventSource`
- `package.json` adds an explicit `./Seo.svelte` export. Without it the existing wildcard subpath resolved the component's types but not its runtime file
- Docs site: migrated to Tailwind v4 with light/dark theming, moved from the deprecated `$app/stores` to `$app/state`, and now dogfoods `useSeo` and `<Seo />` for its own metadata

### Fixed

- `useWakeLock`, `useSpeechRecognition` and `useWebNotification` did not release their resource when the owning scope was destroyed. Each registered a teardown that read reactive state, which from that context returns a stale value, so the cleanup silently did nothing: the screen stayed awake, the microphone stayed active, and the notification was never closed. Calling `close()` and then unmounting also closed the notification twice. All three now read a plain non-reactive mirror in the teardown
- `useFullscreen` could reject with "Document not active" while exiting on destroy, when teardown ran against a document already being torn down — an unhandled rejection that failed test runs even when every assertion passed. Callers who invoke `exit()` themselves still receive the rejection
- Open Graph tags on the documentation site pointed at `http://sveltekit-prerender`, a placeholder SvelteKit substitutes for the origin during prerendering. Every page was affected; `SeoData.baseUrl` and a configured prerender origin resolve it
- The documentation site's `og:image` was an SVG, which Facebook, X, LinkedIn and WhatsApp do not render, so shared links previewed without an image. It is now a PNG
- `app.html` carried a static `<title>` that preceded the rendered one. Browsers and crawlers use the first title in a document, so every templated page title was being ignored

### Docs site

- Version badges on every documentation page, with `since` now required for each utility
- New "Browser - Media", "Head & SEO" and per-tier groupings in the sidebar
- Documentation pages can describe a component's props, not only a function's parameters
- Coverage tests now also check the demo registry, the barrel export and the README row — three touchpoints that previously drifted silently

---

## [1.1.0] - 2026-03-18

### Added

- **29 new utility composables** expanding coverage across state, reactivity, browser APIs, sensors, and gestures

#### State

- `useAutoResetState` — state that auto-resets to default after a delay
- `useDefaultState` — state with fallback value for null/undefined
- `useLastChanged` — timestamp of when a reactive value last changed
- `useTrackHistory` — undo/redo history tracking for reactive values
- `useHistoryState` — state with built-in undo/redo history

#### Reactivity

- `useWatch` — Vue-like watcher with current and previous values
- `useWhenever` — watch that fires only when value becomes truthy
- `useAsyncState` — reactive async/promise state with loading and error tracking

#### Web APIs

- `useEyeDropper` — EyeDropper API for picking colors from screen
- `useFileDialog` — programmatic file input dialog
- `useShare` — Web Share API for native sharing
- `useVibrate` — Vibration API wrapper
- `useWebNotification` — Web Notifications API
- `usePermission` — Permissions API for querying browser permissions
- `useWakeLock` — Screen Wake Lock API
- `useEventListener` — generic event listener with auto-cleanup
- `useTextDirection` — track/set text directionality (LTR/RTL)
- `useTextSelection` — track current text selection

#### Browser - Sensors

- `useDocumentVisibility` — reactive document visibility state
- `useWindowFocus` — track whether window is focused
- `useDeviceMotion` — DeviceMotion API for acceleration and rotation
- `useDeviceOrientation` — DeviceOrientation API (alpha/beta/gamma)
- `useDevicePixelRatio` — reactive device pixel ratio
- `useScrollbarWidth` — measure element scrollbar dimensions

#### Browser - Interaction

- `useActiveElement` — track currently focused element globally
- `useLongPress` — long press gesture detection
- `useStartTyping` — detect typing on non-editable elements
- `useSwipe` — touch swipe gesture detection

#### Browser - Navigation

- `useNavigationGuard` — SvelteKit navigation guard with confirm/cancel flow

---

## [1.0.0] - 2026-02-28

### Added

- **60+ Svelte 5 runes-first utility composables** — no stores, no external runtime dependencies, SSR-safe, fully typed

#### Animation

- `useAnimate` — reactive Web Animations API wrapper
- `useParallax` — parallax effect based on pointer or device tilt
- `useTransition` — animated numeric transitions with easing

#### Async

- `useFetch` — reactive fetch with loading/error state
- `useWebSocket` — reactive WebSocket with auto-reconnect

#### Time

- `useInterval` — reactive interval counter
- `useIntervalFn` — run a callback on an interval
- `useNow` — reactive current `Date`
- `useTimeout` — reactive timeout flag
- `useTimeoutFn` — run a callback after a delay
- `useTimeoutPoll` — poll a callback with timeout-based intervals
- `useTimestamp` — reactive current timestamp (ms)

#### State

- `useToggle` — reactive boolean toggle
- `useCounter` — reactive counter with inc/dec/reset
- `usePrevious` — track previous value of any reactive getter
- `useSorted` — reactive sorted copy of an array
- `useCycleList` — cycle through a list reactively
- `useCountdown` — countdown timer with start/stop/reset
- `useTimeAgo` — human-readable relative time string

#### Reactivity

- `useDebounce` — debounce any reactive getter
- `useThrottleFn` — throttle any function
- `useDebounceFn` — debounce any function

#### Browser — Keyboard & Scroll

- `useMagicKeys` — reactive keyboard state via Proxy (single keys or combos)
- `useKeyModifier` — track Ctrl/Shift/Alt/Meta state
- `useScroll` — scroll position, direction, edge arrival
- `useScrollLock` — lock/unlock body scroll

#### Browser — Pointer & Drag

- `useMouse` — viewport-relative pointer position
- `useMousePressed` — detect mouse button press state
- `useDraggable` — full-featured draggable with axis, bounds, handles

#### Browser — Observers

- `useElementSize` — reactive element dimensions via `ResizeObserver`
- `useIntersectionObserver` — visibility detection via `IntersectionObserver`
- `useResizeObserver` — raw `ResizeObserver` with callback
- `useMutationObserver` — DOM mutation observation

#### Browser — Sensors

- `useIdle` — detect user idle state
- `useNetwork` — Network Information API (downlink, RTT, effectiveType)
- `useGeolocation` — reactive geolocation via `watchPosition`
- `useBreakpoints` — reactive responsive breakpoints
- `useBrowserLocation` — reactive browser location (URL, hash, search)
- `useNavigatorLanguage` — reactive navigator language
- `useOnline` — reactive online/offline status
- `usePageLeave` — detect when user leaves the page

#### Browser — Storage

- `useLocalStorage` — reactive `localStorage` with SSR safety
- `useSessionStorage` — reactive `sessionStorage` with SSR safety
- `useIndexedDB` — reactive IndexedDB with full CRUD and querying
- `useBase64` — reactive Base64 encode/decode
- `useObjectUrl` — reactive object URL from Blob/File

#### Browser — Interaction

- `useClickOutside` — detect clicks outside an element
- `useDropZone` — drag-and-drop zone with file/data support
- `useElementHover` — detect hover state of an element
- `useFocus` — reactive focus state of an element

#### Performance & Virtualization

- `useFps` — reactive frames-per-second counter
- `useVirtualList` — efficient virtual list rendering

#### Web APIs

- `useClipboard` — reactive clipboard read/write
- `useBattery` — reactive Battery Status API
- `useSpeechRecognition` — reactive Web Speech Recognition API

### Docs site

- Full interactive documentation site with live demos for every composable
- Mobile-responsive sidebar layout with logo
- OpenGraph and Twitter card metadata on all routes

### Fixed

- `usePageLeave`, `useParallax`, `useDropZone`, `useElementHover`, `useFocus`, `useTimeoutFn`, `useTimeoutPoll` — resolved reactivity and event-listener bugs
- `useVirtualList` — corrected off-by-one in `endIndex` calculation
- `useParallax`, `useSpeechRecognition` — fixed failing browser tests
