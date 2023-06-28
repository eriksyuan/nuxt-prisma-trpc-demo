<script setup lang="ts">
import { inferProcedureInput, inferProcedureOutput } from "@trpc/server";
import { AppRouter } from "server/api/trpc/[trpc]";
import { infer } from "zod";

const { $client, _asyncData } = useNuxtApp();

const limit = 5;
const cursor = ref();
const noMore = ref(false);

type ListData = inferProcedureOutput<AppRouter["post"]["list"]>;

type ArrayItem<T> = T extends Array<infer R> ? R : never;

type Post = ArrayItem<ListData["items"]>;

const { data, execute, pending } = useAsyncData(
  "post-list",
  async () => {
    const _data = await $client.post.list.query({
      limit,
      cursor: cursor.value,
    });

    const previousData = getPrevListData();
    if (_data.items.length < limit) {
      noMore.value = true;
    }

    const result: typeof _data = {
      nextCursor: _data.nextCursor,
      items: previousData?.items
        ? [..._data.items, ...previousData?.items]
        : _data.items,
    };
    return result;
  },
  {
    // immediate:true
    server: true,
    watch: [cursor],
  }
);

function getPrevListData() {
  const previousData: ListData | undefined =
    _asyncData?.["post-list"]?.data.value;

  return previousData;
}

function addSuccess(item: Post) {
  data.value?.items.push(item);
}

const formSubmit = async (e: Event) => {
  e.preventDefault();
  const $form = e.currentTarget as HTMLFormElement;
  const values = Object.fromEntries(new FormData($form));

  type Input = inferProcedureInput<AppRouter["post"]["add"]>;
  const input: Input = {
    title: values.title as string,
    content: values.content as string,
  };
  try {
    const item = await $client.post.add.mutate(input);
    if (item) {
      addSuccess(item as unknown as Post);
    }

    $form.reset();
  } catch (error) {
    console.log(error);
  }
};

function next() {
  if (noMore.value) return;

  if (data.value?.nextCursor) {
    cursor.value = data.value?.nextCursor;
  } else {
    noMore.value = true;
  }
}

// clear prevData
onBeforeUnmount(()=>{
  data.value = null
})
</script>

<template>
  <div class="flex flex-col py-8">
    <h1 class="text-4xl font-bold">Nuxt with Prism And Trpc demo</h1>

    <div class="flex">
      <div class="flex-grow">
        <button @click="next" :disabled="pending">load more</button>
        <div>
          <div v-if="noMore">--- no more data ---</div>

          <div :key="post.id" v-for="post in data?.items">
            <NuxtLink :to="`/post/${post.id}`">
              <span>{{ post.title }}</span>
            </NuxtLink>
          </div>
        </div>
      </div>

      <form @submit="formSubmit" class="flex flex-col flex-grow">
        <input name="title" placeholder="title" />
        <textarea
          name="content"
          placeholder="content"
          rows="6"
          class="mt-2"
        ></textarea>
        <button type="submit" class="mt-2 w-16 cursor-pointer">add</button>
      </form>
    </div>
  </div>
</template>
