export const onAll = Symbol("onAll");
export const fallback = Symbol("fallback");

export const PATH_SEPARATOR = "/";

export enum LIFE_CYCLE {
  ON_LOAD = "OnLoad",
  ON_BEFORE_NAVIGATE = "onBeforeNavigate",
  ON_AFTER_NAVIGATE = "onAfterNavigate",
  ON_Destroy = "onDestroy",
}

export enum ELEMENT {
  ROUTE_LINK = "route-link",
  ROUTE_MASTER = "route-manager",
  OUTLET_MAIN = "main",
}
