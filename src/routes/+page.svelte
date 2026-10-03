<script lang="ts">
import { ArrowRight, BookOpen, ArrowUpRight } from "@lucide/svelte";
import ReviewCard from "#lib/components/review-card.svelte";
import SiteSidebar from "#lib/components/site-sidebar.svelte";
import type { PageData } from "./$types";
let { data }: { data: PageData } = $props();
</script>

<svelte:head
  ><title>首页 · SHOU LXK</title><meta
    name="description"
    content="上海海洋大学课程评价。看看最新点评，认识授课老师，为下一堂课多一份参考。"
  /></svelte:head
>
<main id="main-content" class="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
  <div class="home-intro">
    <p class="eyebrow">SHOU COURSE REVIEWS / 海大学习生活</p>
    <h1>下一堂课，<span>多一份参考。</span></h1>
    <p>从同学的真实体验出发，找到适合自己的课堂。</p>
  </div>
  <div class="home-grid">
    <div class="main-column">
      <section id="latest-reviews" aria-labelledby="latest-heading">
        <header class="section-heading">
          <div>
            <p class="eyebrow">01 / RECENT VOICES</p>
            <h2 id="latest-heading" class="text-2xl font-semibold">最新点评</h2>
          </div>
          <a class="text-sm text-muted-foreground hover:text-primary" href="/reviews"
            >全站点评 <span aria-hidden="true">↗</span></a
          >
        </header>
        <div class="review-stack">
          {#each data.latestReviews as review (review.review_type + review.id)}<ReviewCard {review} />{:else}<div
              class="directory-empty"
            >
              <p>第一份课堂体验，等你来分享。</p>
            </div>{/each}
        </div>
        <a class="view-all" href="/reviews">查看所有点评 <ArrowRight class="size-4" aria-hidden="true" /></a>
      </section>
      <section class="home-section" aria-labelledby="teachers-heading">
        <header class="section-heading">
          <div>
            <p class="eyebrow">02 / NEW IN THE DIRECTORY</p>
            <h2 id="teachers-heading" class="text-2xl font-semibold">最新老师</h2>
          </div>
          <span class="text-xs text-muted-foreground">按收录顺序展示</span>
        </header>
        <div class="new-teachers">
          {#each data.newTeachers as teacher (teacher.id)}<a href={`/teachers/${teacher.id}`} class="new-teacher"
              ><span class="teacher-monogram" aria-hidden="true">{teacher.name.slice(0, 1)}</span>
              <h3>{teacher.name}</h3>
              <span>查看授课与点评 ↗</span></a
            >{:else}<p class="p-6 text-sm text-muted-foreground">暂无收录老师。</p>{/each}
        </div>
        <a class="view-all" href="/teachers">查看所有老师 <ArrowRight class="size-4" aria-hidden="true" /></a>
      </section>
      <section class="home-section" aria-labelledby="courses-heading">
        <header class="section-heading">
          <div>
            <p class="eyebrow">03 / EXPLORE A CLASS</p>
            <h2 id="courses-heading" class="text-2xl font-semibold">最新课程</h2>
          </div>
          <span class="text-xs text-muted-foreground">按收录顺序展示</span>
        </header>
        <div class="new-courses">
          {#each data.newCourses as course (course.course_id)}<a
              href={`/courses/${encodeURIComponent(course.course_id)}`}
              class="new-course"
              ><span class="course-mark" aria-hidden="true"><BookOpen class="size-5" /></span>
              <div class="min-w-0 flex-1">
                <h3>{course.name}</h3>
                <p>课程号 {course.course_id}</p>
              </div>
              <ArrowUpRight class="size-4 text-primary" aria-hidden="true" /></a
            >{:else}<p class="p-6 text-sm text-muted-foreground">暂无收录课程。</p>{/each}
        </div>
        <a class="view-all" href="/courses">查看所有课程 <ArrowRight class="size-4" aria-hidden="true" /></a>
      </section>
    </div>
    <SiteSidebar stats={data.stats} />
  </div>
  <nav class="home-bottom-nav" aria-label="探索更多">
    <span>继续探索校园课堂</span><a href="/reviews">所有点评 ↗</a><a href="/courses">所有课程 ↗</a><a href="/teachers"
      >所有老师 ↗</a
    >
  </nav>
</main>
