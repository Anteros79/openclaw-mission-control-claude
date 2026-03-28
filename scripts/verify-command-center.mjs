import fs from "fs";
import path from "path";
import { chromium } from "playwright";

const resolveBaseUrl = () => {
  if (process.env.MISSION_CONTROL_BASE_URL) {
    return process.env.MISSION_CONTROL_BASE_URL;
  }

  const liveServerPath = path.join(process.cwd(), "output", "live-server.json");
  if (fs.existsSync(liveServerPath)) {
    const parsed = JSON.parse(fs.readFileSync(liveServerPath, "utf8"));
    if (parsed.url) {
      return parsed.url;
    }
  }

  throw new Error(
    "No mission-control base URL found. Set MISSION_CONTROL_BASE_URL or start the preview server first."
  );
};

const routeChecks = [
  { href: "/", heading: "Overview" },
  { href: "/chat", heading: "Chat" },
  { href: "/operations", heading: "Operations" },
  { href: "/agents", heading: "Agents" },
  { href: "/projects", heading: "Projects" },
  { href: "/research", heading: "Research" },
  { href: "/artifacts", heading: "Artifacts" },
  { href: "/systems", heading: "Systems" },
  { href: "/sessions", heading: "Sessions" }
];

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const waitForHeading = async (page, heading) => {
  const main = page.locator("main");

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const byRole = main.getByRole("heading", { name: new RegExp(heading, "i") }).first();
    if (await byRole.isVisible().catch(() => false)) {
      return;
    }

    const byText = main.getByText(new RegExp(heading, "i")).first();
    if (await byText.isVisible().catch(() => false)) {
      return;
    }

    await page.waitForTimeout(400);
  }

  throw new Error(`Expected heading "${heading}" to be visible.`);
};

const hasForbiddenHost = (href) =>
  /localhost|127\.0\.0\.1|10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+/i.test(
    href
  );

const verifyLinks = async (page) => {
  const hrefs = await page.locator("a[href]").evaluateAll((elements) =>
    elements.map((element) => element.getAttribute("href") || "").filter(Boolean)
  );

  const offenders = hrefs.filter((href) => /:\/\//.test(href) && hasForbiddenHost(href));
  assert(offenders.length === 0, `Found forbidden user-facing links: ${offenders.join(", ")}`);
};

const navigateToRoute = async (page, route) => {
  if (route.href === "/") {
    await page.goto(baseUrl, { waitUntil: "networkidle" });
  } else {
    await page.locator(`nav[aria-label="Primary"] a[href="${route.href}"]`).click();
    await page.waitForTimeout(1800);
  }

  await waitForHeading(page, route.heading);
  await verifyLinks(page);
};

const closeAssistantOverlay = async (page) => {
  const closeButton = page.locator("div.fixed.bottom-24.right-4 button").first();

  if (await closeButton.isVisible().catch(() => false)) {
    await closeButton.click({ force: true });
    await page.waitForTimeout(300);
  }
};

const baseUrl = resolveBaseUrl();
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
page.setDefaultNavigationTimeout(60000);
page.setDefaultTimeout(60000);

try {
  for (const route of routeChecks) {
    await navigateToRoute(page, route);
  }

  const draftText = `Smoke persistence ${Date.now()}`;
  await page.getByRole("button", { name: "Assistant" }).click();
  await page.waitForTimeout(300);

  const overlayTextarea = page.locator("textarea").last();
  await overlayTextarea.fill(draftText);
  await closeAssistantOverlay(page);

  await page.locator('nav[aria-label="Primary"] a[href="/chat"]').click();
  await page.waitForTimeout(1800);
  await waitForHeading(page, "Chat");
  await closeAssistantOverlay(page);
  const chatTextarea = page.locator("main textarea").first();
  await chatTextarea.waitFor({ state: "visible" });
  const draftValue = await chatTextarea.inputValue();
  assert(draftValue === draftText, "Expected the assistant draft to persist from the overlay into the chat workspace.");

  await page.locator("main").getByRole("button", { name: /send/i }).click();
  await page.waitForTimeout(1200);
  assert(await page.getByText(draftText).first().isVisible(), "Expected the sent chat message to appear in chat.");

  const freshPage = await browser.newPage({ viewport: { width: 1440, height: 1100 } });
  await navigateToRoute(freshPage, routeChecks[0]);
  await freshPage.locator('nav[aria-label="Primary"] a[href="/chat"]').click();
  await freshPage.waitForTimeout(1800);
  await waitForHeading(freshPage, "Chat");
  assert(
    await freshPage.getByText(draftText).first().isVisible(),
    "Expected the sent chat message to persist after a fresh page load."
  );
  await freshPage.close();

  console.log(`Mission command center verification passed against ${baseUrl}`);
} finally {
  await browser.close();
}
