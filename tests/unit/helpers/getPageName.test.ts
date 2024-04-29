import { describe, it, expect } from "vitest";
import { getPageName } from "../../../src/helpers";

describe("getPageName", () => {
  it("有効なパスからページ名を正確に抽出する", () => {
    const path = "/users/alice/posts";
    expect(getPageName(path)).toBe("users");
  });

  it("初めにセパレータが含まれていないときはセパレータを追加する", () => {
    const path = "users/alice/posts";
    expect(getPageName(path)).toBe("users");
  });

  it("末尾にセパレータがない場合は、整合性を保つために最後にセパレータを追加した後に処理を行う", () => {
    const path = "/home";
    expect(getPageName(path)).toBe("home");
  });

  it("空またはルートパスで空文字列を返す", () => {
    expect(getPageName("")).toBe("");
    expect(getPageName("/")).toBe("");
  });
});
