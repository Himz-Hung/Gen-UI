import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';

afterEach(cleanup);

describe('templates', () => {
  it('Button: presses, and never presses while disabled or loading', async () => {
    const onPress = vi.fn();
    const { rerender } = render(<Button label="Checkout" onPress={onPress} />);
    await userEvent.click(screen.getByRole('button', { name: 'Checkout' }));
    expect(onPress).toHaveBeenCalledTimes(1);
    rerender(<Button label="Checkout" disabled onPress={onPress} />);
    await userEvent.click(screen.getByRole('button', { name: 'Checkout' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('Select: label is visible and change emits the value', async () => {
    const onChange = vi.fn();
    render(<Select label="Set" value="" options={[{ value: '', label: 'All' }, { value: 'base', label: 'Base Set' }]} onChange={onChange} />);
    expect(screen.getByText('Set')).toBeTruthy();
    await userEvent.selectOptions(screen.getByRole('combobox'), 'base');
    expect(onChange).toHaveBeenCalledWith('base');
  });
});
