// Kalā Trail visual system: route stitch symbol, rendered crisply for navigation and favicon-sized contexts.
export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <span className="brand-lockup" aria-label="Virāsat">
      <span className="brand-mark" aria-hidden="true">
        <svg viewBox="0 0 36 36" role="img">
          <path d="M7 22.8c5.4 5.4 13.3 5.6 19.7.2 3.6-3.1 3.2-8.2-.5-9.6-2.6-1-5.5.1-6.8 2.4-1.2 2.3-.2 4.8 2.5 5.4 2.8.6 5.2-1.1 7.2-4.2" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
          <path d="M16.8 20.8c-.8-3.6-1.1-7.3.2-9.8.8-1.6 2.2-2.8 4.4-3.6.6 2.8.2 5.2-1.1 7.1-1.2 1.8-2.7 3.1-3.5 6.3Z" fill="var(--terracotta)" stroke="currentColor" strokeWidth="1.1" />
          <circle cx="8.2" cy="22.8" r="1.4" fill="var(--gold)" />
        </svg>
      </span>
      {!compact && <span className="brand-type"><strong>Virāsat</strong><em>LIVING HERITAGE</em></span>}
    </span>
  );
}
