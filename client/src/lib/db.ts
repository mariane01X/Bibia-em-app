import { openDB } from 'idb';

const DB_NAME = 'bibliaDB';
const DB_VERSION = 1;

export const db = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    // Store para versículos memorizados
    if (!db.objectStoreNames.contains('verses')) {
      const versesStore = db.createObjectStore('verses', { keyPath: 'id' });
      versesStore.createIndex('usuarioId', 'usuarioId');
    }

    // Store para devocionais
    if (!db.objectStoreNames.contains('devotionals')) {
      const devotionalsStore = db.createObjectStore('devotionals', { keyPath: 'id' });
      devotionalsStore.createIndex('usuarioId', 'usuarioId');
    }

    // Store para pedidos de oração
    if (!db.objectStoreNames.contains('prayers')) {
      const prayersStore = db.createObjectStore('prayers', { keyPath: 'id' });
      prayersStore.createIndex('usuarioId', 'usuarioId');
    }
  },
});

// Funções auxiliares para operações no IndexedDB
export async function saveOfflineData(storeName: string, data: any) {
  const database = await db;
  await database.put(storeName, data);
}

export async function getOfflineData(storeName: string, id: string) {
  const database = await db;
  return database.get(storeName, id);
}

export async function getAllOfflineData(storeName: string, usuarioId: string) {
  const database = await db;
  const tx = database.transaction(storeName, 'readonly');
  const store = tx.objectStore(storeName);
  const index = store.index('usuarioId');
  return index.getAll(usuarioId);
}

export async function deleteOfflineData(storeName: string, id: string) {
  const database = await db;
  await database.delete(storeName, id);
}
