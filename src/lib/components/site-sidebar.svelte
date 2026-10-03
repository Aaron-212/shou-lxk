<script lang="ts">
import { BookOpen, ChartNoAxesColumnIncreasing, MessageSquareText, Users, ExternalLink } from "@lucide/svelte";
import type { SiteStats } from "#lib/server/home-queries.js";
let { stats }: { stats: SiteStats } = $props();
</script>

<aside id="site-overview" class="overview-stack" aria-label="站点信息">
  <section class="overview-card">
    <header><h2>站点概览</h2></header>
    <dl class="overview-stats">
      {#each [{ label: "课程", count: stats.courses }, { label: "点评", count: stats.reviews }, { label: "班级", count: stats.sections }, { label: "老师", count: stats.teachers }] as item}
        <div class="overview-stat">
          <dt>{item.label}</dt>
          <dd>{item.count.toLocaleString()}</dd>
        </div>
      {/each}
    </dl>
  </section>
  <section class="overview-card">
    <header><h2>快速入口</h2></header>
    <nav class="quick-links" aria-label="快速入口">
      <a href="/courses"><BookOpen class="size-4" aria-hidden="true" />浏览课程列表</a>
      <a href="/courses?sort=reviews"
        ><ChartNoAxesColumnIncreasing class="size-4" aria-hidden="true" />查看最多点评课程</a
      >
      <a href="/reviews"><MessageSquareText class="size-4" aria-hidden="true" />阅读全站点评</a>
      <a href="/teachers"><Users class="size-4" aria-hidden="true" />查找授课老师</a>
      <a href="https://github.com/Conduit-Club/SHOU-LXK/issues" target="_blank" rel="noreferrer"
        ><ExternalLink class="size-4" aria-hidden="true" />反馈问题</a
      >
    </nav>
    <p class="border-t px-5 py-4 text-xs leading-6 text-muted-foreground">
      分享真实的课堂体验，也为不同的感受留一份尊重。点评仅作选课参考。
    </p>
  </section>
  <div class="sidebar-note">
    <span aria-hidden="true">✦</span>
    <p>选课之前，<br />先听听同学怎么说。</p>
    <small>SHOU · CAMPUS VOICES</small>
  </div>
</aside>
