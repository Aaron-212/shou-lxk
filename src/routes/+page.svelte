<script lang="ts">
import TeacherLinks from "#lib/components/teacher-links.svelte";
import { resolve } from "$app/paths";
import { goto } from "$app/navigation";
import { ArrowUpRight, BookOpen, LoaderCircle, Search, SlidersHorizontal } from "@lucide/svelte";
import { Button } from "#lib/components/ui/button/index.js";
import { Input } from "#lib/components/ui/input/index.js";
import { InputGroup, InputGroupAddon, InputGroupInput } from "#lib/components/ui/input-group/index.js";
import * as Select from "#lib/components/ui/select/index.js";
import { Separator } from "#lib/components/ui/separator/index.js";
import PagePagination from "#lib/components/page-pagination.svelte";
import type { PageData } from "./$types";

let { data }: { data: PageData } = $props();
let isLoading = $state(false);
// svelte-ignore state_referenced_locally
let selectValues = $state({ ...data.filters });

async function submitSearch(event: SubmitEvent) {
  event.preventDefault();
  if (isLoading) return;

  const form = event.currentTarget as HTMLFormElement;
  const params = new URLSearchParams(Array.from(new FormData(form), ([key, value]) => [key, String(value)]));
  const url = new URL(form.action);
  url.search = params.toString();
  isLoading = true;
  try {
    await goto(url);
  } finally {
    isLoading = false;
  }
}

$effect(() => {
  Object.assign(selectValues, data.filters);
});

const pageUrl = (page: number) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(data.filters)) {
    if (value && !(key === "sort" && value === "reviews")) params.set(key, value);
  }
  params.set("page", String(page));
  return `/?${params}`;
};

const sectionUrl = (courseId: string, lid: string) => {
  const params = new URLSearchParams({ lid });
  return `${resolve("/courses/[courseId]", { courseId })}?${params}`;
};

const hasAdvancedFilters = $derived(
  Boolean(
    data.filters.teacher ||
    data.filters.college ||
    data.filters.electiveType ||
    data.filters.attribute ||
    data.filters.credits ||
    data.filters.minReviews ||
    data.filters.sort !== "reviews",
  ),
);
</script>

<svelte:head>
  <title>SHOU LXK</title>
  <meta name="description" content="Find courses by name, teacher, credits, and more at Shanghai Ocean University." />
</svelte:head>

