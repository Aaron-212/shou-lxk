<script lang="ts">
import "../app.css";
import { BookOpen } from "@lucide/svelte";
import type { Snippet } from "svelte";

let { children }: { children: Snippet } = $props();
</script>

<nav class="border-b border-border bg-background" aria-label="主导航">
  <div class="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
    <a href="/" class="inline-flex items-center gap-2.5 font-semibold tracking-tight text-foreground no-underline">
      <span class="flex size-8 items-center justify-center rounded-md border border-border bg-card shadow-xs"
        ><BookOpen class="size-4" aria-hidden="true" /></span
      >
      <span>SHOU LXK</span>
    </a>
  </div>
</nav>

{@render children()}
