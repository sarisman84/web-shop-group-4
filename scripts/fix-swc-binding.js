// Recovers the @swc/core native binding on machines where SWC's default
// cache root (~/.cache) fails its security check (e.g. /home owned by
// another user). Materializes the binding into a safe cache root, then
// copies it into node_modules/@swc/core so `npm run dev` / `npm run build`
// work without setting SWC_NATIVE_BINDING_CACHE.
//
// Run after a fresh `npm install` if next.config.ts fails to load with
// "Failed to load native binding" / ERR_SWC_NATIVE_CACHE:
//   node scripts/fix-swc-binding.js
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const root = path.join(__dirname, "..");
const coreDir = path.join(root, "node_modules", "@swc", "core");
const target = path.join(coreDir, "swc.linux-x64-gnu.node");

function plainLoad() {
  try {
    delete require.cache[require.resolve(coreDir)];
    require(coreDir);
    return true;
  } catch {
    return false;
  }
}

if (plainLoad()) {
  console.log("@swc/core loads fine, nothing to do.");
  process.exit(0);
}

const candidates = [
  "/swc-cache",
  path.join(os.tmpdir(), "swc-cache"),
  path.join(os.homedir(), ".cache", "swc"),
];

function findMaterialized(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...findMaterialized(p));
    else if (p.endsWith(".node")) out.push(p);
  }
  return out;
}

for (const cacheRoot of candidates) {
  try {
    fs.mkdirSync(cacheRoot, { recursive: true });
  } catch {
    continue;
  }
  try {
    execFileSync(
      process.execPath,
      ["-e", `require(${JSON.stringify(coreDir)})`],
      {
        cwd: root,
        env: { ...process.env, SWC_NATIVE_BINDING_CACHE: cacheRoot },
        stdio: "pipe",
      },
    );
  } catch {
    continue;
  }
  const files = findMaterialized(cacheRoot);
  if (files.length === 0) continue;
  fs.copyFileSync(files[0], target);
  if (plainLoad()) {
    console.log(
      `Fixed: materialized via ${cacheRoot}, copied binding to ${path.relative(root, target)}`,
    );
    process.exit(0);
  }
}

console.error(
  "Could not recover the @swc/core native binding.\n" +
    "Try manually: SWC_NATIVE_BINDING_CACHE=/swc-cache npm run dev",
);
process.exit(1);
