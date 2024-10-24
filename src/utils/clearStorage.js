import { deleteDatabase } from './indexedDB';

export const clearAllStorage = async () => {
  // Clear localStorage
  localStorage.clear();

  // Clear IndexedDB
  try {
    await deleteDatabase();
  } catch (error) {
    console.error("Error clearing IndexedDB:", error);
  }
};