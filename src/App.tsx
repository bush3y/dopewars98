import { useSyncExternalStore } from 'react';
import { DesktopWindow } from './components/DesktopWindow';
import { MobileLayout } from './components/MobileLayout';
import { SNAPSHOT } from './data/gameData';

const MOBILE_QUERY = '(max-width: 640px)';

/** Reactively tracks a media query without effects/flicker. */
function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', cb);
      return () => mql.removeEventListener('change', cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export default function App() {
  const isMobile = useMediaQuery(MOBILE_QUERY);

  // Desktop = faithful square window on a backdrop. Mobile = portrait reflow.
  // Same SNAPSHOT feeds both (BRIEF.md §2).
  return isMobile ? (
    <MobileLayout snap={SNAPSHOT} />
  ) : (
    <div className="desktop-backdrop">
      <DesktopWindow snap={SNAPSHOT} />
    </div>
  );
}
