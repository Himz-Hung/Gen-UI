import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Textarea } from '../ui/Textarea';
import { RadioGroup } from '../ui/RadioGroup';
import { Switch } from '../ui/Switch';
import { Slider } from '../ui/Slider';
import { NumberInput } from '../ui/NumberInput';
import { DatePicker } from '../ui/DatePicker';
import { DateRangePicker, isRangeAllowed } from '../ui/DateRangePicker';
import { FileUpload } from '../ui/FileUpload';
import { Rating } from '../ui/Rating';
import { Combobox } from '../ui/Combobox';
import { ChipGroup } from '../ui/ChipGroup';
import { PinInput } from '../ui/PinInput';
import { FormField } from '../ui/FormField';

afterEach(cleanup);

// --- small controlled harnesses: these components are fully controlled (value/query come from
// props), so a bare vi.fn() onChange never accumulates keystrokes. Mirrors what the Flutter
// widgets get for free from their internal TextEditingController.

function ControlledTextarea({ onChange }: { onChange: (v: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <Textarea
      label="Note to seller"
      value={value}
      maxLength={10}
      onChange={(v) => { setValue(v); onChange(v); }}
    />
  );
}

function ControlledPin({ onChange, onComplete }: { onChange: (v: string) => void; onComplete: (v: string) => void }) {
  const [value, setValue] = useState('');
  return (
    <PinInput
      label="Verification code"
      value={value}
      length={6}
      onChange={(v) => { setValue(v); onChange(v); }}
      onComplete={onComplete}
    />
  );
}

function ComboboxHarness({ onSearch, onChange }: { onSearch: (v: string) => void; onChange: (v: string) => void }) {
  const [query, setQuery] = useState('');
  const options = query ? [{ value: 'VN', label: 'Vietnam' }] : [];
  return (
    <Combobox
      label="Country"
      value=""
      query={query}
      options={options}
      onSearch={(v) => { setQuery(v); onSearch(v); }}
      onChange={onChange}
    />
  );
}

describe('r2 components', () => {
  it('Textarea: typing calls onChange and counter reflects maxLength', async () => {
    const onChange = vi.fn();
    render(<ControlledTextarea onChange={onChange} />);
    expect(screen.getByText('Note to seller')).toBeTruthy();
    await userEvent.type(screen.getByRole('textbox'), 'hello');
    expect(onChange).toHaveBeenLastCalledWith('hello');
    expect(screen.getByText('5 / 10')).toBeTruthy();
  });

  it('RadioGroup: pressing an option label selects it; disabled blocks it', async () => {
    const onChange = vi.fn();
    const options = [
      { value: 'standard', label: 'Standard' },
      { value: 'express', label: 'Express' },
    ];
    const { rerender } = render(<RadioGroup label="Shipping" value="standard" options={options} onChange={onChange} />);
    await userEvent.click(screen.getByText('Express'));
    expect(onChange).toHaveBeenCalledWith('express');

    onChange.mockClear();
    rerender(<RadioGroup label="Shipping" value="standard" options={options} disabled onChange={onChange} />);
    await userEvent.click(screen.getByText('Express'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('Switch: tapping toggles, disabled does not call onChange', async () => {
    const onChange = vi.fn();
    const { rerender } = render(<Switch label="Notifications" checked={true} onChange={onChange} />);
    await userEvent.click(screen.getByText('Notifications'));
    expect(onChange).toHaveBeenCalledWith(false);

    onChange.mockClear();
    rerender(<Switch label="Notifications" checked={true} disabled onChange={onChange} />);
    await userEvent.click(screen.getByText('Notifications'));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('Slider: value is clamped to [min, max] and change emits a snapped value', () => {
    const onChange = vi.fn();
    render(<Slider label="Max price" value={500} min={0} max={200} step={5} onChange={onChange} />);
    const slider = screen.getByRole('slider') as HTMLInputElement;
    expect(slider.value).toBe('200');
    fireEvent.change(slider, { target: { value: '150' } });
    expect(onChange).toHaveBeenCalledWith(150);
  });

  it('NumberInput: clamps on blur and disables +/- at bounds', async () => {
    const onChange = vi.fn();
    const { rerender } = render(<NumberInput label="Quantity" value={5} min={1} max={10} onChange={onChange} />);
    const input = screen.getByRole('spinbutton') as HTMLInputElement;
    await userEvent.clear(input);
    await userEvent.type(input, '25');
    fireEvent.blur(input);
    expect(onChange).toHaveBeenLastCalledWith(10);

    rerender(<NumberInput label="Quantity" value={1} min={1} max={10} />);
    expect((screen.getByRole('button', { name: 'Decrease Quantity' }) as HTMLButtonElement).disabled).toBe(true);

    rerender(<NumberInput label="Quantity" value={10} min={1} max={10} />);
    expect((screen.getByRole('button', { name: 'Increase Quantity' }) as HTMLButtonElement).disabled).toBe(true);
  });

  it('DatePicker: change emits an ISO date; disabled blocks it', () => {
    const onChange = vi.fn();
    const { rerender } = render(<DatePicker label="Delivery date" value="" min="2026-10-01" max="2026-12-31" onChange={onChange} />);
    const input = screen.getByLabelText('Delivery date') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '2026-10-05' } });
    expect(onChange).toHaveBeenCalledWith('2026-10-05');

    rerender(<DatePicker label="Delivery date" value="" disabled onChange={onChange} />);
    expect((screen.getByLabelText('Delivery date') as HTMLInputElement).disabled).toBe(true);
  });

  describe('DateRangePicker', () => {
    const opts = { disabledDates: ['2026-10-20'], minNights: 2, maxNights: 7 };

    it('ranges may not cross disabled dates or break min / max nights', () => {
      expect(isRangeAllowed('2026-10-12', '2026-10-15', opts)).toBe(true);
      expect(isRangeAllowed('2026-10-18', '2026-10-22', opts)).toBe(false); // crosses the 20th
      expect(isRangeAllowed('2026-10-12', '2026-10-13', opts)).toBe(false); // shorter than minNights
      expect(isRangeAllowed('2026-10-01', '2026-10-10', opts)).toBe(false); // longer than maxNights
      expect(isRangeAllowed('2026-10-12', '2026-10-12', opts)).toBe(false); // zero nights
    });

    it('shows the label, the formatted range and the summary', () => {
      render(
        <DateRangePicker
          label="Stay"
          start="2026-10-12"
          end="2026-10-15"
          summary="3 nights"
          disabledDates={['2026-10-20']}
          minNights={2}
          maxNights={7}
        />,
      );
      expect(screen.getByText('Stay')).toBeTruthy();
      expect(screen.getByText('3 nights')).toBeTruthy();
      expect(screen.getByText(/Oct 12/)).toBeTruthy();
      expect(screen.getByText(/Oct 15/)).toBeTruthy();
    });

    it('picking start then a too-close end disables it; picking an allowed end emits change; month nav moves the grid', async () => {
      const onChange = vi.fn();
      render(
        <DateRangePicker label="Stay" start="" end="" minNights={2} maxNights={7} onChange={onChange} />,
      );
      await userEvent.click(screen.getByRole('button', { name: 'Stay' }));
      await userEvent.click(screen.getByRole('button', { name: '2026-10-12' }));
      // shorter than minNights(2): the very next day must be disabled while picking
      expect((screen.getByRole('button', { name: '2026-10-13' }) as HTMLButtonElement).disabled).toBe(true);
      await userEvent.click(screen.getByRole('button', { name: '2026-10-15' }));
      expect(onChange).toHaveBeenCalledWith({ start: '2026-10-12', end: '2026-10-15' });

      // Month navigation reaches months beyond "today"/start.
      await userEvent.click(screen.getByRole('button', { name: 'Stay' }));
      await userEvent.click(screen.getByRole('button', { name: 'Next month' }));
      await userEvent.click(screen.getByRole('button', { name: 'Next month' }));
      await userEvent.click(screen.getByRole('button', { name: 'Next month' }));
      expect(screen.getByText(/January 2027/)).toBeTruthy();
    });
  });

  it('FileUpload: renders files, remove and choose fire their events', async () => {
    const onRemove = vi.fn();
    const onSelect = vi.fn();
    const { container } = render(
      <FileUpload
        label="Card photos"
        buttonLabel="Choose photos"
        files={[{ name: 'front.jpg', sizeLabel: '1.2 MB' }]}
        onRemove={onRemove}
        onSelect={onSelect}
      />,
    );
    expect(screen.getByText('front.jpg')).toBeTruthy();
    expect(screen.getByText('1.2 MB')).toBeTruthy();

    await userEvent.click(screen.getByRole('button', { name: 'Remove front.jpg' }));
    expect(onRemove).toHaveBeenCalledWith('front.jpg');

    const file = new File(['hi'], 'hello.png', { type: 'image/png' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, file);
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('Rating: tapping a star selects it; readOnly never emits change', async () => {
    const onChange = vi.fn();
    const { unmount } = render(<Rating label="Your rating" value={2} onChange={onChange} />);
    await userEvent.click(screen.getByRole('radio', { name: '4 of 5' }));
    expect(onChange).toHaveBeenCalledWith(4);
    unmount();

    render(<Rating label="Average rating" value={4.5} readOnly />);
    const img = screen.getByRole('img', { name: '4.5 of 5' });
    expect(img.querySelectorAll('[data-star="full"]').length).toBe(4);
    expect(img.querySelectorAll('[data-star="half"]').length).toBe(1);
  });

  it('Combobox: search fires onSearch, picking an option fires onChange', async () => {
    const onSearch = vi.fn();
    const onChange = vi.fn();
    render(<ComboboxHarness onSearch={onSearch} onChange={onChange} />);
    const input = screen.getByRole('combobox') as HTMLInputElement;
    await userEvent.type(input, 'vi');
    expect(onSearch).toHaveBeenLastCalledWith('vi');
    expect(await screen.findByText('Vietnam')).toBeTruthy();

    await userEvent.click(screen.getByText('Vietnam'));
    expect(onChange).toHaveBeenCalledWith('VN');
    expect(input.value).toBe('Vietnam');
  });

  it('ChipGroup: multiple adds to selection, single toggles it off', async () => {
    const onChange = vi.fn();
    const options = [
      { value: 'holo', label: 'Holo' },
      { value: 'rare', label: 'Rare' },
    ];
    const { rerender } = render(<ChipGroup label="Rarity" options={options} value={['holo']} onChange={onChange} />);
    await userEvent.click(screen.getByText('Rare'));
    expect(onChange).toHaveBeenCalledWith(['holo', 'rare']);

    onChange.mockClear();
    rerender(<ChipGroup label="Rarity" options={options} value={['holo']} multiple={false} onChange={onChange} />);
    await userEvent.click(screen.getByText('Holo'));
    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('PinInput: typing the full code calls onChange and onComplete', async () => {
    const onChange = vi.fn();
    const onComplete = vi.fn();
    const { container } = render(<ControlledPin onChange={onChange} onComplete={onComplete} />);
    const input = container.querySelector('input') as HTMLInputElement;
    await userEvent.type(input, '123456');
    expect(onChange).toHaveBeenLastCalledWith('123456');
    expect(onComplete).toHaveBeenCalledWith('123456');
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.getByText('6')).toBeTruthy();
  });

  it('FormField: shows label, required marker, error and children', () => {
    render(
      <FormField label="Shipping address" required error="Street is required">
        <span>Street</span>
        <span>City</span>
      </FormField>,
    );
    expect(screen.getByText('Shipping address')).toBeTruthy();
    expect(screen.getByText('Street is required')).toBeTruthy();
    expect(screen.getByText('Street')).toBeTruthy();
    expect(screen.getByText('City')).toBeTruthy();
  });
});
