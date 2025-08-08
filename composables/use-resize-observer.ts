import type { Ref } from "vue";

import { nextTick, onMounted, onUnmounted } from "vue";

/**
 * useResizeObserver
 *
 * Wrapper around ResizeObserver with SSR guard.
 * Invokes the provided callback on nextTick after mount and on size changes.
 */
export function useResizeObserver(
  containerRef: Ref<HTMLElement | undefined>,
  callback: () => void,
) {
  let resizeObserver: ResizeObserver | null = null;

  onMounted(() => {
    // SSR compatibility guard
    if (!import.meta.client)
      return;

    // Initial measurement with a delay to ensure DOM is fully rendered
    nextTick(() => {
      callback();
    });

    // Watch for window resize using ResizeObserver
    resizeObserver = new ResizeObserver(() => {
      nextTick(() => {
        callback();
      });
    });

    if (containerRef.value) {
      resizeObserver.observe(containerRef.value);
    }
  });

  // Cleanup
  onUnmounted(() => {
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
  });

  return {
    resizeObserver,
  };
}
