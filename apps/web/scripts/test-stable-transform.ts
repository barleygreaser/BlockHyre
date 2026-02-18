/* eslint-disable */
// MOCK React hooks
let currentCache: any;
const useRef = <T>(initialValue: T) => {
  if (!currentCache) currentCache = { current: initialValue };
  return currentCache;
};

// Mock useState (not used in updated implementation but kept for completeness if needed)
let stateValue: any;
const useState = <T>(initialState: T | (() => T)): [T, (val: T) => void] => {
  if (stateValue === undefined) {
      if (typeof initialState === 'function') {
          stateValue = (initialState as () => T)();
      } else {
          stateValue = initialState;
      }
  }
  return [stateValue, () => {}];
};

let lastDeps: any[] | undefined;
let lastResult: any;
// Simple useMemo mock that caches result if deps match (shallow compare)
// For multiple calls in same "render", we rely on the order of execution being consistent
// or just simple implementation for single hook usage.
// Actually, this simple mock works for single hook instance because we only call useStableTransform once per "render phase"
// But wait, useStableTransform calls useMemo TWICE (once for cache, once for result).
// So we need to handle multiple hooks or call sites.
// We'll use a simple index-based hook system for the test.

let hookIndex = 0;
const hooks: any[] = [];

const resetHooks = () => {
    hookIndex = 0;
};

const useMemo = <T>(factory: () => T, deps: any[]): T => {
    const currentIndex = hookIndex++;

    // Initialize if empty
    if (!hooks[currentIndex]) {
        hooks[currentIndex] = { deps: undefined, result: undefined };
    }

    const hook = hooks[currentIndex];
    const prevDeps = hook.deps;

    const hasChanged = !prevDeps || deps.length !== prevDeps.length || deps.some((d: any, i: number) => d !== prevDeps[i]);

    if (hasChanged) {
        hook.result = factory();
        hook.deps = deps;
        // console.log(`useMemo(${currentIndex}): re-calculating`);
    } else {
        // console.log(`useMemo(${currentIndex}): using cache`);
    }

    return hook.result;
};


// Hook Implementation (copied for verification of algorithm)
function useStableTransform<T, U>(
  items: T[],
  transform: (item: T) => U
): U[] {
  // Use WeakMap to store transformed results keyed by the original object.
  // We use useMemo to create the cache. If transform changes, we get a fresh cache.
  // This ensures that if the transform logic changes, we don't serve stale data.
  const cache = useMemo(() => new WeakMap<object, U>(), [transform]);

  return useMemo(() => {
    return items.map((item) => {
      if (typeof item === 'object' && item !== null) {
        const key = item as object;
        if (cache.has(key)) {
          return cache.get(key)!;
        }
        const result = transform(item);
        cache.set(key, result);
        return result;
      }
      return transform(item);
    });
  }, [items, transform, cache]);
}

// TEST
console.log('--- START TEST ---');

// 1. Initial Render
const item1 = { id: 1, val: 'a' };
const item2 = { id: 2, val: 'b' };
const items1 = [item1, item2];

const transform = (item: any) => ({ ...item, transformed: true });

console.log('Render 1: Initial list');
resetHooks();
const result1 = useStableTransform(items1, transform);
console.log('Result 1 length:', result1.length);

// 2. Second Render (Append item)
// existing items keep reference
const item3 = { id: 3, val: 'c' };
const items2 = [item1, item2, item3];

console.log('Render 2: Append item3');
resetHooks();
const result2 = useStableTransform(items2, transform);
console.log('Result 2 length:', result2.length);

// Verification
const isIndex0Stable = result1[0] === result2[0];
const isIndex1Stable = result1[1] === result2[1];
const isIndex2New = result2[2].transformed === true;

console.log('Index 0 Stable:', isIndex0Stable ? 'PASS' : 'FAIL');
console.log('Index 1 Stable:', isIndex1Stable ? 'PASS' : 'FAIL');
console.log('Index 2 is valid:', isIndex2New ? 'PASS' : 'FAIL');

if (isIndex0Stable && isIndex1Stable && isIndex2New) {
    console.log('✅ TEST PASSED: Referential stability maintained.');
    process.exit(0);
} else {
    console.error('❌ TEST FAILED');
    process.exit(1);
}
