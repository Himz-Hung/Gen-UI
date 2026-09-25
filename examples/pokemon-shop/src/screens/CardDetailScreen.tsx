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

export function CardDetailScreen({ card, cartCount, onGoBack, onOpenCart }: { card: CardModel; cartCount: number; onGoBack: () => void; onOpenCart: () => void }) {
  const add = useStore((s) => s.add);
  const [qty, setQty] = useState('1');
  const options = Array.from({ length: Math.max(card.stock, 1) }, (_, i) => ({ value: String(i + 1), label: String(i + 1) }));
  return (
    <Container maxWidth="lg">
      <TopBar title={card.name} showBack actions={[{ icon: 'cart', label: `Cart (${cartCount})`, action: 'openCart' }]} onBack={onGoBack} onActionPress={() => onOpenCart()} />
      <Inline gap="6" align="start" wrap>
        <Image src={card.imageUrl} alt={`${card.name} card`} ratio="5:7" radius="lg" />
        <Stack gap="3">
          <Heading value={card.name} level="1" size="xl" />
          <Inline gap="2">
            <Text value={`${card.set.name} · ${card.set.releaseYear}`} color="muted" />
            <Badge label={card.rarity} tone="primary" />
            <Badge label={card.condition} />
          </Inline>
          <Stat label="Price" value={card.priceLabel} />
          <Text value={card.stock > 0 ? `${card.stock} in stock` : 'Out of stock'} size="sm" color={card.stock > 0 ? 'muted' : 'danger'} />
          <Select label="Quantity" value={qty} options={options} disabled={card.stock === 0} onChange={setQty} />
          <Button label="Add to cart" size="lg" icon="plus" disabled={card.stock === 0} onPress={() => { add(card.id, Number(qty)); onOpenCart(); }} />
        </Stack>
      </Inline>
    </Container>
  );
}
