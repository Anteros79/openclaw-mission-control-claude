import { createServer } from "net";
import { spawn } from "child_process";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function findOpenPort() {
  return new Promise((resolvePort, rejectPort) => {
    const server = createServer();

    server.once("error", rejectPort);
    server.once("listening", () => {
      const address = server.address();
      const port = typeof address === "object" && address ? address.port : null;

      server.close(() => {
        if (!port) {
          rejectPort(new Error("Unable to determine an available port."));
          return;
        }

        resolvePort(port);
      });
    });

    server.listen(0, "127.0.0.1");
  });
}

const envPort = process.env.PORT ? Number(process.env.PORT) : null;
const port = envPort || (await findOpenPort());

console.log(`\n  ► Starting Next.js dev on port ${port}\n`);

const child = spawn("npx", ["next", "dev", "--port", String(port)], {
  cwd: root,
  stdio: "inherit",
  shell: true
});

child.on("exit", (code) => process.exit(code ?? 0));
