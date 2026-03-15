import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string;
  sublabel?: string;
  variant?: "default" | "pink" | "yellow" | "maroon";
  icon?: ReactNode;
  delta?: ReactNode; // optional contextual delta badge
  footer?: ReactNode; // optional footer slot (e.g. viewer sparkline)
  className?: string;
}

const variantClasses: Record<NonNullable<StatCardProps["variant"]>, string> = {
  default: "neo-card",
  pink: "neo-card-pink",
  yellow: "neo-card-yellow",
  maroon: "neo-card-maroon",
};

const StatCard = ({
  label,
  value,
  sublabel,
  variant = "default",
  icon,
  delta,
  footer,
  className = "",
}: StatCardProps) => (
  <div
    className={`${variantClasses[variant]} p-6 flex flex-col justify-between h-full min-h-[7rem] ${className}`}
  >
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-bold uppercase tracking-widest opacity-70">{label}</span>
      {icon && <span className="text-lg opacity-70">{icon}</span>}
    </div>
    <div className="stat-value text-3xl md:text-4xl mb-1">{value}</div>
    <div className="flex items-center gap-2 mt-1">
      {sublabel && <span className="text-xs opacity-60 font-mono">{sublabel}</span>}
      {delta}
    </div>
    {footer && <div className="mt-3">{footer}</div>}
  </div>
);

export default StatCard;
