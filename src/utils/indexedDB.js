const dbName = 'SteamTrackerDB';
const dbVersion = 1;

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);

    request.onerror = (event) => reject("IndexedDB error: " + event.target.error);

    request.onsuccess = (event) => resolve(event.target.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore('achievements', { keyPath: 'appid' });
      db.createObjectStore('games', { keyPath: 'appid' });
    };
  });
};

export const storeData = async (storeName, data) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);

    const request = store.put(data);

    request.onerror = (event) => reject("Error storing data: " + event.target.error);
    request.onsuccess = (event) => resolve(event.target.result);
  });
};

export const getData = async (storeName, key) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);

    const request = store.get(key);

    request.onerror = (event) => reject("Error getting data: " + event.target.error);
    request.onsuccess = (event) => resolve(event.target.result);
  });
};

export const getAllData = async (storeName) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);

    const request = store.getAll();

    request.onerror = (event) => reject("Error getting all data: " + event.target.error);
    request.onsuccess = (event) => resolve(event.target.result);
  });
};
