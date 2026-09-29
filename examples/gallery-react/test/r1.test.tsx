import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SectionHeader } from '../ui/SectionHeader';
import { HorizontalScroll } from '../ui/HorizontalScroll';
import { PullToRefresh } from '../ui/PullToRefresh';
import { InfiniteScroll } from '../ui/InfiniteScroll';
import { RichText } from '../ui/RichText';
import { FloatingActionButton } from '../ui/FloatingActionButton';
import { Skeleton } from '../ui/Skeleton';
import { Tag } from '../ui/Tag';
import { Checkbox } from '../ui/Checkbox';

afterEach(cleanup);

// jsdom has no IntersectionObserver. Stub it and capture the callback so tests can simulate
// the sentinel entering the viewport without real layout.
let ioCallback: ((entries: { isIntersecting: boolean }[]) => void) | null = null;
beforeEach(() => {
  ioCallback = null;
  (globalThis as any).IntersectionObserver = class {
    constructor(cb: (entries: { isIntersecting: boolean }[]) => void) {
      ioCallback = cb;
    }
    observe() {}
    disconnect() {}
    unobserve() {}
  };
});

describe('r1', () => {
  it('SectionHeader: shows title/description and fires action', async () => {
    const onAction = vi.fn();
    render(<SectionHeader title="New arrivals" description="Fresh off the boat" actionLabel="See all" onAction={onAction} />);
    expect(screen.getByRole('heading', { level: 2, name: 'New arrivals' })).toBeTruthy();
    expect(screen.getByText('Fresh off the boat')).toBeTruthy();
    await userEvent.click(screen.getByText('See all'));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('HorizontalScroll: renders a labeled region with items in source order and arrow controls', () => {
    render(
      <HorizontalScroll label="New arrivals" itemWidth={180}>
        {Array.from({ length: 10 }, (_, i) => (
          <span key={i}>Item {i}</span>
        ))}
      </HorizontalScroll>,
    );
    expect(screen.getByRole('region', { name: 'New arrivals' })).toBeTruthy();
    expect(screen.getByText('Item 0')).toBeTruthy();
    expect(screen.getByText('Item 9')).toBeTruthy();
    // Previous is disabled at the start (jsdom has no layout, so "end" isn't asserted here).
    expect((screen.getByRole('button', { name: 'Previous' }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByRole('button', { name: 'Next' })).toBeTruthy();
  });

  it('HorizontalScroll: showArrows=false renders no arrow controls', () => {
    render(
      <HorizontalScroll label="Recently viewed" showArrows={false}>
        <span>Only item</span>
      </HorizontalScroll>,
    );
    expect(screen.queryByRole('button', { name: 'Previous' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Next' })).toBeNull();
  });

  it('HorizontalScroll: no arrow controls on a coarse (touch) pointer device', () => {
    const matchMedia = vi.fn().mockReturnValue({ matches: false });
    (window as any).matchMedia = matchMedia;
    render(
      <HorizontalScroll label="Recently viewed">
        <span>Only item</span>
      </HorizontalScroll>,
    );
    expect(screen.queryByRole('button', { name: 'Previous' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Next' })).toBeNull();
    delete (window as any).matchMedia;
  });

  it('PullToRefresh: pulling past the threshold emits refresh, and stays silent while refreshing', () => {
    const onRefresh = vi.fn();
    const { rerender } = render(
      <PullToRefresh label="Refresh cards" refreshing onRefresh={onRefresh}>
        <div>Card 0</div>
      </PullToRefresh>,
    );
    const scroller = screen.getByTestId('pull-to-refresh-scroll');
    // While refreshing is already true, pulling never emits refresh again.
    fireEvent.touchStart(scroller, { touches: [{ clientY: 0 }] });
    fireEvent.touchMove(scroller, { touches: [{ clientY: 300 }] });
    fireEvent.touchEnd(scroller);
    expect(onRefresh).not.toHaveBeenCalled();

    // Pulling past the threshold while idle emits refresh.
    rerender(
      <PullToRefresh label="Refresh cards" refreshing={false} onRefresh={onRefresh}>
        <div>Card 0</div>
      </PullToRefresh>,
    );
    fireEvent.touchStart(scroller, { touches: [{ clientY: 0 }] });
    fireEvent.touchMove(scroller, { touches: [{ clientY: 300 }] });
    fireEvent.touchEnd(scroller);
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('PullToRefresh: exposes the refresh action to assistive tech, named by label', async () => {
    const onRefresh = vi.fn();
    render(
      <PullToRefresh label="Refresh cards" refreshing={false} onRefresh={onRefresh}>
        <div>Card 0</div>
      </PullToRefresh>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Refresh cards' }));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('InfiniteScroll: load-more button fires loadMore and hides once hasMore is false', async () => {
    const onLoadMore = vi.fn();
    const { rerender } = render(
      <InfiniteScroll loading={false} hasMore loadMoreLabel="Load more cards" onLoadMore={onLoadMore}>
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i}>Card {i}</div>
        ))}
      </InfiniteScroll>,
    );
    expect(screen.getByText('Load more cards')).toBeTruthy();
    await userEvent.click(screen.getByText('Load more cards'));
    expect(onLoadMore).toHaveBeenCalledTimes(1);

    rerender(
      <InfiniteScroll loading={false} hasMore={false} loadMoreLabel="Load more cards" endText="You have seen everything">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i}>Card {i}</div>
        ))}
      </InfiniteScroll>,
    );
    expect(screen.queryByText('Load more cards')).toBeNull();
    expect(screen.getByText('You have seen everything')).toBeTruthy();
  });

  it('InfiniteScroll: never emits loadMore while loading', async () => {
    const onLoadMore = vi.fn();
    render(
      <InfiniteScroll loading hasMore loadMoreLabel="Load more cards" onLoadMore={onLoadMore}>
        <div>Card 0</div>
      </InfiniteScroll>,
    );
    const button = screen.getByText('Load more cards') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    await userEvent.click(button, { skipPointerEventsCheck: true } as any);
    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it('InfiniteScroll: the sentinel entering the viewport loads once, and again after a new page arrives', () => {
    const onLoadMore = vi.fn();
    const { rerender } = render(
      <InfiniteScroll loading={false} hasMore loadMoreLabel="Load more cards" onLoadMore={onLoadMore}>
        <div>Card 0</div>
      </InfiniteScroll>,
    );
    // Sentinel comes within view: emits loadMore once, and stays quiet on repeated notifications.
    ioCallback?.([{ isIntersecting: true }]);
    ioCallback?.([{ isIntersecting: true }]);
    expect(onLoadMore).toHaveBeenCalledTimes(1);

    // Still loading the requested page: the sentinel firing again must not emit a second time.
    rerender(
      <InfiniteScroll loading hasMore loadMoreLabel="Load more cards" onLoadMore={onLoadMore}>
        <div>Card 0</div>
      </InfiniteScroll>,
    );
    ioCallback?.([{ isIntersecting: true }]);
    expect(onLoadMore).toHaveBeenCalledTimes(1);

    // The page arrived (loading -> false): the guard resets and a later approach can load again.
    rerender(
      <InfiniteScroll loading={false} hasMore loadMoreLabel="Load more cards" onLoadMore={onLoadMore}>
        <div>Card 0</div>
        <div>Card 1</div>
      </InfiniteScroll>,
    );
    ioCallback?.([{ isIntersecting: true }]);
    expect(onLoadMore).toHaveBeenCalledTimes(2);
  });

  it('RichText: formats the subset, keeps lists/headings semantic, leaves HTML as plain text, and emits link', () => {
    const onLink = vi.fn();
    render(
      <RichText
        markdown={'## Details\n\n**Near mint.** Shipped in a toploader.\n\n- Base Set, 1999\n- [Grading guide](https://example.com/g)\n\n<b>raw</b>'}
        onLink={onLink}
      />,
    );
    expect(screen.getByRole('heading', { level: 2, name: 'Details' })).toBeTruthy();
    expect(screen.getByRole('list').tagName).toBe('UL');
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('Near mint.').tagName).toBe('STRONG');
    expect(screen.getByText('<b>raw</b>')).toBeTruthy(); // HTML stays plain text, never executed
    const link = screen.getByRole('link', { name: 'Grading guide' });
    fireEvent.click(link);
    expect(onLink).toHaveBeenCalledWith('https://example.com/g');
  });

  it('FloatingActionButton: floats, presses, and never presses while disabled', async () => {
    const onPress = vi.fn();
    const { rerender } = render(<FloatingActionButton label="New order" icon="plus" onPress={onPress} />);
    const button = screen.getByRole('button', { name: 'New order' });
    expect(button.style.position).toBe('fixed');
    await userEvent.click(button);
    expect(onPress).toHaveBeenCalledTimes(1);

    rerender(<FloatingActionButton label="New order" icon="plus" extended disabled onPress={onPress} />);
    expect(screen.getByText('New order')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'New order' }));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('Skeleton: renders the requested number of text lines, hidden from assistive tech', () => {
    const { container } = render(<Skeleton shape="text" lines={3} />);
    expect(container.querySelector('[aria-hidden]')).toBeTruthy();
    expect(container.querySelectorAll('.genui-skeleton-pulse')).toHaveLength(3);
  });

  it('Skeleton: circle and card/ratio shapes each render a single block', () => {
    const { container: c1 } = render(<Skeleton shape="circle" />);
    expect(c1.querySelectorAll('.genui-skeleton-pulse')).toHaveLength(1);
    const { container: c2 } = render(<Skeleton shape="card" ratio="4:3" />);
    expect(c2.querySelectorAll('.genui-skeleton-pulse')).toHaveLength(1);
  });

  it('Tag: remove control calls onRemove with an accessible name', async () => {
    const onRemove = vi.fn();
    render(<Tag label="In stock" onRemove={onRemove} />);
    expect(screen.getByText('In stock')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Remove In stock' }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('Tag: removable=false renders no remove control', () => {
    render(<Tag label="Fixed" removable={false} />);
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('Checkbox: tapping the label toggles, disabled does not call onChange', async () => {
    const onChange = vi.fn();
    const { rerender } = render(<Checkbox label="Accept terms" checked={false} onChange={onChange} />);
    expect(screen.getByText('Accept terms')).toBeTruthy();
    await userEvent.click(screen.getByText('Accept terms'));
    expect(onChange).toHaveBeenCalledWith(true);

    onChange.mockClear();
    rerender(<Checkbox label="Accept terms" checked={false} disabled onChange={onChange} />);
    await userEvent.click(screen.getByText('Accept terms'), { skipPointerEventsCheck: true } as any);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('Checkbox: exposes role checkbox named by label', () => {
    render(<Checkbox label="Accept terms" checked />);
    const box = screen.getByRole('checkbox', { name: 'Accept terms' });
    expect((box as HTMLInputElement).checked).toBe(true);
  });
});
