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

    // Check if the record already exists
    const getRequest = store.get(data.appid);

    getRequest.onsuccess = (event) => {
      const existingData = event.target.result;
      if (existingData) {
        // If the record exists, merge the new data with the existing data
        const updatedData = { ...existingData, ...data };
        const updateRequest = store.put(updatedData);
        updateRequest.onerror = (event) => reject("Error updating data: " + event.target.error);
        updateRequest.onsuccess = (event) => resolve(event.target.result);
      } else {
        // If the record doesn't exist, add the new data
        const addRequest = store.add(data);
        addRequest.onerror = (event) => reject("Error adding data: " + event.target.error);
        addRequest.onsuccess = (event) => resolve(event.target.result);
      }
    };

    getRequest.onerror = (event) => reject("Error checking existing data: " + event.target.error);
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
