import { RouteManager } from "./route-maneger";
import { RouteLink } from "./route-link";

export { RouteManager, RouteLink };

declare global {
  interface HTMLElementTagNameMap {
    "route-manager": RouteManager;
    "route-link": RouteLink;
  }
}
