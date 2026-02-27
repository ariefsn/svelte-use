import { describe, expect, test } from 'vitest';
import { useIndexedDB } from './useIndexedDB.svelte.js';

interface Note {
	id?: number;
	text: string;
	done: boolean;
}

// Each test uses a unique DB name to ensure full isolation.
let dbSeq = 0;
function freshDb() {
	return useIndexedDB<Note>(`idb-test-${++dbSeq}`, 'notes');
}

describe('useIndexedDB', () => {
	test('items starts empty', async () => {
		let db!: ReturnType<typeof freshDb>;
		const cleanup = $effect.root(() => {
			db = freshDb();
		});

		await db.getAll();
		expect(db.items).toEqual([]);
		expect(db.loading).toBe(false);
		expect(db.error).toBeNull();

		cleanup();
	});

	test('add() inserts a record and updates items', async () => {
		let db!: ReturnType<typeof freshDb>;
		const cleanup = $effect.root(() => {
			db = freshDb();
		});

		const key = await db.add({ text: 'Buy milk', done: false });

		expect(key).toBeDefined();
		expect(db.items.length).toBe(1);
		expect(db.items[0].text).toBe('Buy milk');
		expect(db.items[0].done).toBe(false);

		cleanup();
	});

	test('add() assigns auto-incremented id', async () => {
		let db!: ReturnType<typeof freshDb>;
		const cleanup = $effect.root(() => {
			db = freshDb();
		});

		const k1 = await db.add({ text: 'First', done: false });
		const k2 = await db.add({ text: 'Second', done: false });

		expect(k1).toBe(1);
		expect(k2).toBe(2);
		expect(db.items.length).toBe(2);

		cleanup();
	});

	test('get() retrieves a record by key', async () => {
		let db!: ReturnType<typeof freshDb>;
		const cleanup = $effect.root(() => {
			db = freshDb();
		});

		await db.add({ text: 'Hello', done: false });
		const record = await db.get(1);

		expect(record).toBeDefined();
		expect(record!.text).toBe('Hello');

		cleanup();
	});

	test('get() returns undefined for missing key', async () => {
		let db!: ReturnType<typeof freshDb>;
		const cleanup = $effect.root(() => {
			db = freshDb();
		});

		const record = await db.get(999);
		expect(record).toBeUndefined();

		cleanup();
	});

	test('update() modifies a record and refreshes items', async () => {
		let db!: ReturnType<typeof freshDb>;
		const cleanup = $effect.root(() => {
			db = freshDb();
		});

		await db.add({ text: 'Old text', done: false });
		await db.update({ id: 1, text: 'New text', done: true });

		expect(db.items.length).toBe(1);
		expect(db.items[0].text).toBe('New text');
		expect(db.items[0].done).toBe(true);

		cleanup();
	});

	test('remove() deletes a record and refreshes items', async () => {
		let db!: ReturnType<typeof freshDb>;
		const cleanup = $effect.root(() => {
			db = freshDb();
		});

		await db.add({ text: 'To delete', done: false });
		expect(db.items.length).toBe(1);

		await db.remove(1);
		expect(db.items.length).toBe(0);

		cleanup();
	});

	test('query() filters records without modifying items', async () => {
		let db!: ReturnType<typeof freshDb>;
		const cleanup = $effect.root(() => {
			db = freshDb();
		});

		await db.add({ text: 'Task A', done: false });
		await db.add({ text: 'Task B', done: true });
		await db.add({ text: 'Task C', done: false });

		const pending = await db.query((n) => !n.done);
		const done = await db.query((n) => n.done);

		expect(pending.length).toBe(2);
		expect(done.length).toBe(1);
		// items still contains all three
		expect(db.items.length).toBe(3);

		cleanup();
	});

	test('query() returns empty array when no records match', async () => {
		let db!: ReturnType<typeof freshDb>;
		const cleanup = $effect.root(() => {
			db = freshDb();
		});

		await db.add({ text: 'Task', done: false });
		const result = await db.query((n) => n.text.includes('xyz'));
		expect(result).toEqual([]);

		cleanup();
	});

	test('clear() removes all records', async () => {
		let db!: ReturnType<typeof freshDb>;
		const cleanup = $effect.root(() => {
			db = freshDb();
		});

		await db.add({ text: 'A', done: false });
		await db.add({ text: 'B', done: false });
		expect(db.items.length).toBe(2);

		await db.clear();
		expect(db.items.length).toBe(0);

		cleanup();
	});

	test('getAll() returns and syncs items', async () => {
		let db!: ReturnType<typeof freshDb>;
		const cleanup = $effect.root(() => {
			db = freshDb();
		});

		await db.add({ text: 'One', done: false });
		await db.add({ text: 'Two', done: true });

		const all = await db.getAll();
		expect(all.length).toBe(2);
		expect(db.items.length).toBe(2);

		cleanup();
	});

	test('loading is false after each operation completes', async () => {
		let db!: ReturnType<typeof freshDb>;
		const cleanup = $effect.root(() => {
			db = freshDb();
		});

		await db.add({ text: 'X', done: false });
		expect(db.loading).toBe(false);

		await db.getAll();
		expect(db.loading).toBe(false);

		cleanup();
	});

	test('error is null on successful operations', async () => {
		let db!: ReturnType<typeof freshDb>;
		const cleanup = $effect.root(() => {
			db = freshDb();
		});

		await db.add({ text: 'Clean', done: false });
		expect(db.error).toBeNull();

		cleanup();
	});

	test('multiple independent stores do not interfere', async () => {
		let dbA!: ReturnType<typeof freshDb>;
		let dbB!: ReturnType<typeof freshDb>;

		const cleanupA = $effect.root(() => {
			dbA = freshDb();
		});
		const cleanupB = $effect.root(() => {
			dbB = freshDb();
		});

		await dbA.add({ text: 'Note in A', done: false });
		await dbB.add({ text: 'Note in B', done: false });
		await dbB.add({ text: 'Note in B again', done: true });

		expect(dbA.items.length).toBe(1);
		expect(dbB.items.length).toBe(2);

		cleanupA();
		cleanupB();
	});
});
