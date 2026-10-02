import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import iconsData from "@/data/icons.json";
import type { IconEntry } from "@/lib/icons";

const PUBLIC_DIR = fileURLToPath(new URL("../../../public", import.meta.url));

/** Every distinct SVG file the catalog points at, e.g. "/icons/github/default.svg". */
const variantPaths = [
  ...new Set(
    (iconsData as IconEntry[]).flatMap((icon) =>
      Object.values(icon.variants).filter((p): p is string => typeof p === "string"),
    ),
  ),
];

describe("icon SVG files", () => {
  it("declare a viewBox on the root <svg>", () => {
    // Without a viewBox the React/Vue/Svelte builds fall back to "0 0 24 24",
    // so an icon drawn on any other canvas renders cropped in the components
    // even though it looks fine as an <img> on the site.
    const missing: string[] = [];
    for (const variantPath of variantPaths) {
      const file = `${PUBLIC_DIR}${variantPath}`;
      // A missing file is a different failure; this test is only about viewBox.
      if (!existsSync(file)) continue;
      const root = readFileSync(file, "utf8").match(/<svg\b[^>]*>/)?.[0] ?? "";
      if (!/\sviewBox\s*=/.test(root)) missing.push(variantPath);
    }
    expect(missing).toEqual([]);
  });
});
