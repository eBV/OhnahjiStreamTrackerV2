import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";

export type TimeFilterValue = "last" | "7d" | "30d" | "all";

const CHIPS: { label: string; value: TimeFilterValue; days: number }[] = [
  { label: "Last Stream", value: "last", days: 1 },
  { label: "7 Days", value: "7d", days: 7 },
  { label: "30 Days", value: "30d", days: 30 },
  { label: "All", value: "all", days: 90 },
];

interface TimeFilterProps {
  value: TimeFilterValue;
  onChange: (value: TimeFilterValue) => void;
  streamCount?: number;
}

const TimeFilter = ({ value, onChange, streamCount }: TimeFilterProps) => {
  const [sliderVal, setSliderVal] = useState(30);

  // Sync slider position when a chip is selected
  useEffect(() => {
    const chip = CHIPS.find((c) => c.value === value);
    if (chip) setSliderVal(chip.days);
  }, [value]);

  const handleSlider = useCallback(
    (days: number) => {
      setSliderVal(days);
      if (days <= 1) onChange("last");
      else if (days <= 7) onChange("7d");
      else if (days <= 30) onChange("30d");
      else onChange("all");
    },
    [onChange]
  );

  const sliderProgress = ((sliderVal - 1) / (90 - 1)) * 100;

  return (
    <div className="glass-card p-4 space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted-foreground shrink-0">
          Time Range
        </span>
        <div className="flex gap-2 flex-wrap">
          {CHIPS.map((chip) => (
            <button
              key={chip.value}
              onClick={() => onChange(chip.value)}
              className={cn(
                "neo-badge text-[10px] cursor-pointer transition-all",
                value === chip.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {chip.label}
            </button>
          ))}
        </div>
        {streamCount != null && (
          <span className="ml-auto text-xs font-mono text-muted-foreground">
            {streamCount} stream{streamCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Tactile scrub slider */}
      <div className="relative px-1">
        {/* Track fill */}
        <div
          className="absolute top-1/2 left-1 right-1 h-[2px] -translate-y-1/2 rounded-full bg-muted overflow-hidden pointer-events-none"
          aria-hidden
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-100"
            style={{ width: `${sliderProgress}%` }}
          />
        </div>
        <input
          type="range"
          min={1}
          max={90}
          value={sliderVal}
          onChange={(e) => handleSlider(Number(e.target.value))}
          className="time-scrub-slider relative w-full"
          aria-label={`Time range: ${sliderVal} days`}
        />
        <div className="flex justify-between text-[9px] font-mono text-muted-foreground/50 mt-1 px-1 pointer-events-none select-none">
          <span>1d</span>
          <span>7d</span>
          <span>30d</span>
          <span>90d</span>
        </div>
      </div>
    </div>
  );
};

export default TimeFilter;
