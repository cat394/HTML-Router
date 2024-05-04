import { ELEMENT } from "../constants";
import {
  ParamsObj,
  RouteConfig,
  RouteData,
  RouterPublicFunctionResult,
  SetRouteDataOptions,
} from "../types";

export class RouteLink extends HTMLElement {
  public routeParams: ParamsObj = {};

  connectedCallback() {
    this.setAttribute("role", "link");
    this.setAttribute("tabindex", "0");
  }

  public setRouteData<
    RouteConfigType extends RouteConfig = RouteConfig,
    RouteDataType extends RouteData = RouteData,
  >(
    routeid: Extract<keyof RouteConfigType, string>,
    options: SetRouteDataOptions<RouteDataType>,
  ): RouterPublicFunctionResult {
    this.dataset.routeid = routeid;
    if (options.params) {
      this.routeParams = options.params;
    }
    return {
      success: true,
      message: "Route ID set successfully",
    };
  }
}

customElements.define(ELEMENT.ROUTE_LINK, RouteLink);
