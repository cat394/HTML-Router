import { describe, it, expect } from "vitest";
import { findNextIndex } from "../../../src/helpers";

describe("findNextIndex function", () => {
  it("ターゲットとする文字列が複数含まれている場合は、それぞれの単語の始めのインデックスを返す", () => {
    const source = "hello hello hello";
    const target = "hello";
    const generator = findNextIndex(source, target);

    expect(generator.next().value).toBe(0); // 最初の hello の位置
    expect(generator.next().value).toBe(6); // 2番目の hello の位置
    expect(generator.next().value).toBe(12); // 3番目の hello の位置
    expect(generator.next().done).toBe(true); // これ以上 hello はない
  });

  it("ターゲットとする文字列が含まれていない場合は、undefinedを返し、ジェネレーターを完了させる", () => {
    const source = "hello world";
    const target = "test";
    const generator = findNextIndex(source, target);

    expect(generator.next().value).toBeUndefined(); // test は見つからない
    expect(generator.next().done).toBe(true); // これ以上 test はない
  });

  it("ターゲットとする文字列が重複して存在する場合は、一度目の発見時にそのターゲットとする文字列の長さの分だけ、次に発見を始める最初のインデックスをずらす", () => {
    const source = "ababa";
    const target = "aba";
    const generator = findNextIndex(source, target);

    expect(generator.next().value).toBe(0); // 最初の aba の位置
    expect(generator.next().value).toBeUndefined(); // 2番目の aba は見つからない
    expect(generator.next().done).toBe(true); // これ以上 aba はない
  });

  it("空の文字列の場合は、すぐにundefinedを返し、ジェネレーターを完了させる", () => {
    const source = "hello";
    const target = "";
    const generator = findNextIndex(source, target);

    expect(generator.next().value).toBeUndefined(); // 空の文字列を探すことはできない
    expect(generator.next().done).toBe(true);
  });
});
