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
import type { Action, GameState, GameMode } from '../engine/types';
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
  saveDailyGame,
  loadDailyResult,
  loadStreak,
  recordStreak,
  type ScoreEntry,
  type Settings,
  type DailyStreak,
} from './storage';
import { setSoundEnabled, playSfx, type Sfx } from './sound';
import { todayKey, dailySeed, isWin } from './daily';
import { objectivesDone } from './objectives';
import { CITIES, DEFAULT_CITY, type CityId } from '../data/cities';

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
  | 'daily'
  | 'objectives';

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
  streak: DailyStreak;
  settings: Settings;
  toggleSound: () => void;
  /** Mode the New Game confirm will start (Classic or Dynasty). */
  pendingMode: GameMode;
  /** Open the New Game confirm for a given mode. */
  requestNewGame: (mode: GameMode) => void;
  /** Cosmetic city skin (relabels neighborhoods only). */
  city: CityId;
  setCity: (city: CityId) => void;
  /** Switch to a different random city. */
  randomCity: () => void;
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
  const [streak, setStreak] = useState<DailyStreak>(() => loadStreak());
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [pendingMode, setPendingMode] = useState<GameMode>('classic');
  const [bump, setBump] = useState(0);

  const requestNewGame = useCallback((mode: GameMode) => {
    setPendingMode(mode);
    setDialog('new-game');
  }, []);

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

  // Auto-save the active game on every change. While today's daily is the active
  // run, also persist it separately so leaving and returning resumes it (never
  // restarts — the world is deterministic, so a restart would be save-scumming).
  useEffect(() => {
    saveCurrent(state);
    const key = todayKey();
    if (state.mode === 'daily' && state.seed === dailySeed(key) && state.status === 'playing') {
      saveDailyGame(key, state);
    }
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
        // If this run was today's daily and not already recorded, record it
        // (play-once) and update the win streak.
        const key = todayKey();
        const score = netWorth(state);
        if (state.mode === 'daily' && state.seed === dailySeed(key) && !loadDailyResult(key)) {
          saveDailyResult({
            date: key,
            seed: state.seed,
            score,
            status: state.status,
            day: state.day,
            history: state.netWorthHistory,
            objectives: objectivesDone(state.seed, state),
            playedAt: Date.now(),
          });
          setStreak(recordStreak(key, isWin(state.status, score)));
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

  const setCity = useCallback((city: CityId) => {
    setSettings((s) => {
      const next = { ...s, city };
      saveSettings(next);
      playSfx('click');
      return next;
    });
  }, []);

  const randomCity = useCallback(() => {
    setSettings((s) => {
      const others = CITIES.filter((c) => c.id !== s.city);
      const pick = others[Math.floor(Math.random() * others.length)] ?? CITIES[0];
      const next = { ...s, city: pick.id };
      saveSettings(next);
      playSfx('travel');
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
      streak,
      settings,
      toggleSound,
      pendingMode,
      requestNewGame,
      city: settings.city ?? DEFAULT_CITY,
      setCity,
      randomCity,
      bump,
      refresh: () => setBump((b) => b + 1),
    }),
    [state, dispatch, selected, dialog, scores, streak, settings, toggleSound, pendingMode, requestNewGame, setCity, randomCity, bump],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
