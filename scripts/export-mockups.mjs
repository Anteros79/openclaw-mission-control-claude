import fs from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const outputDir = path.join(repoRoot, "output", "mockups");
const boardIds = [
  "board-shell",
  "board-overview",
  "board-chat",
  "board-operations",
  "board-agents",
  "board-projects",
  "board-libraries",
  "board-systems",
  "board-responsive",
  "board-overlays"
];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const findOpenPort = async (startingPort = 3210) => {
  const tryPort = (port) =>
    new Promise((resolve, reject) => {
      const server = net.createServer();

      server.once("error", (error) => {
        server.close();
        reject(error);
      });

      server.once("listening", () => {
        server.close(() => resolve(port));
      });

      server.listen(port, "127.0.0.1");
    });

  for (let port = startingPort; port < startingPort + 20; port += 1) {
    try {
      return await tryPort(port);
    } catch {
      // Keep trying.
    }
  }

  throw new Error("Unable to find an open port for mockup export.");
};

const waitForServer = async (baseUrl) => {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/mockups`);

      if (response.ok) {
        return;
      }
    } catch {
      // Server not ready yet.
    }

    await wait(1000);
  }

  throw new Error("Mockup export server did not become ready in time.");
};

const ensureOutputDir = async () => {
  await fs.mkdir(outputDir, { recursive: true });
};

const startServer = (port) =>
  spawn(
    path.join(repoRoot, "node_modules", ".bin", process.platform === "win32" ? "next.CMD" : "next"),
    ["start", "--hostname", "127.0.0.1", "--port", String(port)],
    {
      cwd: repoRoot,
      stdio: "inherit",
      shell: process.platform === "win32"
    }
  );

const main = async () => {
  await ensureOutputDir();

  const port = await findOpenPort();
  const baseUrl = `http://127.0.0.1:${port}`;
  const server = startServer(port);

  try {
    await waitForServer(baseUrl);

    const browser = await chromium.launch({
      headless: true
    });

    const page = await browser.newPage({
      viewport: {
        width: 1600,
        height: 1200
      },
      colorScheme: "dark"
    });

    await page.goto(`${baseUrl}/mockups`, {
      waitUntil: "networkidle"
    });

    await page.emulateMedia({
      media: "screen"
    });

    await page.pdf({
      path: path.join(outputDir, "phoenixclaw-mockup-pack.pdf"),
      format: "A3",
      printBackground: true,
      margin: {
        top: "12mm",
        right: "12mm",
        bottom: "12mm",
        left: "12mm"
      }
    });

    for (const boardId of boardIds) {
      const locator = page.locator(`#${boardId}`);
      await locator.scrollIntoViewIfNeeded();
      await locator.screenshot({
        path: path.join(outputDir, `${boardId}.png`)
      });
    }

    await page.screenshot({
      path: path.join(outputDir, "mockup-pack-full-page.png"),
      fullPage: true
    });

    await browser.close();
  } finally {
    server.kill();
  }
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
