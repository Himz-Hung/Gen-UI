import { Container } from '../../ui/Container';
import { TopBar } from '../../ui/TopBar';
import { Stack } from '../../ui/Stack';
import { Inline } from '../../ui/Inline';
import { List } from '../../ui/List';
import { ListItem } from '../../ui/ListItem';
import { IconButton } from '../../ui/IconButton';
import { EmptyState } from '../../ui/EmptyState';
import { Stat } from '../../ui/Stat';
import { Button } from '../../ui/Button';
import { useStore, type Cart } from '../store';

export function CartScreen({ cart, onOpenCard, onCheckout, onContinueShopping }: { cart: Cart; onOpenCard: (id: string) => void; onCheckout: () => void; onContinueShopping: () => void }) {
  const setQty = useStore((s) => s.setQty);
  const remove = useStore((s) => s.remove);
  return (
    <Container maxWidth="md">
      <TopBar title="Your cart" showBack onBack={onContinueShopping} />
      <Stack gap="5">
        {cart.items.length === 0 ? (
          <EmptyState title="Your cart is empty" description="Cards you add will show up here." actionLabel="Continue shopping" onAction={onContinueShopping} />
        ) : (
          <List>
            {cart.items.map((i) => (
              <ListItem key={i.card.id} title={`${i.card.name} × ${i.qty}`} subtitle={`${i.card.set.name} · ${i.card.condition} · ${i.card.priceLabel} each`} trailing={i.lineTotalLabel} pressable onPress={() => onOpenCard(i.card.id)} />
            ))}
          </List>
        )}
        {cart.items.length > 0 && (
          <Inline gap="2" wrap>
            {cart.items.map((i) => (
              <Inline key={i.card.id} gap="1">
                <IconButton icon="minus" label={`One less ${i.card.name}`} size="sm" variant="secondary" onPress={() => setQty(i.card.id, i.qty - 1)} />
                <IconButton icon="plus" label={`One more ${i.card.name}`} size="sm" variant="secondary" disabled={i.qty >= i.card.stock} onPress={() => setQty(i.card.id, i.qty + 1)} />
                <IconButton icon="trash" label={`Remove ${i.card.name}`} size="sm" onPress={() => remove(i.card.id)} />
              </Inline>
            ))}
          </Inline>
        )}
        <Inline justify="between" align="end">
          <Stat label="Subtotal" value={cart.subtotalLabel} hint={`${cart.count} item${cart.count === 1 ? '' : 's'}`} />
          <Button label="Checkout" size="lg" disabled={cart.items.length === 0} onPress={onCheckout} />
        </Inline>
      </Stack>
    </Container>
  );
}
