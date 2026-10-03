// Frozen production query semantics before migration 0005. Keep this independent
// of the optimized predicates so parity tests can catch semantic regressions.
export const legacyOptions = {
  colleges: "SELECT value FROM category_options WHERE category_type = 'college' AND value <> 'N/A' ORDER BY position",
  electiveTypes:
    "SELECT value FROM category_options WHERE category_type = 'lessonType' AND value <> 'N/A' ORDER BY position",
  attributes:
    "SELECT DISTINCT trim(attribute) AS value FROM course_section WHERE attribute IS NOT NULL AND trim(attribute) <> '' ORDER BY value",
  credits: "SELECT DISTINCT credits FROM course_section ORDER BY credits",
};

export const legacyLatest = `
  SELECT id, review_type, lid, course_id, course_name, teacher_id, teacher_name, title, content, posted_at_local
  FROM (
    SELECT r.id, 'course' AS review_type, r.lid, c.course_id, c.name AS course_name,
      NULL AS teacher_id, NULL AS teacher_name, r.title, r.content, r.posted_at_local
    FROM course_reviews AS r
    JOIN course_section AS cs ON cs.lid = r.lid
    JOIN courses AS c ON c.course_id = cs.course_id
    UNION ALL
    SELECT r.id, 'teacher' AS review_type, NULL AS lid, NULL AS course_id, NULL AS course_name,
      t.id AS teacher_id, t.name AS teacher_name, r.title, r.content, r.posted_at_local
    FROM teacher_reviews AS r JOIN teachers AS t ON t.id = r.teacher_id
  ) ORDER BY posted_at_local DESC, review_type ASC, id DESC LIMIT 5`;

export const legacyStats = `SELECT
  (SELECT COUNT(*) FROM courses) AS courses,
  (SELECT COUNT(*) FROM course_section) AS sections,
  (SELECT COUNT(*) FROM course_reviews) + (SELECT COUNT(*) FROM teacher_reviews) AS reviews,
  (SELECT COUNT(*) FROM teachers) AS teachers`;

export function legacyCatalog(filters) {
  const clauses = [];
  const values = [];
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
  for (const [key, sql] of [
    ["college", "cs.college = ?"],
    ["electiveType", "cs.elective_type = ?"],
    ["attribute", "trim(cs.attribute) = ?"],
  ]) {
    if (filters[key]) {
      clauses.push(sql);
      values.push(filters[key]);
    }
  }
  for (const [key, sql] of [
    ["credits", "cs.credits = ?"],
    ["minReviews", "cs.review_count >= ?"],
  ]) {
    if (filters[key]) {
      clauses.push(sql);
      values.push(Number(filters[key]));
    }
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const from = `FROM course_section AS cs JOIN courses AS c ON c.course_id = cs.course_id ${where}`;
  const sort = {
    reviews: "cs.review_count DESC, name COLLATE NOCASE ASC",
    name: "name COLLATE NOCASE ASC",
    credits: "credits DESC, name COLLATE NOCASE ASC",
  }[filters.sort];
  return {
    values,
    count: `SELECT COUNT(*) AS total ${from}`,
    list: `SELECT cs.lid, c.course_id, c.name, cs.college, cs.elective_type, cs.credits, cs.review_count ${from}
      ORDER BY ${sort}, c.course_id, cs.lid LIMIT ? OFFSET ?`,
  };
}
