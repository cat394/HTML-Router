import { test, expect } from "@playwright/test";

const localhost = "http://localhost:5174";

test("Home page test", async ({ page }) => {
  await page.goto(localhost);

  // タイトルにHomeという文字が含まれているか確認する
  await expect(page).toHaveTitle(/home/);

  // タイトルにHomeという文字が含まれているか確認する
  await expect(page.getByRole('heading', { name: 'Home' })).toBeVisible();
});

test("Static path test", async ({ page }) => {
  await page.goto(localhost);

  // Aboutというリンクをクリックする
  await page.getByRole("link", { name: "About" }).click();

  // タイトルにAboutという文字が含まれているか確認する
  await expect(page).toHaveTitle(/about/);

  // Aliceというタイトルがあるか確認する
  await expect(page.locator('css=h1')).toHaveText("About");

  // URLがhttp://localhost/aboutであるか確認する
  expect(page.url()).toBe(localhost + "/about");
});

test("Single dynamic path test", async ({ page }) => {
  await page.goto(localhost);

  // Aliceというリンクをクリックする
  await page.getByRole("link", { name: "Alice" }).click();

  // タイトルにUsersという文字が含まれているか確認する
  await expect(page).toHaveTitle(/users/);

  // Aliceというタイトルがあるか確認する
  await expect(page.locator("css=#title")).toHaveText("Alice");

  // URLがhttp://localhost/users/aliceであるか確認する
  await expect(page.url()).toBe(localhost + "/users/Alice");
});

test("Multiple dynamic path test", async ({ page }) => {
  await page.goto(localhost);

  // Postsというリンクをクリックする
  await page.getByRole("link", { name: "Posts" }).click();

  // タイトルにUsersという文字が含まれているか確認する
  await expect(page.locator("css=#title")).toHaveText("Alice's posts");

  // URLがhttp://localhost/users/alice/postsであるか確認する
  await expect(page.url()).toBe(localhost + "/users/Alice/posts");
});
