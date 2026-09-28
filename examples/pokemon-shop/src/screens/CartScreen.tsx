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
import { t } from '../i18n';

export function CartScreen({ cart, onGoCardDetail, onGoCheckout, onGoHome }: { cart: Cart; onGoCardDetail: (id: string) => void; onGoCheckout: () => void; onGoHome: () => void }) {
  const setQty = useStore((s) => s.setQty);
  const remove = useStore((s) => s.remove);
  return (
    <Container maxWidth="md">
      <TopBar title={t('cart.title')} showBack onBack={onGoHome} />
      <Stack gap="5">
        {cart.items.length === 0 ? (
          <EmptyState title={t('cart.empty.title')} description={t('cart.empty.description')} actionLabel={t('common.continueShopping')} onAction={onGoHome} />
        ) : (
          <List>
            {cart.items.map((i) => (
              <ListItem key={i.card.id} title={`${i.card.name} × ${i.qty}`} subtitle={t('cart.line', { set: i.card.set.name, condition: i.card.condition, price: i.card.priceLabel })} trailing={i.lineTotalLabel} pressable onPress={() => onGoCardDetail(i.card.id)} />
            ))}
          </List>
        )}
        {cart.items.length > 0 && (
          <Inline gap="2" wrap>
            {cart.items.map((i) => (
              <Inline key={i.card.id} gap="1">
                <IconButton icon="minus" label={t('cart.oneLess', { name: i.card.name })} size="sm" variant="secondary" onPress={() => setQty(i.card.id, i.qty - 1)} />
                <IconButton icon="plus" label={t('cart.oneMore', { name: i.card.name })} size="sm" variant="secondary" disabled={i.qty >= i.card.stock} onPress={() => setQty(i.card.id, i.qty + 1)} />
                <IconButton icon="trash" label={t('cart.remove', { name: i.card.name })} size="sm" onPress={() => remove(i.card.id)} />
              </Inline>
            ))}
          </Inline>
        )}
        <Inline justify="between" align="end">
          <Stat label={t('common.subtotal')} value={cart.subtotalLabel} hint={cart.count === 1 ? t('common.itemsOne') : t('common.itemsMany', { count: cart.count })} />
          <Button label={t('cart.checkout')} size="lg" disabled={cart.items.length === 0} onPress={onGoCheckout} />
        </Inline>
      </Stack>
    </Container>
  );
}
