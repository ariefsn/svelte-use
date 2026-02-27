export interface UseIndexedDBOptions {
	/** IndexedDB schema version. Increment to trigger `onupgradeneeded`. @default 1 */
	version?: number;
	/** Key path (field name) used as the primary key. @default 'id' */
	keyPath?: string;
	/** Auto-generate the key on `add`. @default true */
	autoIncrement?: boolean;
}

/**
 * Reactive IndexedDB utility with full CRUD, querying, and filtering.
 *
 * Opens (or creates) an object store on first use. All mutation methods
 * (`add`, `update`, `remove`, `clear`) automatically refresh the reactive
 * `items` array. SSR-safe — all operations are no-ops on the server.
 *
 * @param dbName    - IndexedDB database name
 * @param storeName - Object store name
 * @param options   - Version, keyPath, autoIncrement overrides
 *
 * @example
 * ```ts
 * interface Note { id?: number; text: string; done: boolean }
 * const db = useIndexedDB<Note>('my-app', 'notes');
 * await db.add({ text: 'Buy milk', done: false });
 * db.items;                                // [{ id: 1, text: 'Buy milk', done: false }]
 * await db.update({ id: 1, text: 'Buy milk', done: true });
 * await db.remove(1);
 * const pending = await db.query(n => !n.done);
 * ```
 */
