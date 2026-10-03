-- Apply before deploying the cached home loader. Existing application queries
-- remain compatible. Index construction and this one-time backfill consume IO.
DROP INDEX course_reviews_posted_at_idx;
CREATE INDEX course_reviews_latest_idx ON course_reviews(posted_at_local DESC, id DESC, lid);
CREATE INDEX teacher_reviews_latest_idx ON teacher_reviews(posted_at_local DESC, id DESC, teacher_id);

CREATE INDEX courses_name_idx ON courses(name COLLATE NOCASE, course_id);
DROP INDEX course_section_course_id_idx;
CREATE INDEX course_section_course_id_idx ON course_section(course_id, lid);

CREATE INDEX course_section_elective_type_idx ON course_section(elective_type, review_count DESC);
CREATE INDEX course_section_credits_idx ON course_section(credits, review_count DESC);
CREATE INDEX course_section_attribute_idx ON course_section(trim(attribute), review_count DESC);
CREATE INDEX course_section_college_credits_idx ON course_section(college, credits);

-- A single exact row replaces full-table site counts and the unfiltered catalog
-- COUNT. Updates are in the same transaction as the underlying data mutation.
CREATE TABLE site_stats (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    courses INTEGER NOT NULL CHECK (courses >= 0),
    sections INTEGER NOT NULL CHECK (sections >= 0),
    reviews INTEGER NOT NULL CHECK (reviews >= 0),
    teachers INTEGER NOT NULL CHECK (teachers >= 0)
) STRICT;

INSERT INTO site_stats (id, courses, sections, reviews, teachers)
SELECT 1,
    (SELECT COUNT(*) FROM courses),
    (SELECT COUNT(*) FROM course_section),
    (SELECT COUNT(*) FROM course_reviews) + (SELECT COUNT(*) FROM teacher_reviews),
    (SELECT COUNT(*) FROM teachers);

CREATE TRIGGER site_stats_courses_insert AFTER INSERT ON courses
BEGIN
    UPDATE site_stats SET courses = courses + 1 WHERE id = 1;
END;
CREATE TRIGGER site_stats_courses_delete AFTER DELETE ON courses
BEGIN
    UPDATE site_stats SET courses = courses - 1 WHERE id = 1;
END;
CREATE TRIGGER site_stats_sections_insert AFTER INSERT ON course_section
BEGIN
    UPDATE site_stats SET sections = sections + 1 WHERE id = 1;
END;
CREATE TRIGGER site_stats_sections_delete AFTER DELETE ON course_section
BEGIN
    UPDATE site_stats SET sections = sections - 1 WHERE id = 1;
END;
CREATE TRIGGER site_stats_teachers_insert AFTER INSERT ON teachers
BEGIN
    UPDATE site_stats SET teachers = teachers + 1 WHERE id = 1;
END;
CREATE TRIGGER site_stats_teachers_delete AFTER DELETE ON teachers
BEGIN
    UPDATE site_stats SET teachers = teachers - 1 WHERE id = 1;
END;
CREATE TRIGGER site_stats_course_reviews_insert AFTER INSERT ON course_reviews
BEGIN
    UPDATE site_stats SET reviews = reviews + 1 WHERE id = 1;
END;
CREATE TRIGGER site_stats_course_reviews_delete AFTER DELETE ON course_reviews
BEGIN
    UPDATE site_stats SET reviews = reviews - 1 WHERE id = 1;
END;
CREATE TRIGGER site_stats_teacher_reviews_insert AFTER INSERT ON teacher_reviews
BEGIN
    UPDATE site_stats SET reviews = reviews + 1 WHERE id = 1;
END;
CREATE TRIGGER site_stats_teacher_reviews_delete AFTER DELETE ON teacher_reviews
BEGIN
    UPDATE site_stats SET reviews = reviews - 1 WHERE id = 1;
END;

-- Refresh planner statistics after adding filtering/ranking indexes.
PRAGMA optimize;