<main class="mx-auto max-w-6xl px-4 pb-20 pt-10 sm:px-6 sm:pt-14">
  <header class="mb-8 max-w-2xl sm:mb-10">
    <p class="mb-3 text-xs font-medium tracking-widest text-muted-foreground uppercase">上海海洋大学 · 课程评价</p>
    <h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">找到适合你的课程</h1>
    <p class="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
      按课程、教师和学院查找课程班级，阅读往届同学的真实评价。
    </p>
  </header>
  <section aria-labelledby="search-heading">
    <h2 id="search-heading" class="sr-only">搜索课程</h2>
    <form
      method="GET"
      role="search"
      onsubmit={submitSearch}
      class="rounded-xl border border-border bg-card p-4 shadow-xs sm:p-6"
    >
      <div class="flex gap-2 sm:gap-3">
        <InputGroup class="h-10 min-w-0 flex-1">
          <InputGroupAddon>
            <Search aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput
            name="q"
            value={data.filters.q}
            placeholder="课程名或课程号"
            aria-label="通过课程名或课程号搜索课程"
            class="h-full"
          />
        </InputGroup>
        <Button type="submit" size="lg" class="sm:min-w-26" disabled={isLoading}>
          {#if isLoading}<LoaderCircle class="size-4 animate-spin" aria-hidden="true" />{/if}
          {isLoading ? "搜索中…" : "搜索"}
        </Button>
      </div>

      <Separator class="my-5" />
      <details open={hasAdvancedFilters}>
        <summary
          class="inline-flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-foreground hover:text-muted-foreground [&::-webkit-details-marker]:hidden"
          ><SlidersHorizontal class="size-4" aria-hidden="true" />高级过滤</summary
        >
        <div class="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label class="flex min-w-0 flex-col gap-2 text-sm font-medium">
            <span>教师</span>
            <Input name="teacher" value={data.filters.teacher} placeholder="教师名" />
          </label>

          <div class="flex min-w-0 flex-col gap-2 text-sm font-medium">
            <label for="college">学院</label>
            <Select.Root type="single" name="college" bind:value={selectValues.college}>
              <Select.Trigger id="college" class="w-full min-w-0">
                <Select.Value>{selectValues.college || "所有学院"}</Select.Value>
              </Select.Trigger>
              <Select.Content>
                <Select.Group>
                  <Select.Item value="" label="所有学院">所有学院</Select.Item>
                  {#each data.options.colleges as option}
                    <Select.Item value={option} label={option}>{option}</Select.Item>
                  {/each}
                </Select.Group>
              </Select.Content>
            </Select.Root>
          </div>

          <div class="flex min-w-0 flex-col gap-2 text-sm font-medium">
            <label for="electiveType">课程类型</label>
            <Select.Root type="single" name="electiveType" bind:value={selectValues.electiveType}>
              <Select.Trigger id="electiveType" class="w-full min-w-0">
                <Select.Value>{selectValues.electiveType || "任意类型"}</Select.Value>
              </Select.Trigger>
              <Select.Content>
                <Select.Group>
                  <Select.Item value="" label="任意类型">任意类型</Select.Item>
                  {#each data.options.electiveTypes as option}
                    <Select.Item value={option} label={option}>{option}</Select.Item>
                  {/each}
                </Select.Group>
              </Select.Content>
            </Select.Root>
          </div>

          <div class="flex min-w-0 flex-col gap-2 text-sm font-medium">
            <label for="credits">学分</label>
            <Select.Root type="single" name="credits" bind:value={selectValues.credits}>
              <Select.Trigger id="credits" class="w-full min-w-0">
                <Select.Value>{selectValues.credits || "任意值"}</Select.Value>
              </Select.Trigger>
              <Select.Content>
                <Select.Group>
                  <Select.Item value="" label="任意值">任意值</Select.Item>
                  {#each data.options.credits as option}
                    <Select.Item value={String(option)} label={String(option)}>{option}</Select.Item>
                  {/each}
                </Select.Group>
              </Select.Content>
            </Select.Root>
          </div>

          <div class="flex min-w-0 flex-col gap-2 text-sm font-medium">
            <label for="attribute">课程属性</label>
            <Select.Root type="single" name="attribute" bind:value={selectValues.attribute}>
              <Select.Trigger id="attribute" class="w-full min-w-0">
                <Select.Value>{selectValues.attribute || "任意属性"}</Select.Value>
              </Select.Trigger>
              <Select.Content>
                <Select.Group>
                  <Select.Item value="" label="任意属性">任意属性</Select.Item>
                  {#each data.options.attributes as option}
                    <Select.Item value={option} label={option}>{option}</Select.Item>
                  {/each}
                </Select.Group>
              </Select.Content>
            </Select.Root>
          </div>

          <label class="flex min-w-0 flex-col gap-2 text-sm font-medium">
            <span>最少评价数</span>
            <Input
              name="minReviews"
              type="number"
              min="0"
              step="1"
              value={data.filters.minReviews}
              placeholder="任意值"
            />
          </label>

          <div class="flex min-w-0 flex-col gap-2 text-sm font-medium">
            <label for="sort">排序</label>
            <Select.Root type="single" name="sort" bind:value={selectValues.sort}>
              <Select.Trigger id="sort" class="w-full min-w-0">
                <Select.Value>
                  {selectValues.sort === "name" ? "名称" : selectValues.sort === "credits" ? "最多学分" : "最多评价"}
                </Select.Value>
              </Select.Trigger>
              <Select.Content>
                <Select.Group>
                  <Select.Item value="reviews" label="最多评价">最多评价</Select.Item>
                  <Select.Item value="name" label="名称">名称</Select.Item>
                  <Select.Item value="credits" label="最多学分">最多学分</Select.Item>
                </Select.Group>
              </Select.Content>
            </Select.Root>
          </div>
        </div>
        <div class="mt-5 flex items-center gap-2">
          <Button type="submit" variant="outline" disabled={isLoading}>
            {#if isLoading}<LoaderCircle class="size-4 animate-spin" aria-hidden="true" />{/if}
            {isLoading ? "过滤中…" : "应用过滤"}
          </Button>
          <Button href="/" variant="ghost">清空</Button>
        </div>
      </details>
    </form>
  </section>

  <section aria-labelledby="courses-heading" aria-busy={isLoading} class="mt-10 sm:mt-12">
    <span class="sr-only" role="status">{isLoading ? "正在加载课程结果" : ""}</span>
    <div class="mb-5 flex items-end justify-between gap-4">
      <div>
        <p class="mb-1 text-xs font-medium tracking-widest text-muted-foreground uppercase">
          {data.isSearching ? "课程搜索" : "探索"}
        </p>
        <h2 id="courses-heading" class="text-2xl font-semibold tracking-tight">
          {data.isSearching ? "搜索结果" : "热门课程"}
        </h2>
      </div>
      <p class="whitespace-nowrap text-sm tabular-nums text-muted-foreground">
        共{data.total.toLocaleString()}个班级
      </p>
    </div>

    {#if data.sections.length}
      <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {#each data.sections as section (section.lid)}
          <article
            class="group flex min-h-52 min-w-0 flex-col rounded-xl border border-border bg-card p-5 text-card-foreground no-underline shadow-xs transition-[border-color,box-shadow] hover:border-ring hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            <div class="flex items-start justify-between gap-3">
              <span class="text-xs font-medium tabular-nums text-muted-foreground">{section.course_id}</span>
              <ArrowUpRight
                class="size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
                aria-hidden="true"
              />
            </div>
            <div class="mt-5 mb-6">
              <h3 class="wrap-anywhere text-lg leading-snug font-semibold tracking-tight">
                <a href={sectionUrl(section.course_id, section.lid)} class="hover:underline">{section.name}</a>
              </h3>
              <p class="mt-2 wrap-anywhere text-sm text-muted-foreground">
                <TeacherLinks teachers={section.teachers} />
              </p>
            </div>
            <div class="mt-auto flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground">
              <span class="truncate">{section.college}</span>
              {#if section.elective_type && section.elective_type !== "N/A"}<span aria-hidden="true">·</span><span
                  >{section.elective_type}</span
                >{/if}
            </div>
            <Separator class="my-3" />
            <div class="flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>{section.credits}学分</span>
              <span class="tabular-nums">{section.review_count}个评价</span>
            </div>
          </article>
        {/each}
      </div>
    {:else}
      <div
        class="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border px-4 py-14 text-center"
      >
        <span class="flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground"
          ><BookOpen class="size-5" aria-hidden="true" /></span
        >
        <h3 class="text-lg font-semibold">没有找到课程</h3>
        <p class="text-sm text-muted-foreground">试试其他关键词或调整过滤条件。</p>
        <Button href="/" variant="outline" class="mt-1">清空过滤器</Button>
      </div>
    {/if}

    {#if data.pages > 1}
      <PagePagination count={data.total} perPage={data.pageSize} page={data.page} label="课程页面" {pageUrl} />
    {/if}
  </section>
</main>
