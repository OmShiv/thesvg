import { test } from "node:test";
import { strict as assert } from "node:assert";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { generateDtsBarrel, generateEsm, generateEsmBarrel, type RawIcon } from "./codegen.ts";

const SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M2 2h20v20H2z"/></svg>';

function fixtureIcon(slug: string): RawIcon {
  return {
    slug,
    title: slug,
    aliases: [],
    hex: "000000",
    categories: ["DevTool"],
    variants: { default: `/icons/${slug}/default.svg` },
    license: "CC0-1.0",
    url: "https://example.com",
  };
}

/** Write files into a fresh temp dir laid out like the published package. */
function writeDist(files: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), "thesvg-icons-"));
  writeFileSync(join(dir, "package.json"), JSON.stringify({ type: "module" }));
  for (const [name, content] of Object.entries(files)) writeFileSync(join(dir, name), content);
  return dir;
}

/**
 * Run `code` as an ES module in `dir` with plain `node`, the way a consumer
 * would. Spawning keeps the test runner's TypeScript loader out of the way,
 * since it would happily strip TS-only syntax that real consumers choke on.
 */
function runEsm(dir: string, code: string) {
  writeFileSync(join(dir, "check.mjs"), code);
  return spawnSync(process.execPath, ["check.mjs"], {
    cwd: dir,
    encoding: "utf8",
    env: { ...process.env, NODE_OPTIONS: "" },
  });
}

test("ESM barrel is plain JavaScript that node can import", () => {
  const icon = fixtureIcon("github");
  const dir = writeDist({
    "github.js": generateEsm(icon, { default: SVG }, SVG),
    "index.js": generateEsmBarrel(["github"]),
  });

  const result = runEsm(
    dir,
    `import { github } from "./index.js";\nconsole.log(JSON.stringify({ slug: github.slug, svg: github.svg }));`,
  );

  assert.equal(result.status, 0, `importing the ESM barrel failed:\n${result.stderr}`);
  assert.deepEqual(JSON.parse(result.stdout), { slug: "github", svg: SVG });
});

test("type barrel still re-exports the shared IconModule and IconVariants types", () => {
  assert.match(
    generateDtsBarrel(["github"]),
    /^export type \{ IconModule, IconVariants \} from "\.\/types\.js";$/m,
  );
});
