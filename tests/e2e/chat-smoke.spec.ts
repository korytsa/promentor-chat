import { expect, test } from "@playwright/test";

async function mockBaseApi(page: import("@playwright/test").Page) {
  await page.route("**/auth/me", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ message: "Unauthorized" }),
    });
  });
  await page.route("**/rooms", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
      return;
    }
    await route.fallback();
  });
}

test("shows empty chat screen on /chat", async ({ page }) => {
  await mockBaseApi(page);
  await page.goto("/chat");
  await expect(page.getByText("Select Chat")).toBeVisible();
});

test("redirects unknown route to /chat", async ({ page }) => {
  await mockBaseApi(page);
  await page.goto("/some-random-route");
  await expect(page).toHaveURL(/\/chat$/);
  await expect(page.getByText("Select Chat")).toBeVisible();
});

test("opens chat page by id and renders conversation", async ({ page }) => {
  await mockBaseApi(page);
  await page.route("**/rooms/11111111-1111-4111-8111-111111111111", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "11111111-1111-4111-8111-111111111111",
        displayTitle: "Demo Room",
        name: "Demo Room",
        type: "private",
        updatedAt: "2025-01-01T00:00:00.000Z",
        avatarUrls: [],
      }),
    });
  });
  await page.route("**/rooms/11111111-1111-4111-8111-111111111111/messages?**", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        items: [],
        total: 0,
        limit: 10,
        offset: 0,
      }),
    });
  });

  await page.goto("/chat/11111111-1111-4111-8111-111111111111");
  await expect(page.getByText("Demo Room")).toBeVisible();
  await expect(page.getByText("No messages yet. Say hello.")).toBeVisible();
});

test("opens create group page", async ({ page }) => {
  await mockBaseApi(page);
  await page.goto("/chat/create-group");
  await expect(page.getByRole("heading", { name: "Create Group" })).toBeVisible();
  const groupNameField = page.getByLabel("Group name");
  await groupNameField.fill("My Team");
  await expect(groupNameField).toHaveValue("My Team");
});
