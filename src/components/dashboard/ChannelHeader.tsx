import { ExternalLink } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ChannelHeaderProps {
  isLive: boolean;
  displayName: string;
  profileImageUrl?: string;
  currentViewers?: number;
  streamTitle?: string;
  broadcasterType?: string; // "affiliate" | "partner" | ""
  isLoading?: boolean;
}

const ChannelHeader = ({
  isLive,
  displayName,
  profileImageUrl,
  currentViewers,
  streamTitle,
  broadcasterType,
  isLoading,
}: ChannelHeaderProps) => {
  const isAffiliate = broadcasterType === "affiliate";
  const isPartner = broadcasterType === "partner";

  return (
    <div
      className="hero-card neo-card-pink p-6 flex items-center gap-4"
      data-live={isLive ? "true" : "false"}
    >
      <div
        className="w-16 h-16 md:w-20 md:h-20 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0 overflow-hidden"
        style={{ border: "3px solid black" }}
      >
        {isLoading ? (
          <Skeleton className="w-full h-full" />
        ) : profileImageUrl ? (
          <img
            src={profileImageUrl}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-3xl md:text-4xl font-bold">
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          {isLoading ? (
            <Skeleton className="h-8 w-32" />
          ) : (
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {displayName.toUpperCase()}
            </h1>
          )}
          {!isLoading && isPartner && (
            <span
              className="neo-badge text-[10px] font-bold"
              style={{ background: "#9147ff", color: "#fff", border: "1.5px solid rgba(255,255,255,0.2)" }}
            >
              ✓ PARTNER
            </span>
          )}
          {!isLoading && isAffiliate && (
            <span
              className="neo-badge text-[10px] font-bold"
              style={{ background: "#f0a500", color: "#000", border: "1.5px solid rgba(0,0,0,0.15)" }}
            >
              ★ AFFILIATE
            </span>
          )}
          {isLive && (
            <span className="neo-badge bg-accent text-accent-foreground text-[10px] animate-pulse-glow">
              ● LIVE
              {currentViewers ? ` (${currentViewers.toLocaleString()} viewers)` : ""}
            </span>
          )}
        </div>
        {isLoading ? (
          <Skeleton className="h-4 w-40 mt-1" />
        ) : (
          <p className="text-xs md:text-sm opacity-80 mt-1 font-mono truncate">
            {isLive && streamTitle
              ? streamTitle
              : `twitch.tv/${displayName.toLowerCase()}`}
          </p>
        )}
      </div>

      <a
        href={`https://twitch.tv/${displayName.toLowerCase()}`}
        target="_blank"
        rel="noopener noreferrer"
        className="neo-badge bg-accent text-accent-foreground flex items-center gap-1 hover:bg-primary hover:text-primary-foreground transition-colors shrink-0"
      >
        <ExternalLink size={12} /> VISIT
      </a>
    </div>
  );
};

export default ChannelHeader;
