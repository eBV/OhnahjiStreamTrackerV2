import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");

  if (req.method === "OPTIONS") return res.status(200).end();

  const { session_id, username } = req.query;

  if (!session_id || !username || typeof session_id !== "string" || typeof username !== "string") {
    return res.status(400).json({ error: "session_id and username are required" });
  }

  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(500).json({ error: "Twitch credentials not configured" });
  }

  try {
    // Get app access token
    const tokenRes = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "client_credentials",
      }),
    });
    if (!tokenRes.ok) throw new Error(`Token request failed: ${tokenRes.status}`);
    const { access_token } = (await tokenRes.json()) as { access_token: string };

    const headers = {
      "Client-ID": clientId,
      Authorization: `Bearer ${access_token}`,
      "Content-Type": "application/json",
    };

    // Resolve broadcaster user ID
    const userRes = await fetch(
      `https://api.twitch.tv/helix/users?login=${encodeURIComponent(username)}`,
      { headers }
    );
    if (!userRes.ok) throw new Error(`User lookup failed: ${userRes.status}`);
    const userData = (await userRes.json()) as { data: { id: string }[] };
    const userId = userData.data?.[0]?.id;

    if (!userId) {
      return res.status(404).json({ error: `Twitch user "${username}" not found` });
    }

    // Create EventSub subscriptions for this WebSocket session
    const transport = { method: "websocket", session_id };
    const subscriptions = [
      { type: "stream.online", version: "1", condition: { broadcaster_user_id: userId } },
      { type: "stream.offline", version: "1", condition: { broadcaster_user_id: userId } },
      { type: "channel.update", version: "2", condition: { broadcaster_user_id: userId } },
    ];

    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        fetch("https://api.twitch.tv/helix/eventsub/subscriptions", {
          method: "POST",
          headers,
          body: JSON.stringify({ ...sub, transport }),
        }).then((r) => r.json())
      )
    );

    return res.status(200).json({
      success: true,
      subscriptions: results.map((r, i) => ({
        type: subscriptions[i].type,
        status: r.status,
        data: r.status === "fulfilled" ? r.value : null,
      })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return res.status(500).json({ error: message });
  }
}
