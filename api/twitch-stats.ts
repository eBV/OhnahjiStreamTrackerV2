import type { VercelRequest, VercelResponse } from "@vercel/node";

interface TwitchTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface TwitchUser {
  id: string;
  login: string;
  display_name: string;
  description: string;
  profile_image_url: string;
  broadcaster_type: string; // "affiliate" | "partner" | ""
}

interface TwitchStream {
  id: string;
  title: string;
  viewer_count: number;
  game_name: string;
  started_at: string;
}

interface TwitchVideo {
  id: string;
  title: string;
  view_count: number;
  duration: string;
  created_at: string;
  thumbnail_url: string;
  game_id: string;
}

interface TwitchClip {
  id: string;
  title: string;
  view_count: number;
  thumbnail_url: string;
  game_id: string;
  duration: number;
  url: string;
  created_at: string;
}

interface TwitchScheduleSegment {
  id: string;
  start_time: string;
  end_time: string;
  title: string;
  canceled_until: string | null;
  is_recurring: boolean;
  category: { id: string; name: string } | null;
}

interface TwitchScheduleResponse {
  data?: {
    segments: TwitchScheduleSegment[] | null;
  };
}

interface TwitchGame {
  id: string;
  name: string;
}

async function getAccessToken(
  clientId: string,
  clientSecret: string
): Promise<string> {
  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
    }),
  });
  if (!res.ok) throw new Error(`Token request failed: ${res.status}`);
  const data = (await res.json()) as TwitchTokenResponse;
  return data.access_token;
}

/** Convert Twitch duration string (e.g. "3h24m12s") to "3h24m" */
function formatDuration(duration: string): string {
  const match = duration.match(/(?:(\d+)h)?(?:(\d+)m)?(?:\d+s)?/);
  if (!match) return duration;
  const hours = match[1] ? `${match[1]}h` : "";
  const mins = match[2] ? `${match[2]}m` : "";
  return `${hours}${mins}` || "0m";
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  const username = process.env.TWITCH_USERNAME ?? "ohnahji";

  if (!clientId || !clientSecret) {
    return res
      .status(500)
      .json({ error: "Twitch credentials not configured. Set TWITCH_CLIENT_ID and TWITCH_CLIENT_SECRET." });
  }

  try {
    const token = await getAccessToken(clientId, clientSecret);

    const headers = {
      "Client-ID": clientId,
      Authorization: `Bearer ${token}`,
    };

    // Fetch user info first (need broadcaster_id for all subsequent calls)
    const userRes = await fetch(
      `https://api.twitch.tv/helix/users?login=${username}`,
      { headers }
    );
    if (!userRes.ok) throw new Error(`User fetch failed: ${userRes.status}`);
    const userData = (await userRes.json()) as { data: TwitchUser[] };
    const user = userData.data?.[0];

    if (!user) {
      return res.status(404).json({ error: `Twitch user "${username}" not found` });
    }

    // Fetch followers, live stream, VODs, clips, and schedule in parallel
    const [followersRes, streamsRes, videosRes, clipsRes, scheduleRes] = await Promise.all([
      fetch(
        `https://api.twitch.tv/helix/channels/followers?broadcaster_id=${user.id}`,
        { headers }
      ),
      fetch(
        `https://api.twitch.tv/helix/streams?user_id=${user.id}`,
        { headers }
      ),
      fetch(
        `https://api.twitch.tv/helix/videos?user_id=${user.id}&type=archive&first=20`,
        { headers }
      ),
      fetch(
        `https://api.twitch.tv/helix/clips?broadcaster_id=${user.id}&first=3`,
        { headers }
      ),
      fetch(
        `https://api.twitch.tv/helix/schedule?broadcaster_id=${user.id}&first=8`,
        { headers }
      ),
    ]);

    const [followersData, streamsData, videosData, clipsData] = await Promise.all([
      followersRes.json() as Promise<{ total: number }>,
      streamsRes.json() as Promise<{ data: TwitchStream[] }>,
      videosRes.json() as Promise<{ data: TwitchVideo[] }>,
      clipsRes.json() as Promise<{ data: TwitchClip[] }>,
    ]);

    // Schedule returns 404 if not configured — handle gracefully
    let scheduleData: TwitchScheduleResponse = {};
    if (scheduleRes.ok) {
      scheduleData = (await scheduleRes.json()) as TwitchScheduleResponse;
    }

    const liveStream = streamsData.data?.[0] ?? null;
    const videos = videosData.data ?? [];
    const clips = clipsData.data ?? [];
    const scheduleSegments = scheduleData.data?.segments ?? [];

    // Batch-resolve game names for VODs + clips
    const allGameIds = [
      ...videos.map((v) => v.game_id),
      ...clips.map((c) => c.game_id),
    ];
    const uniqueGameIds = [...new Set(allGameIds.filter(Boolean))];
    let gameMap: Record<string, string> = {};
    if (uniqueGameIds.length > 0) {
      const gamesUrl =
        `https://api.twitch.tv/helix/games?` +
        uniqueGameIds.map((id) => `id=${encodeURIComponent(id)}`).join("&");
      const gamesRes = await fetch(gamesUrl, { headers });
      if (gamesRes.ok) {
        const gamesData = (await gamesRes.json()) as { data: TwitchGame[] };
        gameMap = Object.fromEntries(
          (gamesData.data ?? []).map((g) => [g.id, g.name])
        );
      }
    }

    const recentStreams = videos.map((v) => ({
      id: v.id,
      title: v.title,
      viewCount: v.view_count,
      duration: formatDuration(v.duration),
      createdAt: v.created_at,
      thumbnailUrl: v.thumbnail_url,
      gameName: gameMap[v.game_id] ?? undefined,
    }));

    const topClips = clips.map((c) => ({
      id: c.id,
      title: c.title,
      viewCount: c.view_count,
      thumbnailUrl: c.thumbnail_url,
      gameName: gameMap[c.game_id] ?? undefined,
      duration: c.duration,
      url: c.url,
      createdAt: c.created_at,
    }));

    const schedule = (scheduleSegments ?? [])
      .filter((s) => !s.canceled_until)
      .map((s) => ({
        id: s.id,
        startTime: s.start_time,
        endTime: s.end_time,
        title: s.title,
        isRecurring: s.is_recurring,
        categoryName: s.category?.name ?? null,
      }));

    return res.status(200).json({
      followers: followersData.total ?? 0,
      isLive: !!liveStream,
      currentStream: liveStream
        ? {
            title: liveStream.title,
            viewerCount: liveStream.viewer_count,
            gameName: liveStream.game_name,
            startedAt: liveStream.started_at,
          }
        : null,
      recentStreams,
      topClips,
      schedule,
      user: {
        displayName: user.display_name,
        profileImageUrl: user.profile_image_url,
        description: user.description,
        broadcasterType: user.broadcaster_type,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
}
