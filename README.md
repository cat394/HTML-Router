# HTML Router

> This document was translated using [chatgpt-md-translator](https://github.com/smikitky/chatgpt-md-translator?tab=readme-ov-file).

## What is HTML Router?

HTML Router is a router for building SPA routing simply and easily.

Unlike traditional component-based or directory-based approaches, it works by providing route information to two web components we created, `<route-manager>` and `<route-link>`.

1. **NO FRAMEWORK**

   You can create routes in pure JavaScript (or Typescript) without relying on a framework.

2. **SIMPLE**

   The concept of this router is to switch `<template>` elements in HTML. Each `<template>` element is given a route ID. When a user visits a URL or when route information is sent from the `<route-link>` component, the `<route-manager>` identifies the appropriate `<template>` element to display based on the route and creates a SPA.

   Additionally, you can easily set up functions that can be executed before or after displaying content, or before moving to the next content, for all routes or each route's lifecycle.

3. **TYPESCRIPT SUPPORT**

   With Typescript typing, dynamic parameters are automatically extracted and typed by defining a configuration file, so you don't need to separately define dynamic parameters unless necessary.

## Installation

```bash
npx jsr add @htmllover/html-router
```

## Guide (Beginner's Edition)

Here is a guide from the initial state of a Vanilla Typescript project in Vite. We will explain the basic usage step by step.

1. Setting up a fallback

   `[fallback]` is a symbol, so import it. This defines the structure difference in type with other properties having string types as keys. The correctness of the object's shape is determined by the RouteConfig type. With the `satisfies` keyword, the routeConfig object checks if it meets the conditions of the RouteConfig type while maintaining its actual strict type. When a user navigates to a page without a route ID defined for all the routes we are about to define, they will be redirected to this path. The value of the path is defined using the `path` tag function, which proves its worth when defining dynamic paths.

   Now, `<template data-fallbackid=”PageNotFound”>` under `<route-manager>` will be displayed.

   ```ts
   const routeConfig = {
     [fallback]: {
       PageNotFound: {
         path: path`/404`,
       },
     },
   } satisfies RouteConfig;
   ```

2. Setting up a static path

   Now that the fallback is set up, let's create a route to the homepage.

   ```ts
   const routeConfig = {
     [fallback]: {
       PageNotFound: {
         path: path`/404`,
       },
     },
     home: {
       path: path`/`,
     },
   } satisfies RouteConfig;
   ```

   This allows the content within `<template data-routeid=”home”>` to be displayed only for the root path!

3. Setting up a dynamic path

   When building a web application, you will need dynamic paths in addition to static paths. For example, let's say you are creating a shopping app. If you had to manually create routes to display details for all products, it would be overwhelming.

   /products/productA, /products/productB, /products/productC... Well, if you have a small number of products, it might not be too difficult, but what if you have 100 or 200 products? It would become unmanageable.

   Therefore, dynamic paths come in handy.

   Think of dynamic paths as variables within the path. Going back to the previous example, instead of defining each route explicitly, we create routes like /products/[PRODUCT_NAME]. Then, when a user accesses /products/productA, we can dynamically display content using the variable PRODUCT_NAME without knowing which product the user accessed.

   Yes, we will solve that easily. Let's start by creating paths.

   ```ts
   const routeConfig = {
     [fallback]: {
       PageNotFound: {
         path: path`/404`,
       },
     },
     home: {
       path: path`/`,
     },
     product: {
       path: path`/products/${"productName"}`,
     },
   } satisfies RouteConfig;
   ```

   Dynamic paths are defined as expressions within tag functions like ${placeholder name}. This allows us to later use productName to retrieve the actual value applied to that dynamic part, as explained later.

4. Define the content

   Now that we have defined the paths, let's display content tailored to each route.

   Open an HTML file. Start by creating the content to display for the "PageNotFound" fallback.

5. Place `<route-manager>`

   All content that needs to be updated per route will be written within `<route-manager>`. This element, upon receiving the route configuration object we created earlier, selects and displays the appropriate `<template>` element based on that information.

   ```html
   <html>
     <body>
       <route-manager></route-manager>
     </body>
   </html>
   ```

6. Place `<template>`

   `<route-manager>` will switch `<template>` elements per path, each with custom attributes data-fallbackid or data-routeid. Ensure that each attribute's value corresponds to a key in the route configuration object we defined earlier (referred to as route ID). Content for routes defined in the [fallback] property should have data-fallbackid, while other routes should have data-routeid with their respective route IDs as values. Seeing is believing, so let's take a look.

   ```html
   <html>
     <body>
       <route-manager>
         <template data-fallbackid="PageNotFound">
           <h1>404: Page not found</h1>
         </template>
       </route-manager>
     </body>
   </html>
   ```

   That's it. `<route-manager>` will now display this content for routes that do not match the received route configuration object.

   You can add content that should only be displayed on the homepage using a similar approach.

   ```html
   <route-manager>
     <template data-fallbackid="PageNotFound">
       <h1>404</h1>
       <p>Page not found</p>
     </template>
     <template data-routeid="home">
       <h1>Home</h1>
       <p>Here is the home page</p>
     </template>
   </route-manager>
   ```

   With this, we are ready to display content. Just pass the route configuration object to `<route-manager>`!

7. Initialize the route

   There is nothing complicated in the code needed to display the content.

   1. Pass the route configuration object to the convertRouteConfig function

      The route configuration object we created looks good, but it's a bit cumbersome for the router to consume. Therefore, this function efficiently converts it into a data structure that the router can consume.

      ```ts
      const convertedRouteConfig = convertRouteConfig(routeConfig);
      ```

   2. Wait for the components to be connected

      Since custom elements are loaded asynchronously, you must wait for `<route-manager>` to be properly registered as a custom element before passing the route configuration object to `<route-manager>`. Therefore, add the following code. Note: `<route-link>` will be used later.

      ```ts
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
      ```

   3. Pass the converted route configuration object to `<route-manager>`
      That's it! Pass the converted object to the setRouteConfig method of `<route-manager` and complete the initialization with initializeRoute()!

      ```ts
      (async function setupRouter() {
        const convertedRouteConfig = convertRouteConfig(routeConfig);
        await registerRouteComponent();
        const mainRouteManager = document.querySelector("route-manager");
        mainRouteManager &&
          mainRouteManager.setRouteConfig(convertedRouteConfig) &&
          mainRouteManager.initializeRoute();
      })();
      ```

8. Display the content
   Now, open the development server or do whatever you need to display the page! You should see only the content of the homepage without the fallback content displayed. Also, accessing paths not pre-configured like /error will display a 404 page. Well done, congratulations 🎉

   You have now learned how to create basic routes. Next, you can try moving between routes and setting up dynamic routes.

## Guide (Intermediate Level)

Now that you have managed to display the homepage, how can you actually move between routes and create pages that display dynamic content? Do you need to learn something new? ...No, there is no need to worry. You just need to slightly extend what you have learned so far. Here are the things you will learn:

- Moving between routes
- Displaying dynamic content

### Moving between routes

The method for moving to the content of another route differs between the fallback case and the normal route, but the usage is the same. **For the fallback case, use routeManager.gotoFallback(), and for the normal route, use routeManager.goto()**. Additionally, if you wish to move via a link, use `<route-link>`. This is a special component that sends the specified route information to `<route-manager>`. Let's look at each of these in detail.

1. How to navigate using `<route-link>`

   Let's create a new About page. First, add the about route to the route configuration object defined in the previous guide (the product route will be added later and is not shown here).

   ```ts
   const routeConfig = {
     [fallback]: {
       PageNotFound: {
         path: path`/404`,
       },
     },
     home: {
       path: path`/`,
     },
     about: {
       path: path`/about`,
     },
   } satisfies RouteConfig;
   ```

   Next, go back to the HTML and add the About page.

   ```html
   <route-manager>
     <!-- Fallback and home routes are omitted -->
     <template data-routeid="about">
       <h1>About</h1>
       <p>Here is about page</p>
     </template>
   </route-manager>
   ```

   Follow the content creation as shown in the previous guide. Then, add the `<route-link>` component to the homepage and assign the same value to the `data-routeid` attribute as the data-routeid attribute of the About page template element.

   ```html
   <template data-routeid="home">
     <h1>Home</h1>
     <p>Here is home page</p>
     <route-link data-routeid="about">About</route-link>
   </template>
   ```

   That's it. Now, try clicking the link on the homepage!

   The homepage will disappear, and you will be redirected to the About page 🎉

2. How to use the goto method

   For example, let's say you are creating an app that requires authentication. It would be convenient if unauthenticated users could be easily redirected to the login page when they try to access the service.

   The `routeManager.goto()` method is used to manipulate routes programmatically. It is the same method used internally by `route-master` when a `<route-link>` is clicked. Therefore, you can start using it immediately if you have a reference to `<route-master>`.

   Let's modify it to move to the About page when the routes are initialized.
   Add just one line to `setupRouter()`.

   ```ts
   (async function setupRouter() {
     const convertedRouteConfig = convertRouteConfig(routeConfig);
     await registerRouteComponent();
     const mainRouteManager = document.querySelector("route-manager");
     mainRouteManager &&
       mainRouteManager.setRouteConfig(convertedRouteConfig) &&
       mainRouteManager.initializeRoute() &&
       mainRouteManager.goto("about"); // Add this line
   })();
   ```

   You should see that you are immediately redirected to the About page when you visit the site.

3. Moving to the fallback

   It's user-friendly to have a fallback prepared for when users try to access undefined routes or when unauthorized users try to access specific paths. This can easily be done in HTML Router.

   Let's update it to immediately move to the 404 fallback page when accessing the site next time.

   ```ts
   (async function setupRouter() {
     const convertedRouteConfig = convertRouteConfig(routeConfig);
     await registerRouteComponent();
     const mainRouteManager = document.querySelector("route-manager");
     mainRouteManager &&
       mainRouteManager.setRouteConfig(convertedRouteConfig) &&
       mainRouteManager.initializeRoute() &&
       mainRouteManager.gotoFallback("PageNotFound"); // The method name has been changed
   })();
   ```

   > For TypeScript developers:
   > To get IntelliSense for route IDs in `goto()` or `gotoFallback()`, pass the route configuration object to the RouteMaster class as shown below to reference `<route-manager>`.

   ```ts
   const mainRouteManager =
     document.querySelector<RouteManager<typeof routeConfig>>("route-manager");
   ```

   This will provide suggestions for the route IDs set in `goto()` or `gotoFallback()`.

### Displaying Dynamic Content

We have mastered moving to static content. But how can we display dynamic content? We have previously learned to represent dynamic parts as expressions inside the `path` tag function and use their names, but how do we actually do it?

To answer that question, let me explain the concept of **lifecycle**.

#### Lifecycle

First, let's understand how we are swapping out the content for each route, as it will make the following explanation feel very natural, and then I will explain further.

1. Initialization

   Users come to the site from a URL. At this time, the first segment of the path and the `params.firstSegment` (the string from the beginning of the path to the second `/`) defined in each route's path function are matched, selecting the appropriate route. Then, a template element with that route ID is cloned, created as a child element, and inserted into the outlet element we created to display it.

2. Link Clicked

   When moving to another route, the content of the outlet element is emptied, the route with the requested route ID is matched again, and selected. Then, the process continues as before.

Because of this process, you can execute any functions defined when setting up each route (each route object can define functions to be executed not only in the `path` tag function but also at specific timings. I will show the code later) at various timings before or after the content is displayed.

In this way, the timing at which the functions pre-set for each route are called is called the **lifecycle**, and the functions associated with these are called **hooks**. There are four lifecycles as follows.

1. onLoad

   The hook associated with this lifecycle runs before the route's content is displayed and before the previous content is cleared. By generating dynamic content on the cloned node at the time this function is executed, you can shorten the time the previous content is cleared to when the content of this route is displayed.

2. onBeforeNavigate

   The hook associated with this lifecycle runs before the route's content is displayed and after the previous content is removed. This can be used for purposes such as scrolling up before the content is displayed.

3. onAfterNavigate

   The hook associated with this lifecycle runs after the route's content is displayed. It may be good to execute code unrelated to the content of that route, such as analytics.```

4. onDestroy

   A hook associated with this lifecycle is executed after the root content is removed. This is ideal for performing cleanup processes such as event listener cleanup that was running on that root.

   Hooks can be set up as follows:

   ```ts
   const routeConfig = {
     // Fallback is omitted
     home: {
       path: path`/`,
       onDestroy: () => console.log("Leave home"),
     },
   } satisfies RouteConfig;
   ```

   With this setup, every time you leave the homepage and go to a new page, `Leave home` will be displayed in the console. Other hooks can also be defined in a similar manner.

#### Handling Dynamic Segments

Now, let's revisit how to display dynamic content. To create dynamic content, you need to retrieve the value corresponding to the dynamic segment in the actual URL. Information that can only be obtained by each route or shared information can be handled with the hooks described above. Let's write some code.

1. Creating a dynamic route

   ```ts
   const routeConfig = {
     // Fallback is omitted
     home: {
       path: path`/`,
     },
     product: {
       path: path`/products/${"productName"}`,
     },
   } satisfies RouteConfig;
   ```

2. Defining a hook
   Hooks are callback functions that receive an object called the context object, which contains various information. When you want to access dynamic parameters, use a Map type data called context.routeContext.params.

   Let's take a look at the code. Currently, there is no type definition and a type error occurs, but we will soon provide a way to improve it.

   ```ts
   const onBeforeNavigateAtProducts = (context) => {
     const productName = context.routeContext.params.get("productName");
     if (productName) {
       console.log("Product:", productName);
     }
   };
   ```

   To resolve the type error, apply two types to this function: a function type called **Hook** and a type called **RouteContext** for defining the type of the context object.

   Pass an object with the route ID of the route where the hook is defined as a generic type to RouteContext.

   ```ts
   const onBeforeNavigateAtProduct = (
     context: RouteHookContext<(typeof routeConfig)["product"]>,
   ): Hook => {
     const productName = context.routeContext.params.get("productName");
     if (productName) {
       console.log("Product:", productName);
     }
   };
   ```

3. Register the function as a hook.

   ```ts
   const routeConfig = {
     // Fallback is omitted
     home: {
       path: path`/`,
     },
     product: {
       path: path`/products/${"productName"}`,
       onBeforeNavigate: onBeforeNavigateAtProduct, // Add this line
     },
   } satisfies RouteConfig;
   ```

   Create a product page in HTML and try accessing it.

   ```html
   <route-manager>
     <!-- The fallback and home content are omitted -->
     <template data-routeid="product">
       <h1></h1>
       <p>Here is product page</p>
     </template>
   </route-manager>
   ```

   When you access the link '/products/productA' and check the console, you will see "Product: productA" displayed.

   It might be puzzling why they are separated into two. Well, the reason is that when you update properties of any element using templateContent, it may not reflect in the cloned DOM, and to access and manipulate the actual DOM, you need to use cloneNode. templateContent represents the `<template>` we see in HTML, while cloneNode refers to the actual displayed content. In most cases, using cloneNode should suffice.

   Now, let's update the hook to display the product title.

   ```ts
   const onBeforeNavigateAtProduct = (
     context: RouteHookContext<(typeof routeConfig)["product"]>,
   ): Hook => {
     const title = context.cloneNode.querySelector("h1");
     const productName = context.routeContext.params.get("productName");
     if (productName) {
       title.textContent = productName;
     }
   };
   ```

   The text "productA" has been rendered. Now you can dynamically display content 🎉

### Executing a Function on All Routes

Now that we can use hooks on each route, what if we have common code that we want to execute on all routes, such as bringing the scroll position to the top before the content switches?

For such cases, you can use the `[onAll]` property in the route configuration object. Similar to fallback, onAll is also a symbol. In cases like the one mentioned above, where you want to execute the code before each content is displayed and after the previous content is removed, using the onBeforeNavigate lifecycle is ideal.

```ts
const routeConfig = {
  [onAll]: {
    onBeforeNavigate: () => window.scroll(0),
  },
  [fallback]: {
    PageNotFound: {
      path: path`/404`,
    },
  },
  home: {
    path: path`/`,
  },
} satisfies RouteConfig;
```

By the way, the hooks set in onAll will be executed before the hooks set in each route.

### How to Use `<route-link>`

The `<route-link>` component provides one method:

1. setRouteData()

   This method sets the route ID to its own data-routeid attribute for navigation and sets the optional second argument params object to its routeParams.

   By passing the route configuration object as the first argument in the generic type and passing the type of the route data when defining params, you can define them safely in terms of types.

#### Example of Use

```ts
const link = document.querySelector("route-link");
link.setRouteData<typeof routeConfig, (typeof routeConfig)["product"]>(
  "product",
  {
    params: {
      productName: "productA",
    },
  },
);
```

## Guide (Advanced)

This is the final chapter of the guide. By completing this, you will have a full understanding of the HTML Router. Here are the topics you will learn:

- customContext

- Providing accurate context types to onAll and fallback hooks

### CustomContext

Sometimes, you may want to share data across a series of lifecycle hooks. For example, setting a timer using setTimeout() in onBeforeNavigate and passing the timer ID to clearTimeout() in onDestroy for cleanup, or making some data available across all lifecycles.

This is where **customContext** comes in handy. customContext is an object that can be shared across all lifecycles and its initial value can be changed between lifecycles.

Let's start by defining the type of customContext to be set on the home route.

```ts
const routeConfig = {
  // Fallback is omitted
  home: {
    path: path`/`,
    customContext: {
      color: "red",
    },
  },
} satisfies RouteConfig;
```

Now, you can access the value at context.customContext.color in each lifecycle hook of the home route.

Next, define the hooks...

```ts
const onBeforeNavigateAtHome: Hook = (
  context: RouteHookContext<(typeof routeConfig)["home"]>,
) => {
  console.log("Color", context.customContext.color);
};

const onDestroyAtHome: Hook = (
  context: RouteHookContext<(typeof routeConfig)["home"]>,
) => {
  console.log("Color", context.customContext.color);
};
```

Then, set the hooks...

```ts
const routeConfig = {
  // Fallback is omitted
  home: {
    path: path`/`,
    onBeforeNavigate: onBeforeNavigateAtHome,
    onDestroy: onDestroyAtHome,
    customContext: {
      color: "red",
    },
  },
} satisfies RouteConfig;
```

Now, when accessing the homepage and navigating to another route, you will see `Color red` displayed... Oh, you want to strictly define the type of customContext?

Of course! We are happy to provide the opportunity to define types strictly.

First, let's define the type of customContext.

```ts
type HomeCustomContext = {
  color: string;
};
```

Next, use the satisfies keyword to check if the definition of customContext matches this type.

```ts
const routeConfig = {
  // Fallback is omitted
  home: {
  path: path`/`,
  onBeforeNavigate: onBeforeNavigateAtHome,
  onDestroy: onDestroyAtHome,
  customContext: {
    color: 'red'
  } satisfies HomeCustomContext // check customContext type
} satisfies RouteConfig;
```

Finally, pass the type of `customContext` as a generic type to the `RouteHookContext` type.

```ts
const onBeforeNavigateAtHome: Hook = (
  context: RouteHookContext<(typeof routeConfig)["home"], HomeCustomContext>,
) => {
  console.log("Color", context.customContext.color);
};

const onDestroyAtHome: Hook = (
  context: RouteHookContext<(typeof routeConfig)["home"]>,
  HomeCustomContext,
) => {
  console.log("Color", context.customContext.color);
};
```

You will see that it is typed with great intellisense 👍

You can also modify values in the middle of the lifecycle. This is useful when you want to share dynamically generated values like timer IDs.

```ts
const onBeforeNavigateAtHome: Hook = (
  context: RouteHookContext<(typeof routeConfig)["home"], HomeCustomContext>,
) => {
  context.customContext.color = "blue"; // change value
};

const onDestroyAtHome: Hook = (
  context: RouteHookContext<(typeof routeConfig)["home"]>,
  HomeCustomContext,
) => {
  console.log("Color", context.customContext.color); // blue
};
```

Great, now you understand CustomContext!

By the way, the `customContext` of each route is isolated for each route and cannot be accessed from the `onAll` hook. This restriction makes it easier to identify where the `customContext` values are being updated.

### onAll Hook

We previously learned that `onAll` is useful when you want to execute common logic for all routes. However, the `context` object passed to the `onAll` hook is slightly different from other route hooks. **The `onAll` hook cannot access `templateContent` or `cloneNode` of each route**, instead, it receives the ID of the current route from `routeContext.routeid` and the values of dynamic segments from `routeContext.params`.

Also, as mentioned before, you cannot access the values of `customContext` for each route, and the `customContext` defined in `onAll` is only accessible within the `onAll` lifecycle and not shared across all routes. This specification ensures that `onAll` is a place to define common logic for all routes and specific route behaviors should be defined in each route.

`onAll` is very useful but can become unmanageable depending on how it is used. Therefore, these restrictions are in place from the beginning...

By providing the `routeConfig` type as a generic type to the `OnAllHookContext` type, you can achieve type safety with the `context` object of `onAll`.

```ts
const onAllBeforeNavigate: Hook = (
  context: OnAllHookContext<typeof routeConfig>,
) => {
  console.log("Navigating to:", context.routeContext.routeid);
};
```

Now, the route ID of each route will be output to the console every time you navigate to a route!

### Fallback Hook

The hooks for the fallback route are no different from regular route hooks. Just use the `fallback` symbol type in the type passed to the `RouteHookContext` type.

Let's create routes to various types of 404 pages.

First, we define a type that specifies the styles of the pages and a type to check if all cases are enumerated.

```ts
type ErrorPageStyle = "cool" | "cute" | "fresh";
const neverReached = (never: never) => {};
```

Next, we create a hook.

```ts
const fallbackOnBeforeNavigate: Hook = (
  context: RouteHookContext<
    (typeof routeConfig)[typeof fallback]["PageNotFound"]
  >,
) => {
  const title = context.clonedNode.querySelector("h1");
  const pageStyle = context.routeContext.params.get(
    "pageStyle",
  ) as ErrorPageStyle;
  if (title && pageStyle) {
    switch (pageStyle) {
      case "cool":
        title.style.color = "blue";
        break;
      case "cute":
        title.style.color = "pink";
        break;
      case "fresh":
        title.style.color = "yellow";
        break;
      default:
        neverReached(pageStyle);
    }
  }
};
```

Finally, we set up the hook.

```ts
const routeConfig = {
  [fallback]: {
    PageNotFound: {
      path: path`/404/${"pageStyle"}`,
      onBeforeNavigate: fallbackOnBeforeNavigate,
    },
  },
};
```

Now, try navigating to paths like /404/cool or /404/cute! The title color should change.

### Placing the outlet element anywhere

The content of each route is placed as a child element of the outlet element. This is generated during the initialization of `<route-manager>`, but you can also place it wherever you like. Simply add `<div data-outlet="main"></div>` to any location within the `<route-manager>` element.

```html
<route-manager>
  <div data-outlet="main"></div>
  <template data-fallbackid="PageNotFound">
    <h1>404</h1>
    <p>Page not found</p>
  </template>
  <template data-routeid="home">
    <h1>Home</h1>
    <p>Here is the home page</p>
  </template>
</route-manager>
```

## Challenges of HTML Router

From what you've seen in this guide, you probably found the router to be very intuitive. However, there are also many challenges. This is mainly due to my (cat394) lack of knowledge as a developer.

1. Incorrectly recognizing segments containing query parameters or hashes as dynamic segment values

   Matching paths is a very difficult task. Query parameters and hashes are dynamically added to URLs, making it difficult to accurately recognize them. Currently, if query parameters or hashes are included, there is a possibility that the path with those parts removed will be generated. It may be worth trying out the experimental browser feature URL Pattern.

2. Poor performance

   Currently, cloneNode is newly generated every time a page is moved, which cannot be cached and negatively impacts performance. By using the templateContent included in the context object of the hook for content that does not need to be changed once generated, even if users visit the same route multiple times, the content only requires DOM manipulation once and is then cached, improving performance.

## Contents of potential new features to be implemented in the future

1. Support for query path parameters

   I am thinking it would be nice to add a `query` property to the `routeContext` object received by regular route hooks, allowing to retrieve query parameters if they are included in the path.
   Additionally, it would be even better if it were possible to access paths with queries using `<route-link>`. The implementation might look like the following.

   ```ts
   // Receive the value of the query path parameter from the hook
   const onBeforeNavigate = (context) => {
     const color = context.routeContext.query.get("color");
     if (color) {
       // Processing when the color query path parameter is included in the path
     }
   };

   // Allow <route-link> to have query paths
   const link = document.querySelector("route-link");
   link.setRouteData("product", {
     params: {
       productName: "productA",
     },
     query: {
       color: "green",
     },
   });
   ```

## Contribution methods

Thank you for your interest in contributing to the development of HTML Router! Here are ways to participate as a contributor:

Bug reports: If you encounter any issues, please report them on GitHub Issues.

Feature proposals: If you have ideas for new features, start by creating an Issue to begin the discussion.

Documentation: Contributions to improving the documentation (README.md) are highly welcome. If you find unclear parts or typos, please submit a pull request.

Code: If you want to directly contribute to the development of new features or bug fixes, submit your code via a pull request.

License

HTML Router is released under the MIT license. Based on this license, you are free to use, modify, and redistribute the project.
