1. Modify `apps/web/app/components/ui/typeahead-input.tsx` to optimize the category filtering logic.
   - Currently, it filters categories by `name.toLowerCase().includes(lowerQuery)`, and then sorts the filtered results by `startsWith` vs `includes`, falling back to `localeCompare` to resolve ties.
   - However, since `categories` is already sorted alphabetically by the parent components (`app/listings/page.tsx`, `app/add-tool/page.tsx`), calling `localeCompare` again is a redundant, expensive O(N log N) operation.
   - We can optimize this by replacing the `.filter(...).sort(...)` chain with a single O(N) traversal. We iterate over the pre-sorted `categories`, convert `name` to lowercase once, and directly partition matching items into `startsWith` and `includes` arrays, then concatenate them. This preserves the alphabetical sub-ordering automatically because we iterate the array in its original pre-sorted order.
2. Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.
3. Submit the change using a PR.
