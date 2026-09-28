import { useState } from 'react';
import { Container } from '../../ui/Container';
import { TopBar } from '../../ui/TopBar';
import { Stack } from '../../ui/Stack';
import { Inline } from '../../ui/Inline';
import { Input } from '../../ui/Input';
import { Divider } from '../../ui/Divider';
import { Text } from '../../ui/Text';
import { Stat } from '../../ui/Stat';
import { Button } from '../../ui/Button';
import { useStore, type Cart } from '../store';
import { t } from '../i18n';

export function CheckoutScreen({ cart, onGoBack, onPlaced }: { cart: Cart; onGoBack: () => void; onPlaced: (orderId: string) => void }) {
  const placeOrder = useStore((s) => s.placeOrder);
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    const ok = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
    setEmailError(ok ? undefined : t('checkout.emailInvalid'));
    if (!ok || !address) return;
    setSubmitting(true);
    const order = await placeOrder(email);
    onPlaced(order.id);
  };

  return (
    <Container maxWidth="md">
      <TopBar title={t('checkout.title')} showBack onBack={onGoBack} />
      <Stack gap="5">
        <Stack gap="3">
          <Input label={t('checkout.email')} type="email" value={email} error={emailError} required onChange={setEmail} onSubmit={submit} />
          <Input label={t('checkout.address')} value={address} required onChange={setAddress} onSubmit={submit} />
        </Stack>
        <Divider />
        <Inline justify="between" align="end">
          <Text value={cart.count === 1 ? t('common.itemsOne') : t('common.itemsMany', { count: cart.count })} color="muted" />
          <Stat label={t('common.subtotal')} value={cart.subtotalLabel} />
        </Inline>
        <Button label={t('checkout.placeOrder')} size="lg" fullWidth loading={submitting} disabled={!address} onPress={submit} />
      </Stack>
    </Container>
  );
}
