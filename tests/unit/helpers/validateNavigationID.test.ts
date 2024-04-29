import { describe, it, expect } from "vitest";
import { validateNavigationId } from "../../../src/helpers";

describe("validateNavigationID function", () => {
  it("同じNavigationIDであればエラーを投げない", () => {
    const navigationID = Symbol("Navigation");
    expect(() =>
      validateNavigationId(navigationID, navigationID),
    ).not.toThrow();
  });

  it("異なるNavigationIDの場合にエラーを投げる", () => {
    const currentNavigationID = Symbol("Current Navigation");
    const newNavigationID = Symbol("New Navigation");
    expect(() =>
      validateNavigationId(currentNavigationID, newNavigationID),
    ).toThrow("Navigation has been superseded");
  });
});
