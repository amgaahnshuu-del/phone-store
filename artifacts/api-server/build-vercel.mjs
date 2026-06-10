import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";
import esbuildPluginPino from "esbuild-plugin-pino";
import { copyFile, mkdir } from "node:fs/promises";

globalThis.require = createRequire(import.meta.url);

const artifactDir = path.dirname(fileURLToPath(import.meta.url));
const apiDir = path.resolve(artifactDir, "..", "..", "api");

async function buildVercel() {
  await mkdir(apiDir, { recursive: true });

  await esbuild({
    entryPoints: { index: path.resolve(artifactDir, "src/handler.ts") },
    platform: "node",
    bundle: true,
    format: "esm",
    outdir: apiDir,
    outExtension: { ".js": ".mjs" },
    logLevel: "info",
    external: [
      "*.node",
      "sharp",
      "better-sqlite3",
      "sqlite3",
      "canvas",
      "bcrypt",
      "argon2",
      "fsevents",
      "re2",
      "farmhash",
      "bufferutil",
      "utf-8-validate",
      "pg-native",
      "mysql2",
      "oracledb",
      "@prisma/client",
    ],
    sourcemap: false,
    plugins: [esbuildPluginPino({ transports: ["pino-pretty"] })],
    banner: {
      js: `import { createRequire as __bannerCrReq } from 'node:module';
import __bannerPath from 'node:path';
import __bannerUrl from 'node:url';
globalThis.require = __bannerCrReq(import.meta.url);
globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);
`,
    },
  });

  // connect-pg-simple needs table.sql at __dirname
  const connectPgSimpleDir = path.dirname(
    globalThis.require.resolve("connect-pg-simple"),
  );
  await copyFile(
    path.resolve(connectPgSimpleDir, "table.sql"),
    path.resolve(apiDir, "table.sql"),
  );

  console.log("Vercel API bundle written to", apiDir);
}

buildVercel().catch((err) => {
  console.error(err);
  process.exit(1);
});
