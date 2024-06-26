import { LIFE_CYCLE, onAll, fallback } from "../constants";

// --------------------------------------------------
// Utils
export type StringKeysOnly<T> = {
  [K in keyof T]: T[K] extends never ? never : K;
}[keyof T] extends infer U
  ? U extends string
    ? U
    : never
  : never;
// --------------------------------------------------
// Base
export type OnAllSymbol = typeof onAll;
export type FallbackSymbol = typeof fallback;
export type CustomContext = Record<string, unknown>;

type ParamNames = PathFunctionResult["params"][number][0];
export type ParamValue = string;
export type ParamsMap<ParamNamesType extends ParamNames = ParamNames> = Map<
  ParamNamesType,
  ParamValue
>;
export type ExtractParamNames<T> = T extends [infer First, number]
  ? First
  : never;

type AcceptParamsType = string | number;
export type RouteParamsSetting<RouteConfigType extends RouteConfig = any> = {
  [RouteId in keyof Omit<RouteConfigType, OnAllSymbol>]: {
    [Params in RouteConfigType[RouteId]["path"]["params"][number][0]]:
      | AcceptParamsType
      | AcceptParamsType[];
  };
};
// --------------------------------------------------
// Functions
export type PathFunctionResult<
  PathParamNames extends [...string[]] = [...string[]],
> = {
  stringified: string;
  splitStringified: string[];
  staticParts: TemplateStringsArray;
  hasDynamicPart: boolean;
  firstSegment: string;
  params: [PathParamNames[number], number][];
};
export type ConvertRouteConfigResult = {
  onAllConfig?: RouteConfig[typeof onAll];
  fallbackMap: Map<
    keyof RouteConfig[FallbackSymbol],
    RouteConfig[FallbackSymbol][keyof RouteConfig[FallbackSymbol]]
  >;
  routeMap: Map<string, RouteConfig[string]>;
};

export type RouterPublicFunctionResult = {
  success: boolean;
  message: string;
};
export type SetRouteDataOptions<RouteDataType extends RouteData> = {
  params?: ParamsObj<RouteDataType>;
};
// --------------------------------------------------
// Hooks
export type Hook<P extends BaseHookContext = any> = (context: P) => void;

type BaseHookContext = {
  customContext: CustomContext;
};

type Hooks<ContextType extends BaseHookContext> = Partial<
  Record<LIFE_CYCLE, Hook<ContextType>>
>;

export type RouteHookContext<
  EachRouteConfigType extends RouteConfig[string] = any,
  CustomContextType extends CustomContext = CustomContext,
> = {
  readonly templateContent: DocumentFragment;
  readonly clone: DocumentFragment;
  readonly routeContext: {
    readonly params: EachRouteConfigType["path"] extends PathFunctionResult
      ? ParamsMap<EachRouteConfigType["path"]["params"][number][0]>
      : never;
  };
  customContext: {
    [K in keyof EachRouteConfigType["customContext"]]: CustomContextType[K];
  };
};

export type OnAllHookContext<RouteConfigType extends RouteConfig = any> = {
  readonly routeContext: {
    readonly routeid: Extract<keyof RouteConfigType, string>;
    readonly params: ParamsMap<
      | RouteConfigType[Extract<
          keyof RouteConfigType,
          string
        >]["path"]["params"][number][0]
      | RouteConfigType[Extract<
          keyof RouteConfigType,
          FallbackSymbol
        >][keyof RouteConfigType[FallbackSymbol]]["path"]["params"][number][0]
    >;
  };
  customContext: RouteConfigType[OnAllSymbol] extends onAllData
    ? RouteConfigType[OnAllSymbol]["customContext"]
    : never;
};
// --------------------------------------------------
// Route data
type BaseData<CustomContexType = CustomContext> = {
  customContext?: CustomContexType extends CustomContext
    ? CustomContexType
    : never;
};

export type RouteData<
  PathType extends PathFunctionResult = any,
  CustomContextType = CustomContext,
> = BaseData<CustomContextType> &
  Hooks<RouteHookContext> & {
    path: PathType extends PathFunctionResult ? PathType : never;
  };

type onAllData<CustomContextType = CustomContext> =
  BaseData<CustomContextType> & Hooks<OnAllHookContext>;

// --------------------------------------------------
// Route config
export type RouteConfig = {
  [onAll]?: onAllData;
  [fallback]: { [key: string]: RouteData } & { PageNotFound: RouteData };
  [routeid: string]: RouteData;
};
export type FallbackRoute<T extends RouteConfig> = StringKeysOnly<
  T[FallbackSymbol]
>;
export type ParamsObj<RouteDataType extends RouteConfig[string] = any> =
  Partial<Record<RouteDataType["path"]["params"][number][0], string | number>>;
// --------------------------------------------------
// Error
export type RouteErrorDetail = {
  message: string;
  place?: string;
  errorType: RouteErrorType;
};
export enum RouteErrorType {
  RouteIdNotSet = "RouteIdNotSet",
  RouteIdNotFound = "RouteIdNotFound",
  RouteIdNotString = "RouteIdNotString",
  ParamsNotMap = "ParamsNotMap",
  ParamsNotSet = "ParamsNotSet",
  RouteDataNotSet = "RouteDataNotSet",
  HistoryError = "HistoryError",
  RouteMapNotSet = "RouteMapNotSet",
  ConfigurationError = "ConfigurationError",
  TemplateNotFound = "TemplateNotFound",
  OutletNotFound = "OutletNotFound",
  UnknownError = "UnknownError",
}
