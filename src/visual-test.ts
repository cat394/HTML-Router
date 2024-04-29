import "./components";
import { RouteLink, RouteManager } from "./components";
import { fallback, onAll } from "./constants";
import { convertRouteConfig, path } from "./helpers";
import { Hook, RouteConfig, RouteHookContext } from "./types";

const head = document.querySelector("head");
const titleElement = head?.querySelector("title");

const registerRouteComponent = async () => {
  try {
    await Promise.allSettled([
      customElements.whenDefined("route-manager"),
      customElements.whenDefined("route-link"),
    ]);
  } catch (error) {
    console.error(error);
  }
};

type HomeCustomContext = {
  title: string;
};

function changeTitle(title: string) {
  if (!titleElement) return;
  titleElement.textContent = "HTML Router: " + title;
}

const onBeforeNavigateAtHome: Hook = ({
  clonedNode,
  customContext,
}: RouteHookContext<(typeof routeConfig)["home"], HomeCustomContext>) => {
  const aliceLink = clonedNode.querySelector<RouteLink>("#alice");
  const postsLink = clonedNode.querySelector<RouteLink>("#posts");
  if (aliceLink && postsLink) {
    aliceLink.setRouteParams({ username: "Alice" });
    postsLink.setRouteParams<(typeof routeConfig)["users"]>({
      username: "Alice",
      subpage: "posts",
    });
    customContext.title;
  }
};
const onPreContentClearAtUsers: Hook = ({
  routeContext: { params },
  clonedNode,
}: RouteHookContext<(typeof routeConfig)["users"]>) => {
  const username = params.get("username");
  const subpage = params.get("subpage");
  const titleField = clonedNode.querySelector("#title");

  function whenUserPage() {
    return username && !subpage;
  }

  function whenUserPostsPage() {
    return username && subpage;
  }

  if (!titleField) return;

  if (whenUserPage()) {
    titleField.textContent = username!;
  }

  if (whenUserPostsPage()) {
    titleField.textContent = username + "'s " + subpage;
  }
};

const routeConfig = {
  [onAll]: {
    onBeforeNavigate: () => window.scroll(0, 0)
  },
  [fallback]: {
    PageNotFound: {
      path: path`/404/${"pageStyle"}`
    },
  },
  home: {
    path: path`/`,
    onBeforeNavigate: onBeforeNavigateAtHome,
    onClear: () => console.log("leaving home"),
    customContext: {
      title: "hello",
    } satisfies HomeCustomContext,
  },
  about: {
    path: path`/about`,
  },
  users: {
    path: path`/users/${"username"}/${"subpage"}/${"postId"}`,
    onBeforePreContentClear: onPreContentClearAtUsers,
  },
} satisfies RouteConfig;

(async function setupRouter() {
  const convertedRouteConfig = convertRouteConfig(routeConfig);
  await registerRouteComponent();
  const mainRouteManager =
    document.querySelector<RouteManager<typeof routeConfig>>("route-manager");
  mainRouteManager &&
    mainRouteManager.setRouteConfig(convertedRouteConfig) &&
    mainRouteManager.initializeRoute() &&
    mainRouteManager.goto("about");
})();
