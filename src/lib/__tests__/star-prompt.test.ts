import { describe, it, expect } from "vitest";
import type { RecentCopied } from "../stores/recents-store";
import {
  STAR_PROMPT_COPY_THRESHOLD,
  shouldShowStarPrompt,
  totalCopies,
} from "../star-prompt";

function copy(slug: string, count: number): RecentCopied {
  return { slug, format: "svg", ts: 0, count };
}

describe("star prompt", () => {
  it("sums repeat copies across icons", () => {
    expect(totalCopies([copy("a", 2), copy("b", 1)])).toBe(3);
  });

  it("stays hidden below the threshold", () => {
    expect(shouldShowStarPrompt([copy("a", STAR_PROMPT_COPY_THRESHOLD - 1)], false)).toBe(false);
  });

  it("shows once the threshold is reached", () => {
    expect(shouldShowStarPrompt([copy("a", 1), copy("b", 2)], false)).toBe(true);
  });

  it("never shows again after it was handled", () => {
    expect(shouldShowStarPrompt([copy("a", 10)], true)).toBe(false);
  });
});
