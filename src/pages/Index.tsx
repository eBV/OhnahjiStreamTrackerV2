import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { Users, Eye, Clock, TrendingUp, Radio, BarChart3, ExternalLink } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import ChannelHeader from "@/components/dashboard/ChannelHeader";
import StatCard from "@/components/dashboard/StatCard";
import StreamChart from "@/components/dashboard/StreamChart";
import RecentStreams from "@/components/dashboard/RecentStreams";
import RecentClips from "@/components/dashboard/RecentClips";
import TopClips from "@/components/dashboard/TopClips";
import StreamSchedule from "@/components/dashboard/StreamSchedule";
import MilestoneTracker from "@/components/dashboard/MilestoneTracker";
import DeltaBadge from "@/components/dashboard/DeltaBadge";
import TimeFilter, { TimeFilterValue } from "@/components/dashboard/TimeFilter";
import ViewerSparkline from "@/components/dashboard/ViewerSparkline";
import { Skeleton } from "@/components/ui/skeleton";

import { useTwitchStats, TwitchStream, TwitchClip, TwitchStats } from "@/hooks/useTwitchStats";
import StreamModal from "@/components/dashboard/StreamModal";
import ClipModal from "@/components/dashboard/ClipModal";
import { useEventSub, EventSubUpdate } from "@/hooks/useEventSub";
import { useStickyHeader } from "@/hooks/useStickyHeader";

