import { useMemo } from 'react';

/**
 * Transforms an array of items while maintaining referential stability of the transformed items.
 * If an item in the input array is strictly equal to the item at the same index in the previous render,
 * the transformed item from the previous render is reused.
 *
 * This is useful when the transform function creates new object references (e.g. mapping to a new shape)
 * and you want to prevent downstream re-renders of memoized components.
 *
 * @param items The array of items to transform.
 * @param transform The function to transform each item.
 */
export function useStableTransform<T, U>(
  items: T[],
  transform: (item: T) => U
): U[] {
  // Use WeakMap to store transformed results keyed by the original object.
  // We use useMemo to create the cache. If transform changes, we get a fresh cache.
  // This ensures that if the transform logic changes, we don't serve stale data.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cache = useMemo(() => new WeakMap<object, U>(), [transform]);

  return useMemo(() => {
    return items.map((item) => {
      // Only use WeakMap for objects. For primitives, we can't key by value easily without a Map
      // and it's less useful since primitives are compared by value anyway.
      if (typeof item === 'object' && item !== null) {
        const key = item as object;
        if (cache.has(key)) {
          return cache.get(key)!;
        }
        const result = transform(item);
        cache.set(key, result);
        return result;
      }
      // For primitives, just transform (no caching possible with WeakMap)
      return transform(item);
    });
    // We exclude cache from deps because it's tied to transform.
    // If transform changes, cache changes, and this useMemo re-runs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items, transform]);
}
