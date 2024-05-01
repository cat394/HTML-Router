# HTML Router

## HTML Router とは何ですか？

HTML Router はシンプルかつ簡単に SPA のルーティングを構築するためのルーターです。

従来のコンポーネントベースやディレクトリベースのやり方と違い、私たちが作成した`<route-manager>`と`<route-link>`という２つの Web コンポーネントにルート情報を提供するだけで機能します。

1. **NO FRAMEWORK**

   フレームワークに頼ることなく純粋な JavaScript(または Typescrpt)でルートを作成することができます。

2. **SIMPLE**

   このルーターのコンセプトは、HTML の`<template>`要素を切り替えることにあります。
   それぞれの`<template>`要素にルート ID を付けます。そして、ユーザーが訪問したときに、その URL や、`<route-link>`コンポーネントから送られてきたルートに関する情報から`<route-manager>`が適切な`<template>`要素を特定して表示することで、SPA を作ります。

   また、コンテンツの表示前や表示後、次のコンテンツへ移動する前など、全てのルートや各ルートのライフサイクルに実行できる関数を簡単に設定できます。

3. **TYPESCRIPT SUPPORT**

   Typescript の型付けにより、設定ファイルを定義するだけで動的パラメータが自動的に抽出されて型付けされるため、必要でない限り、いちいち動的パラメータを別に型定義する必要もありません。

## インストール

```bash
npx jsr add @htmllover/html-router
```

## ガイド(初級編)

ここでは Vite の Vanilla Typescript プロジェクトの初期状態からのガイドとなります。基本的な使い方をステップバイステップで説明します。

1. フォールバックを設定する

   `[fallback]`はシンボルのため、インポートしてください。これにより、他の文字列型をキーに持つプロパティとの構造の違いを型で定義しています。オブジェクトが正しい形をしているかどうかは RouteConfig 型で判断します。satisfies キーワードにより、routeConfig オブジェクトは、それの実際の厳密な型を保ちつつ、RouteConfig 型の条件を満たしているかチェックします。これから定義するすべてのルートのルート ID を持たないページにユーザーが飛ぶとき、このパスにリダイレクトされます。
   path の値は path タグ関数で定義します。これについては動的パスを定義するときに真価を発揮します。

   これで、`<route-manager>`以下にある`<template data-fallbackid=”PageNotFound”>`が表示されるようになりました。

   ```ts
   const routeConfig = {
     [fallback]: {
       PageNotFound: {
         path: path`/404`,
       },
     },
   } satisfies RouteConfig;
   ```

2. 静的パスを設定する

   さて、フォールバックの準備が整ったので、次はホームページへのルートを作成しましょう。

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

   これにより、`<template data-routeid=”home”>`内にあるコンテンツがルートパスだけで表示できるようになりました！

3. 動的パスを設定する

   Web アプリケーションを構築するときには静的パスだけではなく動的パスも必要になります。例えば、ショッピングアプリを作るとしましょう。このとき、全ての商品の詳細を表示するためのルートをいちいち手作業で作っていたらキリがありません。

   /products/productA, /products/productB, /products/productC…まぁ、商品の数が少ないのであればそれほど苦労はしないかもしれませんが、これが 100 個や 200 個だったらどうでしょうか？手に負えなくなってしまいます。

   そこで、動的パスが役立ちます。

   動的パスはパスの中にある変数だと考えてください。先ほどの例に戻ると、いちいちルートを定義するのではなく、/products/[PRODUCT_NAME]のようにルートを作ります。そしてユーザーが/products/productA にアクセスしたとき、私たちはユーザーがどの商品にアクセスしたかを知らなくても PRODUCT_NAME という変数を使って動的にコンテンツを表示することができます。

   はい、私たちはそれを簡単に解決します。まずはパスを作ることから始めてみましょう。

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

   動的パスは${プレースホルダー名}という風にタグ関数内の式として定義します。こうすることで、後で説明するように productName を使って、その動的の箇所に実際に当てはめられた値を取得できるようになります。

