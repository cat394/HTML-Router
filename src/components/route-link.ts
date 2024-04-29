import { ELEMENT_NAME } from "../constants";
import {
  ParamsObj,
  RouteConfig,
  RouteData,
  RouterPublicFunctionResult,
  SetRouteDataOptions,
} from "../types";

export class RouteLink extends HTMLElement {
  public routeParams: ParamsObj = {};

  constructor() {
    super();
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

  public setRouteParams<P extends RouteConfig[string]>(
    params: ParamsObj<P>,
  ): RouterPublicFunctionResult {
    this.routeParams = params;
    return {
      success: true,
      message: "Route params set successfully",
    };
  }
}

customElements.define(ELEMENT_NAME.ROUTE_LINK, RouteLink);
