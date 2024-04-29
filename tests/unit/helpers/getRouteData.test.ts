import { describe, expect, it } from "vitest";
import { getRouteData, path } from "../../../src/helpers";
import { ConvertRouteConfigResult } from "../../../src/types";

describe('getPageData function', () => {
  it('ルートマップから指定の文字列と同じキーを持つプロパティを取り出す', () => {
    const routeObj = {
      users: {
        path: path`/users`,
      },
      posts: {
        path: path`/posts`,
      },
    }
    const routeMap: ConvertRouteConfigResult['routeMap'] = new Map(Object.entries(routeObj));

    expect(getRouteData(routeMap, 'users')).toEqual(routeMap.get('users'));
  });

  it('存在しないキーを指定した場合はundefinedを返す', () => {
    const routeObj = {
      users: {
        path: path`/users`,
      },
      posts: {
        path: path`/posts`,
      },
    }
    const routeMap: ConvertRouteConfigResult['routeMap'] = new Map(Object.entries(routeObj));

    expect(getRouteData(routeMap, 'home')).toBeUndefined();
  });
});
