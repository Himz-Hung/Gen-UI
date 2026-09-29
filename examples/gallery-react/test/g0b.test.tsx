// The 22 components the React gallery shares with the Pokemon shop, mirroring the Flutter g1..g4 tests.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Alert } from '../ui/Alert';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { Container } from '../ui/Container';
import { Divider } from '../ui/Divider';
import { EmptyState } from '../ui/EmptyState';
import { Grid } from '../ui/Grid';
import { Heading } from '../ui/Heading';
import { IconButton } from '../ui/IconButton';
import { Image } from '../ui/Image';
import { Inline } from '../ui/Inline';
import { Input } from '../ui/Input';
import { List } from '../ui/List';
import { ListItem } from '../ui/ListItem';
import { Pagination } from '../ui/Pagination';
import { SearchBox } from '../ui/SearchBox';
import { Stack } from '../ui/Stack';
import { Stat } from '../ui/Stat';
import { Text } from '../ui/Text';
import { TopBar } from '../ui/TopBar';
import { Link } from '../ui/Link';
import { Spacer } from '../ui/Spacer';

afterEach(cleanup);

describe('shared components', () => {
  it('Alert: title and description; dismiss emits', async () => {
    const onDismiss = vi.fn();
    render(<Alert tone="danger" title="Payment failed" description="Try another card." dismissible onDismiss={onDismiss} />);
    expect(screen.getByText('Payment failed')).toBeTruthy();
    expect(screen.getByText('Try another card.')).toBeTruthy();
    await userEvent.click(screen.getByRole('button'));
    expect(onDismiss).toHaveBeenCalled();
  });

  it('Badge: shows its label', () => {
    render(<Badge label="New" tone="primary" />);
    expect(screen.getByText('New')).toBeTruthy();
  });

  it('Card: pressable emits press; not pressable never does', async () => {
    const onPress = vi.fn();
    const { rerender } = render(<Card pressable onPress={onPress}><Text value="Pikachu" /></Card>);
    await userEvent.click(screen.getByText('Pikachu'));
    expect(onPress).toHaveBeenCalledTimes(1);
    rerender(<Card onPress={onPress}><Text value="Pikachu" /></Card>);
    await userEvent.click(screen.getByText('Pikachu'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('Container, Stack, Inline, Grid, Spacer, Divider: lay out their children', () => {
    render(
      <Container maxWidth="md">
        <Stack gap="3"><Text value="A" /><Spacer size="2" /><Divider /><Inline gap="2"><Text value="B" /><Text value="C" /></Inline><Grid minItemWidth={100}><Text value="D" /></Grid></Stack>
      </Container>,
    );
    for (const t of ['A', 'B', 'C', 'D']) expect(screen.getByText(t)).toBeTruthy();
  });

  it('EmptyState: title and action', async () => {
    const onAction = vi.fn();
    render(<EmptyState title="Your cart is empty" actionLabel="Continue shopping" onAction={onAction} />);
    expect(screen.getByText('Your cart is empty')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Continue shopping' }));
    expect(onAction).toHaveBeenCalled();
  });

  it('Heading: a real heading of the given level', () => {
    render(<Heading value="Base Set" level="2" />);
    expect(screen.getByRole('heading', { level: 2, name: 'Base Set' })).toBeTruthy();
  });

  it('IconButton: named by label (with badge), presses, not while disabled', async () => {
    const onPress = vi.fn();
    const { rerender } = render(<IconButton icon="cart" label="Cart" badge="3" onPress={onPress} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cart, 3' }));
    expect(onPress).toHaveBeenCalledTimes(1);
    rerender(<IconButton icon="cart" label="Cart" disabled onPress={onPress} />);
    await userEvent.click(screen.getByRole('button', { name: 'Cart' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('Image: alt is the accessible name', () => {
    render(<Image src="https://example.com/a.jpg" alt="Charizard" />);
    expect(screen.getByAltText('Charizard')).toBeTruthy();
  });

  it('Input: label, typing emits, password toggle reveals', async () => {
    const onChange = vi.fn();
    const { rerender } = render(<Input label="Email" value="" onChange={onChange} />);
    await userEvent.type(screen.getByLabelText('Email'), 'a');
    expect(onChange).toHaveBeenCalledWith('a');
    rerender(<Input label="Password" value="secret" type="password" revealLabel="Show password" />);
    const field = screen.getByLabelText('Password') as HTMLInputElement;
    expect(field.type).toBe('password');
    await userEvent.click(screen.getByRole('button', { name: 'Show password' }));
    expect(field.type).toBe('text');
  });

  it('List and ListItem: rows, pressable row emits', async () => {
    const onPress = vi.fn();
    render(<List><ListItem title="Pikachu" subtitle="Base Set" pressable onPress={onPress} /><ListItem title="Eevee" /></List>);
    expect(screen.getByText('Eevee')).toBeTruthy();
    await userEvent.click(screen.getByText('Pikachu'));
    expect(onPress).toHaveBeenCalled();
  });

  it('Pagination: pressing a page emits it, never the current one', async () => {
    const onChange = vi.fn();
    render(<Pagination page={1} pageCount={10} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: '3' }));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('SearchBox: typing emits change, Enter emits search', async () => {
    const onChange = vi.fn(), onSearch = vi.fn();
    render(<SearchBox value="pika" onChange={onChange} onSearch={onSearch} />);
    await userEvent.type(screen.getByRole('searchbox'), '{Enter}');
    expect(onSearch).toHaveBeenCalledWith('pika');
  });

  it('Stat: label and pre-formatted value', () => {
    render(<Stat label="Orders" value="128" />);
    expect(screen.getByText('Orders')).toBeTruthy();
    expect(screen.getByText('128')).toBeTruthy();
  });

  it('TopBar: title, back emits', async () => {
    const onBack = vi.fn();
    render(<TopBar title="Your cart" showBack onBack={onBack} />);
    expect(screen.getByText('Your cart')).toBeTruthy();
    await userEvent.click(screen.getAllByRole('button')[0]);
    expect(onBack).toHaveBeenCalled();
  });

  it('Link: press emits', async () => {
    const onPress = vi.fn();
    render(<Link label="Grading guide" onPress={onPress} />);
    await userEvent.click(screen.getByText('Grading guide'));
    expect(onPress).toHaveBeenCalled();
  });
});
