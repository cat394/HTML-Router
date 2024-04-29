import {
  ConvertRouteConfigResult,
  ParamsMap,
  PathFunctionResult,
  RouteConfig,
  RouteHookContext,
} from "../types";
import { ELEMENT_NAME, MARKER, fallback, onAll } from "../constants";
import { RouteManager } from "../components";

const { PATH_SEPARATOR } = MARKER;
const { OUTLET_MAIN } = ELEMENT_NAME;

export const convertRouteConfig = (routeConfig: RouteConfig) => {
  const {
    [onAll]: onAllConfig,
    [fallback]: fallbackConfig,
    ...restRouteConfig
  } = routeConfig;
  const fallbackMap = new Map(Object.entries(fallbackConfig));
  const routeMap = new Map(Object.entries(restRouteConfig));
  return { onAllConfig, fallbackMap, routeMap };
};

export function* findNextIndex(source: string, target: string) {
  if (target === "") {
    return;
  }
  let startIndex = 0;
  while (true) {
    const index = source.indexOf(target, startIndex);
    if (index === -1) {
      return;
    }
    yield index;
    startIndex += target.length;
  }
}

export const getPageName = (path: string) => {
  if (!path.startsWith(PATH_SEPARATOR)) {
    path = PATH_SEPARATOR + path;
  }
  if (!path.endsWith(PATH_SEPARATOR)) {
    path += PATH_SEPARATOR;
  }
  const indexGenerator = findNextIndex(path, PATH_SEPARATOR);
  const firstSeparatorIndex = indexGenerator.next().value;
  const secondSeparatorIndex = indexGenerator.next().value;
  return firstSeparatorIndex !== undefined && secondSeparatorIndex !== undefined
    ? path.slice(firstSeparatorIndex + 1, secondSeparatorIndex)
    : "";
};

export const extractParamsMapFromCurrentPath = (
  pathname: string,
  params: PathFunctionResult["params"],
) => {
  const pathParts = pathname.split(PATH_SEPARATOR);
  const paramsMap: RouteHookContext["routeContext"]["params"] = new Map();
  params.forEach(([paramName, dynamicPathIndex]) => {
    const paramValueInPathname = pathParts[dynamicPathIndex];
    if (!(paramValueInPathname === undefined)) {
      paramsMap.set(paramName, decodeURIComponent(paramValueInPathname));
    }
  });
  return paramsMap;
};

export const buildPathFromRouteParams = (
  routePath: PathFunctionResult,
  paramsMap: ParamsMap,
) => {
  const countOfParamsMap = paramsMap.size;
  if (countOfParamsMap === 0) {
    return routePath.staticParts[0].slice(0, -PATH_SEPARATOR.length);
  }
  const pathLength = countOfParamsMap * 2;
  const splitPathIntoSegments = routePath.splitStringified;
  splitPathIntoSegments.length = pathLength;
  for (const [paramName, dynamicPathIndex] of routePath.params) {
    const paramValue = paramsMap.get(paramName);
    if (paramValue) {
      splitPathIntoSegments[dynamicPathIndex] = encodeURIComponent(paramValue);
    }
  }
  return splitPathIntoSegments.join(PATH_SEPARATOR);
};

export const path = <PathParamNames extends [...string[]] = any>(
  staticParts: TemplateStringsArray,
  ...paramNames: PathParamNames
) => {
  const hasdynamicPath = paramNames.length > 0;
  const firstSegment = getPageName(staticParts[0]);
  let stringified = "";
  staticParts.forEach((staticPart, index) => {
    stringified += staticPart;
    if (index < paramNames.length) {
      stringified += paramNames[index];
    }
  });

  const splitStringified = stringified.split(PATH_SEPARATOR);
  const params: [PathParamNames[number], number][] = paramNames.map(
    (paramName) => {
      const paramIndexInPath = splitStringified.indexOf(paramName);
      return [paramName, paramIndexInPath];
    },
  );

  return {
    stringified,
    splitStringified,
    staticParts,
    hasdynamicPath,
    firstSegment,
    params,
  };
};

export const getMatchingRouteId = (
  routeConfig: ConvertRouteConfigResult["routeMap"],
  firstSegment: string,
) => {
  let targetRouteId: string | undefined;
  for (const [routeid, routeData] of routeConfig) {
    if (routeData.path.firstSegment === firstSegment) {
      targetRouteId = routeid;
    }
  }
  return targetRouteId;
};

export const updateHistory = (
  routeid: string,
  paramsMap: ParamsMap,
  path: string,
) => {
  console.log({ routeid, paramsMap, path });
  window.history.pushState({ routeid, paramsMap }, "", path);
};

export const validateNavigationId = (
  currentNavigationId: Symbol,
  navigationId: Symbol,
) => {
  if (currentNavigationId !== navigationId) {
    throw new Error("Navigation has been superseded");
  }
};

export const getRouteTemplate = (routeid: string) =>
  document.querySelector<HTMLTemplateElement>(
    `template[data-routeid="${routeid}"]`,
  );

export const getFallbackTemplate = (fallbackId: string) =>
  document.querySelector<HTMLTemplateElement>(
    `template[data-fallback-id="${fallbackId}"]`,
  );

export const getOutletElement = (routeMaster: RouteManager) =>
  routeMaster.querySelector<HTMLDivElement>(`[data-outlet="${OUTLET_MAIN}"]`);

export const getRouteData = (
  routeMap:
    | ConvertRouteConfigResult["routeMap"]
    | ConvertRouteConfigResult["fallbackMap"],
  routeid: string,
) => routeMap.get(routeid);
