type RequestLike = { method?: string };
type ResponseLike = {
  status: (code: number) => ResponseLike;
  setHeader: (name: string, value: string) => ResponseLike;
  send: (body: string) => void;
};

export default function handler(_req: RequestLike, res: ResponseLike) {
  res
    .status(404)
    .setHeader("Content-Type", "text/html; charset=utf-8")
    .setHeader("X-Robots-Tag", "noindex, nofollow")
    .send(`<!doctype html><html><head><meta charset="utf-8" /><meta name="robots" content="noindex,nofollow" /><title>Not found</title></head><body><h1>Not found</h1></body></html>`);
}
