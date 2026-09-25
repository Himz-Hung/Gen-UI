import { create } from 'zustand';
import { CARDS, type Card } from './data';

export interface CartItem { card: Card; qty: number; lineTotalLabel: string }
export interface Cart { items: CartItem[]; subtotalLabel: string; count: number }
export interface Order { id: string; totalLabel: string; email: string }

interface State {
  lines: Record<string, number>;
  order: Order | null;
  add: (cardId: string, qty?: number) => void;
  setQty: (cardId: string, qty: number) => void;
  remove: (cardId: string) => void;
  placeOrder: (email: string) => Promise<Order>;
}

export const useStore = create<State>((set, get) => ({
  lines: {},
  order: null,
  add: (id, qty = 1) => set((s) => ({ lines: { ...s.lines, [id]: Math.min((s.lines[id] ?? 0) + qty, stockOf(id)) } })),
  setQty: (id, qty) => set((s) => ({ lines: qty <= 0 ? omit(s.lines, id) : { ...s.lines, [id]: Math.min(qty, stockOf(id)) } })),
  remove: (id) => set((s) => ({ lines: omit(s.lines, id) })),
  placeOrder: async (email) => {
    await new Promise((r) => setTimeout(r, 900));
    const order: Order = { id: `PK-${Date.now().toString(36).toUpperCase()}`, totalLabel: selectCart(get().lines).subtotalLabel, email };
    set({ lines: {}, order });
    return order;
  },
}));

const stockOf = (id: string) => CARDS.find((c) => c.id === id)?.stock ?? 0;
const omit = (o: Record<string, number>, k: string) => { const { [k]: _, ...rest } = o; return rest; };

export function selectCart(lines: Record<string, number>): Cart {
  const items: CartItem[] = Object.entries(lines).map(([id, qty]) => {
    const card = CARDS.find((c) => c.id === id)!;
    return { card, qty, lineTotalLabel: `$${(card.price * qty).toFixed(2)}` };
  });
  const subtotal = items.reduce((s, i) => s + i.card.price * i.qty, 0);
  return { items, subtotalLabel: `$${subtotal.toFixed(2)}`, count: items.reduce((s, i) => s + i.qty, 0) };
}
