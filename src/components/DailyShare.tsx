import { useState } from 'react';
import { makeShareString, type ShareData } from '../game/daily';

/** Spoiler-free shareable result with copy-to-clipboard (Wordle-style). */
export function DailyShare({ data, streak = 0 }: { data: ShareData; streak?: number }) {
  const [copied, setCopied] = useState(false);
  const text = makeShareString(data, streak);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* clipboard may be unavailable; the text is shown for manual copy */
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="share">
      <pre className="share__text">{text}</pre>
      <button type="button" onClick={copy}>
        {copied ? 'Copied!' : 'Copy Result'}
      </button>
    </div>
  );
}