// ─── Stat calculation with 30-day contextual delta ───────────────────────────
function calculateStats(streams: TwitchStream[]) {
  if (!streams.length) {
    return { avgViewers: 0, peakViewers: 0, peakDate: "", totalHours: 0, viewDelta: 0 };
  }

  const now = Date.now();
  const ms30d = 30 * 24 * 60 * 60 * 1000;
  const streams30d = streams.filter((s) => now - new Date(s.createdAt).getTime() < ms30d);
  const refStreams = streams30d.length > 0 ? streams30d : streams;

  const totalViews = refStreams.reduce((s, v) => s + v.viewCount, 0);
  const avgViewers = Math.round(totalViews / refStreams.length);

  const peakStream = streams.reduce(
    (max, s) => (s.viewCount > max.viewCount ? s : max),
    streams[0]
  );
  const peakDate = new Date(peakStream.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const totalMinutes = refStreams.reduce((sum, s) => {
    const hm = s.duration.match(/(?:(\d+)h)?(?:(\d+)m)?/);
    if (!hm) return sum;
    return sum + (parseInt(hm[1] ?? "0") * 60) + parseInt(hm[2] ?? "0");
  }, 0);

  const lastViews = streams[0]?.viewCount ?? 0;
  const viewDelta =
    avgViewers > 0 && streams.length > 1
      ? ((lastViews - avgViewers) / avgViewers) * 100
      : 0;

  return {
    avgViewers,
    peakViewers: peakStream.viewCount,
    peakDate,
    totalHours: Math.round(totalMinutes / 60),
    viewDelta,
  };
}

// ─── Filter streams by time window ───────────────────────────────────────────
function filterStreamsByTime(streams: TwitchStream[], filter: TimeFilterValue): TwitchStream[] {
  if (filter === "last") return streams.slice(0, 1);
  if (filter === "all") return streams;
  const days = filter === "7d" ? 7 : 30;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const filtered = streams.filter((s) => new Date(s.createdAt).getTime() > cutoff);
  return filtered.length > 0 ? filtered : streams.slice(0, 1);
}

// ─── Component ───────────────────────────────────────────────────────────────
const Index = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useTwitchStats();

  const heroRef = useRef<HTMLDivElement>(null);
  const isSticky = useStickyHeader(heroRef);

  const [timeFilter, setTimeFilter] = useState<TimeFilterValue>("30d");
  const [selectedStream, setSelectedStream] = useState<TwitchStream | null>(null);
  const [selectedClip, setSelectedClip] = useState<TwitchClip | null>(null);

  // EventSub override state (real-time updates layered on top of polling)
  const [liveOverride, setLiveOverride] = useState<{
    isLive?: boolean;
    gameName?: string;
    title?: string;
  } | null>(null);

  const handleEventSubUpdate = useCallback(
    (update: EventSubUpdate) => {
      if (update.type === "stream.online") {
        setLiveOverride((prev) => ({ ...prev, isLive: true }));
        queryClient.invalidateQueries({ queryKey: ["twitch-stats"] });
      } else if (update.type === "stream.offline") {
        setLiveOverride({ isLive: false, gameName: "", title: "" });
      } else if (update.type === "channel.update") {
        setLiveOverride((prev) => ({
          ...prev,
          gameName: update.event.category_name as string | undefined,
          title: update.event.title as string | undefined,
        }));
      }
    },
    [queryClient]
  );

  const username = data?.user?.displayName?.toLowerCase() ?? "ohnahji";
  useEventSub(username, handleEventSubUpdate);

  // Merge EventSub real-time data with polling data
  const mergedData = useMemo((): TwitchStats | null => {
    if (!data) return null;
    if (!liveOverride) return data;
    const isLive = liveOverride.isLive ?? data.isLive;
    return {
      ...data,
      isLive,
      currentStream:
        isLive === false
          ? null
          : data.currentStream
          ? {
              ...data.currentStream,
              gameName: liveOverride.gameName ?? data.currentStream.gameName,
              title: liveOverride.title ?? data.currentStream.title,
            }
          : null,
    };
  }, [data, liveOverride]);

  const allStreams = mergedData?.recentStreams ?? [];
  const filteredStreams = useMemo(
    () => filterStreamsByTime(allStreams, timeFilter),
    [allStreams, timeFilter]
  );

  const stats = useMemo(() => calculateStats(allStreams), [allStreams]);

  const fmt = (n: number) => n.toLocaleString();

  const displayName = mergedData?.user?.displayName ?? "OHNAHJI";
  const isLive = mergedData?.isLive ?? false;
  const broadcasterType = mergedData?.user?.broadcasterType ?? "";

  // ─── Live viewer sparkline ───────────────────────────────────────────────
  const [viewerHistory, setViewerHistory] = useState<{ t: number; v: number }[]>([]);
  const currentViewerCount = mergedData?.currentStream?.viewerCount;

  useEffect(() => {
    if (!isLive || currentViewerCount == null) return;
    setViewerHistory((prev) => {
      const point = { t: Date.now(), v: currentViewerCount };
      // Keep last 30 data points
      const next = [...prev, point].slice(-30);
      return next;
    });
  }, [isLive, currentViewerCount]);

  // Reset sparkline when going offline
  useEffect(() => {
    if (!isLive) setViewerHistory([]);
  }, [isLive]);

  // ─── Dynamic hero metric ordering ──────────────────────────────────────────
  type MetricKey = "followers" | "avgViews" | "peakViews" | "hours" | "status";
  const metricDeltas: Record<MetricKey, number> = {
    followers: 0,
    avgViews: Math.abs(stats.viewDelta),
    peakViews: 0,
    hours: 0,
    status: isLive ? 100 : 0,
  };
  const metricOrder = Object.fromEntries(
    (Object.keys(metricDeltas) as MetricKey[])
      .sort((a, b) => metricDeltas[b] - metricDeltas[a])
      .map((key, i) => [key, i])
  ) as Record<MetricKey, number>;

  // ─── Skeleton helper (zero-CLS: fixed height matches loaded content) ────────
  const StatSkeleton = () => (
    <div className="neo-card p-6 h-28 flex flex-col justify-between">
      <Skeleton className="h-3 w-20 rounded" />
      <Skeleton className="h-9 w-24 rounded" />
      <Skeleton className="h-2 w-16 rounded" />
    </div>
  );

  return (
    <div
      className="min-h-screen bg-background"
      data-live={isLive ? "true" : "false"}
    >
      {/* ── Sticky glass pill ───────────────────────────────────────────────── */}
      <div
        className="sticky-pill fixed z-50 flex items-center gap-3 px-5 py-2"
        style={{
          top: "12px",
          left: "50%",
          transform: `translateX(-50%) translateY(${isSticky ? "0px" : "-14px"})`,
          opacity: isSticky ? 1 : 0,
          pointerEvents: isSticky ? "auto" : "none",
          transition: "opacity 0.3s ease, transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <span className="text-sm font-bold tracking-tight">{displayName.toUpperCase()}</span>
        {isLive && (
          <span className="neo-badge bg-accent text-accent-foreground text-[10px] animate-pulse-glow">
            ● LIVE
          </span>
        )}
        <a
          href={`https://twitch.tv/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          <ExternalLink size={12} />
        </a>
      </div>

      {/* ── Top bar (dissolves on scroll) ─────────────────────────────────── */}
      <div
        className="glass-card mx-0 rounded-none border-x-0 border-t-0"
        style={{
          opacity: isSticky ? 0 : 1,
          pointerEvents: isSticky ? "none" : "auto",
          transition: "opacity 0.3s ease",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio size={18} className="text-primary" />
            <span className="font-bold text-sm uppercase tracking-widest">StreamTracker</span>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 size={14} className="text-muted-foreground" />
            <span className="text-xs font-mono text-muted-foreground">Dashboard v4.0</span>
            {isLive && (
              <span className="neo-badge bg-primary text-primary-foreground text-[10px] animate-pulse-glow ml-2">
                ● LIVE
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Main bento grid ───────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto p-4">
        <div className="bento-grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6">

          {/* Hero — ref attached directly to wrapper div */}
          <div ref={heroRef} className="md:col-span-4 lg:col-span-6">
            <ChannelHeader
              isLive={isLive}
              displayName={displayName}
              profileImageUrl={mergedData?.user?.profileImageUrl}
              currentViewers={mergedData?.currentStream?.viewerCount}
              streamTitle={mergedData?.currentStream?.title}
              broadcasterType={broadcasterType}
              isLoading={isLoading}
            />
          </div>

          {/* ── Stats row ─────────────────────────────────────────────────── */}
          {isLoading ? (
            <>
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="md:col-span-1 lg:col-span-1">
                  <StatSkeleton />
                </div>
              ))}
              <div className="md:col-span-4 lg:col-span-2">
                <StatSkeleton />
              </div>
            </>
          ) : (
            <>
              <div className="md:col-span-1 lg:col-span-1" style={{ order: metricOrder.followers }}>
                <StatCard
                  label="Followers"
                  value={fmt(mergedData?.followers ?? 0)}
                  variant="pink"
                  icon={<Users size={18} />}
                />
              </div>
              <div className="md:col-span-1 lg:col-span-1" style={{ order: metricOrder.avgViews }}>
                <StatCard
                  label="Avg Views"
                  value={fmt(stats.avgViewers)}
                  sublabel="30-day rolling"
                  variant="yellow"
                  icon={<Eye size={18} />}
                  delta={stats.viewDelta !== 0 ? <DeltaBadge value={stats.viewDelta} /> : undefined}
                />
              </div>
              <div className="md:col-span-1 lg:col-span-1" style={{ order: metricOrder.peakViews }}>
                <StatCard
                  label="Peak Views"
                  value={fmt(stats.peakViewers)}
                  sublabel={stats.peakDate}
                  icon={<TrendingUp size={18} />}
                />
              </div>
              <div className="md:col-span-1 lg:col-span-1" style={{ order: metricOrder.hours }}>
                <StatCard
                  label="Hours Streamed"
                  value={`${stats.totalHours}h`}
                  sublabel="30-day window"
                  variant="maroon"
                  icon={<Clock size={18} />}
                />
              </div>
              <div className="md:col-span-4 lg:col-span-2" style={{ order: metricOrder.status }}>
                <StatCard
                  label="Status"
                  value={isLive ? "LIVE NOW" : "OFFLINE"}
                  sublabel={isLive ? (mergedData?.currentStream?.gameName ?? "") : "Check back later"}
                  variant={isLive ? "pink" : "default"}
                  icon={<Radio size={18} />}
                  footer={
                    isLive && viewerHistory.length >= 2
                      ? <ViewerSparkline history={viewerHistory} />
                      : undefined
                  }
                />
              </div>
            </>
          )}

          {/* ── Time-Scrub filter ─────────────────────────────────────────── */}
          <div className="md:col-span-4 lg:col-span-6">
            <TimeFilter
              value={timeFilter}
              onChange={setTimeFilter}
              streamCount={filteredStreams.length}
            />
          </div>

          {/* ── Chart + Top Clips ─────────────────────────────────────────── */}
          <div className="md:col-span-4 lg:col-span-4">
            {isLoading ? (
              <div className="neo-card p-6 min-h-[280px] flex flex-col gap-4">
                <Skeleton className="h-4 w-40 rounded" />
                <Skeleton className="flex-1 rounded" style={{ minHeight: 200 }} />
              </div>
            ) : (
              <StreamChart recentStreams={filteredStreams} />
            )}
          </div>
          <div className="md:col-span-4 lg:col-span-2">
            <TopClips clips={mergedData?.topClips ?? []} isLoading={isLoading} onClipClick={setSelectedClip} />
          </div>

          {/* ── Recent Clips (newest first) ───────────────────────────────── */}
          <div className="md:col-span-4 lg:col-span-6">
            <RecentClips clips={mergedData?.recentClips ?? []} isLoading={isLoading} onClipClick={setSelectedClip} />
          </div>

          {/* ── Recent Streams + Schedule + Milestones ────────────────────── */}
          <div className="md:col-span-4 lg:col-span-4">
            <RecentStreams streams={filteredStreams} isLoading={isLoading} onStreamClick={setSelectedStream} />
          </div>
          <div className="md:col-span-4 lg:col-span-2 flex flex-col gap-4">
            <StreamSchedule schedule={mergedData?.schedule ?? []} />
            <MilestoneTracker followers={mergedData?.followers ?? 0} />
          </div>
        </div>
      </div>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      {selectedStream && (
        <StreamModal
          stream={selectedStream}
          username={username}
          onClose={() => setSelectedStream(null)}
        />
      )}
      {selectedClip && (
        <ClipModal
          clip={selectedClip}
          onClose={() => setSelectedClip(null)}
        />
      )}

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <div className="glass-card mx-4 mb-4 max-w-7xl lg:mx-auto rounded-xl">
        <div className="p-4 flex items-center justify-between text-xs font-mono text-muted-foreground">
          <span>
            {error
              ? "⚠ Error loading data — check API credentials"
              : isLive
              ? "⬤ EventSub connected · real-time updates active"
              : "Polling Twitch API · refreshes every 60s"}
          </span>
          <span>Built for OHNAHJI</span>
        </div>
      </div>
    </div>
  );
};

export default Index;
