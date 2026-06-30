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
import { reducer, initialState, finalScore } from '../engine/reducer';
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
  loadDailyGame,
  loadDailyResult,
  saveModeGame,
  clearModeGame,
  loadLastDate,
  saveLastDate,
  loadStreak,
  recordStreak,
  loadRankCounts,
  saveRankCounts,
  loadRankCredit,
  saveRankCredit,
  type ScoreEntry,
  type Settings,
  type DailyStreak,
} from './storage';
import { rankIndexFor, RANKS } from '../data/ranks';
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
  | 'objectives'
  | 'ranks'
  | 'help'
  | 'about'
  | 'kingpin'
  | 'switch-daily';

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
  /** Lifetime per-rank achievement counts (once per game), indexed like RANKS. */
  rankCounts: number[];
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

/**
 * Decide what to show on launch (BRIEF: Daily is "home"). Resume today's daily or
 * an in-progress non-daily run; default first-timers to the Daily; and when a
 * non-daily run is in progress on a *new* day, surface a prompt to continue it or
 * switch to today's Daily (the run stays stashed either way).
 */
function decideStartup(): { initial: GameState; switchPrompt: boolean } {
  const today = todayKey();
  const todaySeed = dailySeed(today);
  const lastDate = loadLastDate();
  const current = loadCurrent();

  // Resume the last active game if it's still in progress.
  if (current && current.status === 'playing') {
    // Today's daily → just resume it.
    if (current.mode === 'daily' && current.seed === todaySeed) {
      return { initial: current, switchPrompt: false };
    }
    // A non-daily run → resume; prompt to switch to the Daily on a new day. (Each
    // mode keeps its own slot, so the others stay saved and reachable via the menu.)
    if (current.mode !== 'daily') {
      return { initial: current, switchPrompt: lastDate !== today };
    }
    // An old daily still 'playing' (not today's) falls through to the default.
  }

  // Otherwise default to today's Daily: resume a mid-run, start a fresh one if
  // available, or (already finished today) fall back to a fresh Classic game.
  const savedDaily = loadDailyGame(today);
  if (savedDaily) return { initial: savedDaily, switchPrompt: false };
  if (!loadDailyResult(today)) return { initial: initialState(todaySeed, 'daily'), switchPrompt: false };
  return { initial: initialState(), switchPrompt: false };
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [startup] = useState(decideStartup);
  const [state, rawDispatch] = useReducer(reducer, startup.initial);
  const [selected, setSelected] = useState<DrugId | null>(null);
  const [dialog, setDialog] = useState<DialogKind | null>(null);
  const [scores, setScores] = useState<ScoreEntry[]>(() => loadScores());
  const [streak, setStreak] = useState<DailyStreak>(() => loadStreak());
  const [rankCounts, setRankCounts] = useState<number[]>(() => loadRankCounts());
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [pendingMode, setPendingMode] = useState<GameMode>('classic');
  const [bump, setBump] = useState(0);

  const requestNewGame = useCallback((mode: GameMode) => {
    setPendingMode(mode);
    setDialog('new-game');
  }, []);

  // Apply persisted sound preference once, and (on a new day with a non-daily run
  // in progress) offer to continue it or switch to today's Daily.
  useEffect(() => {
    setSoundEnabled(settings.sound);
    if (startup.switchPrompt) setDialog('switch-daily');
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
    saveLastDate(todayKey());
    const key = todayKey();
    if (state.mode === 'daily') {
      if (state.seed === dailySeed(key) && state.status === 'playing') saveDailyGame(key, state);
    } else if (state.status === 'playing') {
      saveModeGame(state); // per-mode slot so each run persists independently
    } else {
      clearModeGame(state.mode); // run ended — nothing to come back to
    }
  }, [state]);

  // Credit rank achievements (lifetime, once per game) as net worth climbs, and
  // fire the Kingpin popup the first time the top rank is reached. Keyed by a
  // mode:seed game signature persisted in storage, so reloads/resumes never
  // double-count or re-congratulate.
  useEffect(() => {
    const sig = `${state.mode}:${state.seed}`;
    const peakRank = rankIndexFor(state.peakNetWorth);
    const prev = loadRankCredit();
    const sameGame = prev?.sig === sig;
    let creditedUpTo = sameGame ? prev!.creditedUpTo : -1;
    let kingpinShown = sameGame ? prev!.kingpinShown : false;
    let changed = !sameGame;

    if (peakRank > creditedUpTo) {
      const counts = loadRankCounts();
      for (let i = creditedUpTo + 1; i <= peakRank; i++) counts[i] = (counts[i] ?? 0) + 1;
      saveRankCounts(counts);
      setRankCounts(counts.slice());
      creditedUpTo = peakRank;
      changed = true;
    }

    // Only Dynasty celebrates Kingpin with a popup — it's the endless mode's
    // climax. Classic/Daily end at day 31, where the game-over screen already
    // shows your peak rank, so a mid-run popup would just interrupt.
    if (state.mode === 'dynasty' && peakRank >= RANKS.length - 1 && !kingpinShown) {
      kingpinShown = true;
      changed = true;
      setDialog('kingpin');
    }

    if (changed) saveRankCredit({ sig, creditedUpTo, kingpinShown });
  }, [state.mode, state.seed, state.peakNetWorth]);

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
        // Held drugs count toward the final score (Option 1), valued at local price.
        const score = finalScore(state);
        setScores(
          addScore({
            score,
            day: state.day,
            status: state.status,
            mode: state.mode,
            date: Date.now(),
          }),
        );
        // If this run was today's daily and not already recorded, record it
        // (play-once) and update the win streak.
        const key = todayKey();
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
      rankCounts,
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
    [state, dispatch, selected, dialog, scores, streak, rankCounts, settings, toggleSound, pendingMode, requestNewGame, setCity, randomCity, bump],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
