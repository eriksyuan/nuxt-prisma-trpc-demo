// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  build: {
    transpile: ["trpc-nuxt"],
  },
  modules:[ '@unocss/nuxt'],
  runtimeConfig: {
    NODE_ENV: process.env.NODE_ENV ?? 'production',
  },
});
