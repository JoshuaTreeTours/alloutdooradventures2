type RequestLike = {
  method?: string;
  headers?: Record<string, string | string[] | undefined>;
};

type ResponseLike = {
  status: (code: number) => ResponseLike;
  setHeader: (name: string, value: string) => ResponseLike;
  json: (body: unknown) => void;
};

const getHeader = (req: RequestLike, name: string) => {
  const value = req.headers?.[name] ?? req.headers?.[name.toLowerCase()];
  return Array.isArray(value) ? value[0] : value;
};

const isAuthorizedCronRequest = (req: RequestLike) => {
  const cronSecret = process.env.CRON_SECRET?.trim();
  if (!cronSecret) return true;

  const authHeader = getHeader(req, "authorization") ?? "";
  return authHeader === `Bearer ${cronSecret}`;
};

export default async function handler(req: RequestLike, res: ResponseLike) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method && req.method !== "GET" && req.method !== "POST") {
    res.status(405).json({ ok: false, error: "method not allowed" });
    return;
  }

  if (!isAuthorizedCronRequest(req)) {
    res.status(401).json({ ok: false, error: "unauthorized" });
    return;
  }

  const deployHookUrl = process.env.MERCHANT_FEED_REFRESH_DEPLOY_HOOK_URL;
  if (!deployHookUrl) {
    res.status(500).json({
      ok: false,
      error:
        "MERCHANT_FEED_REFRESH_DEPLOY_HOOK_URL is required for scheduled merchant commercial refresh",
    });
    return;
  }

  const response = await fetch(deployHookUrl, { method: "POST" });
  if (!response.ok) {
    res.status(502).json({
      ok: false,
      error: `deploy hook failed with HTTP ${response.status}`,
    });
    return;
  }

  res.status(202).json({
    ok: true,
    cadence: "weekly",
    nextStep:
      "Vercel deploy hook accepted; production build regenerates data/merchantFeed.csv and then runs merchant commercial parity audit.",
  });
}
