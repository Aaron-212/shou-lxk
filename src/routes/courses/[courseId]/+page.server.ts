import { getBindings } from "#lib/server/platform.js";
import { withTeachers } from "#lib/server/teachers.js";
import { error, fail, redirect } from "@sveltejs/kit";
import { verifyTurnstile } from "#lib/server/turnstile.js";
import type { Actions, PageServerLoad } from "./$types";

const PAGE_SIZE = 20;

type Course = { course_id: string; name: string };
type Section = { lid: string };
type Review = {
  lid: string;
  id: number;
  title: string;
  content: string;
  posted_at_local: string;
};

export const load: PageServerLoad = async ({ params, platform, url }) => {
  const db = getBindings(platform).DB;
  if (!db) error(503, "The course database is unavailable.");

  const course = await db
    .prepare("SELECT course_id, name FROM courses WHERE course_id = ?")
    .bind(params.courseId)
    .first<Course>();
  if (!course) error(404, "Course not found.");

  const sections = await db
    .prepare("SELECT lid FROM course_section WHERE course_id = ? ORDER BY lid")
    .bind(course.course_id)
    .all<Section>();

  const sectionChoices = await withTeachers(db, sections.results);
  const lid = url.searchParams.get("lid");
  const section = lid ? sectionChoices.find((choice) => choice.lid === lid) : null;
  if (lid && !section) error(404, "Course section not found.");
  const sectionFilter = section ? "AND ci.lid = ?" : "";
  const reviewValues = section ? [course.course_id, section.lid] : [course.course_id];

  const countRow = await db
    .prepare(`
    SELECT COUNT(*) AS total
    FROM course_reviews AS r
    JOIN course_section AS ci ON ci.lid = r.lid
    WHERE ci.course_id = ? ${sectionFilter}
  `)
    .bind(...reviewValues)
    .first<{ total: number }>();
  const total = countRow?.total ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const requestedPage = Number(url.searchParams.get("page") ?? "1");
  const page = Number.isSafeInteger(requestedPage) && requestedPage > 0 ? Math.min(requestedPage, pages) : 1;

  const sort = url.searchParams.get("sort") === "oldest" ? "oldest" : "latest";
  const direction = sort === "oldest" ? "ASC" : "DESC";

  const { results: reviews } = await db
    .prepare(`
    SELECT r.id, r.lid, r.title, r.content, r.posted_at_local
    FROM course_section AS ci
    JOIN course_reviews AS r ON r.lid = ci.lid
    WHERE ci.course_id = ? ${sectionFilter}
    ORDER BY r.posted_at_local ${direction}, r.id ${direction}
    LIMIT ? OFFSET ?
  `)
    .bind(...reviewValues, PAGE_SIZE, (page - 1) * PAGE_SIZE)
    .all<Review>();

  return {
    course,
    section,
    sections: sectionChoices,
    reviews,
    sort,
    total,
    page,
    pages,
    pageSize: PAGE_SIZE,
    turnstileSiteKey: getBindings(platform).TURNSTILE_SITE_KEY ?? "",
    submitted: url.searchParams.get("submitted") === "1",
  };
};

export const actions: Actions = {
  submitReview: async ({ params, platform, request, url, fetch }) => {
    const db = getBindings(platform).DB;
    if (!db) error(503, "The course database is unavailable.");
    const form = await request.formData();
    const lid = form.get("lid");
    const submittedTitle = form.get("title");
    const submittedContent = form.get("content");
    const title = typeof submittedTitle === "string" ? submittedTitle.trim() : "";
    const content = typeof submittedContent === "string" ? submittedContent.trim() : "";
    const values = { title, content, lid: typeof lid === "string" ? lid : "" };

    const verification = await verifyTurnstile(form, getBindings(platform).TURNSTILE_SECRET_KEY, url.hostname, fetch);
    if (!verification.success) {
      return fail(verification.status, { message: verification.message, ...values });
    }

    if (!title || title.length > 120 || !content || content.length > 5000) {
      return fail(400, { message: "请填写标题（最多120字）和正文（最多5000字）。", ...values });
    }
    if (typeof lid !== "string" || !lid) {
      return fail(400, { message: "请选择课程班级。", ...values });
    }

    const section = await db
      .prepare("SELECT lid FROM course_section WHERE lid = ? AND course_id = ?")
      .bind(lid, params.courseId)
      .first<{ lid: string }>();
    if (!section) return fail(400, { message: "请选择有效的课程班级。", ...values });

    const postedAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString().slice(0, 19).replace("T", " ");
    const result = await db
      .prepare(`
        INSERT INTO course_reviews (lid, title, content, posted_at_local)
        VALUES (?, ?, ?, ?)
      `)
      .bind(lid, title, content, postedAt)
      .run();
    console.info(
      JSON.stringify({
        event: "review_added",
        reviewType: "course",
        reviewId: result.meta.last_row_id,
        courseId: params.courseId,
        lid,
      }),
    );

    const destination = new URL(url.pathname, url);
    destination.searchParams.set("lid", lid);
    destination.searchParams.set("submitted", "1");
    redirect(303, destination);
  },
};
