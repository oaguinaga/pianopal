import type { Ref } from "vue";

import { ref, watch } from "vue";

/**
 * Composable for managing session storage with reactive updates
 * Follows project style: kebab-case file names, camelCase variables, descriptive names
 */
export function useSessionStorage<T>(
  key: string,
  defaultValue: T,
  options: {
    serializer?: {
      read: (value: string) => T;
      write: (value: T) => string;
    };
  } = {},
) {
  const { serializer = { read: JSON.parse, write: JSON.stringify } } = options;

  // Reactive storage value
  const storedValue = ref<T>(defaultValue) as Ref<T>;

  // Check if we're on the client side
  const isClient = typeof window !== "undefined";

  /**
   * Read value from session storage
   * Returns defaultValue if not found or if there's an error
   */
  function read(): T {
    if (!isClient) {
      return defaultValue;
    }

    try {
      const item = sessionStorage.getItem(key);
      if (item === null) {
        return defaultValue;
      }
      return serializer.read(item);
    }
    catch (error) {
      console.warn(`Failed to read session storage key "${key}":`, error);
      return defaultValue;
    }
  }

  /**
   * Write value to session storage
   * Silently fails if not on client or if there's an error
   */
  function write(value: T): void {
    if (!isClient) {
      return;
    }

    try {
      sessionStorage.setItem(key, serializer.write(value));
    }
    catch (error) {
      console.warn(`Failed to write session storage key "${key}":`, error);
    }
  }

  /**
   * Remove value from session storage
   */
  function remove(): void {
    if (!isClient) {
      return;
    }

    try {
      sessionStorage.removeItem(key);
      storedValue.value = defaultValue;
    }
    catch (error) {
      console.warn(`Failed to remove session storage key "${key}":`, error);
    }
  }

  // Initialize with stored value on client
  if (isClient) {
    storedValue.value = read();
  }

  // Watch for changes and persist to session storage
  if (isClient) {
    watch(
      storedValue,
      (newValue) => {
        write(newValue);
      },
      { deep: true },
    );
  }

  return {
    value: storedValue,
    read,
    write,
    remove,
  };
}
