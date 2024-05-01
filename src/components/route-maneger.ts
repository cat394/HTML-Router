import { ELEMENT, LIFE_CYCLE } from "../constants";
import { RoutingError } from "../routing-error";
import {
  buildPathFromRouteParams,
  extractParamsMapFromCurrentPath,
  getFallbackTemplate,
  getMatchingRouteId,
  getOutletElement,
  getPageName,
  getRouteData,
  getRouteTemplate,
  updateHistory,
  validateNavigationId,
} from "../helpers";
import {
  ConvertRouteConfigResult,
  RouteHookContext,
  OnAllHookContext,
  ParamsMap,
  RouteData,
  RouterPublicFunctionResult,
  RouteErrorType,
  RouteConfig,
  StringKeysOnly,
  FallbackRoute,
  ParamsObj,
} from "../types";
import { RouteLink } from "./route-link";

/**
 *
 * RouteManager is a component for managing the navigation of an application.
 * It is placed in HTML using the `<route-manager>` tag, with a corresponding `<template>` tag for each route.
 * By defining a `<template>` tag, you can display the appropriate content when a particular route is activated.
 *
 * Example:
 * ```html
 * <route-manager>
 *   <template data-fallbackid="PageNotFound">
 *     <h1>404: Page not found</h1>
 *   </template>
 *   <template data-routeid="home">
 *     <h1>Home</h1>
 *     <p>Here is home page</p>
 *   </template>
 * </route-manager>
 * ```
 *
 */
export class RouteManager<
  RouteConfigType extends RouteConfig = RouteConfig,
