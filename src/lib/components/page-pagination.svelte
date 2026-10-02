<script lang="ts">
import { goto } from "$app/navigation";
import * as Pagination from "#lib/components/ui/pagination/index.js";

let {
  count,
  perPage,
  page,
  label,
  pageUrl,
  replaceState = false,
}: {
  count: number;
  perPage: number;
  page: number;
  label: string;
  pageUrl: (page: number) => string;
  replaceState?: boolean;
} = $props();
</script>

<Pagination.Root
  {count}
  {perPage}
  {page}
  aria-label={label}
  class="mt-6"
  onPageChange={(nextPage) => goto(pageUrl(nextPage), { replace: replaceState })}
>
  {#snippet children({ pages, currentPage })}
    <Pagination.Content>
      <Pagination.Item><Pagination.Previous /></Pagination.Item>
      {#each pages as item (item.key)}
        <Pagination.Item>
          {#if item.type === "ellipsis"}
            <Pagination.Ellipsis />
          {:else}
            <Pagination.Link page={item} isActive={currentPage === item.value} />
          {/if}
        </Pagination.Item>
      {/each}
      <Pagination.Item><Pagination.Next /></Pagination.Item>
    </Pagination.Content>
  {/snippet}
</Pagination.Root>
