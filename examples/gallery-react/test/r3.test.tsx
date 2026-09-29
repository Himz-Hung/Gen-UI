import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Table } from '../ui/Table';
import { Avatar } from '../ui/Avatar';
import { Accordion } from '../ui/Accordion';
import { DescriptionList } from '../ui/DescriptionList';
import { Timeline } from '../ui/Timeline';
import { SwipeActions } from '../ui/SwipeActions';
import { AvailabilityCalendar } from '../ui/AvailabilityCalendar';
import { Icon } from '../ui/Icon';
import { Carousel } from '../ui/Carousel';
import { Video } from '../ui/Video';
import { ImageViewer } from '../ui/ImageViewer';

afterEach(cleanup);

describe('r3 gallery components', () => {
  it('Table: sorts and reports row press', async () => {
    const onSort = vi.fn();
    const onRowPress = vi.fn();
    render(
      <Table
        columns={[
          { key: 'id', label: 'Order' },
          { key: 'total', label: 'Total', align: 'end', sortable: true },
        ]}
        rows={[
          { id: 'A-1001', cells: ['A-1001', '$42.00'] },
          { id: 'A-1002', cells: ['A-1002', '$18.00'] },
        ]}
        sortKey="total"
        pressableRows
        onSort={onSort}
        onRowPress={onRowPress}
      />,
    );
    expect(screen.getByText('A-1001')).toBeTruthy();
    await userEvent.click(screen.getByText('Total'));
    expect(onSort).toHaveBeenCalledWith('total');
    await userEvent.click(screen.getByText('A-1002'));
    expect(onRowPress).toHaveBeenCalledWith('A-1002');
  });

  it('Table: shows emptyText when there are no rows', () => {
    render(<Table columns={[{ key: 'id', label: 'Order' }]} rows={[]} emptyText="No orders yet" />);
    expect(screen.getByText('No orders yet')).toBeTruthy();
  });

  it('Table: loading keeps the header and hides rows and emptyText', () => {
    render(
      <Table
        columns={[{ key: 'id', label: 'Order' }]}
        rows={[{ id: 'A-1', cells: ['A-1'] }]}
        emptyText="No orders"
        loading
      />,
    );
    expect(screen.getByText('Order')).toBeTruthy();
    expect(screen.queryByText('A-1')).toBeNull();
    expect(screen.queryByText('No orders')).toBeNull();
  });

  it('Avatar: without src shows initials', () => {
    render(<Avatar name="Ash Ketchum" size="lg" status="online" />);
    expect(screen.getByText('AK')).toBeTruthy();
  });

  it('Accordion: toggles open sections via onChange, and closed content is unmounted', async () => {
    const onChange = vi.fn();
    render(
      <Accordion
        items={[
          { value: 'ship', title: 'How long does shipping take?' },
          { value: 'return', title: 'Can I return a card?' },
        ]}
        open={['ship']}
        onChange={onChange}
      >
        <div>It ships in 3-5 days.</div>
        <div>Yes, within 30 days.</div>
      </Accordion>,
    );
    expect(screen.getByText('It ships in 3-5 days.')).toBeTruthy();
    expect(screen.queryByText('Yes, within 30 days.')).toBeNull();

    await userEvent.click(screen.getByText('Can I return a card?'));
    expect(onChange).toHaveBeenCalledWith(['return']);
  });

  it('DescriptionList: shows label-value pairs', () => {
    render(
      <DescriptionList
        items={[
          { label: 'Set', value: 'Base Set' },
          { label: 'Condition', value: 'Near mint' },
        ]}
      />,
    );
    expect(screen.getByText('Set')).toBeTruthy();
    expect(screen.getByText('Base Set')).toBeTruthy();
    expect(screen.getByText('Condition')).toBeTruthy();
    expect(screen.getByText('Near mint')).toBeTruthy();
  });

  it('Timeline: lists events in order with time shown', () => {
    render(
      <Timeline
        items={[
          { title: 'Order placed', time: 'Sep 28, 10:02' },
          { title: 'Shipped', time: 'Sep 29', tone: 'success' },
        ]}
      />,
    );
    expect(screen.getByText('Order placed')).toBeTruthy();
    expect(screen.getByText('Shipped')).toBeTruthy();
    expect(screen.getByText('Sep 29')).toBeTruthy();
  });

  it('SwipeActions: reveals an action on swipe and reports it', () => {
    const onAction = vi.fn();
    render(
      <SwipeActions actions={[{ value: 'delete', label: 'Delete', icon: 'trash', tone: 'danger' }]} onAction={onAction}>
        <div>Pikachu</div>
      </SwipeActions>,
    );
    expect(screen.getByText('Pikachu')).toBeTruthy();
    // jsdom has no PointerEvent implementation, so drag with mouse events (the component
    // also listens for these as a fallback alongside pointer events).
    const content = screen.getByText('Pikachu').closest('div')!.parentElement!;
    fireEvent.mouseDown(content, { clientX: 300 });
    fireEvent.mouseMove(content, { clientX: 100 });
    fireEvent.mouseUp(content, { clientX: 100 });
    expect(screen.getByRole('button', { name: 'Delete' })).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onAction).toHaveBeenCalledWith('delete');
  });

  it('AvailabilityCalendar: available days emit dayPress, booked never do, months change, legend shows', async () => {
    const onDayPress = vi.fn();
    const onMonthChange = vi.fn();
    render(
      <AvailabilityCalendar
        month="2026-10"
        days={[
          { date: '2026-10-12', status: 'available', priceLabel: '$120' },
          { date: '2026-10-13', status: 'booked' },
        ]}
        legend={{ available: 'Available', limited: 'Few left', booked: 'Booked', closed: 'Closed' }}
        max="2026-11"
        onDayPress={onDayPress}
        onMonthChange={onMonthChange}
      />,
    );
    expect(screen.getByText('$120')).toBeTruthy();
    await userEvent.click(screen.getByText('12').closest('button')!);
    expect(onDayPress).toHaveBeenCalledWith('2026-10-12');

    // The 13th is booked: it renders as plain text (not a button) and never emits dayPress.
    expect(screen.getByText('13').closest('button')).toBeNull();

    await userEvent.click(screen.getByRole('button', { name: 'Next month' }));
    expect(onMonthChange).toHaveBeenCalledWith('2026-11');
    expect(screen.getByText('Few left')).toBeTruthy();
  });

  it('Icon: renders the mapped icon with an accessible label', () => {
    render(<Icon name="star" color="warning" label="Favourite" />);
    const icon = screen.getByRole('img', { name: 'Favourite' });
    expect(icon).toBeTruthy();
    expect(icon.tagName.toLowerCase()).toBe('svg');
  });

  it('Icon: unknown names render a neutral placeholder, not nothing', () => {
    render(<Icon name="totally-unknown-icon" />);
    const svg = document.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg!.querySelector('path')!.getAttribute('d')).toBe('M4 4h16v16H4z');
  });

  it('Carousel: advances to the next slide via the next control', async () => {
    const onChange = vi.fn();
    render(
      <Carousel label="Card photos" onChange={onChange}>
        <div>Slide A</div>
        <div>Slide B</div>
      </Carousel>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Next slide' }));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('Video: shows a play control that toggles', async () => {
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
    render(<Video src="https://example.com/unboxing.mp4" label="Unboxing video" poster="https://example.com/poster.jpg" />);
    expect(screen.getByRole('button', { name: 'Play' })).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Play' }));
    expect(screen.getByRole('button', { name: 'Pause' })).toBeTruthy();
  });

  describe('ImageViewer', () => {
    const images = [
      { src: 'https://example.com/a.jpg', alt: 'Front' },
      { src: 'https://example.com/b.jpg', alt: 'Back' },
    ];

    it('closed shows nothing; open shows counter, moves and closes', async () => {
      const onChange = vi.fn();
      const onClose = vi.fn();
      const { rerender } = render(<ImageViewer open={false} label="Card photos" images={images} />);
      expect(screen.queryByText('1 / 2')).toBeNull();

      rerender(<ImageViewer open label="Card photos" images={images} onChange={onChange} onClose={onClose} />);
      expect(screen.getByText('1 / 2')).toBeTruthy();

      await userEvent.click(screen.getByRole('button', { name: 'Next image' }));
      expect(onChange).toHaveBeenCalledWith(1);

      await userEvent.click(screen.getByRole('button', { name: 'Close' }));
      expect(onClose).toHaveBeenCalled();
    });
  });
});
