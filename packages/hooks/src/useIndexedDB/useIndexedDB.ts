import { useState, useEffect, useCallback } from "react";

/**
 * Options for configuring the IndexedDB connection and behavior.
 */
interface UseIndexedDBOptions {
  /**
   * The version of the database. Changing this triggers an upgrade.
   * @default 1
   */
  version?: number;
  /**
   * A callback function executed when the database version changes or is created.
   * Use this to create or modify object stores.
   * @param db - The IDBDatabase instance.
   * @param oldVersion - The previous version of the database.
   * @param newVersion - The new version of the database.
   */
  onUpgradeNeeded?: (
    db: IDBDatabase,
    oldVersion: number,
    newVersion: number,
  ) => void;
}

/**
 * The return value of the useIndexedDB hook, containing state and methods for interacting with the database.
 * @template T - The type of the data stored.
 */
interface UseIndexedDBReturn<T> {
  /** The most recently accessed or modified data item. */
  data: T | null;
  /** The error message if an operation failed, or null if successful. */
  error: string | null;
  /** Indicates if the database is initializing or an operation is in progress. */
  loading: boolean;
  /**
   * Stores a value in the database under the specified key.
   * @param key - The unique key for the item.
   * @param value - The value to store.
   */
  setItem: (key: string, value: T) => Promise<void>;
  /**
   * Retrieves a value from the database by its key.
   * @param key - The key of the item to retrieve.
   * @returns A promise that resolves to the item or null if not found.
   */
  getItem: (key: string) => Promise<T | null>;
  /**
   * Removes an item from the database by its key.
   * @param key - The key of the item to remove.
   */
  removeItem: (key: string) => Promise<void>;
  /**
   * Removes all items from the current object store.
   */
  clear: () => Promise<void>;
  /**
   * Retrieves all keys currently stored in the object store.
   * @returns A promise that resolves to an array of keys.
   */
  getAllKeys: () => Promise<string[]>;
}

/**
 * Custom hook that provides an interface to the [`IndexedDB API`](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) for client-side storage of significant amounts of structured data.
 * 
 * @category storage
 * @template T - The type of the data to be stored.
 * @param {string} databaseName - The name of the IndexedDB database.
 * @param {string} storeName - The name of the object store within the database.
 * @param {UseIndexedDBOptions} [options] - Configuration options for the database connection (optional).
 * @returns {UseIndexedDBReturn<T>} An object containing the current data state, error state, loading state, and methods to interact with the database.
 * @public
 * @example
 * ```tsx
 * interface UserProfile {
 * name: string;
 * age: number;
 * }
 *
 * const { setItem, getItem, data } = useIndexedDB<UserProfile>('myAppDB', 'profiles');
 *
 * const saveProfile = async () => {
 * await setItem('user_1', { name: 'Alice', age: 30 });
 * };
 * ```
 */
export function useIndexedDB<T>(
  databaseName: string,
  storeName: string,
  options: UseIndexedDBOptions = {},
): UseIndexedDBReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [db, setDb] = useState<IDBDatabase | null>(null);

  const { version = 1, onUpgradeNeeded } = options;

  // Initialize IndexedDB connection
  useEffect(() => {
    if (typeof window === "undefined") return;

    const initDB = async () => {
      try {
        setLoading(true);
        setError(null);

        const request = indexedDB.open(databaseName, version);

        request.onerror = () => {
          setError(`Failed to open database: ${request.error?.message}`);
          setLoading(false);
        };

        request.onsuccess = () => {
          setDb(request.result);
          setLoading(false);
        };

        request.onupgradeneeded = (event) => {
          const database = request.result;
          const oldVersion = event.oldVersion;
          const newVersion = event.newVersion || version;

          // Create object store if it doesn't exist
          if (!database.objectStoreNames.contains(storeName)) {
            database.createObjectStore(storeName);
          }

          // Call custom upgrade handler if provided
          if (onUpgradeNeeded) {
            onUpgradeNeeded(database, oldVersion, newVersion);
          }
        };
      } catch (err) {
        setError(`IndexedDB initialization error: ${err}`);
        setLoading(false);
      }
    };

    initDB();

    return () => {
      if (db) {
        db.close();
      }
    };
  }, [databaseName, storeName, version, onUpgradeNeeded]);

  // Set item in IndexedDB
  const setItem = useCallback(
    async (key: string, value: T): Promise<void> => {
      if (!db) {
        throw new Error("Database not initialized");
      }

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.put(value, key);

        request.onsuccess = () => {
          setData(value);
          resolve();
        };

        request.onerror = () => {
          const errorMsg = `Failed to set item: ${request.error?.message}`;
          setError(errorMsg);
          reject(new Error(errorMsg));
        };
      });
    },
    [db, storeName],
  );

  // Get item from IndexedDB
  const getItem = useCallback(
    async (key: string): Promise<T | null> => {
      if (!db) {
        throw new Error("Database not initialized");
      }

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], "readonly");
        const store = transaction.objectStore(storeName);
        const request = store.get(key);

        request.onsuccess = () => {
          const result = request.result || null;
          setData(result);
          resolve(result);
        };

        request.onerror = () => {
          const errorMsg = `Failed to get item: ${request.error?.message}`;
          setError(errorMsg);
          reject(new Error(errorMsg));
        };
      });
    },
    [db, storeName],
  );

  // Remove item from IndexedDB
  const removeItem = useCallback(
    async (key: string): Promise<void> => {
      if (!db) {
        throw new Error("Database not initialized");
      }

      return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], "readwrite");
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);

        request.onsuccess = () => {
          setData(null);
          resolve();
        };

        request.onerror = () => {
          const errorMsg = `Failed to remove item: ${request.error?.message}`;
          setError(errorMsg);
          reject(new Error(errorMsg));
        };
      });
    },
    [db, storeName],
  );

  // Clear all items from the store
  const clear = useCallback(async (): Promise<void> => {
    if (!db) {
      throw new Error("Database not initialized");
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);
      const request = store.clear();

      request.onsuccess = () => {
        setData(null);
        resolve();
      };

      request.onerror = () => {
        const errorMsg = `Failed to clear store: ${request.error?.message}`;
        setError(errorMsg);
        reject(new Error(errorMsg));
      };
    });
  }, [db, storeName]);

  // Get all keys from the store
  const getAllKeys = useCallback(async (): Promise<string[]> => {
    if (!db) {
      throw new Error("Database not initialized");
    }

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const request = store.getAllKeys();

      request.onsuccess = () => {
        resolve(request.result as string[]);
      };

      request.onerror = () => {
        const errorMsg = `Failed to get keys: ${request.error?.message}`;
        setError(errorMsg);
        reject(new Error(errorMsg));
      };
    });
  }, [db, storeName]);

  return {
    data,
    error,
    loading,
    setItem,
    getItem,
    removeItem,
    clear,
    getAllKeys,
  };
}
