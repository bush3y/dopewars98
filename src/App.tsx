import { useSyncExternalStore } from 'react';
import { DesktopWindow } from './components/DesktopWindow';
import { MobileLayout } from './components/MobileLayout';
import { GameDialogs } from './components/GameDialogs';
import { GameProvider } from './game/GameContext';

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
  // Both read the same reducer-driven state via GameProvider (BRIEF.md §2, §4).
  return (
    <GameProvider>
      {isMobile ? (
        <MobileLayout />
      ) : (
        <div className="desktop-backdrop">
          <DesktopWindow />
        </div>
      )}
      <GameDialogs />
    </GameProvider>
  );
}
