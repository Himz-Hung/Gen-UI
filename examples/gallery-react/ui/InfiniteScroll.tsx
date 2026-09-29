import { useEffect, useRef } from 'react';
import { tokens, sp } from './tokens';

export interface InfiniteScrollProps {
  loading: boolean;
  hasMore: boolean;
  loadMoreLabel: string;
  endText?: string;
  onLoadMore?: () => void;
  children?: React.ReactNode;
}

export function InfiniteScroll({ loading, hasMore, loadMoreLabel, endText, onLoadMore, children }: InfiniteScrollProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  // Guards against emitting loadMore more than once per request.
  const pendingRef = useRef(false);

  useEffect(() => {
    if (!loading) pendingRef.current = false;
  }, [loading]);
  useEffect(() => {
    if (!hasMore) pendingRef.current = false;
  }, [hasMore]);

  const maybeLoadMore = () => {
    // Emits loadMore once, and never while loading or when hasMore is false.
    if (loading || !hasMore || pendingRef.current) return;
    pendingRef.current = true;
    onLoadMore?.();
  };

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) maybeLoadMore();
      },
      { rootMargin: '100% 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, hasMore]);

  return (
    <div>
      {children}
      <div ref={sentinelRef} aria-hidden style={{ height: 1 }} />
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: `${sp(4)} 0` }}>
          <style>{'@keyframes genui-infinite-scroll-spin { to { transform: rotate(360deg); } }'}</style>
          <span
            role="status"
            aria-label="Loading more"
            style={{
              width: 24, height: 24, borderRadius: tokens.radius.full,
              border: `2px solid ${tokens.color.muted}`, borderTopColor: tokens.color.primary,
              display: 'inline-block', animation: 'genui-infinite-scroll-spin 0.8s linear infinite',
            }}
          />
        </div>
      )}
      {hasMore ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: `${sp(2)} 0` }}>
          <button
            type="button"
            disabled={loading}
            onClick={maybeLoadMore}
            style={{ background: 'none', border: 'none', color: tokens.color.primary, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 14 }}
          >
            {loadMoreLabel}
          </button>
        </div>
      ) : (
        endText && (
          // New items / end reached are announced politely; focus stays where it was.
          <div aria-live="polite" style={{ textAlign: 'center', padding: `${sp(4)} 0`, color: tokens.color.muted }}>
            {endText}
          </div>
        )
      )}
    </div>
  );
}
