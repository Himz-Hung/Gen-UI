import { useMemo, useState } from 'react';
import { Container } from '../../ui/Container';
import { TopBar } from '../../ui/TopBar';
import { Stack } from '../../ui/Stack';
import { Inline } from '../../ui/Inline';
import { SearchBox } from '../../ui/SearchBox';
import { Select } from '../../ui/Select';
import { Grid } from '../../ui/Grid';
import { Card } from '../../ui/Card';
import { Image } from '../../ui/Image';
import { Heading } from '../../ui/Heading';
import { Text } from '../../ui/Text';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';
import { EmptyState } from '../../ui/EmptyState';
import { Pagination } from '../../ui/Pagination';
import { CARDS, SETS } from '../data';
import { useStore } from '../store';

const PAGE_SIZE = 8;
const RARITY_TONE = { common: 'neutral', uncommon: 'neutral', rare: 'primary', holo: 'primary', ultra: 'warning' } as const;

export function HomeScreen({ cartCount, onOpenCard, onOpenCart }: { cartCount: number; onOpenCard: (id: string) => void; onOpenCart: () => void }) {
  const add = useStore((s) => s.add);
  const [draft, setDraft] = useState('');
  const [query, setQuery] = useState('');
  const [setId, setSetId] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => CARDS.filter((c) => (!query || c.name.toLowerCase().includes(query.toLowerCase())) && (!setId || c.set.id === setId)), [query, setId]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const cards = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const search = (q: string) => { setQuery(q); setPage(1); };

  return (
    <Container maxWidth="xl">
      <TopBar title="PokéCards Shop" actions={[{ icon: 'cart', label: `Cart (${cartCount})`, action: 'openCart' }]} onActionPress={() => onOpenCart()} />
      <Stack gap="5">
        <Inline gap="3" align="end" wrap>
          <SearchBox value={draft} placeholder="Search cards" onChange={setDraft} onSearch={search} onClear={() => search('')} />
          <Select label="Set" value={setId} placeholder="All sets" options={[{ value: '', label: 'All sets' }, ...SETS.map((s) => ({ value: s.id, label: `${s.name} (${s.releaseYear})` }))]} onChange={(v) => { setSetId(v); setPage(1); }} />
        </Inline>
        {cards.length > 0 ? (
          <Grid minItemWidth={240} gap="4">
            {cards.map((c) => (
              <Card key={c.id} padding="3" pressable onPress={() => onOpenCard(c.id)}>
                <Stack gap="2">
                  <Image src={c.imageUrl} alt="" ratio="5:7" />
                  <Heading value={c.name} level="3" size="sm" />
                  <Inline gap="2">
                    <Text value={c.set.name} size="sm" color="muted" truncate />
                    <Badge label={c.rarity} tone={RARITY_TONE[c.rarity]} />
                    <Badge label={c.condition} />
                    {c.stock === 0 && <Badge label="Out of stock" tone="danger" />}
                  </Inline>
                  <Inline justify="between">
                    <Text value={c.priceLabel} weight="bold" />
                    <Button label="Add to cart" size="sm" icon="plus" disabled={c.stock === 0} onPress={() => add(c.id)} />
                  </Inline>
                </Stack>
              </Card>
            ))}
          </Grid>
        ) : (
          <EmptyState title="No cards match" description="Try another name or clear the set filter." actionLabel="Clear search" onAction={() => { setDraft(''); search(''); setSetId(''); }} />
        )}
        <Pagination page={page} pageCount={pageCount} onChange={setPage} />
      </Stack>
    </Container>
  );
}
