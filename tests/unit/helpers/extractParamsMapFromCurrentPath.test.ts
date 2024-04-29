import { describe, it, expect } from "vitest";
import { extractParamsMapFromCurrentPath } from "../../../src/helpers";

type Params = [string, number][];

describe("extractParamsMapFromCurrentPath", () => {
  it("パスからパラメータを正確に抽出し、マップに変換する", () => {
    const pathname = "/user/42/profile/edit";
    const params: Params = [
      ["userId", 2],
      ["action", 4],
    ];
    const result = extractParamsMapFromCurrentPath(pathname, params);

    expect(result.get("userId")).toBe('42');
    expect(result.get("action")).toBe("edit");
  });

  it("デコードされた値を変換する", () => {
    const pathname = "/product/%E3%83%81%E3%83%A3%E3%82%A4%E3%83%BC/100";
    const params: Params = [
      ["productName", 2],
      ["productId", 3],
    ];
    const result = extractParamsMapFromCurrentPath(pathname, params);

    expect(result.get("productName")).toBe("チャイー");
    expect(result.get("productId")).toBe('100');
  });

  it("存在しないパラメータインデックスを無視する", () => {
    const pathname = "/user/42";
    const params: Params = [
      ["userId", 2],
      ["action", 10],
    ];
    const result = extractParamsMapFromCurrentPath(pathname, params);

    expect(result.get("userId")).toBe('42');
    expect(result.has("action")).toBeFalsy();
  });

  it("空のパスと空のパラメータリストで空のマップを返す", () => {
    const pathname = "";
    const params = [];
    const result = extractParamsMapFromCurrentPath(pathname, params);

    expect(result.size).toBe(0);
  });
});