4. コンテンツを定義する

   さて、パスを定義したので、それぞれのルートに合わせたコンテンツを表示してみましょう。

   HTML ファイルを用意して開きます。まずは”PageNotFound”のフォールバックで表示するコンテンツを作成することから始めます。

5. `<route-manager>`を配置する

   ルートごとに更新したいコンテンツはすべて`<route-manager>`に書きます。この要素は、先ほど私たちが作成したルート設定オブジェクトを受け取ると、その情報に合わせて適切な`<template>`要素を選び表示します。

   ```html
   <html>
     <body>
       <route-manager></route-manager>
     </body>
   </html>
   ```

6. `<template>`を配置する

   `<route-manager>`は data-fallbackid または data-routeid というカスタム属性を持つ`<template>`をパスごとに変更します。それぞれの属性の値には先ほど私たちが定義したルート設定オブジェクトのキー(以降これをルート ID といいます)を持つようにしてください。[fallback]プロパティで定義したルートのコンテンツは data-fallbackid、それ以外で定義したルートは data-routeid にそれぞれのルート ID を値とします。まぁ百聞は一見に如かず、とりあえず見てみましょう。

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

   はい、これだけです。これにより`<route-manager>`は受け取ったルート設定オブジェクトに合致しないルートの場合に、このコンテンツを表示するようになります。

   ホームページでのみ表示したいコンテンツも同様のやり方で追加していくことが出来ます。

   ```html
   <route-manager>
     <template data-fallbackid="PageNotFound">
       <h1>404</h1>
       <p>Page not found</p>
     </template>
     <template data-routeid="home">
       <h1>Home</h1>
       <p>Here is home page</p>
     </template>
   </route-manager>
   ```

   これでコンテンツを表示するための準備が整いました。あとは`<route-manager>`にルート設定オブジェクトを渡すだけです！

7. ルートを初期化する

   コンテンツを表示するのに必要なコードに複雑なことは何もありません。

   1. convertRouteConfig 関数にルート設定オブジェクトを渡す

      私たちが作成したルート設定オブジェクトは見た目はいいですが、ルータ―側が消費するのには少し面倒です。そのためこの関数により効率的にルーターが消費できるデータ構造に変換します。

      ```ts
      const convertedRouteConfig = convertRouteConfig(routeConfig);
      ```

   2. コンポーネントが接続されるを待つ

      カスタム要素は非同期で読み込まれるため、`<route-manager>`がちゃんとカスタム要素として登録し終わってから`<route-manager>`にルート設定オブジェクトを渡さなくてはいけません。そのため、以下のコードを追加します。注記：`<route-link>`は後で使います。

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

   3. `<route-manager>`に変換後のルート設定オブジェクトを渡す
      これで終わりです！`<route-manager>`の setRouteConfig メソッドで変換後のオブジェクトを渡し、initializeRoute()で初期化を完了させます！

      ```ts
      (async function setupRouter() {
        const convertedRouteConfig = convertRouteConfig(routeConfig);
        await registerRouteComponent();
        const mainRouteManager = document.querySelector("route-manager");
        mainRouteMaster &&
          mainRouteMaster.setRouteConfig(convertedRouteConfig) &&
          mainRouteMaster.initializeRoute();
      })();
      ```

8. コンテンツを表示する
   あとは開発者サーバーを開くなり、なんなりしてページを表示させてください！すると、フォールバックのコンテンツは表示されずに、ホームページのみのコンテンツが表示されていると思います。また、/error などの事前に設定していないパスにアクセスすると 404 ページが表示されます。お疲れ様でした、おめでとう 🎉

   これで基本的なルートの作成はできるようになりました。この後はルート間を移動してみたり、動的ルートを設定するガイドとなります。

## ガイド(中級編)

さて、ホームページを表示させられましたが、実際にルート間を移動したり、動的なコンテンツを表示するページを作るにはどうすればよいのでしょうか？また新しいことを学ばなくてはいけませんか？...いえ、心配する必要はありません。これまで学んだことを少し拡張するだけです。学ぶことは以下の通りです。

