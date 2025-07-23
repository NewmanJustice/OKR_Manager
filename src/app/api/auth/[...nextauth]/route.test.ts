jest.mock("next-auth", () => ({
  __esModule: true,
  default: jest.fn(() => () => {}),
}));

import { authOptions } from "@/auth/authOptions";

describe("NextAuth route handler", () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it("should call NextAuth with authOptions", () => {
    require("./route");
    const nextAuthModule = require("next-auth");
    const callArgs = nextAuthModule.default.mock.calls[0][0];
    expect(callArgs.pages).toEqual(authOptions.pages);
    expect(callArgs.session).toEqual(authOptions.session);
    expect(callArgs.providers[0].id).toBe(authOptions.providers[0].id);
    expect(callArgs.providers[0].type).toBe(authOptions.providers[0].type);
    expect(callArgs.providers[0].name).toBe(authOptions.providers[0].name);
  });

  it("should export GET and POST handlers", () => {
    const routeModule = require("./route");
    expect(typeof routeModule.GET).toBe("function");
    expect(typeof routeModule.POST).toBe("function");
    expect(routeModule.GET).toBe(routeModule.POST);
  });
});