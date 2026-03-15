import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface DeltaBadgeProps {
  value: number; // percentage delta; positive = growth
  className?: string;
}

const DeltaBadge = ({ value, className }: DeltaBadgeProps) => {
  const rounded = Math.round(value);

  if (Math.abs(rounded) <= 1) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-0.5 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md",
          "bg-muted/30 text-muted-foreground",
          className
        )}
      >
        <Minus size={8} /> stable
      </span>
    );
  }

  const isPositive = rounded > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md",
        isPositive
          ? "bg-emerald-500/15 text-emerald-400"
          : "bg-red-500/15 text-red-400",
        className
      )}
    >
      {isPositive ? <TrendingUp size={8} /> : <TrendingDown size={8} />}
      {isPositive ? "+" : ""}
      {rounded}%
    </span>
  );
};

export default DeltaBadge;
