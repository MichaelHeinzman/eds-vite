import { readFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const config = JSON.parse(await readFile(resolve(root, "aem.config.json"), "utf8"));
const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const aemCommand = process.platform === "win32" ? "aem.cmd" : "aem";
const useShell = process.platform === "win32";

const build = spawn(npmCommand, ["run", "dev:aem:build"], {
  cwd: root,
  stdio: "inherit",
  shell: useShell,
});
const aem = spawn(aemCommand, [
  "up",
  "--url",
  config.url,
  "--port",
  String(config.port),
  "--open",
  config.open,
], {
  cwd: root,
  stdio: "inherit",
  shell: useShell,
});

const children = [build, aem];
let stopping = false;

function stop(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  children.forEach((child) => {
    if (!child.killed) child.kill("SIGTERM");
  });
  process.exitCode = exitCode;
}

children.forEach((child) => {
  child.on("error", (error) => {
    console.error(`Unable to start ${child.spawnargs[0]}:`, error.message);
    stop(1);
  });
  child.on("exit", (code, signal) => {
    if (!stopping) stop(code ?? (signal ? 1 : 0));
  });
});

process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());
