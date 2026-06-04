import { describe, expect, it } from "vitest";

import handler from "./gone";

const createRes = () => {
  const res: any = {
    statusCode: 200,
    headers: {} as Record<string, string>,
    body: "",
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    setHeader(name: string, value: string) {
      this.headers[name] = value;
      return this;
    },
    send(body: string) {
      this.body = body;
    },
  };

  return res;
};

describe("/api/gone", () => {
  it("returns HTTP 410 for invalid or removed tour rewrites", () => {
    const res = createRes();

    handler({}, res);

    expect(res.statusCode).toBe(410);
    expect(res.headers["Content-Type"]).toContain("text/html");
    expect(res.body).toContain("This tour is no longer available");
  });
});
