import { Container } from '../../ui/Container';
import { Stack } from '../../ui/Stack';
import { Alert } from '../../ui/Alert';
import { Text } from '../../ui/Text';
import { Button } from '../../ui/Button';
import { useStore } from '../store';
import { t } from '../i18n';

export function OrderSuccessScreen({ onGoHome }: { onGoHome: () => void }) {
  const order = useStore((s) => s.order);
  return (
    <Container maxWidth="sm">
      <Stack gap="5" align="center">
        <Alert tone="success" title={t('order.placed')} description={order ? t('order.summary', { id: order.id, total: order.totalLabel }) : t('order.thanks')} />
        <Text value={order ? t('order.receipt', { email: order.email }) : ''} color="muted" align="center" />
        <Button label={t('common.continueShopping')} variant="secondary" onPress={onGoHome} />
      </Stack>
    </Container>
  );
}
