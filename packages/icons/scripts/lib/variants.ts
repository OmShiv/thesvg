/**
 * Resolve the SVG content of an icon's variants.
 *
 * Kept free of filesystem access (the caller passes a reader) so the
 * resolution rules can be unit-tested against a fake file tree.
 */

import type { RawIcon } from "./codegen.ts";

/**
 * Returns the trimmed SVG at a public path such as "/icons/github/default.svg",
 * or "" when there is no file there.
 */
export type SvgReader = (publicPath: string) => string;

/** Variants tried first when picking the SVG exported as `svg`. */
const PRIMARY_ORDER = ["default", "color", "mono", "light", "dark", "wordmark"];

export interface ResolvedSvgs {
  /** Every variant that has SVG content, keyed like icons.json. */
  variants: Record<string, string>;
  /** The SVG exported as `svg`, or "" when the icon has no SVG at all. */
  primary: string;
}

/** Read every variant of `icon` and pick its primary SVG. */
export function resolveSvgs(icon: Pick<RawIcon, "slug" | "variants">, read: SvgReader): ResolvedSvgs {
  const variants: Record<string, string> = {};
  for (const key of Object.keys(icon.variants)) {
    const content = read(`/icons/${icon.slug}/${key}.svg`);
    if (content) variants[key] = content;
  }

  const keys = [...PRIMARY_ORDER.filter((key) => key in icon.variants), ...Object.keys(icon.variants)];
  let primary = "";
  for (const key of keys) {
    primary = read(`/icons/${icon.slug}/${key}.svg`);
    if (primary) break;
  }

  return { variants, primary };
}