- ルート間の移動
- 動的なコンテンツの表示

### ルート間の移動

別のルートのコンテンツに移動するやり方はフォールバックの場合と通常のルートでメソッド名は異なりますが、使い方は同じです。**フォールバックの場合は、routeManager.gotoFallback()、通常のルートの場合は、routeManager.goto()**を使います。また、リンクでの移動の場合を望む場合は`<route-link>`を使います。これは`<route-manager>`へ指定のルート情報を送る特別なコンポーネントです。それぞれ具体的に見ていきましょう。

1. `<route-link>`を使った移動方法

   新しく About ページを作ってみましょう。まずは先ほどのガイドで定義したルート設定オブジェクトに about ルートを追加します(product ルートは後でやるため今は提示していません)。

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

   そうしたら、HTML に戻って About ページを追加しましょう。

   ```html
   <route-manager>
     <!-- フォールバックとホームルートは省略している -->
     <template data-routeid="about">
       <h1>About</h1>
       <p>Here is about page</p>
     </template>
   </route-manager>
   ```

   コンテンツの作り方は前のガイドで示した通りです。そして、ホームページに`<route-link>`コンポーネントを追加し、data-routeid 属性に About ページのテンプレート要素の data-routeid 属性と同じ値を付与します。

   ```html
   <template data-routeid="home">
     <h1>Home</h1>
     <p>Here is home page</p>
     <route-link data-routeid="”about”">About</route-link>
   </template>
   ```

   これで OK です。あとはホームページにあるリンクをクリックしてみてください！

   ホームページが消え、About ページへ移動しました 🎉

2. goto メソッドを使用した方法
   例えば、あなたは認証が必要なアプリを作っているとします。そのときに、認証されていないユーザーがサービスに訪問しようと試みたときに、そのユーザーを簡単にログインページへリダイレクトできたら便利です。

   ルート間をプログラムで操作するために使うのが routeManager.goto()です。これは`<route-link>`をクリックしたときに route-master が内部で使用しているものと同じです。そのため、`<route-master>`への参照さえあればすぐに使い始めることができます。

   ルートが初期化されると About ページへ移動するように変更してみましょう。
   setupRouter()に一行だけ追加します。

   ```ts
   (async function setupRouter() {
     const convertedRouteConfig = convertRouteConfig(routeConfig);
     await registerRouteComponent();
     const mainRouteManager = document.querySelector("route-manager");
     mainRouteManager &&
       mainRouteManager.setRouteConfig(convertedRouteConfig) &&
       mainRouteManager.initializeRoute() &&
       mainRouteManager.goto("about"); // この行を加える
   })();
   ```

   すると、サイトに移動するとすぐさま about ページへ移動したことが分かると思います。

3. フォールバックへの移動
   ユーザーが定義されていないルートにアクセスしようと試みたときや権限のないユーザーが特定のパスにアクセスしたときなどにフォールバックを用意しておくとユーザーに優しいですよね。HTML Router ではこれを簡単に行うことができます。

   今度はサイトにアクセスすると直ぐに 404 のフォールバックページへ移動するように更新してみましょう。

   ```ts
   (async function setupRouter() {
     const convertedRouteConfig = convertRouteConfig(routeConfig);
     await registerRouteComponent();
     const mainRouteManager = document.querySelector("route-manager");
     mainRouteManager &&
       mainRouteManager.setRouteConfig(convertedRouteConfig) &&
       mainRouteManager.initializeRoute() &&
       mainRouteManager.gotoFallback("PageNotFound"); // メソッド名が変更された
   })();
   ```

   > Typescript 開発者へ：

   goto()や gotoFallback()でルート ID のインテリセンスを得るには以下のように RouteMaster クラスにルート設定オブジェクトを渡して`<route-manager`を参照してください。

   ```ts
   const mainRouteManager =
     document.querySelector<RouteManager<typeof routeConfig>>("route-manager");
   ```

   すると goto()や gotoFallback()で設定したルート ID が提案されます。

### 動的なコンテンツの表示

