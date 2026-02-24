type RequestLike = { method?: string };
type ResponseLike = {
  status: (code: number) => ResponseLike;
  setHeader: (name: string, value: string) => ResponseLike;
  send: (body: string) => void;
};

export default function handler(_req: RequestLike, res: ResponseLike) {
  res.status(410).setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="robots" content="noindex,nofollow" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Tour no longer available</title>
  </head>
  <body>
    <main>
      <h1>This tour is no longer available</h1>
      <p>This tour has been permanently removed.</p>
    </main>
  </body>
</html>`);
}
