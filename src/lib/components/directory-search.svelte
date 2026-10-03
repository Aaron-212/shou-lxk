<script lang="ts">
import { Search, X } from "@lucide/svelte";
let { action, q, label, placeholder }: { action: string; q: string; label: string; placeholder: string } = $props();
</script>

<form method="GET" {action} role="search" aria-label={label} class="directory-search">
  <label class="sr-only" for="directory-query">{label}</label>
  <Search class="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
  <input
    id="directory-query"
    type="search"
    name="q"
    value={q}
    {placeholder}
    maxlength="100"
    class="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none"
  />
  {#if q}<a href={action} aria-label="清除搜索" class="rounded p-2 text-muted-foreground hover:text-foreground"
      ><X class="size-4" /></a
    >{/if}
  <button type="submit" class="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground">搜索</button
  >
</form>
