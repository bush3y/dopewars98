import { useState } from 'react';
import { makeShareString, type ShareData } from '../game/daily';

/** Spoiler-free shareable result (Wordle-style): native share where available,
 *  with copy-to-clipboard as a fallback / secondary action. */
export function DailyShare({ data, streak = 0 }: { data: ShareData; streak?: number }) {
  const [copied, setCopied] = useState(false);
  const text = makeShareString(data, streak);
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* clipboard may be unavailable; the text is shown for manual copy */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const share = async () => {
    try {
      await navigator.share({ text });
    } catch {
      /* user dismissed the share sheet, or it failed — nothing to do */
    }
  };

  return (
    <div className="share">
      <pre className="share__text">{text}</pre>
      <div className="share__actions">
        {canShare && (
          <button type="button" onClick={share}>Share</button>
        )}
        <button type="button" onClick={copy}>
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  );
}