静的なコンテンツへの移動はマスターしました。しかし動的にコンテンツを表示したい場合はどうすればよいのでしょうか。私たちは以前に動的な箇所は path タグ関数内で式として表し、それの名前を利用して使えることも学習しましたが、実際にどのようにするのでしょうか？

はい、その質問に答えるために**ライフサイクル**という概念について説明させてください。

#### ライフサイクル

まず私たちがどのように各ルートのコンテンツを入れ替えているのかを理解するとこの後の説明がとても自然に感じられるため、それから説明します。

1. 初期化

   ユーザーは URL からサイトに来ます。このときのパスの最初のセグメントとルート設定時に定義していた各ルートの path 関数の戻り値である params.firstSegment(パスの始めの/から 2 番目の/までの文字列) が照合され、適切なルートが選択されます。そして、そのルート ID を持つテンプレート要素をクローンし、子要素に作成しておいたアウトレット要素にそれを挿入して表示します。

2. リンクがクリックされる

   別のルートへ移動するとき、そのアウトレット要素の中身を空にし、リクエストされたルート ID を持つルートをルートをまた照合し、選択します。そして、その後は前と同様です。

このような処理を行っているため、各ルート設定時に定義しておいた任意の関数(各ルートオブジェクトは path タグ関数でだけではなく特定のタイミングに実行されるべき関数も一緒に設定することができます。後ほどコードを見せます)を、コンテンツが表示される前や後の様々な処理が行われていく中のそれぞれのタイミングで実行することができます。

このように、各ルートに事前に設定された関数が呼び出されるタイミングを**ライフサイクル**と呼び、これらに関連づけられた関数を**フック**と呼んでいます。ライフサイクルは以下の 4 つになります。

1. onLoad

   このライフサイクルに関連付けられたフックはルートのコンテンツが表示される前かつ、以前のコンテンツが消される前に関数を実行します。この関数の実行時に動的なコンテンツをクローンされたノードに生成することで、以前のコンテンツが消されてからこのルートのコンテンツが表示されるまでのホワイトアウトした状態の時間を縮めることができます。

2. onBeforeNavigate

   このライフサイクルに関連付けられたフックはルートのコンテンツが表示される前かつ、以前のコンテンツが削除されてから実行されます。これはコンテンツが表示される前にスクロールを上に持って行くなどの用途に使えます。

3. onAfterNavigate

   このライフサイクルに関連付けられたフックはルートのコンテンツが表示された後に実行されます。これはそのルートのコンテンツとは直接関係しない、例えば分析などのコードを実行するのが良いかもしれません。

4. onDestroy

   このライフサイクルに関連付けられたフックはルートのコンテンツが削除された後に実行されます。これはそのルートで実行していたイベントリスナーなどのクリーンアップ処理を行うのに最適です。

   フックは以下のように設定することができます。

   ```ts
   const routeConfig = {
     // フォールバックは省略している
     home: {
       path: path`/`,
       onDestroy: () => console.log("Leave home"),
     },
   } satisfies RouteConfig;
   ```

これでホームページを離脱し新しいページへ行く毎に、コンソールに`Leave home`と表示されます。他のフックも同様のやり方で定義できます。

#### 動的セグメントを扱う方法

さて、動的なコンテンツを表示するための方法に戻りましょう。動的なコンテンツを作るには実際の URL 内にある動的セグメントに当たる値を取得する必要があります。このような各ルートのみで取得できる情報や共有する情報は上記で説明したフックで扱うことができます。それではコードを書いてみましょう。

1. 動的ルートを作成する

   ```ts
   const routeConfig = {
     // フォールバックは省略している
     home: {
       path: path`/`,
     },
     product: {
       path: path`/products/${"productName"}`,
     },
   } satisfies RouteConfig;
   ```

