/**
 * Blur a given element on the next animation frame if it supports `blur()`.
 * Falls back to blurring the current `document.activeElement` when no element provided.
 *
 * Use this to release focus from form controls after a change so that
 * global keyboard handlers (e.g., piano key bindings) remain responsive.
 *
 * SSR-safe: does nothing when not running on the client.
 *
 * @example
 * blurElementNextFrame(event.target as HTMLElement)
 */
export function blurElementNextFrame(element?: HTMLElement | null): void {
  if (!(import.meta as any).client)
    return;
  const candidate: HTMLElement | null = element ?? (document.activeElement as HTMLElement | null);
  if (!candidate)
    return;
  const canBlur = typeof (candidate as any).blur === "function";
  if (canBlur) {
    requestAnimationFrame(() => candidate.blur());
  }
}

/**
 * Convenience handler for `@change` on form controls.
 * Blurs the `event.target` on the next frame (or the active element as fallback),
 * ensuring that focus leaves the control immediately after the value change.
 *
 * This helps UIs that rely on global keyboard listeners (like a piano playground)
 * continue to receive key events without requiring a manual click to blur.
 *
 * SSR-safe: no-ops on the server.
 *
 * @param event - The change event from a form control
 * @example
 * <select @change="blurTargetOrActiveElementOnChange">...</select>
 */
export function blurTargetOrActiveElementOnChange(event: Event): void {
  if (!(import.meta as any).client)
    return;
  const target = event.target as HTMLElement | null;
  blurElementNextFrame(target);
}
