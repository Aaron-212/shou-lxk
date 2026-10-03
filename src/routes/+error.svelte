<script lang="ts">
import { page } from "$app/state";
import { ArrowLeft, RefreshCw, CloudOff } from "@lucide/svelte";
import CampusRunner from "#lib/components/campus-runner.svelte";
const missing = $derived(page.status === 404);
</script>

<svelte:head
  ><title>{missing ? "页面未找到" : "加载失败"} · SHOU LXK</title><meta name="robots" content="noindex" /></svelte:head
>
<main id="main-content" class="error-page">
  <div class="error-symbol"><CloudOff class="size-7" aria-hidden="true" /></div>
  <p class="eyebrow">SHOU LXK / TAKE A LITTLE BREAK</p>
  <h1>{missing ? "这页好像走丢了。" : "暂时没能加载。"}</h1>
  <p class="error-description">
    {missing ? "试试返回首页，重新找找想看的内容。" : "加载失败了，请稍后再试。等一等的时间，来一场课间小跑吧。"}
  </p>
  <div class="error-actions">
    <button type="button" onclick={() => location.reload()}
      ><RefreshCw class="size-4" aria-hidden="true" />重新加载</button
    ><a href="/"><ArrowLeft class="size-4" aria-hidden="true" />返回首页</a>
  </div>
  <CampusRunner />
  <p class="error-footnote">跑酷积分只属于这场小游戏，和真实 GPA 无关。</p>
</main>

<style>
.error-page {
  max-width: 848px;
  margin: 0 auto;
  padding: 52px 24px 30px;
  text-align: center;
}
.error-symbol {
  display: grid;
  place-items: center;
  width: 58px;
  height: 58px;
  border: 1px solid var(--border);
  border-radius: 18px;
  background: var(--card);
  color: var(--primary);
  margin: 0 auto 24px;
}
.error-page h1 {
  font-size: clamp(28px, 5vw, 38px);
  font-weight: 650;
  letter-spacing: -0.03em;
}
.error-description {
  margin: 16px auto 0;
  max-width: 32rem;
  color: var(--muted-foreground);
  font-size: 14px;
  line-height: 1.9;
}
.error-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin: 26px 0 38px;
}
.error-actions button,
.error-actions a {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 7px;
  font-size: 13px;
}
.error-actions button {
  background: var(--primary);
  color: var(--primary-foreground);
}
.error-actions a {
  border: 1px solid var(--border);
  color: var(--muted-foreground);
}
.error-footnote {
  margin-top: 18px;
  font-size: 11px;
  color: var(--muted-foreground);
}
</style>
