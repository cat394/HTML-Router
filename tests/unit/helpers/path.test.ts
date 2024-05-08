import { describe, it, expect } from "vitest";
import { path } from "../../../src/helpers";

describe("path function", () => {
  it("静的部分と動的パラメータからパス文字列を生成する", () => {
    const result = path`/user/${"userId"}/profile/${"action"}`;
    expect(result.stringified).toBe("/user/userId/profile/action");
    expect(result.hasDynamicPart).toBe(true);
    expect(result.firstSegment).toBe("user");
    expect(result.params).toEqual([
      ["userId", 2],
      ["action", 4],
    ]);
  });

  it("動的パラメータがない場合はhasDynamicPartがfalseを返す", () => {
    const result = path`/home/about`;
    expect(result.stringified).toBe("/home/about");
    expect(result.hasDynamicPart).toBe(false);
    expect(result.firstSegment).toBe("home");
    expect(result.params).toEqual([]);
  });

  it("複数の静的部分と動的パラメータを正しく処理する", () => {
    const result = path`/product/${"productId"}/detail/${"detailId"}`;
    expect(result.stringified).toBe("/product/productId/detail/detailId");
    expect(result.hasDynamicPart).toBe(true);
    expect(result.firstSegment).toBe("product");
    expect(result.params).toEqual([
      ["productId", 2],
      ["detailId", 4],
    ]);
  });

  it("パラメータのインデックスが正しく計算される", () => {
    const result = path`/search/${"query"}`;
    expect(result.stringified).toBe("/search/query");
    expect(result.hasDynamicPart).toBe(true);
    expect(result.firstSegment).toBe("search");
    expect(result.params).toEqual([["query", 2]]);
  });

  it("エンコードされたパラメータを含むパスを処理する", () => {
    const result = path`/product/${"category"}/item/${encodeURIComponent("スマホ")}`;
    expect(result.stringified).toBe(
      "/product/category/item/%E3%82%B9%E3%83%9E%E3%83%9B",
    );
    expect(result.hasDynamicPart).toBe(true);
    expect(result.firstSegment).toBe("product");
    expect(result.params).toEqual([
      ["category", 2],
      ["%E3%82%B9%E3%83%9E%E3%83%9B", 4],
    ]);
  });
});
