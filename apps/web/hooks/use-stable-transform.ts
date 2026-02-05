import { useMemo, useState } from 'react';

/**
 * A hook that maps an array of objects to a new array of objects,
 * but preserves the referential identity of the output objects
 * if the corresponding input object identity hasn't changed.
 *
 * This is useful for optimizing lists where mapped items are passed to
 * memoized components.
 *
 * @param items Source array of objects
 * @param transform Function to transform each object
 * @returns Array of transformed objects with stable references
 */
export function useStableTransform<T extends object, U>(
  items: T[],
  transform: (item: T) => U
): U[] {
  // Use a WeakMap to cache transformed items associated with their source items
  // We use useState instead of useRef to avoid "accessing ref during render" lint error,
  // and because we want this cache to be stable across renders.
  const [cache] = useState(() => new WeakMap<T, U>());

  return useMemo(() => {
    return items.map((item) => {
      if (!cache.has(item)) {
        cache.set(item, transform(item));
      }
      return cache.get(item)!;
    });
  }, [items, transform, cache]);
}
