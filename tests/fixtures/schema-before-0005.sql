PRAGMA foreign_keys = ON;

CREATE TABLE courses (
    course_id TEXT PRIMARY KEY,
    name TEXT NOT NULL
) STRICT;

CREATE TABLE course_section (
    lid TEXT PRIMARY KEY,
    course_id TEXT NOT NULL REFERENCES courses(course_id),
    college TEXT NOT NULL,
    elective_type TEXT NOT NULL,
    credits INTEGER NOT NULL CHECK (credits >= 0),
    attribute TEXT,
    likes INTEGER NOT NULL DEFAULT 0 CHECK (likes >= 0),
    dislikes INTEGER NOT NULL DEFAULT 0 CHECK (dislikes >= 0),
    review_count INTEGER NOT NULL DEFAULT 0 CHECK (review_count >= 0)
) STRICT;

CREATE INDEX course_section_course_id_idx ON course_section(course_id);
CREATE INDEX course_section_college_idx ON course_section(college);
CREATE INDEX course_section_review_count_idx ON course_section(review_count DESC);

CREATE TABLE teachers (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE CHECK (length(trim(name)) > 0)
) STRICT;

CREATE TABLE course_section_teachers (
    lid TEXT NOT NULL REFERENCES course_section(lid),
    teacher_id INTEGER NOT NULL REFERENCES teachers(id),
    position INTEGER NOT NULL CHECK (position >= 1),
    PRIMARY KEY (lid, teacher_id),
    UNIQUE (lid, position)
) WITHOUT ROWID, STRICT;

CREATE INDEX course_section_teachers_teacher_idx ON course_section_teachers(teacher_id, lid);

CREATE TABLE course_reviews (
    id INTEGER PRIMARY KEY,
    lid TEXT NOT NULL REFERENCES course_section(lid),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    posted_at_local TEXT NOT NULL
) STRICT;

CREATE INDEX course_reviews_lid_idx ON course_reviews(lid);
CREATE INDEX course_reviews_posted_at_idx ON course_reviews(posted_at_local);

CREATE TRIGGER course_reviews_count_insert AFTER INSERT ON course_reviews
BEGIN
    UPDATE course_section SET review_count = review_count + 1 WHERE lid = NEW.lid;
END;

CREATE TRIGGER course_reviews_count_delete AFTER DELETE ON course_reviews
BEGIN
    UPDATE course_section SET review_count = review_count - 1 WHERE lid = OLD.lid;
END;

CREATE TRIGGER course_reviews_count_move AFTER UPDATE OF lid ON course_reviews
WHEN NEW.lid <> OLD.lid
BEGIN
    UPDATE course_section SET review_count = review_count - 1 WHERE lid = OLD.lid;
    UPDATE course_section SET review_count = review_count + 1 WHERE lid = NEW.lid;
END;

CREATE TABLE teacher_reviews (
    id INTEGER PRIMARY KEY,
    teacher_id INTEGER NOT NULL REFERENCES teachers(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    posted_at_local TEXT NOT NULL
) STRICT;

CREATE INDEX teacher_reviews_teacher_posted_idx ON teacher_reviews(teacher_id, posted_at_local, id);

CREATE TABLE category_options (
    category_type TEXT NOT NULL CHECK (category_type IN ('attr', 'college', 'lessonType', 'score')),
    position INTEGER NOT NULL CHECK (position >= 1),
    value TEXT NOT NULL,
    PRIMARY KEY (category_type, position),
    UNIQUE (category_type, value)
) WITHOUT ROWID, STRICT;
