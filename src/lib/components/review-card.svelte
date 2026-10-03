<script lang="ts">
import { ArrowUpRight, MessageSquareText, UserRound } from "@lucide/svelte";
import type { LatestReview } from "#lib/server/home-queries.js";
let { review }: { review: LatestReview } = $props();
const subject = $derived(review.review_type === "course" ? review.course_name : review.teacher_name);
const href = $derived(
  review.review_type === "course"
    ? `/courses/${encodeURIComponent(review.course_id ?? "")}?${new URLSearchParams({ lid: review.lid ?? "" })}`
    : `/teachers/${review.teacher_id}`,
);
</script>

<article class="review-card">
  <div class="review-meta">
    <span class="review-avatar" aria-hidden="true">
      {#if review.review_type === "course"}<MessageSquareText class="size-4" />{:else}<UserRound class="size-4" />{/if}
    </span>
    <div class="min-w-0 flex-1">
      <p class="text-sm leading-6">
        <span class="review-kind">{review.review_type === "course" ? "课程点评" : "教师点评"}</span><span
          class="mx-2 text-muted-foreground">/</span
        ><a {href} class="font-medium">{subject}</a>
      </p>
      <p class="mt-1 text-xs text-muted-foreground">
        <time datetime={review.posted_at_local.replace(" ", "T") + "+08:00"}>{review.posted_at_local}</time>
      </p>
    </div>
  </div>
  <div class="review-content">
    {#if review.title}<h3 class="review-title text-base">{review.title}</h3>{/if}
    <p class="line-clamp-4">{review.content}</p>
    <a class="mt-4 inline-flex items-center gap-1 text-xs font-medium" {href}
      >阅读完整点评 <ArrowUpRight class="size-3.5" aria-hidden="true" /></a
    >
  </div>
</article>
