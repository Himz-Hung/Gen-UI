import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toast } from '../ui/Toast';
import { Spinner } from '../ui/Spinner';
import { ProgressBar } from '../ui/ProgressBar';
import { Tooltip } from '../ui/Tooltip';
import { Tabs } from '../ui/Tabs';
import { BottomNav } from '../ui/BottomNav';
import { SegmentedControl } from '../ui/SegmentedControl';
import { Sidebar } from '../ui/Sidebar';
import { Breadcrumbs } from '../ui/Breadcrumbs';
import { Stepper } from '../ui/Stepper';
import { SiteHeader } from '../ui/SiteHeader';
import { SiteFooter } from '../ui/SiteFooter';

afterEach(cleanup);

// Installs a query-aware matchMedia stub so components that use window.matchMedia('(min-width: Npx)')
// can be driven to a wide or narrow layout in jsdom (which has no real layout engine).
function stubMatchMedia(wideQueries: string[]) {
  const original = window.matchMedia;
  window.matchMedia = ((query: string) => {
    const matches = wideQueries.includes(query);
    return {
      matches,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    } as unknown as MediaQueryList;
  }) as unknown as typeof window.matchMedia;
  return () => { window.matchMedia = original; };
}

describe('r4', () => {
  describe('Toast', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('shows the message and auto-closes after duration', () => {
      const onClose = vi.fn();
      render(<Toast open message="Added to cart" tone="success" duration={300} onClose={onClose} />);
      expect(screen.getByText('Added to cart')).toBeTruthy();
      expect(onClose).not.toHaveBeenCalled();
      vi.advanceTimersByTime(300);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('never closes itself when duration is 0', () => {
      const onClose = vi.fn();
      render(<Toast open message="Stays" duration={0} onClose={onClose} />);
      vi.advanceTimersByTime(60_000);
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  it('Spinner shows its accessible label when showLabel is true', () => {
    render(<Spinner label="Loading cards" showLabel />);
    expect(screen.getByText('Loading cards')).toBeTruthy();
    expect(screen.getByRole('status', { name: 'Loading cards' })).toBeTruthy();
  });

  it('ProgressBar shows the pre-formatted valueLabel instead of a percentage', () => {
    render(<ProgressBar label="Uploading photos" value={60} valueLabel="3 of 5 files" />);
    expect(screen.getByText('Uploading photos')).toBeTruthy();
    expect(screen.getByText('3 of 5 files')).toBeTruthy();
    expect(screen.queryByText('60%')).toBeNull();
    const bar = screen.getByRole('progressbar');
    expect(bar.getAttribute('aria-valuenow')).toBe('60');
  });

  it('Tooltip carries its text and wraps exactly one trigger child', async () => {
    const user = userEvent.setup();
    render(
      <Tooltip text="Share this card">
        <button>Share</button>
      </Tooltip>,
    );
    expect(screen.queryByRole('tooltip')).toBeNull();
    await user.hover(screen.getByRole('button', { name: 'Share' }));
    const tooltip = await screen.findByRole('tooltip');
    expect(tooltip.textContent).toBe('Share this card');
  });

  it('Tabs shows the active tab content and emits the tapped tab value', async () => {
    const onChange = vi.fn();
    render(
      <Tabs tabs={[{ value: 'grid', label: 'Grid' }, { value: 'list', label: 'List' }]} value="grid" onChange={onChange}>
        <div>Grid content</div>
      </Tabs>,
    );
    expect(screen.getByText('Grid content')).toBeTruthy();
    await userEvent.click(screen.getByRole('tab', { name: 'List' }));
    expect(onChange).toHaveBeenCalledWith('list');
  });

  it('BottomNav shows items and emits change for the tapped destination', async () => {
    const onChange = vi.fn();
    render(
      <BottomNav
        value="home"
        items={[
          { value: 'home', label: 'Home', icon: 'home' },
          { value: 'cart', label: 'Cart', icon: 'cart', badge: '3' },
          { value: 'me', label: 'Account', icon: 'user' },
        ]}
        onChange={onChange}
      />,
    );
    expect(screen.getByText('Home')).toBeTruthy();
    expect(screen.getByText('Cart')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Cart, 3' }));
    expect(onChange).toHaveBeenCalledWith('cart');
  });

  it('SegmentedControl shows options and emits the tapped option', async () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl
        label="View"
        value="grid"
        options={[{ value: 'grid', label: 'Grid' }, { value: 'list', label: 'List' }]}
        onChange={onChange}
      />,
    );
    expect(screen.getByText('Grid')).toBeTruthy();
    expect(screen.getByText('List')).toBeTruthy();
    await userEvent.click(screen.getByRole('radio', { name: 'List' }));
    expect(onChange).toHaveBeenCalledWith('list');
  });

  it('Sidebar groups items by section and emits change / toggle', async () => {
    const onChange = vi.fn();
    const onToggle = vi.fn();
    render(
      <Sidebar
        title="Admin"
        value="orders"
        items={[
          { value: 'orders', label: 'Orders', icon: 'box', badge: '12' },
          { value: 'cards', label: 'Cards', icon: 'grid', section: 'Catalog' },
        ]}
        onChange={onChange}
        onToggle={onToggle}
      />,
    );
    expect(screen.getByText('Admin')).toBeTruthy();
    expect(screen.getByText('Catalog')).toBeTruthy();
    expect(screen.getByText('Orders')).toBeTruthy();
    await userEvent.click(screen.getByText('Cards'));
    expect(onChange).toHaveBeenCalledWith('cards');
    await userEvent.click(screen.getByRole('button', { name: 'Collapse' }));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('Sidebar collapsed: items keep an accessible name though the label text is hidden', () => {
    render(
      <Sidebar
        collapsed
        value="orders"
        items={[{ value: 'orders', label: 'Orders', icon: 'box' }]}
      />,
    );
    expect(screen.getByRole('button', { name: 'Orders' })).toBeTruthy();
    expect(screen.queryByText('Orders')).toBeNull();
  });

  it('Breadcrumbs marks the last item as plain text and emits press for ancestors', async () => {
    const onPress = vi.fn();
    render(
      <Breadcrumbs
        items={[
          { value: 'home', label: 'Home' },
          { value: 'sets', label: 'Sets' },
          { value: 'base', label: 'Base Set' },
        ]}
        onPress={onPress}
      />,
    );
    const last = screen.getByText('Base Set');
    expect(last.tagName).not.toBe('BUTTON');
    expect(last.getAttribute('aria-current')).toBe('page');
    await userEvent.click(screen.getByText('Home'));
    expect(onPress).toHaveBeenCalledWith('home');
  });

  it('Stepper marks completed steps pressable and emits press with the step index', async () => {
    const onPress = vi.fn();
    render(
      <Stepper
        current={1}
        allowBack
        steps={[{ label: 'Cart' }, { label: 'Shipping' }, { label: 'Payment' }]}
        onPress={onPress}
      />,
    );
    expect(screen.getByText('Cart')).toBeTruthy();
    expect(screen.getByText('Shipping')).toBeTruthy();
    expect(screen.getByText('Payment')).toBeTruthy();
    const completed = screen.getByRole('button', { name: 'Cart, completed' });
    await userEvent.click(completed);
    expect(onPress).toHaveBeenCalledWith(0);
    // Future steps are never pressable.
    expect(screen.queryByRole('button', { name: /Payment/ })).toBeNull();
  });

  describe('SiteHeader', () => {
    const links = [{ value: 'rooms', label: 'Rooms', active: true }, { value: 'offers', label: 'Offers' }];
    const actions = [{ value: 'book', label: 'Book now', variant: 'primary' as const }];

    it('wide: links and actions on one row, no menu button', async () => {
      const restore = stubMatchMedia(['(min-width: 768px)']);
      let nav: string | undefined;
      let action: string | undefined;
      render(
        <SiteHeader
          brand="Seaside Stays"
          menuLabel="Menu"
          links={links}
          actions={actions}
          onNavigate={(v) => { nav = v; }}
          onAction={(v) => { action = v; }}
        />,
      );
      expect(screen.queryByRole('button', { name: 'Menu' })).toBeNull();
      await userEvent.click(screen.getByText('Offers'));
      expect(nav).toBe('offers');
      await userEvent.click(screen.getByText('Book now'));
      expect(action).toBe('book');
      restore();
    });

    it('narrow: a menu button opens a panel; choosing a link closes it', async () => {
      const restore = stubMatchMedia([]);
      let nav: string | undefined;
      render(
        <SiteHeader
          brand="Seaside Stays"
          menuLabel="Menu"
          links={links}
          actions={actions}
          onNavigate={(v) => { nav = v; }}
        />,
      );
      expect(screen.queryByText('Offers')).toBeNull();
      await userEvent.click(screen.getByRole('button', { name: 'Menu' }));
      const dialog = await screen.findByRole('dialog');
      expect(within(dialog).getByText('Offers')).toBeTruthy();
      await userEvent.click(within(dialog).getByText('Offers'));
      expect(nav).toBe('offers');
      expect(screen.queryByRole('dialog')).toBeNull();
      restore();
    });
  });

  describe('SiteFooter', () => {
    const columns = [
      { title: 'Company', links: [{ value: 'about', label: 'About' }] },
      { title: 'Help', links: [{ value: 'faq', label: 'FAQ' }] },
      { title: 'Legal', links: [{ value: 'terms', label: 'Terms' }] },
    ];

    it('wide: columns side by side and links navigate', async () => {
      const restore = stubMatchMedia(['(min-width: 768px)']);
      let nav: string | undefined;
      render(<SiteFooter brand="Seaside Stays" columns={columns} legal="© 2026 Seaside Stays" onNavigate={(v) => { nav = v; }} />);
      // Wide: all columns render open, side by side — no accordion buttons, all three navs present at once.
      expect(screen.queryByRole('button', { expanded: false })).toBeNull();
      expect(screen.getAllByRole('navigation')).toHaveLength(3);
      await userEvent.click(screen.getByText('FAQ'));
      expect(nav).toBe('faq');
      expect(screen.getByText('© 2026 Seaside Stays')).toBeTruthy();
      restore();
    });

    it('narrow with more than two columns: columns collapse under their titles', async () => {
      const restore = stubMatchMedia([]);
      render(<SiteFooter columns={columns} />);
      expect(screen.queryByText('FAQ')).toBeNull();
      await userEvent.click(screen.getByText('Help'));
      expect(screen.getByText('FAQ')).toBeTruthy();
      restore();
    });
  });
});