> extends HTMLElement {
  /**
   * Indicates whether the component has been initialized.
   * This is used to determine whether the current route is the initial route.
   */
  private _isInitialized = false;

  /**
   * Indicates whether the popstate event has occurred.
   * This is used to determine whether the current route change is due to a popstate event.
   */
  private _isPopstateEvent = false;

  /**
   * Indicates whether the current route is a fallback route.
   * This is used to determine whether the current route is a fallback route.
   */
  private _isFallback = false;

  /**
   * The navigation ID for the current route change.
   * This is used to validate the current route change.
   * This prevents multiple navigation conflicts.
   */
  private _navigationid = Symbol();

  /**
   * The onAll configuration object from the route configuration.
   * This is used to trigger lifecycle events for all routes.
   */
  private _onAllConfig?: ConvertRouteConfigResult["onAllConfig"] = undefined;

  /**
   * The fallback map from the converted route configuration.
   * This is used to navigate to fallback routes.
   * If the isFallback flag is true, routes will be selected from this map.
   */
  private _fallbackMap: ConvertRouteConfigResult["fallbackMap"] | undefined =
    undefined;

  /**
   * The route map from the converted route configuration.
   * This is used to navigate to routes.
   */
  private _routeMap: ConvertRouteConfigResult["routeMap"] | undefined =
    undefined;

  /**
   * The element to insert content for each route.
   * This is typically a div element with the data-outlet attribute set to 'main'.
   * If the element does not exist, it will be created automatically.
   */
  private _outletElement: HTMLDivElement | null = null;

  /**
   * The template element for the current route.
   * This is used to display the content for the current route.
   */
  private _routeTemplate: HTMLTemplateElement | null = null;

  /**
   * The route ID for the current route.
   * This is used to determine the current route.
   */
  private _routeid:
    | StringKeysOnly<RouteConfigType>
    | FallbackRoute<RouteConfigType>
    | undefined = undefined;

  /**
   * The route data for the current route.
   * This is used to trigger lifecycle events for the current route.
   */
  private _routeData: RouteData | undefined = undefined;

  /**
   * The parameters map for the current route.
   * This is used to store the parameters for the current route.
   */
  private _routeParamsMap: ParamsMap = new Map();

  /**
   * The cloned template element for the current route.
   * This is passed to a hook that fires on each route's lifecycle event.
   */
  private _clone: DocumentFragment | undefined = undefined;

  /**
   * Initializes routing, sets up listeners and manages route changes.
   */
  connectedCallback() {
    this._createOutletElement();
    this._setupEventListeners();
  }

  /**
   * Cleans up event listeners when the component is removed from the DOM.
   */
  disconnectedCallback() {
    this._removeEventListeners();
  }

  set routeMap(newRouteMap: ConvertRouteConfigResult["routeMap"] | undefined) {
    if (!newRouteMap) {
      throw new RoutingError({
        message:
          "There is an issue with the route configuration object. You need to set the data correctly converted by the convertRouteConfig function.",
        place: "setter for routeMap",
        errorType: RouteErrorType.ConfigurationError,
      });
    }
    this._routeMap = newRouteMap;
  }

  get routeMap(): ConvertRouteConfigResult["routeMap"] {
    if (!this._routeMap) {
      throw new RoutingError({
        message:
          "The route map is not set. It is possible that the route map was removed or modified externally.",
        place: "getter for routeMap",
        errorType: RouteErrorType.RouteMapNotSet,
      });
    }
    return this._routeMap;
  }

  set fallbackMap(
    newFallbackMap: ConvertRouteConfigResult["fallbackMap"] | undefined,
  ) {
    if (!newFallbackMap) {
      throw new RoutingError({
        message:
          "There is an issue with the route configuration object. Setting a fallback in the route configuration object is required. Be sure to set a field with the fallback ID 'PageNotFound' for the fallback, and create a template element with the attribute data-fallback-id='PageNotFound' in the HTML.",
        place: "setter for fallbackMap",
        errorType: RouteErrorType.ConfigurationError,
      });
    }
    this._fallbackMap = newFallbackMap;
  }

  get fallbackMap(): ConvertRouteConfigResult["fallbackMap"] {
    if (!this._fallbackMap) {
      throw new RoutingError({
        message:
          "The fallback map is missing. Ensure it has not been modified or deleted from an external process.",
        place: "getter for fallbackMap",
        errorType: RouteErrorType.ConfigurationError,
      });
    }
    return this._fallbackMap;
  }

  set routeid(
    newRouteid:
      | StringKeysOnly<RouteConfigType>
      | FallbackRoute<RouteConfigType>
      | undefined,
  ) {
    if (!newRouteid) {
      newRouteid = "PageNotFound" as FallbackRoute<RouteConfigType>;
      this._isFallback = true;
    }
    this._routeid = newRouteid;
    if (!newRouteid) return;
    if (this._isFallback) {
      this.routeTemplate = getFallbackTemplate(newRouteid);
      this.routeData = getRouteData(this.fallbackMap, newRouteid);
      this._clone = document.importNode(
        this.routeTemplate.content,
        true,
      );
      this.gotoFallback(newRouteid);
      this._isFallback = false;
      throw new RoutingError({
        message: "The specified route Id is missing from the route map.",
        place: "setter for routeid",
        errorType: RouteErrorType.RouteIdNotFound,
      });
    } else {
      this.routeTemplate = getRouteTemplate(newRouteid);
      this.routeData = getRouteData(this.routeMap, newRouteid);
      this._clone = document.importNode(
        this.routeTemplate.content,
        true,
      );
    }
  }

  get routeid(): StringKeysOnly<RouteConfigType> {
    if (!this._routeid) {
      throw new RoutingError({
        message: "Route ID is not set.",
        place: "getter for routeid",
        errorType: RouteErrorType.RouteIdNotSet,
      });
    }
    return this._routeid;
  }

  set routeData(newRouteData: RouteData | undefined) {
    if (!newRouteData) {
      throw new RoutingError({
        message:
          "Route data cannot be undefined. Ensure the correct route configuration object has been created.",
        place: "setter for routeData",
        errorType: RouteErrorType.RouteDataNotSet,
      });
    }
    this._routeData = newRouteData;
  }

  get routeData(): RouteData {
    if (!this._routeData) {
      throw new RoutingError({
        message: "Route data is not set.",
        place: "getter for routeData",
        errorType: RouteErrorType.RouteDataNotSet,
      });
    }
    return this._routeData;
  }

  set routeTemplate(template: HTMLTemplateElement | null) {
    if (!template) {
      throw new RoutingError({
        message: `Target template element not found. There may not be a template element with an attribute data-routeid='${this.routeid}' in the HTML.`,
        place: "getter for clone",
        errorType: RouteErrorType.TemplateNotFound,
      });
    }
    this._routeTemplate = template;
  }

  get routeTemplate(): HTMLTemplateElement {
    if (!this._routeTemplate) {
      throw new RoutingError({
        message: `Route template is not set.`,
        place: "getter for clone",
        errorType: RouteErrorType.TemplateNotFound,
      });
    }
    return this._routeTemplate;
  }

  get outletElement(): HTMLDivElement {
    if (!this._outletElement) {
      throw new RoutingError({
        message:
          "Outlet element is typically created when a component is initialized. Therefore, it may have been intentionally deleted from outside. If the problem persists, create a <div data-outlet='main'></div> under route-manager element.",
        place: "getter for outletElement",
        errorType: RouteErrorType.OutletNotFound,
      });
    }
    return this._outletElement;
  }

  get clone(): DocumentFragment {
    if (!this._clone) {
      throw new RoutingError({
        message: `It was not possible to clone a template element with data-routeid='${this.routeid}' attribute. It may have been intentionally deleted from outside.`,
        place: "getter for clone",
        errorType: RouteErrorType.TemplateNotFound,
      });
    }
    return this._clone;
  }

  private _setupEventListeners() {
    window.addEventListener("popstate", this._handlePopState);
    this.addEventListener("click", this._handleRouteChange);
    this.addEventListener("keydown", this._handleRouteChange);
  }

  private _removeEventListeners() {
    window.removeEventListener("popstate", this._handlePopState);
    this.removeEventListener("click", this._handleRouteChange);
    this.removeEventListener("keydown", this._handleRouteChange);
  }

  /**
   * Creates a div element with the data-outlet attribute set to 'main' if it does not already exist.
   *
   * @returns {void}
   */
  private _createOutletElement() {
    let outletElement = getOutletElement(this);
    if (!outletElement) {
      outletElement = document.createElement("div");
      outletElement.dataset.outlet = "main";
      this.appendChild(outletElement);
      this._outletElement = outletElement;
    } else {
      this._outletElement = outletElement;
    }
  }

  /**
   * Sets the converted route configuration object or map using the convertedRouteConfig function.
   *
   * Example:
   * ```ts
   * const routeConfig = {
   *  [fallback]: {
   *   PageNotFound: {
   *    path: path`/404`
   *   }
   *  },
   *  home: {
   *   path: path`/`
   *  }
   * } satisfies RouteConfig;
   *
   * const mainRouteManager = document.querySelector<RouteManager<typeof routeConfig>>("route-manager");
   * const convertedRouteConfig = convertRouteConfig(routeConfig);
   * mainRouteManager.setRouteConfig(convertedRouteConfig);
   * ```
   *
   * @param {ConvertRouteConfigResult} config - The route configuration object.
   * @returns {RouterPublicFunctionResult} - The result of the operation.
   */
  public setRouteConfig(
    config: ConvertRouteConfigResult,
  ): RouterPublicFunctionResult {
    try {
      this._onAllConfig = config.onAllConfig;
      this.routeMap = config.routeMap;
      this.fallbackMap = config.fallbackMap;
      return {
        success: true,
        message: "Route config is set successfully.",
      };
    } catch (error) {
      return this._handleError("Route config setting failed", error);
    }
  }

  /**
   * Initializes the route based on the current URL.
   * This is typically called when the component is first mounted.
   *
   * @returns {RouterPublicFunctionResult} - The result of the operation.
   */
  public initializeRoute(): RouterPublicFunctionResult {
    try {
      const pathname = window.location.pathname;
      const firstSegment = getPageName(pathname);
      this.routeid = getMatchingRouteId(
        this.routeMap,
        firstSegment,
      ) as StringKeysOnly<RouteConfigType>;
      if (this.routeData.path.hasDynamicPath) {
        this._routeParamsMap = extractParamsMapFromCurrentPath(
          pathname,
          this.routeData.path.params,
        );
      }
      this.goto(this.routeid);
      this._isInitialized = true;
      return {
        success: true,
        message: "Route is initialized successfully.",
      };
    } catch (error) {
      return this._handleError("Route initialization failed", error);
    }
  }

  /**
   * Navigates to a new route based on the provided route ID and parameters.
   *
   * Example:
   * ```ts
   * const mainRouteManager = document.querySelector<RouteManager<typeof routeConfig>>("route-manager");
   * mainRouteManager.goto("home");
   * ```
   *
   * @param {StringKeysOnly<RouteConfigType>} targetRouteId - The route ID to navigate to.
   * @param {ParamsObj<T>} [targetRouteParams] - Parameters for the route.
   * @returns {RouterPublicFunctionResult} - The result of the operation.
   */
  public goto<T extends RouteConfig[string] = RouteConfig[string]>(
    targetRouteId: StringKeysOnly<RouteConfigType>,
    targetRouteParams?: ParamsObj<T>,
  ): RouterPublicFunctionResult {
    return this._updateNextContent(targetRouteId, targetRouteParams);
  }

  /**
   * Navigates to the fallback route.
   *
   * Example:
   * ```ts
   * const mainRouteManager = document.querySelector<RouteManager<typeof routeConfig>>("route-manager");
   * mainRouteManager.gotoFallback("PageNotFound");
   * ```
   *
   * @param {FallbackRoute<RouteConfigType>} fallbackId - The fallback route ID.
   * @param {ParamsObj<T>} [fallbackParams] - Parameters for the fallback route.
   * @returns {RouterPublicFunctionResult} - The result of the operation.
   */
  public gotoFallback<T extends RouteConfig[string] = RouteConfig[string]>(
    fallbackId: FallbackRoute<RouteConfigType>,
    fallbackParams?: ParamsObj<T>,
  ): RouterPublicFunctionResult {
    this._isFallback = true;
    return this._updateNextContent(fallbackId, fallbackParams);
  }

  /**
   * Prepares the route for navigation.
   * This is used to validate the current route change and prevent multiple navigation conflicts.
   *
   * @returns {Symbol} - The navigation ID.
   */
  private _prepareRouteChange(): Symbol {
    const navigationId = Symbol();
    this._navigationid = navigationId;
    if (this._isInitialized) {
      this._triggerLifecycleEvent(LIFE_CYCLE.ON_Destroy);
      validateNavigationId(this._navigationid, navigationId);
    }
    return navigationId;
  }

  /**
   * Updates the content for the next route.
   * This is used to navigate to the next route and trigger lifecycle events.
   * If the route is a fallback route, the fallback template is used.
   *
   * @param {StringKeysOnly<RouteConfigType> | FallbackRoute<RouteConfigType>} routeid - The route or fallback ID to navigate to.
   *
   * @param paramsObj - Parameters for the route.
   * @returns {RouterPublicFunctionResult} - The result of the operation.
   */
  private _updateNextContent(
    routeid: StringKeysOnly<RouteConfigType> | FallbackRoute<RouteConfigType>,
    paramsObj?: ParamsObj<RouteConfig[string]>,
  ): RouterPublicFunctionResult {
    try {
      const navigationId = this._prepareRouteChange();
      this._routeParamsMap = paramsObj
        ? new Map(Object.entries(paramsObj))
        : new Map();
      this._updateNextRouteDataCache(routeid);
      const path = this._generateTargetRoutePath();
      if (!this._isPopstateEvent) {
        updateHistory(routeid, this._routeParamsMap, path);
      }
      this._isPopstateEvent = false;
      this._startNextLifecycle(navigationId);
      return {
        success: true,
        message: "Navigation is success",
      };
    } catch (error) {
      return this._handleError("Navigation failed", error);
    }
  }

  /**
   * Generates the path for the target route.
   * This is used to determine the path for the target route based on the route parameters.
   *
   * @returns {string} - The path for the target route.
   */
  private _generateTargetRoutePath(): string {
    let targetPath = "";
    if (this.routeData.path.hasDynamicPath) {
      targetPath = buildPathFromRouteParams(
        this.routeData.path,
        this._routeParamsMap,
      );
    } else {
      targetPath = this.routeData.path.stringified;
    }
    return targetPath;
  }

  /**
   * Updates the route data cache for the next route.
   *
   * @param {StringKeysOnly<RouteConfigType> | FallbackRoute<RouteConfigType>} nextRouteId - The route or fallback ID to navigate to.
   *
   * @returns {void}
   * */
  private _updateNextRouteDataCache(
    nextRouteId:
      | StringKeysOnly<RouteConfigType>
      | FallbackRoute<RouteConfigType>,
  ): void {
    if (this.routeid === nextRouteId) return;
    this.routeid = nextRouteId;
  }

  /**
   * Starts the lifecycle for the next route.
   * Verify that new navigation occurs after each lifecycle event.
   * If a new navigation has occurred, suspend operations after that lifecycle event.
   *
   * @param {Symbol} currentNavigationId - The current navigation ID.
   * @returns {void}
   */
  private _startNextLifecycle(currentNavigationId: Symbol): void {
    this._triggerLifecycleEvent(LIFE_CYCLE.ON_LOAD);
    validateNavigationId(this._navigationid, currentNavigationId);
    this.clearOutletContent();
    this._triggerLifecycleEvent(LIFE_CYCLE.ON_BEFORE_NAVIGATE);
    validateNavigationId(this._navigationid, currentNavigationId);
    this._showNextContent();
    this._triggerLifecycleEvent(LIFE_CYCLE.ON_AFTER_NAVIGATE);
  }

  /**
   * Clears the content of the outlet element.
   * This is used to remove the content for the current route.
   * This is typically called before displaying the content for the next route.
   *
   * @returns {void}
   */
  public clearOutletContent(): void {
    while (this.outletElement.firstChild) {
      this.outletElement.removeChild(this.outletElement.firstChild);
    }
  }

  /**
   * Shows the content for the next route.
   *
   * @returns {void}
   */
  private _showNextContent(): void {
    this.outletElement.appendChild(this.clone);
  }

  /**
   * Triggers a lifecycle event for the current route.
   *
   * @param {LIFE_CYCLE} hookName - The lifecycle event to trigger.
   * @returns {void}
   */
  private _triggerLifecycleEvent(hookName: LIFE_CYCLE): void {
    const routeHook = this.routeData[hookName];

    const hookContext: RouteHookContext = {
      templateContent: this.routeTemplate.content,
      clone: this.clone,
      routeContext: {
        params: this._routeParamsMap,
      },
      customContext: this.routeData.customContext ?? {},
    };

    if (this._onAllConfig) {
      const onAllHookContext: OnAllHookContext = {
        routeContext: {
          routeid: this.routeid,
          params: this._routeParamsMap,
        },
        customContext: this._onAllConfig?.customContext ?? {},
      };
      this._onAllConfig[hookName]?.(onAllHookContext);
    }

    routeHook?.(hookContext);
  }

  /**
   * Handles the popstate event.
   * This is used to handle route changes when the back or forward button is clicked.
   *
   * @returns {void}
   */
  private _handlePopState = (): void => {
    this._isPopstateEvent = true;
    const { routeid, paramsMap } = window.history.state;
    this.goto(routeid, paramsMap);
  };

  /**
   * Handles errors that occur during routing.
   * This is used to log errors and return an error message to the user.
   *
   * @param {string} title - The title of the error.
   * @param {unknown} error - The error that occurred.
   * @returns {RouterPublicFunctionResult} - The result of the operation.
   */
  private _handleError(
    title: string,
    error: unknown,
  ): RouterPublicFunctionResult {
    if (error instanceof RoutingError) {
      console.error(`[${title}]`, error.message);
      return {
        success: false,
        message: error.message,
      };
    }
    console.error("Unhandled error type:", error);
    return {
      success: false,
      message: "Unexpected error occurred",
    };
  }

  /**
   * Handles route changes when a <route-link> element is clicked.
   *
   * @param {Event} event - The event that triggered the route change.
   * @returns {void}
   */
  private _handleRouteChange = (event: Event): void => {
    const target = event.target as HTMLElement;
    if (target instanceof RouteLink) {
      if (
        event.type === "click" ||
        (event.type === "keydown" && (event as KeyboardEvent).key === "Space")
      ) {
        event.preventDefault();
        this._routeLinkActivated(target);
      }
    }
  };

  /**
   * Handles route changes when a <route-link> element is clicked.
   *
   * @param {RouteLink} routeLink - The <route-link> element that was clicked.
   * @returns {void}
   */
  private _routeLinkActivated(routeLink: RouteLink): void {
    const nextRouteId = routeLink.dataset
      .routeid as StringKeysOnly<RouteConfigType>;
    const nextRouteParams = routeLink.routeParams;
    if (nextRouteId) {
      this.goto(nextRouteId, nextRouteParams);
    } else {
      throw new RoutingError({
        message:
          "The <route-link> element that was clicked did not have a data-routeid attribute set.",
        place: "_routeLinkActivated",
        errorType: RouteErrorType.RouteIdNotSet,
      });
    }
  }
}

customElements.define(ELEMENT.ROUTE_MASTER, RouteManager);
