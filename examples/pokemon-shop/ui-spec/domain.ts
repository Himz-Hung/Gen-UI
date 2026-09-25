import { defineDomain, t } from '@himz-genui/core';

export default defineDomain({
  Rarity: t.enum(['common', 'uncommon', 'rare', 'holo', 'ultra']),
  CardSet: t.object({ id: t.string(), name: t.string(), releaseYear: t.number() }),
  Card: t.object({
    id: t.string(),
    name: t.string(),
    imageUrl: t.string(),
    set: t.ref('CardSet'),
    rarity: t.ref('Rarity'),
    condition: t.enum(['NM', 'LP', 'MP', 'HP']),
    priceLabel: t.string().desc('pre-formatted, e.g. "$12.50"'),
    stock: t.number(),
  }),
  CartItem: t.object({ card: t.ref('Card'), qty: t.number(), lineTotalLabel: t.string() }),
  Cart: t.object({ items: t.array(t.ref('CartItem')), subtotalLabel: t.string(), count: t.number() }),
  Order: t.object({ id: t.string(), totalLabel: t.string(), email: t.string() }),
});
