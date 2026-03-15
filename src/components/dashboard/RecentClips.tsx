import { Play } from "lucide-react";
import { TwitchClip } from "@/hooks/useTwitchStats";
import { Skeleton } from "@/components/ui/skeleton";

const RecentClips = ({
  clips,
  isLoading,
  onClipClick,
}: {
  clips: TwitchClip[];
  isLoading?: boolean;
  onClipClick?: (clip: TwitchClip) => void;
}) => {
  const fmtDuration = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.round(s % 60);
    return m > 0 ? `${m}m${sec.toString().padStart(2, "0")}s` : `${sec}s`;
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

  return (
    <div className="neo-card p-6 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold uppercase tracking-widest">Recent Clips</h3>
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
          Last 30 days · newest first
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "thin" }}>
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-44 flex flex-col gap-2">
              <Skeleton className="w-full h-24 rounded-lg" />
              <Skeleton className="h-3 w-full rounded" />
              <Skeleton className="h-3 w-16 rounded" />
            </div>
          ))
        ) : clips.length === 0 ? (
          <p className="text-xs font-mono text-muted-foreground py-2">No clips in the last 30 days</p>
        ) : (
          clips.map((clip) => {
            const thumb = clip.thumbnailUrl.replace("-preview-480x272.jpg", "-preview-320x180.jpg");
            return (
              <button
                key={clip.id}
                type="button"
                className="flex-shrink-0 w-44 flex flex-col gap-1.5 group text-left"
                onClick={() => onClipClick?.(clip)}
              >
                {/* Thumbnail */}
                <div className="relative w-full rounded-lg overflow-hidden border border-foreground/10 bg-muted" style={{ aspectRatio: "16/9" }}>
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={clip.title}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted" />
                  )}
                  {/* Play overlay */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 rounded-full bg-primary/90 flex items-center justify-center">
                      <Play size={14} className="text-white fill-white ml-0.5" />
                    </div>
                  </div>
                  {/* Duration badge */}
                  <span className="absolute bottom-1 right-1 text-[9px] font-mono text-white bg-black/75 px-1 py-0.5 rounded">
                    {fmtDuration(clip.duration)}
                  </span>
                </div>

                {/* Title */}
                <span
                  className="text-[11px] font-bold leading-tight line-clamp-2 group-hover:text-primary transition-colors"
                  title={clip.title}
                >
                  {clip.title}
                </span>

                {/* Meta */}
                <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                  <span className="text-primary font-bold">{clip.viewCount.toLocaleString()}v</span>
                  <span>{formatDate(clip.createdAt)}</span>
                </div>

                {clip.gameName && (
                  <span className="text-[10px] font-mono text-muted-foreground truncate">
                    {clip.gameName}
                  </span>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RecentClips;
