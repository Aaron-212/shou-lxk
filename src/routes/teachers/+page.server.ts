import { error } from "@sveltejs/kit";
import { getBindings } from "#lib/server/platform.js";
import { pagination, teacherQueries, searchText } from "#lib/server/directory-queries.js";
import type { NewTeacher } from "#lib/server/home-queries.js";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ platform, url }) => {
  const db = getBindings(platform).DB;
  if (!db) error(503, "加载失败，请稍后重试。");
  const q = searchText(url);
  const query = teacherQueries(q);
  const count = await db
    .prepare(query.count)
    .bind(...query.values)
    .first<{ total: number }>();
  if (!count) error(503, "加载失败，请稍后重试。");
  const paging = pagination(url, count.total);
  const teachers = await db
    .prepare(query.list)
    .bind(...query.values, paging.pageSize, paging.offset)
    .all<NewTeacher>();
  return { q, total: count.total, ...paging, teachers: teachers.results };
};
