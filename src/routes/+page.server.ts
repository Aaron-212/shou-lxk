import { withTeachers } from "#lib/server/teachers.js";
import { error } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

const PAGE_SIZE = 12;

type SectionCard = {
  lid: string;
  course_id: string;
  name: string;
  college: string;
  elective_type: string;
  credits: number;
  review_count: number;
};

type Option = { value: string };
type CreditOption = { credits: number };

const textFilter = (value: string | null) => (value ?? "").trim().slice(0, 100);

export const load: PageServerLoad = async ({ platform, url }) => {
  const db = platform?.env.DB;
  if (!db) error(503, "The course database is unavailable.");

  const filters = {
    q: textFilter(url.searchParams.get("q")),
    teacher: textFilter(url.searchParams.get("teacher")),
    college: textFilter(url.searchParams.get("college")),
    electiveType: textFilter(url.searchParams.get("electiveType")),
    attribute: textFilter(url.searchParams.get("attribute")),
    credits: textFilter(url.searchParams.get("credits")),
    minReviews: textFilter(url.searchParams.get("minReviews")),
    sort: textFilter(url.searchParams.get("sort")),
  };

  const credit = /^\d+$/.test(filters.credits) ? Number(filters.credits) : null;
  const minReviews = /^\d+$/.test(filters.minReviews) ? Number(filters.minReviews) : null;
  const sort = ["reviews", "name", "credits"].includes(filters.sort) ? filters.sort : "reviews";
  filters.sort = sort;
  filters.credits = credit !== null && Number.isSafeInteger(credit) ? String(credit) : "";
  filters.minReviews =
    minReviews !== null && Number.isSafeInteger(minReviews) && minReviews > 0 ? String(minReviews) : "";

  const isSearching = Boolean(
    filters.q ||
    filters.teacher ||
    filters.college ||
    filters.electiveType ||
    filters.attribute ||
    filters.credits ||
    filters.minReviews ||
    sort !== "reviews",
  );
  const requestedPage = Number(url.searchParams.get("page") ?? "1");
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;

  const [colleges, electiveTypes, attributes, credits] = await Promise.all([
    db
      .prepare(
        "SELECT value FROM category_options WHERE category_type = 'college' AND value <> 'N/A' ORDER BY position",
      )
      .all<Option>(),
    db
      .prepare(
        "SELECT value FROM category_options WHERE category_type = 'lessonType' AND value <> 'N/A' ORDER BY position",
      )
      .all<Option>(),
    db
      .prepare(
        "SELECT DISTINCT trim(attribute) AS value FROM course_section WHERE attribute IS NOT NULL AND trim(attribute) <> '' ORDER BY value",
      )
      .all<Option>(),
    db.prepare("SELECT DISTINCT credits FROM course_section ORDER BY credits").all<CreditOption>(),
  ]);

  const clauses: string[] = [];
  const values: (string | number)[] = [];
  if (filters.q) {
    clauses.push("(instr(lower(c.name), lower(?)) > 0 OR instr(lower(c.course_id), lower(?)) > 0)");
    values.push(filters.q, filters.q);
  }
  if (filters.teacher) {
    clauses.push(
      "EXISTS (SELECT 1 FROM course_section_teachers AS st JOIN teachers AS t ON t.id = st.teacher_id WHERE st.lid = cs.lid AND instr(lower(t.name), lower(?)) > 0)",
    );
    values.push(filters.teacher);
  }
  if (filters.college) {
    clauses.push("cs.college = ?");
    values.push(filters.college);
  }
  if (filters.electiveType) {
    clauses.push("cs.elective_type = ?");
    values.push(filters.electiveType);
  }
  if (filters.attribute) {
    clauses.push("trim(cs.attribute) = ?");
    values.push(filters.attribute);
  }
  if (filters.credits) {
    clauses.push("cs.credits = ?");
    values.push(Number(filters.credits));
  }
  if (filters.minReviews) {
    clauses.push("cs.review_count >= ?");
    values.push(Number(filters.minReviews));
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const matching = `
    FROM course_section AS cs
    JOIN courses AS c ON c.course_id = cs.course_id
    ${where}`;

  const countRow = await db
    .prepare(`SELECT COUNT(*) AS total ${matching}`)
    .bind(...values)
    .first<{ total: number }>();
  const total = countRow?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, pages);

  const orderBy = {
    reviews: "cs.review_count DESC, name COLLATE NOCASE ASC",
    name: "name COLLATE NOCASE ASC",
    credits: "credits DESC, name COLLATE NOCASE ASC",
  }[sort];

  const result = await db
    .prepare(
      `
      SELECT cs.lid, c.course_id, c.name, cs.college, cs.elective_type,
        cs.credits, cs.review_count
      ${matching}
      ORDER BY ${orderBy}, c.course_id, cs.lid
      LIMIT ? OFFSET ?
    `,
    )
    .bind(...values, PAGE_SIZE, (currentPage - 1) * PAGE_SIZE)
    .all<SectionCard>();

  return {
    sections: await withTeachers(db, result.results),
    filters,
    isSearching,
    page: currentPage,
    pages,
    total,
    pageSize: PAGE_SIZE,
    options: {
      colleges: colleges.results.map((row) => row.value),
      electiveTypes: electiveTypes.results.map((row) => row.value),
      attributes: attributes.results.map((row) => row.value),
      credits: credits.results.map((row) => row.credits),
    },
  };
};
