import { error } from "@sveltejs/kit";
import { getBindings } from "#lib/server/platform.js";
import { pagination, reviewQueries, searchText } from "#lib/server/directory-queries.js";
import type { LatestReview } from "#lib/server/home-queries.js";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ platform, url }) => {
  const db = getBindings(platform).DB;
  if (!db) error(503, "加载失败，请稍后重试。");
  const q = searchText(url);
  const query = reviewQueries(q);
  const count = await db
    .prepare(query.count)
    .bind(...query.countValues)
    .first<{ total: number }>();
  if (!count) error(503, "加载失败，请稍后重试。");
  const paging = pagination(url, count.total);
  const pageQuery = reviewQueries(q, paging.offset);
  const reviews = await db
    .prepare(pageQuery.list)
    .bind(...pageQuery.values)
    .all<LatestReview>();
  return { q, total: count.total, ...paging, reviews: reviews.results };
};
