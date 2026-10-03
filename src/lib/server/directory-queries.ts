import { reviewFeedSql } from "./home-queries.js";

export const DIRECTORY_PAGE_SIZE = 12;
export const searchText = (url: URL) => (url.searchParams.get("q") ?? "").trim().slice(0, 100);

export function pagination(url: URL, total: number) {
  const pages = Math.max(1, Math.ceil(total / DIRECTORY_PAGE_SIZE));
  const requested = Number(url.searchParams.get("page") ?? "1");
  const page = Number.isSafeInteger(requested) && requested > 0 ? Math.min(requested, pages) : 1;
  return { page, pages, pageSize: DIRECTORY_PAGE_SIZE, offset: (page - 1) * DIRECTORY_PAGE_SIZE };
}

export function reviewQueries(q: string, offset = 0) {
  const predicate = q ? "WHERE instr(lower(title), lower(?)) > 0 OR instr(lower(content), lower(?)) > 0" : "";
  // Each branch needs at most offset + pageSize candidates. Join display names
  // only after limiting, then preserve the original date/type/id ordering.
  const list = reviewFeedSql(predicate, "?", "? OFFSET ?");
  const branch = q ? [q, q, offset + DIRECTORY_PAGE_SIZE] : [offset + DIRECTORY_PAGE_SIZE];
  return {
    count: q
      ? `SELECT (SELECT COUNT(*) FROM course_reviews ${predicate}) + (SELECT COUNT(*) FROM teacher_reviews ${predicate}) AS total`
      : "SELECT reviews AS total FROM site_stats WHERE id = 1",
    countValues: q ? [q, q, q, q] : [],
    list,
    values: [...branch, ...branch, DIRECTORY_PAGE_SIZE, offset],
  };
}

export function teacherQueries(q: string) {
  const where = q ? "WHERE instr(lower(name), lower(?)) > 0" : "";
  return {
    count: q
      ? `SELECT COUNT(*) AS total FROM teachers ${where}`
      : "SELECT teachers AS total FROM site_stats WHERE id = 1",
    list: `SELECT id, name FROM teachers ${where} ORDER BY name, id LIMIT ? OFFSET ?`,
    values: q ? [q] : [],
  };
}
