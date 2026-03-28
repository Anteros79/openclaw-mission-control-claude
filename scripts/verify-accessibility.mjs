import fs from "fs";
import path from "path";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";

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

const waitForHeading = async (page, heading) => {
  const main = page.locator("main");

  for (let attempt = 0; attempt < 8; attempt += 1) {
    if (await main.getByRole("heading", { name: new RegExp(heading, "i") }).first().isVisible().catch(() => false)) {
      return;
    }

    if (await main.getByText(new RegExp(heading, "i")).first().isVisible().catch(() => false)) {
      return;
    }

    const body = await page.locator("body").innerText();
    if (/application error/i.test(body)) {
      await page.reload({ waitUntil: "networkidle" });
      await page.waitForTimeout(1200);
      continue;
    }

    if (body.toLowerCase().includes(heading.toLowerCase())) {
      return;
    }

    await page.waitForTimeout(400);
  }

  throw new Error(`Expected heading "${heading}" to be visible.`);
};

const baseUrl = resolveBaseUrl();
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
const page = await context.newPage();
page.setDefaultNavigationTimeout(60000);
page.setDefaultTimeout(60000);

const violations = [];

try {
  await page.goto(baseUrl, { waitUntil: "networkidle" });

  for (const route of routeChecks) {
    if (route.href !== "/") {
      await page.locator(`nav[aria-label="Primary"] a[href="${route.href}"]`).click();
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2200);
    } else {
      await page.waitForTimeout(800);
    }

    await waitForHeading(page, route.heading);

    const results = await new AxeBuilder({ page }).analyze();
    if (results.violations.length > 0) {
      violations.push({
        route: route.href,
        violations: results.violations.map((violation) => ({
          id: violation.id,
          impact: violation.impact,
          nodes: violation.nodes.length
        }))
      });
    }
  }

  if (violations.length > 0) {
    throw new Error(JSON.stringify(violations, null, 2));
  }

  console.log(`Accessibility verification passed against ${baseUrl}`);
} finally {
  await context.close();
  await browser.close();
}
