import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
} from 'react';
import type { DrugId, GameSnapshot } from '../data/types';
import type { Action, GameState } from '../engine/types';
import { reducer, initialState, netWorth } from '../engine/reducer';
import { toSnapshot } from '../engine/selectors';
import {
  loadCurrent,
  saveCurrent,
  loadScores,
  addScore,
  loadSettings,
  saveSettings,
  saveDailyResult,
  type ScoreEntry,
  type Settings,
} from './storage';
import { setSoundEnabled, playSfx, type Sfx } from './sound';
import { todayKey, dailySeed } from './daily';

export type DialogKind =
  | 'buy'
  | 'sell'
  | 'finances'
  | 'new-game'
  | 'travel'
  | 'gun-shop'
  | 'save'
  | 'load'
  | 'scores'
  | 'chart'
  | 'daily';

interface GameUi {
  selected: DrugId | null;
  select: (drug: DrugId | null) => void;
  dialog: DialogKind | null;
  open: (dialog: DialogKind) => void;
  close: () => void;
}

interface GameContextValue {
  state: GameState;
  snapshot: GameSnapshot;
  dispatch: Dispatch<Action>;
  ui: GameUi;
  scores: ScoreEntry[];
  settings: Settings;
  toggleSound: () => void;
  /** Re-read save slots / scores after a write, to refresh dialogs. */
  bump: number;
  refresh: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

// Sounds tied to specific actions (outcome-based sounds fire from effects).
const ACTION_SFX: Partial<Record<Action['type'], Sfx>> = {
  BUY: 'buy',
  BUY_GUN: 'buy',
  SELL: 'sell',
  TRAVEL: 'travel',
  DEPOSIT: 'cash',
  WITHDRAW: 'cash',
  REPAY_DEBT: 'cash',
};

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, rawDispatch] = useReducer(reducer, undefined, () => loadCurrent() ?? initialState());
  const [selected, setSelected] = useState<DrugId | null>(null);
  const [dialog, setDialog] = useState<DialogKind | null>(null);
  const [scores, setScores] = useState<ScoreEntry[]>(() => loadScores());
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [bump, setBump] = useState(0);

  // Apply persisted sound preference once.
  useEffect(() => {
    setSoundEnabled(settings.sound);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // dispatch wrapper: play the action's sound (no-op when sound is off).
  const dispatch = useCallback<Dispatch<Action>>((action) => {
    const sfx = ACTION_SFX[action.type];
    if (sfx) playSfx(sfx);
    rawDispatch(action);
  }, []);

  // Auto-save the active game on every change.
  useEffect(() => {
    saveCurrent(state);
  }, [state]);

  // Outcome sounds + high-score recording on transitions.
  const prevEnc = useRef(state.pendingEncounter != null);
  const prevStatus = useRef(state.status);
  useEffect(() => {
    const encNow = state.pendingEncounter != null;
    if (encNow && !prevEnc.current) playSfx('encounter');
    prevEnc.current = encNow;

    if (state.status !== prevStatus.current) {
      if (state.status === 'won') playSfx('cash');
      if (state.status === 'dead') playSfx('lose');
      if (state.status === 'won' || state.status === 'dead') {
        setScores(
          addScore({
            score: netWorth(state),
            day: state.day,
            status: state.status,
            mode: state.mode,
            date: Date.now(),
          }),
        );
        // If this run was today's daily, record it (play-once per date).
        const key = todayKey();
        if (state.mode === 'daily' && state.seed === dailySeed(key)) {
          saveDailyResult({
            date: key,
            seed: state.seed,
            score: netWorth(state),
            status: state.status,
            day: state.day,
            history: state.netWorthHistory,
            playedAt: Date.now(),
          });
        }
      }
      prevStatus.current = state.status;
    }
  }, [state]);

  const toggleSound = useCallback(() => {
    setSettings((s) => {
      const next = { ...s, sound: !s.sound };
      setSoundEnabled(next.sound);
      saveSettings(next);
      if (next.sound) playSfx('click');
      return next;
    });
  }, []);

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
      scores,
      settings,
      toggleSound,
      bump,
      refresh: () => setBump((b) => b + 1),
    }),
    [state, dispatch, selected, dialog, scores, settings, toggleSound, bump],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
