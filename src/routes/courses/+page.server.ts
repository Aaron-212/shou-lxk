import { getBindings } from "#lib/server/platform.js";
import { withTeachers } from "#lib/server/teachers.js";
import { loadCatalogPublicData } from "#lib/server/home-cache.js";
import { catalogQueries, PAGE_SIZE, parseHomeFilters } from "#lib/server/home-queries.js";
import type { SectionCard } from "#lib/server/home-queries.js";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ platform, url }) => {
  const db = getBindings(platform).DB;
  if (!db) error(503, "加载失败，请稍后重试。");

  const filters = parseHomeFilters(url.searchParams);
  const query = catalogQueries(filters);
  const requestedPage = Number(url.searchParams.get("page") ?? "1");
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  // The count is always fresh. Never paginate using cached sidebar statistics.
  const [publicData, countRow] = await Promise.all([
    loadCatalogPublicData(db, url),
    db
      .prepare(query.count)
      .bind(...query.values)
      .first<{ total: number }>(),
  ]);
  const total = countRow?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, pages);
  const result = await db
    .prepare(query.list)
    .bind(...query.values, PAGE_SIZE, (currentPage - 1) * PAGE_SIZE)
    .all<SectionCard>();

  return {
    sections: await withTeachers(db, result.results),
    filters,
    isSearching: query.filtered || filters.sort !== "reviews",
    page: currentPage,
    pages,
    total,
    pageSize: PAGE_SIZE,
    ...publicData,
  };
};
