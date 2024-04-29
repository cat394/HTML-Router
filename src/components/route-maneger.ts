import { ELEMENT_NAME, LIFE_CYCLE_NAME } from "../constants";
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

const { ON_Clear, ON_BEFORE_PRE_CONTENT_CLEAR, ON_BEFORE_NAVIGATE } =
  LIFE_CYCLE_NAME;

export class RouteManager<
  RouteConfigType extends RouteConfig = RouteConfig,
> extends HTMLElement {
  private _isInitialized = false;
  private _isPopstateEvent = false;
  private _isFallback = false;
  private _navigationid = Symbol();
  private _onAllConfig?: ConvertRouteConfigResult["onAllConfig"] = undefined;
  private _fallbackMap: ConvertRouteConfigResult["fallbackMap"] | undefined =
    undefined;
  private _routeMap: ConvertRouteConfigResult["routeMap"] | undefined =
    undefined;
  private _outletElement: HTMLDivElement | null = null;
  private _routeTemplate: HTMLTemplateElement | null = null;
  private _routeid:
    | StringKeysOnly<RouteConfigType>
    | FallbackRoute<RouteConfigType>
    | undefined = undefined;
  private _routeData: RouteData | undefined = undefined;
  private _routeParamsMap: ParamsMap = new Map();
  private _templateClone: DocumentFragment | undefined = undefined;

  connectedCallback() {
    this._createOutletElement();
    this._setupEventListeners();
  }

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
      this._templateClone = document.importNode(
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
      this._templateClone = document.importNode(
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
        place: "getter for templateClone",
        errorType: RouteErrorType.TemplateNotFound,
      });
    }
    this._routeTemplate = template;
  }

  get routeTemplate(): HTMLTemplateElement {
    if (!this._routeTemplate) {
      throw new RoutingError({
        message: `Route template is not set.`,
        place: "getter for templateClone",
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

  get templateClone(): DocumentFragment {
    if (!this._templateClone) {
      throw new RoutingError({
        message: `It was not possible to clone a template element with data-routeid='${this.routeid}' attribute. It may have been intentionally deleted from outside.`,
        place: "getter for templateClone",
        errorType: RouteErrorType.TemplateNotFound,
      });
    }
    return this._templateClone;
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

  public initializeRoute(): RouterPublicFunctionResult {
    try {
      const pathname = window.location.pathname;
      const firstSegment = getPageName(pathname);
      this.routeid = getMatchingRouteId(
        this.routeMap,
        firstSegment,
      ) as StringKeysOnly<RouteConfigType>;
      if (this.routeData.path.hasdynamicPath) {
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

  public goto<T extends RouteConfig[string] = RouteConfig[string]>(
    targetRouteId: StringKeysOnly<RouteConfigType>,
    targetRouteParams?: ParamsObj<T>,
  ): RouterPublicFunctionResult {
    return this._updateNextContent(targetRouteId, targetRouteParams);
  }

  public gotoFallback<T extends RouteConfig[string] = RouteConfig[string]>(
    fallbackId: FallbackRoute<RouteConfigType>,
    fallbackParams?: ParamsObj<T>,
  ): RouterPublicFunctionResult {
    this._isFallback = true;
    return this._updateNextContent(fallbackId, fallbackParams);
  }

  private _prepareRouteChange() {
    const navigationId = Symbol();
    this._navigationid = navigationId;
    if (this._isInitialized) {
      this._triggerLifecycleEvent(ON_Clear);
      validateNavigationId(this._navigationid, navigationId);
    }
    return navigationId;
  }

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

  private _generateTargetRoutePath() {
    let targetPath = "";
    if (this.routeData.path.hasdynamicPath) {
      targetPath = buildPathFromRouteParams(
        this.routeData.path,
        this._routeParamsMap,
      );
    } else {
      targetPath = this.routeData.path.stringified;
    }
    return targetPath;
  }

  private _updateNextRouteDataCache(
    nextRouteId:
      | StringKeysOnly<RouteConfigType>
      | FallbackRoute<RouteConfigType>,
  ) {
    if (this.routeid === nextRouteId) return;
    this.routeid = nextRouteId;
  }

  private _startNextLifecycle(currentNavigationId: Symbol) {
    this._triggerLifecycleEvent(ON_BEFORE_PRE_CONTENT_CLEAR);
    validateNavigationId(this._navigationid, currentNavigationId);
    this.clearOutletContent();
    this._triggerLifecycleEvent(ON_BEFORE_NAVIGATE);
    validateNavigationId(this._navigationid, currentNavigationId);
    this._showNextContent();
    this._triggerLifecycleEvent(LIFE_CYCLE_NAME.ON_AFTER_NAVIGATE);
  }

  public clearOutletContent() {
    while (this.outletElement.firstChild) {
      this.outletElement.removeChild(this.outletElement.firstChild);
    }
  }

  private _showNextContent() {
    this.outletElement.appendChild(this.templateClone);
  }

  private _triggerLifecycleEvent(hookName: LIFE_CYCLE_NAME) {
    const routeHook = this.routeData[hookName];

    const hookContext: RouteHookContext = {
      templateContent: this.routeTemplate.content,
      clonedNode: this.templateClone,
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

  private _handlePopState = () => {
    this._isPopstateEvent = true;
    const { routeid, paramsMap } = window.history.state;
    this.goto(routeid, paramsMap);
  };

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

  private _routeLinkActivated(target: RouteLink): void {
    const nextRouteId = target.dataset
      .routeid as StringKeysOnly<RouteConfigType>;
    const nextRouteParams = target.routeParams;
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

customElements.define(ELEMENT_NAME.ROUTE_MASTER, RouteManager);
