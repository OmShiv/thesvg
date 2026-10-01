import { describe, it, expect } from "vitest";
import type { IconEntry } from "../icons";
import {
  buildActions,
  categoriesFromIcons,
  filterActions,
  filterCategories,
  recentSearchQueries,
  resolveRecentIcons,
} from "../command-palette";

function icon(slug: string, title: string, categories: string[]): IconEntry {
  return {
    slug,
    title,
    aliases: [],
    hex: "000000",
    categories,
    variants: { default: `/icons/${slug}/default.svg` },
    license: "MIT",
    collection: "brands",
  } as IconEntry;
}

const icons = [
  icon("a", "A", ["AI", "Software"]),
  icon("b", "B", ["Software"]),
  icon("c", "C", ["Software", "Cloud Storage"]),
];

describe("categoriesFromIcons", () => {
  it("counts and sorts by count then name", () => {
    expect(categoriesFromIcons(icons)).toEqual([
      { name: "Software", count: 3 },
      { name: "AI", count: 1 },
      { name: "Cloud Storage", count: 1 },
    ]);
  });
});

describe("filterCategories", () => {
  const cats = categoriesFromIcons(icons);

  it("returns the top categories for an empty query", () => {
    expect(filterCategories(cats, "", 2).map((c) => c.name)).toEqual(["Software", "AI"]);
  });

  it("ranks prefix matches before substring matches", () => {
    expect(filterCategories(cats, "s").map((c) => c.name)).toEqual([
      "Software",
      "Cloud Storage",
    ]);
  });

  it("matches word starts and ignores case", () => {
    expect(filterCategories(cats, "storage").map((c) => c.name)).toEqual(["Cloud Storage"]);
  });

  it("returns nothing when no category matches", () => {
    expect(filterCategories(cats, "zzz")).toEqual([]);
  });
});

describe("actions", () => {
  it("omits copy actions without a last copied icon", () => {
    expect(buildActions(undefined).every((a) => a.kind === "navigate")).toBe(true);
  });

  it("adds SVG and JSX copy actions for the last copied icon", () => {
    const actions = buildActions(icons[0]);
    expect(actions.slice(0, 2).map((a) => a.id)).toEqual(["copy-svg", "copy-jsx"]);
  });

  it("filters actions by label", () => {
    expect(filterActions(buildActions(undefined), "docs").map((a) => a.id)).toEqual(["docs"]);
  });
});

describe("recents", () => {
  it("resolves viewed slugs and skips unknown ones", () => {
    const bySlug = new Map<string, IconEntry>();
    for (let i = 0; i < icons.length; i++) {
      bySlug.set(icons[i].slug, icons[i]);
    }
    const viewed = [
      { slug: "b", ts: 2 },
      { slug: "gone", ts: 1 },
      { slug: "a", ts: 0 },
    ];
    expect(resolveRecentIcons(viewed, bySlug).map((i) => i.slug)).toEqual(["b", "a"]);
  });

  it("caps recent searches", () => {
    const searched = ["one", "two", "three", "four"].map((query, ts) => ({ query, ts }));
    expect(recentSearchQueries(searched)).toEqual(["one", "two", "three"]);
  });
});
