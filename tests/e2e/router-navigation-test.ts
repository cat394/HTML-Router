import "../../src/components";
import { RouteLink, RouteManager } from "../../src/components";
import { fallback, onAll } from "../../src/constants";
import { convertRouteConfig, path } from "../../src/helpers";
import {
  Hook,
  OnAllHookContext,
  RouteConfig,
  RouteHookContext,
} from "../../src/types";

type HomeCustomContext = {
  title: string;
};

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

function changeTitle(title: string) {
  if (!titleElement) return;
  titleElement.textContent = "HTML Router: " + title;
}

const onAllonBeforeNavigate: Hook = (
  context: OnAllHookContext<typeof routeConfig>,
) => {
  changeTitle(context.routeContext.routeid);
};

const onBeforeNavigateAtHome: Hook = ({
  clonedNode,
  customContext,
}: RouteHookContext<(typeof routeConfig)["home"], HomeCustomContext>) => {
  const aliceLink = clonedNode.querySelector<RouteLink>("#alice");
  const postsLink = clonedNode.querySelector<RouteLink>("#posts");
  if (aliceLink && postsLink) {
    aliceLink.setRouteData<typeof routeConfig, (typeof routeConfig)["users"]>(
      "users",
      {
        params: {
          username: "Alice",
        },
      },
    );
    postsLink.setRouteData<typeof routeConfig, (typeof routeConfig)["users"]>(
      "users",
      {
        params: {
          username: "Alice",
          subpage: "posts",
        },
      },
    );
  }
  console.log(customContext.title);
};
const onLoadAtUsers: Hook = ({
  routeContext: { params },
  clonedNode,
}: RouteHookContext<(typeof routeConfig)["users"]>) => {
  const username = params.get("username");
  const subpage = params.get("subpage");
  const title = clonedNode.querySelector("#title");
  if (!title) return;

  function whenUserPage() {
    return username && !subpage;
  }

  function whenUserPostsPage() {
    return username && subpage === "posts";
  }

  if (whenUserPage()) {
    title.textContent = username!;
  }

  if (whenUserPostsPage()) {
    title.textContent = username + "'s " + subpage;
  }
};

const routeConfig = {
  [onAll]: {
    onBeforeNavigate: onAllonBeforeNavigate,
  },
  [fallback]: {
    PageNotFound: {
      path: path`/404`,
    },
  },
  home: {
    path: path`/`,
    onBeforeNavigate: onBeforeNavigateAtHome,
    onDestroy: () => console.log("leave home"),
    customContext: {
      title: "hello",
    } satisfies HomeCustomContext,
  },
  about: {
    path: path`/about`,
  },
  users: {
    path: path`/users/${"username"}/${"subpage"}/${"postId"}`,
    OnLoad: onLoadAtUsers,
  },
} satisfies RouteConfig;

(async function setupRouter() {
  const convertedRouteConfig = convertRouteConfig(routeConfig);
  await registerRouteComponent();
  const mainRouteManager =
    document.querySelector<RouteManager<typeof routeConfig>>("route-manager");
  mainRouteManager &&
    mainRouteManager.setRouteConfig(convertedRouteConfig) &&
    mainRouteManager.initializeRoute();
})();
