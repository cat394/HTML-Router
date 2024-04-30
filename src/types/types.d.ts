import { RouteManager } from "../components";
import { RouteLink } from "../components";
declare global {
  interface HTMLElementTagNameMap {
    "route-manager": RouteManager;
    "route-link": RouteLink;
  }
}
