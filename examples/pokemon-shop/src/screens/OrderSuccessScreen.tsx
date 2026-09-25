import { Container } from '../../ui/Container';
import { Stack } from '../../ui/Stack';
import { Alert } from '../../ui/Alert';
import { Text } from '../../ui/Text';
import { Button } from '../../ui/Button';
import { useStore } from '../store';

export function OrderSuccessScreen({ onContinueShopping }: { onContinueShopping: () => void }) {
  const order = useStore((s) => s.order);
  return (
    <Container maxWidth="sm">
      <Stack gap="5" align="center">
        <Alert tone="success" title="Order placed" description={order ? `Order ${order.id} · ${order.totalLabel}` : 'Thank you!'} />
        <Text value={order ? `A receipt was sent to ${order.email}.` : ''} color="muted" align="center" />
        <Button label="Continue shopping" variant="secondary" onPress={onContinueShopping} />
      </Stack>
    </Container>
  );
}
