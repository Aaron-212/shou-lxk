<script lang="ts">
import "../app.css";
import { BookOpen, GraduationCap, MessageSquareText } from "@lucide/svelte";
import { page } from "$app/state";
import type { Snippet } from "svelte";
let { children }: { children: Snippet } = $props();
</script>

<a
  href="#main-content"
  class="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:rounded-md focus:bg-background focus:p-3"
  >跳转到主要内容</a
>
<header class="border-b border-border bg-card">
  <nav class="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6" aria-label="主导航">
    <a href="/" class="flex items-center gap-3 no-underline">
      <span class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground"
        ><GraduationCap class="size-5" aria-hidden="true" /></span
      >
      <span class="flex flex-col gap-0.5"
        ><span class="text-sm font-bold tracking-wide">SHOU LXK</span><span class="text-xs text-muted-foreground"
          >上海海洋大学课程评价</span
        ></span
      >
    </a>
    <a
      href="/"
      aria-current={page.url.pathname === "/" ? "page" : undefined}
      class="flex min-h-16 items-center gap-2 border-b-2 border-primary px-2 text-sm font-medium text-primary"
      ><BookOpen class="size-4" aria-hidden="true" />课程</a
    >
  </nav>
</header>
{@render children()}
<footer
  class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-xs text-muted-foreground sm:flex-row sm:px-6"
>
  <p>SHOU LXK · 上海海洋大学课程评价</p>
  <p>分享课堂体验，让选课多一份参考。</p>
</footer>
