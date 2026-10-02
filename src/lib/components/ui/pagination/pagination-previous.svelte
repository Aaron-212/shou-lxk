<script lang="ts">
import { Pagination as PaginationPrimitive } from "bits-ui";
import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";
import { buttonVariants } from "#lib/components/ui/button/index.js";
import { cn } from "#lib/utils.js";

let { ref = $bindable(null), class: className, ...restProps }: PaginationPrimitive.PrevButtonProps = $props();
</script>

<PaginationPrimitive.PrevButton
  bind:ref
  aria-label="上一页"
  class={cn(buttonVariants({ variant: "ghost", size: "default" }), "pl-2!", className)}
  {...restProps}
>
  <ChevronLeftIcon data-icon="inline-start" class="cn-rtl-flip" />
  <span class="hidden sm:block">上一页</span>
</PaginationPrimitive.PrevButton>