2. フックを定義する
   フックはコールバック関数であり context オブジェクトという、いろんな情報が詰まったオブジェクトを受け取ります。動的パラメータにアクセスしたいときは context.routeContext.params という Map 型のデータを使います。

   まずはコードを見てみましょう。今はまだ型定義がなく型エラーが発生してしまっていますが、すぐに改善する方法を提示します。

   ```ts
   const onBeforeNavigateAtProducts = (context) => {
     const productName = context.routeContext.params.get("productName");
     if (productName) {
       console.log("Product:", productName);
     }
   };
   ```

   型エラーを解消するためには、**Hook** という関数の型と context オブジェクトの型を定義するための **RouteContext** という 2 つの型をこの関数に適用します。

   RouteContext にはそのフックを定義するルートのルート ID を持つオブジェクトをジェネリック型として渡します。

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

   あとは関数をフックとして登録します。

   ```ts
   const routeConfig = {
     // フォールバックは省略している
     home: {
       path: path`/`,
     },
     product: {
       path: path`/products/${"productName"}`,
       onBeforeNavigate: onBeforeNavigateAtProduct, // この行を加える
     },
   } satisfies RouteConfig;
   ```

   HTML で product ページを作りアクセスしてみましょう。

   ```html
   <route-manager>
     <!--フォールバックとホームのコンテンツは省略 -->
     <template data-routeid="product">
       <h1></h1>
       <p>Here is product page</p>
     </template>
   </route-manager>
   ```

   これで'/products/productA'というリンクへアクセスしコンソールを確認すると"Product: productA"と表示されます。

   コンソールだけでは退屈なので実際にコンテンツを表示するように更新しましょう。フックは設定されたルートの template 要素の content プロパティの参照である **templateContent** とクローン化した template の参照である **cloneNode** も扱うことができます。

   なぜ 2 つに分けられているのか疑問に思うかもしれません。

   はい、実は templateContent で任意の要素のプロパティを更新してもそれはクローン化された DOM には反映されなかったり、実際の DOM にアクセスして操作を行うには cloneNode を使う必要があるからです。templateContent は私たちが目にしている HTML の`<template>`であり、cloneNode は実際に表示されるコンテンツを指すと考えれば簡単かもしれません。ほとんどのケースでは cloneNode を使えば問題はありません。

   それでは製品タイトルが表示されるようにフックを更新してみましょう。

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

   productA という文字がレンダリングされましたね。これで動的にコンテンツを表示できるようになりました 🎉

### すべてのルートで関数を実行する

さて、各ルートでフックを使えるようになりましたが、すべてのルートで実行したい共通のコードがあった場合はどうすればよいのでしょうか。例えば、コンテンツが切り替わる前にスクロール位置を一番上に持っていきたいときなどです。

はい、そのようなケースに備えてルート設定オブジェクトに`[onAll]`プロパティを使うことができます。onAll も fallback と同じようにシンボルです。上記のようなケースでは、各コンテンツが表示される前かつ以前のコンテンツが消された後に実行したいため、onBeforeNaivigate ライフサイクルを使うのが最適です。

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

ちなみに、onAll で設定されたフックは各ルートで設定されたフックよりも前に実行されます。

### `<route-link>`の使い方

`<route-link>`コンポーネントは 1 つのメソッドを提供しています。

1. setRouteData()

   これは移動するルート ID を自身の data-routeid 属性に付与したり、オプションの第二引数の params オブジェクトを自身の routeParams にセットします。

   ジェネリック型の初めにはルート設定オブジェクトを受け取り、params を定義する際にはそのルートデータの型を渡すことで型安全に定義できます。

#### 使用例

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

## ガイド(上級編)

これはガイドの最終章となります。これを終えると HTML Router のすべてを理解することになります。学ぶことは以下の通りになります。

- customContext

- onAll や fallback のフックに正確な context の型を与える

### CustomContext

時々、一連のライフサイクルフックで何かデータを共有したいときがあります。例えば、onBeforeNavigate で setTimeout()を使ってタイマーを設定し、そのタイマー ID を onDestroy で clearTimeout()に渡したいときなどクリーンアップ処理が必要な場面や何かのデータをすべてのライフサイクルで使えるようにしたい場合もあるかもしれません。

