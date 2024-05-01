import "./components/index";
import { RouteManager } from "./components";
import { RouteLink } from "./components";
import { onAll, fallback } from "./constants";
import { convertRouteConfig, path } from "./helpers";
import type { RouteConfig, RouteHookContext, OnAllHookContext } from "./types";

customElements.define("route-manager", RouteManager);
customElements.define("route-link", RouteLink);

export { RouteManager, RouteLink, onAll, fallback, convertRouteConfig, path };
export type { RouteConfig, RouteHookContext, OnAllHookContext };
