# Changelog

All notable changes to `@ariefsn/svelte-use` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
