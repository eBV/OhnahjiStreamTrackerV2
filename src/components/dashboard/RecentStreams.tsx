import { TwitchStream } from "@/hooks/useTwitchStats";
import { Skeleton } from "@/components/ui/skeleton";

const RecentStreams = ({
  streams,
  isLoading,
  onStreamClick,
}: {
  streams: TwitchStream[];
  isLoading?: boolean;
  onStreamClick?: (stream: TwitchStream) => void;
}) => {
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const truncate = (t: string, max = 40) =>
    t.length <= max ? t : t.substring(0, max) + "...";

  const thumbSrc = (url: string) =>
    url.replace("%{width}", "160").replace("%{height}", "90");

  return (
    <div className="neo-card p-6 h-full flex flex-col">
      <h3 className="text-sm font-bold uppercase tracking-widest mb-4">Recent Streams</h3>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs font-mono">
          <thead>
            <tr className="border-b-2 border-foreground/20">
              <th className="text-left py-2 font-bold uppercase tracking-wider hidden lg:table-cell w-20">
                Thumb
              </th>
              <th className="text-left py-2 font-bold uppercase tracking-wider">Date</th>
              <th className="text-left py-2 font-bold uppercase tracking-wider hidden md:table-cell">
                Title
              </th>
              <th className="text-right py-2 font-bold uppercase tracking-wider">Duration</th>
              <th className="text-right py-2 font-bold uppercase tracking-wider">Views</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-muted">
                  <td className="py-3 hidden lg:table-cell">
                    <Skeleton className="h-9 w-16 rounded bg-muted-foreground/20" />
                  </td>
                  <td className="py-3">
                    <Skeleton className="h-4 w-20 bg-muted-foreground/20" />
                  </td>
                  <td className="py-3 hidden md:table-cell">
                    <Skeleton className="h-4 w-32 bg-muted-foreground/20" />
                  </td>
                  <td className="py-3 text-right">
                    <Skeleton className="h-4 w-12 ml-auto bg-muted-foreground/20" />
                  </td>
                  <td className="py-3 text-right">
                    <Skeleton className="h-4 w-10 ml-auto bg-muted-foreground/20" />
                  </td>
                </tr>
              ))
            ) : streams.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-muted-foreground">
                  No recent streams found
                </td>
              </tr>
            ) : (
              streams.slice(0, 8).map((s) => {
                const thumb = s.thumbnailUrl ? thumbSrc(s.thumbnailUrl) : null;
                return (
                  <tr
                    key={s.id}
                    className={`border-b border-muted hover:bg-muted/30 transition-colors${onStreamClick ? " cursor-pointer" : ""}`}
                    onClick={() => onStreamClick?.(s)}
                  >
                    <td className="py-2 hidden lg:table-cell">
                      <div className="relative w-16 h-9 rounded overflow-hidden border border-foreground/10 group/thumb">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={s.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted" />
                        )}
                        {onStreamClick && (
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-[8px] font-bold text-white uppercase tracking-wider">Watch</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3">
                      <div className="text-foreground">{formatDate(s.createdAt)}</div>
                      <div className="text-muted-foreground text-[10px] md:hidden truncate max-w-[120px]">
                        {truncate(s.title, 25)}
                      </div>
                    </td>
                    <td className="py-3 hidden md:table-cell">
                      <span className="text-muted-foreground" title={s.title}>
                        {truncate(s.title)}
                      </span>
                    </td>
                    <td className="py-3 text-right text-accent">{s.duration}</td>
                    <td className="py-3 text-right text-primary font-bold">
                      {s.viewCount.toLocaleString()}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentStreams;
