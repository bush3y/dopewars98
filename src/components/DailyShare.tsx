import { ShareCard } from './ShareCard';
import { makeShareString, type ShareData } from '../game/daily';

/** Spoiler-free shareable daily result (Wordle-style). */
export function DailyShare({ data, streak = 0 }: { data: ShareData; streak?: number }) {
  return <ShareCard text={makeShareString(data, streak)} />;
}
