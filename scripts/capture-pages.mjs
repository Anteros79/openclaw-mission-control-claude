import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const root = process.cwd();
const outputDir = path.join(root, "output", "playwright");
const liveServerPath = path.join(root, "output", "live-server.json");

if (!fs.existsSync(liveServerPath)) {
  throw new Error("output/live-server.json not found. Start the preview server first.");
}

const { url } = JSON.parse(fs.readFileSync(liveServerPath, "utf8"));

fs.mkdirSync(outputDir, { recursive: true });

const routes = [
  ["overview", "/", "Overview"],
  ["chat", "/chat", "Chat"],
  ["operations", "/operations", "Operations"],
  ["agents", "/agents", "Agents"],
  ["projects", "/projects", "Projects"],
  ["research", "/research", "Research"],
  ["artifacts", "/artifacts", "Artifacts"],
  ["sessions", "/sessions", "Sessions"],
  ["systems", "/systems", "Systems"]
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  viewport: {
    width: 1600,
    height: 1100
  }
});

const visit = async (targetUrl) => {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await page.goto(targetUrl, { waitUntil: "load" });
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2500);
      return;
    } catch (error) {
      if (attempt === 1) throw error;
    }
  }
};

await visit(url);

for (const [name, route, navLabel] of routes) {
  if (route !== "/") {
    await page.locator(`nav[aria-label="Primary"] a[href="${route}"]`).first().click();
    await page.waitForURL((currentUrl) => currentUrl.pathname === route);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
  }

  await page.screenshot({
    path: path.join(outputDir, `${name}.png`),
    fullPage: true
  });
}

await page.locator('nav[aria-label="Primary"] a[href="/"]').first().click();
await page.waitForURL((currentUrl) => currentUrl.pathname === "/");
await page.waitForLoadState("networkidle");
await page.waitForTimeout(1500);
const assistantButton = page.locator('button[aria-label="Assistant"], button:has-text("Phoenix Assistant")').first();
if (await assistantButton.isVisible().catch(() => false)) {
  await assistantButton.click();
  await page.screenshot({
    path: path.join(outputDir, "assistant-overlay.png"),
    fullPage: true
  });
}

await browser.close();
