<script lang="ts" setup>
const route = useRoute();

const { $client } = useNuxtApp();

const detail = await $client.post.byId.useQuery({
  id: route.params["id"] as string,
});

const createTime = computed(() => {
  const date = new Date(detail.data.value.createdAt);

  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
});
</script>

<template>
  <div>
    <div>
      <NuxtLink to="/"> home </NuxtLink>
    </div>

    <h3>{{ detail.data.value.title }}</h3>

    <div>created {{ createTime }}</div>

    <div class=" font-italic my-2">{{ detail.data.value.content }}</div>
   <div class=" text-3">
    RawData:
   </div> 
    <pre class="p-4 rounded bg-blueGray">
            {{ detail.data }}
        </pre
    >
  </div>
</template>
