import { rateLimit, ipMap } from "./rateLimit";

describe("rateLimit", () => {
  function mockRequest(ip: string = "1.2.3.4", host: string = "localhost") {
    return {
      headers: {
        get: (key: string) => {
          if (key === "x-forwarded-for") return ip;
          if (key === "host") return host;
          return null;
        },
      },
    } as Request;
  }

  beforeEach(() => {
    ipMap.clear();
  });

  it("allows requests under the limit", () => {
    const req = mockRequest();
    let allowed = true;
    for (let i = 0; i < 5; i++) {
      allowed = rateLimit(req);
      expect(allowed).toBe(true);
    }
  });

  it("blocks requests over the limit", () => {
    const req = mockRequest();
    let allowed = true;
    for (let i = 0; i < 6; i++) {
      allowed = rateLimit(req);
    }
    expect(allowed).toBe(false);
  });

  it("resets after window expires", () => {
    const req = mockRequest();
    for (let i = 0; i < 5; i++) {
      rateLimit(req);
    }
    // Simulate window expiry
    const entry = ipMap.get("1.2.3.4");
    entry.start -= 10 * 60 * 1000 + 1;
    ipMap.set("1.2.3.4", entry);
    expect(rateLimit(req)).toBe(true);
  });

  it("handles missing headers", () => {
    const req = mockRequest("");
    expect(rateLimit(req)).toBe(true);
  });
});
