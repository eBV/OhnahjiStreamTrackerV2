import { Play } from "lucide-react";
import { TwitchClip } from "@/hooks/useTwitchStats";
import { Skeleton } from "@/components/ui/skeleton";

const TopClips = ({
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

  return (
    <div className="neo-card p-6 h-full flex flex-col">
      <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Top Clips</h3>
      <div className="flex flex-col gap-3 flex-1">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3 items-center">
              <Skeleton className="w-20 h-12 rounded-lg flex-shrink-0" />
              <div className="flex flex-col gap-1 flex-1">
                <Skeleton className="h-3 w-full rounded" />
                <Skeleton className="h-3 w-16 rounded" />
              </div>
            </div>
          ))
        ) : clips.length === 0 ? (
          <p className="text-xs font-mono text-muted-foreground">No clips found</p>
        ) : (
          clips.map((clip) => {
            const thumb = clip.thumbnailUrl.replace("-preview-480x272.jpg", "-preview-160x90.jpg");
            return (
              <button
                key={clip.id}
                type="button"
                className="flex gap-3 items-center group hover:opacity-80 transition-opacity text-left w-full"
                onClick={() => onClipClick?.(clip)}
              >
                <div className="relative w-20 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted border border-foreground/10">
                  {thumb ? (
                    <img
                      src={thumb}
                      alt={clip.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted" />
                  )}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play size={14} className="text-white fill-white" />
                  </div>
                  <span className="absolute bottom-0.5 right-1 text-[9px] font-mono text-white bg-black/70 px-0.5 rounded">
                    {fmtDuration(clip.duration)}
                  </span>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-xs font-bold leading-tight truncate" title={clip.title}>
                    {clip.title}
                  </span>
                  <span className="text-[10px] font-mono text-primary mt-0.5">
                    {clip.viewCount.toLocaleString()} views
                  </span>
                  {clip.gameName && (
                    <span className="text-[10px] font-mono text-muted-foreground truncate">
                      {clip.gameName}
                    </span>
                  )}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TopClips;
