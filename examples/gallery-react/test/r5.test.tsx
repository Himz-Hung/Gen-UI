import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '../ui/Modal';
import { Drawer } from '../ui/Drawer';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { Menu } from '../ui/Menu';
import { Button } from '../ui/Button';
import { LineChart } from '../ui/LineChart';
import { BarChart } from '../ui/BarChart';
import { PieChart } from '../ui/PieChart';

afterEach(cleanup);

describe('Modal', () => {
  it('open=false renders no title', () => {
    render(<Modal open={false} title="Order details" />);
    expect(screen.queryByText('Order details')).toBeNull();
  });

  it('open=true shows title and backdrop press calls onClose', async () => {
    const onClose = vi.fn();
    render(
      <Modal open title="Order details" onClose={onClose}>
        <p>Body content</p>
      </Modal>,
    );
    expect(screen.getByText('Order details')).toBeTruthy();
    expect(screen.getByText('Body content')).toBeTruthy();

    const backdrop = document.querySelector('[data-ui-backdrop]');
    expect(backdrop).toBeTruthy();
    await userEvent.click(backdrop as Element);
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('Drawer', () => {
  it('open=false renders no title', () => {
    render(<Drawer open={false} title="Filters" />);
    expect(screen.queryByText('Filters')).toBeNull();
  });

  it('open=true shows title and close control calls onClose', async () => {
    const onClose = vi.fn();
    render(
      <Drawer open title="Filters" side="end" onClose={onClose}>
        <p>Filter body</p>
      </Drawer>,
    );
    expect(screen.getByText('Filters')).toBeTruthy();
    expect(screen.getByText('Filter body')).toBeTruthy();

    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('ConfirmDialog', () => {
  it('confirm calls onConfirm', async () => {
    const onConfirm = vi.fn();
    render(
      <ConfirmDialog
        open
        title="Delete this order?"
        message="This cannot be undone."
        confirmLabel="Delete order"
        cancelLabel="Keep it"
        tone="danger"
        onConfirm={onConfirm}
        onCancel={() => {}}
      />,
    );
    expect(screen.getByText('Delete this order?')).toBeTruthy();
    await userEvent.click(screen.getByText('Delete order'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('loading=true disables cancel', async () => {
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        open
        title="Delete this order?"
        message="This cannot be undone."
        confirmLabel="Delete order"
        cancelLabel="Keep it"
        loading
        onConfirm={() => {}}
        onCancel={onCancel}
      />,
    );
    await userEvent.click(screen.getByText('Keep it'));
    expect(onCancel).not.toHaveBeenCalled();
  });
});

describe('Menu', () => {
  it('opens on trigger press and calls onSelect', async () => {
    let selected: string | undefined;
    render(
      <Menu
        label="Card actions"
        items={[
          { value: 'share', label: 'Share', icon: 'share' },
          { value: 'delete', label: 'Delete', icon: 'trash', danger: true },
        ]}
        onSelect={(v) => { selected = v; }}
      >
        <Button label="Actions" />
      </Menu>,
    );

    expect(screen.queryByText('Share')).toBeNull();

    await userEvent.click(screen.getByText('Actions'));
    expect(screen.getByText('Share')).toBeTruthy();
    expect(screen.getByText('Delete')).toBeTruthy();

    await userEvent.click(screen.getByText('Delete'));
    expect(selected).toBe('delete');
    expect(screen.queryByText('Share')).toBeNull();
  });
});

describe('LineChart', () => {
  it('renders summary text when empty', () => {
    render(<LineChart summary="No sales recorded this week" series={[]} />);
    expect(screen.getByText('No sales recorded this week')).toBeTruthy();
  });
});

describe('BarChart', () => {
  it('renders summary text when empty', () => {
    render(<BarChart summary="No orders yet" bars={[]} />);
    expect(screen.getByText('No orders yet')).toBeTruthy();
  });

  it('tapping a bar calls onBarPress with its index', async () => {
    let pressedIndex: number | undefined;
    const { container } = render(
      <BarChart
        summary="Base Set sells the most"
        bars={[
          { label: 'Base Set', value: 42 },
          { label: 'Jungle', value: 18 },
        ]}
        onBarPress={(i) => { pressedIndex = i; }}
      />,
    );
    const bars = container.querySelectorAll('rect[data-ui-bar]');
    expect(bars.length).toBe(2);
    await userEvent.click(bars[0]);
    expect(pressedIndex).toBe(0);
  });
});

describe('PieChart', () => {
  it('renders summary text when empty', () => {
    render(<PieChart summary="No data available" slices={[]} />);
    expect(screen.getByText('No data available')).toBeTruthy();
  });

  it('tapping a slice calls onSlicePress', async () => {
    let pressedIndex: number | undefined;
    const { container } = render(
      <PieChart
        summary="Most orders are near-mint cards"
        slices={[
          { label: 'Near mint', value: 60 },
          { label: 'Played', value: 40 },
        ]}
        donut={false}
        onSlicePress={(i) => { pressedIndex = i; }}
      />,
    );
    // Near-mint is drawn first (clockwise from the top), so it is slice 0.
    const slice = container.querySelector('[data-ui-slice="0"]');
    expect(slice).toBeTruthy();
    await userEvent.click(slice as Element);
    expect(pressedIndex).toBe(0);
  });
});
