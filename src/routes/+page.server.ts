import { error } from "@sveltejs/kit";
import { getBindings } from "#lib/server/platform.js";
import { loadLandingData } from "#lib/server/home-cache.js";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ platform, url }) => {
  const db = getBindings(platform).DB;
  if (!db) error(503, "加载失败，请稍后重试。");
  return loadLandingData(db, url);
};
