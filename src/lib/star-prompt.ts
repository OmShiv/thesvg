import type { RecentCopied } from "@/lib/stores/recents-store";

/** Copies a visitor makes before we ask for a GitHub star. */
export const STAR_PROMPT_COPY_THRESHOLD = 3;
export const STAR_PROMPT_STORAGE_KEY = "thesvg-star-prompt-done";
export const STAR_PROMPT_REPO_URL = "https://github.com/GLINCKER/thesvg";

export function totalCopies(copied: readonly RecentCopied[]): number {
  return copied.reduce((sum, entry) => sum + entry.count, 0);
}

export function shouldShowStarPrompt(
  copied: readonly RecentCopied[],
  alreadyHandled: boolean,
): boolean {
  return !alreadyHandled && totalCopies(copied) >= STAR_PROMPT_COPY_THRESHOLD;
}
