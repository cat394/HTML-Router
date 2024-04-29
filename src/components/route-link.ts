import { ELEMENT_NAME } from "../constants";
import {
  GotoParamsObj,
  RouteConfig,
  RouterPublicFunctionResult,
} from "../types";

export class RouteLink<
  T extends RouteConfig = RouteConfig,
> extends HTMLElement {
  public routeParams: GotoParamsObj = {};

  constructor() {
    super();
    this.setAttribute("role", "link");
    this.setAttribute("tabindex", "0");
  }

  public setRouteId(
    routeid: Extract<keyof T, string>,
  ): RouterPublicFunctionResult {
    this.dataset.routeid = routeid;
    return {
      success: true,
      message: "Route ID set successfully",
    };
  }

  public setRouteParams<P extends RouteConfig[string]>(
    params: GotoParamsObj<P>,
  ): RouterPublicFunctionResult {
    this.routeParams = params;
    return {
      success: true,
      message: "Route params set successfully",
    };
  }
}

customElements.define(ELEMENT_NAME.ROUTE_LINK, RouteLink);
