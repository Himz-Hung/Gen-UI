import { defineDomain, t } from '@himz-genui/core';

// Business types the screens receive. Referenced by name in screen data, e.g. "Card[]".
export default defineDomain({
  Example: t.object({ id: t.string(), name: t.string() }),
});
