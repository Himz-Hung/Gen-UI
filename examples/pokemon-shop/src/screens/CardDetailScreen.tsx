import { useState } from 'react';
import { Container } from '../../ui/Container';
import { TopBar } from '../../ui/TopBar';
import { Inline } from '../../ui/Inline';
import { Stack } from '../../ui/Stack';
import { Image } from '../../ui/Image';
import { Heading } from '../../ui/Heading';
import { Text } from '../../ui/Text';
import { Badge } from '../../ui/Badge';
import { Stat } from '../../ui/Stat';
import { Select } from '../../ui/Select';
import { Button } from '../../ui/Button';
import type { Card as CardModel } from '../data';
import { useStore } from '../store';
import { t } from '../i18n';

export function CardDetailScreen({ card, cartCount, onGoBack, onGoCart }: { card: CardModel; cartCount: number; onGoBack: () => void; onGoCart: () => void }) {
  const add = useStore((s) => s.add);
  const [qty, setQty] = useState('1');
  const options = Array.from({ length: Math.max(card.stock, 1) }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }));
  return (
    <Container maxWidth="lg">
      <TopBar title={card.name} showBack actions={[{ icon: 'cart', label: t('nav.cart', { count: cartCount }), action: 'goCart' }]} onBack={onGoBack} onActionPress={() => onGoCart()} />
      <Inline gap="6" align="start" wrap>
        <Image src={card.imageUrl} alt={t('detail.imageAlt', { name: card.name })} ratio="5:7" radius="lg" />
        <Stack gap="3">
          <Heading value={card.name} level="1" size="xl" />
          <Inline gap="2">
            <Text value={`${card.set.name} · ${card.set.releaseYear}`} color="muted" />
            <Badge label={card.rarity} tone="primary" />
            <Badge label={card.condition} />
          </Inline>
          <Stat label={t('detail.price')} value={card.priceLabel} />
          <Text value={card.stock > 0 ? t('detail.inStock', { count: card.stock }) : t('common.outOfStock')} size="sm" color={card.stock > 0 ? 'muted' : 'danger'} />
          <Select label={t('detail.quantity')} value={qty} options={options} disabled={card.stock === 0} onChange={setQty} />
          <Button label={t('common.addToCart')} size="lg" icon="plus" disabled={card.stock === 0} onPress={() => { add(card.id, Number(qty)); onGoCart(); }} />
        </Stack>
      </Inline>
    </Container>
  );
}
