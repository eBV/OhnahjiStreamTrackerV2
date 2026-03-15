import { useQuery } from "@tanstack/react-query";

export interface TwitchStream {
  id: string;
  title: string;
  viewCount: number;
  duration: string;
  createdAt: string;
  thumbnailUrl: string;
  gameName?: string;
}

export interface TwitchClip {
  id: string;
  title: string;
  viewCount: number;
  thumbnailUrl: string;
  gameName?: string;
  duration: number;
  url: string;
  createdAt: string;
}

export interface TwitchScheduleSegment {
  id: string;
  startTime: string;
  endTime: string;
  title: string;
  isRecurring: boolean;
  categoryName: string | null;
}

export interface TwitchStats {
  followers: number;
  isLive: boolean;
  currentStream: {
    title: string;
    viewerCount: number;
    gameName: string;
    startedAt: string;
  } | null;
  recentStreams: TwitchStream[];
  topClips: TwitchClip[];
  recentClips: TwitchClip[];
  schedule: TwitchScheduleSegment[];
  user: {
    displayName: string;
    profileImageUrl: string;
    description: string;
    broadcasterType: string;
  } | null;
}

async function fetchTwitchStats(): Promise<TwitchStats> {
  const res = await fetch("/api/twitch-stats");
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Network error" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export function useTwitchStats() {
  return useQuery({
    queryKey: ["twitch-stats"],
    queryFn: fetchTwitchStats,
    refetchInterval: 60000,
    staleTime: 30000,
  });
}