export function useIndexedDB<T extends object>(
	dbName: string,
	storeName: string,
	options: UseIndexedDBOptions = {}
) {
	const { version = 1, keyPath = 'id', autoIncrement = true } = options;
	const isBrowser = typeof window !== 'undefined';

	let items = $state<T[]>([]);
	let loading = $state(false);
	let error = $state<Error | null>(null);

	let _db: IDBDatabase | null = null;
	let _dbPromise: Promise<IDBDatabase> | null = null;

	function _openDB(): Promise<IDBDatabase> {
		if (_db) return Promise.resolve(_db);
		if (_dbPromise) return _dbPromise;

		_dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
			const request = indexedDB.open(dbName, version);

			request.onupgradeneeded = (e) => {
				const db = (e.target as IDBOpenDBRequest).result;
				if (!db.objectStoreNames.contains(storeName)) {
					db.createObjectStore(storeName, { keyPath, autoIncrement });
				}
			};

			request.onsuccess = (e) => {
				_db = (e.target as IDBOpenDBRequest).result;
				resolve(_db);
			};

			request.onerror = (e) => reject((e.target as IDBOpenDBRequest).error);
		});

		return _dbPromise;
	}

	async function _refresh(): Promise<void> {
		const db = await _openDB();
		items = await new Promise<T[]>((resolve, reject) => {
			const tx = db.transaction(storeName, 'readonly');
			const store = tx.objectStore(storeName);
			const req = store.getAll();
			req.onsuccess = () => resolve(req.result as T[]);
			req.onerror = () => reject(req.error);
		});
	}

	/**
	 * Fetch all records and refresh the reactive `items` array.
	 * @returns All stored records
	 */
	async function getAll(): Promise<T[]> {
		if (!isBrowser) return [];
		loading = true;
		error = null;
		try {
			await _refresh();
			return items;
		} catch (e) {
			error = e instanceof Error ? e : new Error(String(e));
			return [];
		} finally {
			loading = false;
		}
	}

	/**
	 * Fetch a single record by its primary key.
	 * @param key - The primary key value
	 */
	async function get(key: IDBValidKey): Promise<T | undefined> {
		if (!isBrowser) return undefined;
		loading = true;
		error = null;
		try {
			const db = await _openDB();
			return await new Promise<T | undefined>((resolve, reject) => {
				const tx = db.transaction(storeName, 'readonly');
				const store = tx.objectStore(storeName);
				const req = store.get(key);
				req.onsuccess = () => resolve(req.result as T | undefined);
				req.onerror = () => reject(req.error);
			});
		} catch (e) {
			error = e instanceof Error ? e : new Error(String(e));
			return undefined;
		} finally {
			loading = false;
		}
	}

	/**
	 * Add a new record. The primary key is auto-generated when `autoIncrement`
	 * is `true` (default). Refreshes `items` on success.
	 * @param record - Record to insert (omit the keyPath field for auto-increment)
	 * @returns The generated key, or `undefined` on failure
	 */
	async function add(record: T): Promise<IDBValidKey | undefined> {
		if (!isBrowser) return undefined;
		loading = true;
		error = null;
		try {
			const db = await _openDB();
			const key = await new Promise<IDBValidKey>((resolve, reject) => {
				const tx = db.transaction(storeName, 'readwrite');
				const store = tx.objectStore(storeName);
				const req = store.add(record);
				req.onsuccess = () => resolve(req.result);
				req.onerror = () => reject(req.error);
			});
			await _refresh();
			return key;
		} catch (e) {
			error = e instanceof Error ? e : new Error(String(e));
			return undefined;
		} finally {
			loading = false;
		}
	}

	/**
	 * Update an existing record (uses `IDBObjectStore.put`). The record must
	 * include the keyPath field. Refreshes `items` on success.
	 * @param record - Full record including its primary key
	 */
	async function update(record: T): Promise<void> {
		if (!isBrowser) return;
		loading = true;
		error = null;
		try {
			const db = await _openDB();
			await new Promise<void>((resolve, reject) => {
				const tx = db.transaction(storeName, 'readwrite');
				const store = tx.objectStore(storeName);
				const req = store.put(record);
				req.onsuccess = () => resolve();
				req.onerror = () => reject(req.error);
			});
			await _refresh();
		} catch (e) {
			error = e instanceof Error ? e : new Error(String(e));
		} finally {
			loading = false;
		}
	}

	/**
	 * Delete a record by its primary key. Refreshes `items` on success.
	 * @param key - The primary key value
	 */
	async function remove(key: IDBValidKey): Promise<void> {
		if (!isBrowser) return;
		loading = true;
		error = null;
		try {
			const db = await _openDB();
			await new Promise<void>((resolve, reject) => {
				const tx = db.transaction(storeName, 'readwrite');
				const store = tx.objectStore(storeName);
				const req = store.delete(key);
				req.onsuccess = () => resolve();
				req.onerror = () => reject(req.error);
			});
			await _refresh();
		} catch (e) {
			error = e instanceof Error ? e : new Error(String(e));
		} finally {
			loading = false;
		}
	}

	/**
	 * Filter records using a predicate. Does not modify `items`.
	 * For large stores consider using IDB indexes instead.
	 * @param filter - Predicate function; return `true` to include a record
	 * @returns Matching records
	 */
	async function query(filter: (record: T) => boolean): Promise<T[]> {
		if (!isBrowser) return [];
		loading = true;
		error = null;
		try {
			const db = await _openDB();
			const all = await new Promise<T[]>((resolve, reject) => {
				const tx = db.transaction(storeName, 'readonly');
				const store = tx.objectStore(storeName);
				const req = store.getAll();
				req.onsuccess = () => resolve(req.result as T[]);
				req.onerror = () => reject(req.error);
			});
			return all.filter(filter);
		} catch (e) {
			error = e instanceof Error ? e : new Error(String(e));
			return [];
		} finally {
			loading = false;
		}
	}

	/**
	 * Delete all records from the store. Refreshes `items` on success.
	 */
	async function clear(): Promise<void> {
		if (!isBrowser) return;
		loading = true;
		error = null;
		try {
			const db = await _openDB();
			await new Promise<void>((resolve, reject) => {
				const tx = db.transaction(storeName, 'readwrite');
				const store = tx.objectStore(storeName);
				const req = store.clear();
				req.onsuccess = () => resolve();
				req.onerror = () => reject(req.error);
			});
			await _refresh();
		} catch (e) {
			error = e instanceof Error ? e : new Error(String(e));
		} finally {
			loading = false;
		}
	}

	// Load all records when first mounted in a browser context.
	$effect(() => {
		if (isBrowser) {
			getAll();
		}
	});

	return {
		get items() {
			return items;
		},
		get loading() {
			return loading;
		},
		get error() {
			return error;
		},
		add,
		get: get,
		getAll,
		update,
		remove,
		query,
		clear
	};
}
