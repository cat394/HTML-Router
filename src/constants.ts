export enum MARKER {
  PATH_SEPARATOR = "/",
}

export enum LIFE_CYCLE_NAME {
  ON_BEFORE_PRE_CONTENT_CLEAR = "onBeforePreContentClear",
  ON_BEFORE_NAVIGATE = "onBeforeNavigate",
  ON_AFTER_NAVIGATE = "onAfterNavigate",
  ON_Clear = "onClear",
}

export enum ELEMENT_NAME {
  ROUTE_LINK = "route-link",
  ROUTE_MASTER = "route-manager",
  OUTLET_MAIN = "main",
}

export const EVENT_NAME = {
  ROUTER_ERROR: "router-error",
} as const;

export const onAll = Symbol("onAll");

export const fallback = Symbol("fallback");
