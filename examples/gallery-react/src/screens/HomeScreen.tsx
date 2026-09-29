// Composed from ui/ only (fw check src/screens enforces it). Layout follows screens/home.ui.json, the same spec as
// examples/gallery-flutter/lib/screens/home_screen.dart.
import { useState } from 'react';
import { Container } from '../../ui/Container';
import { TopBar } from '../../ui/TopBar';
import { Stack } from '../../ui/Stack';
import { SectionHeader } from '../../ui/SectionHeader';
import { Inline } from '../../ui/Inline';
import { Button } from '../../ui/Button';
import { Text } from '../../ui/Text';
import { Input } from '../../ui/Input';
import { Switch } from '../../ui/Switch';
import { Avatar } from '../../ui/Avatar';
import { Badge } from '../../ui/Badge';
import { Stat } from '../../ui/Stat';
import { Alert } from '../../ui/Alert';
import { Tabs } from '../../ui/Tabs';

export function HomeScreen() {
  const [name, setName] = useState('');
  const [notify, setNotify] = useState(true);
  const [tab, setTab] = useState('a');
  const [presses, setPresses] = useState(0);
  const press = () => setPresses((n) => n + 1);

  return (
    <Container maxWidth="md">
      <TopBar title="Component gallery" />
      <Stack gap="5">
        <SectionHeader title="Actions" />
        <Inline gap="3" wrap>
          <Button label="Primary" onPress={press} />
          <Button label="Delete" variant="danger" onPress={press} />
          <Text value={`Pressed ${presses} times`} />
        </Inline>
        <SectionHeader title="Inputs" />
        <Input label="Name" value={name} hint="Your full name" onChange={setName} />
        <Switch label="Email me updates" checked={notify} onChange={setNotify} />
        <SectionHeader title="Data" />
        <Inline gap="3">
          <Avatar name="Ash Ketchum" />
          <Badge label="New" tone="primary" />
          <Stat label="Orders" value="128" />
        </Inline>
        <SectionHeader title="Feedback" />
        <Alert tone="success" title="Saved" description="Your changes are live." />
        <SectionHeader title="Navigation" />
        <Tabs tabs={[{ value: 'a', label: 'Overview' }, { value: 'b', label: 'Details' }]} value={tab} onChange={setTab}>
          <Text value={tab === 'a' ? 'Overview content' : 'Details content'} />
        </Tabs>
      </Stack>
    </Container>
  );
}