その時に役立つのが **customContext** です。customContext はすべてのライフサイクルで共有しその初期値をライフサイクルの間で変更することが可能なオブジェクトです。

さっそく、まずは home ルートに設定する customContext の型を定義しましょう。

```ts
const routeConfig = {
  // フォールバックは省略している
  home: {
    path: path`/`,
    customContext: {
      color: "red",
    },
  },
} satisfies RouteConfig;
```

OK、これで home ルートの各ライフサイクルのフックで context.customContext.color で値にアクセスできるようになりました。

そして、フックを定義して...

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

それからフックを設定するっと...

```ts
const routeConfig = {
  // フォールバックは省略している
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

よし、これでホームページにアクセスしたときと別のルートへ移動したときに、`Color red`と表示されるようになりました...え？customContext の型を厳密に定義したいって？

もちろん！私たちは喜んで型を厳密にする機会を与えています。

まずは customContext の型を定義しましょう。

```ts
type HomeCustomContext = {
  color: string;
};
```

次に、satisfies キーワードで customContext の定義時にこの型の形をしているかチェックしましょう。

```ts
const routeConfig = {
  // フォールバックは省略している
  home: {
  path: path`/`,
  onBeforeNavigate: onBeforeNavigateAtHome,
  onDestroy: onDestroyAtHome,
  customContext: {
    color: 'red'
  } satisfies HomeCustomContext // check customContext type
} satisfies RouteConfig;
```

最後に、RouteHookContext 型に、customContext の型をジェネリック型として渡します。

```ts
const onBeforeNavigateAtHome: Hook = (
  context: RouteHookContext<(typeof routeConfig)["home"], HomeCustomContext>,
) => {
  console.log("Color", context.customContext.color);
};

const onDestroyAtHome: Hook = (
  context: RouteHookContext<(typeof routeConfig)["home"]>,
  HomeCustomContex,
) => {
  console.log("Color", context.customContext.color);
};
```

すると、素晴らしいインテリセンスとともに型付けされていることが分かります 👍

ライフサイクルの途中で値を変更することもできます。タイマー ID など、動的に生成される値を共有したいときに便利です。

```ts
const onBeforeNavigateAtHome: Hook = (
  context: RouteHookContext<(typeof routeConfig)["home"], HomeCustomContext>,
) => {
  context.customContext.color = "blue"; // change value
};

const onDestroyAtHome: Hook = (
  context: RouteHookContext<(typeof routeConfig)["home"]>,
  HomeCustomContex,
) => {
  console.log("Color", context.customContext.color); // blue
};
```

よし、これで CustomContext を理解しました！

ちなみに、各ルートの customContext はそれぞれのルートで隔離されており、onAll のフックからもアクセスすることができません。この制限により customContext の値が更新された場所を特定しやすくなります。

### onAll のフック

私たちは以前に onAll はすべてのルートで共通のロジックを実行したい場合に便利だと学びましたが、onAll のフックに渡される context オブジェクトは他のルートのフックと少し異なるため注意が必要です。**onAll のフックは各ルートの templateContent にも cloneNode にもアクセスできず**、代わりに routeContext.routeid から現在のルートの ID と動的セグメントの値を routeContext.params で受け取ります。

また、以前にも説明したように各ルートの customContext の値にもアクセスできず、onAll で定義した customContext はすべてのルートで共有されずに onAll のライフサイクル内でのみアクセスできます。この仕様は onAll は極力すべてのルートで共通するロジックを定義するだけの場所であり、特定のルートの動作はそれぞれのルートで定義すべきだからです。

onAll はとても便利ですが使い方によっては管理不能になります。そのため初めからこうした制限を設けています...

onAll の context オブジェクトは OnAllHookContext 型にジェネリック型として routeConfig 型を提供するだけで型安全を得ることができます。

```ts
const onAllBeforeNavigate: Hook = (
  context: OnAllHookContext<typeof routeConfig>,
) => {
  console.log("Navigating to:", context.routeContext.routeid);
};
```

これでルートを移動するたびにそのルートのルート ID がコンソールに出力されるようになりました！

### Fallback のフック

fallback ルートの各フックは通常のルートのフックと特に何も変わりはありません。ただ、RouteHookContext 型に渡す型に fallback シンボル型を使います。

いろんな種類の 404 ページへのルートを作ってみましょう。

まずはページのスタイルの種類を定義する型とそれらのケースが全て列挙されているかを確認する型を作ります。

```ts
type ErrorPageStyle = "cool" | "cute" | "fresh";
const neverReached = (never: never) => {};
```

そしてフックを作ります。

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

あとはフックを設定して完了です。

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

これで、/404/cool や/404/cute などのパスに飛んでみてください！タイトルの色が変わるはずです。

### アウトレット要素を任意の箇所に配置する

各ルートのコンテンツはアウトレット要素の子要素として配置されます。これは`<route-manager>`の初期化時に生成されますが、自分で好きな場所に配置することもできます。`<route-manager>`要素内の任意の場所に`<div data-outlet="main"></div>`を追加するだけです。

```html
<route-manager>
  <div data-outlet="main"></div>
  <template data-fallbackid="PageNotFound">
    <h1>404</h1>
    <p>Page not found</p>
  </template>
  <template data-routeid="home">
    <h1>Home</h1>
    <p>Here is home page</p>
  </template>
</route-manager>
```

## HTML Router の課題

今までのガイドを見た限り、おそらくとても直感的なルーターだと思っていただけたと思います。しかしそれと同時に課題もたくさんあります。主に開発者たる私(cat394)の知識不足が起因しています。

1. クエリパラメータやハッシュが含まれたセグメントを間違って動的セグメントの値だと認識する

   パスのマッチング処理は非常に難しい課題です。クエリパラメータやハッシュは動的に URL に付与されるため正確に認識するのが難しいと感じています。現状だとクエリパラメータやハッシュが含まれていると、それらを切り捨てたパスが生成される可能性があります。ブラウザの実験段階の機能である URL Pattern を利用してみる価値はあるかもしれません。

2. パフォーマンスが悪い

   現状、cloneNode はページを移動するたびに新しく生成されます。そのため、キャッシュすることができずパフォーマンスに悪影響があります。ちなみに、一度生成したら特に変更を加えることのないコンテンツはフックの context オブジェクトに含まれる templateContent を使ってください。これにより、同じルートに複数回ユーザー訪れてもそのコンテンツは一度だけ DOM 操作を必要とし、それ以降はキャッシュされるためパフォーマンスがよくなります。

## 今後行われる可能性がある新機能の内容

1. クエリパスパラメータのサポート

   通常のルートのフックが受け取る routeContext オブジェクトに query プロパティを追加し、パスにクエリが含まれていた場合に取得できるようにできたらよいと思っています。
   また、`<route-link>`でクエリを含むパスにアクセスすることができればより良いと感じています。以下のような実装になるかもしれません。

   ```ts
   // フックからクエリパスパラメータの値を受け取る
   const onBeforeNavigate = (context) => {
     const color = context.routeContext.query.get("color");
     if (color) {
       // パスにcolorクエリパスパラメータが含まれていた場合の処理
     }
   };

   // <route-link>でクエリパスを持てるようにする
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

## 貢献方法

HTML Router の開発に興味を持っていただきありがとうございます！貢献者として参加する方法は以下の通りです：

バグ報告: 問題を発見した場合は、GitHub の Issues に報告してください。

機能提案: 新しい機能のアイデアがある場合は、まずは Issue を作成してディスカッションを開始してください。

ドキュメント: ドキュメント(README.md)の改善に貢献することも非常に歓迎します。わかりにくい部分や誤字脱字などを見つけた場合は、プルリクエストを送ってください。

コード: 新機能の開発やバグ修正に直接関与する場合は、プルリクエストを通じてコードを提出してください。

ライセンス

HTML Router は MIT ライセンスのもとで公開されています。このライセンスに基づいて、プロジェクトを自由に使用、改変、再配布することが可能です。
