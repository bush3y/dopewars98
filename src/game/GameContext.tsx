import {
  createContext,
  useContext,
  useMemo,
  useReducer,
  useState,
  type Dispatch,
  type ReactNode,
} from 'react';
import type { DrugId, GameSnapshot } from '../data/types';
import type { Action, GameState } from '../engine/types';
import { reducer, initialState } from '../engine/reducer';
import { toSnapshot } from '../engine/selectors';

export type DialogKind = 'buy' | 'sell' | 'finances' | 'new-game' | 'travel';

interface GameUi {
  /** Currently highlighted drug (drives Buy/Sell button enablement). */
  selected: DrugId | null;
  select: (drug: DrugId | null) => void;
  /** Which transient dialog is open (event/game-over are driven by state). */
  dialog: DialogKind | null;
  open: (dialog: DialogKind) => void;
  close: () => void;
}

interface GameContextValue {
  state: GameState;
  snapshot: GameSnapshot;
  dispatch: Dispatch<Action>;
  ui: GameUi;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => initialState());
  const [selected, setSelected] = useState<DrugId | null>(null);
  const [dialog, setDialog] = useState<DialogKind | null>(null);

  const value = useMemo<GameContextValue>(
    () => ({
      state,
      snapshot: toSnapshot(state),
      dispatch,
      ui: {
        selected,
        select: setSelected,
        dialog,
        open: setDialog,
        close: () => setDialog(null),
      },
    }),
    [state, selected, dialog],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
