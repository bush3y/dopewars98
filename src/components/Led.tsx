type LedColor = 'green' | 'red' | 'yellow';

interface LedProps {
  /** Pre-formatted value, e.g. "2,000". */
  value: string;
  color: LedColor;
  /** Width of the black readout, in characters, used to size the ghost field. */
  digits?: number;
}

/**
 * A single 7-segment LED readout: a sunken black bar with faint "off" segments
 * (the ghost layer) and the bright right-aligned value on top. Uses DSEG7.
 */
export function Led({ value, color, digits = 9 }: LedProps) {
  // The ghost shows every segment lit; "8" is all-segments for DSEG7. Group with
  // commas so the dim backdrop lines up with comma-formatted values.
  const ghost = '8'.repeat(digits).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return (
    <div className={`led led--${color}`}>
      <span className="led__ghost" aria-hidden>
        {ghost}
      </span>
      <span className="led__value">{value}</span>
    </div>
  );
}
